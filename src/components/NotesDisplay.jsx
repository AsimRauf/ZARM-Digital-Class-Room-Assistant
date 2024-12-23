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
    Paper,
    alpha
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

const NotesDisplay = () => {
    const [notes, setNotes] = useState([]);
    const [userData, setUserData] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const { roomId, courseId } = useParams();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
            fetchNotes();
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

    const fetchNotes = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/rooms/${roomId}/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notes');
            }
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleMenuOpen = (event, note) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedNote(note);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNote(null);
    };

    const handleViewNote = (note) => {
        navigate(`/notes/${note._id}`);
        handleMenuClose();
    };

    const handleDeleteConfirm = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                fetchNotes();
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
            const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: editTitle })
            });
            if (response.ok) {
                fetchNotes();
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
                        Digital Notes
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
                        <Typography sx={{ color: '#3B1E54' }}>Digital Notes</Typography>
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
                        {notes.length === 0 ? (
                            <Typography
                                color="text.secondary"
                                align="center"
                                sx={{ py: 4 }}
                            >
                                No notes found in this course
                            </Typography>
                        ) : (
                            <List>
                                {notes.map((note) => (
                                    <ListItem
                                        key={note._id}
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
                                        onClick={() => handleViewNote(note)}
                                    >
                                        <ListItemIcon>
                                            <NoteIcon sx={{ color: '#2196F3', fontSize: 28 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" sx={{
                                                    color: '#3B1E54',
                                                    fontWeight: 600,
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {note.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Created: {new Date(note.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Last Modified: {new Date(note.lastModified).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, note)}
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
                            if (selectedNote) {
                                setEditTitle(selectedNote.title);
                                setEditModalOpen(true);
                            }
                        }}>
                            <EditIcon sx={{ mr: 1 }} /> Edit Title
                        </MenuItem>
                        <MenuItem onClick={() => {
                            if (selectedNote) {
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
                        <DialogTitle sx={{ color: '#3B1E54' }}>Delete Note</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete this note?
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
                        <DialogTitle sx={{ color: '#3B1E54' }}>Edit Note Title</DialogTitle>
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

export default NotesDisplay;
