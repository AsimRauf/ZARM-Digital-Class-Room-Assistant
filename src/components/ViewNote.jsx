import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Breadcrumbs,
    Link,
    Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';

const ViewNote = () => {
    const [note, setNote] = useState(null);
    const [userData, setUserData] = useState(null);
    const { noteId } = useParams();
    const downloadOptions = [
        { label: 'PDF', value: 'pdf' },
        { label: 'DOCX', value: 'docx' }
    ];

    const navigate = useNavigate();

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

    const handleDownload = async (format) => {
        const content = document.querySelector('.note-content');

        if (format === 'pdf') {
            const opt = {
                margin: 1,
                filename: `${note.title}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(content).save();
        }
    };

    return (
        <Box>
            <Navbar userData={userData} />
            <Box sx={{ p: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3 
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownload('pdf')}
                    >
                        Download PDF
                    </Button>
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
                            className="note-content"
                            sx={{ mt: 3 }}
                            dangerouslySetInnerHTML={{ __html: note.htmlContent }} 
                        />
                    </Paper>
                )}
            </Box>
        </Box>
    );
    
};

export default ViewNote;
