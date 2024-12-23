import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Container,
    Grid,
    Button,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    alpha
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import FolderIcon from '@mui/icons-material/Folder';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import NoteIcon from '@mui/icons-material/Note';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const courseFolders = [
    { 
        id: 'digital-notes', 
        name: 'Digital Notes', 
        icon: <NoteIcon sx={{ color: '#2196F3' }} />,
        path: 'notes'
    },
    { 
        id: 'summaries', 
        name: 'Summarized Notes', 
        icon: <SummarizeIcon sx={{ color: '#4CAF50' }} />,
        path: 'summaries'
    },
    { 
        id: 'assignments', 
        name: 'Assignments', 
        icon: <AssignmentIcon sx={{ color: '#FF9800' }} />,
        path: 'assignments'
    }
];

const FileSystem = () => {
    const { roomId, courseId } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [currentView, setCurrentView] = useState('rooms');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
            fetchRooms();
        }
    }, []);

    useEffect(() => {
        if (roomId) {
            fetchCourses(roomId);
            setCurrentView('courses');
        }
    }, [roomId]);

    useEffect(() => {
        if (courseId) {
            setCurrentView('folders');
        }
    }, [courseId]);

    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/profile/${email}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setCourses(data);
            const room = rooms.find(r => r._id === roomId);
            setSelectedRoom(room);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleBackNavigation = () => {
        if (currentView === 'folders') {
            navigate(`/files/${roomId}`);
            setCurrentView('courses');
        } else if (currentView === 'courses') {
            navigate('/files');
            setCurrentView('rooms');
        }
    };

    const handleFolderClick = (folder) => {
        if (folder.path) {
            navigate(`/files/${roomId}/${courseId}/${folder.path}`);
        }
    };

    const renderRooms = () => (
        <Grid container spacing={3}>
            {rooms.map(room => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
                    <Paper
                        elevation={0}
                        onClick={() => {
                            setSelectedRoom(room);
                            navigate(`/files/${room._id}`);
                        }}
                        sx={{
                            p: 3,
                            cursor: 'pointer',
                            borderRadius: '16px',
                            border: '1px solid rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                            }
                        }}
                    >
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: 2
                        }}>
                            <FolderIcon sx={{
                                fontSize: 48,
                                color: '#3B1E54'
                            }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: '#3B1E54',
                                    textAlign: 'center'
                                }}
                            >
                                {room.name}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );

    const renderCourses = () => (
        <List sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            {courses.map((course) => (
                <ListItem
                    key={course._id}
                    button
                    onClick={() => {
                        setCurrentView('folders');
                        navigate(`/files/${roomId}/${course._id}`);
                    }}
                    sx={{
                        mb: 2,
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 30, 84, 0.1)',
                        background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(59, 30, 84, 0.08)'
                        }
                    }}
                >
                    <ListItemIcon>
                        <FolderSpecialIcon sx={{ color: '#3B1E54', fontSize: 32 }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="h6" sx={{ color: '#3B1E54', fontWeight: 600 }}>
                                {course.name}
                            </Typography>
                        }
                    />
                    <ChevronRightIcon sx={{ color: '#3B1E54' }} />
                </ListItem>
            ))}
        </List>
    );

    const renderCourseFolders = () => (
        <List sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            {courseFolders.map((folder) => (
                <ListItem
                    key={folder.id}
                    button
                    onClick={() => handleFolderClick(folder)}
                    sx={{
                        mb: 2,
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 30, 84, 0.1)',
                        background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(59, 30, 84, 0.08)'
                        }
                    }}
                >
                    <ListItemIcon>
                        {folder.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="h6" sx={{ color: '#3B1E54', fontWeight: 600 }}>
                                {folder.name}
                            </Typography>
                        }
                    />
                    <ChevronRightIcon sx={{ color: '#3B1E54' }} />
                </ListItem>
            ))}
        </List>
    );

    const renderContent = () => {
        switch (currentView) {
            case 'rooms':
                return renderRooms();
            case 'courses':
                return renderCourses();
            case 'folders':
                return renderCourseFolders();
            default:
                return renderRooms();
        }
    };

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#3B1E54',
                            mb: 4,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                            position: 'relative',
                            '&:after': {
                                content: '""',
                                position: 'absolute',
                                bottom: -8,
                                left: 0,
                                width: '60px',
                                height: '4px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                borderRadius: '2px'
                            }
                        }}
                    >
                        My Files
                    </Typography>

                    {currentView !== 'rooms' && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBackNavigation}
                            sx={{
                                mb: 3,
                                borderRadius: '12px',
                                color: '#3B1E54',
                                '&:hover': {
                                    background: 'rgba(59, 30, 84, 0.04)'
                                }
                            }}
                        >
                            Back
                        </Button>
                    )}

                    <Breadcrumbs 
                        separator="›" 
                        sx={{ 
                            mb: 4,
                            '& .MuiBreadcrumbs-separator': {
                                color: '#3B1E54'
                            }
                        }}
                    >
                        <Typography
                            sx={{
                                cursor: 'pointer',
                                color: '#3B1E54',
                                fontWeight: currentView === 'rooms' ? 600 : 400,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => {
                                navigate('/files');
                                setCurrentView('rooms');
                            }}
                        >
                            Files
                        </Typography>
                        
                        {selectedRoom && (
                            <Typography
                                sx={{
                                    cursor: currentView === 'folders' ? 'pointer' : 'default',
                                    color: '#3B1E54',
                                    fontWeight: currentView === 'courses' ? 600 : 400,
                                    '&:hover': currentView === 'folders' ? { 
                                        textDecoration: 'underline' 
                                    } : {}
                                }}
                                onClick={() => {
                                    if (currentView === 'folders') {
                                        navigate(`/files/${roomId}`);
                                        setCurrentView('courses');
                                    }
                                }}
                            >
                                {selectedRoom.name}
                            </Typography>
                        )}
                        
                        {currentView === 'folders' && (
                            <Typography sx={{ color: '#3B1E54', fontWeight: 600 }}>
                                Course Folders
                            </Typography>
                        )}
                    </Breadcrumbs>

                    {renderContent()}
                </Box>
            </Container>
        </Box>
    );
};

export default FileSystem;
