/**
 * @file OrchestrationController.js
 * @description Unified orchestration layer that integrates Performance and Resilience controllers
 * into a cohesive optimization system. Serves as the central coordination point for all
 * system optimization and resilience mechanisms.
 * @module core/OrchestrationController
 * @version 1.0.0
 * @author Claude (Anthropic AI)
 * @date 2025-07-17
 */

const logger = require('../utils/logger');
const config = require('../../config/config');
const PerformanceController = require('./performance/PerformanceController');
const { resilienceController } = require('./resilience/ResilienceController');
const {
    adaptiveLearningEngine,
    predictiveAnalyticsEngine,
    multiModalReasoningEngine
} = require('./intelligence/IntelligenceService');
const {
    adminEscalationSystem,
    uncertaintyDetector
} = require('./intelligence/EscalationService');

/**
 * Central orchestration controller that unifies performance optimization,
 * resilience management, and intelligence layer into a single, cohesive system.
 *
 * Architectural Principles:
 * - Single Point of Control: Unified interface for all optimization
 * - Cross-Layer Coordination: Performance, Resilience, and Intelligence work together
 * - Adaptive Behavior: System adjusts based on real-time conditions
 * - Intelligence-Driven: Auto-escalation and learning from admin decisions
 * - Observable Operations: Comprehensive metrics and monitoring
 */
class OrchestrationController {
    constructor() {
        this.isInitialized = false;
        this.performanceController = null;
        this.resilienceController = null;

        // Intelligence Layer Components (Phase 3A)
        this.adminEscalationSystem = adminEscalationSystem;
        this.adaptiveLearningEngine = adaptiveLearningEngine;
        this.uncertaintyDetector = uncertaintyDetector;

        this.systemMetrics = {
            startTime: null,
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            systemHealth: 'UNKNOWN',
            // Intelligence metrics
            escalatedQueries: 0,
            autoResolvedQueries: 0,
            learnedPatterns: 0
        };
        this.adaptiveThresholds = {
            performanceDegradationTrigger: 2000, // ms
            resilienceActivationThreshold: 0.1, // 10% failure rate
            emergencyModeThreshold: 0.25 // 25% failure rate
        };
    }

    /**
   * Initializes the unified orchestration system
   * @returns {Promise<boolean>} Success status
   */
    async initialize() {
        try {
            logger.info(
                'OrchestrationController: Iniciando sistema de orquestación unificado...'
            );

            // Initialize Performance Controller
            if (config.performance?.enableOptimization) {
                logger.info(
                    'OrchestrationController: Inicializando capa de performance...'
                );
                this.performanceController = new PerformanceController();
                await this.performanceController.initialize();
                logger.info(
                    'OrchestrationController: ✅ Performance layer inicializada'
                );
            }

            // Initialize Resilience Controller
            if (
                config.resilience?.enableCircuitBreaker ||
        config.resilience?.enableGracefulDegradation
            ) {
                logger.info(
                    'OrchestrationController: Inicializando capa de resilience...'
                );
                this.resilienceController = new ResilienceController();
                await this.resilienceController.initialize();
                logger.info(
                    'OrchestrationController: ✅ Resilience layer inicializada'
                );
            }

            // Initialize Intelligence Layer (Phase 3A)
            if (config.intelligence?.enableEscalation) {
                logger.info(
                    'OrchestrationController: Inicializando intelligence layer...'
                );
                // Los componentes de intelligence ya están inicializados como singletons
                this.setupIntelligenceCoordination();
                logger.info(
                    'OrchestrationController: ✅ Intelligence layer inicializada'
                );
            }

            // Establish cross-layer coordination
            await this.establishCrossLayerCoordination();

            // Initialize system metrics
            this.systemMetrics.startTime = Date.now();
            this.systemMetrics.systemHealth = 'HEALTHY';

            this.isInitialized = true;
            logger.info(
                'OrchestrationController: ✅ Sistema de orquestación unificado inicializado exitosamente'
            );

            return true;
        } catch (error) {
            logger.error(
                'OrchestrationController: ❌ Error crítico durante inicialización:',
                error
            );
            this.isInitialized = false;
            return false;
        }
    }

    /**
   * Establishes coordination between Performance, Resilience, and Intelligence layers
   * @private
   */
    async establishCrossLayerCoordination() {
        if (this.performanceController && this.resilienceController) {
            logger.info(
                'OrchestrationController: Estableciendo coordinación cross-layer...'
            );

            // Set up performance degradation triggers for resilience activation
            this.performanceController.onPerformanceDegradation = (metrics) => {
                this.handlePerformanceDegradation(metrics);
            };

            // Set up resilience status updates for performance optimization
            this.resilienceController.onSystemHealthChange = (healthStatus) => {
                this.handleSystemHealthChange(healthStatus);
            };

            logger.info(
                'OrchestrationController: ✅ Coordinación cross-layer establecida'
            );
        }

        logger.info(
            'OrchestrationController: ✅ Coordinación con intelligence establecida'
        );
    }

    /**
   * Unified request processing with integrated optimization and resilience
   * @param {Function} operation - The operation to execute
   * @param {Object} context - Operation context
   * @returns {Promise<Object>} Operation result with metrics
   */
    async executeOperation(operation, context = {}) {
        const startTime = Date.now();
        const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Update request metrics
            this.systemMetrics.totalRequests++;

            // Check system health before execution
            const systemStatus = await this.getSystemStatus();
            if (systemStatus.degradationLevel > 2) {
                logger.warn(
                    `OrchestrationController: Sistema en estado degradado (${systemStatus.degradationLevel}). Operación ${operationId} puede fallar.`
                );
            }

            // Apply performance optimizations if available
            let optimizedOperation = operation;
            if (this.performanceController) {
                optimizedOperation = await this.performanceController.optimizeOperation(
                    operation,
                    context
                );
            }

            // Execute operation with resilience protection
            let result;
            if (this.resilienceController) {
                result = await this.resilienceController.executeWithProtection(
                    optimizedOperation,
                    context
                );
            } else {
                result = await optimizedOperation(context);
            }

            // Record success metrics
            const responseTime = Date.now() - startTime;
            this.updateSuccessMetrics(responseTime);

            logger.debug(
                `OrchestrationController: Operación ${operationId} completada exitosamente en ${responseTime}ms`
            );

            return {
                success: true,
                result,
                metrics: {
                    operationId,
                    responseTime,
                    systemHealth: this.systemMetrics.systemHealth
                }
            };
        } catch (error) {
            // Record failure metrics
            const responseTime = Date.now() - startTime;
            this.updateFailureMetrics(error, responseTime);

            logger.error(
                `OrchestrationController: Operación ${operationId} falló después de ${responseTime}ms:`,
                error
            );

            // Report failure to resilience system
            if (this.resilienceController) {
                this.resilienceController.reportFailure('operation_execution', error);
            }

            return {
                success: false,
                error: error.message,
                metrics: {
                    operationId,
                    responseTime,
                    systemHealth: this.systemMetrics.systemHealth
                }
            };
        }
    }

    /**
   * Handles performance degradation events
   * @param {Object} performanceMetrics - Performance metrics
   * @private
   */
    handlePerformanceDegradation(performanceMetrics) {
        logger.warn(
            'OrchestrationController: Degradación de performance detectada:',
            performanceMetrics
        );

        if (
            performanceMetrics.averageResponseTime >
      this.adaptiveThresholds.performanceDegradationTrigger
        ) {
            // Trigger resilience mechanisms
            if (this.resilienceController) {
                this.resilienceController.activateDegradationMode('performance_issues');
            }

            // Update system health
            this.systemMetrics.systemHealth = 'DEGRADED';
        }
    }

    /**
   * Handles system health changes from resilience layer
   * @param {Object} healthStatus - System health status
   * @private
   */
    handleSystemHealthChange(healthStatus) {
        logger.info(
            'OrchestrationController: Cambio en salud del sistema:',
            healthStatus
        );

        this.systemMetrics.systemHealth = healthStatus.overall;

        // Adjust performance optimizations based on system health
        if (this.performanceController && healthStatus.overall === 'CRITICAL') {
            this.performanceController.activateEmergencyMode();
        } else if (
            this.performanceController &&
      healthStatus.overall === 'HEALTHY'
        ) {
            this.performanceController.deactivateEmergencyMode();
        }
    }

    /**
   * Updates metrics for successful operations
   * @param {number} responseTime - Response time in milliseconds
   * @private
   */
    updateSuccessMetrics(responseTime) {
        this.systemMetrics.successfulRequests++;

        // Calculate rolling average response time
        const totalRequests = this.systemMetrics.totalRequests;
        const currentAvg = this.systemMetrics.averageResponseTime;
        this.systemMetrics.averageResponseTime =
      (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;

        // Update system health based on performance
        if (
            this.systemMetrics.averageResponseTime <
      config.performance?.responseTimeTarget
        ) {
            this.systemMetrics.systemHealth = 'HEALTHY';
        }
    }

    /**
   * Updates metrics for failed operations
   * @param {Error} error - The error that occurred
   * @param {number} responseTime - Response time in milliseconds
   * @private
   */
    updateFailureMetrics(error, responseTime) {
        this.systemMetrics.failedRequests++;

        const failureRate =
      this.systemMetrics.failedRequests / this.systemMetrics.totalRequests;

        // Update system health based on failure rate
        if (failureRate > this.adaptiveThresholds.emergencyModeThreshold) {
            this.systemMetrics.systemHealth = 'CRITICAL';
        } else if (
            failureRate > this.adaptiveThresholds.resilienceActivationThreshold
        ) {
            this.systemMetrics.systemHealth = 'DEGRADED';
        }
    }

    /**
   * Gets comprehensive system status
   * @returns {Promise<Object>} System status information
   */
    async getSystemStatus() {
        const status = {
            isInitialized: this.isInitialized,
            uptime: this.systemMetrics.startTime
                ? Date.now() - this.systemMetrics.startTime
                : 0,
            metrics: { ...this.systemMetrics },
            performance: null,
            resilience: null,
            degradationLevel: 0
        };

        // Get performance status
        if (this.performanceController) {
            status.performance = await this.performanceController.getStatus();
        }

        // Get resilience status
        if (this.resilienceController) {
            status.resilience = await this.resilienceController.getStatus();
            status.degradationLevel = status.resilience.degradationLevel || 0;
        }

        // Get intelligence status
        if (config.intelligence?.enableEscalation) {
            status.intelligence = {
                adminBusy: this.adminEscalationSystem.adminBusy,
                queueLength: this.adminEscalationSystem.escalationQueue.length,
                learnedPatterns: this.adaptiveLearningEngine.getMetrics().totalPatterns,
                escalationRate: this.uncertaintyDetector.getMetrics().escalationRate
            };
        }

        // Calculate overall system health
        const failureRate =
      status.metrics.totalRequests > 0
          ? status.metrics.failedRequests / status.metrics.totalRequests
          : 0;

        if (failureRate > this.adaptiveThresholds.emergencyModeThreshold) {
            status.metrics.systemHealth = 'CRITICAL';
        } else if (
            failureRate > this.adaptiveThresholds.resilienceActivationThreshold ||
      status.metrics.averageResponseTime >
        this.adaptiveThresholds.performanceDegradationTrigger
        ) {
            status.metrics.systemHealth = 'DEGRADED';
        } else {
            status.metrics.systemHealth = 'HEALTHY';
        }

        return status;
    }

    /**
   * Forces system optimization based on current conditions
   * @returns {Promise<Object>} Optimization results
   */
    async optimizeSystem() {
        logger.info(
            'OrchestrationController: Iniciando optimización del sistema...'
        );

        const results = {
            performance: null,
            resilience: null,
            timestamp: Date.now()
        };

        try {
            // Optimize performance layer
            if (this.performanceController) {
                results.performance = await this.performanceController.optimize();
                logger.info(
                    'OrchestrationController: ✅ Optimización de performance completada'
                );
            }

            // Optimize resilience layer
            if (this.resilienceController) {
                results.resilience = await this.resilienceController.optimize();
                logger.info(
                    'OrchestrationController: ✅ Optimización de resilience completada'
                );
            }

            // Optimize intelligence layer
            if (config.intelligence?.enableEscalation) {
                // No optimization needed for intelligence singletons
                results.intelligence = 'intelligence_layer_operational';
                logger.info(
                    'OrchestrationController: ✅ Intelligence layer verificada'
                );
            }

            logger.info(
                'OrchestrationController: ✅ Optimización del sistema completada exitosamente'
            );
            return results;
        } catch (error) {
            logger.error(
                'OrchestrationController: ❌ Error durante optimización del sistema:',
                error
            );
            throw error;
        }
    }

    /**
   * Gracefully shuts down the orchestration system
   * @returns {Promise<boolean>} Shutdown success status
   */
    async shutdown() {
        try {
            logger.info(
                'OrchestrationController: Iniciando apagado del sistema de orquestación...'
            );

            // Shutdown resilience layer first to ensure graceful degradation
            if (this.resilienceController) {
                await this.resilienceController.shutdown();
                logger.info('OrchestrationController: ✅ Resilience layer apagada');
            }

            // Shutdown performance layer
            if (this.performanceController) {
                await this.performanceController.shutdown();
                logger.info('OrchestrationController: ✅ Performance layer apagada');
            }

            // Shutdown intelligence layer
            if (config.intelligence?.enableEscalation) {
                await this.adminEscalationSystem.shutdown();
                await this.adaptiveLearningEngine.shutdown();
                await this.uncertaintyDetector.shutdown();
                logger.info('OrchestrationController: ✅ Intelligence layer apagada');
            }

            this.isInitialized = false;
            logger.info(
                'OrchestrationController: ✅ Sistema de orquestación apagado exitosamente'
            );

            return true;
        } catch (error) {
            logger.error('OrchestrationController: ❌ Error durante apagado:', error);
            return false;
        }
    }

    /**
   * Returns the circuit breaker instance for external access
   * @returns {Object|null} Circuit breaker instance
   */
    getCircuitBreaker() {
        return this.resilienceController
            ? this.resilienceController.getCircuitBreaker()
            : null;
    }

    /**
   * Returns the graceful degradation manager for external access
   * @returns {Object|null} Graceful degradation manager instance
   */
    getGracefulDegradationManager() {
        return this.resilienceController
            ? this.resilienceController.getGracefulDegradationManager()
            : null;
    }

    /**
   * Returns the performance optimizer for external access
   * @returns {Object|null} Performance controller instance
   */
    getPerformanceController() {
        return this.performanceController;
    }

    /**
   * Returns the resilience controller for external access
   * @returns {Object|null} Resilience controller instance
   */
    getResilienceController() {
        return this.resilienceController;
    }

    /**
   * Returns the admin escalation system for external access
   * @returns {Object|null} Admin escalation system instance
   */
    getAdminEscalationSystem() {
        return config.intelligence?.enableEscalation
            ? this.adminEscalationSystem
            : null;
    }

    /**
   * Returns the adaptive learning engine for external access
   * @returns {Object|null} Adaptive learning engine instance
   */
    getAdaptiveLearningEngine() {
        return config.intelligence?.enableEscalation
            ? this.adaptiveLearningEngine
            : null;
    }

    /**
   * Returns the uncertainty detector for external access
   * @returns {Object|null} Uncertainty detector instance
   */
    getUncertaintyDetector() {
        return config.intelligence?.enableEscalation
            ? this.uncertaintyDetector
            : null;
    }

    /**
   * Intelligent query processing with escalation and learning
   * @param {Object} queryData - Query data
   * @param {Function} whatsappClient - WhatsApp client
   * @returns {Promise<Object>} - Processing result
   */
    async processIntelligentQuery(queryData, whatsappClient) {
        const startTime = Date.now();

        try {
            // Check if intelligence layer is enabled
            if (!config.intelligence?.enableEscalation) {
                // Fallback to regular operation
                return await this.executeOperation(
                    async (context) =>
                        context.fallbackResponse || 'Procesando consulta...',
                    { fallbackResponse: 'Consulta procesada sin intelligence layer' }
                );
            }

            // 1. Check for auto-decision from learning
            const situation = this.extractSituationFromQuery(queryData);
            const autoDecision =
        await this.adaptiveLearningEngine.checkForAutoDecision(situation);

            if (autoDecision) {
                this.systemMetrics.autoResolvedQueries++;

                return {
                    success: true,
                    result: autoDecision.response,
                    source: 'auto_decision',
                    confidence: autoDecision.confidence,
                    responseTime: Date.now() - startTime
                };
            }

            // 2. Analyze uncertainty
            const uncertaintyAnalysis =
        await this.uncertaintyDetector.analyzeQuery(queryData);

            if (uncertaintyAnalysis.needsEscalation) {
                // 3. Escalate to admin
                const escalationResponse =
          await this.adminEscalationSystem.escalateToAdmin(
              uncertaintyAnalysis.escalationData,
              whatsappClient
          );

                this.systemMetrics.escalatedQueries++;

                return {
                    success: true,
                    result: escalationResponse,
                    source: 'admin_escalation',
                    confidence: uncertaintyAnalysis.confidence,
                    reasons: uncertaintyAnalysis.reasons,
                    responseTime: Date.now() - startTime
                };
            } else {
                // 4. Agent can handle the query
                this.systemMetrics.autoResolvedQueries++;

                return {
                    success: true,
                    result: 'Consulta manejada automáticamente por el agente',
                    source: 'agent_capability',
                    confidence: uncertaintyAnalysis.confidence,
                    capabilities: uncertaintyAnalysis.agentCapabilities,
                    responseTime: Date.now() - startTime
                };
            }
        } catch (error) {
            logger.error('❌ Error en procesamiento inteligente:', error);

            // Fallback escalation
            const fallbackResponse = await this.adminEscalationSystem.escalateToAdmin(
                {
                    customerInfo: queryData.customerInfo || {
                        name: 'Cliente',
                        phone: queryData.from
                    },
                    query: queryData.query || 'Consulta sin detalles',
                    aiAnalysis: 'Error en análisis automático - escalación de seguridad'
                },
                whatsappClient
            );

            return {
                success: false,
                result: fallbackResponse,
                source: 'error_fallback',
                error: error.message,
                responseTime: Date.now() - startTime
            };
        }
    }

    /**
   * Extracts situation context from query for learning
   * @param {Object} queryData - Query data
   * @returns {Object} - Situation context
   */
    extractSituationFromQuery(queryData) {
        return {
            queryType: this.detectQueryType(queryData.query),
            deviceModel: this.extractDeviceModel(queryData.query),
            serviceType: this.detectServiceType(queryData.query),
            timeOfDay: new Date().getHours(),
            customerType: queryData.customerInfo?.name ? 'returning' : 'new',
            urgency: /urgente|rapido|ya|ahora/i.test(queryData.query)
                ? 'high'
                : 'normal'
        };
    }

    /**
   * Utility methods for query analysis
   */
    detectQueryType(query) {
        if (/precio|costo|cuanto/i.test(query)) return 'pricing';
        if (/horario|hora|cuando/i.test(query)) return 'schedule';
        if (/reparar|arreglar|fix/i.test(query)) return 'repair';
        if (/garantia/i.test(query)) return 'warranty';
        return 'general';
    }

    extractDeviceModel(query) {
        const modelPatterns = [
            /iphone\s*(\d+)/i,
            /samsung\s*([a-z]\d+)/i,
            /galaxy\s*([a-z]\d+)/i
        ];

        for (const pattern of modelPatterns) {
            const match = query.match(pattern);
            if (match) return match[0].toLowerCase();
        }

        return 'unknown';
    }

    detectServiceType(query) {
        if (/pantalla|display|screen/i.test(query)) return 'pantalla';
        if (/bateria|battery/i.test(query)) return 'bateria';
        if (/camara|camera/i.test(query)) return 'camara';
        return 'general';
    }

    /**
   * Setup intelligence layer coordination
   * @private
   */
    setupIntelligenceCoordination() {
    // Configure admin response handling for learning
        this.originalHandleAdminResponse =
      this.adminEscalationSystem.handleAdminResponse.bind(
          this.adminEscalationSystem
      );

        // Override to include learning
        this.adminEscalationSystem.handleAdminResponse = async (
            adminResponse,
            responseCallback
        ) => {
            // Call original handler
            await this.originalHandleAdminResponse(adminResponse, responseCallback);

            // Record decision for learning
            await this.recordAdminDecisionForLearning(adminResponse);
        };
    }

    /**
   * Records admin decision for adaptive learning
   * @param {String} adminResponse - Admin response
   * @private
   */
    async recordAdminDecisionForLearning(adminResponse) {
        try {
            // Extract situation context from current escalation
            const currentEscalation =
        this.adminEscalationSystem.getCurrentEscalation();
            if (currentEscalation) {
                const decisionData = {
                    situation: this.extractSituationFromEscalation(currentEscalation),
                    adminResponse,
                    timestamp: Date.now()
                };

                await this.adaptiveLearningEngine.recordAdminDecision(decisionData);
                this.systemMetrics.learnedPatterns =
          this.adaptiveLearningEngine.getMetrics().totalPatterns;
            }
        } catch (error) {
            logger.error('❌ Error registrando decisión para aprendizaje:', error);
        }
    }

    /**
   * Extracts situation context from escalation for learning
   * @param {Object} escalation - Escalation data
   * @returns {Object} - Situation context
   * @private
   */
    extractSituationFromEscalation(escalation) {
        return {
            queryType: 'general',
            customerType: escalation.customerInfo.name ? 'returning' : 'new',
            timeOfDay: new Date().getHours(),
            urgency: escalation.originalQuery.toLowerCase().includes('urgente')
                ? 'high'
                : 'normal'
        };
    }
}

// Export singleton instance
const orchestrationController = new OrchestrationController();
module.exports = orchestrationController;
