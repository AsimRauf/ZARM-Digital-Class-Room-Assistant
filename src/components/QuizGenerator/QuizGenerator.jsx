import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';
import {
    Box,
    Container,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Paper,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from '../Navbar';
import { jwtDecode } from 'jwt-decode';

const steps = [
    'Select Content',
    'Configure Quiz',
    'Generate Questions',
    'Review & Save'
];

const QuizGenerator = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [quizConfig, setQuizConfig] = useState({
        difficulty: 'intermediate',
        questionTypes: ['mcq'],
        numberOfQuestions: 10,
        timeLimit: 30
    });

    const difficultyLevels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
    ];

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        fetchUserData()
        fetchRooms()
    }, [])

    useEffect(() => {
        if (selectedRoom) {
            fetchCourses(selectedRoom)
        }
    }, [selectedRoom])

    useEffect(() => {
        if (selectedCourse) {
            fetchNotes(selectedRoom, selectedCourse)
        }
    }, [selectedCourse])

    const fetchUserData = async () => {
        const token = localStorage.getItem('token')
        try {
            const decoded = jwtDecode(token)
            const response = await fetch(`http://localhost:5000/api/user/profile/${decoded.email}`)
            const data = await response.json()
            setUserData(data)
        } catch (error) {
            setError('Error fetching user data')
        }
    }

    const fetchRooms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            setError('Error fetching rooms');
        }
    };

    const fetchCourses = async (roomId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            setError('Error fetching courses');
        }
    };

    const fetchNotes = async (roomId, courseId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/rooms/${roomId}/courses/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            setError('Error fetching notes');
        }
    };

    const handleSaveQuiz = async () => {
        if (isSaving || isSaved) return;

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:5000/api/quiz/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(generatedQuiz)
            });

            if (response.ok) {
                setIsSaved(true);
                showSnackbar('Quiz saved successfully');
            }
        } catch (error) {
            showSnackbar('Failed to save quiz', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const generateQuiz = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Starting quiz generation with:', {
            noteId: selectedNote,
            title: quizTitle,
            config: quizConfig
        });

        try {
            const response = await fetch('http://localhost:5000/api/quiz/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    noteId: selectedNote,
                    title: quizTitle,
                    config: quizConfig
                })
            });

            const data = await response.json();
            console.log('Generated quiz data:', data);
            setGeneratedQuiz(data);
            setActiveStep(3);
        } catch (error) {
            console.error('Quiz generation error:', error);
            setError('Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };





    return (
        <Box>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        AI Quiz Generator
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {activeStep === 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Room"
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        size="small"
                                    >
                                        {rooms.map(room => (
                                            <MenuItem key={room._id} value={room._id}>
                                                {room.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Course"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        size="small"
                                        disabled={!selectedRoom}
                                    >
                                        {courses.map(course => (
                                            <MenuItem key={course._id} value={course._id}>
                                                {course.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Note"
                                        value={selectedNote}
                                        onChange={(e) => setSelectedNote(e.target.value)}
                                        size="small"
                                        disabled={!selectedCourse}
                                    >
                                        {notes.map(note => (
                                            <MenuItem key={note._id} value={note._id}>
                                                {note.title}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep(1)}
                                        disabled={!selectedNote}
                                    >
                                        Next: Configure Quiz
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {activeStep === 1 && (
                        <Paper sx={{ p: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Quiz Title"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Difficulty Level"
                                        value={quizConfig.difficulty}
                                        onChange={(e) => setQuizConfig({
                                            ...quizConfig,
                                            difficulty: e.target.value
                                        })}
                                    >
                                        {difficultyLevels.map((level) => (
                                            <MenuItem key={level.value} value={level.value}>
                                                {level.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        label="Number of Questions"
                                        value={quizConfig.numberOfQuestions}
                                        onChange={(e) => setQuizConfig({
                                            ...quizConfig,
                                            numberOfQuestions: parseInt(e.target.value)
                                        })}
                                        InputProps={{ inputProps: { min: 5, max: 20 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setActiveStep(0)}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setActiveStep(2)}
                                        disabled={!quizTitle}
                                    >
                                        Generate Quiz
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}

                    {activeStep === 2 && (
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    Generating Quiz Questions
                                </Typography>
                                {loading && (
                                    <Box sx={{ my: 4 }}>
                                        <CircularProgress />
                                        <Typography sx={{ mt: 2 }}>
                                            Analyzing content and creating questions...
                                        </Typography>
                                    </Box>
                                )}
                                {error && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}
                                {!loading && !error && (
                                    <Button
                                        variant="contained"
                                        onClick={generateQuiz}
                                        size="large"
                                    >
                                        Start Generation
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    )}

                    {activeStep === 3 && (
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h5">
                                    {generatedQuiz.title}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveQuiz}
                                    disabled={isSaving || isSaved}
                                >
                                    {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Quiz'}
                                </Button>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {generatedQuiz.questions.length} Questions • {quizConfig.difficulty} Level
                                </Typography>
                            </Box>

                            {generatedQuiz.questions.map((question, index) => (
                                <Paper
                                    key={index}
                                    elevation={1}
                                    sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0' }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        {index + 1}. {question.question}
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        {question.options.map((option, optIndex) => (
                                            <Grid item xs={12} sm={6} key={optIndex}>
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        cursor: 'pointer',
                                                        bgcolor: 'background.default',
                                                        '&:hover': { bgcolor: 'action.hover' }
                                                    }}
                                                >
                                                    {option}
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            ))}
                        </Paper>
                    )}

                </Box>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>


    );

};

export default QuizGenerator;
