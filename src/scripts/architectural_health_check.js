// src/scripts/architectural_health_check.js

require('dotenv').config();
const logger = require("../../utils/logger");
const fetch = require("node-fetch");

async function architecturalHealthCheck() {
    logger.info('🏗️ Iniciando verificación de salud arquitectural...');

    const results = {
        services: {},
        dependencies: {},
        configuration: {},
        overall: 'healthy'
    };

    try {
    // Check Ollama
        try {
            const response = await fetch('http://127.0.0.1:11434/api/version');
            if (response.ok) {
                results.services.ollama = 'healthy';
                logger.info('✅ Ollama: Servicio disponible');
            } else {
                results.services.ollama = 'unhealthy';
                logger.warn('⚠️ Ollama: Servicio responde pero con errores');
            }
        } catch (error) {
            results.services.ollama = 'down';
            logger.error('❌ Ollama: Servicio no disponible');
        }

        // Check ChromaDB
        try {
            const response = await fetch('http://localhost:8000/api/v2/heartbeat');
            if (response.ok) {
                results.services.chromadb = 'healthy';
                logger.info('✅ ChromaDB: Servicio disponible');
            } else {
                results.services.chromadb = 'unhealthy';
                logger.warn('⚠️ ChromaDB: Servicio responde pero con errores');
            }
        } catch (error) {
            results.services.chromadb = 'down';
            logger.error('❌ ChromaDB: Servicio no disponible');
        }

        // Check PostgreSQL
        try {
            const { Pool } = require('pg');
            const pool = new Pool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD
            });

            await pool.query('SELECT 1');
            results.services.postgresql = 'healthy';
            logger.info('✅ PostgreSQL: Base de datos disponible');
            await pool.end();
        } catch (error) {
            results.services.postgresql = 'down';
            logger.error('❌ PostgreSQL: Base de datos no disponible', error.message);
        }

        // Check Environment Variables
        const requiredEnvVars = [
            'OLLAMA_BASE_URL',
            'OLLAMA_AGENT_MODEL',
            'CHROMA_URL',
            'DB_HOST',
            'DB_USER',
            'ANTHROPIC_API_KEY'
        ];

        const missingVars = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );
        if (missingVars.length === 0) {
            results.configuration.environment = 'complete';
            logger.info(
                '✅ Configuración: Todas las variables de entorno están definidas'
            );
        } else {
            results.configuration.environment = 'incomplete';
            logger.warn(
                `⚠️ Variables de entorno faltantes: ${missingVars.join(', ')}`
            );
        }

        // Overall health assessment
        const unhealthyServices = Object.values(results.services).filter(
            (status) => status !== 'healthy'
        ).length;
        const incompleteConfig = Object.values(results.configuration).filter(
            (status) => status !== 'complete'
        ).length;

        if (unhealthyServices === 0 && incompleteConfig === 0) {
            results.overall = 'healthy';
            logger.info(
                '🎉 Estado general: SALUDABLE - Todos los servicios operativos'
            );
        } else if (unhealthyServices <= 1 && incompleteConfig <= 1) {
            results.overall = 'degraded';
            logger.warn(
                '⚠️ Estado general: DEGRADADO - Algunos servicios con problemas'
            );
        } else {
            results.overall = 'critical';
            logger.error(
                '🚨 Estado general: CRÍTICO - Múltiples servicios con problemas'
            );
        }

        // Summary report
        logger.info('📊 Resumen del estado de salud:');
        logger.info(`   - Ollama: ${results.services.ollama || 'no verificado'}`);
        logger.info(
            `   - ChromaDB: ${results.services.chromadb || 'no verificado'}`
        );
        logger.info(
            `   - PostgreSQL: ${results.services.postgresql || 'no verificado'}`
        );
        logger.info(
            `   - Configuración: ${results.configuration.environment || 'no verificada'}`
        );
        logger.info(`   - Estado general: ${results.overall}`);

        return results;
    } catch (error) {
        logger.error(
            'Error durante la verificación de salud arquitectural:',
            error
        );
        results.overall = 'error';
        return results;
    }
}

// Run if called directly
if (require.main === module) {
    architecturalHealthCheck()
        .then((results) => {
            process.exit(results.overall === 'healthy' ? 0 : 1);
        })
        .catch((error) => {
            logger.error('Error fatal en health check:', error);
            process.exit(1);
        });
}

module.exports = { architecturalHealthCheck };
