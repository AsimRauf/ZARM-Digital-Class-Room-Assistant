const mongoose = require('mongoose');

const courseChatSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        attachments: [{
            url: String,
            type: String,
            name: String,
            size: Number,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('CourseChat', courseChatSchema);
