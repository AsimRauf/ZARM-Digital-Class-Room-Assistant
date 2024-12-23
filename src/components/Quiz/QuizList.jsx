import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    Link as MuiLink,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../Navbar';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import NoteIcon from '@mui/icons-material/Note';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SchoolIcon from '@mui/icons-material/School';

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [userData, setUserData] = useState(null);
    const [attempts, setAttempts] = useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
        fetchAttempts();
        console.log('Current attempts:', attempts);
    }, []);

    const fetchQuizzes = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/quiz/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quizzes');
            }

            const data = await response.json();
            console.log('Fetched quizzes:', data);
            setQuizzes(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
        }
    }, []);

    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/profile/${email}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleDeleteClick = (quiz) => {
        setQuizToDelete(quiz);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5000/api/quiz/${quizToDelete._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchQuizzes();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting quiz:', error);
        }
    };

    const fetchAttempts = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/quiz/attempts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            // Process attempts to store highest scores
            const attemptMap = {};
            data.forEach(attempt => {
                const quizId = attempt.quizId._id;
                if (!attemptMap[quizId] || attempt.score > attemptMap[quizId].score) {
                    attemptMap[quizId] = {
                        score: attempt.score,
                        timeSpent: attempt.timeSpent
                    };
                }
            });

            setAttempts(attemptMap);
        } catch (error) {
            console.error('Error fetching attempts:', error);
        }
    };








    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#3B1E54',
                            mb: 4,
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: 0,
                                width: '60px',
                                height: '4px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        Available Quizzes
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            border: '1px solid rgba(59, 30, 84, 0.1)',
                            background: 'white',
                            boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{
                                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                    }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Quiz Name</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Room</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Course</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Source Note</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Details</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Results</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Attempts</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Score</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {quizzes.map((quiz) => (
                                        <TableRow
                                            key={quiz._id}
                                            sx={{
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: 'rgba(59, 30, 84, 0.04)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(59, 30, 84, 0.08)'
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#3B1E54'
                                                    }}
                                                >
                                                    {quiz.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: '#5E2E87'
                                                }}>
                                                    <MeetingRoomIcon fontSize="small" />
                                                    {quiz.roomId?.name || 'General'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    color: '#5E2E87'
                                                }}>
                                                    <SchoolIcon fontSize="small" />
                                                    {quiz.courseId?.name || 'General'}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {quiz.noteId ? (
                                                    <MuiLink
                                                        component={Link}
                                                        to={`/notes/${quiz.noteId._id}`}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            color: '#2196F3',
                                                            textDecoration: 'none',
                                                            '&:hover': {
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        <NoteIcon fontSize="small" />
                                                        {quiz.noteId.title}
                                                    </MuiLink>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        No source note
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={<QuizIcon />}
                                                    label={`${quiz.questions.length} Questions`}
                                                    sx={{
                                                        bgcolor: 'rgba(59, 30, 84, 0.08)',
                                                        color: '#3B1E54',
                                                        '& .MuiChip-icon': {
                                                            color: '#3B1E54'
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            
                                            <TableCell>
                                                {attempts[quiz._id] ? (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => navigate(`/quiz-results/${quiz._id}`)}
                                                        startIcon={<AssignmentIcon />}
                                                        sx={{
                                                            borderColor: '#3B1E54',
                                                            color: '#3B1E54',
                                                            '&:hover': {
                                                                borderColor: '#5E2E87',
                                                                bgcolor: 'rgba(59, 30, 84, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        View Results
                                                    </Button>
                                                ) : (
                                                    <Chip
                                                        label="No Attempts"
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ opacity: 0.7 }}
                                                    />
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={`${quiz.totalAttempts} ${quiz.totalAttempts === 1 ? 'Attempt' : 'Attempts'}`}
                                                    sx={{
                                                        bgcolor: 'rgba(59, 30, 84, 0.08)',
                                                        color: '#3B1E54'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {attempts[quiz._id] ? (
                                                    <Chip
                                                        label={`${attempts[quiz._id].score.toFixed(1)}%`}
                                                        color={attempts[quiz._id].score >= 70 ? 'success' : 'warning'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Not Attempted"
                                                        variant="outlined"
                                                        sx={{ opacity: 0.7 }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => navigate(`/quiz/${quiz._id}`)}
                                                        sx={{
                                                            bgcolor: attempts[quiz._id] ? '#5E2E87' : '#3B1E54',
                                                            '&:hover': {
                                                                bgcolor: attempts[quiz._id] ? '#4B2E64' : '#5E2E87'
                                                            }
                                                        }}
                                                    >
                                                        {attempts[quiz._id] ? 'Retake' : 'Start'}
                                                    </Button>
                                                    <IconButton
                                                        onClick={() => handleDeleteClick(quiz)}
                                                        sx={{
                                                            color: '#FF5252',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255, 82, 82, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={() => setDeleteDialogOpen(false)}
                        PaperProps={{
                            sx: {
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.15)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ color: '#3B1E54' }}>Delete Quiz</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete this quiz? All attempts will also be deleted.
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => setDeleteDialogOpen(false)}
                                sx={{ color: '#3B1E54' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                color="error"
                                variant="contained"
                                sx={{ borderRadius: '8px' }}
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Container>
        </Box>

    );
};

export default QuizList;
