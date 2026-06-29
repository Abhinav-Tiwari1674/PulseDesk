import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            currentWorkspace: null // New users must go through workspace setup
        });

        if (user) {
            const token = generateToken(res, user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                currentWorkspace: null,
                token
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            currentWorkspace: user.currentWorkspace,
            token
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            currentWorkspace: user.currentWorkspace,
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search users within workspace
// @route   GET /api/auth/search
// @access  Private (requires workspace context)
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Get workspace member IDs from the workspace attached by middleware
        const memberIds = req.workspace.members.map(m => m.user);

        const users = await User.find({
            _id: { $in: memberIds },
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }
            ]
        })
        .select('name email avatar')
        .limit(10);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users in workspace
// @route   GET /api/auth/users
// @access  Private (requires workspace context)
export const getUsers = async (req, res) => {
    try {
        // Only return users who are members of the current workspace
        const memberIds = req.workspace.members.map(m => m.user);

        const users = await User.find({ _id: { $in: memberIds } })
            .select('name email role avatar createdAt');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
