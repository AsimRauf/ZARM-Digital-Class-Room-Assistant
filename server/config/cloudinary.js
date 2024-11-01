require('dotenv').config(); // Load environment variables from .env file
const cloudinary = require('cloudinary').v2; // Ensure to use v2 for the latest features


// Function to configure Cloudinary
const cloudinaryConfig = () => {
    if (!process.env.CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Missing Cloudinary configuration variables.");
        return;
    }

    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('Cloudinary configured successfully');
};

// Call the configuration function to ensure it's set up when the module is loaded
cloudinaryConfig();

module.exports = cloudinary; // Export the configured Cloudinary instance
