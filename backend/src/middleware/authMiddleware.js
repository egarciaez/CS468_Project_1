// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Protect routes by expecting Authorization: Bearer <token>
module.exports = async function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'missing token' });
  const token = authHeader.split(' ')[1]; // Extract token
  try {
    // Verify token and attach user info to req
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(payload.id);
    if (!req.user) return res.status(401).json({ message: 'invalid user' });
    next(); // Continue to controller
  } catch (err) {
    return res.status(401).json({ message: 'invalid token' });
  }
};

