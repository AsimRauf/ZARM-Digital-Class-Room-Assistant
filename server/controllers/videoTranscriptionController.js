const { getGeminiModel, generatePrompts } = require('../config/geminiConfig');
const VideoContent = require('../models/VideoContent');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const convertToWav = (input, output) => {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .toFormat('wav')
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(16000)
            .on('end', resolve)
            .on('error', reject)
            .save(output);
    });
};

const pollTranscription = async (uploadUrl) => {
    const response = await axios.post('https://api.assemblyai.com/v2/transcript', {
        audio_url: uploadUrl,
        auto_chapters: true
    }, {
        headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }
    });

    let transcript;
    while (true) {
        transcript = await axios.get(
            `https://api.assemblyai.com/v2/transcript/${response.data.id}`,
            { headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }}
        );
        
        if (transcript.data.status === 'completed') break;
        if (transcript.data.status === 'error') throw new Error('Transcription failed');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    return transcript.data;
};

const cleanup = (paths) => {
    paths.forEach(path => {
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            console.log('Cleaned up:', path);
        }
    });
};

exports.processVideo = async (req, res) => {
    const videoPath = req.file.path;
    const audioPath = path.join(tempDir, `${Date.now()}.wav`);
    
    try {
        console.log('=== Video Processing Started ===');
        console.log('Video received:', req.file.originalname);

        req.io.emit('processing:progress', { 
            progress: 25,
            stage: 'Extracting Audio Essence'
        });
        await convertToWav(videoPath, audioPath);

        req.io.emit('processing:progress', { 
            progress: 50,
            stage: 'Magnifying Vocal Patterns'
        });
        const audioData = fs.readFileSync(audioPath);
        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', 
            audioData,
            { headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }}
        );

        req.io.emit('processing:progress', { 
            progress: 65,
            stage: 'Decoding Speech Patterns'
        });
        const transcriptResult = await pollTranscription(uploadResponse.data.upload_url);

        req.io.emit('processing:progress', { 
            progress: 75,
            stage: 'Weaving Knowledge Threads'
        });
        const model = getGeminiModel();
        const [summary, notes, keyPoints] = await Promise.all([
            model.generateContent(generatePrompts.summary(transcriptResult.text)),
            model.generateContent(generatePrompts.notes(transcriptResult.text)),
            model.generateContent(generatePrompts.keyPoints(transcriptResult.text))
        ]);

        req.io.emit('processing:progress', { 
            progress: 90,
            stage: 'Finalizing Content'
        });

        const processedData = {
            fileName: req.file.originalname,
            transcription: transcriptResult.text,
            summary: summary.response.text(),
            notes: notes.response.text(),
            keyPoints: keyPoints.response.text()
        };

        cleanup([videoPath, audioPath]);

        req.io.emit('processing:progress', { 
            progress: 100,
            stage: 'Processing Complete'
        });

        res.json(processedData);

    } catch (error) {
        console.error('=== Processing Error ===');
        console.error(error);
        cleanup([videoPath, audioPath]);
        req.io.emit('processing:progress', { 
            progress: 0,
            stage: 'Processing Failed'
        });
        res.status(500).json({ error: error.message });
    }
};

exports.saveContent = async (req, res) => {
    try {
        const { roomId, courseId, content } = req.body;
        
        const videoContent = await VideoContent.create({
            userId: req.user._id,
            roomId,
            courseId,
            ...content
        });

        res.status(201).json(videoContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserContent = async (req, res) => {
    try {
        const contents = await VideoContent.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getContent = async (req, res) => {
    try {
        const content = await VideoContent.findById(req.params.id);
        if (!content) {
            return res.status(404).json({ message: 'Content not found' });
        }
        if (content.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteContent = async (req, res) => {
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
};
