const Course = require('../models/Course');
const CourseChat = require('../models/courseChat');
const User = require('../models/User');
const { bucket } = require('../config/googleStorage');
const fs = require('fs');
const path = require('path');



exports.getMessages = async (req, res) => {
    try {
        const { courseId } = req.params;
        const chat = await CourseChat.findOne({ courseId })
            .populate('messages.sender', 'name profileImage')
            .sort({ 'messages.timestamp': -1 });

        res.json({
            messages: chat ? chat.messages : []
        });
    } catch (error) {
        console.log('Get Messages Error:', error);
        res.status(500).json({ message: error.message });
    }
};


exports.sendMessage = async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log('=== Starting Message Processing ===');
        console.log('CourseId:', courseId);
        console.log('Files Received:', req.files?.length || 0);

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = await Promise.all(req.files.map(async (file) => {
                console.log('Processing file:', file.originalname);
                
                const fileName = `chat/${courseId}/${Date.now()}-${file.originalname}`;
                const fileUpload = bucket.file(fileName);

                // Create a read stream from the file path
                const readStream = fs.createReadStream(file.path);

                await new Promise((resolve, reject) => {
                    readStream
                        .pipe(fileUpload.createWriteStream({
                            metadata: {
                                contentType: file.mimetype
                            }
                        }))
                        .on('finish', resolve)
                        .on('error', reject);
                });

                // Make the file publicly accessible and get the URL
                await fileUpload.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                console.log('File uploaded successfully:', publicUrl);

                // Add file details to attachments array
                return {
                    url: publicUrl,
                    type: file.mimetype,
                    name: file.originalname,
                    size: file.size
                };
            }));
        }

        // Cleanup: Optionally delete the uploaded files from the local directory after processing
        req.files.forEach((file) => fs.unlinkSync(file.path));

        // Send the response with file URLs
        res.status(200).json({ message: 'Message sent successfully', attachments });

    } catch (error) {
        console.error('=== Error in Message Processing ===');
        console.error('Error details:', error);
        res.status(500).json({ message: error.message });
    }
};








