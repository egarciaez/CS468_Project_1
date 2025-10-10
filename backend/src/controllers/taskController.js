// src/controllers/taskController.js
const Task = require('../models/taskModel');

// Basic task operations; only accessible when req.user set by middleware
module.exports = {
  async createTask(req, res) {
    try {
      const { title, description, assignee_id, status } = req.body;
      if (!title) return res.status(400).json({ message: 'title required' });
      const task = await Task.create({ title, description, assignee_id, status: status || 'todo' });
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  },

  async getTasks(req, res) {
    try {
      const tasks = await Task.getAllForUser(req.user.id);
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  },

  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const changes = req.body;
      const updated = await Task.update(id, changes);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  },

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      await Task.delete(id);
      res.status(204).end(); // No content
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'server error' });
    }
  }
};
