// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');



// Registration controller
exports.register = async (req, res) => {
    try {
        // Log raw request data
        console.log('Raw request data:', req.body);
        
        // Extract data directly from request body
        const name = req.body.name.toString();
        const email = req.body.email.toString();
        const password = req.body.password.toString();
        
        // Create user with validated data
        const user = new User({
            name: name,
            email: email,
            password: password,
            profileImage: req.file?.path
        });

        const savedUser = await user.save();
        console.log('User created:', savedUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Login controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

