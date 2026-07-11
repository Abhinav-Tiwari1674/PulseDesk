import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    googleAuth,
    forgotPassword,
    resetPassword,
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAdminDetails,
    verifyOtp,
    resendOtp
} from '../controllers/authController.js';
import { protect, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Rate Limiters ──────────────────────────────────────────────────────────

// Strict limiter for sensitive auth actions (login, register, google, forgot)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { message: 'Too many requests. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter limiter for forgot-password to prevent abuse
const forgotLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { message: 'Too many password reset requests. Please try again in an hour.' },
    standardHeaders: true,
    legacyHeaders: false
});

// ── Public Auth Routes ─────────────────────────────────────────────────────

router.post('/register',        authLimiter,   registerUser);
router.post('/login',           authLimiter,   loginUser);
router.post('/google',          authLimiter,   googleAuth);
router.post('/logout',                         logoutUser);
router.post('/forgot-password', forgotLimiter, forgotPassword);
router.post('/reset-password/:token',          resetPassword);
router.post('/verify-otp',      authLimiter,   verifyOtp);
router.post('/resend-otp',      authLimiter,   resendOtp);

// ── Private Routes ─────────────────────────────────────────────────────────

router.get('/me', protect, getMe);
router.get('/admin-details', protect, getAdminDetails);

// ── Employee Management (Admin only) ──────────────────────────────────────

router.get   ('/employees',     protect, requireRole('admin'), getEmployees);
router.post  ('/employees',     protect, requireRole('admin'), createEmployee);
router.put   ('/employees/:id', protect, requireRole('admin'), updateEmployee);
router.delete('/employees/:id', protect, requireRole('admin'), deleteEmployee);

export default router;
