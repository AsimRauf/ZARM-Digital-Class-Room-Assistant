const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const cloudinaryConfig = require('./config/cloudinary');
const corsOptions = require('./config/corsConfig');
const courseRoutes = require('./routes/courseRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const noteRoutes = require('./routes/noteRoutes');
const courseChatRoutes = require('./routes/courseChatRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join-course', ({ courseId }) => {
      socket.join(`course-${courseId}`);
      console.log(`Joined course: ${courseId}`);
  });

  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://client-five-lemon.vercel.app',
    'https://your-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api', courseRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/chat', courseChatRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
