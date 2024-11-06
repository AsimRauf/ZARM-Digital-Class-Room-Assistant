import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    LinearProgress,
    Paper,
    Tabs,
    Tab,
    IconButton,
    Grid,
    Divider,
    Alert,
    Snackbar,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';

const VideoSummarizer = () => {
    const [uploading, setUploading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [processedData, setProcessedData] = useState(null);
    const [videoHistory, setVideoHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStage, setProcessingStage] = useState('');
    const fileInputRef = useRef();
    const socketRef = useRef();

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

    useEffect(() => {
        fetchVideoHistory();
    }, []);

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchCourses(selectedRoom);
        }
    }, [selectedRoom]);

    const fetchRooms = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setRooms(data);
    };

    const fetchCourses = async (roomId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCourses(data);
    };

    const cleanHtmlContent = (content) => {
        return content
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
    };

    const fetchVideoHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/video/content', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setVideoHistory(data);
        } catch (error) {
            showSnackbar('Error fetching history', 'error');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('video', file);
        setUploading(true);
    
        try {
            const token = localStorage.getItem('token');
            
            // Socket connection for progress updates
            socketRef.current = io('http://localhost:5000');
            socketRef.current.on('processing:progress', (data) => {
                setUploadProgress(data.progress);
                setProcessingStage(data.stage);
            });
    
            const response = await fetch('http://localhost:5000/api/video/process', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
    
            const data = await response.json();
            setProcessedData(data); // Just store the processed data, don't save yet
            showSnackbar('Video processed successfully. Select room and course to save.');
        } catch (error) {
            showSnackbar('Processing failed', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    

    const handleSaveContent = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/video/content/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: selectedRoom,
                    courseId: selectedCourse,
                    content: processedData
                })
            });
            showSnackbar('Content saved successfully');
        } catch (error) {
            showSnackbar('Failed to save content', 'error');
        }
    };
    


    const downloadNotes = () => {
        const blob = new Blob([processedData.notes], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${processedData.fileName}-notes.html`;
        a.click();
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDeleteVideo = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/video/content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchVideoHistory();
            showSnackbar('Video deleted successfully');
        } catch (error) {
            showSnackbar('Failed to delete video', 'error');
        }
    };

    return (
        <Box>
            <Navbar userData={userData} />

            <Container maxWidth="lg">
                <Box sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'  // Centers children horizontally
                }}>
                    <Typography variant="h4" sx={{
                        mb: 3,
                        fontWeight: 600,
                        textAlign: 'center',  // Centers the text itself
                        width: '100%'  // Takes full width for proper centering
                    }}>
                        AI-Powered Video Intelligence
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Paper sx={{ p: 3, flex: 1 }}>
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="contained"
                                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                {uploading ? 'Transforming Knowledge...' : 'Upload Video Lecture'}
                            </Button>
                        </Paper>
                        <Button
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            onClick={() => setShowHistory(!showHistory)}
                            sx={{ minWidth: 120 }}
                        >
                            Archives
                        </Button>
                    </Box>

                    {uploading && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Processing Pipeline</Typography>
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography color="primary">
                                    {uploadProgress < 25 && "🎥 Extracting Audio Essence..."}
                                    {uploadProgress >= 25 && uploadProgress < 50 && "🔊 Magnifying Vocal Patterns..."}
                                    {uploadProgress >= 50 && uploadProgress < 75 && "✨ Weaving Knowledge Threads..."}
                                    {uploadProgress >= 75 && "🧠 Crystallizing Insights..."}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {showHistory && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h5" gutterBottom>Knowledge Archive</Typography>
                            <Grid container spacing={2}>
                                {videoHistory.map((video) => (
                                    <Grid item xs={12} md={6} key={video._id}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="h6">{video.fileName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Processed on {new Date(video.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <IconButton onClick={() => setProcessedData(video)}>
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDeleteVideo(video._id)} color="error">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        justifyContent: 'center'
                    }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Select Room</InputLabel>
                            <Select
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                            >
                                {rooms.map(room => (
                                    <MenuItem key={room._id} value={room._id}>
                                        {room.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Select Course</InputLabel>
                            <Select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                disabled={!selectedRoom}
                            >
                                {courses.map(course => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            disabled={!selectedRoom || !selectedCourse || !processedData}
                            onClick={handleSaveContent}
                            startIcon={<SaveIcon />}
                        >
                            Save to Course
                        </Button>
                    </Box>

                    {processedData && (
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                <Tabs
                                    value={currentTab}
                                    onChange={(e, v) => setCurrentTab(v)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                >
                                    <Tab label="Executive Summary" />
                                    <Tab label="Enhanced Notes" />
                                    <Tab label="Key Insights" />
                                    <Tab label="Full Transcript" />
                                </Tabs>
                            </Box>

                            <Box sx={{ position: 'relative' }}>
                                {currentTab === 1 && (
                                    <IconButton
                                        onClick={downloadNotes}
                                        sx={{ position: 'absolute', right: 0, top: -40 }}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                )}

                                <Box sx={{ p: 2 }}>
                                    {currentTab === 0 && (
                                        <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(processedData.summary) }} />
                                    )}
                                    {currentTab === 1 && (
                                        <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(processedData.notes) }} />
                                    )}
                                    {currentTab === 2 && (
                                        <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(processedData.keyPoints) }} />
                                    )}
                                    {currentTab === 3 && (
                                        <Typography>{processedData.transcription}</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    )}

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
            </Container>
        </Box>
    );

};

export default VideoSummarizer;
