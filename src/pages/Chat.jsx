import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../lib/axios';
import '../lib/echo'; 

const Chat = ({ user, projectId = null, chatRoom = 'general' }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 🟢 جلب الرسائل الأولية
    const fetchMessages = async () => {
        try {
            let response;
            if (projectId) {
                console.log("in fetch messages", projectId);
                response = await axiosInstance.get(`/projects/${projectId}/messages`);
            } else {
                response = await axiosInstance.get('/messages', {
                    params: { room: chatRoom }
                });
            }
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    // 🟢 إرسال رسالة
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            if (projectId) {
                await axiosInstance.post(`/projects/${projectId}/messages`, {
                    content: newMessage
                });
            } else {
                await axiosInstance.post('/messages', {
                    content: newMessage,
                    chat_room: chatRoom
                });
            }
            setNewMessage('');
            // 👇 الرسالة هتيجي أوتوماتيك عبر البث
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchMessages();

        let channel;

        if (projectId) {
            // قناة خاصة بالمشروع
            channel = window.Echo.private(`project.${projectId}`);
            channel
                .listen('MessageSent', (e) => {
                    setMessages((prev) => [...prev, e.message]);
                })
                .error(() => setIsConnected(false));
            setIsConnected(true);
        } else {
            // قناة عامة
            channel = window.Echo.join(`chat.${chatRoom}`);
            channel
                .listen('MessageSent', (e) => {
                    setMessages((prev) => [...prev, e.message]);
                })
                .here(() => setIsConnected(true))
                .joining(() => setIsConnected(true))
                .leaving(() => setIsConnected(true))
                .error(() => setIsConnected(false));
        }

        return () => {
            if (channel) {
                channel.stopListening('MessageSent');
                if (projectId) {
                    window.Echo.leave(`project.${projectId}`);
                } else {
                    window.Echo.leave(`chat.${chatRoom}`);
                }
            }
        };
    }, [projectId, chatRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>
                    {projectId ? `Project Chat: ${projectId}` : `Chat Room: ${chatRoom}`}
                </h3>
                <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </span>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <p className="text-gray-500">No messages yet.</p>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.user.id === user.id ? 'own' : 'other'}`}
                        >
                            <div className="message-header">
                                <span className="username">{message.user.name}</span>
                                <span className="timestamp">{formatTime(message.created_at)}</span>
                            </div>
                            <div className="message-content">{message.content}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength="1000"
                />
                <button type="submit" disabled={!newMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;
