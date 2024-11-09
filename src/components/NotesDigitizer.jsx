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
    Alert
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
        <Box>
            <Navbar userData={userData} />
            <Box sx={{ p: 4 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper sx={{ p: 3 }}>
                    {activeStep === 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
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
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <CircularProgress />
                            <Typography sx={{ mt: 2 }}>
                                Converting your notes...
                            </Typography>
                        </Box>
                    )}

                    {convertedNote && (
                        <Box>
                            <Paper
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    maxHeight: '500px',
                                    overflow: 'auto'
                                }}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: convertedNote.content }}
                                    className="note-content"
                                />
                            </Paper>

                            <TextField
                                fullWidth
                                label="Note Title"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                sx={{ mb: 2 }}
                                required
                            />

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Room</InputLabel>
                                <Select
                                    value={selectedRoom}
                                    onChange={(e) => handleRoomSelect(e.target.value)}
                                >
                                    {rooms.map(room => (
                                        <MenuItem key={room._id} value={room._id}>
                                            {room.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {selectedRoom && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select Course</InputLabel>
                                    <Select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        {courses.map(course => (
                                            <MenuItem key={course._id} value={course._id}>
                                                {course.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <Button
                                variant="contained"
                                startIcon={saveStatus === 'saved' ? <CheckIcon /> : <SaveIcon />}
                                onClick={handleSaveNote}
                                disabled={!selectedCourse || saving || saveStatus === 'saved'}
                                fullWidth
                                sx={{
                                    bgcolor: saveStatus === 'saved' ? 'success.main' : 'primary.main',
                                    '&:disabled': {
                                        bgcolor: saveStatus === 'saved' ? 'success.main' : 'grey.400',
                                        color: 'white'
                                    }
                                }}
                            >
                                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Note'}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default NotesDigitizer;
