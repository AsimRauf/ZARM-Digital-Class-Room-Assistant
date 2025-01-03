const Note = require('../models/Note');
const PDFDocument = require('pdfkit');
const docx = require('docx');

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
            courseId: req.params.courseId,
            roomId: req.params.roomId
        })
        .select('title htmlContent content createdAt lastModified')
        .sort({ createdAt: -1 });
        
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNotebyId = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId)
            .select('title htmlContent content createdAt lastModified');
        
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }
        
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateNote = async (req, res) => {
    try {
        const { title } = req.body;
        const note = await Note.findOneAndUpdate(
            { _id: req.params.noteId, userId: req.user._id },
            { 
                title,
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
const downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        const format = req.query.format;

        if (format === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${note.title}.pdf`);
            doc.pipe(res);
            doc.text(note.title);
            doc.text(note.content);
            doc.end();
        } else if (format === 'docx') {
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            children: [new docx.TextRun(note.content)]
                        })
                    ]
                }]
            });

            const buffer = await docx.Packer.toBuffer(doc);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename=${note.title}.docx`);
            res.send(buffer);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    createNote,
    getNotes,
    updateNote,
    deleteNote,
    downloadNote,
    getNotebyId
};

