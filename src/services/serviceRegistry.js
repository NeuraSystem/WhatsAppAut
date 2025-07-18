const logger = require('../utils/logger');

/**
 * @file serviceRegistry.js
 * @description A simple service registry to manage and access different parts of the application.
 * @module services/serviceRegistry
 */

// Este objeto contendrá referencias a todos los servicios clave de la aplicación.
// Se poblará a medida que los servicios se inicializan.
const services = {};

/**
 * Registers a service so it can be monitored and managed.
 * @param {string} name - The name of the service (e.g., 'Ollama', 'ChromaDB', 'PostgreSQL').
 * @param {object} serviceInstance - The instance of the service. Must have a healthCheck method.
 */
function registerService(name, serviceInstance) {
    logger.info(`ServiceRegistry: Registrando el servicio '${name}'.`);
    services[name] = serviceInstance;
}

/**
 * Placeholder for a function that knows how to restart a service.
 * In a real-world scenario, this would be much more complex, dealing with
 * process management, container restarts, etc.
 * @param {string} serviceName - The name of the service to restart.
 * @returns {Promise<boolean>} - True if the restart was initiated successfully.
 */
async function restartService(serviceName) {
    logger.info(
        `ServiceRegistry: Solicitud de reinicio para el servicio '${serviceName}'.`
    );
    const service = services[serviceName];

    if (service && typeof service.initialize === 'function') {
        try {
            // Simula un reinicio llamando de nuevo a su inicializador.
            await service.initialize();
            logger.info(
                `ServiceRegistry: El servicio '${serviceName}' ha sido reinicializado.`
            );
            return true;
        } catch (error) {
            logger.error(
                `ServiceRegistry: Fallo al reinicializar el servicio '${serviceName}'.`,
                error
            );
            return false;
        }
    } else {
        logger.warn(
            `ServiceRegistry: No se puede reiniciar el servicio '${serviceName}'. No es reiniciable o no está registrado.`
        );
        return false;
    }
}

module.exports = {
    services,
    registerService,
    restartService
};
