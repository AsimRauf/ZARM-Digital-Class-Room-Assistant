const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// Update this line to match your actual cloudinary config file name
const cloudinary = require('./cloudinary');  // if your file is named cloudinary.js
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'user_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;