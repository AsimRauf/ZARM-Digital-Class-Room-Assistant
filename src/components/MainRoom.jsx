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
                        sx={{
                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                            borderRadius: '12px',
                            padding: '12px 24px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(59, 30, 84, 0.3)',
                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                            }
                        }}
                    >
                        Create Room
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<GroupAddIcon />}
                        size="large"
                        onClick={() => setOpenJoinModal(true)}
                        sx={{
                            borderRadius: '12px',
                            padding: '12px 24px',
                            borderColor: '#3B1E54',
                            color: '#3B1E54',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: '#5E2E87',
                                background: 'rgba(59, 30, 84, 0.04)'
                            }
                        }}
                    >
                        Join Room
                    </Button>
                </Box>

                {/* Share Room Modal */}
                <Dialog
                    open={shareDialogOpen}
                    onClose={() => setShareDialogOpen(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Share Room
                    </DialogTitle>
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
                                        InputProps={{
                                            readOnly: true,
                                            sx: { borderRadius: '10px' }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCopy(`http://localhost:3000/join-room/${currentShareRoom?.inviteCode}`)}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                            }
                                        }}
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
                                        InputProps={{
                                            readOnly: true,
                                            sx: { borderRadius: '10px' }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCopy(currentShareRoom?.inviteCode)}
                                        sx={{
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                            }
                                        }}
                                    >
                                        Copy Code
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setShareDialogOpen(false)}
                            sx={{
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Close
                        </Button>
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
                    sx={{
                        mt: 4,
                        mb: 3,
                        fontWeight: 700,
                        color: '#3B1E54',
                        position: 'relative',
                        display: 'inline-block',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: '100%',
                            height: '3px',
                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                            borderRadius: '2px'
                        }
                    }}
                >
                    Your Rooms
                </Typography>

                <Grid container spacing={3}>
                    {rooms.map((room) => (
                        <Grid item xs={12} key={room._id}>
                            <Card
                                elevation={0}
                                sx={{
                                    display: 'flex',
                                    background: room.members.find(m =>
                                        m.user._id === userData?.id &&
                                        m.role === 'admin'
                                    ) ? 'linear-gradient(145deg, rgba(59, 30, 84, 0.08), rgba(94, 46, 135, 0.04))' : 'white',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(59, 30, 84, 0.1)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(59, 30, 84, 0.12)'
                                    }
                                }}
                            >
                                <CardContent sx={{
                                    flex: '1 1 auto',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 3
                                }}>
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                color: '#3B1E54',
                                                fontWeight: 600,
                                                mb: 1
                                            }}
                                        >
                                            {room.name}
                                        </Typography>
                                        <Typography
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            {room.description}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(59, 30, 84, 0.6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            Members: {room.members?.length || 0}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center'
                                    }}>
                                        <IconButton
                                            onClick={() => handleShareRoom(room)}
                                            sx={{
                                                color: '#3B1E54',
                                                '&:hover': {
                                                    background: 'rgba(59, 30, 84, 0.08)'
                                                }
                                            }}
                                        >
                                            <ShareIcon />
                                        </IconButton>

                                        {room.members.find(m =>
                                            m.user._id === userData?.id &&
                                            m.role === 'admin'
                                        ) && (
                                                <>
                                                    <IconButton
                                                        onClick={() => handleOpenEditModal(room)}
                                                        sx={{
                                                            color: '#5E2E87',
                                                            '&:hover': {
                                                                background: 'rgba(94, 46, 135, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleDeleteRoom(room)}
                                                        sx={{
                                                            color: '#FF5252',
                                                            '&:hover': {
                                                                background: 'rgba(255, 82, 82, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => navigate(`/room/${room._id}/settings`)}
                                                        sx={{
                                                            color: '#3B1E54',
                                                            '&:hover': {
                                                                background: 'rgba(59, 30, 84, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <SettingsIcon />
                                                    </IconButton>
                                                </>
                                            )}

                                        {!room.members.find(m =>
                                            m.user._id === userData?.id &&
                                            m.role === 'admin'
                                        ) && (
                                                <Button
                                                    onClick={() => handleLeaveRoom(room._id)}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        color: '#FF5252',
                                                        '&:hover': {
                                                            background: 'rgba(255, 82, 82, 0.08)'
                                                        }
                                                    }}
                                                >
                                                    Leave Room
                                                </Button>
                                            )}

                                        <Button
                                            variant="contained"
                                            onClick={() => navigate(`/room/${room._id}`)}
                                            sx={{
                                                borderRadius: '8px',
                                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                                }
                                            }}
                                        >
                                            Enter Room
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog
                    open={openJoinModal}
                    onClose={() => setOpenJoinModal(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            width: '400px',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Join Room
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Invite Code"
                            fullWidth
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button
                            onClick={() => setOpenJoinModal(false)}
                            sx={{
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => debouncedJoinRoom(inviteCode)}
                            disabled={isJoining}
                            variant="contained"
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                }
                            }}
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
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Create New Room
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Room Name"
                            fullWidth
                            variant="outlined"
                            value={roomData.name}
                            onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2, pt: 0 }}>
                        <Button
                            onClick={() => setOpenCreateModal(false)}
                            sx={{
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRoom}
                            variant="contained"
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                }
                            }}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>



                {/* Delete Room Modal */}
                <Dialog
                    open={deleteConfirmDialog}
                    onClose={() => setDeleteConfirmDialog(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Delete Room
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <DialogContentText sx={{ mb: 2 }}>
                            This action cannot be undone. To confirm deletion, please type 'DELETE' in the field below.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Type DELETE to confirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setDeleteConfirmDialog(false)}
                            sx={{
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleteConfirmText !== 'DELETE'}
                            sx={{
                                color: '#FFFFFF',
                                borderRadius: '10px',
                                background: deleteConfirmText === 'DELETE' ? 'linear-gradient(45deg, #FF5252, #FF1744)' : undefined,
                                '&:hover': {
                                    background: deleteConfirmText === 'DELETE' ? 'linear-gradient(45deg, #FF1744, #D50000)' : undefined
                                }
                            }}
                        >
                            Delete Room
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Room Modal */}
                <Dialog
                    open={Boolean(openEditModal)}
                    onClose={handleCloseEditModal}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }
                    }}
                >
                    <DialogTitle sx={{
                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                        color: 'white',
                        borderRadius: '20px 20px 0 0'
                    }}>
                        Edit Room
                    </DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Room Name"
                            fullWidth
                            value={editRoomData.name}
                            onChange={(e) => setEditRoomData({ ...editRoomData, name: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editRoomData.description}
                            onChange={(e) => setEditRoomData({ ...editRoomData, description: e.target.value })}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={handleCloseEditModal}
                            sx={{
                                borderRadius: '10px',
                                color: '#3B1E54'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveRoomChanges}
                            variant="contained"
                            sx={{
                                borderRadius: '10px',
                                background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #4B2E64, #6E3E97)'
                                }
                            }}
                        >
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>);
};

export default MainRoom;



