const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
};

const generatePrompts = {
    summary: (transcription) => `
        Analyze this lecture transcription and create:
        1. A concise executive summary
        2. Key learning points
        3. Main concepts covered
        Format the response in HTML with proper semantic tags.
        Transcription: ${transcription}
    `,
    
    notes: (transcription) => `
        Create detailed study notes from this lecture transcription.
        Include:
        - Main topics with headings
        - Important definitions
        - Key examples
        - Notable quotes
        - Practice questions
        Format in clean HTML using:
        - <h1> for main title
        - <h2> for major sections
        - <h3> for subsections
        - <ul> and <li> for lists
        - <blockquote> for important quotes
        - <div class="example"> for examples
        - <div class="practice"> for practice questions
        
        Transcription: ${transcription}
    `,
    
    keyPoints: (transcription) => `
        Extract and organize the key points from this lecture.
        Format as an HTML ordered list with:
        - Main points as <h3>
        - Supporting details in <ul>
        - Examples in <div class="example">
        
        Transcription: ${transcription}
    `
};

module.exports = { 
    getGeminiModel,
    generatePrompts
};
