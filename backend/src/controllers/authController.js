const bcrypt = require('bcryptjs');        // For password hashing
const jwt = require('jsonwebtoken');       // For token generation
const User = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

module.exports = {
  // --- REGISTER ---
  async register(req, res) {
    try {
      const { username, password, email } = req.body;

      // Validate input
      if (!username || !password)
        return res.status(400).json({ message: 'username and password required' });

      // Prevent duplicate usernames
      const existing = await User.findByUsername(username);
      if (existing) return res.status(400).json({ message: 'username taken' });

      // Hash password before saving
      const hash = bcrypt.hashSync(password, 8);
      const user = await User.create({ username, password: hash, email });

      // Return newly created user (without password)
      res.status(201).json({ id: user.id, username: user.username });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  },

  // --- LOGIN ---
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password)
        return res.status(400).json({ message: 'username and password required' });

      // Look up user
      const user = await User.findByUsername(username);
      if (!user) return res.status(401).json({ message: 'invalid credentials' });

      // Verify password
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ message: 'invalid credentials' });

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Send token + user info
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  }
};

