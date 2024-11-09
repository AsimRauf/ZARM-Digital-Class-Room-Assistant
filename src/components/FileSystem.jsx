import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Card,
    CardContent,
    Grid,
    IconButton,
    Button
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import NoteIcon from '@mui/icons-material/Note';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const FileSystem = () => {
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [currentView, setCurrentView] = useState('rooms');
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [courses, setCourses] = useState([]);
    const { roomId, courseId } = useParams();
    const courseFolders = [
        { id: 'digital-notes', name: 'Digital Notes', icon: <NoteIcon sx={{ color: '#2196F3' }} /> },
        { id: 'summaries', name: 'Summarized Notes', icon: <SummarizeIcon sx={{ color: '#4CAF50' }} /> },
        { id: 'assignments', name: 'Assignments', icon: <AssignmentIcon sx={{ color: '#FF9800' }} /> },
        { id: 'resources', name: 'Resources', icon: <FolderSpecialIcon sx={{ color: '#9C27B0' }} /> }
    ];

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData();
            fetchUserRooms();
        }
    }, []);

    useEffect(() => {
        if (roomId) {
            fetchRoomCourses();
        }
    }, [roomId]);

    const handleBackNavigation = () => {
        if (currentView === 'courses') {
            setCurrentView('rooms');
            navigate('/files');
        }
    };


    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        try {
            const decoded = jwtDecode(token);
            const response = await fetch(`http://localhost:5000/api/user/profile/${decoded.email}`);
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

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

    const fetchRoomCourses = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCourses(data);
            setCurrentView('courses');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const renderRooms = () => (
        <Box sx={{ mt: 4 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                overflowX: 'auto',
                pb: 2
            }}>
                {rooms.map(room => (
                    <Card
                        key={room._id}
                        sx={{
                            minWidth: '200px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: '20px',
                            flexShrink: 0,
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                transition: 'all 0.3s',
                                bgcolor: '#f5f5f5'
                            }
                        }}
                        onClick={() => {
                            setSelectedRoom(room);
                            navigate(`/files/${room._id}`);
                        }}
                    >
                        <FolderIcon sx={{
                            fontSize: 60,
                            color: '#1976d2',
                            mb: 1
                        }} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {room.name}
                        </Typography>
                    </Card>
                ))}
            </Box>
        </Box>
    );

    const renderCourses = () => (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4
        }}>
            <Typography variant="h5" gutterBottom>
                Courses in {selectedRoom?.name}
            </Typography>
            <List sx={{ width: '100%', maxWidth: 600 }}>
                {courses.map((course) => (
                    <ListItem
                        key={course._id}
                        sx={{
                            mb: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            '&:hover': {
                                bgcolor: '#f5f5f5',
                                transform: 'translateX(10px)',
                                transition: 'all 0.3s'
                            }
                        }}
                        button
                        onClick={() => {
                            setCurrentView('folders');
                            navigate(`/files/${roomId}/${course._id}`);
                        }}
                    >
                        <ListItemIcon>
                            <FolderSpecialIcon sx={{ color: '#1976d2', fontSize: 30 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="h6">
                                    {course.name}
                                </Typography>
                            }
                        />
                        <ChevronRightIcon />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const renderCourseFolders = () => (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4
        }}>
            <List sx={{ width: '100%', maxWidth: 600 }}>
                {courseFolders.map((folder) => (
                    <ListItem
                        key={folder.id}
                        sx={{
                            mb: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            '&:hover': {
                                bgcolor: '#f5f5f5',
                                transform: 'translateX(10px)',
                                transition: 'all 0.3s'
                            }
                        }}
                        button
                        onClick={() => {
                            if (folder.id === 'digital-notes') {
                                navigate(`/files/${roomId}/${courseId}/notes`);
                            }
                            else if (folder.id === 'summaries') {
                                navigate(`/files/${roomId}/${courseId}/summaries`);
                            }
                        }}
                    >
                        <ListItemIcon>
                            {folder.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="h6">
                                    {folder.name}
                                </Typography>
                            }
                        />
                        <ChevronRightIcon />
                    </ListItem>
                ))}
            </List>
        </Box>
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

        <Box>
            <Navbar 
                userData={userData}  />
            <Box sx={{ p: 3 }}>
                {currentView === 'courses' && (
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBackNavigation}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    >
                        Back to Rooms
                    </Button>
                )}
            </Box>
            <Box sx={{ p: 3 }}>
                <Breadcrumbs separator="›" sx={{ mb: 3 }}>
                    <Box
                        onClick={() => {
                            navigate('/files');
                            setCurrentView('rooms');
                        }}
                        sx={{
                            cursor: 'pointer',
                            color: 'primary.main',
                            fontWeight: 500,
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        My Files
                    </Box>
                    {currentView === 'courses' && selectedRoom && (
                        <Box
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500
                            }}
                        >
                            {selectedRoom.name}
                        </Box>
                    )}
                    {currentView === 'folders' && (
                        <Box
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500
                            }}
                        >
                            Course Folders
                        </Box>
                    )}
                </Breadcrumbs>

                {renderContent()}
            </Box>
        </Box>
    );
};

export default FileSystem;