
require('dotenv').config();

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
  dir: 'database/migrations',
  direction: 'up',
  count: Infinity,
};
