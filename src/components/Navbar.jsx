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
    List,
    ListItem,
    ListItemIcon,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom';
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
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
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

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
        setDrawerOpen(true);
        document.body.style.overflow = 'auto';
    };

    const handleClose = () => {
        setAnchorEl(null);

    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setDrawerOpen(false);
        setDrawerOpen(false);
        document.body.style.overflow = '';
    };

    const handleFilesClick = () => {
        navigate('/files');
        window.location.pathname = '/files';
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    background: '#3B1E54',
                    margin: '16px auto',
                    maxWidth: '90%',
                    borderRadius: '30px',
                    width: '1400px',
                    boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(59, 30, 84, 0.95)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                }}
            >
                <Toolbar sx={{
                    minHeight: '64px',
                    padding: '0 24px',
                }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleMenuOpen}
                        sx={{
                            marginRight: 2,
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #fff, #e0e0e0)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        ZARM
                    </Typography>

                    {userData && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/')}
                            >
                                <HomeIcon />
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        ml: 1,
                                        display: { xs: 'none', sm: 'block' }
                                    }}
                                >
                                    Rooms
                                </Typography>
                            </IconButton>

                            <IconButton
                                color="inherit"
                                onClick={handleFilesClick}
                            >
                                <FolderIcon />
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        ml: 1,
                                        display: { xs: 'none', sm: 'block' }
                                    }}
                                >
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

            <Toolbar sx={{ marginBottom: '16px' }} />

            <Menu
                anchorEl={menuAnchorEl}
                open={drawerOpen}
                onClose={handleMenuClose}
                disableScrollLock // Add this property
                slotProps={{
                    paper: {
                        sx: {
                            mt: 2,
                            ml: 2,
                            width: 320,
                            maxHeight: '80vh',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            boxShadow: '0 8px 32px rgba(59, 30, 84, 0.18)',
                            animation: 'slideIn 0.3s ease-out',
                            overflowY: 'auto', // Keep the menu scrollable
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '@keyframes slideIn': {
                                from: { opacity: 0, transform: 'translateY(-20px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                        },
                    },
                }}
            >

                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                        Learning Tools
                    </Typography>
                    <List sx={{
                        '& .MuiListItem-root': {
                            borderRadius: '12px',
                            mb: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 30, 84, 0.08)',
                                transform: 'translateX(4px)'
                            }
                        }
                    }}>
                        {aiTools.map((tool) => (
                            <ListItem
                                button
                                key={tool.name}
                                onClick={() => {
                                    navigate(tool.path);
                                    handleMenuClose();
                                }}
                            >
                                <ListItemIcon sx={{ color: '#3B1E54' }}>
                                    {tool.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={tool.name}
                                    secondary={tool.description}
                                    primaryTypographyProps={{
                                        fontWeight: 500,
                                        color: '#3B1E54'
                                    }}
                                    secondaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        color: 'rgba(59, 30, 84, 0.6)'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    <Typography variant="subtitle2" sx={{
                        px: 2,
                        py: 1,
                        mt: 2,
                        color: 'text.secondary',
                        fontWeight: 500
                    }}>
                        Assessment
                    </Typography>
                    <ListItem
                        disablePadding
                        sx={{
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(59, 30, 84, 0.08)',
                                transform: 'translateX(4px)'
                            }
                        }}
                    >
                        <ListItemButton
                            component={Link}
                            to="/quizzes"
                            onClick={handleMenuClose}
                        >
                            <ListItemIcon sx={{ color: '#3B1E54' }}>
                                <QuizIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Take Quiz"
                                primaryTypographyProps={{
                                    fontWeight: 500,
                                    color: '#3B1E54'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                </Box>
            </Menu>
        </>
    );
};

export default Navbar;