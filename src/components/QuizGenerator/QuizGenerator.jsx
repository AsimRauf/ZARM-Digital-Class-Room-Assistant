import React, { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

    const MobileStepper = ({ activeStep, steps }) => (
        <Box sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
        }}>
            <Typography
                variant="h6"
                sx={{
                    color: '#3B1E54',
                    mb: 2,
                    fontWeight: 600
                }}
            >
                Step {activeStep + 1} of {steps.length}
            </Typography>
            <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                px: 2
            }}>
                {steps.map((label, index) => (
                    <Box
                        key={label}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1
                        }}
                    >
                        <Box sx={{
                            width: '100%',
                            height: 4,
                            bgcolor: index <= activeStep ? '#3B1E54' : 'rgba(59, 30, 84, 0.2)',
                            transition: 'all 0.3s ease'
                        }} />
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 1,
                                color: index <= activeStep ? '#3B1E54' : 'text.secondary',
                                fontSize: '0.75rem',
                                textAlign: 'center'
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );




    return (
        <Box>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{
                    mt: 8,
                    mb: 4,
                    textAlign: 'center'
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            textAlign: { xs: 'left', sm: 'center' },
                            color: '#3B1E54',
                            position: 'relative',
                            display: 'inline-block',
                            mb: 4,
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '60px',
                                height: '4px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        AI Quiz Generator
                    </Typography>

                    {/* Stepper */}
                    <>
                        <Stepper
                            activeStep={activeStep}
                            sx={{
                                mb: 4,
                                display: { xs: 'none', md: 'flex' } // Hide on mobile
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        <MobileStepper activeStep={activeStep} steps={steps} />
                    </>

                    {/* Step 1: Content Selection */}
                    {activeStep === 0 && (
                        <Paper sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: { xs: '16px', sm: '20px' },
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)'
                        }}>
                            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Select Room"
                                        value={selectedRoom}
                                        onChange={(e) => setSelectedRoom(e.target.value)}
                                        SelectProps={{
                                            MenuProps: {
                                                disableScrollLock: true,
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: '300px',
                                                        textAlign: 'left',
                                                        '&::-webkit-scrollbar': {
                                                            display: 'none'
                                                        },
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none'
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            }
                                        }}
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
                                        disabled={!selectedRoom}
                                        SelectProps={{
                                            MenuProps: {
                                                disableScrollLock: true,
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: '300px',
                                                        '&::-webkit-scrollbar': {
                                                            display: 'none'
                                                        },
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none'
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            }
                                        }}
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
                                        disabled={!selectedCourse}
                                        SelectProps={{
                                            MenuProps: {
                                                disableScrollLock: true,
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: '300px',
                                                        '&::-webkit-scrollbar': {
                                                            display: 'none'
                                                        },
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none'
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            }
                                        }}
                                    >
                                        {notes.map(note => (
                                            <MenuItem key={note._id} value={note._id}>
                                                {note.title}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>


                            <Box sx={{
                                mt: 4,
                                display: 'flex',
                                justifyContent: 'flex-end'
                            }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setActiveStep(1)}
                                    disabled={!selectedNote}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        padding: '12px 32px',
                                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                        boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #4B2E64, #6E3E97)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(59, 30, 84, 0.3)',
                                        }
                                    }}
                                >
                                    Next: Configure Quiz
                                </Button>
                            </Box>
                        </Paper>
                    )}


                    {/* Step 2: Quiz Configuration */}
                    {activeStep === 1 && (
                        <Paper sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)'
                        }}>
                            <Grid container spacing={{ xs: 2, sm: 3 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Quiz Title"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        required
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                },
                                                '& fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.2),
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: alpha('#3B1E54', 0.8),
                                            }
                                        }}
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
                                        SelectProps={{
                                            MenuProps: {
                                                disableScrollLock: true,
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: '300px',
                                                        '&::-webkit-scrollbar': {
                                                            display: 'none'
                                                        },
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none'
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            }
                                        }}
                                    >
                                        {difficultyLevels.map((level) => (
                                            <MenuItem
                                                key={level.value}
                                                value={level.value}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    py: 1.5
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: level.value === 'beginner' ? '#4CAF50' :
                                                        level.value === 'intermediate' ? '#FFA726' : '#F44336'
                                                }} />
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
                                        InputProps={{
                                            inputProps: { min: 5, max: 20 },
                                            sx: {
                                                borderRadius: '12px'
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                        mt: 2
                                    }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setActiveStep(0)}
                                            startIcon={<ArrowBackIcon />}
                                            sx={{
                                                borderRadius: '12px',
                                                borderColor: '#3B1E54',
                                                color: '#3B1E54',
                                                padding: '12px 32px',
                                                '&:hover': {
                                                    borderColor: '#5E2E87',
                                                    background: 'rgba(59, 30, 84, 0.04)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => setActiveStep(2)}
                                            disabled={!quizTitle}
                                            endIcon={<AutoAwesomeIcon />}
                                            sx={{
                                                borderRadius: '12px',
                                                padding: '12px 32px',
                                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                                boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(59, 30, 84, 0.3)',
                                                },
                                                '&:disabled': {
                                                    background: '#E0E0E0'
                                                }
                                            }}
                                        >
                                            Generate Quiz
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    )}


                    {/* Step 3: Generation Screen */}
                    {activeStep === 2 && (
                        <Paper sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                            textAlign: 'center',
                            maxWidth: { xs: '100%', sm: '600px' },
                            margin: '0 auto'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                {loading ? (
                                    <>
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'inline-flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <CircularProgress
                                                size={80}
                                                thickness={4}
                                                sx={{
                                                    color: '#3B1E54',
                                                    animation: 'pulse 2s infinite'
                                                }}
                                            />
                                            <AutoAwesomeIcon
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: 32,
                                                    color: '#5E2E87',
                                                    animation: 'sparkle 1.5s infinite'
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#3B1E54',
                                                fontWeight: 600,
                                                mb: 1
                                            }}
                                        >
                                            Generating Quiz Questions
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                maxWidth: '400px',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            Our AI is analyzing your content and crafting engaging questions...
                                        </Typography>
                                    </>
                                ) : error ? (
                                    <Box sx={{ width: '100%' }}>
                                        <Alert
                                            severity="error"
                                            sx={{
                                                borderRadius: '12px',
                                                '& .MuiAlert-icon': {
                                                    fontSize: '2rem'
                                                }
                                            }}
                                        >
                                            {error}
                                        </Alert>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setActiveStep(1)}
                                            sx={{
                                                mt: 3,
                                                borderRadius: '12px',
                                                borderColor: '#3B1E54',
                                                color: '#3B1E54',
                                                '&:hover': {
                                                    borderColor: '#5E2E87',
                                                    background: 'rgba(59, 30, 84, 0.04)'
                                                }
                                            }}
                                        >
                                            Go Back
                                        </Button>
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{
                                            bgcolor: alpha('#3B1E54', 0.04),
                                            borderRadius: '20px',
                                            p: 4,
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <QuizIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: '#3B1E54'
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: '#3B1E54',
                                                    fontWeight: 600
                                                }}
                                            >
                                                Ready to Generate Quiz
                                            </Typography>
                                            <Typography
                                                color="text.secondary"
                                                align="center"
                                                sx={{ mb: 2 }}
                                            >
                                                Click below to start generating {quizConfig.numberOfQuestions} {quizConfig.difficulty} level questions
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={generateQuiz}
                                                size="large"
                                                startIcon={<AutoAwesomeIcon />}
                                                sx={{
                                                    borderRadius: '12px',
                                                    padding: '12px 36px',
                                                    background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                                    boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(45deg, #4B2E64, #6E3E97)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px rgba(59, 30, 84, 0.3)'
                                                    }
                                                }}
                                            >
                                                Generate Quiz
                                            </Button>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Paper>
                    )}

                    {/* Step 4: Generated Quiz Display */}
                    {activeStep === 3 && (
                        <Paper sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)'
                        }}>
                            <Box sx={{
                                mb: 4,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                width: '100%',
                                borderBottom: '2px solid rgba(59, 30, 84, 0.1)',
                                pb: 3
                            }}>
                                <Box sx={{
                                    flex: 1, flexDirection: { xs: 'column', sm: 'row' },
                                    gap: { xs: 2, sm: 0 }
                                }}>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: '#3B1E54',
                                            fontWeight: 700,
                                            mb: 1,
                                            textAlign: 'left',
                                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                                        }}
                                    >
                                        {generatedQuiz.title}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            color: alpha('#3B1E54', 0.6),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                        }}
                                    >
                                        <QuizIcon sx={{ fontSize: 20 }} />
                                        {generatedQuiz.questions.length} Questions • {quizConfig.difficulty} Level
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    startIcon={isSaved ? <CheckCircleIcon /> : <SaveIcon />}
                                    onClick={handleSaveQuiz}
                                    disabled={isSaving || isSaved}
                                    sx={{
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        background: isSaved
                                            ? 'linear-gradient(45deg, #4CAF50, #45a049)'
                                            : 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                        boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(59, 30, 84, 0.3)'
                                        },
                                        '&:disabled': {
                                            background: isSaved
                                                ? 'linear-gradient(45deg, #4CAF50, #45a049)'
                                                : '#E0E0E0'
                                        }
                                    }}
                                >
                                    {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Quiz'}
                                </Button>
                            </Box>

                            <Box sx={{ mt: 4 }}>
                                {generatedQuiz.questions.map((question, index) => (
                                    <Paper
                                        key={index}
                                        elevation={0}
                                        sx={{
                                            p: 4,
                                            mb: 3,
                                            borderRadius: '16px',
                                            border: '1px solid rgba(59, 30, 84, 0.1)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#3B1E54',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 2,
                                                mb: 3,
                                                textAlign: 'left',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            <Box sx={{
                                                minWidth: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                fontWeight: 600,
                                                flexShrink: 0,
                                                marginTop: '2px',
                                            }}>
                                                {index + 1}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>{question.question}</Box>
                                        </Typography>

                                        <Grid container spacing={2}>
                                            {question.options.map((option, optIndex) => (
                                                <Grid item xs={12} sm={6} key={optIndex}>
                                                    <Paper
                                                        sx={{
                                                            p: { xs: 2, sm: 3 },
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            border: '1px solid rgba(59, 30, 84, 0.1)',
                                                            transition: 'all 0.2s ease',
                                                            height: '100%',
                                                            '&:hover': {
                                                                background: alpha('#3B1E54', 0.04),
                                                                transform: 'translateX(4px)'
                                                            }
                                                        }}
                                                    >
                                                        <Typography sx={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: 1.5,
                                                            textAlign: 'left',
                                                        }}>
                                                            <Box sx={{
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: '50%',
                                                                border: '2px solid rgba(59, 30, 84, 0.2)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.8rem',
                                                                color: alpha('#3B1E54', 0.6),
                                                                flexShrink: 0,
                                                                marginTop: '2px'
                                                            }}>
                                                                {String.fromCharCode(65 + optIndex)}
                                                            </Box>
                                                            <Box sx={{ flex: 1, alignSelf: 'flex-start', justifySelf: 'flex-start' }}>{option}</Box> {/* Added container for option text */}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                ))}
                            </Box>

                            <Box sx={{
                                mt: 4,
                                pt: 3,
                                borderTop: '2px solid rgba(59, 30, 84, 0.1)',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setActiveStep(2)}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        borderColor: '#3B1E54',
                                        color: '#3B1E54',
                                        '&:hover': {
                                            borderColor: '#5E2E87',
                                            background: 'rgba(59, 30, 84, 0.04)'
                                        }
                                    }}
                                >
                                    Generate Another
                                </Button>
                                {!isSaved && (
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveQuiz}
                                        startIcon={<SaveIcon />}
                                        sx={{
                                            borderRadius: '12px',
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                            }
                                        }}
                                    >
                                        Save Quiz
                                    </Button>
                                )}
                            </Box>
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
