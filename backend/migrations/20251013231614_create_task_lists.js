/**
 * Migration: Create Task Lists and Add Due Dates
 * 
 * This migration extends the task management system with:
 * - Task lists for organizing tasks into categories
 * - Due dates for task scheduling and deadline management
 * 
 * Changes:
 * - Creates task_lists table for organizing tasks
 * - Adds list_id foreign key to tasks table
 * - Adds due_date column to tasks table
 * - Updates status column to be not nullable
 * 
 * Relationships:
 * - task_lists.user_id -> users.id (one-to-many, CASCADE delete)
 * - tasks.list_id -> task_lists.id (many-to-one, CASCADE delete)
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Migration promise
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('task_lists', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.integer('user_id').unsigned()
           .references('id')
           .inTable('users')
           .onDelete('CASCADE');
      table.timestamps(true, true);
    })
    .alterTable('tasks', function(table) {
      table.integer('list_id').unsigned()
           .references('id')
           .inTable('task_lists')
           .onDelete('CASCADE');
      table.datetime('due_date');
      table.string('status').notNullable().defaultTo('todo').alter();
    });
};

/**
 * Rollback Migration: Remove Task Lists and Due Dates
 * 
 * This function reverses the migration by:
 * - Removing foreign key constraints and columns from tasks table
 * - Dropping the task_lists table
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Rollback promise
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('tasks', function(table) {
      table.dropColumn('list_id');
      table.dropColumn('due_date');
    })
    .dropTableIfExists('task_lists');
};