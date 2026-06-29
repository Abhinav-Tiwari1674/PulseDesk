import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    ArrowRight, 
    Building2, 
    KeyRound, 
    Loader2, 
    Clock, 
    LogOut,
    CheckCircle2,
    XCircle,
    Copy,
    Check
} from 'lucide-react';
import api from '../api/axios';

const WorkspaceSetup = () => {
    const { logout, selectWorkspace, user, refreshAuth } = useAuth();
    const navigate = useNavigate();

    // Mode state: 'select' | 'create' | 'join' | 'requests'
    const [mode, setMode] = useState('select');
    
    // Create form
    const [workspaceName, setWorkspaceName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Join form
    const [passkey, setPasskey] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // My Requests list
    const [myRequests, setMyRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    // Fetch user's join requests
    const fetchRequests = async () => {
        setLoadingRequests(true);
        try {
            const { data } = await api.get('/workspaces/my-requests');
            setMyRequests(data);
        } catch (error) {
            console.error('Failed to fetch join requests', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        if (mode === 'requests' || mode === 'select') {
            fetchRequests();
        }
    }, [mode]);

    // Handle passkey input formatting
    const handlePasskeyChange = (e) => {
        let val = e.target.value.toUpperCase();
        // Remove all dashes first to get raw input
        let raw = val.replace(/-/g, '').replace(/[^A-Z0-9]/g, '');
        
        let formatted = '';
        if (raw.length <= 2) {
            formatted = raw;
        } else {
            formatted = raw.substring(0, 2);
            if (raw.length > 2) {
                formatted += '-' + raw.substring(2, 6);
            }
            if (raw.length > 6) {
                formatted += '-' + raw.substring(6, 10);
            }
            if (raw.length > 10) {
                formatted += '-' + raw.substring(10, 14);
            }
        }
        setPasskey(formatted.substring(0, 17));
    };

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!workspaceName.trim()) return;

        setIsCreating(true);
        try {
            const { data } = await api.post('/workspaces', { name: workspaceName });
            showToast('Workspace created successfully!');
            await selectWorkspace(data._id);
            navigate('/dashboard');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to create workspace.', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinWorkspace = async (e) => {
        e.preventDefault();
        if (passkey.length < 17) {
            showToast('Please enter a valid passkey format: PD-XXXX-XXXX-XXXX', 'error');
            return;
        }

        setIsJoining(true);
        try {
            const { data } = await api.post('/workspaces/join-request', { passkey });
            showToast(data.message || 'Join request submitted!');
            setPasskey('');
            setMode('requests');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to submit join request.', 'error');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleCheckApproval = async () => {
        showToast('Checking for approvals...', 'success');
        try {
            await refreshAuth();
            const storedUser = localStorage.getItem('userInfo');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.currentWorkspace) {
                    await selectWorkspace(parsed.currentWorkspace);
                    navigate('/dashboard');
                } else {
                    fetchRequests();
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-white p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="flex justify-between items-center max-w-6xl mx-auto w-full z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xl text-black">P</div>
                    <span className="text-xl font-bold tracking-tight">PulseDesk</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-red-400 transition-all text-slate-400 text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex items-center justify-center max-w-md mx-auto w-full z-10 py-12">
                <AnimatePresence mode="wait">
                    {mode === 'select' && (
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-3xl font-bold tracking-tight">Set up your workspace</h1>
                                <p className="text-slate-400 mt-2">Welcome {user?.name}! To get started with PulseDesk, you can create a new workspace or join an existing one.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Option 1: Create */}
                                <div 
                                    onClick={() => setMode('create')}
                                    className="group relative p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl cursor-pointer transition-all hover:shadow-2xl hover:shadow-orange-500/5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                                                <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white group-hover:text-orange-500 transition-colors">Create New Workspace</h3>
                                                <p className="text-sm text-slate-400 mt-1">Start fresh with your own team, projects, and custom dashboard.</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>

                                {/* Option 2: Join */}
                                <div 
                                    onClick={() => setMode('join')}
                                    className="group relative p-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl cursor-pointer transition-all hover:shadow-2xl hover:shadow-amber-500/5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                                                <KeyRound className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-white group-hover:text-amber-500 transition-colors">Join Existing Workspace</h3>
                                                <p className="text-sm text-slate-400 mt-1">Access an existing workspace using a secure team passkey.</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Submitted Requests Badge/Trigger */}
                            {myRequests.length > 0 && (
                                <div className="text-center pt-2">
                                    <button 
                                        onClick={() => setMode('requests')}
                                        className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors bg-slate-900/40 px-4 py-2 border border-slate-800 rounded-full"
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>View Submitted Join Requests ({myRequests.length})</span>
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {mode === 'create' && (
                        <motion.div 
                            key="create"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold">New Workspace</h2>
                            </div>
                            
                            <form onSubmit={handleCreateWorkspace} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Workspace Name</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 rounded-2xl py-4 px-5 text-white outline-none transition-all"
                                        placeholder="e.g. Acme Corp Engineering"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setMode('select')}
                                        className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isCreating}
                                        className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-orange-500/10"
                                    >
                                        {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Create</span>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {mode === 'join' && (
                        <motion.div 
                            key="join"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold">Enter Workspace Passkey</h2>
                            </div>
                            
                            <form onSubmit={handleJoinWorkspace} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Workspace Passkey</label>
                                    <input 
                                        type="text"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 rounded-2xl py-4 px-5 text-white text-center text-lg font-mono tracking-widest placeholder:text-slate-700 outline-none transition-all"
                                        placeholder="PD-XXXX-XXXX-XXXX"
                                        value={passkey}
                                        onChange={handlePasskeyChange}
                                    />
                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 text-center">
                                        Ask your workspace Owner (Head) for the team passkey.
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button 
                                        type="button"
                                        onClick={() => setMode('select')}
                                        className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isJoining}
                                        className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/10"
                                    >
                                        {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Request Access</span>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {mode === 'requests' && (
                        <motion.div 
                            key="requests"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold mb-6">Your Join Requests</h2>

                            {loadingRequests ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    <p className="text-sm text-slate-500">Loading requests...</p>
                                </div>
                            ) : myRequests.length > 0 ? (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {myRequests.map((req) => (
                                        <div key={req._id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-slate-200">{req.workspace?.name}</h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                {req.status === 'pending' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        <Clock className="w-3 h-3 mr-1.5 animate-pulse" />
                                                        Pending
                                                    </span>
                                                )}
                                                {req.status === 'approved' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                        Approved
                                                    </span>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                        <XCircle className="w-3 h-3 mr-1.5" />
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 italic text-sm">
                                    No requests submitted yet.
                                </div>
                            )}

                            <div className="flex space-x-3 pt-6 border-t border-slate-800/80 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setMode('select')}
                                    className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Back
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCheckApproval}
                                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center space-x-2"
                                >
                                    <span>Check Approval</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer logo/terms */}
            <footer className="text-center text-slate-600 text-xs py-4 z-10">
                &copy; {new Date().getFullYear()} PulseDesk Inc. All rights reserved.
            </footer>

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

export default WorkspaceSetup;
