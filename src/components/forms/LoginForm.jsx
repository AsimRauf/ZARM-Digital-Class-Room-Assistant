import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Container,
    Link,
    IconButton,
    InputAdornment,
    Slide,
    Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import WavingHandIcon from '@mui/icons-material/WavingHand';

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/mainroom');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #3B1E54 0%, #5E2E87 100%)',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("/path-to-pattern.svg")', // Add subtle pattern
                opacity: 0.05,
                animation: 'float 20s infinite linear',
            }
        }}>
            <Container maxWidth="xs">
                <Slide direction="up" in={true} timeout={800}>
                    <Paper elevation={24} sx={{
                        p: 4,
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(59, 30, 84, 0.2)',
                    }}>
                        <Fade in={true} timeout={1200}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                        '100%': { transform: 'scale(1)' }
                                    }
                                }}>
                                    <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                                </Box>

                                <Typography variant="h4" sx={{
                                    mb: 1,
                                    fontWeight: 700,
                                    color: '#3B1E54',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    Welcome Back <WavingHandIcon sx={{ color: '#FFD700' }} />
                                </Typography>

                                <Typography variant="body1" sx={{
                                    mb: 4,
                                    color: 'text.secondary',
                                    textAlign: 'center'
                                }}>
                                    Sign in to continue your learning journey
                                </Typography>

                                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        variant="outlined"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon sx={{ color: '#3B1E54' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        sx={{
                                            mb: 4,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: '#3B1E54' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '12px',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                            boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 20px rgba(59, 30, 84, 0.3)',
                                            }
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                </form>

                                <Typography sx={{ mt: 4, textAlign: 'center' }}>
                                    Don't have an account?{' '}
                                    <Link
                                        onClick={() => navigate('/register')}
                                        sx={{
                                            color: '#3B1E54',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                width: '0%',
                                                height: '2px',
                                                bottom: -2,
                                                left: 0,
                                                background: '#3B1E54',
                                                transition: 'width 0.3s ease'
                                            },
                                            '&:hover::after': {
                                                width: '100%'
                                            }
                                        }}
                                    >
                                        Sign Up
                                    </Link>
                                </Typography>
                            </Box>
                        </Fade>
                    </Paper>
                </Slide>
            </Container>
        </Box>
    );
};

export default LoginForm;
