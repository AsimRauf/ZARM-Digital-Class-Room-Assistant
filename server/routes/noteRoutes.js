const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createNote, getNotes } = require('../controllers/noteController');

// Update route to match the endpoint
router.post('/rooms/:roomId/courses/:courseId', auth, createNote);
router.get('/rooms/:roomId/courses/:courseId', auth, getNotes);
module.exports = router;