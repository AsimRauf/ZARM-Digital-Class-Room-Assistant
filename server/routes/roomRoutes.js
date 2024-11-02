const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRoom, getUserRooms, updateRoom, joinRoom, deleteRoom, leaveRoom, removeMember, updateMemberRole, getRoomSettings  } = require('../controllers/roomController');

// Define routes with destructured controller functions
router.post('/create', auth, createRoom);
router.get('/user-rooms', auth, getUserRooms);
router.put('/:id', auth, updateRoom);
router.post('/join/:inviteCode', auth, joinRoom);
router.delete('/:id', auth, deleteRoom);
router.post('/leave/:id', auth, leaveRoom);
router.get('/settings/:roomId', auth, getRoomSettings);
router.patch('/settings/:roomId/members/:userId', auth, updateMemberRole);
router.delete('/settings/:roomId/members/:userId', auth, removeMember);
module.exports = router;

