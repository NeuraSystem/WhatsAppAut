const logger = require('../../utils/logger');
const { services } = require('../../services/serviceRegistry'); // Asumiendo un registro de servicios
const selfHealingManager = require('./SelfHealingManager');

/**
 * @file HealthMonitoringSystem.js
 * @description Monitors the health of all registered components and services in a distributed manner.
 * @module core/resilience/HealthMonitoringSystem
 */

class HealthMonitoringSystem {
    constructor() {
        this.monitoringInterval = 30000; // 30 segundos
        this.healthStatus = new Map(); // Almacena el estado de salud actual de cada servicio
        this.healthHistory = new Map(); // Almacena el historial para análisis de tendencias
        this.monitorIntervalId = null;
    }

    /**
     * Starts the continuous health monitoring process.
     */
    startMonitoring() {
        if (this.monitorIntervalId) {
            logger.warn('HealthMonitoringSystem: El monitoreo de salud ya está en ejecución.');
            return;
        }
        logger.info('HealthMonitoringSystem: Iniciando monitoreo de salud distribuido...');
        this.monitorIntervalId = setInterval(() => this.runHealthChecks(), this.monitoringInterval);
    }

    /**
     * Stops the health monitoring process.
     */
    stopMonitoring() {
        if (this.monitorIntervalId) {
            clearInterval(this.monitorIntervalId);
            this.monitorIntervalId = null;
            logger.info('HealthMonitoringSystem: Monitoreo de salud detenido.');
        }
    }

    /**
     * Runs health checks on all registered services.
     * @private
     */
    async runHealthChecks() {
        logger.info('HealthMonitoringSystem: Ejecutando ciclo de chequeos de salud...');
        const serviceNames = Object.keys(services);

        for (const serviceName of serviceNames) {
            const service = services[serviceName];
            let isHealthy = false;
            let details = {};

            if (service && typeof service.healthCheck === 'function') {
                try {
                    const result = await service.healthCheck();
                    isHealthy = result.healthy;
                    details = result.details || {};
                } catch (error) {
                    isHealthy = false;
                    details = { error: error.message };
                    logger.error(`HealthMonitoringSystem: Error durante el chequeo de salud de '${serviceName}'.`, error);
                }
            } else {
                // Si un servicio no tiene un healthCheck, se asume que está sano por defecto.
                // Esto podría ser configurable.
                isHealthy = true;
                details = { message: 'No health check method available.' };
            }

            this.updateHealthStatus(serviceName, isHealthy, details);

            if (!isHealthy) {
                // Si el chequeo de salud falla, se reporta al SelfHealingManager
                selfHealingManager.reportFailure(serviceName, new Error(details.error || 'Health check failed'));
            }
        }
        this.analyzeTrends();
    }

    /**
     * Updates the health status for a service and records it in the history.
     * @param {string} serviceName - The name of the service.
     * @param {boolean} isHealthy - The current health status.
     * @param {object} details - Additional details about the health status.
     * @private
     */
    updateHealthStatus(serviceName, isHealthy, details) {
        const status = { healthy: isHealthy, timestamp: Date.now(), details };
        this.healthStatus.set(serviceName, status);

        if (!this.healthHistory.has(serviceName)) {
            this.healthHistory.set(serviceName, []);
        }
        const history = this.healthHistory.get(serviceName);
        history.push(status);

        // Mantener el historial con un tamaño manejable (ej. últimos 100 chequeos)
        if (history.length > 100) {
            history.shift();
        }
    }

    /**
     * Analyzes the health history to detect trends or predict failures.
     * @private
     */
    analyzeTrends() {
        // Lógica de análisis de tendencias (placeholder)
        // Por ejemplo, detectar si un servicio ha fallado 3 veces en los últimos 5 minutos.
        for (const [serviceName, history] of this.healthHistory.entries()) {
            const recentFailures = history.slice(-10).filter(s => !s.healthy).length;
            if (recentFailures >= 3) {
                logger.warn(`HealthMonitoringSystem: El servicio '${serviceName}' muestra una tendencia de fallos recientes.`);
                // Aquí se podrían tomar acciones preventivas
            }
        }
    }

    /**
     * Gets the current health status of all monitored services.
     * @returns {Map<string, object>} - A map of service names to their health status.
     */
    getSystemHealth() {
        return this.healthStatus;
    }
}

// Singleton instance
const healthMonitoringSystem = new HealthMonitoringSystem();
module.exports = healthMonitoringSystem;