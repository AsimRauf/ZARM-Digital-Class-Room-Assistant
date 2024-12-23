import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DoneIcon from '@mui/icons-material/Done';
import { jwtDecode } from 'jwt-decode';
import io from 'socket.io-client';
import ReactPlayer from 'react-player';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    LinearProgress,
    Paper,
    TextField,
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
    MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';

const VideoSummarizer = () => {
    const [uploading, setUploading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [videoSource, setVideoSource] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [processedData, setProcessedData] = useState(null);
    const [videoHistory, setVideoHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoDetails, setVideoDetails] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
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

    const handleYoutubeUrlSubmit = async () => {
        if (ReactPlayer.canPlay(youtubeUrl)) {
            setShowPreview(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/video/youtube-info', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: youtubeUrl })
            });
            const data = await response.json();
            setVideoDetails(data);
        }
    };

    const handleProcessYoutube = async () => {
        setUploading(true);
        const token = localStorage.getItem('token');

        try {
            socketRef.current = io('http://localhost:5000');
            socketRef.current.on('processing:progress', (data) => {
                setUploadProgress(data.progress);
                setProcessingStage(data.stage);
            });

            const response = await fetch('http://localhost:5000/api/video/process-youtube', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: youtubeUrl })
            });

            const data = await response.json();
            setProcessedData(data);
            showSnackbar('Video processed successfully');
        } catch (error) {
            showSnackbar('Processing failed', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
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
            const response = await fetch('http://localhost:5000/api/video-content/save', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: selectedRoom,
                    courseId: selectedCourse,
                    fileName: noteTitle || processedData.fileName,
                    summary: processedData.summary,
                    notes: processedData.notes,
                    keyPoints: processedData.keyPoints,
                    transcription: processedData.transcription
                })
            });

            if (response.ok) {
                setIsSaved(true);
                showSnackbar('Content saved successfully');
            }
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
                    mt: { xs: 6, md: 4 },
                    p: { xs: 2, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <Typography variant="h4" sx={{
                        mb: 4,
                        fontWeight: 700,
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        textAlign: 'center',
                        width: '100%',
                        color: '#3B1E54',
                        position: 'relative',
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
                    }}>
                        AI-Powered Video Intelligence
                    </Typography>

                    <Paper elevation={0} sx={{
                        border: '1px solid rgba(59, 30, 84, 0.1)',
                        borderRadius: '20px',
                        p: 4,
                        mb: 4,
                        width: '100%',
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                    }}>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Button
                                variant={videoSource === 'file' ? 'contained' : 'outlined'}
                                onClick={() => setVideoSource('file')}
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    flex: 1,
                                    height: 48,
                                    borderRadius: '12px',
                                    bgcolor: videoSource === 'file' ? '#3B1E54' : 'transparent',
                                    borderColor: '#3B1E54',
                                    color: videoSource === 'file' ? 'white' : '#3B1E54',
                                    '&:hover': {
                                        bgcolor: videoSource === 'file' ? '#4B2E64' : 'rgba(59, 30, 84, 0.04)',
                                        borderColor: '#3B1E54'
                                    }
                                }}
                            >
                                Local Video
                            </Button>
                            <Button
                                variant={videoSource === 'youtube' ? 'contained' : 'outlined'}
                                onClick={() => setVideoSource('youtube')}
                                startIcon={<YouTubeIcon />}
                                sx={{
                                    flex: 1,
                                    height: 48,
                                    borderRadius: '12px',
                                    bgcolor: videoSource === 'youtube' ? '#FF0000' : 'transparent',
                                    color: videoSource === 'youtube' ? 'white' : '#FF0000',
                                    borderColor: '#FF0000',
                                    '&:hover': {
                                        bgcolor: videoSource === 'youtube' ? '#CC0000' : 'rgba(255, 0, 0, 0.04)',
                                        borderColor: '#FF0000'
                                    }
                                }}
                            >
                                YouTube Video
                            </Button>
                        </Box>


                        {videoSource === 'youtube' && (
                            <Alert
                                severity="info"
                                sx={{
                                    mb: 2,
                                    borderRadius: '12px',
                                    '& .MuiAlert-icon': {
                                        color: '#3B1E54'
                                    }
                                }}
                            >
                                ⚡ Processing time depends on video length and internet speed (3-5 mins for 10-min video)
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'center' }}>
                            {videoSource === 'file' && (
                                <Paper
                                    sx={{
                                        p: 3,
                                        flex: 1,
                                        maxWidth: 400,
                                        borderRadius: '16px',
                                        border: '2px dashed rgba(59, 30, 84, 0.1)',
                                        background: 'rgba(59, 30, 84, 0.02)',
                                    }}
                                >
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
                                        sx={{
                                            height: 48,
                                            borderRadius: '12px',
                                            lineHeight: 1,
                                            bgcolor: '#3B1E54',
                                            '&:hover': {
                                                bgcolor: '#4B2E64'
                                            }
                                        }}
                                    >
                                        {uploading ? 'Transforming Knowledge...' : 'Upload Video Lecture'}
                                    </Button>
                                </Paper>
                            )}

                            {videoSource === 'youtube' && (
                                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="YouTube URL"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(59, 30, 84, 0.4)'
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleYoutubeUrlSubmit}
                                        disabled={!youtubeUrl || uploading}
                                        sx={{
                                            height: 40,
                                            borderRadius: '12px',
                                            bgcolor: '#3B1E54',
                                            lineHeight: 1,
                                            '&:hover': {
                                                bgcolor: '#4B2E64'
                                            }
                                        }}
                                    >
                                        Load Video
                                    </Button>
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                onClick={() => setShowHistory(!showHistory)}
                                sx={{
                                    height: 40,
                                    minWidth: 100,
                                    borderRadius: '12px',
                                    borderColor: '#3B1E54',
                                    color: '#3B1E54',
                                    '&:hover': {
                                        borderColor: '#4B2E64',
                                        bgcolor: 'rgba(59, 30, 84, 0.04)'
                                    }
                                }}
                            >
                                Archives
                            </Button>
                        </Box>

                        {videoSource === 'youtube' && showPreview && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Accordion
                                    sx={{
                                        mt: 2,
                                        maxWidth: '600px',
                                        width: '100%',
                                        mb: uploading ? 0 : 4,
                                        borderRadius: '16px !important',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(59, 30, 84, 0.1)',
                                        '&:before': {
                                            display: 'none'
                                        }
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: '#3B1E54' }} />}
                                        sx={{
                                            minHeight: '48px',
                                            bgcolor: 'rgba(59, 30, 84, 0.02)',
                                            '& .MuiAccordionSummary-content': {
                                                margin: '12px 0',
                                                display: 'flex',
                                                justifyContent: 'center'
                                            }
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#3B1E54'
                                            }}
                                        >
                                            {videoDetails?.title || 'Video Preview'}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        p: 3
                                    }}>
                                        <Box sx={{
                                            width: '100%',
                                            maxWidth: '500px',
                                            aspectRatio: '16/9',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <ReactPlayer
                                                url={youtubeUrl}
                                                width="100%"
                                                height="100%"
                                                controls
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            onClick={handleProcessYoutube}
                                            sx={{
                                                mt: 3,
                                                maxWidth: '500px',
                                                width: '100%',
                                                borderRadius: '12px',
                                                bgcolor: '#3B1E54',
                                                py: 1.5,
                                                '&:hover': {
                                                    bgcolor: '#4B2E64'
                                                }
                                            }}
                                        >
                                            Process This Video
                                        </Button>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        )}



                        {uploading && (
                            <Box sx={{
                                width: '100%',
                                maxWidth: 600,
                                mx: 'auto',
                                mt: 2, // Reduced margin when accordion is collapsed
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 3,
                                borderRadius: '16px',
                                bgcolor: 'rgba(59, 30, 84, 0.02)',
                                border: '1px solid rgba(59, 30, 84, 0.1)'
                            }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{
                                        flexGrow: 1,
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(59, 30, 84, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: '#3B1E54',
                                            backgroundImage: 'linear-gradient(45deg, #3B1E54, #5E2E87)'
                                        }
                                    }}
                                />
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minWidth: 200,
                                    color: '#3B1E54',
                                    fontWeight: 500
                                }}>
                                    {uploadProgress < 25 && (
                                        <>
                                            <CloudDownloadIcon />
                                            <Typography>Extracting Audio</Typography>
                                        </>
                                    )}
                                    {uploadProgress >= 25 && uploadProgress < 50 && (
                                        <>
                                            <AudiotrackIcon />
                                            <Typography>Processing Speech</Typography>
                                        </>
                                    )}
                                    {uploadProgress >= 50 && uploadProgress < 75 && (
                                        <>
                                            <SummarizeIcon />
                                            <Typography>Generating Summary</Typography>
                                        </>
                                    )}
                                    {uploadProgress >= 75 && (
                                        <>
                                            <DoneIcon />
                                            <Typography>Finalizing</Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            mt: 3,
                            flexWrap: { xs: 'wrap', md: 'nowrap' },
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <TextField
                                label="Note Title"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                size="small"
                                required
                                sx={{
                                    width: { xs: '100%', md: 250 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(59, 30, 84, 0.4)'
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#3B1E54'
                                    }
                                }}
                            />

                            <TextField
                                select
                                label="Room"
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                size="small"
                                sx={{
                                    width: { xs: '100%', md: 180 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(59, 30, 84, 0.4)'
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#3B1E54'
                                    }
                                }}
                            >
                                {rooms.map(room => (
                                    <MenuItem key={room._id} value={room._id}>
                                        {room.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Course"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                size="small"
                                disabled={!selectedRoom}
                                sx={{
                                    width: { xs: '100%', md: 180 },
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(59, 30, 84, 0.4)'
                                        }
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: '#3B1E54'
                                    }
                                }}
                            >
                                {courses.map(course => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                variant="contained"
                                disabled={!selectedRoom || !selectedCourse || !processedData || isSaved}
                                onClick={handleSaveContent}
                                startIcon={<SaveIcon />}
                                sx={{
                                    width: { xs: '100%', md: 150 },
                                    height: 40,
                                    borderRadius: '12px',
                                    bgcolor: isSaved ? '#2E7D32' : '#3B1E54',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: isSaved ? '#1B5E20' : '#4B2E64',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(59, 30, 84, 0.2)'
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: isSaved ? '#2E7D32' : 'rgba(59, 30, 84, 0.12)',
                                        color: 'white'
                                    }
                                }}
                            >
                                {isSaved ? 'Saved' : 'Save'}
                            </Button>
                        </Box>

                    </Paper>

                    {showHistory && (
                        <Box sx={{ mb: 4, width: '100%' }}>
                            <Typography variant="h5" sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: '#3B1E54',
                                position: 'relative',
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -8,
                                    left: 0,
                                    width: '40px',
                                    height: '3px',
                                    background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                    borderRadius: '2px'
                                }
                            }}>
                                Knowledge Archive
                            </Typography>
                            <Grid container spacing={2}>
                                {videoHistory.map((video) => (
                                    <Grid item xs={12} md={6} key={video._id}>
                                        <Paper
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
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            color: '#3B1E54',
                                                            fontWeight: 600,
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {video.fileName}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'rgba(59, 30, 84, 0.6)'
                                                        }}
                                                    >
                                                        Processed on {new Date(video.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        onClick={() => setProcessedData(video)}
                                                        sx={{
                                                            color: '#3B1E54',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(59, 30, 84, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDeleteVideo(video._id)}
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
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {processedData && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: '20px',
                                border: '1px solid rgba(59, 30, 84, 0.1)',
                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                            }}
                        >
                            <Box sx={{
                                borderBottom: '1px solid rgba(59, 30, 84, 0.1)',
                                mb: 3
                            }}>
                                <Tabs
                                    value={currentTab}
                                    onChange={(e, v) => setCurrentTab(v)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: 'rgba(59, 30, 84, 0.6)',
                                            '&.Mui-selected': {
                                                color: '#3B1E54'
                                            }
                                        },
                                        '& .MuiTabs-indicator': {
                                            bgcolor: '#3B1E54'
                                        }
                                    }}
                                >
                                    <Tab label="Summary" />
                                    <Tab label="Enhanced Notes" />
                                    <Tab label="Key Insights" />
                                    <Tab label="Full Transcript" />
                                </Tabs>
                            </Box>

                            <Box sx={{ position: 'relative' }}>
                                {currentTab === 1 && (
                                    <IconButton
                                        onClick={downloadNotes}
                                        sx={{
                                            position: 'absolute',
                                            right: 0,
                                            top: -40,
                                            color: '#3B1E54',
                                            '&:hover': {
                                                bgcolor: 'rgba(59, 30, 84, 0.08)'
                                            }
                                        }}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                )}

                                <Box sx={{
                                    p: 2,
                                    '& .note-content': {
                                        color: '#2A2A2A',
                                        lineHeight: 1.6,
                                        '& h1, h2, h3, h4, h5, h6': {
                                            color: '#3B1E54',
                                            fontWeight: 600,
                                            mb: 2
                                        }
                                    }
                                }}>
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
                                        <Typography sx={{ lineHeight: 1.8, color: '#2A2A2A' }}>
                                            {processedData.transcription}
                                        </Typography>
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
                        <Alert
                            severity={snackbar.severity}
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                            sx={{
                                borderRadius: '12px',
                                '& .MuiAlert-icon': {
                                    color: snackbar.severity === 'success' ? '#2E7D32' : '#d32f2f'
                                }
                            }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>


                </Box>
            </Container>
        </Box>
    );

};

export default VideoSummarizer;
