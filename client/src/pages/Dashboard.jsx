import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Briefcase, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    TrendingUp,
    Plus,
    Loader2,
    Users
} from 'lucide-react';
import api from '../api/axios';
import TaskModal from '../components/TaskModal';

const StatCard = ({ icon: Icon, label, value, color, delay, loading }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <TrendingUp className="w-4 h-4 text-slate-500" />
        </div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        {loading ? (
            <div className="w-12 h-7 bg-slate-800 animate-pulse rounded-lg mt-1" />
        ) : (
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        )}
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, projectsRes] = await Promise.all([
                    api.get('/tasks/dashboard-stats'),
                    api.get('/projects')
                ]);
                setStats(statsRes.data);
                setProjects(projectsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTaskCreated = (newTask) => {
        // Refresh stats after task creation
        api.get('/tasks/dashboard-stats').then(res => setStats(res.data));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with your projects.</p>
                </div>
                <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard 
                    icon={Briefcase} 
                    label="Active Projects" 
                    value={stats?.totalProjects ?? 0}
                    color="bg-blue-500" 
                    delay={0.1}
                    loading={loading}
                />
                <StatCard 
                    icon={CheckCircle2} 
                    label="Completed Tasks" 
                    value={stats?.completedTasks ?? 0}
                    color="bg-emerald-500" 
                    delay={0.2}
                    loading={loading}
                />
                <StatCard 
                    icon={Clock} 
                    label="Pending Tasks" 
                    value={stats?.pendingTasks ?? 0}
                    color="bg-amber-500" 
                    delay={0.3}
                    loading={loading}
                />
                <StatCard 
                    icon={AlertCircle} 
                    label="Overdue" 
                    value={stats?.overdueTasks ?? 0}
                    color="bg-rose-500" 
                    delay={0.4}
                    loading={loading}
                />
                <StatCard 
                    icon={Users} 
                    label="Team Members" 
                    value={stats?.memberCount ?? 1}
                    color="bg-purple-500" 
                    delay={0.5}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-start space-x-4 animate-pulse">
                                    <div className="w-8 h-8 rounded-full bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                                        <div className="h-2 bg-slate-800 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : stats?.recentTasks?.length > 0 ? (
                        <div className="space-y-5">
                            {stats.recentTasks.map((task) => (
                                <div key={task._id} className="flex items-start space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-primary-500 flex-shrink-0">
                                        {task.assignedTo?.name?.charAt(0) || task.project?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-300">
                                            <span className="font-semibold text-white">{task.title}</span>
                                            {' '} in {' '}
                                            <span className="text-primary-500 font-medium">{task.project?.name}</span>
                                            {' '} — {' '}
                                            <span className={
                                                task.status === 'completed' ? 'text-emerald-500' :
                                                task.status === 'in-progress' ? 'text-amber-500' :
                                                'text-slate-400'
                                            }>{task.status.replace('-', ' ')}</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{formatDate(task.updatedAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic">No recent activity yet. Create your first task!</p>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Upcoming Deadlines</h3>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 animate-pulse h-14" />
                            ))}
                        </div>
                    ) : stats?.upcomingTasks?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.upcomingTasks.map((task) => (
                                <div key={task._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            task.priority === 'high' ? 'bg-rose-500' :
                                            task.priority === 'medium' ? 'bg-amber-500' :
                                            'bg-blue-500'
                                        }`} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                                            <p className="text-xs text-slate-500">{task.project?.name}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{formatDate(task.dueDate)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm italic">No upcoming deadlines. You're all caught up! 🎉</p>
                    )}
                </div>
            </div>

            {/* Task Creation Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onTaskCreated={handleTaskCreated}
                projects={projects}
            />
        </div>
    );
};

export default Dashboard;
