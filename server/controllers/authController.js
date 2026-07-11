import crypto from 'crypto';
import User from '../models/User.js';
import Task from '../models/Task.js';
import generateToken from '../utils/generateToken.js';
import sendResetEmail, { sendOtpEmail } from '../utils/sendEmail.js';
import { adminAuth } from '../utils/firebaseAdmin.js';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const userResponse = (user, token) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photo: user.photo,
    provider: user.provider,
    token
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user (always employee — admins created manually)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, employeeId } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Enforce @gmail.com domain
        if (!email.toLowerCase().trim().endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Only valid @gmail.com addresses are permitted for registration.' });
        }

        // Generate 6-digit numeric OTP code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

        if (role === 'admin') {
            const existing = await User.findOne({ email: email.toLowerCase() });
            if (existing) {
                if (existing.provider === 'google') {
                    return res.status(400).json({
                        message: 'This email is linked to a Google account. Please continue with Google.'
                    });
                }
                return res.status(400).json({ message: 'An account with this email already exists.' });
            }

            const user = await User.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                role: 'admin',
                provider: 'local',
                isVerified: false,
                otpCode,
                otpExpires
            });

            // Send verification code
            if (process.env.NODE_ENV === 'development') {
                console.log(`\n🔑 [OTP Verification Code] Generated for Admin ${user.email}: ${otpCode}\n`);
            }
            try {
                await sendOtpEmail({
                    to: user.email,
                    name: user.name,
                    code: otpCode
                });
            } catch (err) {
                console.error('Failed to send Admin OTP Email:', err);
            }

            return res.status(201).json({
                message: 'Registration successful! Verification code sent to your Gmail.',
                requiresVerification: true,
                email: user.email
            });
        } else {
            // Role is employee — must join with a valid employeeId and matching email
            if (!employeeId) {
                return res.status(400).json({ message: 'Employee ID is required to register as an employee.' });
            }

            const existingEmployee = await User.findOne({ 
                email: email.toLowerCase().trim(), 
                employeeId: employeeId.toUpperCase().trim() 
            }).select('+password');

            if (!existingEmployee) {
                return res.status(400).json({ 
                    message: 'No pending registration found for this Email and Employee ID. Please ask your Admin to invite you.' 
                });
            }

            if (existingEmployee.isJoined) {
                return res.status(400).json({ message: 'This employee account has already been registered.' });
            }

            // Update employee record with password, set OTP and keep isVerified false
            existingEmployee.name = name.trim();
            existingEmployee.password = password;
            existingEmployee.otpCode = otpCode;
            existingEmployee.otpExpires = otpExpires;
            existingEmployee.isVerified = false;
            await existingEmployee.save();

            // Send verification code
            if (process.env.NODE_ENV === 'development') {
                console.log(`\n🔑 [OTP Verification Code] Generated for Employee ${existingEmployee.email}: ${otpCode}\n`);
            }
            try {
                await sendOtpEmail({
                    to: existingEmployee.email,
                    name: existingEmployee.name,
                    code: otpCode
                });
            } catch (err) {
                console.error('Failed to send Employee OTP Email:', err);
            }

            return res.status(200).json({
                message: 'Registration successful! Verification code sent to your Gmail.',
                requiresVerification: true,
                email: existingEmployee.email
            });
        }
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login with email + password
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
    try {
        const { email, password, rememberMe = false } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'No account found with that email address.' });
        }

        // Google-only account trying to use password login
        if (user.provider === 'google' && !user.password) {
            return res.status(401).json({
                message: 'This account uses Google Sign-In. Please continue with Google.'
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        if (user.provider === 'local' && !user.isVerified) {
            return res.status(403).json({
                message: 'Your email address is not verified yet.',
                requiresVerification: true,
                email: user.email
            });
        }

        const token = generateToken(res, user._id, Boolean(rememberMe));
        res.json(userResponse(user, token));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Google Sign-In / Sign-Up
// @route   POST /api/auth/google
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const googleAuth = async (req, res) => {
    try {
        const { idToken, role, employeeId } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: 'Google ID token is required.' });
        }

        // Check if Firebase Admin is configured
        if (!adminAuth) {
            return res.status(503).json({
                message: 'Google Sign-In is not configured yet. Please add Firebase credentials to the server .env file.'
            });
        }

        // Verify the Firebase ID token
        let decoded;
        try {
            decoded = await adminAuth.verifyIdToken(idToken);
        } catch (err) {
            console.error('Firebase Admin verifyIdToken failed:', err);
            return res.status(401).json({
                message: 'Invalid Google token. Please try again.',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }

        const { name, email, picture, uid } = decoded;

        // Enforce @gmail.com domain
        if (!email.toLowerCase().trim().endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Only valid @gmail.com accounts are permitted to authenticate.' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Account exists — update photo if it changed, and make sure it is verified since they authenticated with Google
            let needsSave = false;
            if (picture && user.photo !== picture) {
                user.photo = picture;
                needsSave = true;
            }
            if (!user.isVerified) {
                user.isVerified = true;
                needsSave = true;
            }
            if (needsSave) {
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // New user — if trying to be an admin, they can sign up directly
            if (role === 'admin') {
                user = await User.create({
                    name: name || email.split('@')[0],
                    email: email.toLowerCase(),
                    photo: picture || null,
                    provider: 'google',
                    role: 'admin',
                    isVerified: true
                });
            } else {
                // Trying to be employee — must match pre-created record with matching email and employeeId
                if (!employeeId) {
                    return res.status(400).json({ message: 'Employee ID is required to register as an employee.' });
                }

                user = await User.findOne({ 
                    email: email.toLowerCase(), 
                    employeeId: employeeId.toUpperCase().trim() 
                });

                if (!user) {
                    return res.status(400).json({
                        message: 'No pending employee account found with this Google email and Employee ID. Please contact your admin.'
                    });
                }

                if (user.isJoined) {
                    return res.status(400).json({ message: 'This employee account has already been registered.' });
                }

                user.provider = 'google';
                user.isJoined = true;
                user.isVerified = true;
                if (picture) user.photo = picture;
                await user.save({ validateBeforeSave: false });
            }
        }

        const token = generateToken(res, user._id, true); // Google logins always remember
        res.json(userResponse(user, token));
    } catch (error) {
        console.error('Google auth error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            photo: user.photo,
            provider: user.provider,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        // Check if account exists
        if (!user) {
            return res.status(404).json({
                message: 'No account found with this email.'
            });
        }

        // Check if Google Authentication provider
        if (user.provider === 'google' || (user.provider === 'google' && !user.password)) {
            return res.status(400).json({
                message: 'This account uses Google Sign-In. Please continue with Google instead.'
            });
        }

        const rawToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${rawToken}`;

        if (process.env.NODE_ENV === 'development') {
            console.log(`\n🔑 [Reset Password Link] Generated for ${user.email}:\n${resetUrl}\n`);
        }

        try {
            await sendResetEmail({
                to: user.email,
                name: user.name,
                resetUrl
            });
        } catch (emailError) {
            // Roll back token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('Email send error:', emailError.message);
            return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

        res.status(200).json({
            message: 'A password reset link has been sent to your email address.'
        });
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Hash the raw URL token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            return res.status(400).json({
                message: 'Reset link is invalid or has expired. Please request a new one.'
            });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(res, user._id, false);
        res.json({ message: 'Password reset successful.', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────────────────────────────────

export const getEmployees = async (req, res) => {
    try {
        const { search } = req.query;
        const query = { role: 'employee', admin: req.user._id };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const employees = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Domain restriction: Only @gmail.com is allowed!
        if (!email.toLowerCase().trim().endsWith('@gmail.com')) {
            return res.status(400).json({ message: 'Only valid @gmail.com addresses are permitted for employee invitations.' });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate automatic unique employee ID (e.g. EMP-123456)
        let employeeId;
        let isUnique = false;
        while (!isUnique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000);
            employeeId = `EMP-${randomDigits}`;
            const existing = await User.findOne({ employeeId });
            if (!existing) isUnique = true;
        }

        const employee = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role: 'employee',
            provider: 'local',
            admin: req.user._id,
            employeeId,
            isJoined: false
        });

        res.status(201).json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            employeeId: employee.employeeId,
            isJoined: employee.isJoined,
            createdAt: employee.createdAt
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const { name, email } = req.body;
        const employee = await User.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        if (employee.role !== 'employee') {
            return res.status(400).json({ message: 'Cannot edit admin accounts from this endpoint' });
        }
        if (name) employee.name = name;
        if (email) employee.email = email;
        await employee.save();
        res.json({
            _id: employee._id,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            createdAt: employee.createdAt
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        if (employee.role !== 'employee') {
            return res.status(400).json({ message: 'Cannot delete admin accounts from this endpoint' });
        }
        await Task.deleteMany({ assignedEmployee: employee._id });
        await employee.deleteOne();
        res.json({ message: `Employee ${employee.name} and their tasks have been deleted.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin details (for employee chat recipient lookup)
// @route   GET /api/auth/admin-details
// @access  Private (Employee only)
export const getAdminDetails = async (req, res) => {
    try {
        if (req.user.role !== 'employee') {
            return res.status(400).json({ message: 'Only employees can fetch admin details.' });
        }
        const admin = await User.findById(req.user.admin).select('name email photo');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP code for email registration
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and verification code are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified.' });
        }

        if (!user.otpCode || user.otpCode !== code.trim()) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        if (user.otpExpires && new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Verify the user
        user.isVerified = true;
        if (user.role === 'employee') {
            user.isJoined = true;
        }
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = generateToken(res, user._id, false);
        res.status(200).json(userResponse(user, token));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend OTP verification code
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Account is already verified.' });
        }

        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        try {
            await sendOtpEmail({
                to: user.email,
                name: user.name,
                code: otpCode
            });
        } catch (err) {
            console.error('Failed to resend OTP Email:', err);
        }

        res.json({ message: 'Verification code resent to your Gmail.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
