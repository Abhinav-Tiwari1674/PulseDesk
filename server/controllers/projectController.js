import Project from '../models/Project.js';

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (workspace member)
export const createProject = async (req, res) => {
    try {
        const { name, description, priority, deadline } = req.body;

        const project = await Project.create({
            name,
            description,
            priority,
            deadline,
            owner: req.user._id,
            workspace: req.workspace._id,
            team: [req.user._id]
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get workspace projects
// @route   GET /api/projects
// @access  Private (workspace member)
export const getProjects = async (req, res) => {
    try {
        // Only return projects belonging to this workspace
        const projects = await Project.find({ workspace: req.workspace._id })
            .populate('owner', 'name email');

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private (workspace member)
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email')
            .populate('team', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify project belongs to this workspace
        if (project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify project belongs to this workspace
        if (project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only owner or head can delete
        if (project.owner.toString() !== req.user._id.toString() && req.workspaceRole !== 'head') {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add team member to project
// @route   PATCH /api/projects/:id/team/add
// @access  Private (Owner only)
export const addTeamMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify project belongs to this workspace
        if (project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only owner can add members
        if (project.owner.toString() !== req.user._id.toString() && req.workspaceRole !== 'head') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify the user being added is a workspace member
        if (!req.workspace.isMember(userId)) {
            return res.status(400).json({ message: 'User is not a member of this workspace' });
        }

        if (project.team.includes(userId)) {
            return res.status(400).json({ message: 'User already in team' });
        }

        project.team.push(userId);
        await project.save();
        
        const updatedProject = await Project.findById(req.params.id).populate('team', 'name email avatar');
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove team member from project
// @route   PATCH /api/projects/:id/team/remove
// @access  Private (Owner only)
export const removeTeamMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify project belongs to this workspace
        if (project.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only owner can remove members
        if (project.owner.toString() !== req.user._id.toString() && req.workspaceRole !== 'head') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Project owner cannot be removed from team
        if (project.owner.toString() === userId) {
            return res.status(400).json({ message: 'Owner cannot be removed' });
        }

        project.team = project.team.filter(m => m.toString() !== userId);
        await project.save();

        const updatedProject = await Project.findById(req.params.id).populate('team', 'name email avatar');
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
