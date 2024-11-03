const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    createRoom, 
    getUserRooms, 
    updateRoom, 
    joinRoom, 
    deleteRoom, 
    leaveRoom, 
    removeMember, 
    updateMemberRole, 
    getRoomSettings,
    getRoomDetails,
    assignTeacher
} = require('../controllers/roomController');

router.post('/create', auth, createRoom);
router.get('/user-rooms', auth, getUserRooms);
router.put('/:roomId/member-role', auth, updateMemberRole);
router.put('/:id', auth, updateRoom);
router.post('/join/:inviteCode', auth, joinRoom);
router.delete('/:id', auth, deleteRoom);
router.post('/leave/:roomId', auth, leaveRoom);
router.delete('/:roomId/members/:userId', auth, removeMember);
router.get('/:roomId/settings', auth, getRoomSettings);
router.get('/:roomId', auth, getRoomDetails);
router.post('/:roomId/assign-teacher', auth, assignTeacher);

module.exports = router;





