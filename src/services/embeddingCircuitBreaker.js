#!/usr/bin/env node

// src/services/embeddingCircuitBreaker.js
// CIRCUIT BREAKER PARA EMBEDDING SERVICE - SOLUCIÓN CRÍTICA 3
// Sistema de protección y auto-recuperación para servicios de embeddings

const logger = require('../utils/logger');

/**
 * EMBEDDING CIRCUIT BREAKER
 * Implementa patrón Circuit Breaker específico para servicios de embeddings
 * 
 * Funcionalidades:
 * - Protección contra fallos en cascada
 * - Auto-recuperación inteligente
 * - Métricas de salud del servicio
 * - Fallback strategies específicas para SalvaCell
 * - Integración con ValidatedEmbeddingEngine
 */
class EmbeddingCircuitBreaker {
    constructor(options = {}) {
        this.config = {
            // Umbrales de fallo
            failureThreshold: options.failureThreshold || 5,
            successThreshold: options.successThreshold || 3,
            
            // Tiempos de recuperación
            recoveryTime: options.recoveryTime || 30000, // 30 segundos
            degradedModeTime: options.degradedModeTime || 10000, // 10 segundos
            
            // Configuración específica SalvaCell
            salvaCellContext: {
                criticalOperations: ['price_query', 'device_classification'],
                businessHours: { start: 11, end: 21 },
                peakHours: { start: 18, end: 20 },
                maxDegradationTime: 120000 // 2 minutos máximo en modo degradado
            },
            
            // Configuración de métricas
            metricsWindow: options.metricsWindow || 300000, // 5 minutos
            
            ...options
        };
        
        // Estados del Circuit Breaker
        this.states = {
            CLOSED: 'CLOSED',       // Normal operation
            OPEN: 'OPEN',           // Circuit is open, failing fast
            HALF_OPEN: 'HALF_OPEN', // Testing if service is back
            DEGRADED: 'DEGRADED'    // Limited functionality mode
        };
        
        this.currentState = this.states.CLOSED;
        
        // Contadores y métricas
        this.metrics = {
            failureCount: 0,
            successCount: 0,
            totalRequests: 0,
            lastFailureTime: null,
            lastSuccessTime: null,
            stateChangeTime: Date.now(),
            degradedModeStartTime: null
        };
        
        // Historial de operaciones para análisis
        this.operationHistory = [];
        this.maxHistorySize = 1000;
        
        // Estrategias de fallback
        this.fallbackStrategies = new Map();
        this.initializeFallbackStrategies();
        
        logger.info('🛡️ EmbeddingCircuitBreaker inicializado:', {
            state: this.currentState,
            failureThreshold: this.config.failureThreshold,
            recoveryTime: this.config.recoveryTime
        });
    }

    /**
     * EJECUTAR OPERACIÓN PROTEGIDA
     * Método principal para ejecutar operaciones con protección de circuit breaker
     */
    async execute(operation, context = {}) {
        const operationId = this.generateOperationId();
        const startTime = Date.now();
        
        try {
            // Registrar intento de operación
            this.recordOperationAttempt(operationId, context);
            
            // Verificar estado del circuit breaker
            const canExecute = this.canExecuteOperation(context);
            
            if (!canExecute.allowed) {
                return await this.handleBlockedOperation(canExecute.reason, context, operationId);
            }
            
            // Ejecutar la operación
            const result = await this.executeWithTimeout(operation, context);
            
            // Registrar éxito
            this.recordSuccess(operationId, Date.now() - startTime, context);
            
            return result;
            
        } catch (error) {
            // Registrar fallo
            this.recordFailure(operationId, Date.now() - startTime, error, context);
            
            // Intentar fallback si está disponible
            if (this.hasFallbackStrategy(context)) {
                logger.info(`🔄 Ejecutando estrategia de fallback para: ${context.type || 'unknown'}`);
                return await this.executeFallback(context, error);
            }
            
            throw error;
        }
    }

    /**
     * VERIFICAR SI SE PUEDE EJECUTAR OPERACIÓN
     */
    canExecuteOperation(context) {
        const currentTime = Date.now();
        
        switch (this.currentState) {
            case this.states.CLOSED:
                return { allowed: true, reason: null };
                
            case this.states.OPEN:
                if (this.shouldAttemptRecovery(currentTime)) {
                    this.transitionToHalfOpen();
                    return { allowed: true, reason: null };
                }
                return { 
                    allowed: false, 
                    reason: 'Circuit breaker is OPEN - service unavailable' 
                };
                
            case this.states.HALF_OPEN:
                // Permitir operaciones de prueba limitadas
                if (this.metrics.successCount < this.config.successThreshold) {
                    return { allowed: true, reason: null };
                }
                return { 
                    allowed: false, 
                    reason: 'Half-open state - testing in progress' 
                };
                
            case this.states.DEGRADED:
                return this.canExecuteInDegradedMode(context);
                
            default:
                return { 
                    allowed: false, 
                    reason: 'Unknown circuit breaker state' 
                };
        }
    }

    /**
     * VERIFICAR SI SE PUEDE EJECUTAR EN MODO DEGRADADO
     */
    canExecuteInDegradedMode(context) {
        const currentTime = Date.now();
        
        // Verificar si hemos estado en modo degradado por mucho tiempo
        if (this.metrics.degradedModeStartTime && 
            currentTime - this.metrics.degradedModeStartTime > this.config.salvaCellContext.maxDegradationTime) {
            this.transitionToOpen();
            return { 
                allowed: false, 
                reason: 'Degraded mode timeout - transitioning to OPEN' 
            };
        }
        
        // Permitir solo operaciones críticas en modo degradado
        const isCritical = this.isOperationCritical(context);
        const isBusinessHours = this.isBusinessHours(currentTime);
        
        if (isCritical || !isBusinessHours) {
            return { allowed: true, reason: null };
        }
        
        return { 
            allowed: false, 
            reason: 'Non-critical operation blocked in degraded mode' 
        };
    }

    /**
     * EJECUTAR CON TIMEOUT
     */
    async executeWithTimeout(operation, context) {
        const timeout = this.getTimeoutForContext(context);
        
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Operation timeout after ${timeout}ms`));
            }, timeout);
            
            operation()
                .then(result => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    }

    /**
     * MANEJAR OPERACIÓN BLOQUEADA
     */
    async handleBlockedOperation(reason, context, operationId) {
        logger.warn(`🚫 Operación bloqueada: ${reason}`, { context, operationId });
        
        // Intentar fallback inmediato si está disponible
        if (this.hasFallbackStrategy(context)) {
            logger.info('🔄 Ejecutando fallback para operación bloqueada');
            return await this.executeFallback(context, new Error(reason));
        }
        
        // Si no hay fallback, lanzar error específico
        const error = new Error(`Circuit breaker blocked operation: ${reason}`);
        error.circuitBreakerReason = reason;
        error.circuitBreakerState = this.currentState;
        throw error;
    }

    /**
     * REGISTRAR ÉXITO
     */
    recordSuccess(operationId, duration, context) {
        this.metrics.successCount++;
        this.metrics.totalRequests++;
        this.metrics.lastSuccessTime = Date.now();
        
        this.addToHistory({
            id: operationId,
            type: 'success',
            duration,
            context,
            timestamp: Date.now(),
            state: this.currentState
        });
        
        // Verificar transiciones de estado
        this.checkStateTransitionsOnSuccess();
        
        logger.debug(`✅ Operación exitosa: ${operationId} (${duration}ms)`);
    }

    /**
     * REGISTRAR FALLO
     */
    recordFailure(operationId, duration, error, context) {
        this.metrics.failureCount++;
        this.metrics.totalRequests++;
        this.metrics.lastFailureTime = Date.now();
        
        this.addToHistory({
            id: operationId,
            type: 'failure',
            duration,
            error: error.message,
            context,
            timestamp: Date.now(),
            state: this.currentState
        });
        
        // Verificar transiciones de estado
        this.checkStateTransitionsOnFailure();
        
        logger.warn(`❌ Operación fallida: ${operationId} (${duration}ms) - ${error.message}`);
    }

    /**
     * VERIFICAR TRANSICIONES EN ÉXITO
     */
    checkStateTransitionsOnSuccess() {
        switch (this.currentState) {
            case this.states.HALF_OPEN:
                if (this.metrics.successCount >= this.config.successThreshold) {
                    this.transitionToClosed();
                }
                break;
                
            case this.states.DEGRADED:
                // Considerar salir del modo degradado después de varios éxitos
                if (this.metrics.successCount >= this.config.successThreshold * 2) {
                    this.transitionToClosed();
                }
                break;
        }
    }

    /**
     * VERIFICAR TRANSICIONES EN FALLO
     */
    checkStateTransitionsOnFailure() {
        switch (this.currentState) {
            case this.states.CLOSED:
                if (this.metrics.failureCount >= this.config.failureThreshold) {
                    // Decidir entre DEGRADED o OPEN basado en contexto
                    if (this.shouldUseDegradedMode()) {
                        this.transitionToDegraded();
                    } else {
                        this.transitionToOpen();
                    }
                }
                break;
                
            case this.states.HALF_OPEN:
                this.transitionToOpen();
                break;
                
            case this.states.DEGRADED:
                // En modo degradado, fallos adicionales llevan a OPEN
                if (this.metrics.failureCount >= this.config.failureThreshold * 2) {
                    this.transitionToOpen();
                }
                break;
        }
    }

    /**
     * TRANSICIONES DE ESTADO
     */
    transitionToClosed() {
        logger.info(`🔄 Circuit Breaker: ${this.currentState} → CLOSED`);
        this.currentState = this.states.CLOSED;
        this.resetMetrics();
        this.metrics.stateChangeTime = Date.now();
    }

    transitionToOpen() {
        logger.warn(`🔄 Circuit Breaker: ${this.currentState} → OPEN`);
        this.currentState = this.states.OPEN;
        this.metrics.stateChangeTime = Date.now();
        this.metrics.degradedModeStartTime = null;
        
        // Notificar estado crítico
        this.notifyStateChange('OPEN', 'Service is unavailable - circuit breaker opened');
    }

    transitionToHalfOpen() {
        logger.info(`🔄 Circuit Breaker: ${this.currentState} → HALF_OPEN`);
        this.currentState = this.states.HALF_OPEN;
        this.metrics.successCount = 0;
        this.metrics.stateChangeTime = Date.now();
        this.metrics.degradedModeStartTime = null;
    }

    transitionToDegraded() {
        logger.warn(`🔄 Circuit Breaker: ${this.currentState} → DEGRADED`);
        this.currentState = this.states.DEGRADED;
        this.metrics.stateChangeTime = Date.now();
        this.metrics.degradedModeStartTime = Date.now();
        
        // Notificar modo degradado
        this.notifyStateChange('DEGRADED', 'Service operating in degraded mode');
    }

    /**
     * MÉTODOS DE VERIFICACIÓN
     */
    shouldAttemptRecovery(currentTime) {
        return currentTime - this.metrics.stateChangeTime >= this.config.recoveryTime;
    }

    shouldUseDegradedMode() {
        const currentTime = Date.now();
        const isBusinessHours = this.isBusinessHours(currentTime);
        const isPeakHours = this.isPeakHours(currentTime);
        
        // Usar modo degradado durante horarios de negocio para mantener servicio mínimo
        return isBusinessHours || isPeakHours;
    }

    isOperationCritical(context) {
        const operationType = context.type || context.operationType || '';
        return this.config.salvaCellContext.criticalOperations.includes(operationType);
    }

    isBusinessHours(timestamp = Date.now()) {
        const date = new Date(timestamp);
        const hour = date.getHours();
        const { start, end } = this.config.salvaCellContext.businessHours;
        
        return hour >= start && hour <= end;
    }

    isPeakHours(timestamp = Date.now()) {
        const date = new Date(timestamp);
        const hour = date.getHours();
        const { start, end } = this.config.salvaCellContext.peakHours;
        
        return hour >= start && hour <= end;
    }

    /**
     * SISTEMA DE FALLBACK
     */
    initializeFallbackStrategies() {
        // Fallback para consultas de precios
        this.fallbackStrategies.set('price_query', async (context, error) => {
            logger.info('💰 Ejecutando fallback para consulta de precios');
            
            // Retornar información básica de precios desde cache o configuración
            return {
                type: 'fallback_response',
                message: 'Información básica de precios disponible. Para detalles específicos, contacta directamente.',
                fallback: true,
                originalError: error.message
            };
        });
        
        // Fallback para clasificación de dispositivos
        this.fallbackStrategies.set('device_classification', async (context, error) => {
            logger.info('📱 Ejecutando fallback para clasificación de dispositivos');
            
            return {
                type: 'fallback_response',
                message: 'Clasificación básica disponible. Especifica marca y modelo para mejor asistencia.',
                fallback: true,
                originalError: error.message
            };
        });
        
        // Fallback general para conversaciones
        this.fallbackStrategies.set('conversation', async (context, error) => {
            logger.info('💬 Ejecutando fallback para conversación general');
            
            return {
                type: 'fallback_response',
                message: 'Servicio temporalmente limitado. Tu consulta ha sido registrada.',
                fallback: true,
                originalError: error.message
            };
        });
    }

    hasFallbackStrategy(context) {
        const operationType = context.type || context.operationType || 'conversation';
        return this.fallbackStrategies.has(operationType);
    }

    async executeFallback(context, error) {
        const operationType = context.type || context.operationType || 'conversation';
        const fallbackStrategy = this.fallbackStrategies.get(operationType);
        
        if (!fallbackStrategy) {
            throw new Error(`No fallback strategy available for: ${operationType}`);
        }
        
        try {
            const result = await fallbackStrategy(context, error);
            
            // Registrar uso de fallback
            this.addToHistory({
                id: this.generateOperationId(),
                type: 'fallback',
                context,
                timestamp: Date.now(),
                state: this.currentState,
                fallbackType: operationType
            });
            
            return result;
            
        } catch (fallbackError) {
            logger.error('❌ Fallback strategy failed:', fallbackError);
            throw fallbackError;
        }
    }

    /**
     * MÉTODOS AUXILIARES
     */
    getTimeoutForContext(context) {
        const operationType = context.type || 'default';
        
        const timeouts = {
            'price_query': 5000,
            'device_classification': 3000,
            'conversation': 7000,
            'markdown_context': 4000,
            'default': 6000
        };
        
        return timeouts[operationType] || timeouts.default;
    }

    generateOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    recordOperationAttempt(operationId, context) {
        logger.debug(`🔄 Iniciando operación: ${operationId}`, { context, state: this.currentState });
    }

    addToHistory(entry) {
        this.operationHistory.push(entry);
        
        // Mantener tamaño del historial
        if (this.operationHistory.length > this.maxHistorySize) {
            this.operationHistory.shift();
        }
    }

    resetMetrics() {
        this.metrics.failureCount = 0;
        this.metrics.successCount = 0;
        // No resetear totalRequests para mantener estadísticas históricas
    }

    notifyStateChange(newState, message) {
        const notification = {
            circuitBreaker: 'EmbeddingService',
            previousState: this.currentState,
            newState,
            message,
            timestamp: new Date().toISOString(),
            metrics: { ...this.metrics }
        };
        
        logger.warn(`🚨 Circuit Breaker State Change: ${notification.previousState} → ${newState}`, notification);
        
        // Aquí se podría integrar con sistema de alertas
        // (email, Slack, webhook, etc.)
    }

    /**
     * MÉTODOS PÚBLICOS PARA MONITOREO
     */
    getStatus() {
        const currentTime = Date.now();
        const recentOperations = this.operationHistory.filter(
            op => currentTime - op.timestamp < this.config.metricsWindow
        );
        
        const recentSuccesses = recentOperations.filter(op => op.type === 'success').length;
        const recentFailures = recentOperations.filter(op => op.type === 'failure').length;
        const recentFallbacks = recentOperations.filter(op => op.type === 'fallback').length;
        
        return {
            state: this.currentState,
            metrics: {
                ...this.metrics,
                recentSuccesses,
                recentFailures,
                recentFallbacks,
                recentSuccessRate: recentOperations.length > 0 ? recentSuccesses / recentOperations.length : 0,
                timeInCurrentState: currentTime - this.metrics.stateChangeTime
            },
            config: {
                failureThreshold: this.config.failureThreshold,
                recoveryTime: this.config.recoveryTime,
                isBusinessHours: this.isBusinessHours(currentTime),
                isPeakHours: this.isPeakHours(currentTime)
            },
            health: this.calculateHealthScore()
        };
    }

    calculateHealthScore() {
        const recentWindow = Date.now() - 300000; // últimos 5 minutos
        const recentOps = this.operationHistory.filter(op => op.timestamp >= recentWindow);
        
        if (recentOps.length === 0) return 1.0;
        
        const successRate = recentOps.filter(op => op.type === 'success').length / recentOps.length;
        const stateScore = {
            [this.states.CLOSED]: 1.0,
            [this.states.DEGRADED]: 0.6,
            [this.states.HALF_OPEN]: 0.4,
            [this.states.OPEN]: 0.0
        }[this.currentState];
        
        return (successRate * 0.7) + (stateScore * 0.3);
    }

    getOperationHistory(limit = 100) {
        return this.operationHistory.slice(-limit);
    }

    reset() {
        this.currentState = this.states.CLOSED;
        this.resetMetrics();
        this.operationHistory = [];
        this.metrics.stateChangeTime = Date.now();
        this.metrics.degradedModeStartTime = null;
        
        logger.info('🔄 Circuit Breaker reset to initial state');
    }
}

module.exports = {
    EmbeddingCircuitBreaker
};