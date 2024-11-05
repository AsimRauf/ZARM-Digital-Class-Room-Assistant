// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Authentication middleware
const validateCourseAccess = require('../middleware/courseAccess'); // Course access middleware
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { getMessages, sendMessage } = require('../controllers/courseChatController');    

// Set up the upload directory
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Define routes
router.get('/courses/:courseId/chat', auth, validateCourseAccess, getMessages);
router.post('/courses/:courseId/chat', 
    auth, 
    validateCourseAccess,
    upload.array('attachments', 5), // Allows up to 5 files
    sendMessage
);

module.exports = router;
