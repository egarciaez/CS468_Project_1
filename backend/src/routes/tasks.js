/**
 * Task Routes - API endpoints for task management
 * 
 * This module defines all HTTP routes related to task operations.
 * All routes require authentication via JWT token.
 * 
 * Routes:
 * - POST   /api/tasks     - Create a new task
 * - GET    /api/tasks     - Get user's tasks (with optional list filtering)
 * - PUT    /api/tasks/:id - Update an existing task
 * - DELETE /api/tasks/:id - Delete a task
 * 
 * All routes are protected by authentication middleware
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes in this router
router.use(auth);

// Task CRUD operations - all require authentication
router.get('/', taskController.getTasks);       // GET all tasks for logged-in user
router.post('/', taskController.createTask);    // POST new task
router.put('/:id', taskController.updateTask);  // PUT update existing task
router.delete('/:id', taskController.deleteTask); // DELETE a task

module.exports = router;
