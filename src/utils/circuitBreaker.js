// src/utils/circuitBreaker.js

const logger = require('./logger');

/**
 * Circuit Breaker Pattern para manejar fallos en servicios externos
 * Estados: CLOSED (normal), OPEN (bloqueado), HALF_OPEN (probando)
 */
class CircuitBreaker {
    constructor(service, options = {}) {
        this.service = service;
        this.serviceName = options.serviceName || 'unknown';
        
        // Configuración
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.resetTimeout = options.resetTimeout || 60000; // 1 minuto
        this.timeout = options.timeout || 30000; // 30 segundos
        
        // Estado
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
        
        // Métricas
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            circuitOpened: 0,
            lastReset: Date.now()
        };
        
        logger.info(`Circuit Breaker inicializado para ${this.serviceName}`, {
            failureThreshold: this.failureThreshold,
            resetTimeout: this.resetTimeout
        });
    }
    
    /**
     * Ejecuta el servicio a través del circuit breaker
     * @param {*} params - Parámetros para el servicio
     * @returns {Promise} Resultado del servicio o error
     */
    async execute(params) {
        this.metrics.totalRequests++;
        
        // Verificar estado del circuit breaker
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                const error = new Error(`Circuit breaker OPEN para ${this.serviceName}. Próximo intento: ${new Date(this.nextAttempt).toLocaleTimeString()}`);
                error.circuitBreakerOpen = true;
                throw error;
            } else {
                // Cambiar a HALF_OPEN para probar
                this.state = 'HALF_OPEN';
                this.successes = 0;
                logger.info(`Circuit breaker para ${this.serviceName} cambió a HALF_OPEN`);
            }
        }
        
        try {
            // Ejecutar servicio con timeout
            const result = await this.executeWithTimeout(params);
            this.onSuccess();
            return result;
            
        } catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    
    /**
     * Ejecuta el servicio con timeout
     */
    async executeWithTimeout(params) {
        return new Promise(async (resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout de ${this.timeout}ms alcanzado para ${this.serviceName}`));
            }, this.timeout);
            
            try {
                const result = await this.service(params);
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    
    /**
     * Maneja un éxito del servicio
     */
    onSuccess() {
        this.metrics.successfulRequests++;
        this.failures = 0;
        
        if (this.state === 'HALF_OPEN') {
            this.successes++;
            if (this.successes >= this.successThreshold) {
                this.state = 'CLOSED';
                this.successes = 0;
                logger.info(`Circuit breaker para ${this.serviceName} cambió a CLOSED (recuperado)`);
            }
        }
    }
    
    /**
     * Maneja un fallo del servicio
     */
    onFailure(error) {
        this.metrics.failedRequests++;
        this.failures++;
        this.lastFailureTime = Date.now();
        
        logger.warn(`Fallo en ${this.serviceName}: ${error.message}`, {
            failures: this.failures,
            threshold: this.failureThreshold,
            state: this.state
        });
        
        if (this.failures >= this.failureThreshold || this.state === 'HALF_OPEN') {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            this.metrics.circuitOpened++;
            
            logger.error(`Circuit breaker para ${this.serviceName} ABIERTO. Próximo intento: ${new Date(this.nextAttempt).toLocaleTimeString()}`);
        }
    }
    
    /**
     * Fuerza el reset del circuit breaker
     */
    reset() {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.nextAttempt = null;
        
        logger.info(`Circuit breaker para ${this.serviceName} reiniciado manualmente`);
    }
    
    /**
     * Obtiene el estado actual del circuit breaker
     */
    getStatus() {
        return {
            serviceName: this.serviceName,
            state: this.state,
            failures: this.failures,
            successes: this.successes,
            lastFailureTime: this.lastFailureTime,
            nextAttempt: this.nextAttempt,
            metrics: this.metrics,
            isAvailable: this.state !== 'OPEN' || Date.now() >= this.nextAttempt
        };
    }
    
    /**
     * Verifica si el servicio está disponible
     */
    isAvailable() {
        return this.state === 'CLOSED' || 
               (this.state === 'HALF_OPEN') ||
               (this.state === 'OPEN' && Date.now() >= this.nextAttempt);
    }
}

module.exports = CircuitBreaker;