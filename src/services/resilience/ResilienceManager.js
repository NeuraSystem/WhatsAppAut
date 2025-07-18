// src/services/resilience/ResilienceManager.js
// GESTIÓN CENTRALIZADA DE RESILENCIA Y TOLERANCIA A FALLOS
// Implementa patrones Circuit Breaker, Rate Limiting y Fallback Strategies

const logger = require('../../utils/logger');
const { CircuitBreaker, apiRateLimiter } = require('../../utils/resilience');

/**
 * RESILIENCE MANAGER
 *
 * Propósito Arquitectónico:
 * - Centralizar todas las estrategias de resilencia del sistema
 * - Implementar Circuit Breaker pattern para servicios externos
 * - Gestionar Rate Limiting inteligente por cliente y servicio
 * - Proporcionar estrategias de fallback automáticas
 * - Monitorear salud del sistema en tiempo real
 *
 * Patrones Implementados:
 * - Circuit Breaker: Protección contra fallos en cascada
 * - Rate Limiting: Control de carga y abuso
 * - Bulkhead: Aislamiento de fallos entre servicios
 * - Timeout: Prevención de bloqueos indefinidos
 * - Retry with Backoff: Reintentos inteligentes
 */
class ResilienceManager {
    constructor(config = {}) {
        this.config = {
            // Configuración de Circuit Breaker
            circuitBreaker: {
                failureThreshold: 5,
                resetTimeout: 60000, // 1 minuto
                timeout: 30000, // 30 segundos
                monitoringPeriod: 10000 // 10 segundos
            },

            // Configuración de Rate Limiting
            rateLimiting: {
                defaultWindowMs: 60000, // 1 minuto
                defaultMaxRequests: 20,
                burstAllowance: 5, // Permitir ráfagas cortas
                escalationThreshold: 0.8 // 80% del límite
            },

            // Configuración de Timeouts
            timeouts: {
                anthropic: 30000, // 30s para Claude
                embedding: 15000, // 15s para embeddings
                database: 5000, // 5s para DB queries
                search: 10000 // 10s para búsquedas
            },

            // Configuración de Retry
            retry: {
                maxAttempts: 3,
                baseDelay: 1000, // 1 segundo
                maxDelay: 10000, // 10 segundos
                backoffMultiplier: 2
            },

            ...config
        };

        // Circuit Breakers para diferentes servicios
        this.circuitBreakers = new Map();

        // Rate Limiters por servicio
        this.rateLimiters = new Map();

        // Métricas de resilencia
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            circuitBreakerTrips: 0,
            rateLimitHits: 0,
            timeouts: 0,
            retries: 0,
            fallbacksUsed: 0
        };

        // Estado de salud del sistema
        this.systemHealth = {
            status: 'healthy',
            lastCheck: Date.now(),
            services: {}
        };

        this.initializeServices();

        logger.info(
            '🛡️ ResilienceManager initialized with comprehensive fault tolerance'
        );
    }

    /**
   * INICIALIZACIÓN DE SERVICIOS PROTEGIDOS
   */
    initializeServices() {
    // Circuit Breaker para Anthropic API
        this.circuitBreakers.set(
            'anthropic',
            new CircuitBreaker(this.executeAnthropicRequest.bind(this), {
                serviceName: 'Anthropic API',
                failureThreshold: this.config.circuitBreaker.failureThreshold,
                resetTimeout: this.config.circuitBreaker.resetTimeout,
                timeout: this.config.timeouts.anthropic
            })
        );

        // Circuit Breaker para Embedding Service
        this.circuitBreakers.set(
            'embedding',
            new CircuitBreaker(this.executeEmbeddingRequest.bind(this), {
                serviceName: 'Embedding Service',
                failureThreshold: 3, // Más sensible para embeddings
                resetTimeout: this.config.circuitBreaker.resetTimeout,
                timeout: this.config.timeouts.embedding
            })
        );

        // Circuit Breaker para Database
        this.circuitBreakers.set(
            'database',
            new CircuitBreaker(this.executeDatabaseRequest.bind(this), {
                serviceName: 'Database Service',
                failureThreshold: 2, // Muy sensible para DB
                resetTimeout: 30000, // Recuperación más rápida
                timeout: this.config.timeouts.database
            })
        );

        // Rate Limiters especializados
        this.initializeRateLimiters();

        logger.info(
            '🔧 Services initialized with circuit breakers and rate limiters'
        );
    }

    initializeRateLimiters() {
    // Rate limiter para Anthropic API (más restrictivo)
        this.rateLimiters.set('anthropic', {
            windowMs: this.config.rateLimiting.defaultWindowMs,
            maxRequests: 15, // Más conservador para API externa
            currentCount: 0,
            windowStart: Date.now()
        });

        // Rate limiter para Embeddings (menos restrictivo, uso local)
        this.rateLimiters.set('embedding', {
            windowMs: this.config.rateLimiting.defaultWindowMs,
            maxRequests: 50,
            currentCount: 0,
            windowStart: Date.now()
        });

        // Rate limiter por cliente
        this.rateLimiters.set('client', {
            windowMs: this.config.rateLimiting.defaultWindowMs,
            maxRequests: this.config.rateLimiting.defaultMaxRequests,
            clients: new Map() // clientId -> { count, windowStart }
        });
    }

    /**
   * EJECUCIÓN PROTEGIDA PRINCIPAL
   * Punto de entrada para todas las operaciones que requieren resilencia
   *
   * @param {string} serviceName - Nombre del servicio (anthropic, embedding, database)
   * @param {string} clientId - ID del cliente para rate limiting
   * @param {Function} operation - Función a ejecutar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>} Resultado de la operación
   */
    async executeWithProtection(serviceName, clientId, operation, options = {}) {
        const executionId = this.generateExecutionId();
        const timer = this.startTimer(`${serviceName}_execution`);

        try {
            this.metrics.totalRequests++;

            // 1. Verificar salud del servicio
            await this.checkServiceHealth(serviceName);

            // 2. Aplicar rate limiting
            await this.applyRateLimit(serviceName, clientId);

            // 3. Ejecutar con circuit breaker y timeout
            const result = await this.executeWithCircuitBreaker(
                serviceName,
                operation,
                options
            );

            // 4. Registrar éxito
            this.recordSuccess(serviceName, timer.end());

            logger.debug(
                `✅ Protected execution ${executionId} completed successfully`
            );
            return result;
        } catch (error) {
            timer.end();
            await this.handleExecutionError(
                serviceName,
                clientId,
                error,
                executionId
            );
            throw error;
        }
    }

    /**
   * VERIFICACIÓN DE SALUD DEL SERVICIO
   */
    async checkServiceHealth(serviceName) {
        const serviceHealth = this.systemHealth.services[serviceName];

        if (serviceHealth && serviceHealth.status === 'unhealthy') {
            const timeSinceFailure = Date.now() - serviceHealth.lastFailure;
            const recoveryTime = this.config.circuitBreaker.resetTimeout;

            if (timeSinceFailure < recoveryTime) {
                throw new Error(
                    `Service ${serviceName} is currently unhealthy. Retry in ${Math.ceil((recoveryTime - timeSinceFailure) / 1000)}s`
                );
            }
        }
    }

    /**
   * APLICACIÓN DE RATE LIMITING
   */
    async applyRateLimit(serviceName, clientId) {
    // Rate limiting por servicio
        const serviceLimit = await this.checkServiceRateLimit(serviceName);
        if (!serviceLimit.allowed) {
            this.metrics.rateLimitHits++;
            throw new RateLimitError(
                `Service rate limit exceeded for ${serviceName}`,
                serviceLimit.waitTime
            );
        }

        // Rate limiting por cliente
        const clientLimit = await this.checkClientRateLimit(clientId);
        if (!clientLimit.allowed) {
            this.metrics.rateLimitHits++;
            throw new RateLimitError(
                `Client rate limit exceeded for ${clientId}`,
                clientLimit.waitTime
            );
        }
    }

    checkServiceRateLimit(serviceName) {
        const limiter = this.rateLimiters.get(serviceName);
        if (!limiter) return { allowed: true };

        const now = Date.now();

        // Reset window si es necesario
        if (now - limiter.windowStart >= limiter.windowMs) {
            limiter.currentCount = 0;
            limiter.windowStart = now;
        }

        // Verificar límite
        if (limiter.currentCount >= limiter.maxRequests) {
            const waitTime = limiter.windowMs - (now - limiter.windowStart);
            return { allowed: false, waitTime };
        }

        limiter.currentCount++;
        return { allowed: true };
    }

    checkClientRateLimit(clientId) {
        if (!clientId) return { allowed: true };

        const limiter = this.rateLimiters.get('client');
        const now = Date.now();

        let clientData = limiter.clients.get(clientId);

        if (!clientData || now - clientData.windowStart >= limiter.windowMs) {
            clientData = { count: 0, windowStart: now };
            limiter.clients.set(clientId, clientData);
        }

        if (clientData.count >= limiter.maxRequests) {
            const waitTime = limiter.windowMs - (now - clientData.windowStart);
            return { allowed: false, waitTime };
        }

        clientData.count++;
        return { allowed: true };
    }

    /**
   * EJECUCIÓN CON CIRCUIT BREAKER
   */
    async executeWithCircuitBreaker(serviceName, operation, options = {}) {
        const circuitBreaker = this.circuitBreakers.get(serviceName);

        if (!circuitBreaker) {
            // Ejecutar directamente si no hay circuit breaker configurado
            return await this.executeWithTimeout(operation, options.timeout);
        }

        try {
            const result = await circuitBreaker.execute(operation);
            return result;
        } catch (error) {
            if (error.circuitBreakerOpen) {
                this.metrics.circuitBreakerTrips++;
                logger.warn(`⚡ Circuit breaker open for ${serviceName}`);

                // Intentar fallback si está disponible
                if (options.fallback) {
                    this.metrics.fallbacksUsed++;
                    logger.info(`🔄 Using fallback for ${serviceName}`);
                    return await options.fallback();
                }
            }
            throw error;
        }
    }

    /**
   * EJECUCIÓN CON TIMEOUT
   */
    async executeWithTimeout(operation, timeout) {
        if (!timeout) {
            return await operation();
        }

        return await Promise.race([
            operation(),
            new Promise((_, reject) =>
                setTimeout(() => {
                    this.metrics.timeouts++;
                    reject(new TimeoutError(`Operation timed out after ${timeout}ms`));
                }, timeout)
            )
        ]);
    }

    /**
   * RETRY CON BACKOFF EXPONENCIAL
   */
    async executeWithRetry(operation, options = {}) {
        const retryConfig = { ...this.config.retry, ...options };
        let lastError;

        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // No reintentar en ciertos tipos de error
                if (this.isNonRetryableError(error)) {
                    throw error;
                }

                if (attempt === retryConfig.maxAttempts) {
                    break;
                }

                // Calcular delay con backoff exponencial
                const delay = Math.min(
                    retryConfig.baseDelay *
            Math.pow(retryConfig.backoffMultiplier, attempt - 1),
                    retryConfig.maxDelay
                );

                logger.warn(
                    `🔄 Retry attempt ${attempt}/${retryConfig.maxAttempts} after ${delay}ms for error: ${error.message}`
                );
                this.metrics.retries++;

                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
   * MANEJO DE ERRORES DE EJECUCIÓN
   */
    async handleExecutionError(serviceName, clientId, error, executionId) {
        this.metrics.failedRequests++;

        // Actualizar salud del servicio
        this.updateServiceHealth(serviceName, 'unhealthy', error);

        // Log estructurado del error
        logger.error(`❌ Protected execution ${executionId} failed`, {
            serviceName,
            clientId,
            error: error.message,
            errorType: error.constructor.name,
            metrics: this.getQuickMetrics()
        });

        // Notificar si es crítico
        if (this.isCriticalError(error)) {
            await this.notifyCriticalError(serviceName, error);
        }
    }

    /**
   * IMPLEMENTACIONES DE SERVICIOS ESPECÍFICOS
   */
    async executeAnthropicRequest(operation) {
        return await this.executeWithTimeout(
            operation,
            this.config.timeouts.anthropic
        );
    }

    async executeEmbeddingRequest(operation) {
        return await this.executeWithTimeout(
            operation,
            this.config.timeouts.embedding
        );
    }

    async executeDatabaseRequest(operation) {
        return await this.executeWithTimeout(
            operation,
            this.config.timeouts.database
        );
    }

    /**
   * MONITOREO Y MÉTRICAS
   */
    recordSuccess(serviceName, duration) {
        this.metrics.successfulRequests++;
        this.updateServiceHealth(serviceName, 'healthy');

        // Actualizar métricas de latencia por servicio
        if (!this.metrics[`${serviceName}_latency`]) {
            this.metrics[`${serviceName}_latency`] = [];
        }
        this.metrics[`${serviceName}_latency`].push(duration);

        // Mantener solo las últimas 100 mediciones
        if (this.metrics[`${serviceName}_latency`].length > 100) {
            this.metrics[`${serviceName}_latency`].shift();
        }
    }

    updateServiceHealth(serviceName, status, error = null) {
        this.systemHealth.services[serviceName] = {
            status,
            lastCheck: Date.now(),
            lastFailure:
        status === 'unhealthy'
            ? Date.now()
            : this.systemHealth.services[serviceName]?.lastFailure,
            error: error?.message || null
        };

        // Actualizar salud general del sistema
        this.updateSystemHealth();
    }

    updateSystemHealth() {
        const serviceStatuses = Object.values(this.systemHealth.services);
        const unhealthyServices = serviceStatuses.filter(
            (s) => s.status === 'unhealthy'
        );

        if (unhealthyServices.length === 0) {
            this.systemHealth.status = 'healthy';
        } else if (unhealthyServices.length < serviceStatuses.length / 2) {
            this.systemHealth.status = 'degraded';
        } else {
            this.systemHealth.status = 'unhealthy';
        }

        this.systemHealth.lastCheck = Date.now();
    }

    /**
   * UTILIDADES Y HELPERS
   */
    isNonRetryableError(error) {
        const nonRetryableTypes = [
            'RateLimitError',
            'AuthenticationError',
            'ValidationError'
        ];
        return nonRetryableTypes.includes(error.constructor.name);
    }

    isCriticalError(error) {
        const criticalTypes = ['DatabaseConnectionError', 'SystemOutOfMemoryError'];
        return criticalTypes.includes(error.constructor.name);
    }

    async notifyCriticalError(serviceName, error) {
    // Placeholder para sistema de notificaciones
        logger.error(`🚨 CRITICAL ERROR in ${serviceName}: ${error.message}`);
    }

    generateExecutionId() {
        return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    startTimer(operation) {
        const start = Date.now();
        return {
            end: () => Date.now() - start
        };
    }

    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
   * API PÚBLICA
   */

    getMetrics() {
        const successRate =
      this.metrics.totalRequests > 0
          ? this.metrics.successfulRequests / this.metrics.totalRequests
          : 1;

        return {
            ...this.metrics,
            successRate: Math.round(successRate * 10000) / 100, // Porcentaje con 2 decimales
            systemHealth: this.systemHealth,
            circuitBreakerStatus: this.getCircuitBreakerStatus(),
            rateLimiterStatus: this.getRateLimiterStatus()
        };
    }

    getQuickMetrics() {
        return {
            totalRequests: this.metrics.totalRequests,
            successRate:
        this.metrics.totalRequests > 0
            ? Math.round(
                (this.metrics.successfulRequests / this.metrics.totalRequests) *
                100
            )
            : 100,
            systemHealth: this.systemHealth.status
        };
    }

    getCircuitBreakerStatus() {
        const status = {};
        for (const [name, cb] of this.circuitBreakers) {
            status[name] = cb.getStatus();
        }
        return status;
    }

    getRateLimiterStatus() {
        const status = {};
        for (const [name, limiter] of this.rateLimiters) {
            if (name === 'client') {
                status[name] = {
                    activeClients: limiter.clients.size,
                    maxRequests: limiter.maxRequests,
                    windowMs: limiter.windowMs
                };
            } else {
                status[name] = {
                    currentCount: limiter.currentCount,
                    maxRequests: limiter.maxRequests,
                    windowMs: limiter.windowMs,
                    utilization: Math.round(
                        (limiter.currentCount / limiter.maxRequests) * 100
                    )
                };
            }
        }
        return status;
    }

    reset() {
    // Reset métricas
        Object.keys(this.metrics).forEach((key) => {
            if (typeof this.metrics[key] === 'number') {
                this.metrics[key] = 0;
            } else if (Array.isArray(this.metrics[key])) {
                this.metrics[key] = [];
            }
        });

        // Reset circuit breakers
        for (const cb of this.circuitBreakers.values()) {
            cb.reset();
        }

        // Reset rate limiters
        for (const limiter of this.rateLimiters.values()) {
            if (limiter.clients) {
                limiter.clients.clear();
            }
            limiter.currentCount = 0;
            limiter.windowStart = Date.now();
        }

        // Reset system health
        this.systemHealth = {
            status: 'healthy',
            lastCheck: Date.now(),
            services: {}
        };

        logger.info('🔄 ResilienceManager reset completed');
    }

    /**
   * CONFIGURACIÓN DINÁMICA
   */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info('⚙️ ResilienceManager configuration updated');
    }

    /**
   * HEALTH CHECK
   */
    async healthCheck() {
        try {
            const healthStatus = {
                timestamp: new Date().toISOString(),
                overallStatus: this.systemHealth.status,
                services: this.systemHealth.services,
                metrics: this.getQuickMetrics(),
                circuitBreakers: this.getCircuitBreakerStatus(),
                rateLimiters: this.getRateLimiterStatus(),
                configuration: {
                    timeouts: this.config.timeouts,
                    rateLimiting: this.config.rateLimiting,
                    circuitBreaker: this.config.circuitBreaker
                }
            };

            logger.info('🏥 ResilienceManager health check completed');
            return healthStatus;
        } catch (error) {
            logger.error('❌ ResilienceManager health check failed:', error);
            return {
                timestamp: new Date().toISOString(),
                overallStatus: 'unhealthy',
                error: error.message
            };
        }
    }
}

// Clases de error personalizadas
class RateLimitError extends Error {
    constructor(message, waitTime) {
        super(message);
        this.name = 'RateLimitError';
        this.waitTime = waitTime;
    }
}

class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}

module.exports = {
    ResilienceManager,
    RateLimitError,
    TimeoutError
};
