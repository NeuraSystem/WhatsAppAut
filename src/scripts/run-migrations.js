const migrate = require('node-pg-migrate').default;
const { Pool } = require('pg');
const config = require('../utils/config');
const logger = require('../utils/logger');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'whatsapp_reparaciones',
    user: process.env.DB_USER || 'bot_user',
    password: process.env.DB_PASSWORD || 'bot_secure_password_2024',
};

const runMigrations = async () => {
    const pool = new Pool(dbConfig);
    const client = await pool.connect();

    try {
        logger.info('Running database migrations...');
        await migrate({
            dbClient: client,
            dir: 'migrations',
            direction: 'up',
            migrationsTable: 'pgmigrations',
            verbose: true,
        });
        logger.info('Migrations completed successfully.');
    } catch (error) {
        logger.error('Error running migrations:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

if (require.main === module) {
    runMigrations().catch(e => {
        console.error(e);
        process.exit(1);
    });
}

module.exports = runMigrations;
