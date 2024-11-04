const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createNote, getNotes, deleteNote, updateNote } = require('../controllers/noteController');

// Routes
router.post('/rooms/:roomId/courses/:courseId', auth, createNote);
router.get('/rooms/:roomId/courses/:courseId', auth, getNotes);
router.delete('/:noteId', auth, deleteNote);
router.put('/:noteId', auth, updateNote);

module.exports = router;

