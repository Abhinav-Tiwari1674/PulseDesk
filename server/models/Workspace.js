import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Generates a workspace passkey in format: PD-XXXX-XXXX-XXXX
 * Uses crypto.randomBytes for secure randomness.
 */
const generatePasskey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I,O,0,1 to avoid confusion
    const segments = [];
    for (let s = 0; s < 3; s++) {
        const bytes = crypto.randomBytes(4);
        let segment = '';
        for (let i = 0; i < 4; i++) {
            segment += chars[bytes[i] % chars.length];
        }
        segments.push(segment);
    }
    return `PD-${segments.join('-')}`;
};

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['head', 'admin', 'member', 'viewer'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Workspace name is required'],
        trim: true,
        maxlength: [60, 'Workspace name cannot exceed 60 characters']
    },
    passkey: {
        type: String,
        unique: true,
        index: true
    },
    passkeyActive: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [memberSchema]
}, {
    timestamps: true
});

// Auto-generate passkey before saving if not set
workspaceSchema.pre('save', function () {
    if (!this.passkey) {
        this.passkey = generatePasskey();
    }
});

// Static method to regenerate passkey
workspaceSchema.methods.regeneratePasskey = function () {
    this.passkey = generatePasskey();
    return this.passkey;
};

// Helper: check if a user is a member
workspaceSchema.methods.isMember = function (userId) {
    return this.members.some(m => m.user.toString() === userId.toString());
};

// Helper: get member role
workspaceSchema.methods.getMemberRole = function (userId) {
    const member = this.members.find(m => m.user.toString() === userId.toString());
    return member ? member.role : null;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
