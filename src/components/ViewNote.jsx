import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    IconButton,
    Breadcrumbs,
    Link 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const ViewNote = () => {
    const [note, setNote] = useState(null);
    const [userData, setUserData] = useState(null);
    const { roomId, courseId, noteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchNote();
    }, [noteId]);

    const fetchNote = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/rooms/${roomId}/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const notes = await response.json();
            const currentNote = notes.find(note => note._id === noteId);
            setNote(currentNote);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Box>
            <Navbar userData={userData} />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Breadcrumbs>
                        <Link 
                            component="button"
                            variant="body1"
                            onClick={() => navigate('/files')}
                        >
                            My Files
                        </Link>
                        <Typography color="text.primary">
                            {note?.title}
                        </Typography>
                    </Breadcrumbs>
                </Box>

                {note && (
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 4, 
                            maxWidth: 1000, 
                            mx: 'auto',
                            minHeight: '70vh'
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            {note.title}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ mb: 4 }}
                        >
                            Last modified: {new Date(note.lastModified).toLocaleString()}
                        </Typography>
                        <Box 
                            sx={{ 
                                mt: 3,
                                '& img': { maxWidth: '100%', height: 'auto' }
                            }}
                            dangerouslySetInnerHTML={{ __html: note.htmlContent }} 
                        />
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default ViewNote;
