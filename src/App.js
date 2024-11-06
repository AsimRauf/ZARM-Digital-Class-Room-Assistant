import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/forms/RegisterForm';
import LoginForm from './components/forms/LoginForm';
import MainRoom from './components/MainRoom';
import JoinRoom from './components/JoinRoom';
import RoomInterior from './components/RoomInterior';
import RoomSettings from './components/RoomSettings';
import NotesDigitizer from './components/NotesDigitizer';
import FileSystem from './components/FileSystem';
import NotesDisplay from './components/NotesDisplay';
import ViewNote from './components/ViewNote';
import CourseChat from './components/CourseChat/CourseChat';
import VideoSummarizer from './components/VideoSummarizer/VideoSummarizer';



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
                <Route path="/video-summarizer" element={<VideoSummarizer />} />
                <Route path="/room/:roomId/course/:courseId/chat" element={<CourseChat />} />
                <Route path="/notes/:roomId/:courseId/:noteId" element={<ViewNote />} />
                <Route path="/files/:roomId/:courseId/notes" element={<NotesDisplay />} />
                <Route path="/files" element={<FileSystem />} />
                <Route path="/files/:roomId" element={<FileSystem />} />
                <Route path="/files/:roomId/:courseId" element={<FileSystem />} />
                <Route path="/files/:roomId/:courseId/notes" element={<FileSystem />} />
                <Route path="/room/:roomId/settings" element={<RoomSettings />} />
                <Route path="/join-room/:inviteCode" element={<JoinRoom />} />
                <Route path="/room/:roomId" element={<RoomInterior />} />
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
                <Route path="/notes-digitizer" element={<NotesDigitizer />} />
            </Routes>
        </Router>
    );
}
export default App;


