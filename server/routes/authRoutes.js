const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');
const upload = require('../config/multerconfig');

// Place validation after multer to access req.body
router.post('/register', 
    upload.single('profileImage'), 
    validateRegister, 
    register
);

router.post('/login', validateLogin, login);

module.exports = router;