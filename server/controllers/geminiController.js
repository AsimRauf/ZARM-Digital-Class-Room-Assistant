const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });

const testGeminiConnection = async () => {
    try {
        const chat = model.startChat();
        const result = await chat.sendMessage("Test message");
        console.log('Gemini connection successful');
    } catch (error) {
        console.log('Gemini error:', error.message);
    }
};
testGeminiConnection();


const convertHandwrittenNotes = async (req, res) => {
    console.log('📝 Processing new document...');

    try {
        const chat = model.startChat();
        const imageData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const prompt = `
            Convert these handwritten notes into well-structured HTML format.
            Use proper HTML5 semantic tags and include CSS classes:
            - <h1> for main title
            - <h2> for section headings
            - <h3> for sub-headings
            - <ul> and <li> for bullet points
            - <pre><code> for code blocks
            - <blockquote> for important points
            - <div class="section"> for sections
            - <p> for paragraphs
           
            Add appropriate CSS classes for:
            - .highlight for important points
            - .code-block for code sections
            - .note-section for content sections
           
            Return ONLY the formatted HTML content without any markdown backticks or language indicators.
        `;

        console.log('🤖 Sending to Gemini...');
        const result = await chat.sendMessage([prompt, imageData]);
        let htmlContent = result.response.text();
        htmlContent = htmlContent.replace(/```html|```/g, '').trim();

        
        console.log('✨ Content processed successfully');
        
        const document = {
            id: Date.now(),
            title: `Notes - ${new Date().toLocaleDateString()}`,
            content: htmlContent,
            metadata: {
                created: new Date().toISOString(),
                type: 'handwritten-notes'
            }
        };

        res.json({
            success: true,
            data: document
        });


    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    convertHandwrittenNotes
};

