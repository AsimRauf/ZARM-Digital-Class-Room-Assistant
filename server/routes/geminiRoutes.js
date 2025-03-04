const express = require('express');
const router = express.Router();
const multer = require('multer');
const { convertHandwrittenNotes } = require('../controllers/geminiController');

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    },
    limits: {
        fileSize: 30 * 1024 * 1024 // 10MB limit
    }
});
router.post('/convert', upload.single('file'), convertHandwrittenNotes);

module.exports = router;
