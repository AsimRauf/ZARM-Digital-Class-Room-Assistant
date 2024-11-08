const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { processVideo, getUserContent, getContent, processYoutubeVideo, getYoutubeInfo } = require('../controllers/videoTranscriptionController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp/videos');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Storing file in:', tempDir);
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        console.log('Generated filename:', uniqueName);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    console.log('Checking file:', file.originalname);
    console.log('Mimetype:', file.mimetype);

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, MOV, and AVI videos are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

// Routes
router.post('/process', 
    auth, 
    upload.single('video'),
    (req, res, next) => {
        console.log('=== Video Upload Received ===');
        console.log('File details:', req.file);
        next();
    },
    processVideo
);
router.get('/content', auth, getUserContent);
router.get('/content/:id', auth, getContent);
router.post('/youtube-info', auth, getYoutubeInfo);
router.post('/process-youtube', auth, processYoutubeVideo);



module.exports = router;


