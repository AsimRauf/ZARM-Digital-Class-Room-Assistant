const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const videoContentController = require('../controllers/videoContentController');


router.get('/course/:courseId', auth, videoContentController.getVideoContentByCourse);
router.get('/all', auth, videoContentController.getAllUserVideoContent);
router.post('/save', auth, videoContentController.saveVideoContent);
router.get('/:id', auth, videoContentController.getVideoContentById);
router.put('/:id', auth, videoContentController.updateVideoTitle);
router.delete('/:id', auth, videoContentController.deleteVideoContent);



module.exports = router;
