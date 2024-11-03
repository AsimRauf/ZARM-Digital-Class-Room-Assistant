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

const joinRoom = async (req, res) => {
    const requestKey = `${req.user._id}-${req.params.inviteCode}`;
    
    if (joinRequests.has(requestKey)) {
        return res.status(200).json({ message: "Join request in progress" });
    }

    joinRequests.set(requestKey, true);
    
    try {
        const room = await Room.findOne({ inviteCode: req.params.inviteCode });
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const existingMember = room.members.find(
            member => member.user.toString() === req.user._id.toString()
        );

        if (existingMember) {
            return res.status(200).json({ message: "Already a member of this room", room });
        }

        room.members.push({ 
            user: req.user._id, 
            role: 'student'
        });

        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        setTimeout(() => {
            joinRequests.delete(requestKey);
        }, 300);
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isAdmin = room.members.find(
            member => member.user.toString() === req.user._id.toString() && 
            member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can delete room" });
        }

        await Room.findByIdAndDelete(req.params.id);
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({ message: error.message });
    }
};
  const leaveRoom = async (req, res) => {
      try {
          const room = await Room.findById(req.params.roomId);
        
          if (!room) {
              return res.status(404).json({ message: "Room not found" });
          }
            // Check if user is admin
            const isAdmin = room.members.find(
                member => member.user.toString() === req.user._id.toString() && 
                member.role === 'admin'
            );

            if (isAdmin) {
                return res.status(403).json({ message: "Admin cannot leave room" });
            }

            // Remove member from room
            room.members = room.members.filter(
                member => member.user.toString() !== req.user._id.toString()
            );

            await room.save();
            res.json({ message: "Successfully left room" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    module.exports = { leaveRoom };

  const getRoomSettings = async (req, res) => {
      try {
          const room = await Room.findById(req.params.roomId)
              .populate('members.user', 'name email profileImage');

          if (!room) {
              return res.status(404).json({ message: "Room not found" });
          }

          const isAdmin = room.members.find(
              m => m.user._id.toString() === req.user._id.toString() && 
              m.role === 'admin'
          );

          if (!isAdmin) {
              return res.status(403).json({ message: "Only admin can access settings" });
          }

          res.json(room);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  };

  const updateMemberRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const roomId = req.params.roomId;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find and update the member's role
        const memberIndex = room.members.findIndex(
            member => member.user.toString() === userId
        );

        if (memberIndex !== -1) {
            room.members[memberIndex].role = role;
            // Clear assigned course if role is not teacher
            if (role !== 'teacher') {
                room.members[memberIndex].assignedCourse = null;
            }
        }

        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

  const getUserRooms = async (req, res) => {
      try {
          const rooms = await Room.find({
              'members.user': req.user._id
          }).populate('members.user', 'name email profileImage');

          // Filter rooms based on teacher's assigned course
          const filteredRooms = rooms.filter(room => {
              const member = room.members.find(m => m.user._id.toString() === req.user._id.toString());
              return member.role !== 'teacher' || (member.role === 'teacher' && member.assignedCourse);
          });

          res.json(filteredRooms);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
  };

const removeMember = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.members.find(m => 
            m.user.toString() === req.user._id.toString() && 
            m.role === 'admin'
        )) {
            return res.status(403).json({ message: "Only admin can remove members" });
        }

        room.members = room.members.filter(
            member => member.user.toString() !== req.params.userId
        );
        
        await room.save();
        res.json({ message: "Member removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRoomDetails = async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId)
            .populate('members.user')
            .populate('members.assignedCourse');
            
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignTeacher = async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const roomId = req.params.roomId;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find and update the member's role and assigned course
        const memberIndex = room.members.findIndex(
            member => member.user.toString() === userId
        );

        if (memberIndex !== -1) {
            room.members[memberIndex].role = 'teacher';
            room.members[memberIndex].assignedCourse = courseId;
        }

        await room.save();
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




module.exports = {
    createRoom,
    getUserRooms,
    updateRoom,
    joinRoom,
    deleteRoom,
    leaveRoom,
    getRoomSettings,
    updateMemberRole,
    removeMember,
    getRoomDetails,
    assignTeacher
};




