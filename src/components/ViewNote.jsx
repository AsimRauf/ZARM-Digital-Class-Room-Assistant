import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Breadcrumbs,
    Button,
    Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const ViewNote = () => {
    const [note, setNote] = useState(null);
    const [userData, setUserData] = useState(null);
    const { noteId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const decoded = jwtDecode(token);
            const response = await fetch(`http://localhost:5000/api/user/profile/${decoded.email}`);
            const data = await response.json();
            setUserData(data);
        };
        fetchUserData();
        fetchNote();
    }, [noteId]);

    const fetchNote = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setNote(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDownload = async () => {
        const content = document.querySelector('.note-content');
        const opt = {
            margin: 1,
            filename: `${note.title}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(content).save();
    };

    return (
        <Box sx={{ bgcolor: '#F8F9FC', minHeight: '100vh' }}>
            <Navbar userData={userData} />
            <Container maxWidth="lg">
                <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 4,
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={() => navigate(-1)}
                                sx={{
                                    color: '#3B1E54',
                                    '&:hover': {
                                        background: 'rgba(59, 30, 84, 0.04)'
                                    }
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Breadcrumbs sx={{
                                '& .MuiBreadcrumbs-separator': {
                                    color: '#3B1E54'
                                }
                            }}>
                                <Typography
                                    sx={{
                                        cursor: 'pointer',
                                        color: '#3B1E54',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                    onClick={() => navigate('/files')}
                                >
                                    My Files
                                </Typography>
                                <Typography sx={{ color: '#3B1E54', fontWeight: 500 }}>
                                    {note?.title}
                                </Typography>
                            </Breadcrumbs>
                        </Box>
                        
                        <Button
                            variant="contained"
                            startIcon={<FileDownloadIcon />}
                            onClick={handleDownload}
                            sx={{
                                borderRadius: '12px',
                                bgcolor: '#3B1E54',
                                '&:hover': {
                                    bgcolor: '#5E2E87'
                                }
                            }}
                        >
                            Download PDF
                        </Button>
                    </Box>

                    {note && (
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: { xs: 2, sm: 3, md: 4 },
                                maxWidth: 1000,
                                mx: 'auto',
                                minHeight: '70vh',
                                borderRadius: '20px',
                                border: '1px solid rgba(59, 30, 84, 0.1)',
                                background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                            }}
                        >
                            <Typography 
                                variant="h4" 
                                sx={{
                                    color: '#3B1E54',
                                    fontWeight: 700,
                                    mb: 2
                                }}
                            >
                                {note.title}
                            </Typography>
                            
                            <Typography 
                                variant="body2" 
                                sx={{
                                    color: 'text.secondary',
                                    mb: 4,
                                    pb: 3,
                                    borderBottom: '1px solid rgba(59, 30, 84, 0.1)'
                                }}
                            >
                                Last modified: {new Date(note.lastModified).toLocaleString()}
                            </Typography>

                            <Box 
                                className="note-content"
                                sx={{ 
                                    mt: 3,
                                    color: '#2A2A2A',
                                    fontSize: '1rem',
                                    lineHeight: 1.7,
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                        color: '#3B1E54',
                                        fontWeight: 600,
                                        mt: 3,
                                        mb: 2
                                    },
                                    '& p': {
                                        mb: 2
                                    },
                                    '& ul, & ol': {
                                        pl: 3,
                                        mb: 2
                                    },
                                    '& li': {
                                        mb: 1
                                    },
                                    '& img': {
                                        maxWidth: '100%',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        my: 2
                                    }
                                }}
                                dangerouslySetInnerHTML={{ __html: note.htmlContent }} 
                            />
                        </Paper>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default ViewNote;
