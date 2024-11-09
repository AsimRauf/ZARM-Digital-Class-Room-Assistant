const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateQuiz, saveQuiz, getAllQuizzes, getQuizById, saveQuizAttempt, getQuizAttempts, deleteQuiz, getQuizAttemptsbyQuiz } = require('../controllers/quizController');

router.post('/generate', auth, generateQuiz);
router.post('/save', auth, saveQuiz);
router.get('/all', auth, getAllQuizzes);
router.get('/:id([0-9a-fA-F]{24})', auth, getQuizById);
router.post('/attempt', auth, saveQuizAttempt);
router.get('/all-attempts', auth, getQuizAttempts);
router.get('/:quizId/attempts', auth, getQuizAttemptsbyQuiz);
router.delete('/:id', auth, deleteQuiz);



module.exports = router;




