import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        minlength: 6,
        select: false
        // Not required — Google users have no password
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee'
    },
    photo: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    isJoined: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    // Forgot Password
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving (only if modified and exists)
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash a password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate raw token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and store on model
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expires in 10 minutes
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken; // Return raw (un-hashed) token for the email link
};

const User = mongoose.model('User', userSchema);

export default User;
