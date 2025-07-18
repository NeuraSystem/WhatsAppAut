const logger = require('../../utils/logger');
const { EventEmitter } = require('events');
const { services, restartService } = require('../../services/serviceRegistry');
const config = require('../../../config/config');

class AdvancedCircuitBreaker extends EventEmitter {
    constructor(options = {}) {
        super();
        this.config = {
            failureThreshold: options.failureThreshold || 5,
            successThreshold: options.successThreshold || 3,
            timeout: options.timeout || 30000,
            enableAdaptiveThreshold: options.enableAdaptiveThreshold !== false,
            adaptiveWindow: options.adaptiveWindow || 300000,
            responseTimeThreshold: options.responseTimeThreshold || 5000,
            enableResponseTimeCircuit: options.enableResponseTimeCircuit !== false,
            recoveryTimeout: options.recoveryTimeout || 10000,
            halfOpenMaxAttempts: options.halfOpenMaxAttempts || 3,
            ...options
        };
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.lastSuccessTime = null;
        this.nextAttemptTime = null;
        this.adaptiveMetrics = {
            recentFailures: [],
            recentSuccesses: [],
            adaptiveFailureThreshold: this.config.failureThreshold,
            lastAdaptation: Date.now()
        };
        this.responseTimeMetrics = {
            recentResponseTimes: [],
            averageResponseTime: 0,
            slowResponseCount: 0
        };
        this.statistics = {
            totalRequests: 0,
            totalFailures: 0,
            totalSuccesses: 0,
            circuitOpenCount: 0,
            lastStateChange: Date.now(),
            uptime: Date.now()
        };
        this.startAdaptiveMonitoring();
        logger.info('🛡️ AdvancedCircuitBreaker inicializado con gestión adaptativa', {
            config: this.config,
            state: this.state
        });
    }

    async execute(fn, context = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        this.statistics.totalRequests++;
        try {
            await this.checkCircuitState();
            const result = await this.executeWithMonitoring(fn, context, requestId);
            this.handleSuccess(startTime, requestId);
            return result;
        } catch (error) {
            this.handleFailure(error, startTime, requestId);
            throw error;
        }
    }

    async checkCircuitState() {
        const now = Date.now();
        switch (this.state) {
        case 'CLOSED':
            if (this.shouldAdaptThreshold()) {
                this.adaptFailureThreshold();
            }
            break;
        case 'OPEN':
            if (this.nextAttemptTime && now >= this.nextAttemptTime) {
                this.transitionToHalfOpen();
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
            break;
        case 'HALF_OPEN':
            if (this.successes >= this.config.successThreshold) {
                this.transitionToClosed();
            } else if (this.failures >= this.config.halfOpenMaxAttempts) {
                this.transitionToOpen();
                throw new Error('Circuit breaker returned to OPEN state');
            }
            break;
        }
    }

    async executeWithMonitoring(fn, context, requestId) {
        const startTime = Date.now();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Circuit breaker timeout after ${this.config.timeout}ms`));
            }, this.config.timeout);
        });
        try {
            const result = await Promise.race([fn(context), timeoutPromise]);
            const responseTime = Date.now() - startTime;
            this.recordResponseTime(responseTime);
            if (this.config.enableResponseTimeCircuit && responseTime > this.config.responseTimeThreshold) {
                this.handleSlowResponse(responseTime, requestId);
            }
            return result;
        } catch (error) {
            error.circuitBreakerState = this.state;
            error.requestId = requestId;
            throw error;
        }
    }

    handleSuccess(startTime, requestId) {
        const responseTime = Date.now() - startTime;
        this.successes++;
        this.statistics.totalSuccesses++;
        this.lastSuccessTime = Date.now();
        this.adaptiveMetrics.recentSuccesses.push({ timestamp: Date.now(), responseTime });
        this.emit('success', { requestId, responseTime, state: this.state, consecutiveSuccesses: this.successes });
        logger.debug('✅ Circuit breaker success', { requestId, responseTime: `${responseTime}ms`, state: this.state, consecutiveSuccesses: this.successes });
        if (this.state === 'HALF_OPEN' && this.successes >= this.config.successThreshold) {
            this.transitionToClosed();
        }
    }

    handleFailure(error, startTime, requestId) {
        const responseTime = Date.now() - startTime;
        this.failures++;
        this.statistics.totalFailures++;
        this.lastFailureTime = Date.now();
        this.adaptiveMetrics.recentFailures.push({ timestamp: Date.now(), error: error.message, responseTime });
        this.emit('failure', { requestId, error: error.message, responseTime, state: this.state, consecutiveFailures: this.failures });
        logger.warn('❌ Circuit breaker failure', { requestId, error: error.message, responseTime: `${responseTime}ms`, state: this.state, consecutiveFailures: this.failures });
        if (this.state === 'CLOSED' && this.failures >= this.adaptiveMetrics.adaptiveFailureThreshold) {
            this.transitionToOpen();
        } else if (this.state === 'HALF_OPEN') {
            this.transitionToOpen();
        }
    }

    transitionToOpen() {
        const previousState = this.state;
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
        this.statistics.circuitOpenCount++;
        this.statistics.lastStateChange = Date.now();
        this.emit('stateChange', { from: previousState, to: 'OPEN', reason: 'Failure threshold exceeded', nextAttemptTime: this.nextAttemptTime });
        logger.warn('🔴 Circuit breaker OPEN', { previousState, failures: this.failures, threshold: this.adaptiveMetrics.adaptiveFailureThreshold, nextAttemptTime: new Date(this.nextAttemptTime).toISOString() });
    }

    transitionToHalfOpen() {
        const previousState = this.state;
        this.state = 'HALF_OPEN';
        this.failures = 0;
        this.successes = 0;
        this.statistics.lastStateChange = Date.now();
        this.emit('stateChange', { from: previousState, to: 'HALF_OPEN', reason: 'Recovery timeout elapsed' });
        logger.info('🟡 Circuit breaker HALF_OPEN', { previousState, maxAttempts: this.config.halfOpenMaxAttempts });
    }

    transitionToClosed() {
        const previousState = this.state;
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.nextAttemptTime = null;
        this.statistics.lastStateChange = Date.now();
        this.emit('stateChange', { from: previousState, to: 'CLOSED', reason: 'Recovery successful' });
        logger.info('🟢 Circuit breaker CLOSED', { previousState, reason: 'Recovery successful' });
    }

    shouldAdaptThreshold() {
        const now = Date.now();
        const timeSinceLastAdaptation = now - this.adaptiveMetrics.lastAdaptation;
        return this.config.enableAdaptiveThreshold && timeSinceLastAdaptation >= this.config.adaptiveWindow;
    }

    adaptFailureThreshold() {
        const now = Date.now();
        const windowStart = now - this.config.adaptiveWindow;
        this.adaptiveMetrics.recentFailures = this.adaptiveMetrics.recentFailures.filter((f) => f.timestamp > windowStart);
        this.adaptiveMetrics.recentSuccesses = this.adaptiveMetrics.recentSuccesses.filter((s) => s.timestamp > windowStart);
        const recentFailureRate = this.adaptiveMetrics.recentFailures.length / (this.adaptiveMetrics.recentFailures.length + this.adaptiveMetrics.recentSuccesses.length);
        const baseThreshold = this.config.failureThreshold;
        let newThreshold = baseThreshold;
        if (recentFailureRate > 0.2) {
            newThreshold = Math.max(2, Math.floor(baseThreshold * 0.7));
        } else if (recentFailureRate < 0.05) {
            newThreshold = Math.min(15, Math.ceil(baseThreshold * 1.3));
        }
        if (newThreshold !== this.adaptiveMetrics.adaptiveFailureThreshold) {
            logger.info('🔄 Adaptive threshold adjusted', { previous: this.adaptiveMetrics.adaptiveFailureThreshold, new: newThreshold, failureRate: `${(recentFailureRate * 100).toFixed(1)}%` });
            this.adaptiveMetrics.adaptiveFailureThreshold = newThreshold;
        }
        this.adaptiveMetrics.lastAdaptation = now;
    }

    recordResponseTime(responseTime) {
        this.responseTimeMetrics.recentResponseTimes.push({ timestamp: Date.now(), responseTime });
        if (this.responseTimeMetrics.recentResponseTimes.length > 100) {
            this.responseTimeMetrics.recentResponseTimes.shift();
        }
        const sum = this.responseTimeMetrics.recentResponseTimes.reduce((total, r) => total + r.responseTime, 0);
        this.responseTimeMetrics.averageResponseTime = sum / this.responseTimeMetrics.recentResponseTimes.length;
    }

    handleSlowResponse(responseTime, requestId) {
        this.responseTimeMetrics.slowResponseCount++;
        logger.warn('🐌 Slow response detected', { requestId, responseTime: `${responseTime}ms`, threshold: `${this.config.responseTimeThreshold}ms`, slowResponseCount: this.responseTimeMetrics.slowResponseCount });
        this.emit('slowResponse', { requestId, responseTime, threshold: this.config.responseTimeThreshold });
    }

    startAdaptiveMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, 60000);
    }

    performHealthCheck() {
        const now = Date.now();
        const uptime = now - this.statistics.uptime;
        const healthReport = {
            state: this.state,
            uptime: `${Math.floor(uptime / 1000)}s`,
            totalRequests: this.statistics.totalRequests,
            successRate: this.statistics.totalRequests > 0 ? `${((this.statistics.totalSuccesses / this.statistics.totalRequests) * 100).toFixed(1)}%` : 'N/A',
            adaptiveThreshold: this.adaptiveMetrics.adaptiveFailureThreshold,
            averageResponseTime: `${this.responseTimeMetrics.averageResponseTime.toFixed(2)}ms`
        };
        logger.debug('🔍 Circuit breaker health check', healthReport);
        this.emit('healthCheck', healthReport);
    }

    getMetrics() {
        return {
            state: this.state,
            config: this.config,
            statistics: this.statistics,
            adaptiveMetrics: this.adaptiveMetrics,
            responseTimeMetrics: this.responseTimeMetrics,
            currentThreshold: this.adaptiveMetrics.adaptiveFailureThreshold
        };
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    forceState(newState) {
        const previousState = this.state;
        this.state = newState;
        logger.warn('⚠️ Circuit breaker state forced', { from: previousState, to: newState, reason: 'Manual override' });
        this.emit('stateChange', { from: previousState, to: newState, reason: 'Manual override' });
    }
}

class GracefulDegradationManager extends EventEmitter {
    constructor(options = {}) {
        super();
        this.config = {
            criticalServices: options.criticalServices || ['whatsapp', 'database', 'ai-processing'],
            importantServices: options.importantServices || ['embeddings', 'cache', 'logging'],
            optionalServices: options.optionalServices || ['analytics', 'metrics', 'monitoring'],
            degradationThresholds: {
                memory: options.degradationThresholds?.memory || 0.85,
                cpu: options.degradationThresholds?.cpu || 0.9,
                responseTime: options.degradationThresholds?.responseTime || 5000,
                errorRate: options.degradationThresholds?.errorRate || 0.15
            },
            recoveryCheckInterval: options.recoveryCheckInterval || 30000,
            stabilityRequirement: options.stabilityRequirement || 5,
            ...options
        };
        this.serviceRegistry = new Map();
        this.degradationLevel = 0;
        this.activeFeatures = new Set();
        this.disabledFeatures = new Set();
        this.healthMetrics = {
            memory: { current: 0, trend: 'stable' },
            cpu: { current: 0, trend: 'stable' },
            responseTime: { current: 0, trend: 'stable' },
            errorRate: { current: 0, trend: 'stable' }
        };
        this.recoveryAttempts = new Map();
        this.stabilityCounters = new Map();
        this.initializeServiceRegistry();
        this.startHealthMonitoring();
        logger.info('🛡️ GracefulDegradationManager inicializado con jerarquía de servicios', {
            degradationLevel: this.degradationLevel,
            totalServices: this.serviceRegistry.size,
            criticalServices: this.config.criticalServices.length
        });
    }

    initializeServiceRegistry() {
        this.config.criticalServices.forEach((service) => this.registerService(service, 'critical', true));
        this.config.importantServices.forEach((service) => this.registerService(service, 'important', true));
        this.config.optionalServices.forEach((service) => this.registerService(service, 'optional', true));
        this.activeFeatures = new Set([...this.config.criticalServices, ...this.config.importantServices, ...this.config.optionalServices]);
    }

    registerService(serviceName, priority, isHealthy = true) {
        const service = {
            name: serviceName,
            priority,
            isHealthy,
            lastHealthCheck: Date.now(),
            healthHistory: [],
            failureCount: 0,
            lastFailure: null,
            recoveryCount: 0,
            lastRecovery: null
        };
        this.serviceRegistry.set(serviceName, service);
        logger.debug('📋 Service registered', { service: serviceName, priority, isHealthy });
    }

    reportServiceHealth(serviceName, isHealthy, errorDetails = null) {
        const service = this.serviceRegistry.get(serviceName);
        if (!service) {
            logger.warn('⚠️ Unknown service health report', { service: serviceName });
            return;
        }
        const previousHealth = service.isHealthy;
        service.isHealthy = isHealthy;
        service.lastHealthCheck = Date.now();
        service.healthHistory.push({ timestamp: Date.now(), isHealthy, errorDetails });
        if (service.healthHistory.length > 50) {
            service.healthHistory.shift();
        }
        if (previousHealth !== isHealthy) {
            if (isHealthy) {
                this.handleServiceRecovery(service);
            } else {
                this.handleServiceFailure(service, errorDetails);
            }
        }
        this.evaluateSystemHealth();
    }

    handleServiceFailure(service, errorDetails) {
        service.failureCount++;
        service.lastFailure = Date.now();
        logger.warn('❌ Service failure detected', { service: service.name, priority: service.priority, failureCount: service.failureCount, errorDetails: errorDetails?.message || 'Unknown error' });
        this.emit('serviceFailure', { service: service.name, priority: service.priority, errorDetails });
        this.applyServiceDegradation(service);
    }

    handleServiceRecovery(service) {
        service.recoveryCount++;
        service.lastRecovery = Date.now();
        logger.info('✅ Service recovery detected', { service: service.name, priority: service.priority, recoveryCount: service.recoveryCount });
        this.emit('serviceRecovery', { service: service.name, priority: service.priority });
        this.initiateServiceRecovery(service);
    }

    applyServiceDegradation(service) {
        switch (service.priority) {
        case 'critical': this.handleCriticalServiceFailure(service); break;
        case 'important': this.handleImportantServiceFailure(service); break;
        case 'optional': this.handleOptionalServiceFailure(service); break;
        }
    }

    handleCriticalServiceFailure(service) {
        logger.error('🚨 Critical service failure', { service: service.name, currentDegradationLevel: this.degradationLevel });
        this.increaseDegradationLevel();
        this.activateEmergencyProtocols(service);
    }

    handleImportantServiceFailure(service) {
        logger.warn('⚠️ Important service failure', { service: service.name, currentDegradationLevel: this.degradationLevel });
        this.disableFeature(service.name);
        if (this.getUnhealthyServicesCount('important') > 1) {
            this.increaseDegradationLevel();
        }
    }

    handleOptionalServiceFailure(service) {
        logger.info('ℹ️ Optional service failure', { service: service.name, impact: 'minimal' });
        this.disableFeature(service.name);
    }

    increaseDegradationLevel() {
        const previousLevel = this.degradationLevel;
        this.degradationLevel = Math.min(3, this.degradationLevel + 1);
        if (this.degradationLevel !== previousLevel) {
            logger.warn('📉 System degradation level increased', { previous: previousLevel, current: this.degradationLevel, mode: this.getDegradationMode() });
            this.emit('degradationLevelChange', { previous: previousLevel, current: this.degradationLevel, mode: this.getDegradationMode() });
            this.applyDegradationMode();
        }
    }

    decreaseDegradationLevel() {
        const previousLevel = this.degradationLevel;
        this.degradationLevel = Math.max(0, this.degradationLevel - 1);
        if (this.degradationLevel !== previousLevel) {
            logger.info('📈 System degradation level decreased', { previous: previousLevel, current: this.degradationLevel, mode: this.getDegradationMode() });
            this.emit('degradationLevelChange', { previous: previousLevel, current: this.degradationLevel, mode: this.getDegradationMode() });
            this.applyDegradationMode();
        }
    }

    applyDegradationMode() {
        switch (this.degradationLevel) {
        case 0: this.activateFullOperation(); break;
        case 1: this.activatePartialDegradation(); break;
        case 2: this.activateMinimalOperation(); break;
        case 3: this.activateCriticalMode(); break;
        }
    }

    activateFullOperation() {
        logger.info('🟢 Full operation mode activated');
        this.activeFeatures = new Set([...this.config.criticalServices, ...this.config.importantServices, ...this.config.optionalServices]);
        this.disabledFeatures.clear();
        this.emit('operationModeChange', { mode: 'full', activeFeatures: Array.from(this.activeFeatures), disabledFeatures: Array.from(this.disabledFeatures) });
    }

    activatePartialDegradation() {
        logger.warn('🟡 Partial degradation mode activated');
        this.config.optionalServices.forEach((service) => this.disableFeature(service));
        this.emit('operationModeChange', { mode: 'partial', activeFeatures: Array.from(this.activeFeatures), disabledFeatures: Array.from(this.disabledFeatures) });
    }

    activateMinimalOperation() {
        logger.warn('🟠 Minimal operation mode activated');
        this.config.optionalServices.forEach((service) => this.disableFeature(service));
        const nonEssentialImportant = ['analytics', 'metrics'];
        nonEssentialImportant.forEach((service) => {
            if (this.config.importantServices.includes(service)) {
                this.disableFeature(service);
            }
        });
        this.emit('operationModeChange', { mode: 'minimal', activeFeatures: Array.from(this.activeFeatures), disabledFeatures: Array.from(this.disabledFeatures) });
    }

    activateCriticalMode() {
        logger.error('🔴 Critical mode activated');
        this.activeFeatures = new Set(this.config.criticalServices);
        this.disabledFeatures = new Set([...this.config.importantServices, ...this.config.optionalServices]);
        this.emit('operationModeChange', { mode: 'critical', activeFeatures: Array.from(this.activeFeatures), disabledFeatures: Array.from(this.disabledFeatures) });
    }

    disableFeature(featureName) {
        if (this.activeFeatures.has(featureName)) {
            this.activeFeatures.delete(featureName);
            this.disabledFeatures.add(featureName);
            logger.info('🔒 Feature disabled', { feature: featureName, activeFeatures: this.activeFeatures.size, disabledFeatures: this.disabledFeatures.size });
            this.emit('featureDisabled', { feature: featureName });
        }
    }

    enableFeature(featureName) {
        if (this.disabledFeatures.has(featureName)) {
            this.disabledFeatures.delete(featureName);
            this.activeFeatures.add(featureName);
            logger.info('🔓 Feature enabled', { feature: featureName, activeFeatures: this.activeFeatures.size, disabledFeatures: this.disabledFeatures.size });
            this.emit('featureEnabled', { feature: featureName });
        }
    }

    isFeatureActive(featureName) {
        return this.activeFeatures.has(featureName);
    }

    evaluateSystemHealth() {
        const healthyServices = Array.from(this.serviceRegistry.values()).filter((service) => service.isHealthy);
        const unhealthyCritical = this.getUnhealthyServicesCount('critical');
        const unhealthyImportant = this.getUnhealthyServicesCount('important');
        const unhealthyOptional = this.getUnhealthyServicesCount('optional');
        const systemHealth = {
            healthy: healthyServices.length,
            total: this.serviceRegistry.size,
            unhealthyCritical,
            unhealthyImportant,
            unhealthyOptional,
            degradationLevel: this.degradationLevel
        };
        logger.debug('📊 System health evaluation', systemHealth);
        this.adjustDegradationLevel(systemHealth);
        return systemHealth;
    }

    getUnhealthyServicesCount(priority) {
        return Array.from(this.serviceRegistry.values()).filter((service) => service.priority === priority && !service.isHealthy).length;
    }

    adjustDegradationLevel(systemHealth) {
        if (systemHealth.unhealthyCritical > 0) {
            this.increaseDegradationLevel();
        } else if (systemHealth.unhealthyCritical === 0 && systemHealth.unhealthyImportant === 0 && this.degradationLevel > 0) {
            this.decreaseDegradationLevel();
        }
    }

    getDegradationMode() {
        const modes = ['full', 'partial', 'minimal', 'critical'];
        return modes[this.degradationLevel];
    }

    activateEmergencyProtocols(service) {
        logger.error('🚨 Emergency protocols activated', { service: service.name, protocol: 'service-restoration' });
        this.emit('emergencyProtocol', { service: service.name, protocol: 'service-restoration', timestamp: Date.now() });
        this.initiateEmergencyRecovery(service);
    }

    async initiateEmergencyRecovery(service) {
        logger.info('🔄 Emergency recovery initiated', { service: service.name });
        const attempts = this.recoveryAttempts.get(service.name) || 0;
        this.recoveryAttempts.set(service.name, attempts + 1);
        this.emit('recoveryAttempt', { service: service.name, attempt: attempts + 1 });
    }

    initiateServiceRecovery(service) {
        const currentStability = this.stabilityCounters.get(service.name) || 0;
        this.stabilityCounters.set(service.name, currentStability + 1);
        if (currentStability >= this.config.stabilityRequirement) {
            logger.info('✅ Service stability achieved', { service: service.name, stabilityChecks: currentStability });
            if (this.canEnableFeature(service.name)) {
                this.enableFeature(service.name);
            }
            this.stabilityCounters.set(service.name, 0);
        }
    }

    canEnableFeature(featureName) {
        const service = this.serviceRegistry.get(featureName);
        if (!service) return false;
        switch (this.degradationLevel) {
        case 0: return true;
        case 1: return service.priority !== 'optional';
        case 2: return service.priority === 'critical';
        case 3: return service.priority === 'critical' && this.config.criticalServices.includes(featureName);
        default: return false;
        }
    }

    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.config.recoveryCheckInterval);
    }

    performHealthCheck() {
        logger.debug('🔍 Performing health check', { degradationLevel: this.degradationLevel, activeFeatures: this.activeFeatures.size, disabledFeatures: this.disabledFeatures.size });
        const systemHealth = this.evaluateSystemHealth();
        this.emit('healthCheck', { systemHealth, degradationLevel: this.degradationLevel, mode: this.getDegradationMode(), activeFeatures: Array.from(this.activeFeatures), disabledFeatures: Array.from(this.disabledFeatures) });
    }

    getSystemStatus() {
        return {
            degradationLevel: this.degradationLevel,
            mode: this.getDegradationMode(),
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures),
            services: Array.from(this.serviceRegistry.values()).map((service) => ({
                name: service.name,
                priority: service.priority,
                isHealthy: service.isHealthy,
                failureCount: service.failureCount,
                recoveryCount: service.recoveryCount
            })),
            healthMetrics: this.healthMetrics
        };
    }
}

class HealthMonitoringSystem {
    constructor() {
        this.monitoringInterval = 30000;
        this.healthStatus = new Map();
        this.healthHistory = new Map();
        this.monitorIntervalId = null;
    }

    startMonitoring() {
        if (this.monitorIntervalId) {
            logger.warn('HealthMonitoringSystem: El monitoreo de salud ya está en ejecución.');
            return;
        }
        logger.info('HealthMonitoringSystem: Iniciando monitoreo de salud distribuido...');
        this.monitorIntervalId = setInterval(() => this.runHealthChecks(), this.monitoringInterval);
    }

    stopMonitoring() {
        if (this.monitorIntervalId) {
            clearInterval(this.monitorIntervalId);
            this.monitorIntervalId = null;
            logger.info('HealthMonitoringSystem: Monitoreo de salud detenido.');
        }
    }

    async runHealthChecks() {
        logger.info('HealthMonitoringSystem: Ejecutando ciclo de chequeos de salud...');
        const serviceNames = Object.keys(services);
        for (const serviceName of serviceNames) {
            const service = services[serviceName];
            let isHealthy = false;
            let details = {};
            if (service && typeof service.healthCheck === 'function') {
                try {
                    const result = await service.healthCheck();
                    isHealthy = result.healthy;
                    details = result.details || {};
                } catch (error) {
                    isHealthy = false;
                    details = { error: error.message };
                    logger.error(`HealthMonitoringSystem: Error durante el chequeo de salud de '${serviceName}'.`, error);
                }
            } else {
                isHealthy = true;
                details = { message: 'No health check method available.' };
            }
            this.updateHealthStatus(serviceName, isHealthy, details);
            if (!isHealthy) {
                selfHealingManager.reportFailure(serviceName, new Error(details.error || 'Health check failed'));
            }
        }
        this.analyzeTrends();
    }

    updateHealthStatus(serviceName, isHealthy, details) {
        const status = { healthy: isHealthy, timestamp: Date.now(), details };
        this.healthStatus.set(serviceName, status);
        if (!this.healthHistory.has(serviceName)) {
            this.healthHistory.set(serviceName, []);
        }
        const history = this.healthHistory.get(serviceName);
        history.push(status);
        if (history.length > 100) {
            history.shift();
        }
    }

    analyzeTrends() {
        for (const [serviceName, history] of this.healthHistory.entries()) {
            const recentFailures = history.slice(-10).filter((s) => !s.healthy).length;
            if (recentFailures >= 3) {
                logger.warn(`HealthMonitoringSystem: El servicio '${serviceName}' muestra una tendencia de fallos recientes.`);
            }
        }
    }

    getSystemHealth() {
        return this.healthStatus;
    }
}

class SelfHealingManager {
    constructor() {
        this.failedServices = new Map();
        this.recoveryAttempts = new Map();
        this.maxRecoveryAttempts = 3;
        this.recoveryCooldown = 60000;
    }

    reportFailure(serviceName, error) {
        logger.warn(`SelfHealingManager: Falla reportada en el servicio '${serviceName}'. Error: ${error.message}`);
        const now = Date.now();
        const lastAttempt = this.recoveryAttempts.get(serviceName) || 0;
        if (now - lastAttempt < this.recoveryCooldown) {
            logger.info(`SelfHealingManager: El servicio '${serviceName}' está en período de enfriamiento. No se intentará la recuperación.`);
            return;
        }
        const attempts = (this.failedServices.get(serviceName) || 0) + 1;
        this.failedServices.set(serviceName, attempts);
        this.recoveryAttempts.set(serviceName, now);
        if (attempts > this.maxRecoveryAttempts) {
            logger.error(`SelfHealingManager: El servicio '${serviceName}' ha superado el máximo de intentos de recuperación. Se requiere intervención manual.`);
            return;
        }
        logger.info(`SelfHealingManager: Iniciando intento de recuperación #${attempts} para el servicio '${serviceName}'.`);
        this.initiateRecovery(serviceName);
    }

    async initiateRecovery(serviceName) {
        try {
            logger.info(`SelfHealingManager: Intentando reiniciar el servicio '${serviceName}'...`);
            const success = await this.restartService(serviceName);
            if (success) {
                const isHealthy = await this.validateRecovery(serviceName);
                if (isHealthy) {
                    logger.info(`SelfHealingManager: El servicio '${serviceName}' se ha recuperado y validado exitosamente.`);
                    this.failedServices.delete(serviceName);
                    this.recoveryAttempts.delete(serviceName);
                } else {
                    logger.error(`SelfHealingManager: El servicio '${serviceName}' se reinició pero no pasó la validación de salud.`);
                }
            } else {
                logger.error(`SelfHealingManager: Fallo al reiniciar el servicio '${serviceName}'.`);
            }
        } catch (recoveryError) {
            logger.error(`SelfHealingManager: Error crítico durante el proceso de recuperación para '${serviceName}'.`, recoveryError);
        }
    }

    async restartService(serviceName) {
        if (typeof restartService === 'function') {
            return await restartService(serviceName);
        }
        logger.warn(`SelfHealingManager: La función 'restartService' no está implementada en el registro de servicios.`);
        return false;
    }

    injectDependencies(serviceName) {
        logger.info(`SelfHealingManager: Re-inyectando dependencias para el servicio '${serviceName}' si es necesario.`);
    }

    async validateRecovery(serviceName) {
        const service = services[serviceName];
        if (service && typeof service.healthCheck === 'function') {
            logger.info(`SelfHealingManager: Ejecutando chequeo de salud para '${serviceName}'...`);
            return await service.healthCheck();
        }
        logger.warn(`SelfHealingManager: No se encontró un método 'healthCheck' para el servicio '${serviceName}'. Se asume recuperación exitosa.`);
        return true;
    }
}

const healthMonitoringSystem = new HealthMonitoringSystem();
const selfHealingManager = new SelfHealingManager();

class ResilienceController {
    constructor() {
        this.isInitialized = false;
        this.circuitBreaker = new AdvancedCircuitBreaker();
        this.gracefulDegradationManager = new GracefulDegradationManager();
    }

    async initialize() {
        if (this.isInitialized) return;
        logger.info('ResilienceController: Inicializando...');
        this.gracefulDegradationManager.startHealthMonitoring();
        this.isInitialized = true;
        logger.info('ResilienceController: ✅ Inicializado');
    }

    async shutdown() {
        logger.info('ResilienceController: Apagando...');
        this.gracefulDegradationManager.stopHealthMonitoring();
        this.isInitialized = false;
        logger.info('ResilienceController: ✅ Apagado');
    }

    async executeWithProtection(operation, context = {}) {
        return this.circuitBreaker.execute(operation, context);
    }

    reportFailure(serviceName, error) {
        selfHealingManager.reportFailure(serviceName, error);
    }

    activateDegradationMode(reason) {
        this.gracefulDegradationManager.increaseDegradationLevel();
    }

    notifyHealthChange(status) {
        // This can be used to notify other parts of the system
    }

    getOverallHealth() {
        return healthMonitoringSystem.getSystemHealth();
    }

    getSystemHealth() {
        return healthMonitoringSystem.getSystemHealth();
    }

    getStatus() {
        return {
            circuitBreaker: this.circuitBreaker.getMetrics(),
            degradation: this.gracefulDegradationManager.getSystemStatus(),
            health: this.getSystemHealth()
        };
    }

    async optimize() {
        // Placeholder for optimization logic
        return {};
    }

    getCircuitBreaker() {
        return this.circuitBreaker;
    }

    getGracefulDegradationManager() {
        return this.gracefulDegradationManager;
    }
}

const resilienceController = new ResilienceController();

module.exports = {
    resilienceController,
    AdvancedCircuitBreaker,
    GracefulDegradationManager,
    HealthMonitoringSystem,
    SelfHealingManager
};
