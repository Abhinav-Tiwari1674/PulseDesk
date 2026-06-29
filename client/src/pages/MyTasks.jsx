import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckSquare, 
    Clock, 
    AlertCircle,
    Folder,
    Plus,
    Filter,
    Trash2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

const statusConfig = {
    'todo': { label: 'To Do', color: 'bg-slate-500/10 text-slate-400' },
    'in-progress': { label: 'In Progress', color: 'bg-amber-500/10 text-amber-400' },
    'review': { label: 'Review', color: 'bg-blue-500/10 text-blue-400' },
    'completed': { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400' },
};

const priorityConfig = {
    'high': { label: 'High', color: 'text-rose-500 bg-rose-500/10' },
    'medium': { label: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
    'low': { label: 'Low', color: 'text-blue-500 bg-blue-500/10' },
};

const MyTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const projectsRes = await api.get('/projects');
            setProjects(projectsRes.data);

            // Fetch tasks from all user projects
            const taskPromises = projectsRes.data.map(p => 
                api.get(`/tasks/project/${p._id}`)
            );
            const taskResults = await Promise.all(taskPromises);
            const allTasks = taskResults.flatMap(r => r.data);
            
            // Filter for tasks assigned to current user or created by them (show all for now)
            setTasks(allTasks);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskCreated = (newTask) => {
        setTasks(prev => [newTask, ...prev]);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
        } catch (err) {
            console.error('Failed to update task status');
            fetchData();
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            alert('Failed to delete task.');
        }
    };

    const filteredTasks = tasks.filter(t => {
        const statusMatch = filterStatus === 'all' || t.status === filterStatus;
        const priorityMatch = filterPriority === 'all' || t.priority === filterPriority;
        return statusMatch && priorityMatch;
    });

    const tasksByStatus = {
        todo: filteredTasks.filter(t => t.status === 'todo').length,
        'in-progress': filteredTasks.filter(t => t.status === 'in-progress').length,
        review: filteredTasks.filter(t => t.status === 'review').length,
        completed: filteredTasks.filter(t => t.status === 'completed').length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Tasks</h1>
                    <p className="text-slate-400 mt-1">
                        {tasks.length} task{tasks.length !== 1 ? 's' : ''} across all projects
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Task</span>
                </button>
            </div>

            {/* Summary Pills */}
            <div className="flex flex-wrap gap-3">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                    <div key={key} className={`px-4 py-2 rounded-xl text-sm font-medium ${cfg.color} border border-current/10`}>
                        {cfg.label}: <span className="font-bold">{tasksByStatus[key] || 0}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-slate-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                {(filterStatus !== 'all' || filterPriority !== 'all') && (
                    <button
                        onClick={() => { setFilterStatus('all'); setFilterPriority('all'); }}
                        className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Task List */}
            {loading ? (
                <div className="space-y-3">
                    {[1,2,3,4,5].map(i => (
                        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-20 animate-pulse" />
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                    <CheckSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">
                        {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                    </h3>
                    <p className="text-slate-500 mt-2">
                        {tasks.length === 0 
                            ? 'Create a task from a project to see it here.' 
                            : 'Try different filter settings.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredTasks.map((task, index) => (
                            <motion.div
                                key={task._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Left: title + meta */}
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <button
                                            onClick={() => handleStatusChange(task._id, task.status === 'completed' ? 'todo' : 'completed')}
                                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                                task.status === 'completed' 
                                                    ? 'border-emerald-500 bg-emerald-500' 
                                                    : 'border-slate-600 hover:border-emerald-500'
                                            }`}
                                        >
                                            {task.status === 'completed' && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>

                                        <div className="min-w-0">
                                            <p className={`font-semibold text-sm truncate transition-all ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                {task.title}
                                            </p>
                                            <div className="flex items-center space-x-2 mt-1 flex-wrap gap-y-1">
                                                {task.project?.name && (
                                                    <span className="flex items-center text-xs text-slate-500">
                                                        <Folder className="w-3 h-3 mr-1" />
                                                        {typeof task.project === 'object' ? task.project.name : projects.find(p => p._id === task.project)?.name || 'Project'}
                                                    </span>
                                                )}
                                                {task.dueDate && (
                                                    <span className={`flex items-center text-xs ${
                                                        new Date(task.dueDate) < new Date() && task.status !== 'completed'
                                                            ? 'text-rose-500' : 'text-slate-500'
                                                    }`}>
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: priority, status, delete */}
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hidden sm:block ${priorityConfig[task.priority]?.color}`}>
                                            {task.priority}
                                        </span>
                                        <select
                                            value={task.status}
                                            onChange={e => handleStatusChange(task._id, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                            className={`text-[11px] font-semibold rounded-lg border-0 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer ${statusConfig[task.status]?.color}`}
                                        >
                                            {Object.entries(statusConfig).map(([val, cfg]) => (
                                                <option key={val} value={val} className="bg-slate-800 text-white">
                                                    {cfg.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDelete(task._id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onTaskCreated={handleTaskCreated}
                projects={projects}
            />
        </div>
    );
};

export default MyTasks;
