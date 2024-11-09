import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Chip,
    Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { Container } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../Navbar';

const QuizResults = () => {
    const [attempts, setAttempts] = useState([]);
    const [userData, setUserData] = useState(null);
    const { quizId } = useParams();

    useEffect(() => {
        fetchAttempts();
    }, [quizId]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                const response = await fetch(`http://localhost:5000/api/user/profile/${decoded.email}`);
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchUserData();
    }, []);

    const fetchAttempts = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/quiz/${quizId}/attempts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setAttempts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };

    return (
        <Box>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    <Box sx={{ 
                        textAlign: 'center', 
                        mb: 4,
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        borderRadius: 2,
                        p: 4,
                        color: 'white',
                        boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)'
                    }}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: 'uppercase'
                        }}>
                            Quiz Performance Analysis
                        </Typography>
                    </Box>
    
                    <Box sx={{ overflowX: 'hidden' }}>
                        {attempts.map((attempt, index) => (
                            <Accordion 
                                key={attempt._id} 
                                defaultExpanded={index === 0}
                                TransitionProps={{ unmountOnExit: true }}
                                sx={{
                                    mb: 2,
                                    boxShadow: index === 0 ? 3 : 1,
                                    borderRadius: 2,
                                    '&:before': { display: 'none' },
                                    '&.Mui-expanded': {
                                        margin: '0 0 16px 0'
                                    },
                                    transition: 'margin 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
                                }}
                            >
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                    sx={{
                                        bgcolor: index === 0 ? 'primary.main' : 'primary.dark',
                                        color: 'white',
                                        borderRadius: '8px 8px 0 0',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2, 
                                        width: '100%' 
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: index === 0 ? 600 : 400 }}>
                                            {index === 0 ? '🎯 Latest Attempt' : `Attempt ${attempts.length - index}`}
                                        </Typography>
                                        <Chip 
                                            label={`${attempt.score}%`}
                                            color={attempt.score >= 70 ? 'success' : 'warning'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        <Typography sx={{ ml: 'auto' }}>
                                            {new Date(attempt.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 3 }}>
                                    {attempt.answers.map((answer, qIndex) => (
                                        <Paper 
                                            key={qIndex} 
                                            sx={{ 
                                                p: 3, 
                                                mb: 2,
                                                borderLeft: '4px solid',
                                                borderColor: answer.isCorrect ? 'success.main' : 'error.main',
                                                transition: 'transform 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <Typography variant="h6" color="primary.main" gutterBottom>
                                                Question {qIndex + 1}
                                            </Typography>
                                            <Typography gutterBottom>{answer.question}</Typography>
                                            
                                            <Box sx={{ display: 'flex', gap: 1, my: 2, alignItems: 'center' }}>
                                                {answer.isCorrect ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CancelIcon color="error" />
                                                )}
                                                <Typography sx={{ 
                                                    color: answer.isCorrect ? 'success.main' : 'error.main',
                                                    fontWeight: 500
                                                }}>
                                                    Your Answer: {answer.selectedAnswer}
                                                </Typography>
                                            </Box>
                                            
                                            <Typography sx={{ color: 'primary.main', mb: 2, fontWeight: 500 }}>
                                                Correct Answer: {answer.correctAnswer}
                                            </Typography>
                                            
                                            <Paper sx={{ 
                                                p: 2, 
                                                bgcolor: 'grey.50',
                                                border: '1px solid',
                                                borderColor: 'grey.200'
                                            }}>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    Explanation
                                                </Typography>
                                                <Typography>
                                                    {answer.explanation}
                                                </Typography>
                                            </Paper>
                                        </Paper>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
    
    
    
};

export default QuizResults;
