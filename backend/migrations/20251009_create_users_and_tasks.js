/**
 * Migration: Create Users and Tasks Tables
 * 
 * This migration creates the initial database schema for the task management application.
 * It establishes the core tables for user authentication and basic task management.
 * 
 * Tables Created:
 * - users: Stores user account information and authentication data
 * - tasks: Stores task information with user assignments
 * 
 * Relationships:
 * - tasks.assignee_id -> users.id (many-to-one, nullable)
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Migration promise
 */
exports.up = function(knex) {
  // "up" = run when creating/migrating database
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();          // Auto-increment user ID
      table.string('username').notNullable().unique(); // Username must be unique
      table.string('password').notNullable();    // Hashed password
      table.string('email').unique();            // Optional email
      table.timestamps(true, true);              // created_at, updated_at auto-managed
    })
    .createTable('tasks', function(table) {
      table.increments('id').primary();          // Task ID
      table.string('title').notNullable();       // Task name/title
      table.text('description');                 // Optional task description
      // Optional link to user (assignee)
      table.integer('assignee_id').unsigned()
           .references('id')
           .inTable('users')
           .onDelete('SET NULL');                // If user deleted, set assignee_id = NULL
      table.string('status').notNullable().defaultTo('todo'); // "todo", "in-progress", "done"
      table.timestamps(true, true);
    });
};

/**
 * Rollback Migration: Drop Users and Tasks Tables
 * 
 * This function reverses the migration by dropping the tables in reverse order
 * to respect foreign key constraints.
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Rollback promise
 */
exports.down = function(knex) {
  // Drop tables in reverse order (tasks first because it references users)
  return knex.schema
    .dropTableIfExists('tasks')
    .dropTableIfExists('users');
};
