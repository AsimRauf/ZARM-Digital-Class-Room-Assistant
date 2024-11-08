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
    Link
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
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

        fetchVideoContent();
    }, [courseId]);

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
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/video-content/${selectedContent._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const updatedContents = videoContents.filter(content => content._id !== selectedContent._id);
                setVideoContents(updatedContents);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setDeleteConfirmOpen(false);
        handleMenuClose();
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
        <Box>
            <Navbar userData={userData} />
            <Box sx={{ p: 3 }}>
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        variant="body1"
                        onClick={() => navigate('/files')}
                        sx={{ color: 'primary.main' }}
                    >
                        My Files
                    </Link>
                    <Typography color="text.primary">Summarized Notes</Typography>
                </Breadcrumbs>

                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Delete Summary</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this summary?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                    <DialogTitle>Edit Title</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Title"
                            fullWidth
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditSave} color="primary">Save</Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Video Summaries
                    </Typography>

                    <List>
                        {videoContents.map((content) => (
                            <ListItem
                                key={content._id}
                                sx={{
                                    mb: 2,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: '#f5f5f5',
                                        transform: 'translateX(4px)',
                                        transition: 'all 0.2s'
                                    }
                                }}
                                onClick={() => handleViewContent(content)}
                            >
                                <ListItemIcon>
                                    <SummarizeIcon sx={{ color: '#4CAF50' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
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
                                    sx={{ ml: 2 }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            </ListItem>
                        ))}
                    </List>

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
                        <MenuItem onClick={() => setDeleteConfirmOpen(true)}>
                            <DeleteIcon sx={{ mr: 1 }} color="error" /> Delete
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>
        </Box>
    );
};

export default SummarizedNotes;
