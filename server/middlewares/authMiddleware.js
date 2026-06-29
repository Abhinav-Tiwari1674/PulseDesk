import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

/**
 * Protect routes — verify JWT and attach req.user
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

/**
 * Require workspace — reads x-workspace-id header, verifies membership,
 * attaches req.workspace and req.workspaceRole
 */
export const requireWorkspace = async (req, res, next) => {
    try {
        const workspaceId = req.headers['x-workspace-id'];

        if (!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required' });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        // Check if user is a member of this workspace
        const member = workspace.members.find(
            m => m.user.toString() === req.user._id.toString()
        );

        if (!member) {
            return res.status(403).json({ message: 'You are not a member of this workspace' });
        }

        req.workspace = workspace;
        req.workspaceRole = member.role;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Workspace verification failed' });
    }
};

/**
 * Require specific role(s) within the workspace.
 * Must be used AFTER requireWorkspace middleware.
 * Usage: requireRole('head') or requireRole('head', 'admin')
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.workspaceRole) {
            return res.status(403).json({ message: 'Workspace role not determined' });
        }

        if (!roles.includes(req.workspaceRole)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.workspaceRole}` 
            });
        }

        next();
    };
};
