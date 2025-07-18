#!/usr/bin/env node

// src/services/clientHistorySearchEngine.js
// CLIENT HISTORY SEARCH ENGINE - SOLUCIÓN 8 SIMPLIFICADA
// Motor de búsqueda especializado en historial de clientes por número de teléfono

const logger = require('../utils/logger');

/**
 * CLIENT HISTORY SEARCH ENGINE
 * Motor especializado para búsqueda y análisis de historial de clientes
 *
 * Características:
 * - Identificación robusta por número de teléfono (WhatsApp)
 * - Normalización de formatos de números mexicanos
 * - Búsqueda alternativa con variaciones de números
 * - Análisis de perfil de cliente basado en historial
 * - Integración con sistema de memoria conversacional existente
 */
class ClientHistorySearchEngine {
    constructor(options = {}, conversationMemory) {
        this.config = {
            // Límites de búsqueda
            defaultHistoryLimit: options.defaultHistoryLimit || 50,
            maxHistoryLimit: options.maxHistoryLimit || 200,

            // Búsqueda alternativa
            enableAlternativeSearch: options.enableAlternativeSearch !== false,

            // Análisis de perfil
            enableProfileAnalysis: options.enableProfileAnalysis !== false,

            // Cache de búsquedas
            enableSearchCache: options.enableSearchCache !== false,
            cacheExpiration: options.cacheExpiration || 300000 // 5 minutos
        };

        // Cache de búsquedas recientes
        this.searchCache = new Map();

        // Métricas de búsqueda
        this.searchMetrics = {
            totalSearches: 0,
            successfulSearches: 0,
            cacheHits: 0,
            alternativeSearches: 0,
            emptyResults: 0
        };

        // Referencia al sistema de memoria conversacional
        this.conversationMemory = conversationMemory;

        logger.info('🔍 ClientHistorySearchEngine inicializado:', {
            defaultLimit: this.config.defaultHistoryLimit,
            enableAlternatives: this.config.enableAlternativeSearch,
            enableProfile: this.config.enableProfileAnalysis
        });
    }

    /**
   * BÚSQUEDA PRINCIPAL DE HISTORIAL DE CLIENTE
   * Punto de entrada principal para buscar historial completo de un cliente
   */
    async searchClientHistory(clientIdentifier, options = {}) {
        const startTime = Date.now();
        this.searchMetrics.totalSearches++;

        try {
            // 1. NORMALIZAR IDENTIFICADOR DE CLIENTE
            const normalizedClientId =
        this.normalizeClientIdentifier(clientIdentifier);

            // 2. VERIFICAR CACHE
            if (this.config.enableSearchCache) {
                const cached = this.getCachedResult(normalizedClientId, options);
                if (cached) {
                    this.searchMetrics.cacheHits++;
                    return cached;
                }
            }

            // 3. BÚSQUEDA DIRECTA
            const directResults = await this.searchByClientId(
                normalizedClientId,
                options
            );

            // 4. BÚSQUEDA ALTERNATIVA SI NO HAY RESULTADOS
            let allResults = directResults;
            if (directResults.length === 0 && this.config.enableAlternativeSearch) {
                this.searchMetrics.alternativeSearches++;
                allResults = await this.searchByAlternativeIdentifiers(
                    clientIdentifier,
                    options
                );
            }

            // 5. FORMATEAR HISTORIAL DEL CLIENTE
            const clientHistory = this.formatClientHistory(
                allResults,
                normalizedClientId,
                options
            );

            // 6. CACHEAR RESULTADO
            if (this.config.enableSearchCache) {
                this.cacheResult(normalizedClientId, options, clientHistory);
            }

            const duration = Date.now() - startTime;

            if (clientHistory.totalInteractions > 0) {
                this.searchMetrics.successfulSearches++;
            } else {
                this.searchMetrics.emptyResults++;
            }

            logger.debug(
                `🔍 Búsqueda de cliente completada: ${normalizedClientId} (${duration}ms, ${clientHistory.totalInteractions} resultados)`
            );

            return clientHistory;
        } catch (error) {
            logger.error(
                `Error buscando historial de cliente ${clientIdentifier}:`,
                error
            );
            return this.getEmptyClientHistory(clientIdentifier, 'search_error');
        }
    }

    /**
   * NORMALIZACIÓN DE IDENTIFICADOR DE CLIENTE
   * Convierte diferentes formatos de número a formato estándar mexicano
   */
    normalizeClientIdentifier(identifier) {
        if (!identifier) return null;

        // Si es un objeto con propiedad id, usamos ese valor
        if (typeof identifier === 'object' && identifier !== null) {
            if (identifier.id) {
                identifier = identifier.id;
            } else if (identifier.phone) {
                identifier = identifier.phone;
            } else if (identifier.telefono) {
                identifier = identifier.telefono;
            } else if (identifier.number) {
                identifier = identifier.number;
            } else {
                // Si es un objeto sin propiedades reconocidas, lo convertimos a string
                identifier = String(identifier);
            }
        }

        // Asegurarse de que sea string
        let phone = String(identifier).trim();

        // Eliminar todo lo que no sea número
        phone = phone.replace(/\D/g, '');

        // Si empieza con 52 (código de país México), lo quitamos
        if (phone.startsWith('52')) {
            phone = phone.substring(2);
        }

        // Si tiene 10 dígitos, asumimos que es un número mexicano sin lada
        if (phone.length === 10) {
            // Verificar que el primer dígito sea de una lada válida (2-9)
            if (/^[2-9]\d{9}$/.test(phone)) {
                return `52${phone}`; // Agregar prefijo de México
            }
        }

        // Si tiene 12 dígitos y empieza con 52, lo dejamos igual
        if (phone.length === 12 && phone.startsWith('52')) {
            return phone;
        }

        // Si tiene 10 dígitos y no pasó la validación anterior, intentamos con lada 55 (CDMX)
        if (phone.length === 10) {
            return `52${phone}`;
        }

        // Si no cumple con ningún formato conocido, devolvemos el valor original normalizado
        return phone || 'unknown';
    }

    /**
   * BÚSQUEDA ALTERNATIVA POR VARIACIONES
   * Busca usando diferentes variaciones del identificador
   */
    async searchByAlternativeIdentifiers(originalIdentifier, options) {
        const alternatives =
      this.generateAlternativeIdentifiers(originalIdentifier);
        let allResults = [];

        for (const altId of alternatives) {
            try {
                const results = await this.searchByClientId(altId, {
                    ...options,
                    limit: Math.max(20, options.limit || 20) // Límite menor para alternativas
                });

                if (results.length > 0) {
                    allResults = allResults.concat(results);
                    // Si encontramos resultados, podemos parar la búsqueda alternativa
                    break;
                }
            } catch (error) {
                logger.debug(
                    `Búsqueda alternativa falló para ${altId}:`,
                    error.message
                );
            }
        }

        // Remover duplicados basados en timestamp + contenido
        return this.removeDuplicateResults(allResults);
    }

    /**
   * GENERAR IDENTIFICADORES ALTERNATIVOS
   * Crea variaciones del número para búsqueda flexible
   */
    generateAlternativeIdentifiers(identifier) {
        const base = String(identifier).replace(/[^\d]/g, '');
        const alternatives = new Set();

        // Variaciones estándar
        alternatives.add(base);

        // Con código de país
        if (base.length === 10) {
            alternatives.add(`52${base}`);
            alternatives.add(`+52${base}`);
        }

        // Formatos WhatsApp
        alternatives.add(`1${base}`);
        if (base.length === 10) {
            alternatives.add(`152${base}`);
        }

        // Sin código de país si lo tiene
        if (base.startsWith('52') && base.length === 12) {
            alternatives.add(base.substring(2));
        }

        // Con + inicial
        alternatives.add(`+${base}`);

        // Remover identificador original para evitar duplicado
        alternatives.delete(base);

        return Array.from(alternatives);
    }

    /**
   * FORMATEAR HISTORIAL DEL CLIENTE
   * Organiza resultados en formato estructurado para análisis
   */
    formatClientHistory(results, clientId, options = {}) {
        if (!results || results.length === 0) {
            return this.getEmptyClientHistory(clientId, 'no_results');
        }

        // Ordenar por timestamp (más reciente primero)
        const sortedResults = results.sort((a, b) => {
            const timestampA = new Date(a.metadata.timestamp).getTime();
            const timestampB = new Date(b.metadata.timestamp).getTime();
            return timestampB - timestampA;
        });

        // Análisis de perfil si está habilitado
        let clientProfile = null;
        if (this.config.enableProfileAnalysis) {
            clientProfile = this.extractClientProfile(sortedResults);
        }

        // Agrupar por tipo de intención
        const intentBreakdown = this.groupByIntent(sortedResults);

        // Análisis temporal
        const temporalAnalysis = this.analyzeTemporalPatterns(sortedResults);

        return {
            clientId: clientId,
            totalInteractions: results.length,
            lastInteraction: sortedResults[0]?.metadata.timestamp,
            firstInteraction:
        sortedResults[sortedResults.length - 1]?.metadata.timestamp,
            clientProfile,
            intentBreakdown,
            temporalAnalysis,
            recentHistory: sortedResults.slice(0, Math.min(10, sortedResults.length)),
            fullHistory: sortedResults,
            searchMetadata: {
                searchTimestamp: Date.now(),
                searchStrategy: 'client_history_comprehensive',
                filtersApplied: this.getAppliedFilters(options),
                resultSource: 'chromadb_direct'
            }
        };
    }

    /**
   * EXTRAER PERFIL DEL CLIENTE
   * Analiza el historial para crear perfil del cliente
   */
    extractClientProfile(history) {
        const profile = {
            // Preferencias de dispositivos
            preferredDevices: new Set(),
            deviceBrands: new Set(),

            // Servicios comunes
            commonServices: new Set(),
            serviceTypes: new Set(),

            // Información comercial
            priceRanges: [],
            averagePrice: 0,
            priceInteractions: 0,

            // Patrones de comunicación
            communicationPattern: {
                averageMessageLength: 0,
                totalMessages: history.length,
                responseTypes: new Set()
            },

            // Indicadores de lealtad
            loyaltyIndicators: {
                repeatCustomer: history.length > 1,
                totalInteractions: history.length,
                timespan: null,
                satisfactionLevel: 0
            },

            // Metadatos de análisis
            analysisMetadata: {
                profileGenerated: new Date().toISOString(),
                dataPoints: history.length,
                confidenceScore: this.calculateProfileConfidence(history)
            }
        };

        let totalSatisfaction = 0;
        let satisfactionCount = 0;
        let totalMessageLength = 0;

        // Analizar cada interacción
        history.forEach((item) => {
            const metadata = item.metadata;

            // Dispositivos
            if (metadata.device_mentioned) {
                profile.preferredDevices.add(metadata.device_mentioned);
            }
            if (metadata.device_brand) {
                profile.deviceBrands.add(metadata.device_brand);
            }

            // Servicios
            if (metadata.service_mentioned) {
                profile.commonServices.add(metadata.service_mentioned);
            }
            if (metadata.service_type) {
                profile.serviceTypes.add(metadata.service_type);
            }

            // Precios
            if (metadata.price_quoted && !isNaN(metadata.price_quoted)) {
                const price = Number(metadata.price_quoted);
                profile.priceRanges.push(price);
                profile.priceInteractions++;
            }

            // Comunicación
            if (metadata.message_length) {
                totalMessageLength += metadata.message_length;
            }
            if (metadata.response_type) {
                profile.communicationPattern.responseTypes.add(metadata.response_type);
            }

            // Satisfacción
            if (metadata.satisfaction_level) {
                totalSatisfaction += metadata.satisfaction_level;
                satisfactionCount++;
            }
        });

        // Calcular promedios
        if (profile.priceRanges.length > 0) {
            profile.averagePrice =
        profile.priceRanges.reduce((a, b) => a + b, 0) /
        profile.priceRanges.length;
        }

        profile.communicationPattern.averageMessageLength =
      totalMessageLength / history.length;

        if (satisfactionCount > 0) {
            profile.loyaltyIndicators.satisfactionLevel =
        totalSatisfaction / satisfactionCount;
        }

        // Calcular timespan
        if (history.length > 1) {
            const firstTime = new Date(
                history[history.length - 1].metadata.timestamp
            );
            const lastTime = new Date(history[0].metadata.timestamp);
            profile.loyaltyIndicators.timespan = lastTime - firstTime;
        }

        // Convertir Sets a Arrays para serialización
        profile.preferredDevices = Array.from(profile.preferredDevices);
        profile.deviceBrands = Array.from(profile.deviceBrands);
        profile.commonServices = Array.from(profile.commonServices);
        profile.serviceTypes = Array.from(profile.serviceTypes);
        profile.communicationPattern.responseTypes = Array.from(
            profile.communicationPattern.responseTypes
        );

        return profile;
    }

    /**
   * AGRUPAR POR INTENCIÓN
   * Clasifica interacciones por tipo de consulta
   */
    groupByIntent(history) {
        const groups = {};

        history.forEach((item) => {
            const intent = item.metadata.main_intent || 'general_inquiry';
            if (!groups[intent]) {
                groups[intent] = {
                    count: 0,
                    percentage: 0,
                    items: [],
                    lastOccurrence: null,
                    averageConfidence: 0
                };
            }

            groups[intent].count++;
            groups[intent].items.push(item);

            if (
                !groups[intent].lastOccurrence ||
        new Date(item.metadata.timestamp) >
          new Date(groups[intent].lastOccurrence)
            ) {
                groups[intent].lastOccurrence = item.metadata.timestamp;
            }
        });

        // Calcular porcentajes y promedios
        Object.keys(groups).forEach((intent) => {
            const group = groups[intent];
            group.percentage = ((group.count / history.length) * 100).toFixed(1);

            // Calcular confianza promedio
            const confidenceScores = group.items
                .map((item) => item.metadata.confidence_score)
                .filter((score) => score !== undefined && score !== null);

            if (confidenceScores.length > 0) {
                group.averageConfidence =
          confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
            }
        });

        return groups;
    }

    /**
   * ANALIZAR PATRONES TEMPORALES
   * Análisis de tendencias temporales en las interacciones
   */
    analyzeTemporalPatterns(history) {
        const patterns = {
            interactionFrequency: this.calculateInteractionFrequency(history),
            hourlyDistribution: {},
            dailyDistribution: {},
            weeklyTrends: [],
            seasonality: null
        };

        // Analizar distribución por hora
        history.forEach((item) => {
            const date = new Date(item.metadata.timestamp);
            const hour = date.getHours();
            const dayOfWeek = date.getDay();

            patterns.hourlyDistribution[hour] =
        (patterns.hourlyDistribution[hour] || 0) + 1;
            patterns.dailyDistribution[dayOfWeek] =
        (patterns.dailyDistribution[dayOfWeek] || 0) + 1;
        });

        return patterns;
    }

    /**
   * BÚSQUEDA SEMÁNTICA EN HISTORIAL
   * Busca contenido específico dentro del historial del cliente
   */
    async searchInClientHistory(clientId, semanticQuery, options = {}) {
        try {
            // 1. Obtener historial base del cliente
            const clientHistory = await this.searchClientHistory(clientId, {
                limit: options.historyLimit || 100
            });

            if (clientHistory.totalInteractions === 0) {
                return {
                    clientId,
                    query: semanticQuery,
                    results: [],
                    searchMetadata: {
                        totalClientHistory: 0,
                        semanticMatches: 0,
                        searchStrategy: 'no_history_available'
                    }
                };
            }

            // 2. Realizar búsqueda semántica dentro del historial
            const semanticResults =
        await this.conversationMemory.searchConversationMemory(
            semanticQuery,
            clientId,
            {
                limit: options.limit || 10,
                ...options
            }
        );

            // 3. Enriquecer con contexto del perfil del cliente
            const enrichedResults = this.enrichResultsWithClientContext(
                semanticResults,
                clientHistory.clientProfile
            );

            return {
                clientId,
                query: semanticQuery,
                results: enrichedResults,
                clientProfile: clientHistory.clientProfile,
                searchMetadata: {
                    totalClientHistory: clientHistory.totalInteractions,
                    semanticMatches: enrichedResults.length,
                    searchStrategy: 'semantic_within_client_history',
                    profileConfidence:
            clientHistory.clientProfile?.analysisMetadata?.confidenceScore
                }
            };
        } catch (error) {
            logger.error(
                `Error en búsqueda semántica para cliente ${clientId}:`,
                error
            );
            return {
                clientId,
                query: semanticQuery,
                results: [],
                error: error.message,
                searchMetadata: {
                    searchStrategy: 'error_fallback'
                }
            };
        }
    }

    /**
   * MÉTODOS AUXILIARES
   */
    processSearchResults(chromaResults) {
        const processed = [];

        if (chromaResults.documents && chromaResults.documents[0]) {
            for (let i = 0; i < chromaResults.documents[0].length; i++) {
                processed.push({
                    text: chromaResults.documents[0][i],
                    metadata: chromaResults.metadatas[0][i],
                    distance: chromaResults.distances
                        ? chromaResults.distances[0][i]
                        : null,
                    relevance: chromaResults.distances
                        ? 1 - chromaResults.distances[0][i]
                        : null
                });
            }
        }

        return processed;
    }

    removeDuplicateResults(results) {
        const seen = new Set();
        return results.filter((result) => {
            const key = `${result.metadata.timestamp}_${result.text.substring(
                0,
                50
            )}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    calculateInteractionFrequency(history) {
        if (history.length < 2) return 0;

        const timespan =
      new Date(history[0].metadata.timestamp) -
      new Date(history[history.length - 1].metadata.timestamp);
        const days = timespan / (1000 * 60 * 60 * 24);

        return days > 0 ? history.length / days : 0;
    }

    calculateProfileConfidence(history) {
        let confidence = 0.3; // Base confidence

        // Más interacciones = mayor confianza
        confidence += Math.min(0.4, history.length * 0.05);

        // Datos específicos aumentan confianza
        const hasDeviceInfo = history.some((h) => h.metadata.device_mentioned);
        const hasPriceInfo = history.some((h) => h.metadata.price_quoted);
        const hasServiceInfo = history.some((h) => h.metadata.service_mentioned);

        if (hasDeviceInfo) confidence += 0.1;
        if (hasPriceInfo) confidence += 0.1;
        if (hasServiceInfo) confidence += 0.1;

        return Math.min(1.0, confidence);
    }

    enrichResultsWithClientContext(results, clientProfile) {
        if (!clientProfile) return results;

        return results.map((result) => ({
            ...result,
            clientContext: {
                isPreferredDevice: clientProfile.preferredDevices.includes(
                    result.metadata?.device_mentioned
                ),
                isCommonService: clientProfile.commonServices.includes(
                    result.metadata?.service_mentioned
                ),
                profileRelevance: this.calculateProfileRelevance(result, clientProfile)
            }
        }));
    }

    calculateProfileRelevance(result, profile) {
        let relevance = 0;

        if (profile.preferredDevices.includes(result.metadata?.device_mentioned)) {
            relevance += 0.3;
        }
        if (profile.commonServices.includes(result.metadata?.service_mentioned)) {
            relevance += 0.3;
        }
        if (result.metadata?.main_intent in profile.intentBreakdown) {
            relevance += 0.2;
        }

        return relevance;
    }

    getAppliedFilters(options) {
        const filters = [];
        if (options.dateRange) filters.push('date_range');
        if (options.intents) filters.push('intents');
        if (options.serviceTypes) filters.push('service_types');
        if (options.minConfidence) filters.push('min_confidence');
        return filters;
    }

    getEmptyClientHistory(clientId, reason = 'no_results') {
        return {
            clientId,
            totalInteractions: 0,
            lastInteraction: null,
            firstInteraction: null,
            clientProfile: null,
            intentBreakdown: {},
            temporalAnalysis: null,
            recentHistory: [],
            fullHistory: [],
            searchMetadata: {
                searchTimestamp: Date.now(),
                searchStrategy: 'empty_result',
                reason: reason
            }
        };
    }

    /**
   * MÉTODOS DE CACHE
   */
    getCachedResult(clientId, options) {
        if (!this.config.enableSearchCache) return null;

        const cacheKey = this.generateCacheKey(clientId, options);
        const cached = this.searchCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.config.cacheExpiration) {
            return cached.result;
        }

        return null;
    }

    cacheResult(clientId, options, result) {
        if (!this.config.enableSearchCache) return;

        const cacheKey = this.generateCacheKey(clientId, options);
        this.searchCache.set(cacheKey, {
            result,
            timestamp: Date.now()
        });

        // Limpiar cache viejo
        this.cleanExpiredCache();
    }

    generateCacheKey(clientId, options) {
        const keyParts = [clientId];
        if (options.limit) keyParts.push(`limit:${options.limit}`);
        if (options.dateRange)
            keyParts.push(`date:${JSON.stringify(options.dateRange)}`);
        if (options.intents) keyParts.push(`intents:${options.intents.join(',')}`);
        return keyParts.join('|');
    }

    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.config.cacheExpiration) {
                this.searchCache.delete(key);
            }
        }
    }

    /**
   * OBTENER ESTADÍSTICAS
   */
    getSearchStats() {
        const totalAttempts = this.searchMetrics.totalSearches;

        return {
            ...this.searchMetrics,
            successRate:
        totalAttempts > 0
            ? this.searchMetrics.successfulSearches / totalAttempts
            : 0,
            cacheHitRate:
        totalAttempts > 0 ? this.searchMetrics.cacheHits / totalAttempts : 0,
            alternativeSearchRate:
        totalAttempts > 0
            ? this.searchMetrics.alternativeSearches / totalAttempts
            : 0,
            emptyResultRate:
        totalAttempts > 0 ? this.searchMetrics.emptyResults / totalAttempts : 0,
            cacheSize: this.searchCache.size,
            status: 'active'
        };
    }

    /**
   * LIMPIAR CACHE
   */
    clearCache() {
        this.searchCache.clear();
        logger.info('🧹 ClientHistorySearchEngine cache cleared');
    }

    /**
   * RESETEAR MÉTRICAS
   */
    resetMetrics() {
        this.searchMetrics = {
            totalSearches: 0,
            successfulSearches: 0,
            cacheHits: 0,
            alternativeSearches: 0,
            emptyResults: 0
        };

        logger.info('📊 ClientHistorySearchEngine metrics reset');
    }
}

module.exports = {
    ClientHistorySearchEngine
};
