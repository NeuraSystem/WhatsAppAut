const { LRUCache } = require('./cache');
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
                const error = new Error(
                    `Circuit breaker OPEN para ${this.serviceName}. Próximo intento: ${new Date(this.nextAttempt).toLocaleTimeString()}`
                );
                error.circuitBreakerOpen = true;
                throw error;
            } else {
                // Cambiar a HALF_OPEN para probar
                this.state = 'HALF_OPEN';
                this.successes = 0;
                logger.info(
                    `Circuit breaker para ${this.serviceName} cambió a HALF_OPEN`
                );
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
                reject(
                    new Error(
                        `Timeout de ${this.timeout}ms alcanzado para ${this.serviceName}`
                    )
                );
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
                logger.info(
                    `Circuit breaker para ${this.serviceName} cambió a CLOSED (recuperado)`
                );
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

            logger.error(
                `Circuit breaker para ${this.serviceName} ABIERTO. Próximo intento: ${new Date(this.nextAttempt).toLocaleTimeString()}`
            );
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

        logger.info(
            `Circuit breaker para ${this.serviceName} reiniciado manualmente`
        );
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
        return (
            this.state === 'CLOSED' ||
      this.state === 'HALF_OPEN' ||
      (this.state === 'OPEN' && Date.now() >= this.nextAttempt)
        );
    }
}

/**
 * Rate Limiter implementando Token Bucket Algorithm
 */
class RateLimiter {
    constructor(maxTokens, refillRate, windowMs = 60000) {
        this.maxTokens = maxTokens; // Máximo de tokens en el bucket
        this.refillRate = refillRate; // Tokens por ventana de tiempo
        this.windowMs = windowMs; // Ventana de tiempo en ms
        this.buckets = new LRUCache(1000); // Cache para buckets por cliente
        this.refillInterval = Math.floor(windowMs / refillRate); // Intervalo de refresco

        // Iniciar refresco automático
        this.startRefillTimer();
    }

    /**
   * Verifica si un cliente puede hacer una petición
   * @param {string} clientId - ID del cliente
   * @param {number} tokensNeeded - Tokens necesarios (default: 1)
   * @returns {Object} Resultado de la verificación
   */
    checkLimit(clientId, tokensNeeded = 1) {
        const bucket = this.getBucket(clientId);
        const now = Date.now();

        // Refrescar tokens si es necesario
        this.refillBucket(bucket, now);

        if (bucket.tokens >= tokensNeeded) {
            bucket.tokens -= tokensNeeded;
            bucket.lastRequest = now;
            this.buckets.set(clientId, bucket);

            return {
                allowed: true,
                remainingTokens: bucket.tokens,
                resetTime: bucket.lastRefill + this.windowMs
            };
        }

        // Rate limit excedido
        const resetTime = bucket.lastRefill + this.windowMs;
        const waitTime = resetTime - now;

        logger.warn(`Rate limit excedido para ${clientId}`, {
            tokensNeeded,
            tokensAvailable: bucket.tokens,
            waitTime: Math.max(0, waitTime)
        });

        return {
            allowed: false,
            remainingTokens: bucket.tokens,
            resetTime,
            waitTime: Math.max(0, waitTime)
        };
    }

    /**
   * Obtiene o crea un bucket para un cliente
   * @param {string} clientId - ID del cliente
   * @returns {Object} Bucket del cliente
   */
    getBucket(clientId) {
        let bucket = this.buckets.get(clientId);

        if (!bucket) {
            const now = Date.now();
            bucket = {
                tokens: this.maxTokens,
                lastRefill: now,
                lastRequest: now,
                created: now
            };
            this.buckets.set(clientId, bucket);
        }

        return bucket;
    }

    /**
   * Refresca los tokens de un bucket
   * @param {Object} bucket - Bucket a refrescar
   * @param {number} now - Timestamp actual
   */
    refillBucket(bucket, now) {
        const timeSinceLastRefill = now - bucket.lastRefill;
        const tokensToAdd = Math.floor(timeSinceLastRefill / this.refillInterval);

        if (tokensToAdd > 0) {
            bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
        }
    }

    /**
   * Inicia el timer de refresco automático
   */
    startRefillTimer() {
        setInterval(() => {
            const now = Date.now();

            this.buckets.forEach((bucket, clientId) => {
                this.refillBucket(bucket, now);
            });
        }, this.refillInterval);

        logger.info(
            `Rate limiter iniciado: ${this.maxTokens} tokens, ${this.refillRate} refresco/min`
        );
    }

    /**
   * Obtiene estadísticas del rate limiter
   * @returns {Object} Estadísticas
   */
    getStats() {
        const stats = {
            activeBuckets: this.buckets.size(),
            cacheMetrics: this.buckets.getMetrics(),
            config: {
                maxTokens: this.maxTokens,
                refillRate: this.refillRate,
                windowMs: this.windowMs,
                refillInterval: this.refillInterval
            }
        };

        return stats;
    }

    /**
   * Resetea el rate limit para un cliente específico
   * @param {string} clientId - ID del cliente
   * @returns {boolean} True si se reseteo correctamente
   */
    resetClient(clientId) {
        const bucket = this.getBucket(clientId);
        bucket.tokens = this.maxTokens;
        bucket.lastRefill = Date.now();
        this.buckets.set(clientId, bucket);

        logger.info(`Rate limit reseteado para ${clientId}`);
        return true;
    }
}

/**
 * Rate Limiter específico para APIs externas
 */
class APIRateLimiter {
    constructor() {
    // Configuraciones por tipo de API
        this.limiters = {
            // Anthropic API - 50 requests/min (conservador)
            anthropic: new RateLimiter(50, 50, 60000),

            // ChromaDB - 100 requests/min
            chromadb: new RateLimiter(100, 100, 60000),

            // PostgreSQL - 200 requests/min
            postgresql: new RateLimiter(200, 200, 60000),

            // WhatsApp Web - 30 messages/min por cliente
            whatsapp: new RateLimiter(30, 30, 60000)
        };
    }

    /**
   * Verifica límite para una API específica
   * @param {string} apiType - Tipo de API
   * @param {string} clientId - ID del cliente
   * @param {number} tokensNeeded - Tokens necesarios
   * @returns {Object} Resultado de verificación
   */
    checkLimit(apiType, clientId, tokensNeeded = 1) {
        const limiter = this.limiters[apiType];

        if (!limiter) {
            logger.warn(`Rate limiter no configurado para API: ${apiType}`);
            return { allowed: true, remainingTokens: Infinity };
        }

        return limiter.checkLimit(clientId, tokensNeeded);
    }

    /**
   * Obtiene estadísticas de todos los limiters
   * @returns {Object} Estadísticas completas
   */
    getStats() {
        const stats = {};

        for (const [apiType, limiter] of Object.entries(this.limiters)) {
            stats[apiType] = limiter.getStats();
        }

        return stats;
    }

    /**
   * Resetea límites para un cliente en todas las APIs
   * @param {string} clientId - ID del cliente
   * @returns {boolean} True si se reseteo correctamente
   */
    resetClient(clientId) {
        let success = true;

        for (const [apiType, limiter] of Object.entries(this.limiters)) {
            try {
                limiter.resetClient(clientId);
            } catch (error) {
                logger.error(
                    `Error reseteando rate limit ${apiType} para ${clientId}:`,
                    error
                );
                success = false;
            }
        }

        return success;
    }
}

const retryHandler = async (
    fn,
    retries = 3,
    delay = 1000,
    exponential = true,
    maxDelay = 30000
) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            if (attempt < retries) {
                const currentDelay = exponential
                    ? Math.min(delay * Math.pow(2, attempt - 1), maxDelay)
                    : delay;
                logger.warn(
                    `Intento ${attempt}/${retries} fallido. Reintentando en ${currentDelay}ms. Error: ${error.message}`
                );
                await new Promise((res) => setTimeout(res, currentDelay));
            } else {
                logger.error(
                    `Todos los ${retries} intentos fallaron. Último error: ${error.message}`
                );
                throw error; // Re-lanza el último error después de todos los reintentos
            }
        }
    }
};

/**
 * Middleware de rate limiting para funciones async
 * @param {RateLimiter} limiter - Instancia del rate limiter
 * @param {string} clientId - ID del cliente
 * @param {Function} fn - Función a ejecutar
 * @param {number} tokensNeeded - Tokens necesarios
 * @returns {Promise} Resultado de la función o error de rate limit
 */
async function withRateLimit(limiter, clientId, fn, tokensNeeded = 1) {
    const result = limiter.checkLimit(clientId, tokensNeeded);

    if (!result.allowed) {
        const error = new Error(
            `Rate limit excedido. Intenta en ${Math.ceil(result.waitTime / 1000)} segundos.`
        );
        error.code = 'RATE_LIMIT_EXCEEDED';
        error.waitTime = result.waitTime;
        error.resetTime = result.resetTime;
        throw error;
    }

    return await fn();
}

// Singleton instance
const apiRateLimiter = new APIRateLimiter();

module.exports = {
    CircuitBreaker,
    RateLimiter,
    APIRateLimiter,
    apiRateLimiter,
    retryHandler,
    withRateLimit
};
