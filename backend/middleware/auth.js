const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authMiddleware = (req, res, next) => {
  authenticateToken(req, res, next);
};

const adminMiddleware = (req, res, next) => {
  authenticateToken(req, res, next);
};

module.exports = { authenticateToken, authMiddleware, adminMiddleware };