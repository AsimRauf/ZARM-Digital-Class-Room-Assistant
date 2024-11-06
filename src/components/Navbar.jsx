import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ userData }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const aiTools = [
        {
            name: 'Notes Digitizer',
            icon: <AutoFixHighIcon />,
            description: 'Convert handwritten notes to digital text',
            path: '/notes-digitizer'
        },
        {
            name: 'Lecture Summarizer',
            icon: <VideoLibraryIcon />,
            description: 'Generate concise notes from video lectures',
            path: '/video-summarizer'
        },
        {
            name: 'Smart Quiz Generator',
            icon: <QuizIcon />,
            description: 'Create quizzes from notes and lecture summaries',
            path: '/quiz-generator'
        },
        {
            name: 'Study Assistant Chat',
            icon: <ChatIcon />,
            description: 'Interactive learning support',
            path: '/study-assistant'
        }
    ];

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFilesClick = () => {
        navigate('/files');
        // Force a refresh of the FileSystem component
        window.location.pathname = '/files';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
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
                        ZARM EduSpace
                    </Typography>
                    {userData && (
                        <div>
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/')}
                                sx={{ ml: 2 }}
                            >
                                <HomeIcon />
                                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                    Rooms
                                </Typography>
                            </IconButton>

                            <IconButton
                                color="inherit"
                                onClick={handleFilesClick}
                                sx={{ ml: 2 }}
                            >
                                <FolderIcon />
                                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                    Files
                                </Typography>
                            </IconButton>

                            <IconButton onClick={handleMenu} color="inherit">
                                <Avatar src={userData.profileImage} />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => navigate('/profile')}>
                                    <AccountCircleIcon sx={{ mr: 1 }} /> Profile
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                                </MenuItem>
                            </Menu>
                        </div>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <Box sx={{ width: 250 }} role="presentation">
                    <List>
                        {aiTools.map((tool) => (
                            <ListItem
                                button
                                key={tool.name}
                                onClick={() => {
                                    navigate(tool.path);
                                    setDrawerOpen(false);
                                }}
                            >
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
        </>
    );
};

export default Navbar;



