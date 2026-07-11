import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    assignedEmployee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned employee is required']
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Admin reference is required']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    progressPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    workUpdateMessage: {
        type: String,
        default: ''
    },
    updates: [{
        message: { type: String, required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    subTasks: [{
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false }
    }],
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
