import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/forms/RegisterForm';
import LoginForm from './components/forms/LoginForm';
import MainRoom from './components/MainRoom';
import JoinRoom from './components/JoinRoom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/mainroom" />;
};

function App() {
  return (
      <Router>
          <Routes>

            <Route path="/join-room/:inviteCode" element={<JoinRoom />} />

              <Route path="/" element={
                  <PublicRoute>
                      <LoginForm />
                  </PublicRoute>
              } />
              <Route path="/login" element={
                  <PublicRoute>
                      <LoginForm />
                  </PublicRoute>
              } />
              <Route path="/register" element={
                  <PublicRoute>
                      <RegisterForm />
                  </PublicRoute>
              } />
              <Route path="/mainroom" element={
                  <PrivateRoute>
                      <MainRoom />
                  </PrivateRoute>
              } />
          </Routes>
      </Router>
  );
}

export default App;