import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
    Users, 
    Mail, 
    Shield, 
    UserPlus, 
    MoreVertical, 
    Search,
    MessageSquare,
    ExternalLink,
    Clock,
    X,
    Check,
    Loader2,
    Calendar,
    Briefcase,
    Trash2,
    Ban,
    Copy,
    Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───────── Profile Modal ───────── */
const ProfileModal = ({ isOpen, onClose, member }) => {
    if (!member) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10">
                        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-8 pt-6 pb-16 relative">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-white/80 uppercase tracking-widest text-xs">User Profile</h2>
                                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex flex-col items-center -mt-12 mb-4">
                            <div className="w-24 h-24 rounded-3xl bg-[#1a1a1a] border-4 border-[#111] flex items-center justify-center text-4xl font-bold text-orange-500 shadow-xl">{member.name.charAt(0)}</div>
                        </div>
                        <div className="px-8 pb-8 space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                                <p className="text-slate-400">{member.email}</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                    member.role === 'head' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    member.role === 'admin' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                                    member.role === 'manager' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                }`}>
                                    <Shield className="w-3 h-3 mr-2" />
                                    <span className="capitalize">{member.role === 'head' ? 'Head (Owner)' : member.role}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                                    <Calendar className="w-5 h-5 text-orange-400" />
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Joined Workspace On</p>
                                        <p className="text-sm text-slate-200">
                                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Recently'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl">
                                    <Briefcase className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Workspace Role</p>
                                        <p className="text-sm text-slate-200 capitalize">{member.role === 'head' ? 'Super Admin / Owner' : member.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <a href={`mailto:${member.email}`} className="w-full flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-2xl transition-all">
                                    <MessageSquare className="w-5 h-5" />
                                    <span>Send Direct Email</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

/* ───────── Invite Modal ───────── */
const InviteModal = ({ isOpen, onClose, passkey, workspaceName }) => {
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [message, setMessage] = useState('');

    const handleCopyPasskey = () => {
        if (!passkey) return;
        navigator.clipboard.writeText(passkey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsInviting(true);
        setMessage('');
        try {
            // Simulated direct email invitation containing Workspace details
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage(`Direct invitation details generated for ${email}!`);
            setEmail('');
        } catch (err) {
            setMessage('Failed to send invite.');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl p-8 z-10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Invite Team Members</h2>
                                <p className="text-slate-500 text-sm">Add members to {workspaceName}</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white bg-white/5 rounded-xl"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Method 1: Share Passkey */}
                            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-3">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                                    <Share2 className="w-4 h-4 text-orange-500" />
                                    <span>Method 1: Share Workspace Passkey</span>
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Send this secure passkey to your teammate. They can enter it during setup to request access.
                                </p>
                                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex items-center justify-between font-mono text-sm">
                                    <span className="text-slate-200 tracking-wider font-bold">{passkey || 'PD-••••-••••-••••'}</span>
                                    <button 
                                        onClick={handleCopyPasskey}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                                        title="Copy Passkey"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="relative flex items-center justify-center py-2">
                                <div className="w-full border-t border-white/5"></div>
                                <span className="absolute px-3 bg-[#111] text-slate-600 text-xs font-bold uppercase tracking-widest">Or</span>
                            </div>

                            {/* Method 2: Direct Email Details */}
                            <form onSubmit={handleSendInvite} className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-orange-500" />
                                    <span>Method 2: Direct Email Details Generator</span>
                                </h3>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Teammate Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm" 
                                        placeholder="developer@company.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                                <button type="submit" disabled={isInviting} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2 text-sm shadow-xl shadow-orange-500/10 disabled:opacity-50">
                                    {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate Invite Email Package</span>}
                                </button>
                                
                                {message && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex flex-col space-y-1">
                                        <p className="font-semibold">{message}</p>
                                        <p className="text-[10px] text-slate-500">
                                            Invite package includes: <strong>Workspace:</strong> {workspaceName}, <strong>Link:</strong> {window.location.origin}/register, <strong>Passkey:</strong> {passkey}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

/* ───────── Confirm Action Modal ───────── */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, variant }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl shadow-2xl p-8 z-10">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                {variant === 'danger' ? <Trash2 className="w-8 h-8 text-red-500" /> : <Ban className="w-8 h-8 text-amber-500" />}
                            </div>
                            <h3 className="text-xl font-bold text-white">{title}</h3>
                            <p className="text-slate-400 text-sm">{message}</p>
                        </div>
                        <div className="mt-8 space-y-3">
                            <button onClick={onConfirm} className={`w-full font-bold py-4 rounded-2xl transition-all ${variant === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}`}>
                                {confirmText}
                            </button>
                            <button onClick={onClose} className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-4 rounded-2xl transition-all">Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

/* ───────── Three-Dots Dropdown ───────── */
const MemberDropdown = ({ member, onRoleChange, onDelete, isHeadUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Only workspace Heads can change roles or remove members, and cannot perform actions on themselves
    if (!isHeadUser || member.role === 'head') return null;

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 hover:text-white transition-colors bg-white/5 rounded-xl cursor-pointer">
                <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-12 z-40 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-1.5 space-y-0.5">
                            {/* Role management */}
                            <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Change Role</div>
                            
                            {member.role !== 'admin' && (
                                <button 
                                    onClick={() => { setIsOpen(false); onRoleChange(member, 'admin'); }}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                >
                                    Promote to Admin
                                </button>
                            )}
                            
                            {member.role !== 'member' && (
                                <button 
                                    onClick={() => { setIsOpen(false); onRoleChange(member, 'member'); }}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-amber-400 rounded-xl transition-all cursor-pointer"
                                >
                                    Make Member
                                </button>
                            )}

                            {member.role !== 'viewer' && (
                                <button 
                                    onClick={() => { setIsOpen(false); onRoleChange(member, 'viewer'); }}
                                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-blue-400 rounded-xl transition-all cursor-pointer"
                                >
                                    Make Viewer
                                </button>
                            )}

                            <div className="border-t border-white/5 my-1" />

                            <button 
                                onClick={() => { setIsOpen(false); onDelete(member); }}
                                className="w-full flex items-center space-x-3 px-4 py-3.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="font-semibold">Remove from Team</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ───────── Main Team Component ───────── */
const Team = () => {
    const { workspace } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [passkey, setPasskey] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    const isHeadUser = workspace?.role === 'head';

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/workspaces/members');
            setMembers(data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPasskey = async () => {
        if (!isHeadUser) return;
        try {
            const { data } = await api.get('/workspaces/passkey');
            setPasskey(data.passkey);
        } catch (error) {
            console.error('Error fetching passkey:', error);
        }
    };

    useEffect(() => { 
        fetchMembers();
        fetchPasskey();
    }, [workspace]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
    const openProfile = (member) => { setSelectedMember(member); setIsProfileOpen(true); };

    const handleRoleChange = async (member, newRole) => {
        try {
            await api.patch(`/workspaces/members/${member._id}/role`, { role: newRole });
            showToast(`${member.name}'s role updated to ${newRole}`);
            fetchMembers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update role.');
        }
    };

    const handleDelete = (member) => {
        setConfirmAction({
            title: 'Remove Member',
            message: `This will permanently remove "${member.name}" from the workspace "${workspace?.name}". They will lose access to all projects and tasks.`,
            confirmText: 'Remove Permanently',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/workspaces/members/${member._id}`);
                    setMembers(prev => prev.filter(m => m._id !== member._id));
                    showToast(`${member.name} has been removed from the workspace`);
                } catch (error) {
                    showToast(error.response?.data?.message || 'Failed to remove member.');
                }
                setConfirmAction(null);
            }
        });
    };

    const filteredMembers = members.filter(member => {
        const nameMatch = member.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = member.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesRole = filterRole === 'all' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleColor = (role) => {
        switch (role) {
            case 'head': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'admin': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'manager': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'viewer': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 relative">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 right-8 z-[100] bg-slate-900 border border-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500"><Check className="w-4 h-4" /></div>
                        <span className="font-bold">{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <InviteModal 
                isOpen={isInviteModalOpen} 
                onClose={() => setIsInviteModalOpen(false)} 
                passkey={passkey}
                workspaceName={workspace?.name}
            />
            
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} member={selectedMember} />
            
            {confirmAction && (
                <ConfirmModal 
                    isOpen={true} 
                    onClose={() => setConfirmAction(null)} 
                    onConfirm={confirmAction.onConfirm}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmText={confirmAction.confirmText}
                    variant={confirmAction.variant}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Team Members</h1>
                    <p className="text-slate-500 font-medium">Collaborate and manage roles for your workspace.</p>
                </div>
                {isHeadUser && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsInviteModalOpen(true)} className="flex items-center space-x-3 bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/20 cursor-pointer">
                        <UserPlus className="w-5 h-5" />
                        <span>Invite New Member</span>
                    </motion.button>
                )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                    <input type="text" placeholder="Search by name or email..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-slate-200 focus:outline-none focus:border-orange-500/50 transition-all font-medium placeholder-slate-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer font-bold" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all" className="bg-[#111] text-white">All Member Roles</option>
                    <option value="head" className="bg-[#111] text-white">Owner / Head</option>
                    <option value="admin" className="bg-[#111] text-white">Administrators</option>
                    <option value="manager" className="bg-[#111] text-white">Project Managers</option>
                    <option value="member" className="bg-[#111] text-white">Standard Members</option>
                    <option value="viewer" className="bg-[#111] text-white">Viewers</option>
                </select>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredMembers.map((member, index) => (
                        <motion.div
                            key={member._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-[#111] border border-white/5 hover:border-orange-500/20 rounded-3xl p-8 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -top-4 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl group-hover:bg-orange-600/10 transition-all duration-700" />
                            
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center space-x-5">
                                    <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center font-bold text-2xl text-orange-500 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">{member.name}</h3>
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border mt-2 tracking-widest uppercase ${getRoleColor(member.role)}`}>
                                            <Shield className="w-3 h-3 mr-2" />
                                            <span>{member.role === 'head' ? 'Head (Owner)' : member.role}</span>
                                        </div>
                                    </div>
                                </div>
                                <MemberDropdown 
                                    member={member} 
                                    onRoleChange={handleRoleChange} 
                                    onDelete={handleDelete} 
                                    isHeadUser={isHeadUser} 
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center text-sm text-slate-400 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                    </div>
                                    {member.email}
                                </div>
                                <div className="flex items-center text-sm text-slate-400 font-medium">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                    </div>
                                    Joined {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recently'}
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-end">
                                <div className="flex items-center space-x-3">
                                    <a href={`mailto:${member.email}`} title="Message" className="p-3 bg-white/5 hover:bg-orange-600 text-slate-400 hover:text-white rounded-xl transition-all duration-300">
                                        <MessageSquare className="w-5 h-5" />
                                    </a>
                                    <button onClick={() => openProfile(member)} title="Profile" className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all duration-300 cursor-pointer">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-20 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-[#111] border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-300">No members found</h2>
                    <p className="text-slate-500 mt-2 font-medium">No one matches your search filters.</p>
                </div>
            )}
        </div>
    );
};

export default Team;
