import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Prevent duplicate pending requests from the same user to the same workspace
joinRequestSchema.index({ user: 1, workspace: 1 }, { unique: true });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

export default JoinRequest;
