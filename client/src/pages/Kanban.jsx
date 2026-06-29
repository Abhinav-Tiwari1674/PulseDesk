import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    DndContext, 
    closestCorners, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors,
} from '@dnd-kit/core';
import { 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TeamSelect from '../components/TeamSelect';
import { X, Users } from 'lucide-react';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', title: 'Review', color: 'bg-blue-500' },
    { id: 'completed', title: 'Completed', color: 'bg-emerald-500' }
];

const Kanban = () => {
    const { id: projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('todo');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, tasksRes] = await Promise.all([
                    api.get(`/projects/${projectId}`),
                    api.get(`/tasks/project/${projectId}`)
                ]);
                setProject(projRes.data);
                setTasks(tasksRes.data);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find(t => t._id === active.id);
        const overId = over.id;

        const newStatus = COLUMNS.find(c => c.id === overId)?.id || 
                          tasks.find(t => t._id === overId)?.status;

        if (activeTask && newStatus && activeTask.status !== newStatus) {
            const updatedTasks = tasks.map(t => 
                t._id === active.id ? { ...t, status: newStatus } : t
            );
            setTasks(updatedTasks);

            try {
                await api.patch(`/tasks/${active.id}/status`, { status: newStatus });
            } catch (error) {
                console.error('Failed to update status');
                setTasks(tasks);
            }
        }
    };

    const handleAddTask = (columnId) => {
        setDefaultStatus(columnId);
        setIsTaskModalOpen(true);
    };

    const handleTaskCreated = (newTask) => {
        setTasks(prev => [newTask, ...prev]);
    };

    const handleTaskDeleted = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch (err) {
            console.error('Failed to delete task');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading your board...</p>
            </div>
        </div>
    );

    if (!project) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Project not found or you don't have access.</p>
        </div>
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{project?.name}</h1>
                    <p className="text-slate-400 text-sm mt-1">{project?.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                        {project?.team?.map((member, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-primary-500" title={member.name}>
                                {member.name?.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsTeamModalOpen(true)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all mr-2"
                        title="Manage Team"
                    >
                        <Users className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleAddTask('todo')}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex space-x-5 h-full min-w-max">
                        {COLUMNS.map(column => {
                            const columnTasks = tasks.filter(t => t.status === column.id);
                            return (
                                <div key={column.id} className="w-80 flex flex-col">
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{column.title}</h3>
                                            <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                {columnTasks.length}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleAddTask(column.id)}
                                            className="text-slate-600 hover:text-slate-300 transition-all p-1 hover:bg-slate-800 rounded-lg"
                                            title="Add task to this column"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Drop Zone */}
                                    <div className="flex-1 bg-slate-900/40 rounded-2xl p-2 border border-slate-800/50 flex flex-col space-y-3 min-h-[500px]"
                                         id={column.id}>
                                        <SortableContext 
                                            id={column.id}
                                            items={columnTasks.map(t => t._id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {columnTasks.map(task => (
                                                <TaskCard 
                                                    key={task._id} 
                                                    task={task} 
                                                    onDelete={handleTaskDeleted}
                                                />
                                            ))}
                                        </SortableContext>
                                        
                                        {columnTasks.length === 0 && (
                                            <div className="flex-1 flex items-center justify-center">
                                                <p className="text-slate-700 text-xs font-medium">Drop tasks here</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => handleAddTask(column.id)}
                                            className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-primary-500/50 hover:text-primary-500 transition-all text-sm mt-auto"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Add Task</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DndContext>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onTaskCreated={handleTaskCreated}
                projectId={projectId}
                defaultStatus={defaultStatus}
                team={project?.team || []}
            />

            {/* Team Management Modal */}
            <AnimatePresence>
                {isTeamModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTeamModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center border border-primary-500/20">
                                        <Users className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Manage Team</h2>
                                        <p className="text-xs text-slate-400">Add or remove project members</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsTeamModalOpen(false)}
                                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <TeamSelect project={project} onUpdate={(updatedProj) => setProject(updatedProj)} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Kanban;
