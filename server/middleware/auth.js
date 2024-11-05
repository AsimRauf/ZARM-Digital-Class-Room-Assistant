const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add logging to verify token contents
        console.log('Decoded token:', decoded);
        
        // Set user ID correctly based on token structure
        req.user = { 
            _id: decoded.userId || decoded._id || decoded.id 
        };
        
        console.log('Set user:', req.user);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth;