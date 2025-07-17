// src/core/performance/PerformanceController.js
// Unified Performance Orchestration System

const QueryOptimizer = require('./QueryOptimizer');
const MemoryManager = require('./MemoryManager');
const ConcurrentProcessor = require('./ConcurrentProcessor');
const logger = require('../../utils/logger');

class PerformanceController {
    constructor(options = {}) {
        this.config = {
            enableQueryOptimization: options.enableQueryOptimization !== false,
            enableMemoryManagement: options.enableMemoryManagement !== false,
            enableConcurrentProcessing: options.enableConcurrentProcessing !== false,
            performanceTargets: {
                averageResponseTime: options.averageResponseTime || 1500, // ms
                memoryUsageThreshold: options.memoryUsageThreshold || 0.75,
                concurrentTaskCapacity: options.concurrentTaskCapacity || 10
            },
            ...options
        };

        this.components = {};
        this.metrics = {
            totalRequests: 0,
            averageResponseTime: 0,
            memoryOptimization: 0,
            concurrentTasksExecuted: 0,
            performanceGains: 0
        };

        this.initializeComponents();
        this.startPerformanceMonitoring();

        logger.info('🚀 PerformanceController iniciado con arquitectura unificada', {
            config: this.config,
            components: Object.keys(this.components)
        });
    }

    /**
     * Initialize all performance components
     */
    initializeComponents() {
        if (this.config.enableQueryOptimization) {
            this.components.queryOptimizer = new QueryOptimizer({
                maxCacheSize: 1000,
                semanticThreshold: 0.85
            });
        }

        if (this.config.enableMemoryManagement) {
            this.components.memoryManager = new MemoryManager({
                maxMemoryUsage: this.config.performanceTargets.memoryUsageThreshold
            });
        }

        if (this.config.enableConcurrentProcessing) {
            this.components.concurrentProcessor = new ConcurrentProcessor({
                maxWorkers: 4,
                batchSize: 10
            });
        }
    }

    /**
     * Optimized query execution with full performance stack
     */
    async executeOptimizedQuery(query, searchFunction, context = {}) {
        const startTime = Date.now();
        
        try {
            let result;
            
            if (this.components.queryOptimizer) {
                result = await this.components.queryOptimizer.executeOptimizedQuery(
                    query, 
                    searchFunction, 
                    context
                );
            } else {
                result = await searchFunction(query, context);
            }

            const duration = Date.now() - startTime;
            this.updateMetrics(duration, true);
            
            return result;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            this.updateMetrics(duration, false);
            throw error;
        }
    }

    /**
     * Execute concurrent operations with performance optimization
     */
    async executeConcurrentOperations(operations) {
        if (!this.components.concurrentProcessor) {
            logger.warn('ConcurrentProcessor not available, falling back to sequential execution');
            return this.executeSequential(operations);
        }

        const startTime = Date.now();
        
        try {
            const results = await this.components.concurrentProcessor.executeBatch(operations);
            
            const duration = Date.now() - startTime;
            this.metrics.concurrentTasksExecuted += operations.length;
            
            logger.info('✅ Concurrent operations completed', {
                operations: operations.length,
                duration: `${duration}ms`,
                averagePerOperation: `${(duration / operations.length).toFixed(2)}ms`
            });
            
            return results;
            
        } catch (error) {
            logger.error('❌ Concurrent operations failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Memory-optimized data allocation
     */
    allocateOptimizedMemory(type, size, data) {
        if (!this.components.memoryManager) {
            logger.warn('MemoryManager not available, using standard allocation');
            return { data, size, type };
        }

        return this.components.memoryManager.allocateMemory(type, size, data);
    }

    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {
            controller: this.metrics,
            components: {}
        };

        if (this.components.queryOptimizer) {
            metrics.components.queryOptimizer = this.components.queryOptimizer.getPerformanceMetrics();
        }

        if (this.components.memoryManager) {
            metrics.components.memoryManager = this.components.memoryManager.getMemoryMetrics();
        }

        if (this.components.concurrentProcessor) {
            metrics.components.concurrentProcessor = this.components.concurrentProcessor.getMetrics();
        }

        return metrics;
    }

    /**
     * Update controller metrics
     */
    updateMetrics(duration, success) {
        this.metrics.totalRequests++;
        
        if (success) {
            const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
            this.metrics.averageResponseTime = (total + duration) / this.metrics.totalRequests;
        }
    }

    /**
     * Performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            this.performanceHealthCheck();
        }, 60000); // Every minute
    }

    /**
     * Performance health check
     */
    performanceHealthCheck() {
        const metrics = this.getPerformanceMetrics();
        
        logger.info('📊 Performance health check', {
            averageResponseTime: `${metrics.controller.averageResponseTime.toFixed(2)}ms`,
            target: `${this.config.performanceTargets.averageResponseTime}ms`,
            memoryUsage: metrics.components.memoryManager ? 
                `${(metrics.components.memoryManager.system.usage)}` : 'N/A',
            cacheHitRate: metrics.components.queryOptimizer ? 
                `${(metrics.components.queryOptimizer.hitRate * 100).toFixed(1)}%` : 'N/A'
        });
    }

    /**
     * Fallback sequential execution
     */
    async executeSequential(operations) {
        const results = [];
        
        for (const operation of operations) {
            try {
                const result = await operation.function(operation.data);
                results.push({ status: 'fulfilled', value: result });
            } catch (error) {
                results.push({ status: 'rejected', reason: error });
            }
        }
        
        return results;
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        logger.info('🔄 PerformanceController shutting down...');
        
        const shutdownPromises = [];
        
        if (this.components.concurrentProcessor) {
            shutdownPromises.push(this.components.concurrentProcessor.shutdown());
        }
        
        if (this.components.memoryManager) {
            shutdownPromises.push(this.components.memoryManager.shutdown());
        }
        
        await Promise.all(shutdownPromises);
        
        logger.info('✅ PerformanceController shutdown completed');
    }
}

module.exports = PerformanceController;
