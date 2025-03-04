const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createNote, getNotes, deleteNote, updateNote, downloadNote, getNotebyId } = require('../controllers/noteController');

// Routes
router.post('/rooms/:roomId/courses/:courseId', auth, createNote);
router.get('/rooms/:roomId/courses/:courseId', auth, getNotes);
router.delete('/:noteId', auth, deleteNote);
router.put('/:noteId', auth, updateNote);
router.get('/:noteId/download', auth, downloadNote);
router.get('/:noteId', auth, getNotebyId);


module.exports = router;


