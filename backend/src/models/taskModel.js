const db = require('../db');

/**
 * Task Model - Handles all database operations related to tasks
 * 
 * This module provides CRUD operations for task management including:
 * - Task creation with list assignment and due dates
 * - Task retrieval with filtering by user and list
 * - Task updates and deletion
 * - Support for task lists and due date management
 * 
 * All methods are async and return Promises
 */
module.exports = {
  /**
   * Creates a new task in the database
   * @param {Object} task - Task data object
   * @param {string} task.title - Task title (required)
   * @param {string} [task.description] - Optional task description
   * @param {number} [task.assignee_id] - ID of user assigned to task
   * @param {string} [task.status='todo'] - Task status (todo, in-progress, completed)
   * @param {number} [task.list_id] - ID of task list this task belongs to
   * @param {string} [task.due_date] - ISO datetime string for task due date
   * @returns {Promise<Object>} The created task object with all fields including ID
   * @throws {Error} If database operation fails
   */
  async create(task) {
    // Insert task data and get the new task's ID
    const [id] = await db('tasks').insert(task);
    
    // Fetch and return the complete task record
    return db('tasks').where({ id }).first();
  },

  /**
   * Retrieves tasks for a specific user with optional list filtering
   * @param {number} userId - ID of the user to get tasks for
   * @param {number} [listId=null] - Optional list ID to filter tasks by
   * @returns {Promise<Array>} Array of task objects
   * 
   * Note: Returns tasks assigned to the user OR unassigned tasks (assignee_id = null)
   * If listId is provided, only returns tasks from that specific list
   */
  async getAllForUser(userId, listId = null) {
    // Base query: get tasks assigned to user OR unassigned tasks
    let query = db('tasks').where(function() {
      this.where({ assignee_id: userId }).orWhere('assignee_id', null);
    });

    // If listId is provided, filter by specific list
    if (listId) {
      query = query.where({ list_id: listId });
    }

    return query;
  },

  /**
   * Updates an existing task with new data
   * @param {number} id - ID of the task to update
   * @param {Object} changes - Object containing fields to update
   * @param {string} [changes.title] - New task title
   * @param {string} [changes.description] - New task description
   * @param {string} [changes.status] - New task status
   * @param {number} [changes.list_id] - New list assignment
   * @param {string} [changes.due_date] - New due date
   * @returns {Promise<Object>} The updated task object
   * @throws {Error} If database operation fails or task not found
   */
  async update(id, changes) {
    // Update the task with new data
    await db('tasks').where({ id }).update(changes);
    
    // Fetch and return the updated task record
    return db('tasks').where({ id }).first();
  },

  /**
   * Deletes a task from the database
   * @param {number} id - ID of the task to delete
   * @returns {Promise<number>} Number of rows deleted (should be 1)
   * @throws {Error} If database operation fails
   */
  async delete(id) {
    return db('tasks').where({ id }).del();
  }
};
