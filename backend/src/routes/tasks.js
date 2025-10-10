// src/routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

// All routes below require authentication
router.use(auth);

// Task CRUD
router.get('/', taskController.getTasks);       // GET all tasks for logged-in user
router.post('/', taskController.createTask);    // POST new task
router.put('/:id', taskController.updateTask);  // PUT update existing task
router.delete('/:id', taskController.deleteTask); // DELETE a task

module.exports = router;
