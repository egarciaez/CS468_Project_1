/**
 * Task List Routes - API endpoints for task list management
 * 
 * This module defines all HTTP routes related to task list operations.
 * All routes require authentication via JWT token.
 * 
 * Routes:
 * - POST   /api/lists     - Create a new task list
 * - GET    /api/lists     - Get user's task lists
 * - GET    /api/lists/:id - Get a specific task list by ID
 * - PUT    /api/lists/:id - Update an existing task list
 * - DELETE /api/lists/:id - Delete a task list
 * 
 * All routes are protected by authentication middleware
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createTaskList,
  getTaskLists,
  getTaskListById,
  updateTaskList,
  deleteTaskList
} = require('../controllers/taskListController');

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);

// POST /api/lists - Create a new task list
router.post('/', createTaskList);

// GET /api/lists - Get all task lists for the authenticated user
router.get('/', getTaskLists);

// GET /api/lists/:id - Get a specific task list
router.get('/:id', getTaskListById);

// PUT /api/lists/:id - Update a task list
router.put('/:id', updateTaskList);

// DELETE /api/lists/:id - Delete a task list
router.delete('/:id', deleteTaskList);

module.exports = router;
