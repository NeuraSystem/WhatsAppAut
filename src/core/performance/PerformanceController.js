// src/core/performance/PerformanceController.js
// Unified Performance Orchestration System

const QueryOptimizer = require("./QueryOptimizer");
const MemoryManager = require("./MemoryManager");
const ConcurrentProcessor = require("./ConcurrentProcessor");
const logger = require("../../utils/logger");

class PerformanceController {
  constructor(options = {}) {
    this.config = {
      enableQueryOptimization: options.enableQueryOptimization !== false,
      enableMemoryManagement: options.enableMemoryManagement !== false,
      enableConcurrentProcessing: options.enableConcurrentProcessing !== false,
      performanceTargets: {
        averageResponseTime: options.averageResponseTime || 1500, // ms
        memoryUsageThreshold: options.memoryUsageThreshold || 0.75,
        concurrentTaskCapacity: options.concurrentTaskCapacity || 10,
      },
      ...options,
    };

    this.components = {};
    this.metrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      memoryOptimization: 0,
      concurrentTasksExecuted: 0,
      performanceGains: 0,
    };

    this.isInitialized = false;
    this.emergencyMode = false;
    this.onPerformanceDegradation = null; // Callback for orchestration

    // Don't auto-initialize in constructor for orchestration compatibility
    if (!options.deferInitialization) {
      this.initialize();
    }
  }

  /**
   * Initialize the performance controller
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      this.initializeComponents();
      this.startPerformanceMonitoring();
      this.isInitialized = true;

      logger.info(
        "🚀 PerformanceController iniciado con arquitectura unificada",
        {
          config: this.config,
          components: Object.keys(this.components),
        },
      );

      return true;
    } catch (error) {
      logger.error("❌ Error inicializando PerformanceController:", error);
      return false;
    }
  }

  /**
   * Initialize all performance components
   */
  initializeComponents() {
    if (this.config.enableQueryOptimization) {
      this.components.queryOptimizer = new QueryOptimizer({
        maxCacheSize: 1000,
        semanticThreshold: 0.85,
      });
    }

    if (this.config.enableMemoryManagement) {
      this.components.memoryManager = new MemoryManager({
        maxMemoryUsage: this.config.performanceTargets.memoryUsageThreshold,
      });
    }

    if (this.config.enableConcurrentProcessing) {
      this.components.concurrentProcessor = new ConcurrentProcessor({
        maxWorkers: 4,
        batchSize: 10,
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
          context,
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
      logger.warn(
        "ConcurrentProcessor not available, falling back to sequential execution",
      );
      return this.executeSequential(operations);
    }

    const startTime = Date.now();

    try {
      const results =
        await this.components.concurrentProcessor.executeBatch(operations);

      const duration = Date.now() - startTime;
      this.metrics.concurrentTasksExecuted += operations.length;

      logger.info("✅ Concurrent operations completed", {
        operations: operations.length,
        duration: `${duration}ms`,
        averagePerOperation: `${(duration / operations.length).toFixed(2)}ms`,
      });

      return results;
    } catch (error) {
      logger.error("❌ Concurrent operations failed", { error: error.message });
      throw error;
    }
  }

  /**
   * Memory-optimized data allocation
   */
  allocateOptimizedMemory(type, size, data) {
    if (!this.components.memoryManager) {
      logger.warn("MemoryManager not available, using standard allocation");
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
      components: {},
    };

    if (this.components.queryOptimizer) {
      metrics.components.queryOptimizer =
        this.components.queryOptimizer.getPerformanceMetrics();
    }

    if (this.components.memoryManager) {
      metrics.components.memoryManager =
        this.components.memoryManager.getMemoryMetrics();
    }

    if (this.components.concurrentProcessor) {
      metrics.components.concurrentProcessor =
        this.components.concurrentProcessor.getMetrics();
    }

    return metrics;
  }

  /**
   * Update controller metrics
   */
  updateMetrics(duration, success) {
    this.metrics.totalRequests++;

    if (success) {
      const total =
        this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
      this.metrics.averageResponseTime =
        (total + duration) / this.metrics.totalRequests;

      // Check for performance degradation
      if (
        this.metrics.averageResponseTime >
        this.config.performanceTargets.averageResponseTime
      ) {
        this.triggerPerformanceDegradation();
      }
    }
  }

  /**
   * Trigger performance degradation callback
   * @private
   */
  triggerPerformanceDegradation() {
    if (
      this.onPerformanceDegradation &&
      typeof this.onPerformanceDegradation === "function"
    ) {
      this.onPerformanceDegradation({
        averageResponseTime: this.metrics.averageResponseTime,
        target: this.config.performanceTargets.averageResponseTime,
        degradationLevel:
          this.metrics.averageResponseTime /
          this.config.performanceTargets.averageResponseTime,
      });
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

    logger.info("📊 Performance health check", {
      averageResponseTime: `${metrics.controller.averageResponseTime.toFixed(2)}ms`,
      target: `${this.config.performanceTargets.averageResponseTime}ms`,
      memoryUsage: metrics.components.memoryManager
        ? `${metrics.components.memoryManager.system.usage}`
        : "N/A",
      cacheHitRate: metrics.components.queryOptimizer
        ? `${(metrics.components.queryOptimizer.hitRate * 100).toFixed(1)}%`
        : "N/A",
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
        results.push({ status: "fulfilled", value: result });
      } catch (error) {
        results.push({ status: "rejected", reason: error });
      }
    }

    return results;
  }

  /**
   * Optimizes operation for execution
   * @param {Function} operation - Operation to optimize
   * @param {Object} context - Execution context
   * @returns {Function} Optimized operation
   */
  async optimizeOperation(operation, context = {}) {
    if (!this.isInitialized) {
      return operation;
    }

    // Apply performance optimizations based on context
    return async (ctx) => {
      // Memory optimization
      if (this.components.memoryManager) {
        await this.components.memoryManager.optimizeForOperation();
      }

      // Execute the operation
      return await operation(ctx);
    };
  }

  /**
   * Activate emergency mode
   */
  activateEmergencyMode() {
    this.emergencyMode = true;
    logger.warn("⚠️ PerformanceController: Emergency mode activated");

    // Disable non-critical optimizations
    if (this.components.queryOptimizer) {
      this.components.queryOptimizer.setMode("minimal");
    }
  }

  /**
   * Deactivate emergency mode
   */
  deactivateEmergencyMode() {
    this.emergencyMode = false;
    logger.info("✅ PerformanceController: Emergency mode deactivated");

    // Re-enable optimizations
    if (this.components.queryOptimizer) {
      this.components.queryOptimizer.setMode("full");
    }
  }

  /**
   * Force system optimization
   * @returns {Promise<Object>} Optimization results
   */
  async optimize() {
    logger.info("🔧 PerformanceController: Iniciando optimización forzada...");

    const results = {
      memoryCleanup: null,
      cacheOptimization: null,
      concurrentOptimization: null,
    };

    try {
      // Memory cleanup
      if (this.components.memoryManager) {
        results.memoryCleanup =
          await this.components.memoryManager.forceCleanup();
      }

      // Cache optimization
      if (this.components.queryOptimizer) {
        results.cacheOptimization =
          await this.components.queryOptimizer.optimize();
      }

      // Concurrent processor optimization
      if (this.components.concurrentProcessor) {
        results.concurrentOptimization =
          await this.components.concurrentProcessor.optimize();
      }

      logger.info("✅ PerformanceController: Optimización completada");
      return results;
    } catch (error) {
      logger.error(
        "❌ PerformanceController: Error durante optimización:",
        error,
      );
      throw error;
    }
  }

  /**
   * Get status for orchestration
   * @returns {Promise<Object>} Status information
   */
  async getStatus() {
    return {
      isInitialized: this.isInitialized,
      emergencyMode: this.emergencyMode,
      metrics: this.getPerformanceMetrics(),
      componentsStatus: {
        queryOptimizer: !!this.components.queryOptimizer,
        memoryManager: !!this.components.memoryManager,
        concurrentProcessor: !!this.components.concurrentProcessor,
      },
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info("🔄 PerformanceController shutting down...");

    const shutdownPromises = [];

    if (this.components.concurrentProcessor) {
      shutdownPromises.push(this.components.concurrentProcessor.shutdown());
    }

    if (this.components.memoryManager) {
      shutdownPromises.push(this.components.memoryManager.shutdown());
    }

    await Promise.all(shutdownPromises);

    this.isInitialized = false;

    logger.info("✅ PerformanceController shutdown completed");
  }
}

module.exports = PerformanceController;
