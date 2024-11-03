import React, { useState, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    IconButton, 
    Typography, 
    Avatar, 
    Menu, 
    MenuItem, 
    Box 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FolderIcon from '@mui/icons-material/Folder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick, userData }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

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

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onMenuClick}
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
    );
};

export default Navbar;
