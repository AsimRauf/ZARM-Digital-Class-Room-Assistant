const { log } = require('console');
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

const joinRoom = async (req, res) => {
    try {
        // Find and update the room, adding the user only if they aren't already a member
        const room = await Room.findOneAndUpdate(
            { inviteCode: req.params.inviteCode },
            { $addToSet: { members: { user: req.user._id, role: 'member' } } }, // Add user to members if not already present
            { new: true } // Return the updated document
        );

        // Check if the room was found
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Return the updated room data
        res.json(room);
    } catch (error) {
        console.error("Error joining room:", error);

        // Additional error handling for unexpected issues
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Add this new controller function
const deleteRoom = async (req, res) => {
    console.log('Deleting room with ID:', req.params.id);
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is admin
        if (room.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only room admin can delete rooms" });
        }

        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: error.message });
    }
};

//leave room
const leaveRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Remove the user from the room's members list
        room.members = room.members.filter(member => member.user.toString() !== req.user._id.toString());
        await room.save();

        res.status(200).json({ message: "Left the room successfully" });
    } catch (error) {
        console.error("Error leaving room:", error);
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    createRoom,
    getUserRooms,
    updateRoom,
    joinRoom,
    deleteRoom,
    leaveRoom
};