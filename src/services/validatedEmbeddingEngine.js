#!/usr/bin/env node

// src/services/validatedEmbeddingEngine.js
// VALIDACIÓN DE DIMENSIONES DE EMBEDDINGS - SOLUCIÓN CRÍTICA 3
// Sistema robusto para garantizar confiabilidad de embeddings en SalvaCell

const logger = require('../utils/logger');
const { EnhancedEmbeddingEngine } = require('./embeddingEngine');

/**
 * VALIDATED EMBEDDING ENGINE
 * Extiende EnhancedEmbeddingEngine con validación robusta de dimensiones
 * 
 * Funcionalidades:
 * - Validación automática de dimensiones antes de almacenamiento
 * - Detección de valores fuera de rango o corruptos
 * - Sistema de auto-recuperación para fallos
 * - Métricas de confiabilidad en tiempo real
 * - Integración específica con información Markdown SalvaCell
 */
class ValidatedEmbeddingEngine extends EnhancedEmbeddingEngine {
    constructor(baseEngine, options = {}) {
        super(baseEngine, options.enablePrefixes !== false);
        
        // Configuración específica para SalvaCell
        this.config = {
            // Dimensiones esperadas para Nomic Embed Text
            expectedDimensions: 768,
            
            // Rangos de valores permitidos por contexto
            valueRanges: {
                CONVERSATION_EMBEDDINGS: { min: -2.0, max: 2.0 },
                PRICE_QUERY_EMBEDDINGS: { min: -1.5, max: 1.5 },
                DEVICE_CLASSIFICATION_EMBEDDINGS: { min: -1.2, max: 1.2 },
                MARKDOWN_CONTEXT_EMBEDDINGS: { min: -1.0, max: 1.0 }
            },
            
            // Umbrales de calidad por tipo de embedding
            qualityThresholds: {
                CONVERSATION_EMBEDDINGS: 0.8,
                PRICE_QUERY_EMBEDDINGS: 0.9,
                DEVICE_CLASSIFICATION_EMBEDDINGS: 0.95,
                MARKDOWN_CONTEXT_EMBEDDINGS: 0.85
            },
            
            // Configuración específica SalvaCell
            salvaCellContext: {
                businessHours: { start: 11, end: 21 }, // 11 AM - 9 PM
                avgServiceTime: 52, // minutos
                warrantyPeriods: { original: 30, generic: 15 }, // días
                supportedServices: ['pantalla', 'batería', 'cámara', 'puerto'],
                priceRange: { min: 800, max: 4000 } // MXN
            },
            
            ...options
        };
        
        // Sistema de métricas y monitoreo
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            averageValidationTime: 0,
            lastValidationTimestamp: null
        };
        
        // Cache de validaciones para optimización
        this.validationCache = new Map();
        this.dimensionsInitialized = false;
        
        // Sistema de alertas
        this.alertThresholds = {
            criticalFailureRate: 0.05, // 5% fallos -> crítico
            warningFailureRate: 0.02,  // 2% fallos -> advertencia
            recoveryFailureRate: 0.15  // 15% recovery fallos -> crítico
        };
        
        logger.info('🛡️ ValidatedEmbeddingEngine inicializado:', {
            expectedDimensions: this.config.expectedDimensions,
            validationEnabled: true,
            salvaCellIntegration: true
        });
    }

    /**
     * INICIALIZAR DIMENSIONES ESPERADAS
     * Detecta automáticamente las dimensiones del modelo actual
     */
    async initializeDimensions() {
        try {
            if (this.dimensionsInitialized) return true;
            
            logger.info('🔍 Inicializando detección de dimensiones...');
            
            // Generar embedding de prueba para detectar dimensiones
            const testEmbedding = await super.embedDocument('test embedding initialization');
            
            if (!testEmbedding || !Array.isArray(testEmbedding)) {
                throw new Error('Failed to generate test embedding for dimension detection');
            }
            
            this.config.expectedDimensions = testEmbedding.length;
            this.dimensionsInitialized = true;
            
            logger.info(`✅ Dimensiones detectadas: ${this.config.expectedDimensions}D`);
            return true;
            
        } catch (error) {
            logger.error('❌ Error inicializando dimensiones:', error);
            return false;
        }
    }

    /**
     * EMBED DOCUMENT CON VALIDACIÓN
     * Genera embedding de documento con validación completa
     */
    async embedDocument(text, context = 'CONVERSATION_EMBEDDINGS') {
        const startTime = Date.now();
        
        try {
            // Asegurar que las dimensiones están inicializadas
            await this.ensureDimensionsInitialized();
            
            // Generar embedding usando el motor base
            const embedding = await super.embedDocument(text);
            
            // Validar embedding
            const validationResult = await this.validateEmbedding(embedding, context, text);
            
            if (!validationResult.isValid) {
                logger.warn(`⚠️ Embedding inválido para documento: ${validationResult.errors.join(', ')}`);
                
                // Intentar recuperación
                const recoveredEmbedding = await this.attemptRecovery(text, validationResult, context);
                
                if (recoveredEmbedding) {
                    this.recordValidation(true, Date.now() - startTime, context, 'recovered');
                    return recoveredEmbedding;
                } else {
                    this.recordValidation(false, Date.now() - startTime, context, 'failed');
                    throw new Error(`Failed to generate valid embedding: ${validationResult.errors.join(', ')}`);
                }
            }
            
            this.recordValidation(true, Date.now() - startTime, context, 'success');
            return embedding;
            
        } catch (error) {
            this.recordValidation(false, Date.now() - startTime, context, 'error');
            logger.error('❌ Error en embedDocument con validación:', error);
            throw error;
        }
    }

    /**
     * EMBED QUERY CON VALIDACIÓN
     * Genera embedding de consulta con validación específica
     */
    async embedQuery(text, context = 'PRICE_QUERY_EMBEDDINGS') {
        const startTime = Date.now();
        
        try {
            await this.ensureDimensionsInitialized();
            
            // Detectar contexto específico de SalvaCell
            const detectedContext = this.detectSalvaCellContext(text);
            const finalContext = detectedContext || context;
            
            const embedding = await super.embedQuery(text);
            const validationResult = await this.validateEmbedding(embedding, finalContext, text);
            
            if (!validationResult.isValid) {
                logger.warn(`⚠️ Embedding de consulta inválido: ${validationResult.errors.join(', ')}`);
                
                const recoveredEmbedding = await this.attemptRecovery(text, validationResult, finalContext);
                
                if (recoveredEmbedding) {
                    this.recordValidation(true, Date.now() - startTime, finalContext, 'recovered');
                    return recoveredEmbedding;
                } else {
                    this.recordValidation(false, Date.now() - startTime, finalContext, 'failed');
                    throw new Error(`Failed to generate valid query embedding: ${validationResult.errors.join(', ')}`);
                }
            }
            
            this.recordValidation(true, Date.now() - startTime, finalContext, 'success');
            return embedding;
            
        } catch (error) {
            this.recordValidation(false, Date.now() - startTime, context, 'error');
            logger.error('❌ Error en embedQuery con validación:', error);
            throw error;
        }
    }

    /**
     * EMBED DOCUMENTS CON VALIDACIÓN EN LOTE
     * Procesa múltiples documentos con validación optimizada
     */
    async embedDocuments(texts, context = 'CONVERSATION_EMBEDDINGS') {
        const startTime = Date.now();
        
        try {
            await this.ensureDimensionsInitialized();
            
            const embeddings = await super.embedDocuments(texts);
            const validatedEmbeddings = [];
            const recoveryNeeded = [];
            
            // Validar cada embedding
            for (let i = 0; i < embeddings.length; i++) {
                const validationResult = await this.validateEmbedding(embeddings[i], context, texts[i]);
                
                if (validationResult.isValid) {
                    validatedEmbeddings.push(embeddings[i]);
                } else {
                    recoveryNeeded.push({ index: i, text: texts[i], validationResult });
                    validatedEmbeddings.push(null); // Placeholder
                }
            }
            
            // Recuperar embeddings inválidos
            if (recoveryNeeded.length > 0) {
                logger.warn(`🔄 Recuperando ${recoveryNeeded.length} embeddings inválidos...`);
                
                for (const recovery of recoveryNeeded) {
                    try {
                        const recoveredEmbedding = await this.attemptRecovery(
                            recovery.text, recovery.validationResult, context
                        );
                        
                        if (recoveredEmbedding) {
                            validatedEmbeddings[recovery.index] = recoveredEmbedding;
                        } else {
                            throw new Error(`Failed to recover embedding for: ${recovery.text.substring(0, 50)}...`);
                        }
                    } catch (recoveryError) {
                        logger.error(`❌ Fallo en recuperación para índice ${recovery.index}:`, recoveryError);
                        throw recoveryError;
                    }
                }
            }
            
            const totalTime = Date.now() - startTime;
            this.recordValidation(true, totalTime, context, 'batch_success', texts.length);
            
            logger.info(`✅ Validación en lote completada: ${texts.length} embeddings, ${recoveryNeeded.length} recuperados`);
            return validatedEmbeddings;
            
        } catch (error) {
            this.recordValidation(false, Date.now() - startTime, context, 'batch_error', texts.length);
            logger.error('❌ Error en embedDocuments con validación:', error);
            throw error;
        }
    }

    /**
     * VALIDACIÓN PRINCIPAL DE EMBEDDINGS
     * Valida dimensiones, tipos de datos y rangos de valores
     */
    async validateEmbedding(embedding, context = 'CONVERSATION_EMBEDDINGS', originalText = '') {
        const validationResult = {
            isValid: true,
            actualDimensions: embedding?.length || 0,
            expectedDimensions: this.config.expectedDimensions,
            context,
            originalText: originalText.substring(0, 100),
            errors: [],
            warnings: [],
            quality: 0,
            timestamp: new Date().toISOString()
        };
        
        try {
            // 1. Validación básica de existencia
            if (!embedding || !Array.isArray(embedding)) {
                validationResult.isValid = false;
                validationResult.errors.push('Embedding is null, undefined, or not an array');
                return validationResult;
            }
            
            // 2. Validación de dimensiones
            if (embedding.length !== this.config.expectedDimensions) {
                validationResult.isValid = false;
                validationResult.errors.push(
                    `Dimension mismatch: got ${embedding.length}, expected ${this.config.expectedDimensions}`
                );
            }
            
            // 3. Validación de tipos numéricos
            const invalidValues = embedding.filter((val, idx) => 
                typeof val !== 'number' || isNaN(val) || !isFinite(val)
            );
            
            if (invalidValues.length > 0) {
                validationResult.isValid = false;
                validationResult.errors.push(
                    `Contains ${invalidValues.length} invalid numeric values`
                );
            }
            
            // 4. Validación de rangos específicos por contexto
            const valueRange = this.config.valueRanges[context] || this.config.valueRanges.CONVERSATION_EMBEDDINGS;
            const outOfRangeValues = embedding.filter(val => val < valueRange.min || val > valueRange.max);
            
            if (outOfRangeValues.length > 0) {
                const percentage = (outOfRangeValues.length / embedding.length * 100).toFixed(1);
                
                if (percentage > 10) { // Más del 10% fuera de rango es crítico
                    validationResult.isValid = false;
                    validationResult.errors.push(
                        `${percentage}% values out of range [${valueRange.min}, ${valueRange.max}]`
                    );
                } else {
                    validationResult.warnings.push(
                        `${percentage}% values out of expected range (minor)`
                    );
                }
            }
            
            // 5. Validación de calidad específica SalvaCell
            const qualityScore = this.calculateEmbeddingQuality(embedding, context, originalText);
            validationResult.quality = qualityScore;
            
            const qualityThreshold = this.config.qualityThresholds[context] || 0.8;
            if (qualityScore < qualityThreshold) {
                validationResult.warnings.push(
                    `Quality score ${qualityScore.toFixed(3)} below threshold ${qualityThreshold}`
                );
            }
            
            // 6. Validación específica para contexto Markdown
            if (context === 'MARKDOWN_CONTEXT_EMBEDDINGS') {
                const markdownValidation = this.validateMarkdownEmbedding(embedding, originalText);
                if (!markdownValidation.isValid) {
                    validationResult.warnings.push(...markdownValidation.warnings);
                }
            }
            
            return validationResult;
            
        } catch (error) {
            validationResult.isValid = false;
            validationResult.errors.push(`Validation error: ${error.message}`);
            logger.error('❌ Error en validación de embedding:', error);
            return validationResult;
        }
    }

    /**
     * DETECTAR CONTEXTO ESPECÍFICO DE SALVACELL
     * Analiza el texto para determinar el contexto más apropiado
     */
    detectSalvaCellContext(text) {
        const lowerText = text.toLowerCase();
        
        // Contexto de precios y servicios
        if (this.containsAny(lowerText, ['precio', 'costo', 'cuánto', '$', 'pesos'])) {
            return 'PRICE_QUERY_EMBEDDINGS';
        }
        
        // Contexto de dispositivos
        if (this.containsAny(lowerText, ['iphone', 'samsung', 'xiaomi', 'motorola', 'pantalla', 'batería'])) {
            return 'DEVICE_CLASSIFICATION_EMBEDDINGS';
        }
        
        // Contexto de información temporal/garantías (Markdown)
        if (this.containsAny(lowerText, ['tiempo', 'garantía', 'domicilio', 'establecimiento', '4 pm', 'minutos'])) {
            return 'MARKDOWN_CONTEXT_EMBEDDINGS';
        }
        
        // Por defecto, conversación general
        return 'CONVERSATION_EMBEDDINGS';
    }

    /**
     * VALIDACIÓN ESPECÍFICA PARA EMBEDDINGS DE MARKDOWN
     * Valida embeddings relacionados con información de SalvaCell
     */
    validateMarkdownEmbedding(embedding, originalText) {
        const result = {
            isValid: true,
            warnings: []
        };
        
        const lowerText = originalText.toLowerCase();
        
        // Verificar que embeddings de tiempo sean consistentes
        if (this.containsAny(lowerText, ['tiempo', 'minutos', 'horas', 'domicilio'])) {
            const timeConsistency = this.checkTimeConsistency(embedding);
            if (timeConsistency < 0.8) {
                result.warnings.push(`Time-related embedding consistency low: ${timeConsistency.toFixed(3)}`);
            }
        }
        
        // Verificar embeddings de garantía
        if (this.containsAny(lowerText, ['garantía', 'original', 'genérica'])) {
            const warrantyConsistency = this.checkWarrantyConsistency(embedding);
            if (warrantyConsistency < 0.8) {
                result.warnings.push(`Warranty-related embedding consistency low: ${warrantyConsistency.toFixed(3)}`);
            }
        }
        
        // Verificar embeddings de precios en rango mexicano
        if (this.containsAny(lowerText, ['peso', 'mxn', '$']) && 
            this.containsAny(lowerText, ['800', '1000', '1500', '2000', '3000', '4000'])) {
            const priceConsistency = this.checkPriceConsistency(embedding);
            if (priceConsistency < 0.8) {
                result.warnings.push(`Price-related embedding consistency low: ${priceConsistency.toFixed(3)}`);
            }
        }
        
        return result;
    }

    /**
     * CALCULAR CALIDAD DE EMBEDDING
     * Métrica personalizada para SalvaCell
     */
    calculateEmbeddingQuality(embedding, context, originalText) {
        let qualityScore = 1.0;
        
        // Factor 1: Distribución de valores (0.3 peso)
        const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
        const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
        const stdDev = Math.sqrt(variance);
        
        // Penalizar distribuciones muy concentradas o muy dispersas
        if (stdDev < 0.1 || stdDev > 1.0) {
            qualityScore -= 0.2;
        }
        
        // Factor 2: Consistencia contextual (0.4 peso)
        const contextConsistency = this.checkContextConsistency(embedding, context);
        qualityScore = qualityScore * 0.6 + contextConsistency * 0.4;
        
        // Factor 3: Relevancia para SalvaCell (0.3 peso)
        const salvaCellRelevance = this.checkSalvaCellRelevance(embedding, originalText);
        qualityScore = qualityScore * 0.7 + salvaCellRelevance * 0.3;
        
        return Math.max(0, Math.min(1, qualityScore));
    }

    /**
     * SISTEMA DE AUTO-RECUPERACIÓN
     * Intenta regenerar embeddings válidos
     */
    async attemptRecovery(originalText, validationResult, context) {
        this.validationStats.recoveryAttempts++;
        
        try {
            logger.info(`🔄 Intentando recuperación para contexto: ${context}`);
            
            // Estrategia 1: Regenerar con motor base (sin prefijos)
            if (validationResult.errors.some(err => err.includes('Dimension mismatch'))) {
                logger.info('📐 Intentando recuperación por dimensiones...');
                
                // Re-inicializar dimensiones
                this.dimensionsInitialized = false;
                await this.initializeDimensions();
                
                // Regenerar embedding
                const recoveredEmbedding = await super.embedDocument(originalText);
                const revalidation = await this.validateEmbedding(recoveredEmbedding, context, originalText);
                
                if (revalidation.isValid) {
                    this.validationStats.successfulRecoveries++;
                    logger.info('✅ Recuperación exitosa por re-dimensionamiento');
                    return recoveredEmbedding;
                }
            }
            
            // Estrategia 2: Limpiar texto y regenerar
            if (validationResult.errors.some(err => err.includes('invalid values'))) {
                logger.info('🧹 Intentando recuperación por limpieza de texto...');
                
                const cleanedText = this.cleanTextForEmbedding(originalText);
                const recoveredEmbedding = await super.embedDocument(cleanedText);
                const revalidation = await this.validateEmbedding(recoveredEmbedding, context, cleanedText);
                
                if (revalidation.isValid) {
                    this.validationStats.successfulRecoveries++;
                    logger.info('✅ Recuperación exitosa por limpieza de texto');
                    return recoveredEmbedding;
                }
            }
            
            // Estrategia 3: Usar contexto fallback
            logger.info('🔄 Intentando recuperación con contexto fallback...');
            const fallbackEmbedding = await super.embedDocument(`[Contexto SalvaCell] ${originalText}`);
            const finalValidation = await this.validateEmbedding(fallbackEmbedding, 'CONVERSATION_EMBEDDINGS', originalText);
            
            if (finalValidation.isValid) {
                this.validationStats.successfulRecoveries++;
                logger.info('✅ Recuperación exitosa con contexto fallback');
                return fallbackEmbedding;
            }
            
            logger.warn('❌ Todas las estrategias de recuperación fallaron');
            return null;
            
        } catch (error) {
            logger.error('❌ Error en proceso de recuperación:', error);
            return null;
        }
    }

    /**
     * MÉTODOS AUXILIARES PARA VALIDACIÓN
     */

    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    checkTimeConsistency(embedding) {
        // Implementar lógica específica para validar consistencia temporal
        const avgValue = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
        return Math.abs(avgValue) < 0.5 ? 0.9 : 0.6; // Simplificado
    }

    checkWarrantyConsistency(embedding) {
        // Implementar lógica específica para validar consistencia de garantías
        const variance = this.calculateVariance(embedding);
        return variance < 0.3 ? 0.9 : 0.7; // Simplificado
    }

    checkPriceConsistency(embedding) {
        // Implementar lógica específica para validar consistencia de precios
        const range = Math.max(...embedding) - Math.min(...embedding);
        return range < 2.0 ? 0.9 : 0.6; // Simplificado
    }

    checkContextConsistency(embedding, context) {
        // Validar que el embedding sea consistente con el contexto
        return 0.85; // Implementación simplificada
    }

    checkSalvaCellRelevance(embedding, originalText) {
        // Verificar relevancia específica para el dominio de SalvaCell
        const salvaCellKeywords = ['salvacell', 'reparación', 'pantalla', 'batería', 'celular', 'móvil'];
        const hasRelevantKeywords = this.containsAny(originalText.toLowerCase(), salvaCellKeywords);
        return hasRelevantKeywords ? 0.9 : 0.7;
    }

    calculateVariance(array) {
        const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
        return array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    }

    cleanTextForEmbedding(text) {
        return text
            .replace(/[^\w\s\-\.\,\!\?]/g, '') // Remover caracteres especiales
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim()
            .substring(0, 1000); // Limitar longitud
    }

    /**
     * SISTEMA DE MÉTRICAS Y MONITOREO
     */

    recordValidation(success, timeMs, context, result, batchSize = 1) {
        this.validationStats.totalValidations += batchSize;
        this.validationStats.lastValidationTimestamp = new Date().toISOString();
        
        if (success) {
            this.validationStats.successfulValidations += batchSize;
        } else {
            this.validationStats.failedValidations += batchSize;
        }
        
        // Actualizar tiempo promedio
        const totalTime = this.validationStats.averageValidationTime * (this.validationStats.totalValidations - batchSize) + timeMs;
        this.validationStats.averageValidationTime = totalTime / this.validationStats.totalValidations;
        
        // Verificar umbrales de alerta
        this.checkAlertThresholds();
        
        logger.debug(`📊 Validación registrada: ${context} - ${result} (${timeMs}ms)`);
    }

    checkAlertThresholds() {
        const failureRate = this.validationStats.failedValidations / this.validationStats.totalValidations;
        const recoveryRate = this.validationStats.recoveryAttempts > 0 ? 
            this.validationStats.successfulRecoveries / this.validationStats.recoveryAttempts : 1;
        
        if (failureRate > this.alertThresholds.criticalFailureRate) {
            this.triggerAlert('CRITICAL', `High failure rate: ${(failureRate * 100).toFixed(1)}%`);
        } else if (failureRate > this.alertThresholds.warningFailureRate) {
            this.triggerAlert('WARNING', `Elevated failure rate: ${(failureRate * 100).toFixed(1)}%`);
        }
        
        if (recoveryRate < (1 - this.alertThresholds.recoveryFailureRate)) {
            this.triggerAlert('CRITICAL', `Low recovery success rate: ${(recoveryRate * 100).toFixed(1)}%`);
        }
    }

    triggerAlert(level, message) {
        const alert = {
            level,
            message,
            timestamp: new Date().toISOString(),
            stats: { ...this.validationStats }
        };
        
        logger.warn(`🚨 ALERTA ${level}: ${message}`, alert);
        
        // Aquí se podría integrar con sistema de notificaciones
        // (email, Slack, webhook, etc.)
    }

    /**
     * ASEGURAR INICIALIZACIÓN
     */
    async ensureDimensionsInitialized() {
        if (!this.dimensionsInitialized) {
            const success = await this.initializeDimensions();
            if (!success) {
                throw new Error('Failed to initialize embedding dimensions');
            }
        }
    }

    /**
     * OBTENER ESTADÍSTICAS DE VALIDACIÓN
     */
    getValidationStats() {
        const failureRate = this.validationStats.totalValidations > 0 ? 
            this.validationStats.failedValidations / this.validationStats.totalValidations : 0;
        
        const recoveryRate = this.validationStats.recoveryAttempts > 0 ? 
            this.validationStats.successfulRecoveries / this.validationStats.recoveryAttempts : 0;
        
        return {
            ...this.validationStats,
            failureRate: failureRate,
            recoveryRate: recoveryRate,
            status: failureRate < this.alertThresholds.warningFailureRate ? 'healthy' : 'degraded',
            expectedDimensions: this.config.expectedDimensions,
            dimensionsInitialized: this.dimensionsInitialized
        };
    }

    /**
     * RESETEAR ESTADÍSTICAS
     */
    resetStats() {
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            averageValidationTime: 0,
            lastValidationTimestamp: null
        };
        
        logger.info('📊 Estadísticas de validación reseteadas');
    }
}

module.exports = {
    ValidatedEmbeddingEngine
};