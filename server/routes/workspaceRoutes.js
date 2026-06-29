import express from 'express';
import {
    createWorkspace,
    submitJoinRequest,
    getJoinRequests,
    approveJoinRequest,
    rejectJoinRequest,
    getPasskey,
    regeneratePasskey,
    togglePasskey,
    getMembers,
    removeMember,
    changeMemberRole,
    getCurrentWorkspace,
    getMyRequests
} from '../controllers/workspaceController.js';
import { protect, requireWorkspace, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── No workspace context needed ──
router.post('/', protect, createWorkspace);
router.post('/join-request', protect, submitJoinRequest);
router.get('/my-requests', protect, getMyRequests);

// ── Workspace context required ──
router.get('/current', protect, requireWorkspace, getCurrentWorkspace);
router.get('/members', protect, requireWorkspace, getMembers);

// ── Head-only routes ──
router.get('/join-requests', protect, requireWorkspace, requireRole('head'), getJoinRequests);
router.patch('/join-requests/:id/approve', protect, requireWorkspace, requireRole('head'), approveJoinRequest);
router.patch('/join-requests/:id/reject', protect, requireWorkspace, requireRole('head'), rejectJoinRequest);

router.get('/passkey', protect, requireWorkspace, requireRole('head'), getPasskey);
router.post('/passkey/regenerate', protect, requireWorkspace, requireRole('head'), regeneratePasskey);
router.patch('/passkey/toggle', protect, requireWorkspace, requireRole('head'), togglePasskey);

router.delete('/members/:userId', protect, requireWorkspace, requireRole('head'), removeMember);
router.patch('/members/:userId/role', protect, requireWorkspace, requireRole('head'), changeMemberRole);

export default router;
