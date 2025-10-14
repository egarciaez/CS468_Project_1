const db = require('../db');

/**
 * Task List Model - Handles all database operations related to task lists
 * 
 * This module provides CRUD operations for task list management including:
 * - Creating and organizing task lists
 * - User-specific list retrieval
 * - List updates and deletion
 * - Support for hierarchical task organization
 * 
 * All methods are async and return Promises
 */
module.exports = {
  /**
   * Creates a new task list in the database
   * @param {Object} taskList - Task list data object
   * @param {string} taskList.name - Name of the task list (required)
   * @param {string} [taskList.description] - Optional description of the list
   * @param {number} taskList.user_id - ID of the user who owns this list
   * @returns {Promise<Object>} The created task list object with all fields including ID
   * @throws {Error} If database operation fails
   */
  async create(taskList) {
    // Insert task list data and get the new list's ID
    const [id] = await db('task_lists').insert(taskList);
    
    // Fetch and return the complete task list record
    return db('task_lists').where({ id }).first();
  },

  /**
   * Retrieves all task lists for a specific user
   * @param {number} userId - ID of the user to get lists for
   * @returns {Promise<Array>} Array of task list objects ordered by creation date (newest first)
   */
  async findByUserId(userId) {
    return db('task_lists')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  },

  /**
   * Finds a task list by its unique ID
   * @param {number} id - The task list's unique ID
   * @returns {Promise<Object|null>} Task list object if found, null otherwise
   */
  async findById(id) {
    return db('task_lists').where({ id }).first();
  },

  /**
   * Updates an existing task list with new data
   * @param {number} id - ID of the task list to update
   * @param {Object} changes - Object containing fields to update
   * @param {string} [changes.name] - New list name
   * @param {string} [changes.description] - New list description
   * @returns {Promise<Object>} The updated task list object
   * @throws {Error} If database operation fails or list not found
   */
  async update(id, changes) {
    // Update the task list with new data
    await db('task_lists').where({ id }).update(changes);
    
    // Fetch and return the updated task list record
    return db('task_lists').where({ id }).first();
  },

  /**
   * Deletes a task list from the database
   * @param {number} id - ID of the task list to delete
   * @returns {Promise<number>} Number of rows deleted (should be 1)
   * @throws {Error} If database operation fails
   * 
   * Note: This will also cascade delete all tasks in this list due to foreign key constraints
   */
  async delete(id) {
    return db('task_lists').where({ id }).del();
  }
};
