const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createRoom, joinRoom, getUserRooms } = require('../controllers/roomController');

router.post('/create', auth, createRoom);
router.post('/join', auth, joinRoom);
router.get('/user-rooms', auth, getUserRooms);

module.exports = router;