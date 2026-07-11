import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendTaskAssignmentEmail, sendTaskCompletionEmail } from '../utils/sendEmail.js';
import { generateTaskBreakdown, summarizeTaskProgress } from '../services/aiService.js';

// @desc    Get tasks (Admin gets all, Employee gets only their own)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    try {
        const { status, priority, employee, search } = req.query;
        let query = {};

        if (req.user.role === 'employee') {
            // Employees can only see their own tasks
            query.assignedEmployee = req.user._id;
        } else {
            // Admin only sees their own workspace tasks
            query.admin = req.user._id;
            // Admin can filter by employee
            if (employee) query.assignedEmployee = employee;
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const tasks = await Task.find(query)
            .populate('assignedEmployee', 'name email')
            .populate('updates.sender', 'name role email')
            .sort({ updatedAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin only)
export const createTask = async (req, res) => {
    try {
        const { title, description, assignedEmployee, priority, status, progressPercentage, subTasks } = req.body;

        if (!title || !assignedEmployee) {
            return res.status(400).json({ message: 'Title and assigned employee are required' });
        }

        // Verify the assignedEmployee exists and is an employee
        const employee = await User.findById(assignedEmployee);
        if (!employee || employee.role !== 'employee') {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }
        if (employee.admin && employee.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. This employee is not in your workspace.' });
        }

        const task = await Task.create({
            title,
            description,
            assignedEmployee,
            admin: req.user._id,
            priority: priority || 'medium',
            status: status || 'pending',
            progressPercentage: progressPercentage || 0,
            subTasks: subTasks || []
        });

        // Trigger background email alert
        try {
            sendTaskAssignmentEmail({
                to: employee.email,
                employeeName: employee.name,
                taskTitle: title,
                adminName: req.user.name
            });
        } catch (err) {
            console.error('Failed to send task assignment email:', err);
        }

        const populated = await task.populate([
            { path: 'assignedEmployee', select: 'name email' },
            { path: 'updates.sender', select: 'name role email' }
        ]);
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Admin: full update; Employee: only status, progress, workUpdateMessage)
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const wasCompletedBefore = task.status === 'completed';

        if (req.user.role === 'employee') {
            // Employees can only update their own assigned tasks
            const assignedEmployeeId = task.assignedEmployee?._id
                ? task.assignedEmployee._id.toString()
                : task.assignedEmployee?.toString();

            if (assignedEmployeeId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied. This task is not assigned to you.' });
            }

            const { status, progressPercentage, workUpdateMessage, subTasks } = req.body;

            if (subTasks !== undefined) {
                task.subTasks = subTasks;
                if (subTasks.length > 0) {
                    const completedCount = subTasks.filter(st => st.isCompleted).length;
                    task.progressPercentage = Math.round((completedCount / subTasks.length) * 100);
                } else {
                    task.progressPercentage = 0;
                }

                if (task.progressPercentage === 100) {
                    task.status = 'completed';
                    task.completedAt = new Date();
                } else {
                    task.status = 'in-progress';
                    task.completedAt = null;
                }
            } else {
                if (status !== undefined) {
                    task.status = status;
                    if (status === 'completed') {
                        task.completedAt = new Date();
                        task.progressPercentage = 100;
                    } else {
                        task.completedAt = null;
                    }
                }

                if (progressPercentage !== undefined) {
                    task.progressPercentage = progressPercentage;
                }
            }

            if (workUpdateMessage !== undefined && workUpdateMessage.trim() !== '') {
                task.updates.push({
                    message: workUpdateMessage.trim(),
                    sender: req.user._id,
                    createdAt: new Date()
                });
                task.workUpdateMessage = workUpdateMessage.trim();
            }
        } else {
            // Verify admin owns the task
            const adminId = task.admin?._id
                ? task.admin._id.toString()
                : task.admin?.toString();

            if (adminId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied. You do not own this task.' });
            }
            // Admin can update any field
            const { title, description, assignedEmployee, priority, status, progressPercentage, workUpdateMessage, subTasks } = req.body;

            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (assignedEmployee !== undefined) task.assignedEmployee = assignedEmployee;
            if (priority !== undefined) task.priority = priority;

            if (subTasks !== undefined) {
                task.subTasks = subTasks;
                if (subTasks.length > 0) {
                    const completedCount = subTasks.filter(st => st.isCompleted).length;
                    task.progressPercentage = Math.round((completedCount / subTasks.length) * 100);
                } else {
                    task.progressPercentage = 0;
                }

                if (task.progressPercentage === 100) {
                    task.status = 'completed';
                    task.completedAt = new Date();
                } else {
                    task.status = 'in-progress';
                    task.completedAt = null;
                }
            } else {
                if (status !== undefined) {
                    task.status = status;
                    if (status === 'completed' && !task.completedAt) {
                        task.completedAt = new Date();
                        task.progressPercentage = 100;
                    } else if (status !== 'completed') {
                        task.completedAt = null;
                    }
                }
                if (progressPercentage !== undefined) task.progressPercentage = progressPercentage;
            }
            
            if (workUpdateMessage !== undefined && workUpdateMessage.trim() !== '') {
                task.updates.push({
                    message: workUpdateMessage.trim(),
                    sender: req.user._id,
                    createdAt: new Date()
                });
                task.workUpdateMessage = workUpdateMessage.trim();
            }
        }

        const becameCompleted = task.status === 'completed' && !wasCompletedBefore;

        await task.save();

        if (becameCompleted) {
            // Trigger completion email notification in background
            try {
                const adminUser = await User.findById(task.admin);
                if (adminUser) {
                    const employeeUser = await User.findById(task.assignedEmployee);
                    sendTaskCompletionEmail({
                        to: adminUser.email,
                        adminName: adminUser.name,
                        employeeName: employeeUser ? employeeUser.name : 'An employee',
                        taskTitle: task.title
                    });
                }
            } catch (err) {
                console.error('Failed to send task completion email:', err);
            }
        }

        const updated = await task.populate([
            { path: 'assignedEmployee', select: 'name email' },
            { path: 'admin', select: 'name email' },
            { path: 'updates.sender', select: 'name role email' }
        ]);
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.admin && task.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied. You do not own this task.' });
        }

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard-stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const adminId = req.user._id;
            // ── Admin Dashboard Stats ──
            const totalEmployees = await User.countDocuments({ role: 'employee', admin: adminId });
            const totalTasks = await Task.countDocuments({ admin: adminId });
            const completedTasks = await Task.countDocuments({ admin: adminId, status: 'completed' });
            const pendingTasks = await Task.countDocuments({ admin: adminId, status: 'pending' });
            const inProgressTasks = await Task.countDocuments({ admin: adminId, status: 'in-progress' });

            // Recent task updates (last 6)
            const recentTaskUpdates = await Task.find({ admin: adminId })
                .sort({ updatedAt: -1 })
                .limit(6)
                .populate('assignedEmployee', 'name email')
                .populate('updates.sender', 'name role email');

            // Latest employee messages (tasks with non-empty workUpdateMessage)
            const latestEmployeeMessages = await Task.find({ admin: adminId, workUpdateMessage: { $ne: '' } })
                .sort({ updatedAt: -1 })
                .limit(6)
                .populate('assignedEmployee', 'name email')
                .populate('updates.sender', 'name role email');

            // Employee table: all employees with their most recent task
            const employees = await User.find({ role: 'employee', admin: adminId }).select('-password');
            const employeeTable = await Promise.all(employees.map(async (emp) => {
                const tasks = await Task.find({ assignedEmployee: emp._id })
                    .sort({ updatedAt: -1 })
                    .limit(1);
                const latestTask = tasks[0] || null;
                return {
                    _id: emp._id,
                    name: emp.name,
                    email: emp.email,
                    employeeId: emp.employeeId,
                    isJoined: emp.isJoined,
                    task: latestTask ? {
                        _id: latestTask._id,
                        title: latestTask.title,
                        status: latestTask.status,
                        priority: latestTask.priority,
                        progressPercentage: latestTask.progressPercentage,
                        workUpdateMessage: latestTask.workUpdateMessage,
                        updatedAt: latestTask.updatedAt
                    } : null
                };
            }));

            return res.json({
                totalEmployees,
                totalTasks,
                completedTasks,
                pendingTasks,
                inProgressTasks,
                recentTaskUpdates,
                latestEmployeeMessages,
                employeeTable
            });
        } else {
            // ── Employee Dashboard Stats ──
            const myTasks = await Task.find({ assignedEmployee: req.user._id })
                .sort({ updatedAt: -1 })
                .populate('assignedEmployee', 'name email')
                .populate('admin', 'name email')
                .populate('updates.sender', 'name role email');

            const totalAssigned = myTasks.length;
            const myCompleted = myTasks.filter(t => t.status === 'completed').length;
            const myPending = myTasks.filter(t => t.status === 'pending').length;
            const myInProgress = myTasks.filter(t => t.status === 'in-progress').length;

            return res.json({
                totalAssigned,
                myCompleted,
                myPending,
                myInProgress,
                myTasks
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedEmployee', 'name email')
            .populate('admin', 'name email')
            .populate('updates.sender', 'name role email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify ownership / access
        const assignedEmployeeId = task.assignedEmployee?._id
            ? task.assignedEmployee._id.toString()
            : task.assignedEmployee?.toString();

        const adminId = task.admin?._id
            ? task.admin._id.toString()
            : task.admin?.toString();

        if (req.user.role === 'employee') {
            if (assignedEmployeeId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
        } else {
            if (adminId !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate task breakdown description & checklists using Gemini AI
// @route   POST /api/tasks/ai-generate
// @access  Private (Admin only)
export const generateAiTaskBreakdown = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: 'Task title is required for AI generation.' });
        }

        const breakdown = await generateTaskBreakdown(title);
        
        // Transform subTasks array of strings to our schema
        const formattedSubTasks = (breakdown.subTasks || []).map(t => ({
            title: t,
            isCompleted: false
        }));

        res.json({
            description: breakdown.description || '',
            subTasks: formattedSubTasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'AI Task Generator is currently unavailable.' });
    }
};

// @desc    Get progress summary of a task updates history using Gemini AI
// @route   GET /api/tasks/:id/ai-summary
// @access  Private
export const getAiTaskSummary = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('updates.sender', 'name role');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const summary = await summarizeTaskProgress(task.title, task.description, task.updates);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message || 'AI Task Summarizer is currently unavailable.' });
    }
};
