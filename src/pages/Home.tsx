import axiosClient from '@/api/axiosClient';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Meteors } from '@/components/ui/meteors';
import { formatDate, phoneNumberRegex } from '@/Utility/funtions';
import { ExpandableCardDemo } from './ExpandableCardDemo';
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalTrigger,
} from "../components/ui/animated-modal";
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TooltipWithTrigger from '@/reuablecomponents/TooltipWithTrigger';

// const socket = io('http://localhost:4000');
// const socket = io('https://chartapp-expressjs-backend.onrender.com')


// interface Sender {
//     _id: string;          // Unique identifier for the sender
//     firstName: string;    // Sender's first name
//     lastName: string;     // Sender's last name
// }

// interface Message {
//     sender: Sender;       // The sender of the message
//     count: number;        // The count of messages from this sender
// }

const Home = () => {

    const phone = localStorage.getItem('phone');

    const navigate = useNavigate();

    const handlelogout = () => {
        localStorage.removeItem('phone');
        localStorage.removeItem('password');
        navigate('/login');
    };

    const placeholders = [
        "What's your friend's number?",
        "Make sure they have an account in PreviewMessenger.",
        "Mobile number must be 10 digits!",
    ];

    const words = [
        {
            text: "Add",
        },
        {
            text: "a",
        },
        {
            text: "friend",
        },
        {
            text: "to",
        },
        {
            text: "your",
        },
        {
            text: "account",
        },
        {
            text: "to",
        },
        {
            text: "chat",
        },
        {
            text: "with",
        },
        {
            text: "them.",
        },
        // {
        //     text: "PreviewMessenger.",
        //     className: "text-blue-500 dark:text-blue-500",
        // },
    ];


    const [selectedFriend, setSelectedFriend] = useState(null);
    // const [chatMessages, setChatMessages] = useState<any>([]);
    const [accountView, setAccountView] = useState<boolean>(false);
    const [userData, setUserData] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingRequsts, setPendingRequsts] = useState<any>([]);

    const [friendRequestOpen, setFriendRequestOpen] = useState<boolean>(false);
    const [friendRequestMessage, setFriendRequestMessage] = useState<string>('');
    const [friendReload, setFriendReload] = useState<boolean>(false);
    const [messageNotification, setMessageNotification] = useState<any>([])

    useEffect(() => {
        const handlePostData = async () => {
            try {
                const result = await axiosClient.post('/user/usersearch', { phone });
                setUserData(result.data);
            } catch (err: any) {
                console.error(err.message);
                setError('Error fetching user data.');
            }
        };

        if (phone) {
            handlePostData();
        }
    }, [phone]);

    useEffect(() => {
        if (userData?.user?._id) {

            const fetchFriends = async () => {
                try {
                    // setLoading(true);
                    const result = await axiosClient.get(`user/${userData.user._id}/friends`);
                    setFriends(result.data);
                } catch (err: any) {
                    console.error('Error fetching friends:', error);
                    setError('Error fetching friends.');
                } finally {
                    setLoading(false);
                }
            };

            fetchFriends();
        }
    }, [userData, successMessage, friendReload]);

    useEffect(() => {
        if (userData?.user?._id) {
            const updateLastSeen = async () => {
                try {
                    const lastSeen = new Date().toISOString();

                    await axiosClient.put(`user/${userData?.user?._id}/lastSeen`, { lastSeen });
                    console.log("Last seen updated successfully");
                } catch (error) {
                    console.error("Failed to update last seen", error);
                }
            };

            setTimeout(() => {
                updateLastSeen();
            }, 2000);
        }

    }, [userData?.user?._id]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhoneNumber(value);

        // Validate the phone number format
        if (!phoneNumberRegex.test(value)) {
            setErrorMessage('Phone number must be exactly 10 digits.');
        } else {
            setErrorMessage('');
        }
    };

    // Handle form submission
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent form from refreshing the page

        // Ensure input is not empty
        if (!phoneNumber) {
            setErrorMessage('Phone number is required.');
            return;
        }

        // Ensure phone number is valid
        if (!phoneNumberRegex.test(phoneNumber)) {
            setErrorMessage('Please enter a valid 10-digit phone number.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axiosClient.post(`user/${userData?.user?._id}/sendFriendRequest`, {
                phoneNumber
            });

            if (response.status === 200) {
                console.log('Friend added successfully:', response.data);
                setErrorMessage('');
                setPhoneNumber('');
                setSuccessMessage(response.data.message);
            } else {
                setErrorMessage(response.data.message || 'Failed to add friend. Please try again.');
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                console.error('Error adding friend:', error.response.data);
                setErrorMessage(error.response.data.message || 'An unexpected error occurred. Please try again.');
            } else {
                console.error('Error adding friend:', error);
                setErrorMessage('Failed to add friend. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    useEffect(() => {
        const handlesendFriendRequest = async () => {
            try {
                const result = await axiosClient.get(`/user/${userData?.user?._id}/pendingFriendRequests`);
                console.log("🚀 ~ handlesendFriendRequest ~ result.data:", result.data.pendingRequests)
                setPendingRequsts(result.data);
                if (result.data.pendingRequests.length > 0) {
                    setFriendRequestOpen(true);
                }
                console.log("🚀 ~ handlesendFriendRequest ~ result:", result.data.pendingRequests)
            } catch (err: any) {
                console.error(err.message);
                setError('Error fetching user data.');
            }

        };

        const handleSendMessageNotification = async () => {
            try {
                const result = await axiosClient.get(`/user/${userData?.user?._id}/message-notifications`);

                setMessageNotification(result.data);

            } catch (err: any) {
                console.error(err.message);
                setError('Error fetching user data.');
            }

        };

        if (userData?.user?._id) {
            handlesendFriendRequest();
            handleSendMessageNotification();
        }
    }, [userData?.user?._id]);


    const handleFriendRequest = async (friendId: string, action: string) => {

        const payload = {
            friendId: friendId,
            action: action
        }
        console.log("🚀 ~ handleFriendRequest ~ payload:", payload)

        try {
            const result = await axiosClient.post(`/user/${userData?.user?._id}/postHandleFriendRequest`, payload);

            if (result.status === 200) {
                setFriendReload((prev) => !prev);
            }

            if (result?.data?.message) {
                console.log("🚀 ~ handleFriendRequest ~ message:", result.data.message);
                setFriendRequestOpen(false);
                setFriendRequestMessage(result.data.message);
                setTimeout(() => {
                    setFriendRequestMessage('');
                }, 4000);
            } else {
                console.log("No message received from the response");
            }

        } catch (err: any) {
            console.error(err.message);
            setError('Error handling friend request.');
        }
    };

    return (
        <>
            <div className='flex justify-between p-4 items-center dark:bg-black  bg-white'>
                <div>
                    <p className="text-xl sm:text-4xl font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8">
                        PreviewMessenger
                    </p>
                    {/* <p className='text-xl font-medium'></p> */}
                </div>

                {friendRequestMessage && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 w-full max-w-md dark:bg-black dark:text-white bg-white text-black z-50">
                        <Alert variant="destructive">
                            {/* <Terminal className="h-4 w-4" /> */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-lg" viewBox="0 0 16 16">
                                <path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.975 4.577c-.255 1.183.14 1.74 1.067 1.74.72 0 1.554-.332 1.933-.789l.116-.549c-.263.232-.65.325-.905.325-.363 0-.494-.255-.402-.704zm.091-2.755a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0" />
                            </svg>
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>{friendRequestMessage}</AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className='flex gap-2'>
                    <div className="flex items-center justify-center">
                        <Modal>
                            <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
                                <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
                                    Add friend
                                </span>
                                <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                                    <picture>
                                        <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/512.webp" type="image/webp" />
                                        <img
                                            src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/512.gif"
                                            alt="🙂"
                                            width={32}
                                            height={32}
                                        />
                                    </picture>
                                </div>
                            </ModalTrigger>

                            <ModalBody>
                                <ModalContent>
                                    <div className="h-full flex flex-col items-center">
                                        <picture>
                                            <source
                                                srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f942/512.webp"
                                                type="image/webp"
                                            />
                                            <img
                                                src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f942/512.gif"
                                                alt="🥂"
                                                width="62"
                                                height="62"
                                            />
                                        </picture>

                                        <TypewriterEffectSmooth words={words} />

                                        <div className="flex flex-col items-center justify-center mt-4 w-full">
                                            {/* PlaceholderAndVanishInput Component */}
                                            <PlaceholdersAndVanishInput
                                                placeholders={placeholders}
                                                onChange={handleChange}
                                                onSubmit={onSubmit}
                                            // disabled={isSubmitting || !!errorMessage}
                                            />

                                            {errorMessage && (
                                                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                                            )}

                                            {successMessage && (
                                                <p className="text-green-500 text-sm mt-2">{successMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                </ModalContent>

                                <ModalFooter className="gap-4">
                                    {/* <button
                                        className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28"
                                        onClick={() => setPhoneNumber('')}
                                    >
                                        Cancel
                                    </button> */}
                                    <button
                                        className={`bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28 ${isSubmitting || errorMessage ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        // onClick={onSubmit}
                                        disabled={isSubmitting || !!errorMessage}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add'}
                                    </button>
                                </ModalFooter>
                            </ModalBody>
                        </Modal>
                    </div>
                    <TooltipWithTrigger
                        trigger={
                            <button className='bg-none border-none' onClick={() => setAccountView(true)}>
                                <img
                                    width={100}
                                    height={100}
                                    src={'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}
                                    className="h-12 w-12 rounded-lg object-cover object-top"
                                />
                            </button>
                        }
                        content={`Profile`}
                    />


                </div>
            </div>

            <ExpandableCardDemo friends={friends} loading={loading} messageNotification={messageNotification} />

            <AlertDialog open={accountView} onOpenChange={setAccountView}>
                <AlertDialogContent style={{ width: "auto", padding: "0px", borderRadius: "17px" }}>
                    <div className="">
                        <div className=" w-full relative max-w-xs">
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
                            <div className="relative shadow-xl bg-gray-900 border border-gray-800  px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
                                <div className='flex justify-center w-full'>
                                    <img
                                        width={100}
                                        height={100}
                                        src={'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'}
                                        className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                                    />
                                </div>
                                <div className='mb-4 text-white font-medium flex flex-col gap-2 items-center pt-3'>
                                    <p className='text-sm md:text-xl'>{userData?.user?.firstName}</p>
                                    <p className='text-sm md:text-xl'>{userData?.user?.phone}</p>
                                    <p className='flex gap-2 items-center text-sm md:text-l'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-check" viewBox="0 0 16 16">
                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                                        <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
                                    </svg> {formatDate(userData?.user?.createdAt)}</p>
                                    <p className='text-sm md:text-l'>Id: {userData?.user?._id}</p>
                                    {/* <p>Last Seen: {formatDate(userData?.user?.lastSeen)}</p> */}
                                </div>


                                <div className='w-full flex flex-wrap justify-center gap-2'>
                                    <TooltipWithTrigger
                                        trigger={
                                            <Button variant="outline" onClick={() => setAccountView(false)} className='text-black dark:text-white'>
                                                Close
                                            </Button>
                                        }
                                        content={`Click to close profile`}
                                    />
                                    <TooltipWithTrigger
                                        trigger={
                                            <Button variant="destructive" onClick={handlelogout}>Log out</Button>

                                        }
                                        content={`Click to Log out`}
                                    />
                                </div>

                                <Meteors number={20} />
                            </div>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={friendRequestOpen} onOpenChange={setFriendRequestOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle><p className='text-black dark:text-white'>You have a friend request!!</p></AlertDialogTitle>
                        <AlertDialogDescription>

                            Request sent from {pendingRequsts?.pendingRequests?.[0]?.friendId?.firstName || ''} {pendingRequsts?.pendingRequests?.[0]?.friendId?.lastName || ''}


                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-2'>
                        <TooltipWithTrigger
                            trigger={
                                <Button variant="destructive" onClick={() => handleFriendRequest(pendingRequsts?.pendingRequests?.[0]?.friendId?._id, 'reject')}>Reject</Button>
                            }
                            content={`Click to Reject the friend request.`}
                        />
                        <TooltipWithTrigger
                            trigger={
                                <Button onClick={() => handleFriendRequest(pendingRequsts?.pendingRequests?.[0]?.friendId?._id, 'accept')}>Accept</Button>
                            }
                            content={`Click to accept the friend request and start chatting.`}
                        />
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div style={{ display: 'none' }}>
                {/* Friends List Sidebar */}
                <div style={{ width: '30%', padding: '20px', borderRight: '1px solid #ccc' }}>
                    <h3>Your Friends</h3>
                    <ul>
                        {friends.map((friend) => (
                            <li key={friend.id} onClick={() => setSelectedFriend(friend._id)}>
                                {friend.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Chat Area */}
                <div style={{ width: '70%', padding: '20px' }}>
                    {selectedFriend ? (
                        <>
                            {/* <h3>Chat with {selectedFriend.name}</h3> */}
                            <div style={{ border: '1px solid #ccc', height: '400px', overflowY: 'scroll' }}>
                                {/* {chatMessages.map((message, index) => (
                                <div key={index}>
                                    <strong>{message.senderName}:</strong> {message.text}
                                </div>
                            ))} */}
                            </div>
                            {/* Add form for sending new messages here */}
                        </>
                    ) : (
                        <TextGenerateEffect words={'Select a friend to start chatting'} />
                    )}
                </div>
            </div>
        </>
    );
};



export const TitleComponent = ({
    title,
    avatar,
}: {
    title: string;
    avatar: string;
}) => (
    <div className="flex space-x-2 items-center">
        <img
            src={avatar}
            height="20"
            width="20"
            alt="thumbnail"
            className="rounded-full border-2 border-white"
        />
        <p>{title}</p>
    </div>
)



export const PlaneIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" />
        </svg>
    );
};

export const VacationIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M17.553 16.75a7.5 7.5 0 0 0 -10.606 0" />
            <path d="M18 3.804a6 6 0 0 0 -8.196 2.196l10.392 6a6 6 0 0 0 -2.196 -8.196z" />
            <path d="M16.732 10c1.658 -2.87 2.225 -5.644 1.268 -6.196c-.957 -.552 -3.075 1.326 -4.732 4.196" />
            <path d="M15 9l-3 5.196" />
            <path d="M3 19.25a2.4 2.4 0 0 1 1 -.25a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 1 .25" />
        </svg>
    );
};

export const ElevatorIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 4m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />
            <path d="M10 10l2 -2l2 2" />
            <path d="M10 14l2 2l2 -2" />
        </svg>
    );
};

export const FoodIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20 20c0 -3.952 -.966 -16 -4.038 -16s-3.962 9.087 -3.962 14.756c0 -5.669 -.896 -14.756 -3.962 -14.756c-3.065 0 -4.038 12.048 -4.038 16" />
        </svg>
    );
};

export const MicIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 12.9a5 5 0 1 0 -3.902 -3.9" />
            <path d="M15 12.9l-3.902 -3.899l-7.513 8.584a2 2 0 1 0 2.827 2.83l8.588 -7.515z" />
        </svg>
    );
};

export const ParachuteIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M22 12a10 10 0 1 0 -20 0" />
            <path d="M22 12c0 -1.66 -1.46 -3 -3.25 -3c-1.8 0 -3.25 1.34 -3.25 3c0 -1.66 -1.57 -3 -3.5 -3s-3.5 1.34 -3.5 3c0 -1.66 -1.46 -3 -3.25 -3c-1.8 0 -3.25 1.34 -3.25 3" />
            <path d="M2 12l10 10l-3.5 -10" />
            <path d="M15.5 12l-3.5 10l10 -10" />
        </svg>
    );
};

export default Home;
