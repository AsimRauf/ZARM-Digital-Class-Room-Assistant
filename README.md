<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
>>>>>>> 35e1651f2ca9602226086be022f6831f2b17e78d
