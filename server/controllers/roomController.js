const Room = require('../models/Room');
const crypto = require('crypto');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const inviteCode = crypto.randomBytes(6).toString('hex');

        const room = new Room({
            name,
            description,
            admin: req.user._id, // Use consistent user ID reference
            members: [{ user: req.user._id, role: 'admin' }],
            inviteCode
        });

        const savedRoom = await room.save();
        res.status(201).json(savedRoom);
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get rooms where the user is a member
const getUserRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            'members.user': req.user._id
        }).populate('admin', '_id name'); // Populate admin details

        console.log('Found rooms:', rooms);
        res.json(rooms);
    } catch (error) {
        console.error("Error retrieving user rooms:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update room details
const updateRoom = async (req, res) => {
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description
            },
            { new: true, runValidators: true } // Ensure validators run on update
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.json(updatedRoom);
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: error.message });
    }
};

// Join a room using the invite code
const joinRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ inviteCode: req.params.inviteCode });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user is already a member using strict comparison
        const isMember = room.members.some(memberId => 
            memberId.toString() === req.user._id.toString()
        );

        if (!isMember) {
            room.members.push(req.user._id);
            await room.save();
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createRoom,
    getUserRooms,
    updateRoom,
    joinRoom
};
