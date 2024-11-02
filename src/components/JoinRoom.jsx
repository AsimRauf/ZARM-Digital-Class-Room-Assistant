import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';

const JoinRoom = () => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const joinRoom = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/rooms/join/${inviteCode}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                navigate('/mainroom');
            } else {
                setError(data.message || 'Failed to join room');
            }
        } catch (error) {
            setError('Unable to join room');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        joinRoom();
    }, [inviteCode]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
            {loading ? (
                <>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Joining room...
                    </Typography>
                </>
            ) : error ? (
                <>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/mainroom')}
                    >
                        Return to Dashboard
                    </Button>
                </>
            ) : null}
        </Box>
    );
};

export default JoinRoom;