import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../lib/axios';
import '../lib/echo'; 

const Chat = ({ user, projectId = null, chatRoom = 'general' }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // جلب الرسائل الأولية
    const fetchMessages = async () => {
        try {
            let response;
            if (projectId) {
                console.log("Fetching messages for project:", projectId);
                response = await axiosInstance.get(`/projects/${projectId}/messages`);
            } else {
                response = await axiosInstance.get('/messages', {
                    params: { room: chatRoom }
                });
            }
            setMessages(response.data.messages || []);
            setConnectionError(null);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setConnectionError('Failed to load messages');
        }
    };

    // إرسال رسالة
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

        // تأكد من وجود token
        const token = localStorage.getItem('token');
        if (!token) {
            setConnectionError('No authentication token found');
            return;
        }

        if (projectId) {
            // قناة خاصة بالمشروع
            console.log(`Subscribing to private channel: project.${projectId}`);
            
            channel = window.Echo.private(`project.${projectId}`)
                .listen('.MessageSent', (e) => {
                    console.log("(: Received broadcast:", e);
                    console.log('Received message via broadcast:', e);
                    setMessages((prev) => [...prev, e.message]);
                })
                .error((error) => {
                    console.error('Channel subscription error:', error);
                    setIsConnected(false);
                    setConnectionError('Failed to connect to project chat');
                });

            // تأكد من نجاح الاشتراك
            channel.subscribed = () => {
                console.log(`Successfully subscribed to project.${projectId}`);
                setIsConnected(true);
                setConnectionError(null);
            };

        } else {
            // قناة عامة
            console.log(`Joining presence channel: chat.${chatRoom}`);
            
            channel = window.Echo.join(`chat.${chatRoom}`)
                .listen('MessageSent', (e) => {
                    console.log('Received message via broadcast:', e);
                    setMessages((prev) => [...prev, e.message]);
                })
                .here((users) => {
                    console.log('Users currently in channel:', users);
                    setIsConnected(true);
                    setConnectionError(null);
                })
                .joining((user) => {
                    console.log('User joining:', user);
                })
                .leaving((user) => {
                    console.log('User leaving:', user);
                })
                .error((error) => {
                    console.error('Channel subscription error:', error);
                    setIsConnected(false);
                    setConnectionError('Failed to connect to chat room');
                });
        }

        return () => {
            if (channel) {
                console.log('Cleaning up channel subscription');
                channel.stopListening('MessageSent');
                if (projectId) {
                    window.Echo.leaveChannel(`private-project.${projectId}`);
                } else {
                    window.Echo.leaveChannel(`presence-chat.${chatRoom}`);
                }
            }
        };
    }, [projectId, chatRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="chat-container" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div className="chat-header" style={{ 
                padding: '10px', 
                borderBottom: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0 }}>
                    {projectId ? `Project Chat: ${projectId}` : `Chat Room: ${chatRoom}`}
                </h3>
                <div>
                    <span className={`status ${isConnected ? 'connected' : 'disconnected'}`} 
                          style={{ 
                              color: isConnected ? 'green' : 'red',
                              fontSize: '12px'
                          }}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                    {connectionError && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                            {connectionError}
                        </div>
                    )}
                </div>
            </div>

            <div className="messages-container" style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '10px',
                backgroundColor: '#f9f9f9'
            }}>
                {messages.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>No messages yet.</p>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                marginBottom: '15px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: message.user.id === user.id ? '#007bff' : '#fff',
                                color: message.user.id === user.id ? 'white' : 'black',
                                marginLeft: message.user.id === user.id ? '50px' : '0',
                                marginRight: message.user.id === user.id ? '0' : '50px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                marginBottom: '5px',
                                fontSize: '12px',
                                opacity: '0.8'
                            }}>
                                <span>{message.user.name}</span>
                                <span>{formatTime(message.created_at)}</span>
                            </div>
                            <div>{message.content}</div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ 
                padding: '10px', 
                borderTop: '1px solid #ccc',
                display: 'flex',
                gap: '10px'
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    maxLength="1000"
                    style={{
                        flex: 1,
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;