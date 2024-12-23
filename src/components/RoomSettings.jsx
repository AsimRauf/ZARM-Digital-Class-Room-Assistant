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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';

const RoomSettings = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [showCourseSelect, setShowCourseSelect] = useState(false);
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
                userData={userData}
            />


            <Box sx={{ p: 3 }}>
                <Paper elevation={0} sx={{
                    p: 4,
                    borderRadius: '20px',
                    border: '1px solid rgba(59, 30, 84, 0.1)',
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Typography variant="h4" gutterBottom sx={{
                        color: '#3B1E54',
                        fontWeight: 700,
                        position: 'relative',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: '60px',
                            height: '3px',
                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                            borderRadius: '2px'
                        }
                    }}>
                        Room Settings
                    </Typography>

                    {room && (
                        <>
                            <Typography variant="h5" gutterBottom sx={{
                                color: '#3B1E54',
                                fontWeight: 600,
                                mt: 3
                            }}>
                                {room.name}
                            </Typography>
                            <Typography variant="body1" sx={{
                                color: 'rgba(59, 30, 84, 0.6)',
                                mb: 4
                            }}>
                                {room.description}
                            </Typography>
                            <Typography variant="h6" sx={{
                                mt: 4,
                                mb: 3,
                                color: '#3B1E54',
                                fontWeight: 600
                            }}>
                                Members
                            </Typography>
                            <List>
                                {room.members.map((member) => (
                                    <ListItem
                                        key={member.user._id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 2,
                                            mb: 1,
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            border: '1px solid rgba(59, 30, 84, 0.08)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(59, 30, 84, 0.04)',
                                                transform: 'translateX(4px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Avatar
                                                src={member.user.profileImage}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    border: '2px solid rgba(59, 30, 84, 0.1)'
                                                }}
                                            />
                                            <ListItemText
                                                primary={member.user.username || member.user.email}
                                                secondary={member.user.email}
                                                sx={{
                                                    '& .MuiListItemText-primary': {
                                                        color: '#3B1E54',
                                                        fontWeight: 500
                                                    },
                                                    '& .MuiListItemText-secondary': {
                                                        color: 'rgba(59, 30, 84, 0.6)'
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2
                                        }}>
                                            <Select
                                                value={member.role}
                                                onChange={(e) => {
                                                    setSelectedMember(member.user._id);
                                                    setNewRole(e.target.value);
                                                    setShowRoleConfirm(true);
                                                }}
                                                sx={{
                                                    minWidth: 120,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '10px'
                                                    }
                                                }}
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
                                                    sx={{
                                                        '&:hover': {
                                                            background: 'rgba(255, 82, 82, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </ListItem>
                                ))}
                            </List>

                            <Dialog
                                open={showRoleConfirm}
                                onClose={() => setShowRoleConfirm(false)}
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
                                    Confirm Role Change
                                </DialogTitle>
                                <DialogContent sx={{ mt: 2, p: 3 }}>
                                    Are you sure you want to change this member's role?
                                </DialogContent>
                                <DialogActions sx={{ p: 2 }}>
                                    <Button
                                        onClick={() => setShowRoleConfirm(false)}
                                        sx={{
                                            borderRadius: '10px',
                                            color: '#3B1E54'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleRoleChangeConfirm}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                            }
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Dialog
                                open={showCourseSelect}
                                onClose={() => setShowCourseSelect(false)}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '20px',
                                        boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                                        animation: 'slideIn 0.3s ease-out'
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                    color: 'white',
                                    borderRadius: '20px 20px 0 0'
                                }}>
                                    Assign Course to Teacher
                                </DialogTitle>
                                <DialogContent sx={{ mt: 2, p: 3 }}>
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <InputLabel>Select Course</InputLabel>
                                        <Select
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            sx={{
                                                borderRadius: '10px'
                                            }}
                                        >
                                            {courses.map(course => (
                                                <MenuItem key={course._id} value={course._id}>
                                                    {course.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </DialogContent>
                                <DialogActions sx={{ p: 2 }}>
                                    <Button
                                        onClick={() => setShowCourseSelect(false)}
                                        sx={{
                                            borderRadius: '10px',
                                            color: '#3B1E54'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleTeacherAssignment}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                            }
                                        }}
                                    >
                                        Assign Course
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            <Dialog
                                open={showDeleteConfirm}
                                onClose={() => setShowDeleteConfirm(false)}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '20px',
                                        boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                                        animation: 'slideIn 0.3s ease-out'
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    background: 'linear-gradient(45deg, #FF5252, #FF1744)',
                                    color: 'white',
                                    borderRadius: '20px 20px 0 0'
                                }}>
                                    Remove Member
                                </DialogTitle>
                                <DialogContent sx={{ mt: 2, p: 3 }}>
                                    Are you sure you want to remove this member from the room?
                                </DialogContent>
                                <DialogActions sx={{ p: 2 }}>
                                    <Button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        sx={{
                                            borderRadius: '10px',
                                            color: '#3B1E54'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => handleDeleteMember(selectedMember)}
                                        startIcon={<DeleteIcon />}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #FF5252, #FF1744)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #FF1744, #D50000)'
                                            }
                                        }}
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


