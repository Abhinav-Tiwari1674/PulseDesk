import express from 'express';
import { getChatMessages, sendMessage, getEnhancedMessageTone } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All chat message routes require authentication
router.use(protect);

router.get('/:userId', getChatMessages);
router.post('/', sendMessage);
router.post('/enhance-tone', getEnhancedMessageTone);

export default router;
