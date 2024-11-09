const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    },
    score: {
        type: Number,
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        selectedAnswer: {
            type: String,
            required: true
        },
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
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        }
    }],
    timeSpent: Number
}, { timestamps: true });


module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);