const db = require('../db');

/**
 * User Model - Handles all database operations related to users
 * 
 * This module provides CRUD operations for user management including:
 * - User registration (create)
 * - User authentication (findByUsername, findById)
 * - User data retrieval
 * 
 * All methods are async and return Promises that resolve to user data or null
 */
module.exports = {
  /**
   * Creates a new user in the database
   * @param {Object} user - User data object
   * @param {string} user.username - Unique username
   * @param {string} user.password - Hashed password
   * @param {string} [user.email] - Optional email address
   * @returns {Promise<Object>} The created user object with all fields including ID
   * @throws {Error} If database operation fails or username already exists
   */
  async create(user) {
    // Insert user data and get the new user's ID
    const [id] = await db('users').insert(user);
    
    // Fetch and return the complete user record
    return db('users').where({ id }).first();
  },

  /**
   * Finds a user by their username
   * @param {string} username - The username to search for
   * @returns {Promise<Object|null>} User object if found, null otherwise
   */
  async findByUsername(username) {
    return db('users').where({ username }).first();
  },

  /**
   * Finds a user by their unique ID
   * @param {number} id - The user's unique ID
   * @returns {Promise<Object|null>} User object if found, null otherwise
   */
  async findById(id) {
    return db('users').where({ id }).first();
  }
};
