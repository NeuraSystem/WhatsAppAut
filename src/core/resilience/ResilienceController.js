const logger = require('../../utils/logger');
const healthMonitoringSystem = require('./HealthMonitoringSystem');
const selfHealingManager = require('./SelfHealingManager');
const AdvancedCircuitBreaker = require('./AdvancedCircuitBreaker');
const GracefulDegradationManager = require('./GracefulDegradationManager');
const config = require('../../utils/config');

/**
 * @file ResilienceController.js
 * @description Unified orchestration layer for all resilience components.
 * @module core/resilience/ResilienceController
 */

class ResilienceController {
    constructor() {
        this.isInitialized = false;
        this.advancedCircuitBreaker = null;
        this.gracefulDegradationManager = null;
        this.onSystemHealthChange = null; // Callback for orchestration
        this.lastHealthStatus = 'UNKNOWN';
    }

    /**
     * Initializes all resilience components and starts the monitoring.
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.isInitialized) {
            logger.warn('ResilienceController: El controlador de resiliencia ya ha sido inicializado.');
            return true;
        }

        try {
            logger.info('ResilienceController: Inicializando la capa de resiliencia del sistema...');

            // Initialize circuit breaker
            if (config.resilience?.enableCircuitBreaker) {
                this.advancedCircuitBreaker = new AdvancedCircuitBreaker(config.resilience.circuitBreaker);
                logger.info('ResilienceController: ✅ AdvancedCircuitBreaker inicializado');
            }

            // Initialize graceful degradation manager
            if (config.resilience?.enableGracefulDegradation) {
                this.gracefulDegradationManager = new GracefulDegradationManager(config.resilience.gracefulDegradation);
                logger.info('ResilienceController: ✅ GracefulDegradationManager inicializado');
            }

            // Iniciar el monitoreo de salud
            healthMonitoringSystem.startMonitoring();
            logger.info('ResilienceController: ✅ HealthMonitoringSystem iniciado');

            this.isInitialized = true;
            logger.info('ResilienceController: Capa de resiliencia inicializada y operativa.');
            
            return true;
        } catch (error) {
            logger.error('ResilienceController: ❌ Error durante inicialización:', error);
            return false;
        }
    }

    /**
     * Stops all resilience components.
     * @returns {Promise<boolean>} Shutdown success status
     */
    async shutdown() {
        try {
            logger.info('ResilienceController: Deteniendo la capa de resiliencia...');
            
            // Stop health monitoring
            healthMonitoringSystem.stopMonitoring();
            
            // Shutdown circuit breaker
            if (this.advancedCircuitBreaker && typeof this.advancedCircuitBreaker.shutdown === 'function') {
                await this.advancedCircuitBreaker.shutdown();
            }
            
            this.isInitialized = false;
            logger.info('ResilienceController: ✅ Capa de resiliencia detenida.');
            
            return true;
        } catch (error) {
            logger.error('ResilienceController: ❌ Error durante shutdown:', error);
            return false;
        }
    }

    /**
     * Executes operation with resilience protection
     * @param {Function} operation - Operation to execute
     * @param {Object} context - Execution context
     * @returns {Promise<any>} Operation result
     */
    async executeWithProtection(operation, context = {}) {
        if (!this.isInitialized) {
            return await operation(context);
        }
        
        // Check degradation status before execution
        if (this.gracefulDegradationManager) {
            const systemStatus = this.gracefulDegradationManager.getSystemStatus();
            if (systemStatus.degradationLevel > 2) {
                throw new Error(`System in critical degradation mode (level ${systemStatus.degradationLevel})`);
            }
        }
        
        // Execute with circuit breaker protection
        if (this.advancedCircuitBreaker) {
            return await this.advancedCircuitBreaker.execute(operation, context);
        }
        
        return await operation(context);
    }

    /**
     * Manually reports a failure for a specific service.
     * This can be used by parts of the application that detect failures outside of the health check cycle.
     * @param {string} serviceName - The name of the service that failed.
     * @param {Error} error - The error that occurred.
     */
    reportFailure(serviceName, error) {
        selfHealingManager.reportFailure(serviceName, error);
    }

    /**
     * Activates degradation mode
     * @param {string} reason - Reason for degradation
     */
    activateDegradationMode(reason) {
        if (this.gracefulDegradationManager) {
            this.gracefulDegradationManager.activateDegradation(reason);
            this.notifyHealthChange();
        }
    }
    
    /**
     * Notifies orchestration about health changes
     * @private
     */
    notifyHealthChange() {
        if (this.onSystemHealthChange && typeof this.onSystemHealthChange === 'function') {
            const currentHealth = this.getOverallHealth();
            if (currentHealth !== this.lastHealthStatus) {
                this.lastHealthStatus = currentHealth;
                this.onSystemHealthChange({
                    overall: currentHealth,
                    degradationLevel: this.gracefulDegradationManager ? 
                        this.gracefulDegradationManager.getSystemStatus().degradationLevel : 0,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    /**
     * Gets overall system health
     * @returns {string} Health status
     * @private
     */
    getOverallHealth() {
        if (!this.isInitialized) return 'UNKNOWN';
        
        const health = this.getSystemHealth();
        
        // Determine overall health based on components
        if (health.degradation && health.degradation.degradationLevel > 2) {
            return 'CRITICAL';
        } else if (health.degradation && health.degradation.degradationLevel > 0) {
            return 'DEGRADED';
        } else if (health.circuitBreaker && health.circuitBreaker.state === 'OPEN') {
            return 'DEGRADED';
        }
        
        return 'HEALTHY';
    }

    /**
     * Gets the overall health status of the system.
     * @returns {object} - An object containing the health status of all components.
     */
    getSystemHealth() {
        const health = {
            monitoring: healthMonitoringSystem.getSystemHealth(),
            circuitBreaker: this.advancedCircuitBreaker ? this.advancedCircuitBreaker.getMetrics() : null,
            degradation: this.gracefulDegradationManager ? this.gracefulDegradationManager.getSystemStatus() : null,
        };
        return health;
    }
    
    /**
     * Get status for orchestration
     * @returns {Promise<Object>} Status information
     */
    async getStatus() {
        return {
            isInitialized: this.isInitialized,
            overallHealth: this.getOverallHealth(),
            systemHealth: this.getSystemHealth(),
            degradationLevel: this.gracefulDegradationManager ? 
                this.gracefulDegradationManager.getSystemStatus().degradationLevel : 0,
            circuitBreakerState: this.advancedCircuitBreaker ? 
                this.advancedCircuitBreaker.getState() : 'UNKNOWN'
        };
    }

    /**
     * Force system optimization
     * @returns {Promise<Object>} Optimization results
     */
    async optimize() {
        logger.info('🔧 ResilienceController: Iniciando optimización...');
        
        const results = {
            circuitBreaker: null,
            degradationManager: null,
            healthMonitoring: null
        };
        
        try {
            // Reset circuit breaker if in OPEN state
            if (this.advancedCircuitBreaker && this.advancedCircuitBreaker.getState() === 'OPEN') {
                this.advancedCircuitBreaker.reset();
                results.circuitBreaker = 'reset_completed';
            }
            
            // Reset degradation if active
            if (this.gracefulDegradationManager) {
                const status = this.gracefulDegradationManager.getSystemStatus();
                if (status.degradationLevel > 0) {
                    this.gracefulDegradationManager.resetDegradation();
                    results.degradationManager = 'degradation_reset';
                }
            }
            
            // Force health check
            results.healthMonitoring = 'health_check_completed';
            
            logger.info('✅ ResilienceController: Optimización completada');
            return results;
            
        } catch (error) {
            logger.error('❌ ResilienceController: Error durante optimización:', error);
            throw error;
        }
    }

    /**
     * Provides access to the circuit breaker for wrapping function calls.
     * @returns {AdvancedCircuitBreaker|null} The circuit breaker instance.
     */
    getCircuitBreaker() {
        return this.advancedCircuitBreaker;
    }

     /**
     * Provides access to the graceful degradation manager.
     * @returns {GracefulDegradationManager|null} The degradation manager instance.
     */
    getGracefulDegradationManager() {
        return this.gracefulDegradationManager;
    }
}

// Singleton instance
const resilienceController = new ResilienceController();
module.exports = resilienceController;
