// src/server.js
// Express app (exported so tests can import it)
const express = require('express');  // Express framework to build the web server
const cors = require('cors');  // Allows the frontend (port 3000) to talk to backend (port 5000)
const bodyParser = require('body-parser');

// Import route files
const authRoutes = require('./routes/auth'); // Import authentication-related routes
const taskRoutes = require('./routes/tasks');  // Import task-related routes
const listRoutes = require('./routes/lists');  // Import task list-related routes

// Initialize app
const app = express();

// Middlewares
app.use(cors());                 // Enable CORS for frontend
app.use(bodyParser.json());      // Parse JSON request bodies

// Route endpoints
app.use('/api/auth', authRoutes);   // Handles register/login routes
app.use('/api/tasks', taskRoutes);  // Handles task CRUD routes
app.use('/api/lists', listRoutes);  // Handles task list CRUD routes

// Base route — simple health check
app.get('/', (req, res) => res.json({ message: 'TaskTrack API' }));

// Export for tests (server starts in index.js)
module.exports = app;
