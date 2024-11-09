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
    Alert
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
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
            /*************  ✨ Codeium Command ⭐  *************/
            /**
             * Fetches the quiz with the given id from the server and sets the component's state
             * with the received data.
             * @param {string} quizId - The id of the quiz to fetch
             * @throws {Error} - If there is an error fetching the quiz
             */
            /******  e2da5e3c-fe70-49bc-90ed-af68b522acb8  *******/
}
    };


    const handleNext = () => {
        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setQuestionTimer(60);
            setIsQuestionDisabled(false);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setQuestionTimer(60);
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
        console.log('Selected answer:', answer); // Debug selected answer
        setUserAnswers({
            ...userAnswers,
            [currentQuestion]: answer
        });
    };

    const handleSubmit = async () => {
        setQuizCompleted(true);
        const score = calculateScore();
        const token = localStorage.getItem('token');
    
        console.log('User answers before submit:', userAnswers); // Debug all answers
    
        const formattedAnswers = shuffledQuestions.map((question, index) => {
            const selectedAnswer = userAnswers[index];
            console.log(`Question ${index}:`, {
                question: question.question,
                selected: selectedAnswer,
                correct: question.correctAnswer
            });
            
            return {
                questionId: question._id,
                type: 'mcq',
                question: question.question,
                options: question.options,
                selectedAnswer: selectedAnswer || 'Unanswered',
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                points: question.points,
                isCorrect: selectedAnswer === question.correctAnswer
            };
        });
    
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
            console.log('Saved attempt:', savedAttempt); // Debug saved data
            
            setTimeout(() => {
                navigate('/quizzes');
            }, 2000);
        } catch (error) {
            console.error('Error saving attempt:', error);
        }
    };
    
    

    if (!quiz || !shuffledQuestions.length) return null;

    return (
        <Box>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                {quizCompleted && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Quiz completed! Your score: {calculateScore().toFixed(2)}%
                    </Alert>
                )}

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">{quiz.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                icon={<TimerIcon />}
                                label={`${questionTimer} seconds`}
                                color={questionTimer < 10 ? "error" : "primary"}
                            />
                        </Box>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={(currentQuestion + 1) / shuffledQuestions.length * 100}
                        sx={{ mb: 3 }}
                    />

                    <Typography variant="h6" gutterBottom>
                        Question {currentQuestion + 1} of {shuffledQuestions.length}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {shuffledQuestions[currentQuestion].question}
                    </Typography>

                    <RadioGroup
                        value={userAnswers[currentQuestion] || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                    >
                        {shuffledQuestions[currentQuestion].options.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option}
                                control={<Radio />}
                                label={option}
                                disabled={isQuestionDisabled}
                                sx={{
                                    mb: 1,
                                    p: 1,
                                    width: '100%',
                                    opacity: isQuestionDisabled ? 0.7 : 1,
                                    '&:hover': { bgcolor: !isQuestionDisabled && 'action.hover' }
                                }}
                            />
                        ))}
                    </RadioGroup>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0 || isQuestionDisabled}
                        >
                            Previous
                        </Button>

                        {currentQuestion === shuffledQuestions.length - 1 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                                disabled={isQuestionDisabled}
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={!userAnswers[currentQuestion] || isQuestionDisabled}
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default TakeQuiz;
