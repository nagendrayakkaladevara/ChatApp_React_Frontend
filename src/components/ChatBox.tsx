import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

// const socket = io('http://localhost:4000'); // Connect to Socket.io
const socket = io('https://chartapp-expressjs-backend.onrender.com')


interface ChatBoxProps {
    receiverId: any
}

const ChatBox: React.FC<ChatBoxProps> = ({ receiverId }) => {
    const [message, setMessage] = useState('');
    const [messagess, setMessagess] = useState<any[]>([]);
    const { phone } = useContext(AuthContext)!;

    useEffect(() => {
        socket.emit('join', { phone });

        socket.on('message', (message) => {
            setMessagess((prev) => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, [phone]);

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        const payload = {
            receiverId: receiverId,
            message: trimmedMessage
        }


        if (trimmedMessage) {
            try {
                await axiosClient.post('messages/send', payload);
                setMessage('');
            } catch (error) {
                console.error('Error sending message:', error);

            }
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        socket.emit('typing', { phone, message: e.target.value });
    };

    useEffect(() => {
        socket.on('typing', ({ phone, message }) => {
            console.log(`${phone} is typing: ${message}`);
        });

        socket.on('online', (userPhone) => {
            console.log(`${userPhone} is online`);
        });
    }, []);


    return (
        <div>
            <div className="message-list">
                {messagess.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type a message..."
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default ChatBox;
