import { useContext, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { io } from 'socket.io-client';
import axiosClient from "@/api/axiosClient";
import { AuthContext } from "@/context/AuthContext";
import Loader from "@/reuablecomponents/Loader";
import { convertDate, convertTimestamp, removeDomainFromEmail } from "@/Utility/funtions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRightIcon, ChevronUpIcon, DotsVerticalIcon } from "@radix-ui/react-icons";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { RocketIcon } from "lucide-react";
import TooltipWithTrigger from "@/reuablecomponents/TooltipWithTrigger";

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    isSeen: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    from?: "user" | "friend";
}

const soundEffect = new Audio('/notification.mp3');

// Connect to Socket.io
// const socket = io('http://localhost:4000');
const socket = io('https://chartapp-expressjs-backend.onrender.com')


export function ExpandableCardDemo({ friends, loading, messageNotification }: any) {
    console.log("🚀 ~ ExpandableCardDemo ~ friends:", friends)

    const chatBodyRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const id = useId();

    const { phone } = useContext(AuthContext)!;

    const [active, setActive] = useState<(typeof friends)[number] | null>(null);
    console.log("🚀 ~ ExpandableCardDemo ~ active:", active)
    const [messages, setMessages] = useState<any[]>([]); // Consolidated the messages state
    const [message, setMessage] = useState('');
    const [messageSent, setMessageSent] = useState<string>('');
    const [typingMessage, setTypingMessage] = useState<string>('');
    const [newMessageToggle, setNewMessageToggle] = useState<boolean>(false);
    const [viewingChat, setViewingChat] = useState<string>('');
    const [accountView, setAccountView] = useState<boolean>(false);

    // Handle escape key for closing the modal
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActive(null);
            }
        };

        if (active) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    // Handle outside click to close the modal
    useOutsideClick(ref, () => setActive(null));
    // Socket.io connection and events
    // useEffect(() => {
    //     socket.emit('join', phone); // Use phone as the roomId

    //     // Handle receiving messages
    //     socket.on('message', (message) => {
    //         setMessages((prev) => [...prev, message]); // Should now receive messages
    //     });

    //     // Handle typing event
    //     socket.on('typing', ({ phone, message }) => {
    //         console.log(`${phone} is typing: ${message}`);
    //     });

    //     // Handle online event
    //     socket.on('online', (phone) => {
    //         console.log(`${phone} is online`);
    //     });

    //     return () => {
    //         socket.disconnect(); // Ensure proper cleanup on unmount
    //     };
    // }, [phone]);

    const roomId = Number(active?.phone) + Number(phone);

    const [isTyping, setIsTyping] = useState<boolean>(false);
    let typingTimeout: NodeJS.Timeout;

    useEffect(() => {
        if (active && active.phone && phone) {
            const roomId = Number(active?.phone) + Number(phone);

            // Ensure socket is connected
            if (!socket.connected) {
                socket.connect();
            }

            socket.emit('join', { phone: roomId });
            console.log("🚀 ~ useEffect ~ roomId inside", roomId);

            // socket.on('typing', ({ userId, message }) => {
            //     console.log(`${userId} is typing: ${message}`);
            //     setTypingMessage(message);
            // });

            socket.on('typing', ({ userId, message }) => {
                console.log(`${userId} is typing: ${message}`);
                setTypingMessage(message);

                if (!isTyping) {
                    setIsTyping(true);

                    if (message) {
                        soundEffect.play();
                    }

                }

                clearTimeout(typingTimeout);


                typingTimeout = setTimeout(() => {
                    soundEffect.pause();
                    soundEffect.currentTime = 0;
                    setIsTyping(false);
                    // setTypingMessage('');
                }, 1000);
            });

            socket.on('receiveMessage', ({ userId, message }) => {
                console.log(`Message from ${userId}: ${message}`);
                setMessageSent(`Message from ${userId}: ${message}`);
            });


            socket.emit('viewChat', { roomId: roomId, message: `Viewing your chat` });

            socket.on('viewChat', (userPhone) => {
                console.log(`${userPhone} Viewing your chat.`);
                setViewingChat('Viewing your chat.')
            });

            socket.on('offline', ({ userPhone, message }) => {
                console.log(`${userPhone} has left the chat: ${message}`);
                setViewingChat('left the chat')
            });

            return () => {
                socket.emit('leave', { phone: roomId });
                socket.emit('offline', { roomId: roomId, message: `Left the chat` });
                socket.off('typing');
                socket.off('receiveMessage');
                socket.off('viewChat');
                socket.disconnect();
                clearTimeout(typingTimeout);
            };
        }
    }, [active, phone]);

    // useEffect(() => {
    //     socket.on('offline', ({ userPhone, message }) => {
    //         console.log(`${userPhone} has left the chat: ${message}`);
    //     });

    //     return () => {
    //         socket.off('offline');
    //     };
    // }, []);


    // Handle sending a new message
    const handleSend = async () => {
        const trimmedMessage = message.trim();
        const payload = {
            receiverId: active?._id,
            message: trimmedMessage,
        };

        if (trimmedMessage) {
            socket.emit('sendMessage', { roomId: roomId, message: trimmedMessage });
            socket.emit('typing', { roomId: roomId, message: '' });

            try {

                const response = await axiosClient.post('messages/send', payload);

                if (response.status === 201) {
                    setMessage('');
                    setNewMessageToggle((prev: boolean) => !prev);
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    // Handle user typing
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        socket.emit('typing', { roomId: roomId, message: e.target.value });
    };

    // Render chat messages
    const renderMessages = () => (
        <div className="chat-messages overflow-auto p-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex flex-col mb-2 ${msg.from === 'user' ? 'items-end' : 'items-start'}`} style={{ maxWidth: '100%' }}>
                        <div
                            className={`p-2 rounded-md  ${msg.from === 'user' ? 'bg-black text-white' : 'bg-white text-gray-800'}`}
                            style={{ maxWidth: '100%', fontSize: "17px", wordBreak: 'break-word' }}
                        >
                            <p className="titillium-web-semibold">{msg.message}</p>
                        </div>
                        <p className="text-black dark:text-white py-2" style={{ fontSize: "10px" }}>{convertTimestamp(msg.updatedAt)}</p>
                    </div>
                </div>
            ))}
        </div>
    );

    useEffect(() => {
        if (active?._id) {

            const fetchFriends = async () => {
                try {
                    const result = await axiosClient.get(`messages/${active?._id}`);
                    const updatedMessages = addFromField(result.data, active?._id);
                    setMessages(updatedMessages)
                } catch (err: any) {
                    console.error('Error fetching friends:');
                }
            };

            fetchFriends();
        }
    }, [active?._id, messageSent, newMessageToggle]);

    const addFromField = (data: Message[], userId: string): Message[] => {
        return data.map((message) => ({
            ...message,
            from: message.sender === userId ? "friend" : "user",
        }));
    };

    // Function to scroll to the bottom (latest message)
    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };

    // Scroll to the latest message when 'active' changes or new messages arrive
    useEffect(() => {
        if (active && typeof active === 'object') {
            scrollToBottom();
        }
    }, [active, messages]);


    // const formatStringToWords = (input: string, specialWord?: string, specialClass?: string) => {
    //     return input.split(' ').map(word => ({
    //         text: word,
    //         className: word === specialWord ? specialClass : '',
    //     }));
    // };

    // const [trigger, setTrigger] = useState(false);

    // // Function to play the sound
    // const playSound = () => {
    //     const soundEffect = new Audio('/notification.mp3');
    //     soundEffect.play().catch((error) => {
    //         console.error('Error playing sound:', error);
    //     });
    // };

    // const handleClick = () => {
    //     setTrigger(!trigger);
    //     playSound(); // Play sound on button click
    // };

    // const [trigger, setTrigger] = useState(false);

    // useEffect(() => {
    //     if (trigger) {
    //         soundEffect.play();
    //     } else {
    //         soundEffect.pause();
    //         soundEffect.currentTime = 0;
    //     }
    // }, [trigger]);

    return (
        <>
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 h-full w-full z-10"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.email}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>

                        <motion.div
                            layoutId={`card-${active.email}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px] h-full md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
                        >
                            <div className="flex flex-col h-full">
                                {/* Chat Header */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-neutral-700">
                                    <div className="flex items-center w-full">
                                        <img
                                            width={50}
                                            height={50}
                                            src={'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}
                                            className="rounded-full"
                                            alt={`${active.email}'s avatar`}
                                        />
                                        <div className="ml-4 w-full flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-neutral-700 dark:text-neutral-200 flex gap-2 items-center">
                                                    {removeDomainFromEmail(active.email)}
                                                    {viewingChat === "Viewing your chat." && (
                                                        <TooltipWithTrigger
                                                            trigger={
                                                                <picture>
                                                                    <source
                                                                        srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f441_fe0f/512.webp"
                                                                        type="image/webp"
                                                                    />
                                                                    <img
                                                                        src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f441_fe0f/512.gif"
                                                                        alt="👁"
                                                                        width="22"
                                                                        height="22"
                                                                    />
                                                                </picture>
                                                            }
                                                            content={`${active.email} is viewing this chat!!`}
                                                        />

                                                        // <img src={EyeIcon} style={{ width: "15px", height: "15px" }} />
                                                    )}
                                                </h3>
                                                <p className="text-black dark:text-white text-sm flex items-center">
                                                    <TooltipWithTrigger
                                                        trigger={
                                                            <picture>
                                                                <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/512.webp" type="image/webp" />
                                                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/512.gif" alt="🧐" width="30" height="30" />
                                                            </picture>
                                                        }
                                                        content={'Last seen'}
                                                    />
                                                    - {convertTimestamp(active.lastSeen)}
                                                </p>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-2 ${accountView ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                                                        }`}
                                                >
                                                    <p className="flex items-center text-sm text-black dark:text-white">
                                                        <TooltipWithTrigger
                                                            trigger={
                                                                <picture>
                                                                    <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/512.webp" type="image/webp" />
                                                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/512.gif" alt="🎂" width="30" height="30" />
                                                                </picture>
                                                            }
                                                            content={'Date of birth'}
                                                        />
                                                        - {convertDate(active.dateOfBirth)}</p>
                                                    <p className="flex items-center text-sm text-black dark:text-white">
                                                        <TooltipWithTrigger
                                                            trigger={
                                                                <picture>
                                                                    <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f942/512.webp" type="image/webp" />
                                                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f942/512.gif" alt="🥂" width="30" height="30" />
                                                                </picture>
                                                            }
                                                            content={'No of Friends'}
                                                        />
                                                        - {active.friends.length}</p>
                                                    {/* <p className="flex items-center text-sm">
                                                        <TooltipWithTrigger
                                                            trigger={
                                                                <picture>
                                                                    <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/270f_fe0f/512.webp" type="image/webp" />
                                                                    <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/270f_fe0f/512.gif" alt="✏" width="30" height="30" />
                                                                </picture>
                                                            }
                                                            content={'Created account on'}
                                                        />
                                                        - {convertTimestamp(active.createdAt)}</p> */}
                                                </div>
                                            </div>

                                            <TooltipWithTrigger
                                                trigger={
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setAccountView((prev) => !prev)}
                                                    >
                                                        {accountView ? (
                                                            <ChevronUpIcon className="h-4 w-4 dark:text-white text-black" />
                                                        ) : (
                                                            <DotsVerticalIcon className="h-4 w-4 dark:text-white text-black" />
                                                        )}
                                                    </Button>
                                                }
                                                content={accountView ? (
                                                    'Close'
                                                ) : (
                                                    'Profile'
                                                )}
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* Chat Body */}
                                <div className="flex-1 overflow-y-auto" ref={chatBodyRef}>{renderMessages()}</div>


                                <TextGenerateEffect words={typingMessage} />

                                {/* {typingMessage}  */}
                                {/* <TypewriterEffectSmooth words={formatStringToWords(typingMessage)} /> */}


                                {/* Chat Input */}
                                <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex gap-2 items-center">

                                    <Input type="text" value={message}
                                        onChange={handleTyping}
                                        placeholder="Type a message..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSend();
                                            }
                                        }} />

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleSend}
                                                >
                                                    <ChevronRightIcon className="h-4 w-4 dark:text-white text-black" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Send</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                {/* Friend List */}
                <ul className="max-w-2xl mx-auto w-full gap-4">
                    {loading &&
                        <div className="flex justify-center">
                            <Loader />
                        </div>
                    }
                    {friends.length === 0 && !loading ?

                        <Alert>
                            <RocketIcon className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                <TextGenerateEffect words={'Add a friend to start chatting'} />
                            </AlertDescription>
                        </Alert>

                        : ''}
                    {friends.map((friend: any) => (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        layoutId={`card-${friend.name}-${friend._id}`}
                                        key={`card-${friend.name}-${friend._id}`}
                                        onClick={() => setActive(friend)}
                                        className="p-4 flex flex-row justify-between items-center bg-white dark:bg-black hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer m-4"
                                        style={{ boxShadow: "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px" }}
                                    >
                                        <div className="flex gap-4 flex-row w-full">
                                            <motion.div layoutId={`img-${friend.name}-${friend._id}`}>
                                                <img
                                                    width={100}
                                                    height={100}
                                                    src={'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}
                                                    className=" h-14 w-14 rounded-lg object-cover object-top"
                                                    alt={friend.name}
                                                />
                                            </motion.div>
                                            <div style={{ width: '90%' }}>
                                                <motion.h3 layoutId={`title-${friend.name}-${friend._id}`} className="font-medium text-neutral-800 dark:text-neutral-200">
                                                    <div className="flex justify-between w-full">
                                                        {removeDomainFromEmail(friend.email)}
                                                        {messageNotification.find((msg: any) => msg.sender._id === friend._id) && (
                                                            <picture>
                                                                <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.webp" type="image/webp" />
                                                                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif" alt="✨" width="32" height="32" />
                                                            </picture>
                                                        )}
                                                    </div>
                                                </motion.h3>
                                                <motion.p layoutId={`description`} className="text-neutral-600 dark:text-neutral-400">
                                                    {friend.phone}
                                                </motion.p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Click to view {friend.name} chat!</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </ul>
            </div>



        </>
    );
}
export const CloseIcon = () => (
    <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.05 } }}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-black"
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
    </motion.svg>
);