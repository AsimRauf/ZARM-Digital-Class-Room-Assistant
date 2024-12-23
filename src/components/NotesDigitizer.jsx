import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    TextField,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Container,
    alpha
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const steps = ['Upload Notes', 'Processing', 'Review & Save'];

const NotesDigitizer = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [convertedNote, setConvertedNote] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState(null);
    const [saveStatus, setSaveStatus] = useState('unsaved');

    useEffect(() => {
        fetchUserRooms();
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

    const fetchUserRooms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRoomSelect = (roomId) => {
        setSelectedRoom(roomId);
        fetchCourses(roomId);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setSelectedFile(file);
        setActiveStep(1);
        setProcessing(true);

        try {
            const response = await fetch('http://localhost:5000/api/gemini/convert', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setConvertedNote(result.data);
                setActiveStep(2);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveNote = async () => {
        if (!selectedRoom || !selectedCourse || !convertedNote || !noteTitle) return;
        setSaving(true);
        setSaveStatus('saving');

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/rooms/${selectedRoom}/courses/${selectedCourse}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: noteTitle,
                    content: convertedNote.content,
                    htmlContent: convertedNote.content
                })
            });

            const savedNote = await response.json();
            console.log('Note saved successfully:', savedNote);
            setSaveStatus('saved');
            setActiveStep(3);
        } catch (error) {
            console.error('Error saving note:', error);
            setSaveStatus('unsaved');
        } finally {
            setSaving(false);
        }
    };

    const fetchCourses = async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log('Fetched courses:', data);
            setCourses(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (selectedRoom) {
            fetchCourses(selectedRoom);
        }
    }, [selectedRoom]);

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{
                    mt: { xs: 8, md: 8 },
                    mb: 4,
                    textAlign: 'center'
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#3B1E54',
                            position: 'relative',
                            display: 'inline-block',
                            mb: 4,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
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
                        AI Notes Digitizer
                    </Typography>

                    {/* Desktop Stepper */}
                    <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Stepper
                            activeStep={activeStep}
                            sx={{
                                mb: 6,
                                '& .MuiStepLabel-root .Mui-completed': {
                                    color: '#3B1E54',
                                },
                                '& .MuiStepLabel-root .Mui-active': {
                                    color: '#5E2E87',
                                }
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {/* Mobile Stepper */}
                    <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Typography variant="h6" sx={{
                            color: '#3B1E54',
                            mb: 2,
                            fontWeight: 600
                        }}>
                            Step {activeStep + 1} of {steps.length}
                        </Typography>
                        <Box sx={{ width: '100%', display: 'flex', px: 2 }}>
                            {steps.map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        flex: 1,
                                        height: 4,
                                        bgcolor: index <= activeStep ? '#3B1E54' : 'rgba(59, 30, 84, 0.2)',
                                        mx: 0.5,
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: '20px',
                            border: '1px solid rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                            boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                        }}
                    >
                        {activeStep === 0 && (
                            <Box sx={{
                                textAlign: 'center',
                                py: { xs: 4, sm: 6, md: 8 },
                                background: 'rgba(59, 30, 84, 0.02)',
                                borderRadius: '16px',
                                border: '2px dashed rgba(59, 30, 84, 0.1)'
                            }}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{
                                        bgcolor: '#3B1E54',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '12px',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#4B2E64',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 20px rgba(59, 30, 84, 0.3)'
                                        }
                                    }}
                                >
                                    Upload Handwritten Notes
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                    />
                                </Button>
                            </Box>
                        )}

                        {processing && (
                            <Box sx={{
                                textAlign: 'center',
                                py: { xs: 4, sm: 6, md: 8 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 3
                            }}>
                                <CircularProgress
                                    size={60}
                                    thickness={4}
                                    sx={{
                                        color: '#3B1E54',
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#3B1E54',
                                        fontWeight: 600
                                    }}
                                >
                                    Converting your notes...
                                </Typography>
                            </Box>
                        )}

                        {convertedNote && (
                            <Box sx={{ animation: 'slideUp 0.5s ease-out' }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 2, sm: 3, md: 4 },
                                        mb: 4,
                                        maxHeight: '500px',
                                        overflow: 'auto',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(59, 30, 84, 0.1)',
                                        '&::-webkit-scrollbar': {
                                            width: '8px'
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px'
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#3B1E54',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: '#4B2E64'
                                            }
                                        }
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: convertedNote.content }}
                                        className="note-content"
                                        style={{ textAlign: 'left' }}
                                    />
                                </Paper>

                                <Box sx={{ width: '100%' }}>
                                    {/* Note Title Field */}
                                    <TextField
                                        fullWidth
                                        label="Note Title"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: alpha('#3B1E54', 0.4),
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                                                padding: '0 8px',
                                                marginLeft: '-4px'
                                            },
                                            '& .MuiInputLabel-shrink': {
                                                transform: 'translate(14px, -9px) scale(0.75)'
                                            }
                                        }}
                                        required
                                    />

                                    {/* Room Selection Field */}
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel
                                            sx={{
                                                background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                                                padding: '0 8px',
                                                marginLeft: '-4px',
                                                '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(14px, -9px) scale(0.75)'
                                                }
                                            }}
                                        >
                                            Select Room
                                        </InputLabel>
                                        <Select
                                            value={selectedRoom}
                                            onChange={(e) => handleRoomSelect(e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(59, 30, 84, 0.2)'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha('#3B1E54', 0.4)
                                                }
                                            }}
                                            MenuProps={{
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
                                            }}
                                        >
                                            {rooms.map(room => (
                                                <MenuItem key={room._id} value={room._id}>
                                                    {room.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Course Selection Field */}
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel
                                            sx={{
                                                background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                                                padding: '0 8px',
                                                marginLeft: '-4px',
                                                '&.MuiInputLabel-shrink': {
                                                    transform: 'translate(14px, -9px) scale(0.75)'
                                                }
                                            }}
                                        >
                                            Select Course
                                        </InputLabel>
                                        <Select
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                textAlign: 'left',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(59, 30, 84, 0.2)'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: alpha('#3B1E54', 0.4)
                                                }
                                            }}
                                            MenuProps={{
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
                                            }}
                                        >
                                            {courses.map(course => (
                                                <MenuItem key={course._id} value={course._id}>
                                                    {course.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                

                                <Button
                                    variant="contained"
                                    startIcon={saveStatus === 'saved' ? <CheckIcon /> : <SaveIcon />}
                                    onClick={handleSaveNote}
                                    disabled={!selectedCourse || saving || saveStatus === 'saved'}
                                    fullWidth
                                    sx={{
                                        bgcolor: saveStatus === 'saved' ? '#2E7D32' : '#3B1E54',
                                        py: 1.5,
                                        borderRadius: '12px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: saveStatus === 'saved'
                                            ? '0 4px 14px rgba(46, 125, 50, 0.25)'
                                            : '0 4px 14px rgba(59, 30, 84, 0.25)',
                                        '&:hover': {
                                            bgcolor: saveStatus === 'saved' ? '#1B5E20' : '#4B2E64',
                                            transform: 'translateY(-2px)',
                                            boxShadow: saveStatus === 'saved'
                                                ? '0 6px 20px rgba(46, 125, 50, 0.3)'
                                                : '0 6px 20px rgba(59, 30, 84, 0.3)'
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: saveStatus === 'saved' ? '#2E7D32' : 'rgba(59, 30, 84, 0.12)',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    {saveStatus === 'saving' ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" />
                                            Saving...
                                        </Box>
                                    ) : saveStatus === 'saved' ? (
                                        'Saved!'
                                    ) : (
                                        'Save Note'
                                    )}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};

export default NotesDigitizer;
