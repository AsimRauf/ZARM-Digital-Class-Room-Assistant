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
import NoteIcon from '@mui/icons-material/Note';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
                    <Typography color="text.primary">Digital Notes</Typography>
                </Breadcrumbs>

                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Delete Note</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this note?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                    <DialogTitle>Edit Note Title</DialogTitle>
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
                        Digital Notes
                    </Typography>

                    {notes.length === 0 ? (
                        <Typography color="text.secondary" align="center">
                            No notes found in this course
                        </Typography>
                    ) : (
                        <List>
                            {notes.map((note) => (
                                <ListItem 
                                key={note._id}
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
                                onClick={() => handleViewNote(note)}
                            >
                                    <ListItemIcon>
                                        <NoteIcon sx={{ color: '#2196F3' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                                {note.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    Created: {new Date(note.createdAt).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Last Modified: {new Date(note.lastModified).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <IconButton
                                        onClick={(e) => handleMenuOpen(e, note)}
                                        sx={{ ml: 2 }}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    )}

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => {
                            setEditTitle(selectedNote.title);
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

export default NotesDisplay;