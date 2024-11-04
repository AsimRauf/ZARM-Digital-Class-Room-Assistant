import { debounce } from '../utils/debounce';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Updated import
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FolderIcon from '@mui/icons-material/Folder';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';

import DialogContentText from '@mui/material/DialogContentText';
import Navbar from './Navbar';

const MainRoom = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [roomData, setRoomData] = useState({
        name: '',
        description: ''
    });
    // State for edit modal
    const [openEditModal, setOpenEditModal] = useState(null);  // State for edit modal
    const [editRoomData, setEditRoomData] = useState({ name: '', description: '' });
    // State for delete confirmation dialog
    const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    // State for join modal
    const [openJoinModal, setOpenJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [currentShareRoom, setCurrentShareRoom] = useState(null);


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
            fetchUserRooms();  // Move this inside the token check
        }
    }, []);
    const fetchUserData = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/profile/${email}`);
            const data = await response.json();
            console.log('User data with ID:', data.id); // Check user ID format
            setUserData(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchUserRooms = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            // Check if response contains rooms array
            if (Array.isArray(data)) {
                setRooms(data);
            } else if (data.message === 'Authentication failed') {
                // Handle authentication error
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setRooms([]); // Set empty array if no rooms
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            setRooms([]); // Set empty array on error
        }
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreateRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/rooms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(roomData)
            });
            const result = await response.json();
            console.log('Created room:', result);
            setOpenCreateModal(false);
            fetchUserRooms(); // Refresh the room list
            setRoomData({ name: '', description: '' }); // Reset form
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };
    const handleShareRoom = (room) => {
        setCurrentShareRoom(room);
        setShareDialogOpen(true);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        // You can add a success notification here
    };


    // Add this to handle direct link joins
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/join-room/')) {
            const inviteCode = path.split('/join-room/')[1];
            debouncedJoinRoom(inviteCode);
            navigate('/'); // Redirect to main page after join attempt
        }
    }, []);

    // Handle join room
    const debouncedJoinRoom = debounce(async (inviteCode) => {
        if (isJoining) return;
        setIsJoining(true);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/rooms/join/${inviteCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await fetchUserRooms();
                setOpenJoinModal(false);
                setInviteCode('');
            }
        } catch (error) {
            console.error('Error joining room:', error);
        } finally {
            setIsJoining(false);
        }
    }, 300);
    // Function to handle leaving a room
    const handleLeaveRoom = async (roomId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/rooms/leave/${roomId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await fetchUserRooms();
            } else {
                const error = await response.json();
                console.error('Failed to leave room:', error.message);
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    };


    // Add delete handler
    const handleDeleteRoom = (room) => {
        console.log('Room to delete:', room._id);
        setRoomToDelete(room._id);
        setDeleteConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmText === 'DELETE') {
            try {
                const token = localStorage.getItem('token');
                console.log('Deleting room:', roomToDelete);

                const response = await fetch(`http://localhost:5000/api/rooms/${roomToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete room');
                }

                await fetchUserRooms(); // Refresh rooms list
                setDeleteConfirmDialog(false);
                setDeleteConfirmText('');
                setRoomToDelete(null);
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    };



    const handleOpenEditModal = (room) => {
        console.log('Opening edit modal with room:', room);
        setOpenEditModal(room);
        setEditRoomData({
            name: room.name,
            description: room.description
        });
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(null);
        setEditRoomData({ name: '', description: '' });
    };

    const handleSaveRoomChanges = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Sending updated data:', editRoomData);

            const response = await fetch(`http://localhost:5000/api/rooms/${openEditModal._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editRoomData.name,
                    description: editRoomData.description
                })
            });

            const updatedRoom = await response.json();
            console.log('Room updated:', updatedRoom);

            handleCloseEditModal();
            fetchUserRooms(); // Refresh the rooms list with new data
        } catch (error) {
            console.error('Error updating room:', error);
        }
    };

    const aiTools = [
        {
            name: 'Notes Digitizer',
            icon: <AutoFixHighIcon />,
            description: 'Convert handwritten notes to digital text'
        },
        {
            name: 'Lecture Summarizer',
            icon: <VideoLibraryIcon />,
            description: 'Generate concise notes from video lectures'
        },
        {
            name: 'Smart Quiz Generator',
            icon: <QuizIcon />,
            description: 'Create quizzes from notes and lecture summaries'
        },
        {
            name: 'Study Assistant Chat',
            icon: <ChatIcon />,
            description: 'Interactive learning support'
        }
    ];

    return (

        <Box sx={{ flexGrow: 1 }}>
            <Navbar
                onMenuClick={() => setDrawerOpen(true)}
                userData={userData}
            />

            <Box sx={{ p: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    mb: 6,
                    mt: 4
                }}>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={() => setOpenCreateModal(true)}
                        size="large"
                    >
                        Create Room
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<GroupAddIcon />}
                        size="large"
                        onClick={() => setOpenJoinModal(true)}
                    >
                        Join Room
                    </Button>
                </Box>
                <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                    <DialogTitle>Share Room</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Invite Link
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={`http://localhost:3000/join-room/${currentShareRoom?.inviteCode}`}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ readOnly: true }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCopy(`http://localhost:3000/join-room/${currentShareRoom?.inviteCode}`)}
                                    >
                                        Copy Link
                                    </Button>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Invite Code
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={currentShareRoom?.inviteCode}
                                        variant="outlined"
                                        size="small"
                                        InputProps={{ readOnly: true }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCopy(currentShareRoom?.inviteCode)}
                                    >
                                        Copy Code
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>


                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                >
                    <Box sx={{ width: 250 }} role="presentation">
                        <List>
                            {aiTools.map((tool) => (
                                <ListItem button key={tool.name}>
                                    <ListItemIcon>
                                        {tool.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={tool.name}
                                        secondary={tool.description}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>

                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}
                >
                    Your Rooms
                </Typography>
                <Grid container spacing={3}>
                    {rooms.map((room) => {
                        // Add debug logs
                        console.log('Current user ID:', userData?.id)
                        console.log('Room members:', room.members)
                        console.log('Admin check:', room.members.find(m => {
                            console.log('Comparing:', {
                                'Member user ID': m.user,
                                'Current user ID': userData?.id,
                                'Member role': m.role
                            })
                            return m.user._id === userData?.id && m.role === 'admin'
                        }))

                        return (
                            <Grid item xs={12} key={room._id}>
                                <Card elevation={3} sx={{
                                    display: 'flex',
                                    bgcolor: room.members.find(m =>
                                        m.user._id === userData?.id &&
                                        m.role === 'admin'
                                    ) ? '#e3f2fd' : 'white',
                                    '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s' }
                                }}>
                                    <CardContent sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="h6" color="primary">{room.name}</Typography>
                                            <Typography color="text.secondary">{room.description}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Members: {room.members?.length || 0}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <IconButton onClick={() => handleShareRoom(room)} color="primary">
                                                <ShareIcon />
                                            </IconButton>

                                            {room.members.find(m =>
                                                m.user._id === userData?.id &&
                                                m.role === 'admin'
                                            ) && (
                                                    <>
                                                        <IconButton onClick={() => handleOpenEditModal(room)} color="warning">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDeleteRoom(room)} color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => {
                                                                console.log('Navigating to settings for room:', room._id);
                                                                navigate(`/room/${room._id}/settings`);
                                                            }}
                                                            color="primary"
                                                        >
                                                            <SettingsIcon />
                                                        </IconButton>

                                                    </>
                                                )}
                                            {!room.members.find(m =>
                                                m.user._id === userData?.id &&
                                                m.role === 'admin'
                                            ) && (
                                                    <Button onClick={() => handleLeaveRoom(room._id)} color="secondary">
                                                        Leave Room
                                                    </Button>
                                                )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => navigate(`/room/${room._id}`)}
                                            >
                                                Enter Room
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
                <Dialog open={openJoinModal} onClose={() => setOpenJoinModal(false)}>
                    <DialogTitle>Join Room</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Invite Code"
                            fullWidth
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenJoinModal(false)}>Cancel</Button>
                        <Button
                            onClick={() => debouncedJoinRoom(inviteCode)}
                            disabled={isJoining}
                        >
                            {isJoining ? 'Joining...' : 'Join'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openCreateModal}
                    onClose={() => setOpenCreateModal(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Create New Room</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Room Name"
                            fullWidth
                            variant="outlined"
                            value={roomData.name}
                            onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={roomData.description}
                            onChange={(e) => setRoomData({ ...roomData, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateRoom} variant="contained">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>



                {/* Delete Room Modal */}
                <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)}>
                    <DialogTitle>Delete Room</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            This action cannot be undone. To confirm deletion, please type 'DELETE' in the field below.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Type DELETE to confirm"
                            fullWidth
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmDialog(false)}>Cancel</Button>
                        <Button
                            onClick={confirmDelete}
                            color="error"
                            disabled={deleteConfirmText !== 'DELETE'}
                        >
                            Delete Room
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Room Modal */}
                <Dialog open={Boolean(openEditModal)} onClose={handleCloseEditModal}>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Room Name"
                            type="text"
                            fullWidth
                            value={editRoomData.name}
                            onChange={(e) => setEditRoomData({ ...editRoomData, name: e.target.value })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={editRoomData.description}
                            onChange={(e) => setEditRoomData({ ...editRoomData, description: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditModal}>Cancel</Button>
                        <Button onClick={handleSaveRoomChanges} color="primary">
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>);
};

export default MainRoom;



