const mongoose = require('mongoose');

const videoContentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    fileName: String,
    transcription: String,
    summary: String,
    notes: String,
    keyPoints: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('VideoContent', videoContentSchema);
