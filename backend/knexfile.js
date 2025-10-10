module.exports = {
  development: {
    client: 'sqlite3',                 // Using SQLite (simple local database)
    connection: {
      filename: './dev.sqlite3'        // Database file name
    },
    useNullAsDefault: true,            // SQLite requires this setting
    migrations: {
      directory: './migrations'        // Folder where migrations live
    }
  },
  test: {
    client: 'sqlite3',                 // Separate in-memory DB for testing
    connection: ':memory:',
    useNullAsDefault: true
  }
};
