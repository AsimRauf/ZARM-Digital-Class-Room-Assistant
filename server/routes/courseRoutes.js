const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createCourse, getCourses, updateCourse, deleteCourse } = require('../controllers/courseController');

router.post('/rooms/:roomId/courses', auth, createCourse);
router.get('/rooms/:roomId/courses', auth, getCourses);
router.put('/rooms/:roomId/courses/:courseId', auth, updateCourse);
router.delete('/rooms/:roomId/courses/:courseId', auth, deleteCourse);
module.exports = router;