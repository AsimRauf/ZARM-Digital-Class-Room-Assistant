const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
    keyFilename: path.join(__dirname, '../config/google-credentials.json'),
    projectId: 'your-project-id'
});

const bucket = storage.bucket('your-bucket-name');

module.exports = { bucket };
