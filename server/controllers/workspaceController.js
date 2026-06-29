import Workspace from '../models/Workspace.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private (any authenticated user)
export const createWorkspace = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Workspace name is required' });
        }

        const workspace = await Workspace.create({
            name: name.trim(),
            owner: req.user._id,
            members: [{
                user: req.user._id,
                role: 'head',
                joinedAt: new Date()
            }]
        });

        // Set this as user's current workspace
        await User.findByIdAndUpdate(req.user._id, { currentWorkspace: workspace._id });

        res.status(201).json({
            _id: workspace._id,
            name: workspace.name,
            role: 'head',
            memberCount: 1
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Submit a join request using passkey
// @route   POST /api/workspaces/join-request
// @access  Private (any authenticated user)
export const submitJoinRequest = async (req, res) => {
    try {
        const { passkey } = req.body;

        if (!passkey || !passkey.trim()) {
            return res.status(400).json({ message: 'Workspace passkey is required' });
        }

        // Find workspace by passkey
        const workspace = await Workspace.findOne({ passkey: passkey.trim().toUpperCase() });

        if (!workspace) {
            return res.status(404).json({ message: 'Invalid passkey. No workspace found.' });
        }

        if (!workspace.passkeyActive) {
            return res.status(403).json({ message: 'This workspace is not accepting new members right now.' });
        }

        // Check if already a member
        if (workspace.isMember(req.user._id)) {
            return res.status(400).json({ message: 'You are already a member of this workspace.' });
        }

        // Check for existing pending request
        const existingRequest = await JoinRequest.findOne({
            user: req.user._id,
            workspace: workspace._id,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request for this workspace.' });
        }

        // Create join request
        const joinRequest = await JoinRequest.create({
            user: req.user._id,
            workspace: workspace._id
        });

        res.status(201).json({
            message: 'Join request submitted successfully! The workspace Head will review your request.',
            requestId: joinRequest._id,
            workspaceName: workspace.name
        });
    } catch (error) {
        // Handle duplicate key error from unique index
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You already have a request for this workspace.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get pending join requests for workspace
// @route   GET /api/workspaces/join-requests
// @access  Private (Head only — enforced by requireRole middleware)
export const getJoinRequests = async (req, res) => {
    try {
        const requests = await JoinRequest.find({
            workspace: req.workspace._id
        })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a join request
// @route   PATCH /api/workspaces/join-requests/:id/approve
// @access  Private (Head only)
export const approveJoinRequest = async (req, res) => {
    try {
        const joinRequest = await JoinRequest.findById(req.params.id).populate('user', 'name email');

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        if (joinRequest.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'This request does not belong to your workspace' });
        }

        if (joinRequest.status !== 'pending') {
            return res.status(400).json({ message: `Request already ${joinRequest.status}` });
        }

        // Update request status
        joinRequest.status = 'approved';
        await joinRequest.save();

        // Add user to workspace members
        req.workspace.members.push({
            user: joinRequest.user._id,
            role: 'member',
            joinedAt: new Date()
        });
        await req.workspace.save();

        // Set workspace as user's current workspace (if they don't have one)
        await User.findByIdAndUpdate(
            joinRequest.user._id,
            { $set: { currentWorkspace: req.workspace._id } }
        );

        res.json({
            message: `${joinRequest.user.name} has been added to the workspace.`,
            request: joinRequest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a join request
// @route   PATCH /api/workspaces/join-requests/:id/reject
// @access  Private (Head only)
export const rejectJoinRequest = async (req, res) => {
    try {
        const joinRequest = await JoinRequest.findById(req.params.id).populate('user', 'name email');

        if (!joinRequest) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        if (joinRequest.workspace.toString() !== req.workspace._id.toString()) {
            return res.status(403).json({ message: 'This request does not belong to your workspace' });
        }

        if (joinRequest.status !== 'pending') {
            return res.status(400).json({ message: `Request already ${joinRequest.status}` });
        }

        joinRequest.status = 'rejected';
        await joinRequest.save();

        res.json({
            message: `Join request from ${joinRequest.user.name} has been rejected.`,
            request: joinRequest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get workspace passkey
// @route   GET /api/workspaces/passkey
// @access  Private (Head only)
export const getPasskey = async (req, res) => {
    try {
        res.json({
            passkey: req.workspace.passkey,
            passkeyActive: req.workspace.passkeyActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Regenerate workspace passkey
// @route   POST /api/workspaces/passkey/regenerate
// @access  Private (Head only)
export const regeneratePasskey = async (req, res) => {
    try {
        const newPasskey = req.workspace.regeneratePasskey();
        await req.workspace.save();

        res.json({
            message: 'Passkey regenerated successfully. The old passkey is now invalid.',
            passkey: newPasskey
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle passkey active status
// @route   PATCH /api/workspaces/passkey/toggle
// @access  Private (Head only)
export const togglePasskey = async (req, res) => {
    try {
        req.workspace.passkeyActive = !req.workspace.passkeyActive;
        await req.workspace.save();

        res.json({
            passkeyActive: req.workspace.passkeyActive,
            message: req.workspace.passkeyActive
                ? 'Passkey enabled. New members can now request to join.'
                : 'Passkey disabled. No new join requests will be accepted.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get workspace members
// @route   GET /api/workspaces/members
// @access  Private (any workspace member)
export const getMembers = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.workspace._id)
            .populate('members.user', 'name email avatar createdAt');

        const members = workspace.members.map(m => ({
            _id: m.user._id,
            name: m.user.name,
            email: m.user.email,
            avatar: m.user.avatar,
            role: m.role,
            joinedAt: m.joinedAt,
            createdAt: m.user.createdAt
        }));

        res.json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove a member from workspace
// @route   DELETE /api/workspaces/members/:userId
// @access  Private (Head only)
export const removeMember = async (req, res) => {
    try {
        const { userId } = req.params;

        // Cannot remove the head
        if (req.workspace.owner.toString() === userId) {
            return res.status(400).json({ message: 'Cannot remove the workspace owner.' });
        }

        const memberIndex = req.workspace.members.findIndex(
            m => m.user.toString() === userId
        );

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'User is not a member of this workspace.' });
        }

        req.workspace.members.splice(memberIndex, 1);
        await req.workspace.save();

        // Clear user's current workspace if it was this one
        await User.findByIdAndUpdate(userId, { currentWorkspace: null });

        res.json({ message: 'Member removed from workspace.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change member role
// @route   PATCH /api/workspaces/members/:userId/role
// @access  Private (Head only)
export const changeMemberRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['admin', 'member', 'viewer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be admin, member, or viewer.' });
        }

        // Cannot change head's own role
        if (req.workspace.owner.toString() === userId) {
            return res.status(400).json({ message: 'Cannot change the Head\'s role.' });
        }

        const member = req.workspace.members.find(
            m => m.user.toString() === userId
        );

        if (!member) {
            return res.status(404).json({ message: 'User is not a member of this workspace.' });
        }

        member.role = role;
        await req.workspace.save();

        res.json({ message: `Role updated to ${role}.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current workspace info
// @route   GET /api/workspaces/current
// @access  Private (any workspace member)
export const getCurrentWorkspace = async (req, res) => {
    try {
        const workspace = await Workspace.findById(req.workspace._id)
            .select('name owner members createdAt passkeyActive');

        const role = req.workspaceRole;
        const memberCount = workspace.members.length;

        res.json({
            _id: workspace._id,
            name: workspace.name,
            role,
            memberCount,
            isOwner: workspace.owner.toString() === req.user._id.toString(),
            createdAt: workspace.createdAt,
            passkeyActive: workspace.passkeyActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check user's pending join requests
// @route   GET /api/workspaces/my-requests
// @access  Private
export const getMyRequests = async (req, res) => {
    try {
        const requests = await JoinRequest.find({
            user: req.user._id
        })
        .populate('workspace', 'name')
        .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
