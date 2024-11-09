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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
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
            const response = await fetch('http://localhost:5000/api/quiz/all-attempts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Raw attempts data:', data);

            // Map attempts using the quizId from the attempt data
            const attemptMap = {};
            data.forEach(attempt => {
                attemptMap[attempt.quizId._id || attempt.quizId] = {
                    score: attempt.score,
                    timeSpent: attempt.timeSpent
                };
            });
            console.log('Quiz IDs in map:', Object.keys(attemptMap));
            setAttempts(attemptMap);
        } catch (error) {
            console.error('Error:', error);
        }
    };





    return (
        <Box>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Quiz</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this quiz? All attempts will also be deleted.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Navbar userData={userData} />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    Available Quizzes
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white' }}>Quiz Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Room</TableCell>
                                <TableCell sx={{ color: 'white' }}>Course</TableCell>
                                <TableCell sx={{ color: 'white' }}>Source Note</TableCell>
                                <TableCell sx={{ color: 'white' }}>Details</TableCell>
                                <TableCell sx={{ color: 'white' }}>View Results</TableCell>
                                <TableCell sx={{ color: 'white' }}>Total Attempts</TableCell>
                                <TableCell sx={{ color: 'white' }}>Score</TableCell>
                                <TableCell sx={{ color: 'white' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quizzes.map((quiz) => (
                                <TableRow
                                    key={quiz._id}
                                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <TableCell>
                                        <Typography variant="body1">
                                            {quiz.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MeetingRoomIcon fontSize="small" />
                                            {quiz.roomId?.name || 'General'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SchoolIcon fontSize="small" />
                                            {quiz.courseId ? quiz.courseId.name : 'General'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <MuiLink
                                            component={Link}
                                            to={`/notes/${quiz.noteId._id}`}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                        >
                                            <NoteIcon fontSize="small" />
                                            {quiz.noteId.title}
                                        </MuiLink>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                size="small"
                                                label={`${quiz.questions.length} Questions`}
                                                icon={<QuizIcon />}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {attempts[quiz._id] && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/quiz-results/${quiz._id}`)}
                                                startIcon={<AssignmentIcon />}
                                            >
                                                View Answers
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${quiz.totalAttempts} ${quiz.totalAttempts === 1 ? 'Attempt' : 'Attempts'}`}
                                            color="default"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {attempts && attempts[quiz._id] ? (
                                            <Chip
                                                label={`${attempts[quiz._id].score.toFixed(1)}%`}
                                                color={attempts[quiz._id].score >= 70 ? 'success' : 'warning'}
                                                sx={{ fontWeight: 'bold' }}
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
                                                color={attempts[quiz._id] ? "secondary" : "primary"}
                                            >
                                                {attempts[quiz._id] ? 'Retake' : 'Start'}
                                            </Button>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(quiz)}
                                                size="small"
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
            </Container>
        </Box>
    );
};

export default QuizList;
