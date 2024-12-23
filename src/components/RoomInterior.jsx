import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';

const RoomInterior = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [room, setRoom] = useState(null);
    const [courses, setCourses] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [courseData, setCourseData] = useState({
        name: '',
        description: ''
    });
    const [userData, setUserData] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

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
        if (userData) {
            fetchRoomDetails();
            fetchCourses();
        }
    }, [roomId, userData]);

    const fetchRoomDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setRoom(data);

            const userMember = data.members.find(m => m.user._id === userData.id);
            setIsAdmin(userMember?.role === 'admin');
            setUserRole(userMember?.role);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCreateCourse = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                setOpenCreateDialog(false);
                setCourseData({ name: '', description: '' });
                fetchCourses();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCourseSettings = (courseId) => {
        navigate(`/room/${roomId}/course/${courseId}/settings`);
    };

    const handleCourseClick = (courseId) => {
        navigate(`/room/${roomId}/course/${courseId}/chat`);
    };

    return (
        <Box>
            <Navbar userData={userData} />
            <Box sx={{ p: 4 }}>
                <Box sx={{ 
                    textAlign: 'center', 
                    mb: 6,
                    background: 'linear-gradient(145deg, rgba(59, 30, 84, 0.04), rgba(94, 46, 135, 0.02))',
                    borderRadius: '24px',
                    padding: '40px 20px',
                }}>
                    <Typography variant="h4" gutterBottom sx={{
                        color: '#3B1E54',
                        fontWeight: 700,
                        mb: 3
                    }}>
                        {room?.name}
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 2 
                    }}>
                        <Chip
                            label={`Role: ${userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}`}
                            sx={{
                                fontSize: '1rem',
                                padding: '20px 15px',
                                fontWeight: 500,
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                color: 'white',
                                borderRadius: '12px'
                            }}
                        />
    
                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenCreateDialog(true)}
                                sx={{
                                    padding: '12px 28px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                    boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 20px rgba(59, 30, 84, 0.3)',
                                        background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                    }
                                }}
                            >
                                Create New Course
                            </Button>
                        )}
                    </Box>
                </Box>
    
                <Grid container spacing={3}>
                    {Array.isArray(courses) && courses.map((course) => (
                        <Grid item xs={12} md={6} lg={4} key={course?._id}>
                            <Card elevation={0} sx={{
                                borderRadius: '16px',
                                border: '1px solid rgba(59, 30, 84, 0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{
                                        color: '#3B1E54',
                                        fontWeight: 600,
                                        mb: 1
                                    }}>
                                        {course?.name}
                                    </Typography>
                                    <Typography sx={{ 
                                        color: 'rgba(59, 30, 84, 0.6)',
                                        mb: 2
                                    }}>
                                        {course?.description}
                                    </Typography>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        mt: 2 
                                    }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleCourseClick(course._id)}
                                            startIcon={<ChatIcon />}
                                            sx={{
                                                borderRadius: '10px',
                                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                                }
                                            }}
                                        >
                                            Open Chat
                                        </Button>
                                        {isAdmin && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCourseSettings(course._id)}
                                                sx={{
                                                    color: '#3B1E54',
                                                    '&:hover': {
                                                        background: 'rgba(59, 30, 84, 0.08)'
                                                    }
                                                }}
                                            >
                                                <SettingsIcon />
                                            </IconButton>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
    
                <Dialog
                    open={openCreateDialog}
                    onClose={() => setOpenCreateDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Create New Course
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Course Name"
                            fullWidth
                            value={courseData.name}
                            onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={courseData.description}
                            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button 
                            onClick={() => setOpenCreateDialog(false)}
                            sx={{ 
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreateCourse} 
                            variant="contained"
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                }
                            }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
    
                {selectedCourse && (
                    <Dialog
                        open={Boolean(selectedCourse)}
                        onClose={() => setSelectedCourse(null)}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ 
                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                            color: 'white',
                            borderRadius: '20px 20px 0 0'
                        }}>
                            {selectedCourse.name} - Chat
                        </DialogTitle>
                        <DialogContent>
                        </DialogContent>
                    </Dialog>
                )}
            </Box>
        </Box>
    );
    
};

export default RoomInterior