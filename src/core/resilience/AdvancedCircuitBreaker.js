// src/core/resilience/AdvancedCircuitBreaker.js
// Intelligent Circuit Breaker with Adaptive Threshold Management

const logger = require('../../utils/logger');
const { EventEmitter } = require('events');

class AdvancedCircuitBreaker extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = {
            // Failure threshold configuration
            failureThreshold: options.failureThreshold || 5,
            successThreshold: options.successThreshold || 3,
            timeout: options.timeout || 30000,
            
            // Adaptive threshold configuration
            enableAdaptiveThreshold: options.enableAdaptiveThreshold !== false,
            adaptiveWindow: options.adaptiveWindow || 300000, // 5 minutes
            
            // Response time monitoring
            responseTimeThreshold: options.responseTimeThreshold || 5000,
            enableResponseTimeCircuit: options.enableResponseTimeCircuit !== false,
            
            // Recovery configuration
            recoveryTimeout: options.recoveryTimeout || 10000,
            halfOpenMaxAttempts: options.halfOpenMaxAttempts || 3,
            
            ...options
        };

        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.lastSuccessTime = null;
        this.nextAttemptTime = null;
        
        // Adaptive threshold management
        this.adaptiveMetrics = {
            recentFailures: [],
            recentSuccesses: [],
            adaptiveFailureThreshold: this.config.failureThreshold,
            lastAdaptation: Date.now()
        };
        
        // Response time monitoring
        this.responseTimeMetrics = {
            recentResponseTimes: [],
            averageResponseTime: 0,
            slowResponseCount: 0
        };
        
        // Circuit statistics
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

    /**
     * Execute function with circuit breaker protection
     */
    async execute(fn, context = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        
        this.statistics.totalRequests++;
        
        try {
            // Check circuit state before execution
            await this.checkCircuitState();
            
            // Execute the protected function
            const result = await this.executeWithMonitoring(fn, context, requestId);
            
            // Handle successful execution
            this.handleSuccess(startTime, requestId);
            
            return result;
            
        } catch (error) {
            // Handle execution failure
            this.handleFailure(error, startTime, requestId);
            throw error;
        }
    }

    /**
     * Check and manage circuit state
     */
    async checkCircuitState() {
        const now = Date.now();
        
        switch (this.state) {
            case 'CLOSED':
                // Normal operation - check adaptive thresholds
                if (this.shouldAdaptThreshold()) {
                    this.adaptFailureThreshold();
                }
                break;
                
            case 'OPEN':
                // Circuit is open - check if we should attempt recovery
                if (this.nextAttemptTime && now >= this.nextAttemptTime) {
                    this.transitionToHalfOpen();
                } else {
                    throw new Error('Circuit breaker is OPEN');
                }
                break;
                
            case 'HALF_OPEN':
                // Recovery state - allow limited requests
                if (this.successes >= this.config.successThreshold) {
                    this.transitionToClosed();
                } else if (this.failures >= this.config.halfOpenMaxAttempts) {
                    this.transitionToOpen();
                    throw new Error('Circuit breaker returned to OPEN state');
                }
                break;
        }
    }

    /**
     * Execute function with comprehensive monitoring
     */
    async executeWithMonitoring(fn, context, requestId) {
        const startTime = Date.now();
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Circuit breaker timeout after ${this.config.timeout}ms`));
            }, this.config.timeout);
        });
        
        try {
            // Race between function execution and timeout
            const result = await Promise.race([
                fn(context),
                timeoutPromise
            ]);
            
            // Monitor response time
            const responseTime = Date.now() - startTime;
            this.recordResponseTime(responseTime);
            
            // Check for slow response circuit
            if (this.config.enableResponseTimeCircuit && 
                responseTime > this.config.responseTimeThreshold) {
                this.handleSlowResponse(responseTime, requestId);
            }
            
            return result;
            
        } catch (error) {
            // Enhance error with circuit breaker context
            error.circuitBreakerState = this.state;
            error.requestId = requestId;
            throw error;
        }
    }

    /**
     * Handle successful execution
     */
    handleSuccess(startTime, requestId) {
        const responseTime = Date.now() - startTime;
        
        this.successes++;
        this.statistics.totalSuccesses++;
        this.lastSuccessTime = Date.now();
        
        // Add to adaptive metrics
        this.adaptiveMetrics.recentSuccesses.push({
            timestamp: Date.now(),
            responseTime
        });
        
        // Emit success event
        this.emit('success', {
            requestId,
            responseTime,
            state: this.state,
            consecutiveSuccesses: this.successes
        });
        
        logger.debug('✅ Circuit breaker success', {
            requestId,
            responseTime: `${responseTime}ms`,
            state: this.state,
            consecutiveSuccesses: this.successes
        });
        
        // Check for state transition
        if (this.state === 'HALF_OPEN' && 
            this.successes >= this.config.successThreshold) {
            this.transitionToClosed();
        }
    }

    /**
     * Handle execution failure
     */
    handleFailure(error, startTime, requestId) {
        const responseTime = Date.now() - startTime;
        
        this.failures++;
        this.statistics.totalFailures++;
        this.lastFailureTime = Date.now();
        
        // Add to adaptive metrics
        this.adaptiveMetrics.recentFailures.push({
            timestamp: Date.now(),
            error: error.message,
            responseTime
        });
        
        // Emit failure event
        this.emit('failure', {
            requestId,
            error: error.message,
            responseTime,
            state: this.state,
            consecutiveFailures: this.failures
        });
        
        logger.warn('❌ Circuit breaker failure', {
            requestId,
            error: error.message,
            responseTime: `${responseTime}ms`,
            state: this.state,
            consecutiveFailures: this.failures
        });
        
        // Check for state transition
        if (this.state === 'CLOSED' && 
            this.failures >= this.adaptiveMetrics.adaptiveFailureThreshold) {
            this.transitionToOpen();
        } else if (this.state === 'HALF_OPEN') {
            this.transitionToOpen();
        }
    }

    /**
     * Transition to OPEN state
     */
    transitionToOpen() {
        const previousState = this.state;
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.config.recoveryTimeout;
        this.statistics.circuitOpenCount++;
        this.statistics.lastStateChange = Date.now();
        
        this.emit('stateChange', {
            from: previousState,
            to: 'OPEN',
            reason: 'Failure threshold exceeded',
            nextAttemptTime: this.nextAttemptTime
        });
        
        logger.warn('🔴 Circuit breaker OPEN', {
            previousState,
            failures: this.failures,
            threshold: this.adaptiveMetrics.adaptiveFailureThreshold,
            nextAttemptTime: new Date(this.nextAttemptTime).toISOString()
        });
    }

    /**
     * Transition to HALF_OPEN state
     */
    transitionToHalfOpen() {
        const previousState = this.state;
        this.state = 'HALF_OPEN';
        this.failures = 0;
        this.successes = 0;
        this.statistics.lastStateChange = Date.now();
        
        this.emit('stateChange', {
            from: previousState,
            to: 'HALF_OPEN',
            reason: 'Recovery timeout elapsed'
        });
        
        logger.info('🟡 Circuit breaker HALF_OPEN', {
            previousState,
            maxAttempts: this.config.halfOpenMaxAttempts
        });
    }

    /**
     * Transition to CLOSED state
     */
    transitionToClosed() {
        const previousState = this.state;
        this.state = 'CLOSED';
        this.failures = 0;
        this.successes = 0;
        this.nextAttemptTime = null;
        this.statistics.lastStateChange = Date.now();
        
        this.emit('stateChange', {
            from: previousState,
            to: 'CLOSED',
            reason: 'Recovery successful'
        });
        
        logger.info('🟢 Circuit breaker CLOSED', {
            previousState,
            reason: 'Recovery successful'
        });
    }

    /**
     * Adaptive threshold management
     */
    shouldAdaptThreshold() {
        const now = Date.now();
        const timeSinceLastAdaptation = now - this.adaptiveMetrics.lastAdaptation;
        
        return this.config.enableAdaptiveThreshold && 
               timeSinceLastAdaptation >= this.config.adaptiveWindow;
    }

    /**
     * Adapt failure threshold based on recent patterns
     */
    adaptFailureThreshold() {
        const now = Date.now();
        const windowStart = now - this.config.adaptiveWindow;
        
        // Clean old metrics
        this.adaptiveMetrics.recentFailures = this.adaptiveMetrics.recentFailures
            .filter(f => f.timestamp > windowStart);
        this.adaptiveMetrics.recentSuccesses = this.adaptiveMetrics.recentSuccesses
            .filter(s => s.timestamp > windowStart);
        
        const recentFailureRate = this.adaptiveMetrics.recentFailures.length / 
                                 (this.adaptiveMetrics.recentFailures.length + 
                                  this.adaptiveMetrics.recentSuccesses.length);
        
        // Adjust threshold based on failure rate
        const baseThreshold = this.config.failureThreshold;
        let newThreshold = baseThreshold;
        
        if (recentFailureRate > 0.2) {
            // High failure rate - lower threshold
            newThreshold = Math.max(2, Math.floor(baseThreshold * 0.7));
        } else if (recentFailureRate < 0.05) {
            // Low failure rate - higher threshold
            newThreshold = Math.min(15, Math.ceil(baseThreshold * 1.3));
        }
        
        if (newThreshold !== this.adaptiveMetrics.adaptiveFailureThreshold) {
            logger.info('🔄 Adaptive threshold adjusted', {
                previous: this.adaptiveMetrics.adaptiveFailureThreshold,
                new: newThreshold,
                failureRate: `${(recentFailureRate * 100).toFixed(1)}%`
            });
            
            this.adaptiveMetrics.adaptiveFailureThreshold = newThreshold;
        }
        
        this.adaptiveMetrics.lastAdaptation = now;
    }

    /**
     * Record response time for monitoring
     */
    recordResponseTime(responseTime) {
        this.responseTimeMetrics.recentResponseTimes.push({
            timestamp: Date.now(),
            responseTime
        });
        
        // Keep only recent response times (last 100 requests)
        if (this.responseTimeMetrics.recentResponseTimes.length > 100) {
            this.responseTimeMetrics.recentResponseTimes.shift();
        }
        
        // Calculate average response time
        const sum = this.responseTimeMetrics.recentResponseTimes
            .reduce((total, r) => total + r.responseTime, 0);
        this.responseTimeMetrics.averageResponseTime = 
            sum / this.responseTimeMetrics.recentResponseTimes.length;
    }

    /**
     * Handle slow response detection
     */
    handleSlowResponse(responseTime, requestId) {
        this.responseTimeMetrics.slowResponseCount++;
        
        logger.warn('🐌 Slow response detected', {
            requestId,
            responseTime: `${responseTime}ms`,
            threshold: `${this.config.responseTimeThreshold}ms`,
            slowResponseCount: this.responseTimeMetrics.slowResponseCount
        });
        
        this.emit('slowResponse', {
            requestId,
            responseTime,
            threshold: this.config.responseTimeThreshold
        });
    }

    /**
     * Start adaptive monitoring
     */
    startAdaptiveMonitoring() {
        setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Every minute
    }

    /**
     * Perform circuit health check
     */
    performHealthCheck() {
        const now = Date.now();
        const uptime = now - this.statistics.uptime;
        
        const healthReport = {
            state: this.state,
            uptime: `${Math.floor(uptime / 1000)}s`,
            totalRequests: this.statistics.totalRequests,
            successRate: this.statistics.totalRequests > 0 ? 
                `${((this.statistics.totalSuccesses / this.statistics.totalRequests) * 100).toFixed(1)}%` : 'N/A',
            adaptiveThreshold: this.adaptiveMetrics.adaptiveFailureThreshold,
            averageResponseTime: `${this.responseTimeMetrics.averageResponseTime.toFixed(2)}ms`
        };
        
        logger.debug('🔍 Circuit breaker health check', healthReport);
        
        this.emit('healthCheck', healthReport);
    }

    /**
     * Get comprehensive metrics
     */
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

    /**
     * Utility methods
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Force circuit state change (for testing/emergency)
     */
    forceState(newState) {
        const previousState = this.state;
        this.state = newState;
        
        logger.warn('⚠️ Circuit breaker state forced', {
            from: previousState,
            to: newState,
            reason: 'Manual override'
        });
        
        this.emit('stateChange', {
            from: previousState,
            to: newState,
            reason: 'Manual override'
        });
    }
}

module.exports = AdvancedCircuitBreaker;
