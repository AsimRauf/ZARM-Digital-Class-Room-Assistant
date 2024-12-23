import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import QuizIcon from '@mui/icons-material/Quiz';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../Navbar';

const QuizResults = () => {
    const [attempts, setAttempts] = useState([]);
    const [userData, setUserData] = useState(null);
    const { quizId } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
        }
        fetchAttempts();
    }, [quizId]);

    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/profile/${email}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAttempts = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/quiz/${quizId}/attempts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setAttempts(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    {/* Performance Overview Card */}
                    <Paper elevation={0} sx={{
                        mb: 4,
                        borderRadius: '30px',
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                        animation: 'slideIn 0.6s ease-out',
                        '@keyframes slideIn': {
                            from: { opacity: 0, transform: 'translateY(-20px)' },
                            to: { opacity: 1, transform: 'translateY(0)' }
                        }
                    }}>
                        <Box sx={{ p: 4 }}>
                            <Grid container alignItems="center" spacing={3}>
                                <Grid item>
                                    <AssessmentIcon sx={{ 
                                        fontSize: 48, 
                                        color: 'white',
                                        animation: 'pulse 2s infinite',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 0.6 },
                                            '50%': { opacity: 1 },
                                            '100%': { opacity: 0.6 }
                                        }
                                    }} />
                                </Grid>
                                <Grid item xs>
                                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                        Performance Analysis
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 1 }}>
                                        {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'} Made
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Chip
                                        icon={<QuizIcon />}
                                        label={`Best Score: ${Math.max(...attempts.map(a => a.score), 0)}%`}
                                        sx={{
                                            bgcolor: 'white',
                                            color: '#3B1E54',
                                            fontWeight: 600,
                                            '& .MuiChip-icon': { color: '#3B1E54' }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    {/* Attempts List */}
                    <Box sx={{ mt: 4 }}>
                        {attempts.map((attempt, index) => (
                            <Accordion
                                key={attempt._id}
                                defaultExpanded={index === 0}
                                sx={{
                                    mb: 2,
                                    borderRadius: '20px !important',
                                    border: '1px solid rgba(59, 30, 84, 0.1)',
                                    overflow: 'hidden',
                                    boxShadow: 'none',
                                    '&:before': { display: 'none' },
                                    '&.Mui-expanded': {
                                        margin: '0 0 16px 0',
                                        boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                                    },
                                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s`,
                                    '@keyframes fadeIn': {
                                        from: { opacity: 0, transform: 'translateY(10px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' }
                                    }
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Grid container alignItems="center" spacing={2}>
                                        <Grid item>
                                            {index === 0 ? (
                                                <Chip
                                                    icon={<NewReleasesIcon />}
                                                    label="Latest Attempt"
                                                    sx={{
                                                        bgcolor: '#3B1E54',
                                                        color: 'white',
                                                        '& .MuiChip-icon': { color: 'white' }
                                                    }}
                                                />
                                            ) : (
                                                <Chip
                                                    label={`Attempt ${attempts.length - index}`}
                                                    variant="outlined"
                                                    color="primary"
                                                />
                                            )}
                                        </Grid>
                                        <Grid item>
                                            <Chip
                                                label={`${attempt.score}%`}
                                                color={attempt.score >= 70 ? 'success' : 'warning'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Grid>
                                        <Grid item xs>
                                            <Typography sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: 'text.secondary'
                                            }}>
                                                <AccessTimeIcon fontSize="small" />
                                                {new Date(attempt.createdAt).toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>

                                <AccordionDetails sx={{ p: 3 }}>
                                    <Box sx={{ display: 'grid', gap: 3 }}>
                                        {attempt.answers.map((answer, qIndex) => (
                                            <Paper
                                                key={qIndex}
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(59, 30, 84, 0.1)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                                                    }
                                                }}
                                            >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" color="primary" gutterBottom>
                                                            Question {qIndex + 1}
                                                        </Typography>
                                                        <Typography>{answer.question}</Typography>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mt: 2
                                                        }}>
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
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 2 }} />
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Explanation
                                                        </Typography>
                                                        <Typography>
                                                            {answer.explanation}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        ))}
                                    </Box>
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
