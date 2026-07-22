import Message from '../models/Message.js';
import User from '../models/User.js';
import { enhanceMessageTone } from '../services/aiService.js';

// @desc    Get chat messages between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getChatMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: otherUserId },
                { sender: otherUserId, receiver: req.user._id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name role email')
        .populate('receiver', 'name role email');

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a new chat message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        if (!receiverId || !message || message.trim() === '') {
            return res.status(400).json({ message: 'Receiver and message text are required.' });
        }

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            message: message.trim()
        });

        const populated = await newMessage.populate([
            { path: 'sender', select: 'name role email' },
            { path: 'receiver', select: 'name role email' }
        ]);

        // Emit message to receiver's socket room
        const io = req.app.get('socketio');
        if (io) {
            io.to(receiverId).emit('message_received', populated);
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Enhance/rewrite message tone to be professional using Gemini AI
// @route   POST /api/messages/enhance-tone
// @access  Private
export const getEnhancedMessageTone = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Message text is required.' });
        }

        const enhanced = await enhanceMessageTone(message);
        res.json({ enhancedMessage: enhanced });
    } catch (error) {
        res.status(500).json({ message: error.message || 'AI Tone Enhancer is currently unavailable.' });
    }
};
