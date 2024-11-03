import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Select,
    MenuItem,
    Paper,
    Button,
    Avatar,
    Drawer,
    ListItemIcon,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,

} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { jwtDecode } from 'jwt-decode';

const RoomSettings = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showRoleConfirm, setShowRoleConfirm] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchRoomSettings();
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
        }
    }, [roomId]);

    const fetchRoomSettings = async () => {
        console.log('Fetching settings for room:', roomId);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            setRoom(data);
        } catch (error) {
            console.error('Error:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const aiTools = [
        {
            name: 'Notes Digitizer',
            icon: <AutoFixHighIcon />,
            description: 'Convert handwritten notes to digital text'
        },
        {
            name: 'Lecture Summarizer',
            icon: <VideoLibraryIcon />,
            description: 'Generate concise notes from video lectures'
        },
        {
            name: 'Smart Quiz Generator',
            icon: <QuizIcon />,
            description: 'Create quizzes from notes and lecture summaries'
        },
        {
            name: 'Study Assistant Chat',
            icon: <ChatIcon />,
            description: 'Interactive learning support'
        }
    ];

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [showCourseSelect, setShowCourseSelect] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, [roomId]);

    const fetchCourses = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/profile/${email}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleRoleChangeConfirm = async () => {
        if (newRole === 'teacher') {
            await fetchCourses();
            setShowRoleConfirm(false);
            setShowCourseSelect(true);
        } else {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/member-role`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: selectedMember,
                        role: newRole
                    })
                });

                if (response.ok) {
                    await fetchRoomSettings();
                    setShowRoleConfirm(false);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };


    const handleTeacherAssignment = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/assign-teacher`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: selectedMember,
                    courseId: selectedCourse
                })
            });

            if (response.ok) {
                setShowCourseSelect(false);
                setShowRoleConfirm(false);
                fetchRoomSettings();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const handleDeleteMember = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/members/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchRoomSettings();
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };



    return (
        <Box>
            <Navbar
                onMenuClick={() => setDrawerOpen(true)}
                userData={userData}
            />

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 250 }} role="presentation">
                    <List>
                        {aiTools.map((tool) => (
                            <ListItem button key={tool.name}>
                                <ListItemIcon>
                                    {tool.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={tool.name}
                                    secondary={tool.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box sx={{ p: 3 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Room Settings
                    </Typography>
                    {room && (
                        <>
                            <Typography variant="h5" gutterBottom>
                                {room.name}
                            </Typography>
                            <Typography variant="body1" color="textSecondary" gutterBottom>
                                {room.description}
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                                Members
                            </Typography>
                            <List>
                                {room.members.map((member) => (
                                    <ListItem
                                        key={member.user._id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Avatar src={member.user.profileImage} />
                                        <ListItemText
                                            primary={member.user.username || member.user.email}
                                            secondary={member.user.email}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Select
                                                value={member.role}
                                                onChange={(e) => {
                                                    console.log('Role selected:', e.target.value); // Add this log
                                                    setSelectedMember(member.user._id);
                                                    setNewRole(e.target.value);
                                                    setShowRoleConfirm(true);
                                                }}
                                                sx={{ minWidth: 120 }}
                                            >
                                                <MenuItem value="admin">Admin</MenuItem>
                                                <MenuItem value="teacher">Teacher</MenuItem>
                                                <MenuItem value="student">Student</MenuItem>
                                            </Select>
                                            {member.role !== 'admin' && (
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedMember(member.user._id);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                            {/* Role Confirmation Dialog */}
                            <Dialog open={showRoleConfirm} onClose={() => setShowRoleConfirm(false)}>
                                <DialogTitle>Confirm Role Change</DialogTitle>
                                <DialogContent>
                                    Are you sure you want to change this member's role?
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowRoleConfirm(false)}>Cancel</Button>
                                    <Button onClick={handleRoleChangeConfirm} color="primary">
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Course Selection Dialog */}
                            <Dialog open={showCourseSelect} onClose={() => setShowCourseSelect(false)}>
                                <DialogTitle>Assign Course to Teacher</DialogTitle>
                                <DialogContent>
                                    <FormControl fullWidth sx={{ mt: 2 }}>
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
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowCourseSelect(false)}>Cancel</Button>
                                    <Button onClick={handleTeacherAssignment} color="primary">
                                        Assign Course
                                    </Button>
                                </DialogActions>
                            </Dialog>
                            <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                                <DialogTitle>Remove Member</DialogTitle>
                                <DialogContent>
                                    Are you sure you want to remove this member from the room?
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                                    <Button
                                        onClick={() => handleDeleteMember(selectedMember)}
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                    >
                                        Remove
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default RoomSettings;


