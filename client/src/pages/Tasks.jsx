import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import {
    Plus, Search, Pencil, Trash2, X, Filter,
    Loader2, CheckCircle2, AlertCircle, ClipboardList,
    ChevronDown, MessageSquare, Sparkles
} from 'lucide-react';

// ── Shared ────────────────────────────────────────────────────────────────────

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
        <div className="flex-1 bg-slate-800 rounded-full h-1.5 min-w-16">
            <div
                className="bg-orange-500 h-1.5 rounded-full transition-all"
                style={{ width: `${value || 0}%` }}
            />
        </div>
        <span className="text-xs text-slate-400 w-8 text-right flex-shrink-0">{value || 0}%</span>
    </div>
);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border ${
        type === 'error'
            ? 'bg-slate-900 border-red-500/30'
            : 'bg-slate-900 border-emerald-500/30'
    }`}>
        {type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
        <span className="text-sm font-medium text-slate-200">{message}</span>
    </div>
);

// ── Task Modal ────────────────────────────────────────────────────────────────

const TaskModal = ({ task, employees, onClose, onSave }) => {
    const isEdit = Boolean(task);
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [assignedEmployee, setAssignedEmployee] = useState(task?.assignedEmployee?._id || task?.assignedEmployee || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [status, setStatus] = useState(task?.status || 'pending');
    const [progressPercentage, setProgressPercentage] = useState(task?.progressPercentage || 0);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Chat & Checklist states
    const [newMessage, setNewMessage] = useState('');
    const [updates, setUpdates] = useState(task?.updates || []);
    const [subTasks, setSubTasks] = useState(task?.subTasks || []);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [generatingAi, setGeneratingAi] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isEdit) scrollToBottom();
    }, [updates]);

    // Poll task details every 4 seconds when modal is open
    useEffect(() => {
        if (!isEdit) return;
        const fetchTaskDetails = async () => {
            try {
                const { data } = await api.get(`/tasks/${task._id}`);
                setUpdates(data.updates || []);
                setSubTasks(data.subTasks || []);
            } catch (err) {
                // Fail silently on background polling
            }
        };

        fetchTaskDetails(); // fetch immediately
        const poll = setInterval(fetchTaskDetails, 4000);
        return () => clearInterval(poll);
    }, [task?._id, isEdit]);

    const handleSendAdminMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSaving(true);
        setError('');
        try {
            const { data } = await api.put(`/tasks/${task._id}`, {
                title,
                description,
                assignedEmployee,
                priority,
                status,
                progressPercentage,
                subTasks,
                workUpdateMessage: newMessage.trim()
            });
            setUpdates(data.updates || []);
            setNewMessage('');
            onSave(data, true); // update local tasks list
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message.');
        } finally {
            setSaving(false);
        }
    };

    const [summarizingAi, setSummarizingAi] = useState(false);
    const [aiSummaryText, setAiSummaryText] = useState('');
    const [enhancingTone, setEnhancingTone] = useState(false);

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

    const handleAiGenerate = async () => {
        if (!title.trim()) return;
        setGeneratingAi(true);
        setError('');
        try {
            const { data } = await api.post('/tasks/ai-generate', { title: title.trim() });
            setDescription(data.description || '');
            setSubTasks(data.subTasks || []);
            // Auto progress calculation for newly generated checklist
            if (data.subTasks && data.subTasks.length > 0) {
                setProgressPercentage(0);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate task details using AI.');
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!title.trim()) { setError('Task title is required.'); return; }
        if (!assignedEmployee) { setError('Please assign this task to an employee.'); return; }
        setSaving(true);
        setError('');
        try {
            let data;
            if (isEdit) {
                const res = await api.put(`/tasks/${task._id}`, {
                    title,
                    description,
                    assignedEmployee,
                    priority,
                    status,
                    progressPercentage,
                    subTasks
                });
                data = res.data;
            } else {
                const res = await api.post('/tasks', {
                    title,
                    description,
                    assignedEmployee,
                    priority,
                    status,
                    progressPercentage,
                    subTasks
                });
                data = res.data;
            }
            onSave(data, isEdit);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save task settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden my-4 max-h-[85vh] ${isEdit ? 'max-w-4xl' : 'max-w-lg'}`}>
                {/* Left Panel: Settings Form */}
                <div className={`p-6 flex flex-col justify-between overflow-y-auto ${isEdit ? 'w-full md:w-5/12 border-b md:border-b-0 md:border-r border-slate-800' : 'w-full'}`}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-white text-lg">{isEdit ? 'Edit Task' : 'Create Task'}</h2>
                            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">{error}</div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-slate-300">Task Title *</label>
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={generatingAi || !title.trim()}
                                    className="text-[10px] flex items-center space-x-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-black disabled:opacity-50 transition-all font-bold cursor-pointer"
                                >
                                    {generatingAi ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3 h-3" />
                                            <span>AI Autocomplete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                                placeholder="e.g. Design Payment UI..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none text-sm"
                                placeholder="Optional additional details..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Assign To *</label>
                            <select
                                value={assignedEmployee}
                                onChange={(e) => setAssignedEmployee(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                            >
                                <option value="">— Select Employee —</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.email}){!emp.isJoined ? ' - [Pending]' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        const s = e.target.value;
                                        setStatus(s);
                                        if (s === 'completed') setProgressPercentage(100);
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        {/* Checklist Manager */}
                        <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-3.5 mt-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Checklist / Sub-tasks</label>
                            
                            <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                                {subTasks.length === 0 ? (
                                    <p className="text-[11px] text-slate-500 italic">No steps added. Type one below or use AI Autocomplete above.</p>
                                ) : (
                                    subTasks.map((st, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                                            <div className="flex items-center space-x-2 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={st.isCompleted}
                                                    onChange={(e) => {
                                                        const updated = [...subTasks];
                                                        updated[idx].isCompleted = e.target.checked;
                                                        setSubTasks(updated);
                                                        
                                                        // Auto progress calculation
                                                        const completed = updated.filter(x => x.isCompleted).length;
                                                        const pct = Math.round((completed / updated.length) * 100);
                                                        setProgressPercentage(pct);
                                                    }}
                                                    className="accent-orange-500 cursor-pointer flex-shrink-0"
                                                />
                                                <span className={`text-xs truncate ${st.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                                    {st.title}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = subTasks.filter((_, i) => i !== idx);
                                                    setSubTasks(updated);
                                                    if (updated.length > 0) {
                                                        const completed = updated.filter(x => x.isCompleted).length;
                                                        setProgressPercentage(Math.round((completed / updated.length) * 100));
                                                    } else {
                                                        setProgressPercentage(0);
                                                    }
                                                }}
                                                className="text-slate-500 hover:text-red-400 transition-all cursor-pointer ml-2 flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newSubTaskTitle}
                                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    placeholder="Add manual checklist step..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!newSubTaskTitle.trim()) return;
                                        const updated = [...subTasks, { title: newSubTaskTitle.trim(), isCompleted: false }];
                                        setSubTasks(updated);
                                        setNewSubTaskTitle('');
                                        const completed = updated.filter(x => x.isCompleted).length;
                                        setProgressPercentage(Math.round((completed / updated.length) * 100));
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Progress — <span className="text-orange-500 font-bold">{progressPercentage}%</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={progressPercentage}
                                onChange={(e) => setProgressPercentage(Number(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800 flex space-x-3">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all font-medium text-sm cursor-pointer">
                            Cancel
                        </button>
                        <button onClick={handleSaveSettings} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-black font-bold transition-all flex items-center justify-center text-sm cursor-pointer">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Settings' : 'Create Task'}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Updates Chat Section (Only shown when editing) */}
                {isEdit && (
                    <div className="w-full md:w-7/12 flex flex-col bg-slate-950/40 h-[50vh] md:h-auto font-sans">
                        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider truncate">
                                    Chat with {task.assignedEmployee?.name || 'Employee'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAiSummary}
                                disabled={summarizingAi}
                                className="text-[10px] flex items-center space-x-1 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-black disabled:opacity-50 transition-all font-bold cursor-pointer"
                            >
                                {summarizingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                <span>AI Summary</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] md:min-h-0">
                            {aiSummaryText && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-xs text-slate-200 mb-4 animate-fade-in relative">
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
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-600">
                                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-xs">No updates submitted by employee yet.</p>
                                    <p className="text-[10px] mt-0.5">Send a message below to message the employee.</p>
                                </div>
                            ) : (
                                updates.map((upd, idx) => {
                                    const isMe = upd.sender?.role === 'admin';
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
                                                {!isMe && <span className="font-bold mr-1 text-slate-300">{upd.sender?.name || 'Employee'} ({upd.sender?.role || 'employee'}) · </span>}
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

                        <form onSubmit={handleSendAdminMessage} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message to employee..."
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
                )}
            </div>
        </div>
    );
};

// ── Delete Confirm ────────────────────────────────────────────────────────────

const DeleteConfirm = ({ task, onClose, onConfirm, deleting }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="font-bold text-white text-lg mb-2">Delete Task</h2>
            <p className="text-slate-400 text-sm mb-6">Delete <span className="text-white font-semibold">"{task?.title}"</span>? This cannot be undone.</p>
            <div className="flex space-x-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all font-medium cursor-pointer">Cancel</button>
                <button onClick={onConfirm} disabled={deleting} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold transition-all flex items-center justify-center cursor-pointer">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch employees once for the dropdown
    useEffect(() => {
        api.get('/auth/employees').then(r => setEmployees(r.data)).catch(() => {});
    }, []);

    const fetchTasks = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (filterStatus) params.append('status', filterStatus);
            if (filterPriority) params.append('priority', filterPriority);
            if (filterEmployee) params.append('employee', filterEmployee);
            const { data } = await api.get(`/tasks?${params.toString()}`);
            setTasks(data);
        } catch {
            showToast('Failed to load tasks.', 'error');
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus, filterPriority, filterEmployee]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchTasks(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchTasks]);

    const handleSave = (saved, isEdit) => {
        if (isEdit) {
            setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
            showToast('Task updated.');
        } else {
            setTasks(prev => [saved, ...prev]);
            showToast('Task created.');
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/tasks/${deleteTarget._id}`);
            setTasks(prev => prev.filter(t => t._id !== deleteTarget._id));
            showToast('Task deleted.');
            setDeleteTarget(null);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-slate-500 text-sm mt-1">Assign and manage all employee tasks.</p>
                </div>
                <button
                    onClick={() => { setEditTask(null); setShowModal(true); }}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl transition-all cursor-pointer flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm w-52"
                    />
                </div>

                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 pr-8 text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm appearance-none"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 pr-8 text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm appearance-none"
                    >
                        <option value="">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 pr-8 text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm appearance-none"
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>

                {(filterStatus || filterPriority || filterEmployee || search) && (
                    <button
                        onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); setFilterEmployee(''); }}
                        className="text-sm text-slate-400 hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" />
                        <span>Clear</span>
                    </button>
                )}
            </div>

            {/* Task List */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                    <ClipboardList className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500">No tasks found. Create the first one!</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Task</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Assigned To</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Priority</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Status</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Progress</th>
                                        <th className="text-left text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Updated</th>
                                        <th className="text-right text-xs text-slate-500 font-semibold uppercase tracking-wider px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {tasks.map(task => (
                                        <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{task.title}</p>
                                                {task.description && (
                                                    <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{task.description}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs flex-shrink-0">
                                                        {task.assignedEmployee?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-slate-300">{task.assignedEmployee?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <PriorityBadge priority={task.priority} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={task.status} />
                                            </td>
                                            <td className="px-6 py-4 w-36">
                                                <ProgressBar value={task.progressPercentage} />
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {formatDateTime(task.updatedAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => { setEditTask(task); setShowModal(true); }}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(task)}
                                                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile/Tablet Card View */}
                    <div className="block md:hidden space-y-4">
                        {tasks.map(task => (
                            <div key={task._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                                <div>
                                    <p className="font-bold text-white text-base">{task.title}</p>
                                    {task.description && (
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs border-t border-slate-800/60 pt-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-[10px]">
                                            {task.assignedEmployee?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-slate-300 font-medium">{task.assignedEmployee?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <PriorityBadge priority={task.priority} />
                                        <StatusBadge status={task.status} />
                                    </div>
                                </div>

                                <div className="border-t border-slate-800/60 pt-3 space-y-1.5">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-semibold">Progress</span>
                                        <span className="text-orange-500 font-bold">{task.progressPercentage}%</span>
                                    </div>
                                    <ProgressBar value={task.progressPercentage} />
                                </div>

                                <div className="border-t border-slate-800/60 pt-3 flex gap-3">
                                    <button
                                        onClick={() => { setEditTask(task); setShowModal(true); }}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(task)}
                                        className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Modals */}
            {showModal && (
                <TaskModal
                    task={editTask}
                    employees={employees}
                    onClose={() => { setShowModal(false); setEditTask(null); }}
                    onSave={handleSave}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    task={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onConfirm={handleDelete}
                    deleting={deleting}
                />
            )}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
};

export default Tasks;
