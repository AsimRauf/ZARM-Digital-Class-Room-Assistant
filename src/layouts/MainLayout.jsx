import React from 'react';
import { Container, Box } from '@mui/material';

const MainLayout = ({ children }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        {children}
      </Box>
    </Container>
  );
};

export default MainLayout;
