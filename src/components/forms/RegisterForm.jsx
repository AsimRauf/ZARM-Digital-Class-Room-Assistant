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
    Fade,
    Avatar,
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CelebrationIcon from '@mui/icons-material/Celebration';

const RegisterForm = () => {
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

    const steps = ['Personal Info', 'Security', 'Profile Picture'];

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData({ ...formData, profileImage: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        }

        if (activeStep === 1) {
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

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
                body: formDataToSend
            });

            if (response.ok) {
                navigate('/login');
            } else {
                const data = await response.json();
                setErrors({ submit: data.message });
            }
        } catch (error) {
            setErrors({ submit: 'Registration failed. Please try again.' });
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Fade in={true}>
                        <Box>
                            <TextField
                                fullWidth
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: '#3B1E54' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#3B1E54' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Box>
                    </Fade>
                );
            case 1:
                return (
                    <Fade in={true}>
                        <Box>
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#3B1E54' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                error={Boolean(errors.confirmPassword)}
                                helperText={errors.confirmPassword}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: '#3B1E54' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Box>
                    </Fade>
                );
            case 2:
                return (
                    <Fade in={true}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto',
                                    borderRadius: '50%',
                                    border: '2px dashed #3B1E54',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        borderColor: '#5E2E87'
                                    }
                                }}
                                component="label"
                            >
                                {imagePreview ? (
                                    <Avatar
                                        src={imagePreview}
                                        sx={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    />
                                ) : (
                                    <AddAPhotoIcon sx={{ fontSize: 40, color: '#3B1E54' }} />
                                )}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Box>
                            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Click to upload profile picture
                            </Typography>
                        </Box>
                    </Fade>
                );
            default:
                return null;
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
                background: 'url("/path-to-pattern.svg")',
                opacity: 0.05,
                animation: 'float 20s infinite linear',
            }
        }}>
            <Container maxWidth="sm">
                <Slide direction="up" in={true} timeout={800}>
                    <Paper elevation={24} sx={{
                        p: 4,
                        borderRadius: '24px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(59, 30, 84, 0.2)',
                    }}>
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
                                Create Account <CelebrationIcon sx={{ color: '#FFD700' }} />
                            </Typography>

                            <Typography variant="body1" sx={{
                                mb: 4,
                                color: 'text.secondary',
                                textAlign: 'center'
                            }}>
                                Join our learning community today
                            </Typography>

                            {errors.submit && (
                                <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
                                    {errors.submit}
                                </Alert>
                            )}

                            <Stepper activeStep={activeStep} alternativeLabel sx={{ width: '100%', mb: 4 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            <Box sx={{ width: '100%', mb: 4 }}>
                                {renderStepContent(activeStep)}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <Button
                                    onClick={handleBack}
                                    disabled={activeStep === 0}
                                    sx={{
                                        borderRadius: '12px',
                                        px: 4
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                                    sx={{
                                        borderRadius: '12px',
                                        px: 4,
                                        background: 'linear-gradient(45deg, #3B1E54, #5E2E87)',
                                        boxShadow: '0 4px 15px rgba(59, 30, 84, 0.25)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 20px rgba(59, 30, 84, 0.3)',
                                        }
                                    }}
                                >
                                    {activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                                </Button>
                            </Box>

                            <Typography sx={{ mt: 4, textAlign: 'center' }}>
                                Already have an account?{' '}
                                <Link
                                    onClick={() => navigate('/login')}
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
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </Slide>
            </Container>
        </Box>
    );
};

export default RegisterForm;
