// src/utils/rateLimiter.js

const { LRUCache } = require("./lruCache");
const logger = require("./logger");

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
        resetTime: bucket.lastRefill + this.windowMs,
      };
    }

    // Rate limit excedido
    const resetTime = bucket.lastRefill + this.windowMs;
    const waitTime = resetTime - now;

    logger.warn(`Rate limit excedido para ${clientId}`, {
      tokensNeeded,
      tokensAvailable: bucket.tokens,
      waitTime: Math.max(0, waitTime),
    });

    return {
      allowed: false,
      remainingTokens: bucket.tokens,
      resetTime,
      waitTime: Math.max(0, waitTime),
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
        created: now,
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
      `Rate limiter iniciado: ${this.maxTokens} tokens, ${this.refillRate} refresco/min`,
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
        refillInterval: this.refillInterval,
      },
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
      whatsapp: new RateLimiter(30, 30, 60000),
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
          error,
        );
        success = false;
      }
    }

    return success;
  }
}

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
      `Rate limit excedido. Intenta en ${Math.ceil(result.waitTime / 1000)} segundos.`,
    );
    error.code = "RATE_LIMIT_EXCEEDED";
    error.waitTime = result.waitTime;
    error.resetTime = result.resetTime;
    throw error;
  }

  return await fn();
}

// Singleton instance
const apiRateLimiter = new APIRateLimiter();

module.exports = {
  RateLimiter,
  APIRateLimiter,
  apiRateLimiter,
  withRateLimit,
};
