import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onDelete }) => {
    const [showDelete, setShowDelete] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    const priorityColors = {
        high: 'text-rose-500 bg-rose-500/10',
        medium: 'text-amber-500 bg-amber-500/10',
        low: 'text-blue-500 bg-blue-500/10'
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (onDelete) {
            if (window.confirm('Delete this task?')) {
                onDelete(task._id);
            }
        }
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="bg-slate-800 border border-slate-700/50 p-4 rounded-2xl shadow-sm hover:border-slate-600 transition-all group relative"
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.priority] || priorityColors.medium}`}>
                    {task.priority}
                </div>
                <div className="flex items-center space-x-1">
                    {showDelete && onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1 text-slate-600 hover:text-rose-500 transition-all rounded"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-600 hover:text-slate-400">
                        <GripVertical className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <h4 className="text-sm font-semibold text-white mb-2 leading-tight">{task.title}</h4>
            {task.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{task.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <div className="flex items-center text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                </div>
                <div 
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                        task.assignedTo 
                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-500 shadow-[0_0_10px_rgba(79,70,229,0.1)]' 
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                    title={task.assignedTo?.name || 'Unassigned'}
                >
                    {task.assignedTo?.name?.charAt(0) || '?'}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
