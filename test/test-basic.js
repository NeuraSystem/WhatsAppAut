require('dotenv').config();
const logger = require('../src/utils/logger');

logger.info('Iniciando prueba básica...');

async function testBasicComponents() {
    try {
    // Probar configuración
        logger.info('Probando configuración...');
        const config = require('../config/config');
        logger.info('✅ Configuración cargada');

        // Probar base de datos
        logger.info('Probando base de datos...');
        const { initializeDatabase } = require('../src/database/pg');
        try {
            await initializeDatabase();
            logger.info('✅ Base de datos conectada');
        } catch (dbError) {
            logger.warn('⚠️ Base de datos falló:', dbError.message);
        }

        // Probar AgentExecutor
        logger.info('Probando AgentExecutor...');
        const { SalvaCellAgentExecutor } = require('../src/services/agentExecutor');
        const agentExecutor = new SalvaCellAgentExecutor(config.orchestrator);

        try {
            await agentExecutor.initialize();
            logger.info('✅ AgentExecutor inicializado');
        } catch (agentError) {
            logger.error('❌ AgentExecutor falló:', agentError.message);
        }

        logger.info('🎉 Prueba completada');
    } catch (error) {
        logger.error('💥 Error en prueba básica:', error);
    }
}

testBasicComponents();
