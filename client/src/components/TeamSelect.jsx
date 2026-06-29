import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, X, Loader2, User, Check } from 'lucide-react';
import api from '../api/axios';

const TeamSelect = ({ project, onUpdate }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(null);

    useEffect(() => {
        const searchUsers = async () => {
            if (query.length < 3) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const { data } = await api.get(`/auth/search?query=${query}`);
                // Filter out users already in team
                const filtered = data.filter(u => !project.team.some(tm => tm._id === u._id));
                setResults(filtered);
            } catch (err) {
                console.error('Search failed');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(searchUsers, 500);
        return () => clearTimeout(timer);
    }, [query, project.team]);

    const handleAdd = async (userId) => {
        setIsAdding(userId);
        try {
            const { data } = await api.patch(`/projects/${project._id}/team/add`, { userId });
            onUpdate(data);
            setQuery('');
            setResults([]);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        } finally {
            setIsAdding(null);
        }
    };

    const handleRemove = async (userId) => {
        if (!window.confirm('Remove this member from the project?')) return;
        try {
            const { data } = await api.patch(`/projects/${project._id}/team/remove`, { userId });
            onUpdate(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Add Team Member</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin" />
                    )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                    {results.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl"
                        >
                            {results.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-slate-700/50 transition-all border-b border-slate-700 last:border-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-xs font-bold text-primary-500 border border-primary-500/20">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(user._id)}
                                        disabled={isAdding === user._id}
                                        className="p-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-white transition-all disabled:opacity-50"
                                    >
                                        {isAdding === user._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Current Team */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Project Team ({project.team.length})</label>
                <div className="grid grid-cols-1 gap-2">
                    {project.team.map(member => (
                        <div key={member._id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                                    {member.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white flex items-center">
                                        {member.name}
                                        {member._id === project.owner._id && (
                                            <span className="ml-2 text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-black tracking-tighter">Owner</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                </div>
                            </div>
                            {member._id !== project.owner._id && (
                                <button
                                    onClick={() => handleRemove(member._id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamSelect;
