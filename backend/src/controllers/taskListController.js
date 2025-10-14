const taskListModel = require('../models/taskListModel');

// Create a new task list
const createTaskList = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const taskListData = {
      name,
      description: description || null,
      user_id: req.user.id
    };

    const taskList = await taskListModel.create(taskListData);
    res.status(201).json(taskList);
  } catch (error) {
    console.error('Error creating task list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all task lists for the authenticated user
const getTaskLists = async (req, res) => {
  try {
    const taskLists = await taskListModel.findByUserId(req.user.id);
    res.json(taskLists);
  } catch (error) {
    console.error('Error fetching task lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific task list by ID
const getTaskListById = async (req, res) => {
  try {
    const { id } = req.params;
    const taskList = await taskListModel.findById(id);

    if (!taskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if the task list belongs to the authenticated user
    if (taskList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(taskList);
  } catch (error) {
    console.error('Error fetching task list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a task list
const updateTaskList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existingTaskList = await taskListModel.findById(id);
    if (!existingTaskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if the task list belongs to the authenticated user
    if (existingTaskList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    const updatedTaskList = await taskListModel.update(id, updates);
    res.json(updatedTaskList);
  } catch (error) {
    console.error('Error updating task list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a task list
const deleteTaskList = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTaskList = await taskListModel.findById(id);
    if (!existingTaskList) {
      return res.status(404).json({ error: 'Task list not found' });
    }

    // Check if the task list belongs to the authenticated user
    if (existingTaskList.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await taskListModel.delete(id);
    res.json({ message: 'Task list deleted successfully' });
  } catch (error) {
    console.error('Error deleting task list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTaskList,
  getTaskLists,
  getTaskListById,
  updateTaskList,
  deleteTaskList
};
