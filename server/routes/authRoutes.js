const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validation');
const { uploadProfile } = require('../config/multerconfig');

router.post('/register', 
    uploadProfile, 
    validateRegister, 
    register
);

router.post('/login', validateLogin, login);
module.exports = router;