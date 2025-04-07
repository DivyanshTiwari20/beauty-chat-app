const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ 
      error: err.name === 'TokenExpiredError' ? 'Session expired' : 'Authentication failed'
    });
  }
};
