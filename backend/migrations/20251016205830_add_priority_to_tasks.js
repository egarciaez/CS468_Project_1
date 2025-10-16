/**
 * Migration: Add Priority to Tasks
 * 
 * This migration adds priority levels to tasks for better organization and sorting.
 * Priority levels: 'high', 'medium', 'low' with 'medium' as default
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Migration promise
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('tasks', function(table) {
      table.string('priority').defaultTo('medium').notNullable();
      table.index('priority'); // Add index for better query performance
    });
};

/**
 * Rollback Migration: Remove Priority from Tasks
 * 
 * This function reverses the migration by removing the priority column
 * 
 * @param {Object} knex - Knex.js database connection object
 * @returns {Promise} Rollback promise
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('tasks', function(table) {
      table.dropIndex('priority');
      table.dropColumn('priority');
    });
};