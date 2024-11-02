const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRoom, getUserRooms, updateRoom, joinRoom, deleteRoom, leaveRoom } = require('../controllers/roomController');

// Define routes with destructured controller functions
router.post('/create', auth, createRoom);
router.get('/user-rooms', auth, getUserRooms);
router.put('/:id', auth, updateRoom);
router.post('/join/:inviteCode', auth, joinRoom);
router.delete('/:id', auth, deleteRoom);
router.post('/leave/:id', auth, leaveRoom);
module.exports = router;