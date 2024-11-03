const Note = require('../models/Note');

const createNote = async (req, res) => {
    try {
        const { roomId, courseId } = req.params;
        const { title, content, htmlContent } = req.body;
        const userId = req.user._id;

        console.log('Creating note with:', {
            userId,
            roomId,
            courseId,
            title
        });

        const note = new Note({
            title,
            content,
            htmlContent,
            courseId,
            roomId,
            userId
        });

        const savedNote = await note.save();
        console.log('Note saved:', savedNote);
        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Note creation error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ 
            userId: req.user._id,
            courseId: req.params.courseId 
        }).sort({ createdAt: -1 });
        
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user._id })
            .populate('courseId', 'name')
            .populate('roomId', 'name')
            .sort({ createdAt: -1 });
            
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId)
            .populate('courseId', 'name')
            .populate('roomId', 'name');
            
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        if (note.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateNote = async (req, res) => {
    try {
        const { title, content, htmlContent, tags } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: req.params.noteId, userId: req.user._id },
            { 
                title, 
                content, 
                htmlContent, 
                tags,
                lastModified: Date.now()
            },
            { new: true }
        );
        
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.noteId,
            userId: req.user._id
        });
        
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createNote,
    getNotes,
    getUserNotes,
    getNoteById,
    updateNote,
    deleteNote
};
