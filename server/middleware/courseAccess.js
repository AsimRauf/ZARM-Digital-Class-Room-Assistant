const Room = require('../models/Room');

const validateCourseAccess = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const room = await Room.findOne({
            'courses': courseId,
            'members.user': userId
        });

        if (!room) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const member = room.members.find(m => m.user.toString() === userId.toString());

        if (member.role === 'admin') {
            return next();
        }

        if (member.role === 'teacher' && member.assignedCourse?.toString() === courseId) {
            return next();
        }

        if (member.role === 'student') {
            const course = await Course.findById(courseId);
            if (course.accessLevel === 'all') {
                return next();
            }
        }

        res.status(403).json({ message: 'You do not have access to this course chat' });
    } catch (error) {
        res.status(500).json({ message: 'Error validating course access' });
    }
};

module.exports = validateCourseAccess;
