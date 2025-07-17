#!/usr/bin/env node

// src/services/dynamicLimitOptimizer.js
// OPTIMIZADOR DINÁMICO DE LÍMITES - SOLUCIÓN CRÍTICA 5
// Sistema inteligente para límites adaptativos en búsquedas ChromaDB

const logger = require('../utils/logger');

/**
 * DYNAMIC LIMIT OPTIMIZER
 * Optimiza límites de resultados basado en contexto y complejidad de consulta
 * 
 * Funcionalidades:
 * - Detección automática de complejidad de consulta
 * - Límites adaptativos por contexto SalvaCell
 * - Integración con información Markdown actualizada
 * - Performance monitoring y terminación temprana
 * - Fallback automático para casos problemáticos
 */
class DynamicLimitOptimizer {
    constructor(options = {}) {
        this.config = {
            // Límites base y máximos por contexto SalvaCell
            contextLimits: {
                'PRICE_QUERIES': {
                    base: 15,
                    max: 30,
                    description: 'Consultas de precios específicos',
                    qualityThreshold: 0.85,
                    timeoutMs: 2000
                },
                'DEVICE_SEARCH': {
                    base: 20,
                    max: 40,
                    description: 'Búsqueda de dispositivos específicos',
                    qualityThreshold: 0.80,
                    timeoutMs: 2200
                },
                'WARRANTY_LOOKUP': {
                    base: 25,
                    max: 50,
                    description: 'Búsqueda de historial y garantías',
                    qualityThreshold: 0.90,
                    timeoutMs: 2500
                },
                'MULTI_DEVICE': {
                    base: 30,
                    max: 60,
                    description: 'Consultas múltiples dispositivos',
                    qualityThreshold: 0.75,
                    timeoutMs: 2800
                },
                'AVAILABILITY_CHECK': {
                    base: 35,
                    max: 70,
                    description: 'Verificación de disponibilidad catálogo',
                    qualityThreshold: 0.70,
                    timeoutMs: 3000
                },
                'MARKDOWN_CONTEXT': {
                    base: 12,
                    max: 25,
                    description: 'Información temporal y garantías',
                    qualityThreshold: 0.85,
                    timeoutMs: 1800
                },
                'CONVERSATION_MEMORY': {
                    base: 10,
                    max: 20,
                    description: 'Memoria conversacional estándar',
                    qualityThreshold: 0.80,
                    timeoutMs: 2000
                },
                'DEFAULT': {
                    base: 5,
                    max: 15,
                    description: 'Consultas simples por defecto',
                    qualityThreshold: 0.85,
                    timeoutMs: 1500
                }
            },

            // Configuración de SalvaCell específica
            salvaCellConfig: {
                catalogSize: 295,               // Modelos en catálogo
                maxResponseTime: 3000,          // 3 segundos máximo
                qualityPriority: 0.8,           // 80% peso a calidad vs. velocidad
                performanceBuffer: 500          // Buffer de 500ms para procesamiento
            },

            // Configuración de análisis de complejidad
            complexityAnalysis: {
                multiDevicePatterns: [
                    /\b(?:y|e|,)\s*(?:samsung|iphone|motorola|xiaomi|lg|huawei)/gi,
                    /\b(?:ambos|varios|múltiples|todos)\b/gi,
                    /\b(?:familia|hermanos|hijos|pareja)\b/gi
                ],
                priceRangePatterns: [
                    /\b(?:bajo|sobre|entre|desde|hasta|menor|mayor)\s*\$?\d+/gi,
                    /\b(?:económico|barato|caro|presupuesto|rango)\b/gi,
                    /\$\d+\s*(?:a|y|-)\s*\$?\d+/gi
                ],
                availabilityPatterns: [
                    /\b(?:disponible|stock|inventario|hay|tienen|quedan)\b/gi,
                    /\b(?:modelos|opciones|alternativas|variantes)\b/gi
                ],
                timeSpecificPatterns: [
                    /\b(?:anterior|pasado|último|hace|desde|cuando)\b/gi,
                    /\b(?:ayer|semana|mes|año|tiempo)\b/gi
                ],
                comparisonPatterns: [
                    /\b(?:mejor|peor|más|menos|comparar|diferencia|vs|versus)\b/gi,
                    /\b(?:cuál|qué|opciones|alternativas)\b/gi
                ]
            },

            ...options
        };

        // Métricas de optimización
        this.metrics = {
            totalOptimizations: 0,
            contextBreakdown: {},
            performanceImpact: {
                averageTime: 0,
                timeoutCount: 0,
                fallbackCount: 0
            },
            qualityImprovements: {
                expandedResults: 0,
                qualityGains: []
            },
            lastCleanup: Date.now()
        };

        logger.info('🎯 DynamicLimitOptimizer inicializado:', {
            contexts: Object.keys(this.config.contextLimits).length,
            catalogSize: this.config.salvaCellConfig.catalogSize,
            maxResponseTime: this.config.salvaCellConfig.maxResponseTime
        });
    }

    /**
     * OPTIMIZACIÓN PRINCIPAL DE LÍMITES
     * Determina límites óptimos basado en consulta y contexto
     */
    optimizeLimits(query, currentContext = 'DEFAULT', currentFilters = {}) {
        const startTime = Date.now();
        this.metrics.totalOptimizations++;

        try {
            // 1. Analizar complejidad de la consulta
            const complexityAnalysis = this.analyzeQueryComplexity(query);
            
            // 2. Detectar contexto específico si no se proporciona
            const detectedContext = this.detectQueryContext(query, currentFilters) || currentContext;
            
            // 3. Determinar si es consulta multi-dispositivo
            const isMultiDevice = this.isMultiDeviceQuery(query);
            const finalContext = isMultiDevice ? 'MULTI_DEVICE' : detectedContext;
            
            // 4. Calcular límites optimizados
            const optimizedLimits = this.calculateOptimalLimits(
                finalContext, 
                complexityAnalysis, 
                currentFilters
            );

            // 5. Aplicar restricciones de performance
            const safeLimits = this.applySafetyConstraints(optimizedLimits, finalContext);

            // 6. Registrar métricas
            this.recordOptimization(finalContext, complexityAnalysis, safeLimits, Date.now() - startTime);

            logger.debug(`🎯 Límites optimizados: ${query.substring(0, 50)}... → Contexto: ${finalContext}, Base: ${safeLimits.baseLimit}, Max: ${safeLimits.maxLimit}`);

            return {
                baseLimit: safeLimits.baseLimit,
                maxLimit: safeLimits.maxLimit,
                context: finalContext,
                complexity: complexityAnalysis,
                strategy: safeLimits.strategy,
                expectedTime: safeLimits.expectedTime,
                qualityThreshold: safeLimits.qualityThreshold
            };

        } catch (error) {
            logger.error('❌ Error optimizando límites:', error);
            // Fallback a configuración por defecto
            return this.getFallbackLimits(currentContext);
        }
    }

    /**
     * ANÁLISIS DE COMPLEJIDAD DE CONSULTA
     * Evalúa múltiples dimensiones de complejidad
     */
    analyzeQueryComplexity(query) {
        const lowerQuery = query.toLowerCase();
        let complexityScore = 0.1; // Score base
        const indicators = [];

        // Analizar cada patrón de complejidad
        Object.entries(this.config.complexityAnalysis).forEach(([type, patterns]) => {
            let typeMatches = 0;
            
            patterns.forEach(pattern => {
                const matches = lowerQuery.match(pattern);
                if (matches) {
                    typeMatches += matches.length;
                }
            });

            if (typeMatches > 0) {
                indicators.push({
                    type: type.replace('Patterns', ''),
                    matches: typeMatches,
                    weight: this.getComplexityWeight(type)
                });

                // Agregar al score de complejidad
                complexityScore += typeMatches * this.getComplexityWeight(type);
            }
        });

        // Factores adicionales
        const wordCount = query.split(/\s+/).length;
        if (wordCount > 10) complexityScore += 0.1;
        if (wordCount > 20) complexityScore += 0.2;

        // Menciones de marcas múltiples
        const brandMentions = (lowerQuery.match(/\b(?:samsung|iphone|xiaomi|motorola|lg|huawei|oppo|vivo|realme)\b/g) || []).length;
        if (brandMentions > 1) complexityScore += brandMentions * 0.3;

        // Normalizar score
        complexityScore = Math.min(1.0, complexityScore);

        return {
            score: complexityScore,
            level: this.getComplexityLevel(complexityScore),
            indicators,
            wordCount,
            brandMentions,
            analysis: `Consulta ${this.getComplexityLevel(complexityScore)} con ${indicators.length} indicadores de complejidad`
        };
    }

    /**
     * DETECCIÓN DE CONTEXTO DE CONSULTA
     * Identifica el contexto más apropiado para la consulta
     */
    detectQueryContext(query, filters = {}) {
        const lowerQuery = query.toLowerCase();

        // Prioridad de detección por especificidad
        
        // 1. Consultas de garantía y historial (más específicas)
        if (this.containsAny(lowerQuery, ['garantía', 'anterior', 'pasado', 'reparación', 'arreglo', 'historial'])) {
            return 'WARRANTY_LOOKUP';
        }

        // 2. Consultas de precios específicos
        if (this.containsAny(lowerQuery, ['precio', 'costo', 'cuanto', 'vale', '$']) ||
            filters.hasPrice) {
            return 'PRICE_QUERIES';
        }

        // 3. Consultas de disponibilidad
        if (this.containsAny(lowerQuery, ['disponible', 'hay', 'tienen', 'stock', 'inventario', 'quedan'])) {
            return 'AVAILABILITY_CHECK';
        }

        // 4. Información temporal/markdown (más específico)
        if (this.containsAny(lowerQuery, ['tiempo', 'minutos', 'horas', 'toma', 'demora', 'tarda', 'domicilio', '4 pm', 'establecimiento']) &&
            !this.containsAny(lowerQuery, ['garantía', 'anterior', 'reparación'])) {
            return 'MARKDOWN_CONTEXT';
        }

        // 5. Búsquedas de dispositivos específicos
        if (this.containsAny(lowerQuery, ['iphone', 'samsung', 'xiaomi', 'motorola', 'lg', 'huawei']) ||
            filters.device) {
            return 'DEVICE_SEARCH';
        }

        // 6. Por defecto, memoria conversacional
        return 'CONVERSATION_MEMORY';
    }

    /**
     * DETECCIÓN DE CONSULTAS MULTI-DISPOSITIVO
     * Identifica si la consulta involucra múltiples dispositivos
     */
    isMultiDeviceQuery(query) {
        const lowerQuery = query.toLowerCase();
        
        // Contar menciones de marcas
        const brandMatches = (lowerQuery.match(/\b(?:samsung|iphone|xiaomi|motorola|lg|huawei|oppo|vivo|realme)\b/g) || []).length;
        
        // Patrones de múltiples dispositivos
        const multiPatterns = [
            /\b(?:y|e)\s+(?:samsung|iphone|xiaomi|motorola)/gi,
            /\b(?:varios|múltiples|ambos|todos)\b/gi,
            /\b(?:familia|hermanos|pareja)\b/gi,
            /,.*(?:samsung|iphone|xiaomi|motorola)/gi
        ];

        const hasMultiPatterns = multiPatterns.some(pattern => pattern.test(lowerQuery));
        
        return brandMatches > 1 || hasMultiPatterns;
    }

    /**
     * CÁLCULO DE LÍMITES ÓPTIMOS
     * Determina límites basado en contexto y complejidad
     */
    calculateOptimalLimits(context, complexityAnalysis, filters) {
        const contextConfig = this.config.contextLimits[context] || this.config.contextLimits.DEFAULT;
        const { score: complexity } = complexityAnalysis;

        // Calcular límite base ajustado por complejidad
        const complexityMultiplier = 1 + (complexity * 0.8); // Hasta 80% de incremento
        const adjustedBase = Math.round(contextConfig.base * complexityMultiplier);
        const adjustedMax = Math.round(contextConfig.max * complexityMultiplier);

        // Ajustes específicos por filtros
        let finalBase = adjustedBase;
        let finalMax = adjustedMax;

        // Si hay filtros específicos, reducir límites
        if (filters.client_id) {
            finalBase = Math.round(finalBase * 0.7); // Búsqueda específica de cliente
            finalMax = Math.round(finalMax * 0.7);
        }

        // Si es búsqueda por fecha, incrementar para historiales
        if (filters.dateFrom) {
            finalBase = Math.round(finalBase * 1.3);
            finalMax = Math.round(finalMax * 1.3);
        }

        // Aplicar límites absolutos de SalvaCell
        const maxAbsolute = Math.min(100, Math.round(this.config.salvaCellConfig.catalogSize * 0.3)); // Max 30% del catálogo
        finalBase = Math.max(5, Math.min(finalBase, 50)); // Entre 5 y 50
        finalMax = Math.max(finalBase, Math.min(finalMax, maxAbsolute)); // Hasta límite absoluto

        return {
            baseLimit: finalBase,
            maxLimit: finalMax,
            strategy: this.determineSearchStrategy(complexity, context),
            expectedTime: this.estimateSearchTime(finalBase, finalMax, context),
            qualityThreshold: contextConfig.qualityThreshold,
            originalContext: context,
            complexityAdjustment: complexityMultiplier
        };
    }

    /**
     * APLICAR RESTRICCIONES DE SEGURIDAD
     * Asegura que los límites no comprometan performance
     */
    applySafetyConstraints(limits, context) {
        const contextConfig = this.config.contextLimits[context];
        const maxAllowedTime = this.config.salvaCellConfig.maxResponseTime - this.config.salvaCellConfig.performanceBuffer;

        // Si el tiempo estimado excede el límite, reducir límites
        if (limits.expectedTime > maxAllowedTime) {
            const reductionFactor = maxAllowedTime / limits.expectedTime;
            
            limits.baseLimit = Math.max(5, Math.round(limits.baseLimit * reductionFactor));
            limits.maxLimit = Math.max(limits.baseLimit, Math.round(limits.maxLimit * reductionFactor));
            limits.expectedTime = Math.round(limits.expectedTime * reductionFactor);
            limits.strategy = 'performance_constrained';
            
            logger.warn(`⚠️ Límites reducidos por restricciones de performance: ${context}`);
        }

        // Verificar límites mínimos y máximos absolutos
        limits.baseLimit = Math.max(5, Math.min(limits.baseLimit, 50));
        limits.maxLimit = Math.max(limits.baseLimit, Math.min(limits.maxLimit, 100));

        return limits;
    }

    /**
     * DETERMINAR ESTRATEGIA DE BÚSQUEDA
     * Define la estrategia óptima basada en complejidad y contexto
     */
    determineSearchStrategy(complexity, context) {
        if (complexity < 0.3) {
            return 'quick_search';      // Búsqueda rápida para consultas simples
        } else if (complexity < 0.6) {
            return 'balanced_search';   // Balance calidad/velocidad
        } else if (complexity < 0.8) {
            return 'thorough_search';   // Búsqueda exhaustiva
        } else {
            return 'comprehensive_search'; // Máxima cobertura
        }
    }

    /**
     * ESTIMAR TIEMPO DE BÚSQUEDA
     * Calcula tiempo estimado basado en límites y contexto
     */
    estimateSearchTime(baseLimit, maxLimit, context) {
        // Tiempo base por resultado (basado en métricas reales)
        const timePerResult = 15; // 15ms por resultado aproximadamente
        const baseTime = baseLimit * timePerResult;
        const networkLatency = 100; // 100ms latencia de red estimada
        const processingOverhead = 200; // 200ms procesamiento adicional

        // Ajustes por contexto
        const contextMultipliers = {
            'PRICE_QUERIES': 1.1,        // Ligeramente más lento por análisis de precios
            'WARRANTY_LOOKUP': 1.3,      // Más lento por búsqueda histórica
            'MULTI_DEVICE': 1.4,         // Más complejo por múltiples contextos
            'AVAILABILITY_CHECK': 1.2,    // Análisis de disponibilidad
            'DEFAULT': 1.0
        };

        const multiplier = contextMultipliers[context] || 1.0;
        const estimatedTime = (baseTime + networkLatency + processingOverhead) * multiplier;

        return Math.round(estimatedTime);
    }

    /**
     * MÉTODOS AUXILIARES
     */
    getComplexityWeight(type) {
        const weights = {
            'multiDevicePatterns': 0.4,
            'priceRangePatterns': 0.3,
            'availabilityPatterns': 0.2,
            'timeSpecificPatterns': 0.2,
            'comparisonPatterns': 0.25
        };
        return weights[type] || 0.1;
    }

    getComplexityLevel(score) {
        if (score < 0.3) return 'simple';
        if (score < 0.6) return 'moderate';
        if (score < 0.8) return 'complex';
        return 'very_complex';
    }

    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    getFallbackLimits(context) {
        const contextConfig = this.config.contextLimits[context] || this.config.contextLimits.DEFAULT;
        
        this.metrics.performanceImpact.fallbackCount++;
        
        return {
            baseLimit: contextConfig.base,
            maxLimit: contextConfig.max,
            context: context,
            complexity: { score: 0.5, level: 'moderate', indicators: [] },
            strategy: 'fallback',
            expectedTime: contextConfig.timeoutMs || 2000,
            qualityThreshold: contextConfig.qualityThreshold
        };
    }

    /**
     * REGISTRO DE MÉTRICAS
     */
    recordOptimization(context, complexity, limits, duration) {
        if (!this.metrics.contextBreakdown[context]) {
            this.metrics.contextBreakdown[context] = {
                count: 0,
                avgComplexity: 0,
                avgBaseLimit: 0,
                avgMaxLimit: 0,
                avgDuration: 0
            };
        }

        const contextMetrics = this.metrics.contextBreakdown[context];
        contextMetrics.count++;
        
        // Actualizar promedios
        contextMetrics.avgComplexity = this.updateAverage(contextMetrics.avgComplexity, complexity.score, contextMetrics.count);
        contextMetrics.avgBaseLimit = this.updateAverage(contextMetrics.avgBaseLimit, limits.baseLimit, contextMetrics.count);
        contextMetrics.avgMaxLimit = this.updateAverage(contextMetrics.avgMaxLimit, limits.maxLimit, contextMetrics.count);
        contextMetrics.avgDuration = this.updateAverage(contextMetrics.avgDuration, duration, contextMetrics.count);

        // Métricas globales de performance
        this.metrics.performanceImpact.averageTime = this.updateAverage(
            this.metrics.performanceImpact.averageTime, 
            duration, 
            this.metrics.totalOptimizations
        );
    }

    updateAverage(currentAvg, newValue, count) {
        return (currentAvg * (count - 1) + newValue) / count;
    }

    /**
     * MÉTODOS PÚBLICOS DE MONITOREO
     */
    getOptimizationStats() {
        return {
            totalOptimizations: this.metrics.totalOptimizations,
            contextBreakdown: this.metrics.contextBreakdown,
            performanceImpact: this.metrics.performanceImpact,
            qualityImprovements: this.metrics.qualityImprovements,
            averageOptimizationTime: this.metrics.performanceImpact.averageTime,
            systemHealth: this.calculateSystemHealth()
        };
    }

    getContextHealth(context) {
        const contextMetrics = this.metrics.contextBreakdown[context];
        const contextConfig = this.config.contextLimits[context];
        
        if (!contextMetrics || !contextConfig) {
            return { context, health: 0, status: 'no_data' };
        }

        const avgEfficiency = contextMetrics.avgDuration < contextConfig.timeoutMs ? 1.0 : contextConfig.timeoutMs / contextMetrics.avgDuration;
        const complexityHandling = Math.min(1.0, contextMetrics.avgComplexity * 2); // Score por manejo de complejidad
        
        const health = (avgEfficiency * 0.6) + (complexityHandling * 0.4);
        
        return {
            context,
            health: Math.round(health * 100) / 100,
            status: health > 0.8 ? 'excellent' : health > 0.6 ? 'good' : health > 0.4 ? 'fair' : 'poor',
            metrics: contextMetrics,
            config: contextConfig
        };
    }

    calculateSystemHealth() {
        const fallbackRate = this.metrics.performanceImpact.fallbackCount / this.metrics.totalOptimizations;
        const timeoutRate = this.metrics.performanceImpact.timeoutCount / this.metrics.totalOptimizations;
        const avgTime = this.metrics.performanceImpact.averageTime;
        const maxAllowedTime = this.config.salvaCellConfig.maxResponseTime;

        const reliabilityScore = Math.max(0, 1 - (fallbackRate * 2) - (timeoutRate * 3));
        const performanceScore = Math.max(0, 1 - (avgTime / maxAllowedTime));
        
        const overallHealth = (reliabilityScore * 0.7) + (performanceScore * 0.3);
        
        return {
            overall: Math.round(overallHealth * 100) / 100,
            reliability: Math.round(reliabilityScore * 100) / 100,
            performance: Math.round(performanceScore * 100) / 100,
            fallbackRate: Math.round(fallbackRate * 100) / 100,
            timeoutRate: Math.round(timeoutRate * 100) / 100
        };
    }

    /**
     * MANTENIMIENTO
     */
    performMaintenance() {
        const now = Date.now();
        
        // Limpiar métricas muy antiguas
        if (now - this.metrics.lastCleanup > 86400000) { // 24 horas
            this.resetOldMetrics();
        }
        
        this.metrics.lastCleanup = now;
        logger.info('🧹 Mantenimiento de DynamicLimitOptimizer completado');
    }

    resetOldMetrics() {
        // Mantener solo promedios, limpiar contadores
        Object.keys(this.metrics.contextBreakdown).forEach(context => {
            this.metrics.contextBreakdown[context].count = 0;
        });
        
        this.metrics.totalOptimizations = 0;
        this.metrics.performanceImpact.fallbackCount = 0;
        this.metrics.performanceImpact.timeoutCount = 0;
        
        logger.info('📊 Métricas de optimización reseteadas');
    }
}

module.exports = {
    DynamicLimitOptimizer
};