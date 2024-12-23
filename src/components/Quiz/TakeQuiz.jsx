import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    LinearProgress,
    Chip,
    Alert,
    Dialog,
    DialogContent,
    DialogActions
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import Navbar from '../Navbar';

const TakeQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [questionTimer, setQuestionTimer] = useState(60);
    const [isQuestionDisabled, setIsQuestionDisabled] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [quizConfig, setQuizConfig] = useState({
        totalTime: 3600, // Default 1 hour
        questionTime: 60  // Default 60 seconds per question
    });
    const [overallTimer, setOverallTimer] = useState(null);
    const [attemptedQuestions, setAttemptedQuestions] = useState({});
    const [remainingTime, setRemainingTime] = useState(null);

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (quiz) {
            const shuffled = quiz.questions.map(question => ({
                ...question,
                options: shuffleArray([...question.options])
            }));
            setShuffledQuestions(shuffleArray(shuffled));
            // Set quiz configuration if available
            if (quiz.config) {
                setQuizConfig({
                    totalTime: quiz.config.timeLimit || 3600,
                    questionTime: quiz.config.questionTime || 60
                });
            }
        }
    }, [quiz]);

    useEffect(() => {
        if (questionTimer === 0) {
            setIsQuestionDisabled(true);
            setTimeout(() => {
                handleNext();
            }, 1000);
            return;
        }

        const timer = setInterval(() => {
            setQuestionTimer(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [questionTimer]);

    const shuffleArray = (array) => {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const fetchQuiz = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/quiz/${quizId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setQuiz(data);
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };

    const handleNext = () => {
        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setQuestionTimer(quizConfig.questionTime);
            setIsQuestionDisabled(false);
        } else {
            setConfirmSubmit(true);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setQuestionTimer(quizConfig.questionTime);
            setIsQuestionDisabled(false);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        Object.entries(userAnswers).forEach(([index, answer]) => {
            if (answer === shuffledQuestions[parseInt(index)].correctAnswer) {
                correct++;
            }
        });
        return (correct / shuffledQuestions.length) * 100;
    };

    const handleAnswerSelect = (answer) => {
        setUserAnswers({
            ...userAnswers,
            [currentQuestion]: answer
        });
    };

    const handleSubmit = async () => {
        setQuizCompleted(true);
        const score = calculateScore();
        const token = localStorage.getItem('token');

        const formattedAnswers = shuffledQuestions.map((question, index) => ({
            questionId: question._id,
            type: 'mcq',
            question: question.question,
            options: question.options,
            selectedAnswer: userAnswers[index] || 'Unanswered',
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            points: question.points,
            isCorrect: userAnswers[index] === question.correctAnswer
        }));

        try {
            const response = await fetch('http://localhost:5000/api/quiz/attempt', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quizId,
                    score,
                    answers: formattedAnswers
                })
            });

            const savedAttempt = await response.json();
            navigate(`/quiz-results/${quizId}`);
        } catch (error) {
            console.error('Error saving attempt:', error);
        }
    };

    if (!quiz || !shuffledQuestions.length) return null;

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 4 }}>
                {quizCompleted && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>
                        Quiz completed! Redirecting to results...
                    </Alert>
                )}

                <Paper sx={{
                    p: 4,
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(59, 30, 84, 0.12)'
                }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <Typography variant="h5" sx={{ color: '#3B1E54', fontWeight: 600 }}>
                            {quiz.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                icon={<TimerIcon />}
                                label={`${questionTimer}s`}
                                color={questionTimer < 10 ? "error" : "primary"}
                                sx={{
                                    fontWeight: 500,
                                    animation: questionTimer < 10 ? 'pulse 1s infinite' : 'none',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                        '100%': { transform: 'scale(1)' }
                                    }
                                }}
                            />
                            <Chip
                                label={`${currentQuestion + 1}/${shuffledQuestions.length}`}
                                color="primary"
                                variant="outlined"
                            />
                        </Box>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={(currentQuestion + 1) / shuffledQuestions.length * 100}
                        sx={{
                            mb: 3,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(59, 30, 84, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: '#3B1E54'
                            }
                        }}
                    />

                    <Typography variant="h6" sx={{ mb: 3, color: '#3B1E54' }}>
                        {shuffledQuestions[currentQuestion].question}
                    </Typography>

                    <RadioGroup
                        value={userAnswers[currentQuestion] || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                    >
                        {shuffledQuestions[currentQuestion].options.map((option, index) => (
                            <Paper
                                key={index}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    border: '1px solid rgba(59, 30, 84, 0.1)',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease',
                                    opacity: isQuestionDisabled ? 0.7 : 1,
                                    '&:hover': {
                                        transform: !isQuestionDisabled && 'translateX(8px)',
                                        bgcolor: !isQuestionDisabled && 'rgba(59, 30, 84, 0.04)'
                                    }
                                }}
                            >
                                <FormControlLabel
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                    disabled={isQuestionDisabled}
                                    sx={{
                                        m: 0,
                                        p: 2,
                                        width: '100%'
                                    }}
                                />
                            </Paper>
                        ))}
                    </RadioGroup>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 4
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0 || isQuestionDisabled}
                            sx={{
                                borderRadius: '10px',
                                borderColor: '#3B1E54',
                                color: '#3B1E54',
                                '&:hover': {
                                    borderColor: '#5E2E87',
                                    bgcolor: 'rgba(59, 30, 84, 0.04)'
                                }
                            }}
                        >
                            Previous
                        </Button>

                        {currentQuestion === shuffledQuestions.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={() => setConfirmSubmit(true)}
                                disabled={isQuestionDisabled}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: '#3B1E54',
                                    '&:hover': { bgcolor: '#5E2E87' }
                                }}
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!userAnswers[currentQuestion] || isQuestionDisabled}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: '#3B1E54',
                                    '&:hover': { bgcolor: '#5E2E87' }
                                }}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>

            <Dialog
                open={confirmSubmit}
                onClose={() => setConfirmSubmit(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        p: 2
                    }
                }}
            >
                <DialogContent>
                    <Box sx={{ textAlign: 'center' }}>
                        <QuizIcon sx={{ fontSize: 48, color: '#3B1E54', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Submit Quiz?
                        </Typography>
                        <Typography color="text.secondary">
                            You won't be able to change your answers after submission.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setConfirmSubmit(false)}
                        sx={{ borderRadius: '10px' }}
                    >
                        Review Answers
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            borderRadius: '10px',
                            bgcolor: '#3B1E54',
                            '&:hover': { bgcolor: '#5E2E87' }
                        }}
                    >
                        Submit Quiz
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TakeQuiz;
