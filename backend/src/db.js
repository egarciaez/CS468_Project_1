// Import Knex and DB config
const knex = require('knex');
const config = require('../knexfile');

// Detect environment: 'development' or 'test'
const env = process.env.NODE_ENV || 'development';

// Export Knex instance for current environment
module.exports = knex(config[env]);
