const db = require('../db');

module.exports = {
  // Create a new task
  async create(task) {
    // task: { title, description, assignee_id, status }
    const [id] = await db('tasks').insert(task);
    return db('tasks').where({ id }).first();
  },

  // Get tasks for a given user (or unassigned)
  async getAllForUser(userId) {
    // returns tasks assigned to user OR unassigned tasks
    return db('tasks').where(function() {
      this.where({ assignee_id: userId }).orWhere('assignee_id', null);
    });
  },

  // Update task
  async update(id, changes) {
    await db('tasks').where({ id }).update(changes);
    return db('tasks').where({ id }).first();
  },

  // Delete task
  async delete(id) {
    return db('tasks').where({ id }).del();
  }
};
