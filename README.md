# Zarm Eduspace (Digital Learning Platform)

A modern web application for managing digital notes, course materials, and collaborative learning spaces, enhanced with Gemini AI and Assembly AI capabilities.

## Core Features

### Implemented Features

- Room-based Learning Spaces
  - Create and join rooms
  - Invite system with unique codes
  - Member management
  - Admin controls

- Course Organization
  - Structured course folders
  - Digital notes management
  - Resource categorization
  - Easy navigation system

- Digital Notes System
  - Rich text editor
  - HTML content support
  - Note organization by courses
  - View, edit, and delete functionality

- Video Lecture Intelligence
  - Video/Audio transcription
  - AI-powered content analysis
  - Smart summaries and key points
  - YouTube video support
  - Local video processing
  - Notes organization by rooms/courses

### AI Features

#### Current Implementation

- Notes Digitizer (Gemini)
  - Handwritten to digital text conversion
  - Smart formatting preservation
  - Multi-language support

- Video Summarizer (Assembly AI + Gemini)
  - Automatic transcription
  - Executive summaries
  - Enhanced study notes
  - Key insights extraction
  - Full transcript access
  - Progress tracking
  - YouTube integration

- Smart Quiz Generator
  - Automatic quiz creation from notes
  - Multiple question formats
  - Difficulty levels

#### Upcoming Features

- Study Assistant
  - Context-aware learning support
  - Resource recommendations
  - Doubt resolution

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- Socket.io Client
- JWT Authentication

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.io
- JWT

### AI Integration
- Google Gemini API
- Assembly AI API
- Cloud Vision API
- Natural Language Processing

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Rooms
- GET /api/rooms/user-rooms
- POST /api/rooms/create
- PUT /api/rooms/:roomId
- DELETE /api/rooms/:roomId
- POST /api/rooms/join/:inviteCode

### Notes
- GET /api/notes/rooms/:roomId/courses/:courseId
- POST /api/notes/rooms/:roomId/courses/:courseId
- PUT /api/notes/:noteId
- DELETE /api/notes/:noteId

### Video Content
- POST /api/video/process
- POST /api/video/process-youtube
- GET /api/video/content
- POST /api/video-content/save
- DELETE /api/video/content/:id
- GET /api/video/youtube-info

## Environment Variables

### Server (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_GEMINI_API=your_api_key
ASSEMBLY_AI_API_KEY=your_assembly_ai_key
