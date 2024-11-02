const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'moderator'],
            default: 'member'
        }
    }],
    inviteCode: {
        type: String,
        unique: true
    }
});

// Remove any existing unique index on members.user
roomSchema.index({ 'members.user': 1 }, { unique: false });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;