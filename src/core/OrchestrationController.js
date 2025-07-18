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

class OrchestrationController {
    constructor() {
        this.isInitialized = false;
        this.performanceController = null;
        this.resilienceController = null;

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
            escalatedQueries: 0,
            autoResolvedQueries: 0,
            learnedPatterns: 0
        };
        this.adaptiveThresholds = {
            performanceDegradationTrigger: 2000,
            resilienceActivationThreshold: 0.1,
            emergencyModeThreshold: 0.25
        };
    }

    async initialize() {
        try {
            logger.info('OrchestrationController: Iniciando sistema de orquestación unificado...');

            if (config.performance?.enableOptimization) {
                logger.info('OrchestrationController: Inicializando capa de performance...');
                this.performanceController = new PerformanceController();
                await this.performanceController.initialize();
                logger.info('OrchestrationController: ✅ Performance layer inicializada');
            }

            if (config.resilience?.enableCircuitBreaker || config.resilience?.enableGracefulDegradation) {
                logger.info('OrchestrationController: Inicializando capa de resilience...');
                this.resilienceController = resilienceController;
                await this.resilienceController.initialize();
                logger.info('OrchestrationController: ✅ Resilience layer inicializada');
            }

            if (config.intelligence?.enableEscalation) {
                logger.info('OrchestrationController: Inicializando intelligence layer...');
                this.setupIntelligenceCoordination();
                logger.info('OrchestrationController: ✅ Intelligence layer inicializada');
            }

            await this.establishCrossLayerCoordination();
            this.systemMetrics.startTime = Date.now();
            this.systemMetrics.systemHealth = 'HEALTHY';
            this.isInitialized = true;
            logger.info('OrchestrationController: ✅ Sistema de orquestación unificado inicializado exitosamente');

            return true;
        } catch (error) {
            logger.error('OrchestrationController: ❌ Error crítico durante inicialización:', error);
            this.isInitialized = false;
            return false;
        }
    }

    async establishCrossLayerCoordination() {
        if (this.performanceController && this.resilienceController) {
            logger.info('OrchestrationController: Estableciendo coordinación cross-layer...');
            this.performanceController.onPerformanceDegradation = (metrics) => {
                this.handlePerformanceDegradation(metrics);
            };
            this.resilienceController.onSystemHealthChange = (healthStatus) => {
                this.handleSystemHealthChange(healthStatus);
            };
            logger.info('OrchestrationController: ✅ Coordinación cross-layer establecida');
        }
        logger.info('OrchestrationController: ✅ Coordinación con intelligence establecida');
    }

    async executeOperation(operation, context = {}) {
        // ... (resto del código)
    }

    handlePerformanceDegradation(performanceMetrics) {
        // ... (resto del código)
    }

    handleSystemHealthChange(healthStatus) {
        // ... (resto del código)
    }

    updateSuccessMetrics(responseTime) {
        // ... (resto del código)
    }

    updateFailureMetrics(error, responseTime) {
        // ... (resto del código)
    }

    async getSystemStatus() {
        // ... (resto del código)
    }

    async optimizeSystem() {
        // ... (resto del código)
    }

    async shutdown() {
        // ... (resto del código)
    }

    getCircuitBreaker() {
        return this.resilienceController ? this.resilienceController.getCircuitBreaker() : null;
    }

    getGracefulDegradationManager() {
        return this.resilienceController ? this.resilienceController.getGracefulDegradationManager() : null;
    }

    getPerformanceController() {
        return this.performanceController;
    }

    getResilienceController() {
        return this.resilienceController;
    }

    getAdminEscalationSystem() {
        return config.intelligence?.enableEscalation ? this.adminEscalationSystem : null;
    }

    getAdaptiveLearningEngine() {
        return config.intelligence?.enableEscalation ? this.adaptiveLearningEngine : null;
    }

    getUncertaintyDetector() {
        return config.intelligence?.enableEscalation ? this.uncertaintyDetector : null;
    }

    async processIntelligentQuery(queryData, whatsappClient) {
        // ... (resto del código)
    }

    extractSituationFromQuery(queryData) {
        // ... (resto del código)
    }

    detectQueryType(query) {
        // ... (resto del código)
    }

    extractDeviceModel(query) {
        // ... (resto del código)
    }

    detectServiceType(query) {
        // ... (resto del código)
    }

    setupIntelligenceCoordination() {
        // ... (resto del código)
    }

    async recordAdminDecisionForLearning(adminResponse) {
        // ... (resto del código)
    }

    extractSituationFromEscalation(escalation) {
        // ... (resto del código)
    }
}

const orchestrationController = new OrchestrationController();
module.exports = orchestrationController;
