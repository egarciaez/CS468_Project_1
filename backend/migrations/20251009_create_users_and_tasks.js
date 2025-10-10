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

// "down" = rollback (undo migration)
exports.down = function(knex) {
  // Drop tables in reverse order (tasks first because it references users)
  return knex.schema
    .dropTableIfExists('tasks')
    .dropTableIfExists('users');
};
