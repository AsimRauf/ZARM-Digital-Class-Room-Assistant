import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
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
import SummarizedNotes from './components/SummarizedNotes';
import ViewSummarizedNote from './components/ViewSummarizedNote';
import QuizGenerator from './components/QuizGenerator/QuizGenerator';
import QuizList from './components/Quiz/QuizList';
import TakeQuiz from './components/Quiz/TakeQuiz';
import QuizResults from './components/Quiz/QuizResults';




function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                    <PublicRoute><LoginForm /></PublicRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute><LoginForm /></PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute><RegisterForm /></PublicRoute>
                } />


                {/* Protected Routes */}
                <Route path="/quiz-results/:quizId" element={
                    <ProtectedRoute><QuizResults /></ProtectedRoute>
                } />
                <Route path="/notes/:noteId" element={
                    <ProtectedRoute><ViewNote /></ProtectedRoute>
                } />
                <Route path="/quiz/:quizId" element={
                    <ProtectedRoute><TakeQuiz /></ProtectedRoute>
                } />
                <Route path="/quizzes" element={
                    <ProtectedRoute><QuizList /></ProtectedRoute>
                } />
                <Route path="/quiz-generator" element={
                    <ProtectedRoute><QuizGenerator /></ProtectedRoute>
                } />
                <Route path="/video-summarizer" element={
                    <ProtectedRoute><VideoSummarizer /></ProtectedRoute>
                } />
                <Route path="/room/:roomId/course/:courseId/chat" element={
                    <ProtectedRoute><CourseChat /></ProtectedRoute>
                } />
                <Route path="/summaries/:roomId/:courseId/:contentId" element={
                    <ProtectedRoute><ViewSummarizedNote /></ProtectedRoute>
                } />
                <Route path="/files/:roomId/:courseId/notes" element={
                    <ProtectedRoute><NotesDisplay /></ProtectedRoute>
                } />
                <Route path="/files" element={
                    <ProtectedRoute><FileSystem /></ProtectedRoute>
                } />
                <Route path="/files/:roomId" element={
                    <ProtectedRoute><FileSystem /></ProtectedRoute>
                } />
                <Route path="/files/:roomId/:courseId" element={
                    <ProtectedRoute><FileSystem /></ProtectedRoute>
                } />
                <Route path="/files/:roomId/:courseId/summaries" element={
                    <ProtectedRoute><SummarizedNotes /></ProtectedRoute>
                } />
                <Route path="/room/:roomId/settings" element={
                    <ProtectedRoute><RoomSettings /></ProtectedRoute>
                } />
                <Route path="/join-room/:inviteCode" element={
                    <ProtectedRoute><JoinRoom /></ProtectedRoute>
                } />
                <Route path="/room/:roomId" element={
                    <ProtectedRoute><RoomInterior /></ProtectedRoute>
                } />
                <Route path="/mainroom" element={
                    <ProtectedRoute><MainRoom /></ProtectedRoute>
                } />
                <Route path="/notes-digitizer" element={
                    <ProtectedRoute><NotesDigitizer /></ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}


export default App;




