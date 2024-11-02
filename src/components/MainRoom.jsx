import React, { useState, useEffect } from 'react';
import { 
    Box, 
    AppBar, 
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
    const [openEditModal, setOpenEditModal] = useState(null);  // State for edit modal
    const [editRoomData, setEditRoomData] = useState({ name: '', description: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            fetchUserData(decoded.email);
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
          try {
              const token = localStorage.getItem('token');
              console.log('Fetching rooms with token:', token);
              const response = await fetch('http://localhost:5000/api/rooms/user-rooms', {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              });
              const data = await response.json();
              console.log('Fetched rooms:', data);
              console.log('room admin: ', data[0].admin._id );
              setRooms(data);
          } catch (error) {
              console.error('Error fetching rooms:', error);
          }
      };

      
    useEffect(() => {
        fetchUserRooms();
    }, []);

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
      const handleShareRoom = (inviteCode) => {
          navigator.clipboard.writeText(`http://localhost:3000/join-room/${inviteCode}`);
          // Add a snackbar notification here
      };

      const handleDeleteRoom = async (roomId) => {
          const token = localStorage.getItem('token');
          await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          fetchUserRooms();
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
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        ZARM Digital Classroom
                    </Typography>

                    {userData && (
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                            {userData.name}
                        </Typography>
                    )}

                    <IconButton color="inherit" sx={{ mr: 2 }}>
                        <FolderIcon />
                        <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            Saved Files
                        </Typography>
                    </IconButton>
                      <IconButton
                          size="large"
                          onClick={handleMenu}
                          color="inherit"
                      >
                          <Avatar 
                              src={userData?.profileImage} 
                              alt={userData?.name}
                              sx={{ width: 40, height: 40 }}
                          />
                      </IconButton>
                      <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                      >
                          <MenuItem onClick={() => {
                              navigate('/profile')
                              handleClose()
                          }}>
                              <AccountCircleIcon sx={{ mr: 1 }} />
                              Profile
                          </MenuItem>
                          <MenuItem onClick={() => {
                              handleLogout()
                              handleClose()
                          }}>
                              <LogoutIcon sx={{ mr: 1 }} />
                              Logout
                          </MenuItem>
                      </Menu>
                  </Toolbar>
            </AppBar>

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
                    >
                        Join Room
                    </Button>
                </Box>

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
                          
                          
                          return (
                              <Grid item xs={12} key={room._id}>
                                  <Card 
                                      elevation={3}
                                      sx={{ 
                                          display: 'flex',
                                          bgcolor: room.admin._id === userData?._id ? '#e3f2fd' : 'white',
                                          '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s' }
                                      }}
                                  >
                                      <CardContent sx={{ flex: '1 1 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Box>
                                              <Typography variant="h6" color="primary">
                                                  {room.name}
                                              </Typography>
                                              <Typography color="text.secondary">
                                                  {room.description}
                                              </Typography>
                                              <Typography variant="body2" color="text.secondary">
                                                  Members: {room.members?.length || 0}
                                              </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                              <IconButton 
                                                  onClick={() => handleShareRoom(room.inviteCode)}
                                                  color="primary"
                                                  title="Copy invite link"
                                              >
                                                  <ShareIcon />
                                              </IconButton>
                                              { room.admin._id === userData.id && (
                                                  <>
                                                      <IconButton 
                                                          onClick={() => handleOpenEditModal(room)}
                                                          color="warning"
                                                      >
                                                          <EditIcon />
                                                      </IconButton>
                                                      <IconButton 
                                                          onClick={() => handleDeleteRoom(room._id)}
                                                          color="error"
                                                      >
                                                          <DeleteIcon />
                                                      </IconButton>
                                                  </>
                                              )}
                                              <Button 
                                                  variant="contained" 
                                                  color="primary"
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
                            onChange={(e) => setRoomData({...roomData, name: e.target.value})}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={roomData.description}
                            onChange={(e) => setRoomData({...roomData, description: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
                        <Button onClick={handleCreateRoom} variant="contained">
                            Create
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
        </Box>    );
};

export default MainRoom;

// At the very end of MainRoom.jsx, make sure you have:



