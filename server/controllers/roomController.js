const Room = require('../models/Room');
const crypto = require('crypto');

exports.createRoom = async (req, res) => {
  try {
      console.log('Creating room with data:', req.body);
      console.log('User from token:', req.user);

      const { name, description } = req.body;
      const inviteCode = crypto.randomBytes(6).toString('hex');

      const room = new Room({
          name,
          description,
          admin: req.user.userId, // Using userId from decoded token
          members: [{ user: req.user.userId, role: 'admin' }],
          inviteCode
      });

      const savedRoom = await room.save();
      console.log('Room created:', savedRoom);
      
      res.status(201).json(savedRoom);
  } catch (error) {
      console.error('Room creation error:', error);
      res.status(500).json({ message: error.message });
  }
};


exports.joinRoom = async (req, res) => {
  try {
      const { inviteCode } = req.body;
      const room = await Room.findOne({ inviteCode });
      if (!room) {
          return res.status(404).json({ message: 'Room not found' });
      }
      if (!room.members.some(member => member.user.toString() === req.user._id.toString())) {
          room.members.push({ user: req.user._id });
          await room.save();
      }
      res.json(room);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

exports.getUserRooms = async (req, res) => {
    try {
        console.log('User ID from token:', req.user.userId);
        const rooms = await Room.find({
            'members.user': req.user.userId
        });
        console.log('Found rooms:', rooms);
        res.json(rooms);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};
// Add this function to the existing roomController
exports.getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('admin', 'name email')
            .populate('members.user', 'name email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
