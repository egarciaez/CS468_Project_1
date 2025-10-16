/**
 * Task Controller - Handles HTTP requests related to task management
 * 
 * This module contains all the route handlers for task-related endpoints:
 * - POST /api/tasks - Create new tasks
 * - GET /api/tasks - Retrieve user's tasks (with optional list filtering)
 * - PUT /api/tasks/:id - Update existing tasks
 * - DELETE /api/tasks/:id - Delete tasks
 * 
 * All routes require authentication (req.user is set by authMiddleware)
 * Tasks can be assigned to lists and have due dates
 */

const Task = require('../models/taskModel');

module.exports = {
  /**
   * Creates a new task for the authenticated user
   * 
   * POST /api/tasks
   * Body: { title, description?, assignee_id?, status?, list_id?, due_date?, priority? }
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user (set by authMiddleware)
   * @param {number} req.user.id - User ID
   * @param {Object} req.body - Request body containing task data
   * @param {string} req.body.title - Task title (required)
   * @param {string} [req.body.description] - Optional task description
   * @param {number} [req.body.assignee_id] - ID of user assigned to task
   * @param {string} [req.body.status='todo'] - Task status
   * @param {number} [req.body.list_id] - ID of task list to assign to
   * @param {string} [req.body.due_date] - ISO datetime string for due date
   * @param {string} [req.body.priority='medium'] - Task priority (high, medium, low)
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createTask(req, res) {
    try {
      const { title, description, assignee_id, status, list_id, due_date, priority } = req.body;
      
      // Validate required fields
      if (!title) {
        return res.status(400).json({ message: 'title required' });
      }
      
      // Validate priority if provided
      if (priority !== undefined && priority !== null && priority !== '') {
        if (!['high', 'medium', 'low'].includes(priority)) {
          return res.status(400).json({ message: 'Priority must be high, medium, or low' });
        }
      }
      
      // Validate list_id if provided - ensure user owns the list
      if (list_id) {
        const db = require('../db');
        const list = await db('task_lists').where({ 
          id: list_id, 
          user_id: req.user.id 
        }).first();
        
        if (!list) {
          return res.status(400).json({ message: 'Invalid list_id' });
        }
      }
      
      // Create task with validated data
      const task = await Task.create({ 
        title, 
        description, 
        assignee_id: assignee_id || req.user.id, // Default to current user if not specified
        status: status || 'todo',
        list_id,
        due_date,
        priority: priority || 'medium'
      });
      
      res.status(201).json(task);
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).json({ message: 'server error' });
    }
  },

  /**
   * Retrieves tasks for the authenticated user with optional list filtering and sorting
   * 
   * GET /api/tasks?list_id=123&sort_by=priority&sort_order=asc
   * Query params: 
   * - list_id (optional) - Filter tasks by specific list
   * - sort_by (optional) - Sort field (created_at, priority, due_date, title)
   * - sort_order (optional) - Sort order (asc, desc)
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user (set by authMiddleware)
   * @param {number} req.user.id - User ID
   * @param {Object} req.query - Query parameters
   * @param {string} [req.query.list_id] - Optional list ID to filter by
   * @param {string} [req.query.sort_by] - Field to sort by
   * @param {string} [req.query.sort_order] - Sort order (asc, desc)
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getTasks(req, res) {
    try {
      const { list_id, sort_by = 'created_at', sort_order = 'desc' } = req.query;
      
      // Validate sort parameters
      const validSortFields = ['created_at', 'priority', 'due_date', 'title'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sort_by)) {
        return res.status(400).json({ message: 'Invalid sort_by parameter' });
      }
      
      if (!validSortOrders.includes(sort_order)) {
        return res.status(400).json({ message: 'Invalid sort_order parameter' });
      }
      
      // Get tasks for user with filtering and sorting
      const tasks = await Task.getAllForUser(req.user.id, list_id, sort_by, sort_order);
      
      res.json(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ message: 'server error' });
    }
  },

  /**
   * Updates an existing task
   * 
   * PUT /api/tasks/:id
   * Body: { title?, description?, status?, list_id?, due_date?, priority? }
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user (set by authMiddleware)
   * @param {number} req.user.id - User ID
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Task ID to update
   * @param {Object} req.body - Request body containing fields to update
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const changes = req.body;
      
      // Validate priority if provided
      if (changes.priority !== undefined && changes.priority !== null && changes.priority !== '') {
        if (!['high', 'medium', 'low'].includes(changes.priority)) {
          return res.status(400).json({ message: 'Priority must be high, medium, or low' });
        }
      }
      
      // Validate list_id if provided - ensure user owns the list
      if (changes.list_id) {
        const db = require('../db');
        const list = await db('task_lists').where({ 
          id: changes.list_id, 
          user_id: req.user.id 
        }).first();
        
        if (!list) {
          return res.status(400).json({ message: 'Invalid list_id' });
        }
      }
      
      // Update task with validated changes
      const updated = await Task.update(id, changes);
      
      res.json(updated);
    } catch (err) {
      console.error('Error updating task:', err);
      res.status(500).json({ message: 'server error' });
    }
  },

  /**
   * Deletes a task
   * 
   * DELETE /api/tasks/:id
   * 
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user (set by authMiddleware)
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - Task ID to delete
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      // Delete the task
      await Task.delete(id);
      
      // Return 204 No Content on successful deletion
      res.status(204).end();
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ message: 'server error' });
    }
  }
};
