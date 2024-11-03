// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../config/cloudinary');
const crypto = require('crypto');



// Registration controller
const register = async (req, res) => {
    try {
        const { email } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        let profileImageUrl = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            profileImageUrl = result.secure_url;
        }

        const user = new User({
            ...req.body,
            profileImage: profileImageUrl
        });
        
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Login controller
const login = async (req, res) => {
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

module.exports = {
    register,
    login,  
};


