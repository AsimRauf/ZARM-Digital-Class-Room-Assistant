# Digital Learning Platform

A modern web application for managing digital notes, course materials, and collaborative learning spaces.

## Features

### Room Management
- Create and join learning rooms
- Manage room members and permissions
- Share rooms via invite codes
- Administrative controls for room owners

### Course Organization
- Organize content by courses within rooms
- Digital notes management
- Resource sharing capabilities
- Structured learning paths

### Digital Notes
- Create and edit rich text notes
- View formatted HTML content
- Real-time updates
- Tag and categorize notes
- Share notes within courses

### User System
- Secure authentication
- User profiles
- Role-based access control
- Personal workspace

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

## Database Schema

### User
- email
- password
- name
- role

### Room
- name
- description
- members
- inviteCode
- courses

### Note
- title
- content
- htmlContent
- courseId
- userId
- roomId
- tags
- createdAt
- lastModified

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
cd client && npm install
cd ../server && npm install
