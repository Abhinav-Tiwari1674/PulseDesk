import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Send, MessageSquare, Loader2, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { io } from 'socket.io-client';

const Chat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);

    const chatEndRef = useRef(null);

    // Auto-scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load Contacts/Recipients
    useEffect(() => {
        const fetchContacts = async () => {
            setLoadingContacts(true);
            try {
                if (user.role === 'admin') {
                    // Admin gets all workspace employees
                    const { data } = await api.get('/auth/employees');
                    setContacts(data);
                    // Select first contact by default on desktop if available
                    if (data.length > 0) {
                        setSelectedContact(data[0]);
                    }
                } else {
                    // Employee gets their Admin as the sole contact
                    const { data } = await api.get('/auth/admin-details');
                    const adminContact = {
                        _id: data._id,
                        name: data.name,
                        email: data.email,
                        role: 'admin',
                        isJoined: true
                    };
                    setContacts([adminContact]);
                    setSelectedContact(adminContact);
                }
            } catch (err) {
                setError('Failed to load contacts.');
            } finally {
                setLoadingContacts(false);
            }
        };

        if (user) {
            fetchContacts();
        }
    }, [user]);

    // Socket.io initialization and room connection
    useEffect(() => {
        const socketUrl = import.meta.env.MODE === 'production' 
            ? window.location.origin 
            : 'http://localhost:5001';

        const newSocket = io(socketUrl, {
            withCredentials: true
        });

        setSocket(newSocket);

        if (user?._id) {
            newSocket.emit('join', user._id);
        }

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Fetch Messages for selected contact (once on select, no polling)
    useEffect(() => {
        if (!selectedContact) {
            setMessages([]);
            return;
        }

        const fetchMessages = async (showLoading = false) => {
            if (showLoading) setLoadingMessages(true);
            try {
                const { data } = await api.get(`/messages/${selectedContact._id}`);
                setMessages(data);
            } catch (err) {
                // Fail silently
            } finally {
                if (showLoading) setLoadingMessages(false);
            }
        };

        fetchMessages(true);
    }, [selectedContact]);

    // Listen to real-time socket messages
    useEffect(() => {
        if (!socket || !selectedContact) return;

        const handleMessageReceived = (msg) => {
            const senderId = msg.sender?._id || msg.sender;
            if (senderId === selectedContact._id) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === msg._id)) {
                        return prev;
                    }
                    return [...prev, msg];
                });
            }
        };

        socket.on('message_received', handleMessageReceived);

        return () => {
            socket.off('message_received', handleMessageReceived);
        };
    }, [socket, selectedContact]);

    // Handle Send Message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact || sending) return;

        const messageText = newMessage.trim();
        setSending(true);
        try {
            const { data } = await api.post('/messages', {
                receiverId: selectedContact._id,
                message: messageText
            });
            setMessages((prev) => [...prev, data]);
            setNewMessage('');
        } catch (err) {
            setError('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    // Filtered contacts based on search query
    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden font-sans shadow-2xl">
            {/* Sidebar: Conversations List */}
            <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col ${selectedContact && 'hidden md:flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                    <h2 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
                        <MessageSquare className="w-5 h-5 text-orange-500" />
                        <span>Conversations</span>
                    </h2>
                    {user.role === 'admin' && (
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all"
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Contacts List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loadingContacts ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-2 text-slate-500">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            <p className="text-xs">Loading contacts...</p>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center p-6 text-slate-600 text-xs">
                            No employees found.
                        </div>
                    ) : (
                        filteredContacts.map(c => {
                            const isSelected = selectedContact?._id === c._id;
                            const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                            return (
                                <button
                                    key={c._id}
                                    onClick={() => setSelectedContact(c)}
                                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all text-left ${
                                        isSelected 
                                            ? 'bg-orange-500/10 border border-orange-500/20 text-white' 
                                            : 'hover:bg-slate-800/40 border border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-black ${
                                        isSelected ? 'bg-orange-500' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-white">{c.name}</p>
                                        <p className="text-[10px] truncate text-slate-500">{c.email}</p>
                                    </div>
                                    {c.role === 'admin' && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 uppercase">
                                            Admin
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Panel: Active Thread */}
            <div className={`flex-1 flex flex-col bg-slate-950/20 ${!selectedContact && 'hidden md:flex'}`}>
                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-all"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-orange-500 border border-slate-700">
                                    {selectedContact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm flex items-center space-x-2">
                                        <span>{selectedContact.name}</span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                                            {selectedContact.role}
                                        </span>
                                    </h3>
                                    <p className="text-[10px] text-slate-500 truncate">{selectedContact.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages List Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-950/10">
                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-500">
                                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                    <p className="text-xs">Loading chat history...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                                    <MessageSquare className="w-10 h-10 mb-2 opacity-40 text-orange-500" />
                                    <p className="text-sm font-semibold">Start the conversation</p>
                                    <p className="text-xs max-w-xs mt-1">Send a message to start messaging.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                                    return (
                                        <div key={msg._id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                                                isMe 
                                                    ? 'bg-orange-500 text-black rounded-tr-none font-medium' 
                                                    : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/60'
                                            }`}>
                                                <p className="leading-relaxed break-words">{msg.message}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Message Input Footer Form */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/40 flex items-center space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Type a message to ${selectedContact.name}...`}
                                disabled={sending}
                                className="flex-1 bg-slate-850 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-orange-500/10"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8">
                        <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
                        <p className="font-semibold text-sm">No conversation selected</p>
                        <p className="text-xs text-slate-600 mt-0.5">Choose a contact from the sidebar list to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
