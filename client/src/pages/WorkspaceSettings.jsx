import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    KeyRound, 
    Copy, 
    Check, 
    RefreshCw, 
    ToggleLeft, 
    ToggleRight, 
    Loader2, 
    CheckCircle2, 
    XCircle,
    Info
} from 'lucide-react';
import api from '../api/axios';

const WorkspaceSettings = () => {
    const [workspaceInfo, setWorkspaceInfo] = useState(null);
    const [passkeyData, setPasskeyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPasskey, setShowPasskey] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchData = async () => {
        try {
            const [wsRes, passkeyRes] = await Promise.all([
                api.get('/workspaces/current'),
                api.get('/workspaces/passkey')
            ]);
            setWorkspaceInfo(wsRes.data);
            setPasskeyData(passkeyRes.data);
        } catch (error) {
            console.error('Failed to load workspace settings', error);
            showToast('Failed to load workspace settings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCopyPasskey = () => {
        if (!passkeyData?.passkey) return;
        navigator.clipboard.writeText(passkeyData.passkey);
        setCopied(true);
        showToast('Passkey copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = async () => {
        if (!window.confirm('Are you sure you want to regenerate the workspace passkey? The existing passkey will immediately become invalid. Users attempting to join with it will be unable to.')) {
            return;
        }

        setIsRegenerating(true);
        try {
            const { data } = await api.post('/workspaces/passkey/regenerate');
            setPasskeyData(prev => ({ ...prev, passkey: data.passkey }));
            showToast('Passkey regenerated successfully!');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to regenerate passkey.', 'error');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleTogglePasskey = async () => {
        setIsToggling(true);
        try {
            const { data } = await api.patch('/workspaces/passkey/toggle');
            setPasskeyData(prev => ({ ...prev, passkeyActive: data.passkeyActive }));
            showToast(data.message);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to toggle passkey status.', 'error');
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Workspace Settings</h1>
                <p className="text-slate-400 mt-1">Configure security, access passkeys, and manage settings for {workspaceInfo?.name || 'your workspace'}.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-slate-500 text-sm">Loading settings...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {/* General Info Card */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Workspace Details</h3>
                        <div className="space-y-4 text-sm">
                            <div className="grid grid-cols-3 border-b border-slate-800 pb-3">
                                <span className="text-slate-500 font-medium">Workspace Name</span>
                                <span className="text-slate-200 col-span-2 font-bold">{workspaceInfo?.name}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-800 pb-3">
                                <span className="text-slate-500 font-medium">Role</span>
                                <span className="text-orange-500 font-bold uppercase text-xs tracking-wider flex items-center col-span-2">
                                    {workspaceInfo?.role}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-slate-800 pb-3">
                                <span className="text-slate-500 font-medium">Active Members</span>
                                <span className="text-slate-200 col-span-2 font-bold">{workspaceInfo?.memberCount}</span>
                            </div>
                            <div className="grid grid-cols-3">
                                <span className="text-slate-500 font-medium">Created On</span>
                                <span className="text-slate-200 col-span-2">
                                    {new Date(workspaceInfo?.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Passkey Security Settings */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                    <KeyRound className="w-5 h-5 text-amber-500" />
                                    <span>Workspace Access Passkey</span>
                                </h3>
                                <p className="text-slate-500 text-xs mt-1 max-w-xl">
                                    New users can request access by entering this passkey during onboarding. You will receive join requests that you can approve or reject.
                                </p>
                            </div>
                            <button
                                disabled={isToggling}
                                onClick={handleTogglePasskey}
                                className="flex items-center space-x-1.5 focus:outline-none text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                {isToggling ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
                                ) : passkeyData?.passkeyActive ? (
                                    <ToggleRight className="w-10 h-10 text-emerald-500" />
                                ) : (
                                    <ToggleLeft className="w-10 h-10 text-slate-600" />
                                )}
                            </button>
                        </div>

                        {/* Passkey box */}
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-slate-500 text-xs font-mono uppercase tracking-wider font-bold">Passkey</span>
                                <span className="text-lg font-mono font-bold tracking-widest text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                    {showPasskey ? passkeyData?.passkey : 'PD-••••-••••-••••'}
                                </span>
                                <button 
                                    onClick={() => setShowPasskey(!showPasskey)}
                                    className="text-xs text-orange-500 hover:text-orange-400 font-bold underline transition-colors cursor-pointer"
                                >
                                    {showPasskey ? 'Hide' : 'Reveal'}
                                </button>
                            </div>

                            <div className="flex space-x-2">
                                <button 
                                    onClick={handleCopyPasskey}
                                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer"
                                    title="Copy Passkey"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                                <button 
                                    disabled={isRegenerating}
                                    onClick={handleRegenerate}
                                    className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                                    title="Regenerate Passkey"
                                >
                                    {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin text-slate-500" /> : <RefreshCw className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Banner status */}
                        <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs leading-relaxed text-slate-400">
                                <span className="font-bold text-white">Status:</span>{' '}
                                {passkeyData?.passkeyActive ? (
                                    <span className="text-emerald-500 font-bold">Active & Accepting Join Requests</span>
                                ) : (
                                    <span className="text-rose-500 font-bold">Disabled — No new members can join</span>
                                )}{' '}
                                — Regenerating the passkey immediately invalidates the previous one. Already joined members will remain unaffected.
                            </div>
                        </div>
                    </div>
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

export default WorkspaceSettings;
