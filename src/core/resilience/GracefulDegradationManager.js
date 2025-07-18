// src/core/resilience/GracefulDegradationManager.js
// Progressive System Degradation with Intelligent Feature Management

const logger = require('../../utils/logger');
const { EventEmitter } = require('events');

class GracefulDegradationManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            criticalServices: options.criticalServices || ['whatsapp', 'database', 'ai-processing'],
            importantServices: options.importantServices || ['embeddings', 'cache', 'logging'],
            optionalServices: options.optionalServices || ['analytics', 'metrics', 'monitoring'],
            
            degradationThresholds: {
                memory: options.degradationThresholds?.memory || 0.85,
                cpu: options.degradationThresholds?.cpu || 0.90,
                responseTime: options.degradationThresholds?.responseTime || 5000,
                errorRate: options.degradationThresholds?.errorRate || 0.15
            },
            
            recoveryCheckInterval: options.recoveryCheckInterval || 30000,
            stabilityRequirement: options.stabilityRequirement || 5,
            
            ...options
        };

        // Service registry with health status
        this.serviceRegistry = new Map();
        this.degradationLevel = 0; // 0 = Full, 1 = Partial, 2 = Minimal, 3 = Critical
        this.activeFeatures = new Set();
        this.disabledFeatures = new Set();
        
        // Health monitoring
        this.healthMetrics = {
            memory: { current: 0, trend: 'stable' },
            cpu: { current: 0, trend: 'stable' },
            responseTime: { current: 0, trend: 'stable' },
            errorRate: { current: 0, trend: 'stable' }
        };
        
        // Recovery tracking
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

    /**
     * Initialize service registry with priority classification
     */
    initializeServiceRegistry() {
        // Register critical services
        this.config.criticalServices.forEach(service => {
            this.registerService(service, 'critical', true);
        });
        
        // Register important services
        this.config.importantServices.forEach(service => {
            this.registerService(service, 'important', true);
        });
        
        // Register optional services
        this.config.optionalServices.forEach(service => {
            this.registerService(service, 'optional', true);
        });
        
        // Initialize all features as active
        this.activeFeatures = new Set([
            ...this.config.criticalServices,
            ...this.config.importantServices,
            ...this.config.optionalServices
        ]);
    }

    /**
     * Register a service with priority and health status
     */
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
        
        logger.debug('📋 Service registered', {
            service: serviceName,
            priority,
            isHealthy
        });
    }

    /**
     * Report service health status
     */
    reportServiceHealth(serviceName, isHealthy, errorDetails = null) {
        const service = this.serviceRegistry.get(serviceName);
        
        if (!service) {
            logger.warn('⚠️ Unknown service health report', { service: serviceName });
            return;
        }
        
        const previousHealth = service.isHealthy;
        service.isHealthy = isHealthy;
        service.lastHealthCheck = Date.now();
        
        // Update health history
        service.healthHistory.push({
            timestamp: Date.now(),
            isHealthy,
            errorDetails
        });
        
        // Keep only recent history
        if (service.healthHistory.length > 50) {
            service.healthHistory.shift();
        }
        
        // Handle health state changes
        if (previousHealth !== isHealthy) {
            if (isHealthy) {
                this.handleServiceRecovery(service);
            } else {
                this.handleServiceFailure(service, errorDetails);
            }
        }
        
        // Evaluate overall system health
        this.evaluateSystemHealth();
    }

    /**
     * Handle service failure with intelligent degradation
     */
    handleServiceFailure(service, errorDetails) {
        service.failureCount++;
        service.lastFailure = Date.now();
        
        logger.warn('❌ Service failure detected', {
            service: service.name,
            priority: service.priority,
            failureCount: service.failureCount,
            errorDetails: errorDetails?.message || 'Unknown error'
        });
        
        this.emit('serviceFailure', {
            service: service.name,
            priority: service.priority,
            errorDetails
        });
        
        // Apply degradation based on service priority
        this.applyServiceDegradation(service);
    }

    /**
     * Handle service recovery
     */
    handleServiceRecovery(service) {
        service.recoveryCount++;
        service.lastRecovery = Date.now();
        
        logger.info('✅ Service recovery detected', {
            service: service.name,
            priority: service.priority,
            recoveryCount: service.recoveryCount
        });
        
        this.emit('serviceRecovery', {
            service: service.name,
            priority: service.priority
        });
        
        // Initiate recovery process
        this.initiateServiceRecovery(service);
    }

    /**
     * Apply degradation based on service priority
     */
    applyServiceDegradation(service) {
        switch (service.priority) {
            case 'critical':
                this.handleCriticalServiceFailure(service);
                break;
            case 'important':
                this.handleImportantServiceFailure(service);
                break;
            case 'optional':
                this.handleOptionalServiceFailure(service);
                break;
        }
    }

    /**
     * Handle critical service failure
     */
    handleCriticalServiceFailure(service) {
        logger.error('🚨 Critical service failure', {
            service: service.name,
            currentDegradationLevel: this.degradationLevel
        });
        
        // Critical services failing requires immediate action
        this.increaseDegradationLevel();
        
        // Implement emergency protocols
        this.activateEmergencyProtocols(service);
    }

    /**
     * Handle important service failure
     */
    handleImportantServiceFailure(service) {
        logger.warn('⚠️ Important service failure', {
            service: service.name,
            currentDegradationLevel: this.degradationLevel
        });
        
        // Disable non-essential features that depend on this service
        this.disableFeature(service.name);
        
        // Consider degradation level increase
        if (this.getUnhealthyServicesCount('important') > 1) {
            this.increaseDegradationLevel();
        }
    }

    /**
     * Handle optional service failure
     */
    handleOptionalServiceFailure(service) {
        logger.info('ℹ️ Optional service failure', {
            service: service.name,
            impact: 'minimal'
        });
        
        // Simply disable the optional feature
        this.disableFeature(service.name);
    }

    /**
     * Increase system degradation level
     */
    increaseDegradationLevel() {
        const previousLevel = this.degradationLevel;
        this.degradationLevel = Math.min(3, this.degradationLevel + 1);
        
        if (this.degradationLevel !== previousLevel) {
            logger.warn('📉 System degradation level increased', {
                previous: previousLevel,
                current: this.degradationLevel,
                mode: this.getDegradationMode()
            });
            
            this.emit('degradationLevelChange', {
                previous: previousLevel,
                current: this.degradationLevel,
                mode: this.getDegradationMode()
            });
            
            this.applyDegradationMode();
        }
    }

    /**
     * Decrease system degradation level
     */
    decreaseDegradationLevel() {
        const previousLevel = this.degradationLevel;
        this.degradationLevel = Math.max(0, this.degradationLevel - 1);
        
        if (this.degradationLevel !== previousLevel) {
            logger.info('📈 System degradation level decreased', {
                previous: previousLevel,
                current: this.degradationLevel,
                mode: this.getDegradationMode()
            });
            
            this.emit('degradationLevelChange', {
                previous: previousLevel,
                current: this.degradationLevel,
                mode: this.getDegradationMode()
            });
            
            this.applyDegradationMode();
        }
    }

    /**
     * Apply degradation mode configuration
     */
    applyDegradationMode() {
        switch (this.degradationLevel) {
            case 0: // Full Operation
                this.activateFullOperation();
                break;
            case 1: // Partial Degradation
                this.activatePartialDegradation();
                break;
            case 2: // Minimal Operation
                this.activateMinimalOperation();
                break;
            case 3: // Critical Mode
                this.activateCriticalMode();
                break;
        }
    }

    /**
     * Activate full operation mode
     */
    activateFullOperation() {
        logger.info('🟢 Full operation mode activated');
        
        // Reactivate all features
        this.activeFeatures = new Set([
            ...this.config.criticalServices,
            ...this.config.importantServices,
            ...this.config.optionalServices
        ]);
        
        this.disabledFeatures.clear();
        
        this.emit('operationModeChange', {
            mode: 'full',
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures)
        });
    }

    /**
     * Activate partial degradation mode
     */
    activatePartialDegradation() {
        logger.warn('🟡 Partial degradation mode activated');
        
        // Disable optional services, keep critical and important
        this.config.optionalServices.forEach(service => {
            this.disableFeature(service);
        });
        
        this.emit('operationModeChange', {
            mode: 'partial',
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures)
        });
    }

    /**
     * Activate minimal operation mode
     */
    activateMinimalOperation() {
        logger.warn('🟠 Minimal operation mode activated');
        
        // Disable optional and some important services
        this.config.optionalServices.forEach(service => {
            this.disableFeature(service);
        });
        
        // Disable non-essential important services
        const nonEssentialImportant = ['analytics', 'metrics'];
        nonEssentialImportant.forEach(service => {
            if (this.config.importantServices.includes(service)) {
                this.disableFeature(service);
            }
        });
        
        this.emit('operationModeChange', {
            mode: 'minimal',
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures)
        });
    }

    /**
     * Activate critical mode
     */
    activateCriticalMode() {
        logger.error('🔴 Critical mode activated');
        
        // Only keep absolutely essential services
        this.activeFeatures = new Set(this.config.criticalServices);
        
        this.disabledFeatures = new Set([
            ...this.config.importantServices,
            ...this.config.optionalServices
        ]);
        
        this.emit('operationModeChange', {
            mode: 'critical',
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures)
        });
    }

    /**
     * Disable a specific feature
     */
    disableFeature(featureName) {
        if (this.activeFeatures.has(featureName)) {
            this.activeFeatures.delete(featureName);
            this.disabledFeatures.add(featureName);
            
            logger.info('🔒 Feature disabled', {
                feature: featureName,
                activeFeatures: this.activeFeatures.size,
                disabledFeatures: this.disabledFeatures.size
            });
            
            this.emit('featureDisabled', { feature: featureName });
        }
    }

    /**
     * Enable a specific feature
     */
    enableFeature(featureName) {
        if (this.disabledFeatures.has(featureName)) {
            this.disabledFeatures.delete(featureName);
            this.activeFeatures.add(featureName);
            
            logger.info('🔓 Feature enabled', {
                feature: featureName,
                activeFeatures: this.activeFeatures.size,
                disabledFeatures: this.disabledFeatures.size
            });
            
            this.emit('featureEnabled', { feature: featureName });
        }
    }

    /**
     * Check if a feature is currently active
     */
    isFeatureActive(featureName) {
        return this.activeFeatures.has(featureName);
    }

    /**
     * Evaluate overall system health
     */
    evaluateSystemHealth() {
        const healthyServices = Array.from(this.serviceRegistry.values())
            .filter(service => service.isHealthy);
        
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
        
        // Adjust degradation level based on overall health
        this.adjustDegradationLevel(systemHealth);
        
        return systemHealth;
    }

    /**
     * Get count of unhealthy services by priority
     */
    getUnhealthyServicesCount(priority) {
        return Array.from(this.serviceRegistry.values())
            .filter(service => service.priority === priority && !service.isHealthy)
            .length;
    }

    /**
     * Adjust degradation level based on system health
     */
    adjustDegradationLevel(systemHealth) {
        // Increase degradation if critical services are failing
        if (systemHealth.unhealthyCritical > 0) {
            this.increaseDegradationLevel();
        }
        // Decrease degradation if system is recovering
        else if (systemHealth.unhealthyCritical === 0 && 
                 systemHealth.unhealthyImportant === 0 && 
                 this.degradationLevel > 0) {
            this.decreaseDegradationLevel();
        }
    }

    /**
     * Get current degradation mode
     */
    getDegradationMode() {
        const modes = ['full', 'partial', 'minimal', 'critical'];
        return modes[this.degradationLevel];
    }

    /**
     * Activate emergency protocols
     */
    activateEmergencyProtocols(service) {
        logger.error('🚨 Emergency protocols activated', {
            service: service.name,
            protocol: 'service-restoration'
        });
        
        this.emit('emergencyProtocol', {
            service: service.name,
            protocol: 'service-restoration',
            timestamp: Date.now()
        });
        
        // Implement emergency restoration measures
        this.initiateEmergencyRecovery(service);
    }

    /**
     * Initiate emergency recovery
     */
    async initiateEmergencyRecovery(service) {
        logger.info('🔄 Emergency recovery initiated', {
            service: service.name
        });
        
        // Add recovery attempt
        const attempts = this.recoveryAttempts.get(service.name) || 0;
        this.recoveryAttempts.set(service.name, attempts + 1);
        
        // Emit recovery event
        this.emit('recoveryAttempt', {
            service: service.name,
            attempt: attempts + 1
        });
    }

    /**
     * Initiate service recovery
     */
    initiateServiceRecovery(service) {
        const currentStability = this.stabilityCounters.get(service.name) || 0;
        this.stabilityCounters.set(service.name, currentStability + 1);
        
        if (currentStability >= this.config.stabilityRequirement) {
            logger.info('✅ Service stability achieved', {
                service: service.name,
                stabilityChecks: currentStability
            });
            
            // Re-enable feature if possible
            if (this.canEnableFeature(service.name)) {
                this.enableFeature(service.name);
            }
            
            // Reset stability counter
            this.stabilityCounters.set(service.name, 0);
        }
    }

    /**
     * Check if a feature can be enabled
     */
    canEnableFeature(featureName) {
        // Check if system degradation level allows this feature
        const service = this.serviceRegistry.get(featureName);
        if (!service) return false;
        
        switch (this.degradationLevel) {
            case 0: // Full
                return true;
            case 1: // Partial
                return service.priority !== 'optional';
            case 2: // Minimal
                return service.priority === 'critical';
            case 3: // Critical
                return service.priority === 'critical' && 
                       this.config.criticalServices.includes(featureName);
            default:
                return false;
        }
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, this.config.recoveryCheckInterval);
    }

    /**
     * Perform comprehensive health check
     */
    performHealthCheck() {
        logger.debug('🔍 Performing health check', {
            degradationLevel: this.degradationLevel,
            activeFeatures: this.activeFeatures.size,
            disabledFeatures: this.disabledFeatures.size
        });
        
        const systemHealth = this.evaluateSystemHealth();
        
        this.emit('healthCheck', {
            systemHealth,
            degradationLevel: this.degradationLevel,
            mode: this.getDegradationMode(),
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures)
        });
    }

    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            degradationLevel: this.degradationLevel,
            mode: this.getDegradationMode(),
            activeFeatures: Array.from(this.activeFeatures),
            disabledFeatures: Array.from(this.disabledFeatures),
            services: Array.from(this.serviceRegistry.values()).map(service => ({
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

module.exports = GracefulDegradationManager;
