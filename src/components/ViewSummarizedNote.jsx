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
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

const ViewSummarizedNote = () => {
    const [content, setContent] = useState(null);
    const [userData, setUserData] = useState(null);
    const { roomId, courseId, contentId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData();
        }
    }, []);

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

    useEffect(() => {
        const fetchContent = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:5000/api/video-content/${contentId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setContent(data);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        fetchContent();
    }, [contentId]);

    const cleanHtmlContent = (content) => {
        return content
            .replace(/```html\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
    };

    const handleDownload = async () => {
        const contentElement = document.querySelector('.content-container');
        const opt = {
            margin: 1,
            filename: `${content.fileName}-summary.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(contentElement).save();
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
                                {content?.fileName}
                            </Typography>
                        </Breadcrumbs>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleDownload}
                    >
                        Download PDF
                    </Button>
                </Box>

                {content && (
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
                            {content.fileName}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 4 }}
                        >
                            Created: {new Date(content.createdAt).toLocaleString()}
                        </Typography>
                        <Box className="content-container">
                            <Typography variant="h6" color="primary" gutterBottom>
                                Summary
                            </Typography>
                            <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content.summary) }} />

                            <Typography variant="h6" color="primary" gutterBottom>
                                Key Points
                            </Typography>
                            <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content.keyPoints) }} />

                            <Typography variant="h6" color="primary" gutterBottom>
                                Transcription
                            </Typography>
                            <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content.transcription) }} />
                        </Box>
                    </Paper>
                )}
            </Box>
        </Box>
    );
};
export default ViewSummarizedNote;
