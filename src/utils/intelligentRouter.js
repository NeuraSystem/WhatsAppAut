// src/utils/intelligentRouter.js

const QwenLocalClient = require('./qwenLocal');
const { interpretQuery: claudeInterpretQuery } = require('./claude');
const { contextCache } = require('./cache');
const logger = require('./logger');

/**
 * Router inteligente que decide entre LLM local (Qwen) y remoto (Claude)
 */
class IntelligentRouter {
    constructor() {
        this.qwenClient = new QwenLocalClient();
        this.metrics = {
            totalRequests: 0,
            localRequests: 0,
            remoteRequests: 0,
            failovers: 0,
            averageLatency: {
                local: 0,
                remote: 0
            }
        };

        // Configuración de decisión (ajustada para WSL overhead)
        this.config = {
            // Umbrales para usar local vs remoto
            maxLocalLatency: 20000, // 20 segundos máximo para local (WSL overhead)
            complexityThreshold: 0.3, // Umbral más bajo - favorece Claude
            confidenceThreshold: 0.9, // Confianza más alta requerida para local

            // Tipos de consulta que van directo a local (limitados debido a WSL)
            localPreferredIntentions: ['saludo_simple', 'agradecimiento_simple'],

            // Tipos que van directo a Claude (mayoría debido a WSL overhead)
            remotePreferredIntentions: [
                'consulta_precio',
                'consulta_disponibilidad',
                'consulta_ubicacion',
                'consulta_compleja',
                'consulta_emocional',
                'consulta_tecnica_avanzada',
                'consulta_reparacion',
                'queja_servicio',
                'otro'
            ]
        };
    }

    /**
   * Procesa una consulta eligiendo el mejor LLM.
   * @param {string} userQuery - Consulta del usuario.
   * @param {Object} context - Contexto conversacional.
   * @returns {Promise<Object>} Respuesta procesada.
   */
    async processQuery(userQuery, context) {
        const startTime = Date.now();
        this.metrics.totalRequests++;

        try {
            // 1. Análisis inicial para decisión de routing
            const routingDecision = await this.analyzeRouting(userQuery, context);

            logger.info(
                `Routing decision for "${userQuery.substring(0, 50)}...": ${routingDecision.useLocal ? 'LOCAL' : 'REMOTE'}`,
                {
                    reason: routingDecision.reason,
                    confidence: routingDecision.confidence
                }
            );

            let result;

            if (routingDecision.useLocal) {
                // Intentar con Qwen local primero
                result = await this.processWithLocal(
                    userQuery,
                    context,
                    routingDecision
                );

                // Fallback a Claude si local falla o es de mala calidad
                if (result.shouldFallbackToRemote) {
                    logger.info('Fallback to remote after local processing');
                    result = await this.processWithRemote(
                        userQuery,
                        context,
                        'local_fallback'
                    );
                    this.metrics.failovers++;
                }
            } else {
                // Usar Claude remoto directamente
                result = await this.processWithRemote(
                    userQuery,
                    context,
                    routingDecision.reason
                );
            }

            // Actualizar métricas
            const totalLatency = Date.now() - startTime;
            this.updateMetrics(result.source, totalLatency);

            return {
                ...result,
                totalLatency,
                routingDecision
            };
        } catch (error) {
            logger.error('Error in intelligent router:', error);

            // Fallback de emergencia a Claude
            try {
                const fallbackResult = await this.processWithRemote(
                    userQuery,
                    context,
                    'emergency_fallback'
                );
                this.metrics.failovers++;
                return {
                    ...fallbackResult,
                    totalLatency: Date.now() - startTime,
                    hadError: true
                };
            } catch (fallbackError) {
                logger.error('Emergency fallback also failed:', fallbackError);

                // Última respuesta de emergencia
                return {
                    respuesta_completa:
            '¡Ups! Algo no salió como esperaba. Ya estoy trabajando para solucionarlo. Por favor, intenta de nuevo en un momento. 😊',
                    intencion_principal: 'error',
                    source: 'emergency',
                    totalLatency: Date.now() - startTime,
                    hadError: true
                };
            }
        }
    }

    /**
   * Analiza la consulta para decidir qué LLM usar.
   * @param {string} userQuery - Consulta del usuario.
   * @param {Object} context - Contexto conversacional.
   * @returns {Promise<Object>} Decisión de routing.
   */
    async analyzeRouting(userQuery, context) {
    // Verificar disponibilidad de Qwen local
        const isLocalAvailable = await this.qwenClient.checkHealth();

        if (!isLocalAvailable) {
            return {
                useLocal: false,
                reason: 'local_unavailable',
                confidence: 1.0
            };
        }

        // Análisis rápido de complejidad
        const complexity = this.analyzeComplexity(userQuery, context);

        // Análisis de tipo de consulta
        const intentionAnalysis = this.analyzeIntention(userQuery);

        // Análisis de contexto del cliente
        const contextAnalysis = this.analyzeContext(context);

        // Algoritmo de decisión
        let useLocal = true;
        let reason = 'default_local';
        let confidence = 0.5;

        // Reglas de decisión (conservadoras para WSL)
        if (intentionAnalysis.isRemotePreferred) {
            useLocal = false;
            reason = 'intention_requires_remote';
            confidence = 0.9;
        } else if (complexity.score > this.config.complexityThreshold) {
            useLocal = false;
            reason = 'query_too_complex';
            confidence = 0.8;
        } else if (intentionAnalysis.isLocalPreferred && complexity.score < 0.1) {
            useLocal = true;
            reason = 'simple_local_query';
            confidence = 0.8;
        } else {
            // Por defecto usar Claude debido a latencia WSL
            useLocal = false;
            reason = 'default_remote_due_to_wsl_overhead';
            confidence = 0.7;
        }

        return {
            useLocal,
            reason,
            confidence,
            complexity: complexity.score,
            intention: intentionAnalysis.detected
        };
    }

    /**
   * Analiza la complejidad de una consulta.
   * @param {string} userQuery - Consulta del usuario.
   * @param {Object} context - Contexto.
   * @returns {Object} Análisis de complejidad.
   */
    analyzeComplexity(userQuery, context) {
        let score = 0;
        const factors = [];

        // Longitud de la consulta
        if (userQuery.length > 100) {
            score += 0.2;
            factors.push('long_query');
        }

        // Múltiples preguntas
        const questionCount = (userQuery.match(/\?/g) || []).length;
        if (questionCount > 1) {
            score += 0.3;
            factors.push('multiple_questions');
        }

        // Palabras complejas/técnicas
        const complexWords = [
            'comparar',
            'diferencia',
            'recomendacion',
            'opinion',
            'mejor',
            'peor',
            'problema',
            'error',
            'falla',
            'no funciona',
            'se descompuso',
            'calidad',
            'garantia',
            'durabilidad',
            'original',
            'generico'
        ];

        const foundComplexWords = complexWords.filter((word) =>
            userQuery.toLowerCase().includes(word)
        );

        if (foundComplexWords.length > 0) {
            score += foundComplexWords.length * 0.15;
            factors.push('complex_vocabulary');
        }

        // Consultas emocionales
        const emotionalWords = [
            'urgente',
            'rapido',
            'ayuda',
            'problema',
            'molesto',
            'frustrado',
            'enojado',
            'preocupado',
            'favor',
            'por favor'
        ];

        const foundEmotionalWords = emotionalWords.filter((word) =>
            userQuery.toLowerCase().includes(word)
        );

        if (foundEmotionalWords.length > 0) {
            score += 0.4;
            factors.push('emotional_content');
        }

        // Contexto del cliente aumenta complejidad
        if (context.esClienteRecurrente && context.satisfaccionPromedio < 6) {
            score += 0.2;
            factors.push('unsatisfied_recurring_client');
        }

        return {
            score: Math.min(score, 1.0), // Máximo 1.0
            factors
        };
    }

    /**
   * Analiza la intención de la consulta.
   * @param {string} userQuery - Consulta del usuario.
   * @returns {Object} Análisis de intención.
   */
    analyzeIntention(userQuery) {
        const lowerQuery = userQuery.toLowerCase();

        // Intenciones que van bien con local
        const localIndicators = [
            'precio',
            'cuanto',
            'costo',
            'vale',
            'ubicacion',
            'donde',
            'direccion',
            'hola',
            'buenas',
            'saludo',
            'gracias',
            'thank'
        ];

        // Intenciones que necesitan Claude
        const remoteIndicators = [
            'recomendacion',
            'recomienda',
            'mejor',
            'opinion',
            'problema',
            'falla',
            'error',
            'no funciona',
            'comparar',
            'diferencia',
            'vs',
            'queja',
            'molesto',
            'mal servicio'
        ];

        const localMatches = localIndicators.filter((indicator) =>
            lowerQuery.includes(indicator)
        ).length;

        const remoteMatches = remoteIndicators.filter((indicator) =>
            lowerQuery.includes(indicator)
        ).length;

        let detected = 'neutral';
        let isLocalPreferred = false;
        let isRemotePreferred = false;

        if (localMatches > remoteMatches && localMatches > 0) {
            detected = 'local_friendly';
            isLocalPreferred = true;
        } else if (remoteMatches > localMatches && remoteMatches > 0) {
            detected = 'complex_remote';
            isRemotePreferred = true;
        }

        return {
            detected,
            isLocalPreferred,
            isRemotePreferred,
            localMatches,
            remoteMatches
        };
    }

    /**
   * Analiza el contexto del cliente.
   * @param {Object} context - Contexto conversacional.
   * @returns {Object} Análisis de contexto.
   */
    analyzeContext(context) {
        return {
            isFirstTime: context.esNuevo,
            hasLowSatisfaction: context.satisfaccionPromedio < 6,
            isRecurrent: context.esClienteRecurrente,
            totalInteractions: context.totalConsultas || 0,
            preferredTone: context.tonoPreferido,
            timeOfDay: context.franjaTiempo
        };
    }

    /**
   * Procesa consulta con Qwen local.
   * @param {string} userQuery - Consulta del usuario.
   * @param {Object} context - Contexto conversacional.
   * @param {Object} routingInfo - Información de routing.
   * @returns {Promise<Object>} Resultado del procesamiento.
   */
    async processWithLocal(userQuery, context, routingInfo) {
        const startTime = Date.now();
        this.metrics.localRequests++;

        try {
            // Obtener contexto optimizado
            const optimizedContext = contextCache.getOptimizedClientContext(
                context.clientId || 'unknown',
                context
            );

            // Obtener productos relevantes
            const relevantProducts = contextCache.getRelevantProducts(userQuery, 20);

            // Extraer información de la consulta
            const extractedInfo = await this.qwenClient.extractQueryInfo(
                userQuery,
                optimizedContext
            );

            // Buscar productos si es necesario
            let productInfo = null;
            if (
                extractedInfo.necesita_busqueda_bd ||
        (extractedInfo.marca && extractedInfo.tipo_reparacion)
            ) {
                productInfo = this.findProductInRelevant(
                    relevantProducts,
                    extractedInfo.marca,
                    extractedInfo.tipo_reparacion
                );
            }

            // Generar respuesta conversacional
            const response = await this.qwenClient.generateConversationalResponse(
                userQuery,
                optimizedContext,
                productInfo
            );

            const latency = Date.now() - startTime;

            // Evaluar calidad de la respuesta
            const qualityCheck = this.evaluateResponseQuality(
                response,
                extractedInfo,
                latency
            );

            return {
                respuesta_completa: response.respuesta_completa,
                intencion_principal: extractedInfo.intencion,
                modelo_celular: extractedInfo.marca,
                tipo_reparacion: extractedInfo.tipo_reparacion,
                nombre_cliente: extractedInfo.nombre_cliente,
                necesita_busqueda_bd: Boolean(productInfo),
                debe_presentarse_ia:
          optimizedContext.esNuevo && !optimizedContext.yaSePresentoIA,
                confianza_respuesta: qualityCheck.confidence,
                source: 'qwen_local',
                latency,
                shouldFallbackToRemote: qualityCheck.shouldFallback,
                extractedInfo,
                usedProducts: productInfo ? [productInfo] : []
            };
        } catch (error) {
            logger.error('Error processing with Qwen local:', error);

            return {
                source: 'qwen_local',
                latency: Date.now() - startTime,
                shouldFallbackToRemote: true,
                error: error.message
            };
        }
    }

    /**
   * Procesa consulta con Claude remoto.
   * @param {string} userQuery - Consulta del usuario.
   * @param {Object} context - Contexto conversacional.
   * @param {string} reason - Razón para usar remoto.
   * @returns {Promise<Object>} Resultado del procesamiento.
   */
    async processWithRemote(userQuery, context, reason) {
        const startTime = Date.now();
        this.metrics.remoteRequests++;

        try {
            const result = await claudeInterpretQuery(userQuery, context);
            const latency = Date.now() - startTime;

            return {
                ...result,
                source: 'claude_remote',
                latency,
                reason,
                shouldFallbackToRemote: false
            };
        } catch (error) {
            logger.error('Error processing with Claude remote:', error);
            throw error;
        }
    }

    /**
   * Busca un producto en la lista de productos relevantes.
   * @param {Array} relevantProducts - Productos relevantes.
   * @param {string} brand - Marca buscada.
   * @param {string} repairType - Tipo de reparación.
   * @returns {Object|null} Producto encontrado.
   */
    findProductInRelevant(relevantProducts, brand, repairType) {
        if (!relevantProducts || relevantProducts.length === 0) {
            return null;
        }

        // Buscar coincidencia exacta primero
        let found = relevantProducts.find(
            (product) =>
                product.keywords.includes(brand?.toLowerCase()) &&
        product.tipo.includes(repairType?.toLowerCase())
        );

        // Buscar solo por marca si no hay coincidencia exacta
        if (!found && brand) {
            found = relevantProducts.find((product) =>
                product.keywords.includes(brand.toLowerCase())
            );
        }

        // Buscar solo por tipo de reparación
        if (!found && repairType) {
            found = relevantProducts.find((product) =>
                product.tipo.includes(repairType.toLowerCase())
            );
        }

        // Retornar el primer producto relevante si no hay coincidencias específicas
        if (!found && relevantProducts.length > 0) {
            found = relevantProducts[0];
        }

        return found;
    }

    /**
   * Evalúa la calidad de una respuesta local.
   * @param {Object} response - Respuesta generada.
   * @param {Object} extractedInfo - Información extraída.
   * @param {number} latency - Latencia de la respuesta.
   * @returns {Object} Evaluación de calidad.
   */
    evaluateResponseQuality(response, extractedInfo, latency) {
        let confidence = 0.8; // Base confidence
        let shouldFallback = false;
        const issues = [];

        // Verificar latencia
        if (latency > this.config.maxLocalLatency) {
            confidence -= 0.3;
            issues.push('high_latency');
            shouldFallback = true;
        }

        // Verificar longitud de respuesta
        const responseLength = response.respuesta_completa?.length || 0;
        if (responseLength < 20) {
            confidence -= 0.4;
            issues.push('too_short');
            shouldFallback = true;
        } else if (responseLength > 500) {
            confidence -= 0.2;
            issues.push('too_long');
        }

        // Verificar si la respuesta parece truncada o incompleta
        if (
            response.respuesta_completa?.endsWith('...') ||
      response.respuesta_completa?.includes('[INCOMPLETE]')
        ) {
            confidence -= 0.5;
            issues.push('incomplete');
            shouldFallback = true;
        }

        // Verificar uso de fallback en extracción
        if (extractedInfo._fallback) {
            confidence -= 0.2;
            issues.push('extraction_fallback');
        }

        return {
            confidence: Math.max(confidence, 0),
            shouldFallback,
            issues
        };
    }

    /**
   * Actualiza métricas de rendimiento.
   * @param {string} source - Fuente utilizada (local/remote).
   * @param {number} latency - Latencia de la respuesta.
   */
    updateMetrics(source, latency) {
        if (source === 'qwen_local') {
            const currentAvg = this.metrics.averageLatency.local;
            const count = this.metrics.localRequests;
            this.metrics.averageLatency.local =
        (currentAvg * (count - 1) + latency) / count;
        } else if (source === 'claude_remote') {
            const currentAvg = this.metrics.averageLatency.remote;
            const count = this.metrics.remoteRequests;
            this.metrics.averageLatency.remote =
        (currentAvg * (count - 1) + latency) / count;
        }
    }

    /**
   * Obtiene métricas de rendimiento del router.
   * @returns {Object} Métricas detalladas.
   */
    getMetrics() {
        const localPercentage =
      this.metrics.totalRequests > 0
          ? (this.metrics.localRequests / this.metrics.totalRequests) * 100
          : 0;

        const failoverRate =
      this.metrics.totalRequests > 0
          ? (this.metrics.failovers / this.metrics.totalRequests) * 100
          : 0;

        return {
            ...this.metrics,
            localUsagePercentage: Math.round(localPercentage),
            failoverRate: Math.round(failoverRate * 100) / 100,
            isLocalHealthy: this.qwenClient.isAvailable
        };
    }
}

module.exports = IntelligentRouter;
