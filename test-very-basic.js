console.log('Iniciando prueba muy básica...');

try {
    require('dotenv').config();
    console.log('✅ dotenv cargado');
    
    console.log('ENV vars:', {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME
    });
    
    console.log('✅ Prueba completada');
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
}
