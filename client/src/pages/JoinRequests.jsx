import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    Check, 
    X, 
    Loader2, 
    Users, 
    Inbox,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import api from '../api/axios';

const JoinRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/workspaces/join-requests');
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch join requests', error);
            showToast('Failed to load join requests.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, action) => {
        setActioningId(requestId);
        try {
            const { data } = await api.patch(`/workspaces/join-requests/${requestId}/${action}`);
            showToast(data.message);
            // Update local state status or filter out approved/rejected ones
            setRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (error) {
            showToast(error.response?.data?.message || `Failed to ${action} request.`, 'error');
        } finally {
            setActioningId(null);
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Pending Join Requests</h1>
                <p className="text-slate-400 mt-1">Review and approve access requests for your team workspace.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-slate-500 text-sm">Loading pending requests...</p>
                </div>
            ) : requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req, idx) => (
                        <motion.div 
                            key={req._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-lg">
                                        {req.user?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{req.user?.name}</h3>
                                        <p className="text-xs text-slate-500">{req.user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-950 px-3 py-2 rounded-xl border border-slate-850">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Requested: {formatTime(req.createdAt)}</span>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button 
                                    disabled={actioningId !== null}
                                    onClick={() => handleAction(req._id, 'reject')}
                                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {actioningId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4" /><span>Reject</span></>}
                                </button>
                                <button 
                                    disabled={actioningId !== null}
                                    onClick={() => handleAction(req._id, 'approve')}
                                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-orange-500/10 disabled:opacity-50"
                                >
                                    {actioningId === req._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /><span>Approve</span></>}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-slate-850 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                        <Inbox className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Pending Requests</h3>
                    <p className="text-slate-500 text-sm max-w-md">
                        There are no pending join requests for this workspace. Share your passkey with team members to let them request access.
                    </p>
                </div>
            )}

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 border border-slate-800 px-5 py-4 rounded-2xl shadow-2xl"
                    >
                        {toast.type === 'error' ? (
                            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-slate-200">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JoinRequests;
