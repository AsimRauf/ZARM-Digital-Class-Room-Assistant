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
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

const Register = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profileImage: null
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        
        if (!validateForm()) return;

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        if (formData.profileImage) {
            formDataToSend.append('profileImage', formData.profileImage);
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                body: formDataToSend // Remove Content-Type header for FormData
            });

            const data = await response.json();
            
            if (response.ok) {
                navigate('/login');
            } else {
                setServerError(data.message);
                setErrors(prev => ({ ...prev, email: data.message }));
            }
        } catch (error) {
            setServerError('Registration failed. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                border: '2px dashed #2196F3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                mb: 3,
                                '&:hover': {
                                    opacity: 0.8,
                                    backgroundColor: 'rgba(33, 150, 243, 0.04)'
                                }
                            }}
                            component="label"
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <AddAPhotoIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            )}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Box>

                        <SchoolIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                        <Typography component="h1" variant="h4" sx={{ 
                            mb: 3, 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Join EduSpace
                        </Typography>

                        {serverError && (
                            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                {serverError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                sx={{ mb: 2 }}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                    setFormData({ ...formData, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: '' });
                                    setServerError('');
                                }}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                sx={{ mb: 2 }}
                            />
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    setFormData({ ...formData, confirmPassword: e.target.value });
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                                }}
                                error={Boolean(errors.confirmPassword)}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
                                        transform: 'scale(1.02)'
                                    }
                                }}
                            >
                                Create Account
                            </Button>
                        </form>

                        <Typography variant="body1" sx={{ mt: 4 }}>
                            Already have an account?{' '}
                            <Link
                                onClick={() => navigate('/login')}
                                sx={{
                                    cursor: 'pointer',
                                    color: 'primary.main',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Sign In
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;