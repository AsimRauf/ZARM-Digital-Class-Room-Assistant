const VideoContent = require('../models/VideoContent');

const videoContentController = {
    saveVideoContent: async (req, res) => {
        try {
            const { roomId, courseId, fileName, summary, notes, keyPoints, transcription } = req.body;

            const videoContent = new VideoContent({
                userId: req.user._id,
                roomId,
                courseId,
                fileName,
                summary,
                notes,
                keyPoints,
                transcription,
            });

            const savedContent = await videoContent.save();
            res.status(201).json(savedContent);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getVideoContentByCourse: async (req, res) => {
        try {
            const { courseId } = req.params;
            console.log('Searching for content with courseId:', courseId);
            console.log('User ID:', req.user._id);

            const contents = await VideoContent.find({
                courseId: courseId,
                userId: req.user._id
            }).sort({ createdAt: -1 });

            console.log('Found contents:', contents);
            res.json(contents);
        } catch (error) {
            console.error('Error in getVideoContentByCourse:', error);
            res.status(500).json({ error: error.message });
        }
    }
    ,

    getAllUserVideoContent: async (req, res) => {
        try {
            const contents = await VideoContent.find({
                userId: req.user._id
            }).sort({ createdAt: -1 });
            res.json(contents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getVideoContentById: async (req, res) => {
        try {
            const content = await VideoContent.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!content) {
                return res.status(404).json({ message: 'Content not found' });
            }

            res.json(content);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateVideoTitle: async (req, res) => {
        try {
            const content = await VideoContent.findOneAndUpdate(
                { _id: req.params.id, userId: req.user._id },
                { fileName: req.body.fileName },
                { new: true }
            );
            if (!content) {
                return res.status(404).json({ message: 'Content not found' });
            }
            res.json(content);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteVideoContent: async (req, res) => {
        try {
            const content = await VideoContent.findOneAndDelete({
                _id: req.params.id,
                userId: req.user._id
            });
            if (!content) {
                return res.status(404).json({ message: 'Content not found' });
            }
            res.json({ message: 'Content deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = videoContentController;
