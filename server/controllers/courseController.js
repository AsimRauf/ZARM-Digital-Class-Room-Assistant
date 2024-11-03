const Course = require('../models/Course');
const Room = require('../models/Room');

const createCourse = async (req, res) => {
    try {
        const { name, description } = req.body;
        const roomId = req.params.roomId;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isAdmin = room.members.find(m => 
            m.user.toString() === req.user._id.toString() && 
            m.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can create courses" });
        }

        const course = new Course({
            name,
            description,
            room: roomId
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourses = async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const member = room.members.find(m => m.user.toString() === req.user._id.toString());
        
        if (member.role === 'admin') {
            const courses = await Course.find({ room: roomId });
            return res.json(courses);
        }

        if (member.role === 'teacher') {
            if (member.assignedCourse) {
                const course = await Course.findById(member.assignedCourse);
                return res.json([course]);
            }
            return res.json([]);
        }

        const courses = await Course.find({ 
            room: roomId,
            accessLevel: 'all'
        });
        return res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { roomId, courseId } = req.params;
        const { name, description } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isAdmin = room.members.find(m => 
            m.user.toString() === req.user._id.toString() && 
            m.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can update courses" });
        }

        const course = await Course.findByIdAndUpdate(
            courseId,
            { name, description },
            { new: true }
        );

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { roomId, courseId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const isAdmin = room.members.find(m => 
            m.user.toString() === req.user._id.toString() && 
            m.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only admin can delete courses" });
        }

        await Course.findByIdAndDelete(courseId);
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getCourses,
    updateCourse,
    deleteCourse
};