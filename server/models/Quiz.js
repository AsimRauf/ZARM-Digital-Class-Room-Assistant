const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['mcq']
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 5
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    questions: [questionSchema],
    config: {
        difficulty: String,
        numberOfQuestions: Number,
        timeLimit: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
