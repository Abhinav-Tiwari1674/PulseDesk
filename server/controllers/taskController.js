import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (workspace member)
export const createTask = async (req, res) => {
    try {
        const { title, description, project, assignedTo, priority, dueDate } = req.body;

        // Verify project exists and belongs to this workspace
        const projectExists = await Project.findById(project);
        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (projectExists.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Project does not belong to this workspace' });
        }

        const task = await Task.create({
            title,
            description,
            project,
            workspace: req.workspace._id,
            assignedTo,
            priority,
            dueDate,
            activities: [{
                user: req.user._id,
                action: 'Created the task'
            }]
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private (workspace member)
export const getProjectTasks = async (req, res) => {
    try {
        // Verify project belongs to workspace
        const project = await Project.findById(req.params.projectId);
        if (!project || project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const tasks = await Task.find({ 
            project: req.params.projectId,
            workspace: req.workspace._id
        })
            .populate('assignedTo', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status (Kanban move)
// @route   PATCH /api/tasks/:id/status
// @access  Private (workspace member)
export const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify task belongs to workspace
        if (task.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        task.status = status;
        task.activities.push({
            user: req.user._id,
            action: `Changed status to ${status}`
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private (workspace member)
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify task belongs to workspace
        if (task.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (workspace member)
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify task belongs to workspace
        if (task.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get dashboard stats for workspace
// @route   GET /api/tasks/dashboard-stats
// @access  Private (workspace member)
export const getDashboardStats = async (req, res) => {
    try {
        const workspaceId = req.workspace._id;

        // Projects in this workspace
        const workspaceProjects = await Project.find({ workspace: workspaceId }).select('_id name');
        const projectIds = workspaceProjects.map(p => p._id);

        // Aggregate task counts by status within workspace
        const taskCounts = await Task.aggregate([
            { $match: { workspace: workspaceId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusMap = {};
        taskCounts.forEach(({ _id, count }) => { statusMap[_id] = count; });

        // Overdue tasks in workspace
        const now = new Date();
        const overdueCount = await Task.countDocuments({
            workspace: workspaceId,
            dueDate: { $lt: now },
            status: { $ne: 'completed' }
        });

        // Recent task activity in workspace
        const recentTasks = await Task.find({ workspace: workspaceId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('assignedTo', 'name')
            .populate('project', 'name');

        // Upcoming deadlines in workspace
        const upcomingTasks = await Task.find({
            workspace: workspaceId,
            dueDate: { $gte: now },
            status: { $ne: 'completed' }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('project', 'name');

        // Member count
        const memberCount = req.workspace.members.length;

        res.json({
            totalProjects: workspaceProjects.length,
            completedTasks: statusMap['completed'] || 0,
            pendingTasks: (statusMap['todo'] || 0) + (statusMap['in-progress'] || 0) + (statusMap['review'] || 0),
            overdueTasks: overdueCount,
            memberCount,
            recentTasks,
            upcomingTasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
