import express from 'express';
import { registerUser, loginUser, logoutUser, searchUsers, getUsers, getMe } from '../controllers/authController.js';
import { protect, requireWorkspace } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.get('/search', protect, requireWorkspace, searchUsers);
router.get('/users', protect, requireWorkspace, getUsers);

export default router;
