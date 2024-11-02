import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      profileImage: null
  });

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          console.log('Selected file:', file);
          setFormData(prev => ({
              ...prev,
              profileImage: file
          }));
          setPreview(URL.createObjectURL(file));
      }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
        
      setLoading(true);
      const formDataToSend = new FormData();
        
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
        
      if (formData.profileImage) {
          formDataToSend.append('profileImage', formData.profileImage);
      }

      try {
          const response = await authService.register(formDataToSend);
          console.log('Registration successful:', response);
          navigate('/mainroom');
      } catch (err) {
          console.error('Registration error:', err);
          setError(err.response?.data?.message || 'Registration failed');
      } finally {
          setLoading(false);
      }
  };

  return (
      <Box sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
              Create Account
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                  src={preview}
                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                  onClick={() => document.getElementById('profileImage').click()}
              />
          </Box>

          <input
              id="profileImage"
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
          />

          <form onSubmit={handleSubmit}>
              <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
              />
              <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
              />
              <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
              />
              <TextField
                  fullWidth
                  margin="normal"
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
              />

              {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                      {error}
                  </Typography>
              )}

              <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3 }}
                  disabled={loading}
              >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
          </form>
      </Box>
  );
};

export default RegisterForm;