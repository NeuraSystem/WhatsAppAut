const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'whatsapp_reparaciones',
    user: process.env.DB_USER || 'Salvador',
    password: process.env.DB_PASSWORD || 'KKrauser969271',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function testConnection() {
    try {
        console.log('Probando conexión a PostgreSQL...');
        const client = await pool.connect();
        console.log('✅ Conexión exitosa a PostgreSQL');

        // Probar una consulta básica
        const result = await client.query('SELECT NOW()');
        console.log('✅ Consulta exitosa:', result.rows[0]);

        client.release();
        await pool.end();

        console.log('✅ Prueba completada exitosamente');
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

testConnection();
