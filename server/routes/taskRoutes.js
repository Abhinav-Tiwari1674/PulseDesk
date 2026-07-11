import express from 'express';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getDashboardStats,
    generateAiTaskBreakdown,
    getAiTaskSummary
} from '../controllers/taskController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Dashboard stats (role-aware: admin vs employee)
router.get('/dashboard-stats', protect, getDashboardStats);

// AI Generation (Admin only)
router.post('/ai-generate', protect, requireRole('admin'), generateAiTaskBreakdown);

// Get tasks (admin: all | employee: own only)
router.get('/', protect, getTasks);

// Get single task by ID
router.get('/:id', protect, getTaskById);

// AI Status Summary
router.get('/:id/ai-summary', protect, getAiTaskSummary);

// Create task (Admin only)
router.post('/', protect, requireRole('admin'), createTask);

// Update task (admin: full update | employee: status/progress/message only — enforced in controller)
router.put('/:id', protect, updateTask);

// Delete task (Admin only)
router.delete('/:id', protect, requireRole('admin'), deleteTask);

export default router;
