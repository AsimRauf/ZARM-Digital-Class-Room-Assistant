const { log } = require('console');
const Room = require('../models/Room');
const crypto = require('crypto');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const inviteCode = crypto.randomBytes(6).toString('hex');

        // Check if user already has a room with the same name
        const existingRoom = await Room.findOne({ 
            name, 
            'members.user': req.user._id 
        });

        if (existingRoom) {
            return res.status(400).json({ message: "You already have a room with this name" });
        }

        const room = new Room({
            name,
            description,
            admin: req.user._id,
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

// Add this helper function at the top of the file
const joinRequests = new Map();

// Update the joinRoom controller
const joinRoom = async (req, res) => {
    const inviteCode = req.params.inviteCode;
    const userId = req.user._id.toString();
    const requestKey = `${userId}-${inviteCode}`;
    
    // Check if there's a pending request
    if (joinRequests.get(requestKey)) {
        return res.status(429).json({ message: "Please wait before trying to join again" });
    }

    try {
        // Set request flag
        joinRequests.set(requestKey, true);
        
        const room = await Room.findOne({ inviteCode });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if user is already a member
        const isMember = room.members.some(member => 
            member.user.toString() === userId
        );

        if (isMember) {
            return res.status(400).json({ message: "Already a member of this room" });
        }

        room.members.push({ user: userId, role: 'member' });
        await room.save();
        
        res.status(200).json({ message: "Successfully joined the room" });
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: error.message });
    } finally {
        // Clear request flag after a delay
        setTimeout(() => {
            joinRequests.delete(requestKey);
        }, 5000);
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