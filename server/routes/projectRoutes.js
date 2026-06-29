import express from 'express';
import { 
    createProject, 
    getProjects, 
    getProjectById, 
    deleteProject,
    addTeamMember,
    removeTeamMember 
} from '../controllers/projectController.js';
import { protect, requireWorkspace } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, requireWorkspace, createProject)
    .get(protect, requireWorkspace, getProjects);

router.route('/:id')
    .get(protect, requireWorkspace, getProjectById)
    .delete(protect, requireWorkspace, deleteProject);

router.patch('/:id/team/add', protect, requireWorkspace, addTeamMember);
router.patch('/:id/team/remove', protect, requireWorkspace, removeTeamMember);

export default router;
