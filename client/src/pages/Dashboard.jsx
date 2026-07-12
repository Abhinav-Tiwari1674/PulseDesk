import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Users, ClipboardList, CheckCircle2, Clock,
    TrendingUp, MessageSquare, Loader2, ChevronRight,
    AlertCircle, X, Sparkles
} from 'lucide-react';

// ── Shared Utilities ──────────────────────────────────────────────────────────

const statusColors = {
    'pending': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    'in-progress': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'completed': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
};

const priorityColors = {
    'low': 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    'medium': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    'high': 'bg-red-500/10 text-red-400 border border-red-500/20'
};

const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusColors[status] || ''}`}>
        {status?.replace('-', ' ')}
    </span>
);

const PriorityBadge = ({ priority }) => (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${priorityColors[priority] || ''}`}>
        {priority}
    </span>
);

const ProgressBar = ({ value }) => (
    <div className="flex items-center space-x-2">
        <div className="flex-1 bg-slate-800 rounded-full h-1.5">
            <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${value || 0}%` }}
            />
        </div>
        <span className="text-xs text-slate-400 w-8 text-right">{value || 0}%</span>
    </div>
);

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{label}</p>
            <p className="text-3xl font-bold text-white mt-0.5">{value ?? '—'}</p>
        </div>
    </div>
);

// ── Admin Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/tasks/dashboard-stats');
                if (data && data.myTasks !== undefined) {
                    // Mismatch: received employee stats but user is admin. Force reload to sync.
                    window.location.reload();
                    return;
                }
                setStats(data);
            } catch (err) {
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    );

    if (error) return (
        <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Overview of all employees and tasks.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={ClipboardList} label="Total Tasks" value={stats?.totalTasks} color="bg-orange-500/10 text-orange-400" />
                <StatCard icon={CheckCircle2} label="Completed" value={stats?.completedTasks} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard icon={Clock} label="Pending" value={stats?.pendingTasks} color="bg-yellow-500/10 text-yellow-400" />
            </div>

            {/* Recent Updates + Latest Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Task Updates */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <h2 className="font-semibold text-white">Recent Task Updates</h2>
                    </div>
                    <div className="space-y-3">
                        {stats?.recentTaskUpdates?.length > 0 ? stats.recentTaskUpdates.map(task => (
                            <div key={task._id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{task.assignedEmployee?.name} · {formatDate(task.updatedAt)}</p>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                    <StatusBadge status={task.status} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm">No task updates yet.</p>
                        )}
                    </div>
                </div>

                {/* Latest Employee Messages */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center space-x-2 mb-5">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <h2 className="font-semibold text-white">Latest Employee Messages</h2>
                    </div>
                    <div className="space-y-3">
                        {stats?.latestEmployeeMessages?.length > 0 ? stats.latestEmployeeMessages.map(task => (
                            <div key={task._id} className="p-3 bg-slate-800/60 rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{task.assignedEmployee?.name}</p>
                                    <span className="text-xs text-slate-400">{formatDate(task.updatedAt)}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed">{task.workUpdateMessage}</p>
                                <p className="text-xs text-slate-400 mt-1">Task: {task.title}</p>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm">No employee messages yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee Tracking Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="font-semibold text-white">Employee Task Overview</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Employee</th>
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Latest Task</th>
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Progress</th>
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Last Updated</th>
                                <th className="text-left text-xs text-slate-400 font-semibold uppercase tracking-wider px-6 py-3">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {stats?.employeeTable?.length > 0 ? stats.employeeTable.map(emp => (
                                <tr key={emp._id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm flex-shrink-0">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{emp.name}</p>
                                                <p className="text-xs text-slate-400">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.task ? (
                                            <p className="text-slate-300 max-w-xs truncate">{emp.task.title}</p>
                                        ) : (
                                            <span className="text-slate-500 italic">No tasks assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 w-40">
                                        {emp.task ? (
                                            <ProgressBar value={emp.task.progressPercentage} />
                                        ) : <span className="text-slate-500">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.task ? <StatusBadge status={emp.task.status} /> : <span className="text-slate-500">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.task ? (
                                            <div>
                                                <p className="text-slate-300">{formatDate(emp.task.updatedAt)}</p>
                                                <p className="text-xs text-slate-400">{formatTime(emp.task.updatedAt)}</p>
                                            </div>
                                        ) : <span className="text-slate-500">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.task?.workUpdateMessage ? (
                                            <p className="text-slate-400 max-w-xs truncate text-sm">{emp.task.workUpdateMessage}</p>
                                        ) : <span className="text-slate-500 italic text-xs">No message</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No employees found. Create employees first.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Employee Update Modal ─────────────────────────────────────────────────────

const UpdateModal = ({ task, onClose, onSave }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState(task.status);
    const [progress, setProgress] = useState(task.progressPercentage);
    const [newMessage, setNewMessage] = useState('');
    const [updates, setUpdates] = useState(task.updates || []);
    const [subTasks, setSubTasks] = useState(task.subTasks || []);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef(null);

    // AI States
    const [summarizingAi, setSummarizingAi] = useState(false);
    const [aiSummaryText, setAiSummaryText] = useState('');
    const [enhancingTone, setEnhancingTone] = useState(false);

    // Auto-scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [updates]);

    // Poll task updates every 4 seconds for real-time feel
    useEffect(() => {
        const fetchTaskDetails = async () => {
            try {
                const { data } = await api.get(`/tasks/${task._id}`);
                setUpdates(data.updates || []);
                setSubTasks(data.subTasks || []);
            } catch (err) {
                // Fail silently on background polling
            }
        };

        fetchTaskDetails(); // fetch immediately on mount
        const poll = setInterval(fetchTaskDetails, 4000);
        return () => clearInterval(poll);
    }, [task._id]);

    const handleSendUpdate = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSaving(true);
        setError('');
        try {
            const payload = {
                status,
                progressPercentage: progress,
                workUpdateMessage: newMessage.trim()
            };
            if (subTasks.length > 0) payload.subTasks = subTasks;
            const { data } = await api.put(`/tasks/${task._id}`, payload);
            setUpdates(data.updates || []);
            setNewMessage('');
            onSave(data); // Update main page dashboard stats
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send update.');
        } finally {
            setSaving(false);
        }
    };

    const handleStatusOrProgressChange = async (newStatus, newProgress) => {
        try {
            const payload = {
                status: newStatus,
                progressPercentage: newProgress,
            };
            if (subTasks.length > 0) payload.subTasks = subTasks;
            const { data } = await api.put(`/tasks/${task._id}`, payload);
            onSave(data);
        } catch (err) {
            // ignore silent update errors
        }
    };

    const handleSubTaskToggle = async (idx, isChecked) => {
        const updatedSubTasks = [...subTasks];
        updatedSubTasks[idx].isCompleted = isChecked;
        setSubTasks(updatedSubTasks);

        let pct = 0;
        if (updatedSubTasks.length > 0) {
            const completedCount = updatedSubTasks.filter(st => st.isCompleted).length;
            pct = Math.round((completedCount / updatedSubTasks.length) * 100);
        }
        setProgress(pct);
        const newStatus = pct === 100 ? 'completed' : status;
        if (pct === 100) setStatus('completed');

        try {
            const { data } = await api.put(`/tasks/${task._id}`, {
                status: newStatus,
                progressPercentage: pct,
                subTasks: updatedSubTasks
            });
            onSave(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update checklist item.');
        }
    };

    const handleAiSummary = async () => {
        setSummarizingAi(true);
        setError('');
        try {
            const { data } = await api.get(`/tasks/${task._id}/ai-summary`);
            setAiSummaryText(data.summary);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate progress summary.');
        } finally {
            setSummarizingAi(false);
        }
    };

    const handleEnhanceTone = async () => {
        if (!newMessage.trim()) return;
        setEnhancingTone(true);
        setError('');
        try {
            const { data } = await api.post('/messages/enhance-tone', { message: newMessage.trim() });
            setNewMessage(data.enhancedMessage || newMessage);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enhance tone.');
        } finally {
            setEnhancingTone(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-4 max-h-[85vh]">
                {/* Left Panel: Task Settings */}
                <div className="w-full md:w-5/12 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white text-lg">Update Task</h2>
                            <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all md:hidden">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-2.5 mb-2">
                            <span className="text-orange-400 font-bold text-base truncate">{task.title}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                task.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                task.priority === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                                {task.priority}
                            </span>
                        </div>
                        
                        <p className="text-xs text-slate-400 mb-5">
                            Assigned by: <span className="text-white font-semibold">{task.admin?.name || 'Admin'}</span>
                        </p>

                        {task.description && (
                            <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 mb-5 max-h-40 overflow-y-auto">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Description</p>
                                <p className="text-xs text-slate-300 leading-relaxed break-words">{task.description}</p>
                            </div>
                        )}

                        {/* Checklist Section */}
                        {subTasks.length > 0 && (
                            <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-3.5 mb-5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Task Checklist</label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {subTasks.map((st, idx) => (
                                        <div key={st._id || idx} className="flex items-start space-x-2.5 py-1">
                                            <input
                                                type="checkbox"
                                                checked={st.isCompleted}
                                                onChange={(e) => handleSubTaskToggle(idx, e.target.checked)}
                                                className="accent-orange-500 cursor-pointer mt-0.5 flex-shrink-0"
                                            />
                                            <span className={`text-xs leading-tight ${st.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                {st.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-5">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">{error}</div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        const s = e.target.value;
                                        setStatus(s);
                                        const p = s === 'completed' ? 100 : progress;
                                        if (s === 'completed') setProgress(100);
                                        handleStatusOrProgressChange(s, p);
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Progress */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Progress — <span className="text-orange-500 font-bold">{progress}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                    onMouseUp={() => handleStatusOrProgressChange(status, progress)}
                                    onTouchEnd={() => handleStatusOrProgressChange(status, progress)}
                                    className="w-full accent-orange-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>0%</span><span>50%</span><span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 md:mt-0 pt-6 border-t border-slate-800">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all font-medium text-sm cursor-pointer"
                        >
                            Done / Close
                        </button>
                    </div>
                </div>

                {/* Right Panel: Updates Chat Section */}
                <div className="w-full md:w-7/12 flex flex-col bg-slate-950/40 h-[50vh] md:h-auto">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                                Chat with {task.admin?.name || 'Admin'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={handleAiSummary}
                                disabled={summarizingAi}
                                className="text-[10px] flex items-center space-x-1 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-black disabled:opacity-50 transition-all font-bold cursor-pointer"
                            >
                                {summarizingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                <span>AI Summary</span>
                            </button>
                            <button onClick={onClose} className="hidden md:block p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages list */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] md:min-h-0">
                        {aiSummaryText && (
                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-slate-200 mb-4 animate-fade-in relative font-sans">
                                <p className="font-bold text-orange-400 mb-1 flex items-center space-x-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI Progress Summary</span>
                                </p>
                                <p className="leading-relaxed">{aiSummaryText}</p>
                                <button onClick={() => setAiSummaryText('')} className="absolute top-2 right-2 text-slate-500 hover:text-slate-300">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {updates.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                <MessageSquare className="w-8 h-8 mb-2 opacity-50 text-orange-500" />
                                <p className="text-xs font-semibold">No updates submitted yet.</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Send a message below to log your work update.</p>
                            </div>
                        ) : (
                            updates.map((upd, idx) => {
                                const isMe = upd.sender?._id === user?._id || upd.sender === user?._id;
                                return (
                                    <div key={upd._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                            isMe 
                                                ? 'bg-orange-500 text-black rounded-tr-none font-medium' 
                                                : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/60'
                                        }`}>
                                            <p className="leading-relaxed break-words">{upd.message}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {!isMe && <span className="font-bold mr-1 text-slate-300">{upd.sender?.name || 'User'} ({upd.sender?.role || 'employee'}) · </span>}
                                            {new Date(upd.createdAt).toLocaleString('en-IN', {
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

                    {/* Chat Input form */}
                    <form onSubmit={handleSendUpdate} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a work update message..."
                            disabled={saving}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                        />
                        {newMessage.trim() && (
                            <button
                                type="button"
                                onClick={handleEnhanceTone}
                                disabled={enhancingTone}
                                className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-black transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                                title="AI Enhance Tone"
                            >
                                {enhancingTone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving || !newMessage.trim()}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ── Employee Dashboard ────────────────────────────────────────────────────────

const EmployeeDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/tasks/dashboard-stats');
            if (data && data.totalEmployees !== undefined) {
                // Mismatch: received admin stats but user is employee. Force reload to sync.
                window.location.reload();
                return;
            }
            setStats(data);
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleSave = (updatedTask) => {
        setStats(prev => {
            const updatedTasks = prev.myTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
            return {
                ...prev,
                myTasks: updatedTasks,
                totalAssigned: updatedTasks.length,
                myCompleted: updatedTasks.filter(t => t.status === 'completed').length,
                myPending: updatedTasks.filter(t => t.status === 'pending').length,
                myInProgress: updatedTasks.filter(t => t.status === 'in-progress').length
            };
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
    );

    if (error) return (
        <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6">
                <p className="text-orange-400 text-sm font-medium uppercase tracking-wider">Welcome back</p>
                <h1 className="text-2xl font-bold text-white mt-1">{user?.name} 👋</h1>
                <p className="text-slate-400 text-sm mt-1">Here's an overview of your assigned tasks.</p>
            </div>

            {/* My Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={ClipboardList} label="Total Assigned" value={stats?.totalAssigned} color="bg-orange-500/10 text-orange-400" />
                <StatCard icon={CheckCircle2} label="Completed" value={stats?.myCompleted} color="bg-emerald-500/10 text-emerald-400" />
                <StatCard icon={TrendingUp} label="In Progress" value={stats?.myInProgress} color="bg-blue-500/10 text-blue-400" />
                <StatCard icon={Clock} label="Pending" value={stats?.myPending} color="bg-yellow-500/10 text-yellow-400" />
            </div>

            {/* My Tasks */}
            <div>
                <h2 className="font-semibold text-white mb-4">My Assigned Tasks</h2>
                <div className="space-y-3">
                    {stats?.myTasks?.length > 0 ? stats.myTasks.map(task => (
                        <div
                            key={task._id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <h3 className="font-semibold text-white">{task.title}</h3>
                                        <PriorityBadge priority={task.priority} />
                                    </div>
                                    {task.description && (
                                        <p className="text-slate-400 text-sm mb-3 leading-relaxed">{task.description}</p>
                                    )}
                                    <div className="mb-3">
                                        <ProgressBar value={task.progressPercentage} />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <StatusBadge status={task.status} />
                                        <span className="text-xs text-slate-500">Updated {formatDate(task.updatedAt)}</span>
                                    </div>
                                    {task.workUpdateMessage && (
                                        <div className="mt-3 p-3 bg-slate-800/60 rounded-xl">
                                            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Your last update</p>
                                            <p className="text-slate-300 text-sm">{task.workUpdateMessage}</p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedTask(task)}
                                    className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-sm font-medium transition-all flex-shrink-0 cursor-pointer"
                                >
                                    <span>Update</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                            <ClipboardList className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500">No tasks assigned yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Update Modal */}
            {selectedTask && (
                <UpdateModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// ── Main Export ───────────────────────────────────────────────────────────────

const Dashboard = () => {
    const { user } = useAuth();
    return user?.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard user={user} />;
};

export default Dashboard;
