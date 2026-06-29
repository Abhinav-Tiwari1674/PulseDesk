import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Folder, MoreVertical, Calendar, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    // Close menu on outside click
    useEffect(() => {
        const handler = () => setOpenMenuId(null);
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, []);

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            console.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectCreated = (newProject) => {
        setProjects(prev => [newProject, ...prev]);
    };

    const handleDelete = async (projectId, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
        
        setDeletingId(projectId);
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete project.');
        } finally {
            setDeletingId(null);
            setOpenMenuId(null);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const priorityConfig = {
        high: 'bg-rose-500/10 text-rose-500',
        medium: 'bg-amber-500/10 text-amber-500',
        low: 'bg-blue-500/10 text-blue-500'
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projects</h1>
                    <p className="text-slate-400 mt-1">
                        {projects.length > 0 ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : 'Manage and track your active projects.'}
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 p-2 rounded-2xl max-w-md">
                <Search className="w-5 h-5 text-slate-500 ml-2" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 text-white w-full py-2 placeholder-slate-500"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white pr-2">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-pulse h-52" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                    <Folder className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">
                        {searchQuery ? 'No projects match your search' : 'No projects found'}
                    </h3>
                    <p className="text-slate-500 mt-2">
                        {searchQuery ? 'Try a different search term.' : 'Create your first project to get started.'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all inline-flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Project</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                            >
                                <Link to={`/projects/${project._id}`} className="block h-full">
                                    <div className={`bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-primary-500/50 transition-all group h-full ${deletingId === project._id ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                                                <Folder className="w-6 h-6 text-primary-500" />
                                            </div>
                                            {/* Context menu */}
                                            <div className="relative" onClick={e => e.preventDefault()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === project._id ? null : project._id);
                                                    }}
                                                    className="p-2 text-slate-500 hover:text-white transition-all rounded-lg hover:bg-slate-800"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                <AnimatePresence>
                                                    {openMenuId === project._id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                            className="absolute right-0 top-10 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={(e) => handleDelete(project._id, e)}
                                                                className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-rose-400 hover:bg-slate-700 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span>Delete</span>
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white group-hover:text-primary-500 transition-colors uppercase tracking-tight">{project.name}</h3>
                                        <p className="text-slate-400 mt-2 text-sm line-clamp-2">{project.description}</p>

                                        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center text-slate-500 text-xs font-medium uppercase tracking-widest">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}</span>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${priorityConfig[project.priority] || priorityConfig.medium}`}>
                                                {project.priority}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
        </div>
    );
};

export default Projects;
