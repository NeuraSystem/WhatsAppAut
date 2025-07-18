const logger = require("../../utils/logger");
const { LRUCache } = require("../../utils/lruCache");
const { getEmbeddingEngine } = require("../../services/embeddingEngine");
const config = require("../../utils/config");

/**
 * QueryOptimizer - Optimización Inteligente de Consultas
 * Integrado con la arquitectura BotAut para acelerar búsquedas semánticas,
 * consultas de precios y operaciones de conversación.
 */
class QueryOptimizer {
  constructor(customConfig = {}) {
    this.config = {
      maxCacheSize:
        customConfig.maxCacheSize || config.performance?.maxCacheSize || 1000,
      defaultTTL: customConfig.defaultTTL || 300000, // 5 minutos
      semanticThreshold: customConfig.semanticThreshold || 0.85,
      timeoutMs: customConfig.timeoutMs || 30000,
      emergencyMode: false,
      ...customConfig,
    };

    this.operationMode = "full";
    this.embeddingEngine = null;

    // Caché multicapa específico para BotAut
    this.queryCache = new LRUCache({
      max: this.config.maxCacheSize,
      ttl: this.config.defaultTTL,
    });

    this.semanticCache = new LRUCache({
      max: Math.floor(this.config.maxCacheSize / 2),
      ttl: this.config.defaultTTL * 2,
    });

    // Caché específico para precios (más TTL por estabilidad)
    this.priceCache = new LRUCache({
      max: 500,
      ttl: this.config.defaultTTL * 4, // 20 minutos para precios
    });

    // Mapa de frecuencia para optimización adaptativa
    this.frequencyMap = new Map();

    // Métricas específicas del proyecto BotAut
    this.performanceMetrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      avgResponseTime: 0,
      totalRequests: 0,
      semanticMatches: 0,
      priceQueries: 0,
      conversationQueries: 0,
      lastOptimization: Date.now(),
    };

    // Patrones de consulta específicos de SalvaCell
    this.queryPatterns = {
      pricePatterns: [/precio/i, /costo/i, /vale/i, /cuanto/i, /tarifa/i],
      devicePatterns: [
        /iphone/i,
        /samsung/i,
        /xiaomi/i,
        /huawei/i,
        /motorola/i,
        /celular/i,
        /telefono/i,
        /movil/i,
      ],
      servicePatterns: [
        /reparacion/i,
        /arreglo/i,
        /cambio/i,
        /pantalla/i,
        /bateria/i,
      ],
    };

    this.initializeOptimizer();
  }

  /**
   * Inicializa el optimizador con integración al embedding engine
   */
  async initializeOptimizer() {
    try {
      this.embeddingEngine = await getEmbeddingEngine();
      logger.info("🚀 QueryOptimizer: Inicializado con embedding engine");
    } catch (error) {
      logger.error(
        "❌ QueryOptimizer: Error inicializando embedding engine",
        error,
      );
      this.embeddingEngine = null;
    }
  }

  /**
   * Set operation mode para degradación elegante
   * @param {string} mode - Operation mode ('full', 'minimal')
   */
  setMode(mode) {
    this.operationMode = mode;

    if (mode === "minimal") {
      logger.info("⚠️ QueryOptimizer: Cambiando a modo mínimo");
      // Reducir tamaños de caché para modo emergencia
      this.queryCache.max = Math.floor(this.config.maxCacheSize / 2);
      this.semanticCache.max = Math.floor(this.config.maxCacheSize / 4);
      this.priceCache.max = 250;
      this.config.emergencyMode = true;
    } else {
      logger.info("✅ QueryOptimizer: Cambiando a modo completo");
      // Restaurar tamaños completos de caché
      this.queryCache.max = this.config.maxCacheSize;
      this.semanticCache.max = this.config.maxCacheSize / 2;
      this.priceCache.max = 500;
      this.config.emergencyMode = false;
    }
  }

  /**
   * Optimiza el optimizador en sí mismo
   * @returns {Object} Resultados de optimización
   */
  async optimize() {
    logger.info("🔧 QueryOptimizer: Iniciando optimización...");

    const before = {
      cacheSize: this.queryCache.size,
      semanticCacheSize: this.semanticCache.size,
      priceCacheSize: this.priceCache.size,
      metrics: { ...this.performanceMetrics },
    };

    try {
      // Limpiar entradas expiradas
      this.optimizeCacheContents();
      this.cleanupFrequencyMap();

      const after = {
        cacheSize: this.queryCache.size,
        semanticCacheSize: this.semanticCache.size,
        priceCacheSize: this.priceCache.size,
        metrics: { ...this.performanceMetrics },
      };

      this.performanceMetrics.lastOptimization = Date.now();

      logger.info("🎯 QueryOptimizer: Optimización completada", {
        reduccionCache: before.cacheSize - after.cacheSize,
        reduccionSemantico: before.semanticCacheSize - after.semanticCacheSize,
        reduccionPrecios: before.priceCacheSize - after.priceCacheSize,
      });

      return {
        success: true,
        before,
        after,
        improvements: {
          cacheOptimized: before.cacheSize !== after.cacheSize,
          metricsReset: true,
          emergencyMode: this.config.emergencyMode,
        },
      };
    } catch (error) {
      logger.error("❌ QueryOptimizer: Optimización falló", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Optimiza contenidos de caché eliminando elementos de baja frecuencia
   */
  optimizeCacheContents() {
    const threshold = Math.max(2, Math.floor(this.frequencyMap.size * 0.1));
    let removed = 0;

    for (const [key, data] of this.frequencyMap.entries()) {
      if (data.frequency < threshold) {
        this.queryCache.delete(key);
        this.semanticCache.delete(key);
        this.priceCache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(
        `🧹 QueryOptimizer: Limpiados ${removed} elementos de baja frecuencia`,
      );
    }
  }

  /**
   * Limpia el mapa de frecuencia
   */
  cleanupFrequencyMap() {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 horas
    let cleaned = 0;

    for (const [key, data] of this.frequencyMap.entries()) {
      if (data.lastAccessed < cutoffTime) {
        this.frequencyMap.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(
        `🧹 QueryOptimizer: Limpiadas ${cleaned} entradas de frecuencia antiguas`,
      );
    }
  }

  /**
   * Ejecuta consulta optimizada con caché específico para BotAut
   * @param {string} query - Consulta a ejecutar
   * @param {Function} queryFunction - Función a ejecutar si no está en caché
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Resultados de consulta
   */
  async executeOptimizedQuery(query, queryFunction, options = {}) {
    const startTime = Date.now();
    const queryKey = this.generateQueryKey(query, options);
    const queryType = this.detectQueryType(query);

    try {
      this.performanceMetrics.totalRequests++;

      // Seleccionar caché apropiado según tipo de consulta
      const targetCache = this.selectTargetCache(queryType);

      // Verificar caché primero
      const cached = targetCache.get(queryKey);
      if (cached) {
        this.performanceMetrics.hits++;
        this.updateFrequencyMap(queryKey);
        this.updateMetrics(startTime, true);
        return this.enrichCachedResult(cached, queryType);
      }

      // Verificar caché semántico solo si hay embedding engine
      if (this.embeddingEngine && !this.config.emergencyMode) {
        const semanticMatch = await this.findSemanticMatch(query, queryType);
        if (semanticMatch) {
          this.performanceMetrics.hits++;
          this.performanceMetrics.semanticMatches++;
          this.updateFrequencyMap(queryKey);
          this.updateMetrics(startTime, true);
          return this.enrichCachedResult(semanticMatch, queryType);
        }
      }

      // Ejecutar consulta con optimización específica
      const result = await this.executeWithOptimization(queryFunction, options);

      // Cachear el resultado con TTL adaptativo
      const ttl = this.calculateAdaptiveTTL(queryKey, queryType);
      targetCache.set(queryKey, result, { ttl });

      this.performanceMetrics.misses++;
      this.updateFrequencyMap(queryKey);
      this.updateMetrics(startTime, false);

      logger.info(
        `💡 QueryOptimizer: Consulta ejecutada [${queryType}] - ${Date.now() - startTime}ms`,
      );

      return this.enrichResult(result, queryType);
    } catch (error) {
      this.performanceMetrics.errors++;
      this.updateMetrics(startTime, false);
      logger.error("❌ QueryOptimizer: Error ejecutando consulta", error);
      throw error;
    }
  }

  /**
   * Detecta el tipo de consulta para optimización específica
   * @param {string} query - Consulta a analizar
   * @returns {string} Tipo de consulta
   */
  detectQueryType(query) {
    const lowerQuery = query.toLowerCase();

    if (
      this.queryPatterns.pricePatterns.some((pattern) =>
        pattern.test(lowerQuery),
      )
    ) {
      this.performanceMetrics.priceQueries++;
      return "price";
    }

    if (
      this.queryPatterns.devicePatterns.some((pattern) =>
        pattern.test(lowerQuery),
      )
    ) {
      return "device";
    }

    if (
      this.queryPatterns.servicePatterns.some((pattern) =>
        pattern.test(lowerQuery),
      )
    ) {
      return "service";
    }

    this.performanceMetrics.conversationQueries++;
    return "conversation";
  }

  /**
   * Selecciona el caché objetivo según el tipo de consulta
   * @param {string} queryType - Tipo de consulta
   * @returns {LRUCache} Caché apropiado
   */
  selectTargetCache(queryType) {
    switch (queryType) {
      case "price":
        return this.priceCache;
      case "conversation":
      case "device":
      case "service":
      default:
        return this.queryCache;
    }
  }

  /**
   * Encuentra coincidencia semántica en caché
   * @param {string} query - Consulta original
   * @param {string} queryType - Tipo de consulta
   * @returns {Object|null} Resultado coincidente o null
   */
  async findSemanticMatch(query, queryType = "conversation") {
    if (!this.embeddingEngine) return null;

    try {
      const queryEmbedding = await this.embeddingEngine.embedQuery(query);
      const targetCache =
        queryType === "price" ? this.priceCache : this.semanticCache;

      for (const [cachedKey, cachedResult] of targetCache.entries()) {
        if (cachedResult.embedding) {
          const similarity = this.calculateSimilarity(
            queryEmbedding,
            cachedResult.embedding,
          );
          if (similarity >= this.config.semanticThreshold) {
            logger.info(
              `🎯 QueryOptimizer: Coincidencia semántica encontrada (${similarity.toFixed(3)})`,
            );
            return cachedResult;
          }
        }
      }
      return null;
    } catch (error) {
      logger.error("❌ QueryOptimizer: Error en búsqueda semántica", error);
      return null;
    }
  }

  /**
   * Ejecuta con optimización y timeout
   * @param {Function} queryFunction - Función a ejecutar
   * @param {Object} options - Opciones
   * @returns {Object} Resultado
   */
  async executeWithOptimization(queryFunction, options) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Query timeout after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);

      try {
        const result = await queryFunction(options);
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Calcula TTL adaptativo basado en el tipo de consulta y frecuencia
   * @param {string} queryKey - Clave de consulta
   * @param {string} queryType - Tipo de consulta
   * @returns {number} TTL en milisegundos
   */
  calculateAdaptiveTTL(queryKey, queryType) {
    const baseMultipliers = {
      price: 4, // Precios más estables
      device: 2, // Info de dispositivos moderadamente estable
      service: 2, // Info de servicios moderadamente estable
      conversation: 1, // Conversaciones más dinámicas
    };

    const frequency = this.frequencyMap.get(queryKey)?.frequency || 1;
    const multiplier = baseMultipliers[queryType] || 1;
    const frequencyBonus = Math.min(frequency / 10, 2); // Max 2x por frecuencia

    return this.config.defaultTTL * multiplier * (1 + frequencyBonus);
  }

  /**
   * Genera clave de consulta consistente
   * @param {string} query - Consulta
   * @param {Object} options - Opciones
   * @returns {string} Clave generada
   */
  generateQueryKey(query, options = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const optionsHash = this.hashString(JSON.stringify(options));
    return `${this.hashString(normalizedQuery)}_${optionsHash}`;
  }

  /**
   * Calcula hash simple de string
   * @param {string} str - String a hashear
   * @returns {string} Hash
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Actualiza mapa de frecuencia
   * @param {string} queryKey - Clave de consulta
   */
  updateFrequencyMap(queryKey) {
    const existing = this.frequencyMap.get(queryKey) || {
      frequency: 0,
      lastAccessed: 0,
    };
    this.frequencyMap.set(queryKey, {
      frequency: existing.frequency + 1,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Crea promesa con timeout
   * @param {number} ms - Millisegundos
   * @returns {Promise} Promesa que resuelve después del timeout
   */
  createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Query timeout")), ms);
    });
  }

  /**
   * Enriquece resultado desde caché
   * @param {Object} cached - Resultado cacheado
   * @param {string} queryType - Tipo de consulta
   * @returns {Object} Resultado enriquecido
   */
  enrichCachedResult(cached, queryType) {
    return {
      ...cached,
      _cache: {
        hit: true,
        type: queryType,
        timestamp: Date.now(),
        source: "QueryOptimizer",
      },
    };
  }

  /**
   * Enriquece resultado general
   * @param {Object} result - Resultado original
   * @param {string} queryType - Tipo de consulta
   * @returns {Object} Resultado enriquecido
   */
  enrichResult(result, queryType) {
    return {
      ...result,
      _cache: {
        hit: false,
        type: queryType,
        timestamp: Date.now(),
        source: "QueryOptimizer",
      },
    };
  }

  /**
   * Calcula similitud entre embeddings
   * @param {Array} embedding1 - Primer embedding
   * @param {Array} embedding2 - Segundo embedding
   * @returns {number} Similitud del coseno
   */
  calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Actualiza métricas de rendimiento
   * @param {number} startTime - Tiempo de inicio
   * @param {boolean} wasHit - Si fue acierto de caché
   */
  updateMetrics(startTime, wasHit) {
    const responseTime = Date.now() - startTime;
    const totalTime =
      this.performanceMetrics.avgResponseTime *
      (this.performanceMetrics.totalRequests - 1);
    this.performanceMetrics.avgResponseTime =
      (totalTime + responseTime) / this.performanceMetrics.totalRequests;
  }

  /**
   * Obtiene métricas de rendimiento actuales
   * @returns {Object} Métricas completas
   */
  getPerformanceMetrics() {
    const hitRate =
      this.performanceMetrics.totalRequests > 0
        ? (
            (this.performanceMetrics.hits /
              this.performanceMetrics.totalRequests) *
            100
          ).toFixed(2)
        : 0;

    return {
      ...this.performanceMetrics,
      hitRate: `${hitRate}%`,
      cacheStatus: {
        queryCache: {
          size: this.queryCache.size,
          max: this.queryCache.max,
        },
        semanticCache: {
          size: this.semanticCache.size,
          max: this.semanticCache.max,
        },
        priceCache: {
          size: this.priceCache.size,
          max: this.priceCache.max,
        },
      },
      mode: this.operationMode,
      emergencyMode: this.config.emergencyMode,
      lastOptimization: new Date(
        this.performanceMetrics.lastOptimization,
      ).toISOString(),
    };
  }
}

module.exports = QueryOptimizer;
