const db = require('../db');

module.exports = {
  // Insert a new user
  async create(user) {
    // user = { username, password, email }
    const [id] = await db('users').insert(user);  // Insert & return new ID
    return db('users').where({ id }).first();     // Fetch and return new record
  },

  // Find a user by username
  async findByUsername(username) {
    return db('users').where({ username }).first();
  },

  // Find a user by ID
  async findById(id) {
    return db('users').where({ id }).first();
  }
};
