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
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        {room?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Chip
                            label={`Role: ${userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}`}
                            color="primary"
                            sx={{
                                fontSize: '1rem',
                                padding: '20px 15px',
                                fontWeight: 500
                            }}
                        />

                        {isAdmin && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenCreateDialog(true)}
                                sx={{
                                    padding: '10px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    textTransform: 'none',
                                    boxShadow: 2
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
                            <Card elevation={3}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {course?.name}
                                    </Typography>
                                    <Typography color="textSecondary">
                                        {course?.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleCourseClick(course._id)}
                                            startIcon={<ChatIcon />}
                                        >
                                            Open Chat
                                        </Button>
                                        {isAdmin && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleCourseSettings(course._id)}
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
                >
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Course Name"
                            fullWidth
                            value={courseData.name}
                            onChange={(e) => setCourseData({ ...courseData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={courseData.description}
                            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateCourse} variant="contained">
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
                    >
                        <DialogTitle>{selectedCourse.name} - Chat</DialogTitle>
                        <DialogContent>

                        </DialogContent>
                    </Dialog>
                )}
            </Box>
        </Box>
    );
};

export default RoomInterior;