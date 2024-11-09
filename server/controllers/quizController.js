const Quiz = require('../models/Quiz');
const Note = require('../models/Note');
const QuizAttempt = require('../models/QuizAttempt');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuiz = async (req, res) => {
    try {
        const { noteId, title, config } = req.body;
        const note = await Note.findById(noteId);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

        const prompt = `Generate ${config.numberOfQuestions} multiple choice questions at ${config.difficulty} level from this content: ${note.content}

Return response in this exact JSON format only:
{
    "questions": [
        {
            "type": "mcq",
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "Correct option here",
            "explanation": "Explanation text here",
            "points": 5
        }
    ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const cleanJson = text.slice(jsonStart, jsonEnd);

        const parsedQuestions = JSON.parse(cleanJson);

        res.json({
            title,
            noteId,
            roomId: note.roomId,
            courseId: note.courseId,
            questions: parsedQuestions.questions,
            config
        });


    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ message: error.message });
    }
};

const saveQuiz = async (req, res) => {
    try {
        const quiz = new Quiz({
            title: req.body.title,
            noteId: req.body.noteId,
            roomId: req.body.roomId,
            courseId: req.body.courseId,
            questions: req.body.questions,
            config: req.body.config
        });

        const savedQuiz = await quiz.save();
        res.status(201).json(savedQuiz);
    } catch (error) {
        console.error('Quiz save error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getQuizzesByRoom = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ roomId: req.params.roomId })
            .populate('noteId', 'title')
            .sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate('roomId', 'name')
            .populate('courseId', 'name')
            .populate('noteId', 'title');

        // Get attempt counts for each quiz
        const attemptCounts = await Promise.all(
            quizzes.map(async (quiz) => {
                const count = await QuizAttempt.countDocuments({ quizId: quiz._id });
                return { quizId: quiz._id, count };
            })
        );

        const quizzesWithAttempts = quizzes.map(quiz => {
            const attemptData = attemptCounts.find(a => a.quizId.equals(quiz._id));
            return {
                ...quiz.toObject(),
                totalAttempts: attemptData ? attemptData.count : 0
            };
        });

        res.json(quizzesWithAttempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const saveQuizAttempt = async (req, res) => {
    try {
        const { quizId, score, answers } = req.body;
        console.log('Received answers:', answers); // Debug incoming data

        const quiz = await Quiz.findById(quizId);
        
        const formattedAnswers = answers.map(answer => ({
            questionId: answer.questionId,
            type: answer.type,
            question: answer.question,
            options: answer.options,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: answer.correctAnswer,
            explanation: answer.explanation,
            points: answer.points,
            isCorrect: answer.selectedAnswer === answer.correctAnswer
        }));

        console.log('Formatted answers:', formattedAnswers); // Debug formatted data

        const attemptData = {
            quizId,
            userId: req.user._id,
            score: parseFloat(score.toFixed(2)),
            answers: formattedAnswers
        };

        const savedAttempt = await QuizAttempt.create(attemptData);
        console.log('Saved attempt:', savedAttempt); // Debug saved data
        
        res.status(201).json(savedAttempt);
    } catch (error) {
        console.error('Quiz attempt save error:', error);
        res.status(500).json({ message: error.message });
    }
};






const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate('roomId', 'name')
            .populate('courseId', 'name')
            .populate('noteId', 'title')
            .select({
                title: 1,
                questions: 1,
                config: 1,
                roomId: 1,
                courseId: 1,
                noteId: 1,
                createdAt: 1
            });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ message: error.message });
    }
};

const getQuizAttempts = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({
            userId: req.user._id
        }).populate('quizId');
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quizId: id });
        // Delete the quiz
        await Quiz.findByIdAndDelete(id);
        res.json({ message: 'Quiz and related attempts deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuizAttemptsbyQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const attempts = await QuizAttempt.find({ 
            quizId,
            userId: req.user._id 
        })
        .sort({ createdAt: -1 });
        
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    generateQuiz,
    saveQuiz,
    getQuizzesByRoom,
    getQuizById,
    getAllQuizzes,
    saveQuizAttempt,
    getQuizAttempts, 
    deleteQuiz,
    getQuizAttemptsbyQuiz,
};


