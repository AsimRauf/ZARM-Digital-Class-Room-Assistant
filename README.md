# Zarm Eduspace (Digital Learning Platform)

A modern web application for managing digital notes, course materials, and collaborative learning spaces, enhanced with Gemini AI capabilities.

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

### AI Features (Powered by Gemini)

#### Current Implementation
- Notes Digitizer
  - Handwritten to digital text conversion
  - Smart formatting preservation
  - Multi-language support

#### Upcoming Features
- Lecture Summarizer
  - Video lecture analysis
  - Key points extraction
  - Chapter summaries

- Smart Quiz Generator
  - Automatic quiz creation from notes
  - Multiple question formats
  - Difficulty levels

- Study Assistant
  - Context-aware learning support
  - Resource recommendations
  - Doubt resolution

## Tech Stack

### Frontend
- React.js
- Material-UI
- React Router
- JWT Authentication

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT

### AI Integration
- Google Gemini API
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

## Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
cd client && npm install
cd ../server && npm install
