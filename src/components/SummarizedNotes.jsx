import React, { useState, useEffect } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Breadcrumbs,
    Container,
    Paper
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

const SummarizedNotes = () => {
    const [videoContents, setVideoContents] = useState([]);
    const [userData, setUserData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const { roomId, courseId } = useParams();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserData();
            fetchVideoContent();
        }
    }, [courseId]);

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

    const fetchVideoContent = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/video-content/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setVideoContents(data);
        } catch (error) {
            console.error('Error fetching video content:', error);
        }
    };

    const handleMenuOpen = (event, content) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedContent(content);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedContent(null);
    };

    const handleViewContent = (content) => {
        navigate(`/summaries/${roomId}/${courseId}/${content._id}`);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        // First check if we have a valid selectedContent
        if (!selectedContent || !selectedContent._id) {
            console.log('No content selected for deletion');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/video-content/${selectedContent._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setVideoContents(prevContents =>
                    prevContents.filter(content => content._id !== selectedContent._id)
                );
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            // Clean up state regardless of success/failure
            setDeleteConfirmOpen(false);
            setSelectedContent(null);
            setAnchorEl(null);
        }
    };


    const handleEditSave = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/video-content/${selectedContent._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName: editTitle })
            });
            if (response.ok) {
                const updatedContent = await response.json();
                const updatedContents = videoContents.map(content =>
                    content._id === selectedContent._id ? updatedContent : content
                );
                setVideoContents(updatedContents);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setEditModalOpen(false);
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
                        Video Summaries
                    </Typography>

                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(-1)}
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

                    <Breadcrumbs
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
                                '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => navigate('/files')}
                        >
                            Files
                        </Typography>
                        <Typography sx={{ color: '#3B1E54' }}>Video Summaries</Typography>
                    </Breadcrumbs>

                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 2, sm: 3, md: 4 },
                            borderRadius: '20px',
                            border: '1px solid rgba(59, 30, 84, 0.1)',
                            background: 'linear-gradient(145deg, #ffffff, #f9f7fc)',
                            boxShadow: '0 4px 20px rgba(59, 30, 84, 0.05)'
                        }}
                    >
                        {videoContents.length === 0 ? (
                            <Typography
                                color="text.secondary"
                                align="center"
                                sx={{ py: 4 }}
                            >
                                No video summaries found
                            </Typography>
                        ) : (
                            <List>
                                {videoContents.map((content) => (
                                    <ListItem
                                        key={content._id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: '12px',
                                            border: '1px solid rgba(59, 30, 84, 0.1)',
                                            background: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateX(8px)',
                                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.08)'
                                            }
                                        }}
                                        onClick={() => handleViewContent(content)}
                                    >
                                        <ListItemIcon>
                                            <SummarizeIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" sx={{
                                                    color: '#3B1E54',
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {content.fileName}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    Created: {new Date(content.createdAt).toLocaleDateString()}
                                                </Typography>
                                            }
                                        />
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, content)}
                                            sx={{
                                                color: '#3B1E54',
                                                '&:hover': {
                                                    background: 'rgba(59, 30, 84, 0.04)'
                                                }
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => {
                            setEditTitle(selectedContent?.fileName);
                            setEditModalOpen(true);
                        }}>
                            <EditIcon sx={{ mr: 1 }} /> Edit Title
                        </MenuItem>
                        <MenuItem onClick={() => {
                            // Only open delete dialog if we have a selected content
                            if (selectedContent) {
                                setDeleteConfirmOpen(true);
                            }
                        }}>
                            <DeleteIcon sx={{ mr: 1 }} color="error" /> Delete
                        </MenuItem>
                    </Menu>


                    <Dialog
                        open={deleteConfirmOpen}
                        onClose={() => setDeleteConfirmOpen(false)}
                        PaperProps={{
                            sx: {
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.15)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ color: '#3B1E54' }}>Delete Summary</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete this summary?
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => setDeleteConfirmOpen(false)}
                                sx={{ color: '#3B1E54' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                color="error"
                                variant="contained"
                                sx={{ borderRadius: '8px' }}
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={editModalOpen}
                        onClose={() => setEditModalOpen(false)}
                        PaperProps={{
                            sx: {
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(59, 30, 84, 0.15)'
                            }
                        }}
                    >
                        <DialogTitle sx={{ color: '#3B1E54' }}>Edit Summary Title</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Title"
                                fullWidth
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                sx={{
                                    mt: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </DialogContent>
                        <DialogActions sx={{ p: 2 }}>
                            <Button
                                onClick={() => setEditModalOpen(false)}
                                sx={{ color: '#3B1E54' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditSave}
                                variant="contained"
                                sx={{
                                    bgcolor: '#3B1E54',
                                    borderRadius: '8px',
                                    '&:hover': {
                                        bgcolor: '#5E2E87'
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Container>
        </Box>
    );
};

export default SummarizedNotes;
