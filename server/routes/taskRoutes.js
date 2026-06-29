import express from 'express';
import { 
    createTask, 
    getProjectTasks, 
    updateTaskStatus, 
    updateTask,
    deleteTask,
    getDashboardStats
} from '../controllers/taskController.js';
import { protect, requireWorkspace } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, requireWorkspace, getDashboardStats);

router.post('/', protect, requireWorkspace, createTask);

router.get('/project/:projectId', protect, requireWorkspace, getProjectTasks);

router.put('/:id', protect, requireWorkspace, updateTask);
router.delete('/:id', protect, requireWorkspace, deleteTask);

router.patch('/:id/status', protect, requireWorkspace, updateTaskStatus);

export default router;
