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
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'teacher', 'student'],
            default: 'student'
        },
        assignedCourse: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }
    }],
    inviteCode: String
});

module.exports = mongoose.model('Room', roomSchema);