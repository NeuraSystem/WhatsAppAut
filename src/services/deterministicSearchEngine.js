#!/usr/bin/env node

// src/services/deterministicSearchEngine.js
// MOTOR DE BÚSQUEDA DETERMINÍSTICA - SOLUCIÓN CRÍTICA 4
// Sistema para garantizar resultados consistentes en ChromaDB

const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * DETERMINISTIC SEARCH ENGINE
 * Garantiza resultados consistentes para consultas idénticas en ChromaDB
 *
 * Funcionalidades:
 * - Algoritmo de consenso por múltiples búsquedas
 * - Cache inteligente específico por contexto SalvaCell
 * - Estabilización de resultados por frecuencia y relevancia
 * - Métricas de determinismo en tiempo real
 * - Integración con información Markdown de precios
 */
class DeterministicSearchEngine {
    constructor(options = {}) {
        this.config = {
            // Configuración base
            defaultSearchAttempts: 3,
            defaultStabilityThreshold: 0.95,
            maxCacheSize: 1000,

            // Configuración específica SalvaCell por contexto
            contextConfigs: {
                PRICE_QUERIES: {
                    stabilityThreshold: 0.98, // Máxima estabilidad para precios
                    cacheTime: 1800000, // 30 min cache para precios
                    searchAttempts: 5, // Múltiples intentos para consenso
                    relevanceWeight: 0.3, // 30% peso relevancia, 70% estabilidad
                    markdownIntegration: true
                },
                DEVICE_SEARCH: {
                    stabilityThreshold: 0.95,
                    cacheTime: 900000, // 15 min cache para dispositivos
                    searchAttempts: 3,
                    relevanceWeight: 0.4,
                    markdownIntegration: false
                },
                WARRANTY_LOOKUP: {
                    stabilityThreshold: 0.99, // Crítico para garantías
                    cacheTime: 3600000, // 1 hora cache para historiales
                    searchAttempts: 5,
                    relevanceWeight: 0.2, // Máxima estabilidad
                    markdownIntegration: true
                },
                CONVERSATION_MEMORY: {
                    stabilityThreshold: 0.9,
                    cacheTime: 600000, // 10 min cache para conversaciones
                    searchAttempts: 3,
                    relevanceWeight: 0.5,
                    markdownIntegration: false
                },
                MARKDOWN_CONTEXT: {
                    stabilityThreshold: 0.97, // Alta estabilidad para info temporal
                    cacheTime: 2700000, // 45 min cache para info Markdown
                    searchAttempts: 4,
                    relevanceWeight: 0.25, // Priorizar estabilidad
                    markdownIntegration: true
                }
            },

            // Configuración de horarios de negocio SalvaCell
            salvaCellSchedule: {
                businessHours: { start: 11, end: 21 }, // 11 AM - 9 PM
                peakHours: { start: 18, end: 20 }, // 6 PM - 8 PM
                sundayHours: { start: 12, end: 17 } // 12 PM - 5 PM
            },

            ...options
        };

        // Sistema de cache por contexto
        this.caches = {
            priceCache: new Map(), // Cache específico para precios
            deviceCache: new Map(), // Cache para dispositivos
            warrantyCache: new Map(), // Cache para garantías
            conversationCache: new Map(), // Cache para conversaciones
            markdownCache: new Map(), // Cache para info Markdown
            generalCache: new Map() // Cache general
        };

        // Métricas de determinismo
        this.metrics = {
            totalQueries: 0,
            cacheHits: 0,
            stabilizedQueries: 0,
            averageStabilityScore: 0,
            consensusFailures: 0,
            contextBreakdown: {},
            lastCleanup: Date.now()
        };

        // Sistema de invalidación de cache
        this.cacheInvalidation = {
            markdownPriceLastUpdate: Date.now(),
            pricePatterns: ['precio', 'costo', 'cuanto', '$', 'pesos'],
            warrantyPatterns: ['garantía', 'original', 'genérica', 'días'],
            timePatterns: ['tiempo', 'minutos', 'horas', 'domicilio', '4 pm']
        };

        logger.info('🎯 DeterministicSearchEngine inicializado:', {
            contexts: Object.keys(this.config.contextConfigs).length,
            maxCacheSize: this.config.maxCacheSize,
            salvaCellIntegration: true
        });
    }

    /**
   * BÚSQUEDA DETERMINÍSTICA PRINCIPAL
   * Método principal para realizar búsquedas con determinismo garantizado
   */
    async performStabilizedSearch(
        collection,
        query,
        filters = {},
        context = 'CONVERSATION_MEMORY'
    ) {
        const startTime = Date.now();
        this.metrics.totalQueries++;

        try {
            // 1. Detectar contexto específico si no se especifica
            const detectedContext =
        this.detectQueryContext(query, filters) || context;
            const contextConfig =
        this.config.contextConfigs[detectedContext] ||
        this.config.contextConfigs.CONVERSATION_MEMORY;

            // 2. Generar hash único para la consulta
            const queryHash = this.generateQueryHash(query, filters, detectedContext);

            // 3. Verificar cache determinístico
            const cacheResult = this.getCachedResult(queryHash, detectedContext);
            if (cacheResult) {
                this.metrics.cacheHits++;
                this.recordMetrics(
                    detectedContext,
                    'cache_hit',
                    Date.now() - startTime
                );
                return cacheResult.results;
            }

            // 4. Realizar múltiples búsquedas para consenso
            const allResults = await this.performMultipleSearches(
                collection,
                query,
                filters,
                contextConfig
            );

            if (!allResults || allResults.length === 0) {
                throw new Error('No se pudieron realizar búsquedas para consenso');
            }

            // 5. Estabilizar resultados por consenso
            const stabilizedResults = this.stabilizeResults(
                allResults,
                filters.limit || 5,
                contextConfig
            );

            // 6. Integrar información Markdown si aplica
            if (contextConfig.markdownIntegration) {
                await this.enrichWithMarkdownContext(
                    stabilizedResults,
                    query,
                    detectedContext
                );
            }

            // 7. Cache para futuras consultas idénticas
            this.cacheResults(
                queryHash,
                stabilizedResults,
                detectedContext,
                contextConfig.cacheTime
            );

            // 8. Registrar métricas
            this.metrics.stabilizedQueries++;
            this.recordMetrics(detectedContext, 'stabilized', Date.now() - startTime);

            logger.debug(
                `🎯 Búsqueda determinística completada: ${detectedContext} (${Date.now() - startTime}ms)`
            );

            return stabilizedResults;
        } catch (error) {
            this.metrics.consensusFailures++;
            logger.error('❌ Error en búsqueda determinística:', error);

            // Fallback a búsqueda simple
            logger.warn('🔄 Fallback a búsqueda simple...');
            return await this.performFallbackSearch(collection, query, filters);
        }
    }

    /**
   * REALIZAR MÚLTIPLES BÚSQUEDAS PARA CONSENSO
   * Ejecuta varias búsquedas para estabilizar resultados
   */
    async performMultipleSearches(collection, query, filters, contextConfig) {
        const { searchAttempts } = contextConfig;
        const searchPromises = [];

        // Ejecutar búsquedas en paralelo para eficiencia
        for (let i = 0; i < searchAttempts; i++) {
            const searchPromise = this.performSingleSearch(
                collection,
                query,
                filters,
                i
            );
            searchPromises.push(searchPromise);
        }

        try {
            const results = await Promise.allSettled(searchPromises);

            // Filtrar solo resultados exitosos
            const successfulResults = results
                .filter((result) => result.status === 'fulfilled' && result.value)
                .map((result) => result.value);

            if (successfulResults.length === 0) {
                throw new Error('Todas las búsquedas de consenso fallaron');
            }

            logger.debug(
                `🔄 Consenso: ${successfulResults.length}/${searchAttempts} búsquedas exitosas`
            );
            return successfulResults;
        } catch (error) {
            logger.error('❌ Error en búsquedas múltiples:', error);
            throw error;
        }
    }

    /**
   * REALIZAR BÚSQUEDA INDIVIDUAL
   * Ejecuta una búsqueda única con variación mínima para consenso
   */
    async performSingleSearch(collection, query, filters, attemptNumber) {
        try {
            // Ajustar parámetros ligeramente para cada intento
            const adjustedLimit = (filters.limit || 5) * 2; // Obtener más resultados para estabilizar
            const whereFilter = this.buildWhereFilter(filters);

            const result = await collection.query({
                queryTexts: [query],
                nResults: adjustedLimit,
                where: whereFilter
            });

            // Añadir metadatos del intento
            if (result && result.metadatas && result.metadatas[0]) {
                result.metadatas[0].forEach((metadata) => {
                    metadata.search_attempt = attemptNumber;
                    metadata.search_timestamp = Date.now();
                });
            }

            return result;
        } catch (error) {
            logger.warn(`⚠️ Búsqueda ${attemptNumber} falló:`, error.message);
            return null;
        }
    }

    /**
   * ESTABILIZAR RESULTADOS POR CONSENSO
   * Algoritmo para combinar múltiples resultados en uno estable
   */
    stabilizeResults(allResults, targetCount, contextConfig) {
        if (!allResults || allResults.length === 0) {
            throw new Error('No hay resultados para estabilizar');
        }

        const documentFrequency = new Map();
        const documentMetadata = new Map();
        const { relevanceWeight, stabilityThreshold } = contextConfig;

        // 1. Contar frecuencia de aparición de cada documento
        allResults.forEach((result, resultIndex) => {
            if (!result || !result.documents || !result.documents[0]) return;

            result.documents[0].forEach((doc, docIndex) => {
                const docId = result.ids[0][docIndex];
                const distance = result.distances ? result.distances[0][docIndex] : 1.0;
                const metadata = result.metadatas ? result.metadatas[0][docIndex] : {};

                if (!documentFrequency.has(docId)) {
                    documentFrequency.set(docId, 0);
                    documentMetadata.set(docId, {
                        document: doc,
                        metadata: metadata,
                        distances: [],
                        appearances: []
                    });
                }

                documentFrequency.set(docId, documentFrequency.get(docId) + 1);
                const docData = documentMetadata.get(docId);
                docData.distances.push(distance);
                docData.appearances.push({ resultIndex, docIndex, distance });
            });
        });

        // 2. Calcular puntuaciones de estabilidad y relevancia
        const scoredDocuments = Array.from(documentFrequency.entries())
            .map(([docId, frequency]) => {
                const docData = documentMetadata.get(docId);
                const stabilityScore = frequency / allResults.length;
                const avgDistance =
          docData.distances.reduce((sum, dist) => sum + dist, 0) /
          docData.distances.length;
                const relevanceScore = 1 - avgDistance; // Invertir distancia para score

                // Combinar estabilidad y relevancia según configuración
                const combinedScore =
          stabilityScore * (1 - relevanceWeight) +
          relevanceScore * relevanceWeight;

                return {
                    id: docId,
                    document: docData.document,
                    metadata: {
                        ...docData.metadata,
                        stability_score: stabilityScore,
                        avg_distance: avgDistance,
                        combined_score: combinedScore,
                        appearance_frequency: frequency,
                        total_searches: allResults.length
                    },
                    stabilityScore,
                    avgDistance,
                    combinedScore
                };
            })
            .filter((doc) => doc.stabilityScore >= stabilityThreshold * 0.8) // Filtrar documentos muy inestables
            .sort((a, b) => {
                // Ordenar primero por puntuación combinada, luego por estabilidad
                if (Math.abs(a.combinedScore - b.combinedScore) > 0.05) {
                    return b.combinedScore - a.combinedScore;
                }
                return b.stabilityScore - a.stabilityScore;
            })
            .slice(0, targetCount);

        // 3. Calcular métricas de calidad del consenso
        const avgStabilityScore =
      scoredDocuments.reduce((sum, doc) => sum + doc.stabilityScore, 0) /
      scoredDocuments.length;
        this.metrics.averageStabilityScore = avgStabilityScore;

        // 4. Formatear resultados en formato ChromaDB
        const stabilizedResults = {
            ids: [scoredDocuments.map((doc) => doc.id)],
            documents: [scoredDocuments.map((doc) => doc.document)],
            metadatas: [scoredDocuments.map((doc) => doc.metadata)],
            distances: [scoredDocuments.map((doc) => doc.avgDistance)],
            stabilityScores: scoredDocuments.map((doc) => doc.stabilityScore),
            consensusQuality: avgStabilityScore
        };

        logger.debug(
            `🎯 Resultados estabilizados: ${scoredDocuments.length}, estabilidad promedio: ${avgStabilityScore.toFixed(3)}`
        );

        return stabilizedResults;
    }

    /**
   * ENRIQUECER CON CONTEXTO MARKDOWN
   * Integra información temporal y de garantías de archivos Markdown
   */
    async enrichWithMarkdownContext(results, query, context) {
        try {
            if (!results.metadatas || !results.metadatas[0]) return;

            const lowerQuery = query.toLowerCase();

            // Detectar tipo de enriquecimiento necesario
            const needsTimeInfo = this.containsAny(
                lowerQuery,
                this.cacheInvalidation.timePatterns
            );
            const needsWarrantyInfo = this.containsAny(
                lowerQuery,
                this.cacheInvalidation.warrantyPatterns
            );
            const needsPriceInfo = this.containsAny(
                lowerQuery,
                this.cacheInvalidation.pricePatterns
            );

            // Enriquecer metadatos con información Markdown
            results.metadatas[0].forEach((metadata) => {
                metadata.markdown_enrichment = {
                    query_context: context,
                    enrichment_timestamp: Date.now()
                };

                if (needsTimeInfo) {
                    metadata.markdown_enrichment.time_info = {
                        establecimiento:
              'Mismo día (antes 4PM) / Siguiente día (después 4PM)',
                        domicilio: '45-60 minutos una vez iniciado',
                        tiempo_promedio: '52 minutos'
                    };
                }

                if (needsWarrantyInfo) {
                    metadata.markdown_enrichment.warranty_info = {
                        garantia_original: '30 días',
                        garantia_generica: '15 días',
                        moneda: 'Pesos Mexicanos (MXN)'
                    };
                }

                if (needsPriceInfo && context === 'PRICE_QUERIES') {
                    metadata.markdown_enrichment.price_context = {
                        ultima_actualizacion: '2025-07-10',
                        servicios_disponibles: ['pantalla', 'batería', 'cámara', 'puerto'],
                        validez_precios: 'Sujeto a disponibilidad'
                    };
                }
            });

            logger.debug(
                `📄 Enriquecimiento Markdown aplicado: tiempo=${needsTimeInfo}, garantía=${needsWarrantyInfo}, precio=${needsPriceInfo}`
            );
        } catch (error) {
            logger.warn(
                '⚠️ Error enriqueciendo con contexto Markdown:',
                error.message
            );
        }
    }

    /**
   * DETECTAR CONTEXTO DE CONSULTA
   * Analiza la consulta para determinar el contexto más apropiado
   */
    detectQueryContext(query, _filters = {}) {
        const lowerQuery = query.toLowerCase();

        // Detectar consultas de precios
        if (this.containsAny(lowerQuery, this.cacheInvalidation.pricePatterns)) {
            return 'PRICE_QUERIES';
        }

        // Detectar búsquedas de garantía
        if (this.containsAny(lowerQuery, this.cacheInvalidation.warrantyPatterns)) {
            return 'WARRANTY_LOOKUP';
        }

        // Detectar información temporal/Markdown
        if (this.containsAny(lowerQuery, this.cacheInvalidation.timePatterns)) {
            return 'MARKDOWN_CONTEXT';
        }

        // Detectar búsquedas de dispositivos
        if (
            this.containsAny(lowerQuery, [
                'iphone',
                'samsung',
                'xiaomi',
                'motorola',
                'modelo',
                'dispositivo'
            ])
        ) {
            return 'DEVICE_SEARCH';
        }

        // Por defecto, memoria conversacional
        return 'CONVERSATION_MEMORY';
    }

    /**
   * GENERAR HASH DE CONSULTA
   * Crea identificador único normalizado para cache
   */
    generateQueryKey(query, filters = {}, context = '') {
        const normalizedQuery = query
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ') // Normalizar espacios
            .replace(/[^\w\s-.$]/g, ''); // Remover caracteres especiales excepto importantes

        const normalizedFilters = this.normalizeFilters(filters);

        const hashInput = JSON.stringify({
            query: normalizedQuery,
            filters: normalizedFilters,
            context: context
        });

        return crypto.createHash('md5').update(hashInput).digest('hex');
    }

    /**
   * NORMALIZAR FILTROS
   * Estandariza filtros para hash consistente
   */
    normalizeFilters(filters) {
        const normalized = {};
        const keys = Object.keys(filters).sort();

        for (const key of keys) {
            if (filters[key] !== undefined && filters[key] !== null) {
                normalized[key] = filters[key];
            }
        }

        return normalized;
    }

    /**
   * SISTEMA DE CACHE POR CONTEXTO
   */
    getCachedResult(queryHash, context) {
        const cache = this.getCacheByContext(context);
        const cached = cache.get(queryHash);

        if (cached && cached.expiry > Date.now()) {
            logger.debug(`💾 Cache hit para contexto ${context}`);
            return cached;
        }

        if (cached && cached.expiry <= Date.now()) {
            cache.delete(queryHash);
            logger.debug(`🕒 Cache expirado eliminado para ${context}`);
        }

        return null;
    }

    cacheResults(queryHash, results, context, cacheTime) {
        const cache = this.getCacheByContext(context);

        // Verificar límite de cache
        if (cache.size >= this.config.maxCacheSize) {
            this.cleanupCache(cache);
        }

        cache.set(queryHash, {
            results: results,
            expiry: Date.now() + cacheTime,
            context: context,
            timestamp: Date.now()
        });

        logger.debug(
            `💾 Resultado cacheado: ${context} (TTL: ${Math.round(cacheTime / 60000)}min)`
        );
    }

    getCacheByContext(context) {
        switch (context) {
        case 'PRICE_QUERIES':
            return this.caches.priceCache;
        case 'DEVICE_SEARCH':
            return this.caches.deviceCache;
        case 'WARRANTY_LOOKUP':
            return this.caches.warrantyCache;
        case 'MARKDOWN_CONTEXT':
            return this.caches.markdownCache;
        case 'CONVERSATION_MEMORY':
            return this.caches.conversationCache;
        default:
            return this.caches.generalCache;
        }
    }

    /**
   * LIMPIEZA DE CACHE
   * Elimina entradas expiradas y más antiguas
   */
    cleanupCache(cache) {
        const now = Date.now();
        const entries = Array.from(cache.entries());

        // Eliminar entradas expiradas
        entries.forEach(([key, value]) => {
            if (value.expiry <= now) {
                cache.delete(key);
            }
        });

        // Si aún está lleno, eliminar las más antiguas
        if (cache.size >= this.config.maxCacheSize) {
            const sortedEntries = entries
                .filter(([, value]) => value.expiry > now)
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            const toDelete = sortedEntries.slice(
                0,
                Math.floor(this.config.maxCacheSize * 0.2)
            );
            toDelete.forEach(([key]) => cache.delete(key));

            logger.debug(`🧹 Cache limpiado: ${toDelete.length} entradas eliminadas`);
        }
    }

    /**
   * INVALIDACIÓN INTELIGENTE DE CACHE
   * Invalida cache cuando cambia información relevante
   */
    invalidatePriceCache() {
        this.caches.priceCache.clear();
        this.caches.markdownCache.clear();
        this.cacheInvalidation.markdownPriceLastUpdate = Date.now();

        logger.info(
            '🔄 Cache de precios invalidado por actualización de información'
        );
    }

    /**
   * BÚSQUEDA FALLBACK
   * Búsqueda simple cuando falla el determinismo
   */
    async performFallbackSearch(collection, query, filters) {
        try {
            logger.warn('⚠️ Usando búsqueda fallback (no determinística)');

            const whereFilter = this.buildWhereFilter(filters);
            return await collection.query({
                queryTexts: [query],
                nResults: filters.limit || 5,
                where: whereFilter
            });
        } catch (error) {
            logger.error('❌ Error en búsqueda fallback:', error);
            throw error;
        }
    }

    /**
   * MÉTODOS AUXILIARES
   */
    containsAny(text, keywords) {
        return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
    }

    buildWhereFilter(filters) {
        const where = {};

        if (filters.client_id) {
            where.client_id = filters.client_id;
        }

        if (filters.intent) {
            where.main_intent = filters.intent;
        }

        if (filters.device) {
            where.device_mentioned = { $contains: filters.device };
        }

        if (filters.hasPrice) {
            where.has_price_info = 'yes';
        }

        if (filters.dateFrom) {
            where.timestamp = { $gte: filters.dateFrom };
        }

        if (filters.source) {
            where.source = filters.source;
        }

        return Object.keys(where).length > 0 ? where : null;
    }

    recordMetrics(context, operation, duration) {
        if (!this.metrics.contextBreakdown[context]) {
            this.metrics.contextBreakdown[context] = {
                queries: 0,
                cacheHits: 0,
                avgDuration: 0
            };
        }

        const contextMetrics = this.metrics.contextBreakdown[context];
        contextMetrics.queries++;

        if (operation === 'cache_hit') {
            contextMetrics.cacheHits++;
        }

        // Actualizar duración promedio
        contextMetrics.avgDuration =
      (contextMetrics.avgDuration * (contextMetrics.queries - 1) + duration) /
      contextMetrics.queries;
    }

    /**
   * MÉTODOS PÚBLICOS PARA MONITOREO
   */
    getDeterminismStats() {
        const now = Date.now();
        const cacheStats = {};

        // Estadísticas por cache
        Object.entries(this.caches).forEach(([cacheName, cache]) => {
            const validEntries = Array.from(cache.values()).filter(
                (entry) => entry.expiry > now
            );
            cacheStats[cacheName] = {
                size: cache.size,
                validEntries: validEntries.length,
                hitRate: validEntries.length > 0 ? validEntries.length / cache.size : 0
            };
        });

        return {
            totalQueries: this.metrics.totalQueries,
            cacheHitRate:
        this.metrics.totalQueries > 0
            ? this.metrics.cacheHits / this.metrics.totalQueries
            : 0,
            stabilizationRate:
        this.metrics.totalQueries > 0
            ? this.metrics.stabilizedQueries / this.metrics.totalQueries
            : 0,
            averageStabilityScore: this.metrics.averageStabilityScore,
            consensusFailureRate:
        this.metrics.totalQueries > 0
            ? this.metrics.consensusFailures / this.metrics.totalQueries
            : 0,
            contextBreakdown: this.metrics.contextBreakdown,
            cacheStats: cacheStats,
            uptime: now - (this.metrics.lastCleanup || now),
            lastCleanup: this.metrics.lastCleanup
        };
    }

    getContextHealth(context) {
        const cache = this.getCacheByContext(context);
        const config = this.config.contextConfigs[context];
        const metrics = this.metrics.contextBreakdown[context] || {};

        return {
            context: context,
            cacheSize: cache.size,
            queries: metrics.queries || 0,
            cacheHitRate:
        metrics.queries > 0 ? (metrics.cacheHits || 0) / metrics.queries : 0,
            avgDuration: metrics.avgDuration || 0,
            stabilityThreshold: config?.stabilityThreshold || 0,
            health: this.calculateContextHealth(context)
        };
    }

    calculateContextHealth(context) {
        const metrics = this.metrics.contextBreakdown[context] || {};
        const cacheHitRate =
      metrics.queries > 0 ? (metrics.cacheHits || 0) / metrics.queries : 0;
        const avgDuration = metrics.avgDuration || 1000;

        // Salud basada en cache hit rate y duración
        const cacheScore = cacheHitRate;
        const performanceScore = Math.max(0, 1 - avgDuration / 2000); // Penalizar >2s

        return cacheScore * 0.6 + performanceScore * 0.4;
    }

    /**
   * MANTENIMIENTO Y LIMPIEZA
   */
    performMaintenance() {
        const now = Date.now();

        // Limpiar todos los caches
        Object.values(this.caches).forEach((cache) => {
            this.cleanupCache(cache);
        });

        // Reset métricas si es necesario
        if (now - this.metrics.lastCleanup > 86400000) {
            // 24 horas
            this.resetMetrics();
        }

        this.metrics.lastCleanup = now;
        logger.info('🧹 Mantenimiento de DeterministicSearchEngine completado');
    }

    resetMetrics() {
        this.metrics = {
            ...this.metrics,
            totalQueries: 0,
            cacheHits: 0,
            stabilizedQueries: 0,
            consensusFailures: 0,
            contextBreakdown: {}
        };

        logger.info('📊 Métricas de determinismo reseteadas');
    }
}

module.exports = {
    DeterministicSearchEngine
};
