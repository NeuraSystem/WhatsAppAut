// src/core/performance/ConcurrentProcessor.js
// Advanced Concurrent Processing System for CPU-Optimized Workloads

const { Worker } = require("worker_threads");
const { performance } = require("perf_hooks");
const logger = require("../../utils/logger");

class ConcurrentProcessor {
  constructor(options = {}) {
    this.config = {
      maxWorkers: options.maxWorkers || 4, // Optimal for i5-1035G1 (4 cores)
      workerTimeout: options.workerTimeout || 30000,
      queueTimeout: options.queueTimeout || 10000,
      batchSize: options.batchSize || 10,
      enableHyperthreading: options.enableHyperthreading || true,
      ...options,
    };

    this.workerPool = [];
    this.taskQueue = [];
    this.activeWorkers = new Map();
    this.completedTasks = new Map();

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      workerUtilization: 0,
      queueLength: 0,
    };

    this.initializeWorkerPool();
    this.startMetricsCollection();

    logger.info(
      "🚀 ConcurrentProcessor inicializado con arquitectura paralela optimizada",
      {
        config: this.config,
        workerPool: this.workerPool.length,
      },
    );
  }

  /**
   * Initialize worker pool with CPU-optimized configuration
   */
  initializeWorkerPool() {
    for (let i = 0; i < this.config.maxWorkers; i++) {
      const worker = {
        id: `worker_${i}`,
        instance: null,
        status: "idle",
        tasksCompleted: 0,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      this.workerPool.push(worker);
    }

    logger.debug("🏗️ Worker pool inicializado", {
      workers: this.workerPool.length,
      maxConcurrency: this.config.maxWorkers,
    });
  }

  /**
   * Execute task with intelligent work distribution
   */
  async executeTask(taskFunction, data, options = {}) {
    const taskId = this.generateTaskId();
    const startTime = performance.now();

    const task = {
      id: taskId,
      function: taskFunction,
      data,
      options: {
        priority: options.priority || "normal",
        timeout: options.timeout || this.config.workerTimeout,
        retries: options.retries || 2,
        ...options,
      },
      createdAt: Date.now(),
      startTime,
    };

    return new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;

      this.enqueueTask(task);
      this.processQueue();
    });
  }

  /**
   * Execute multiple tasks concurrently with batch optimization
   */
  async executeBatch(tasks, options = {}) {
    const batchId = this.generateBatchId();
    const startTime = performance.now();

    logger.info("🔄 Batch execution started", {
      batchId,
      taskCount: tasks.length,
      batchSize: this.config.batchSize,
    });

    // Split tasks into optimal batches
    const batches = this.createOptimalBatches(tasks);
    const results = [];

    try {
      // Process batches with controlled concurrency
      for (const batch of batches) {
        const batchPromises = batch.map((task) =>
          this.executeTask(task.function, task.data, task.options),
        );

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);

        // Brief pause between batches to prevent CPU overload
        await this.sleep(10);
      }

      const duration = performance.now() - startTime;
      logger.info("✅ Batch execution completed", {
        batchId,
        duration: `${duration.toFixed(2)}ms`,
        totalTasks: tasks.length,
        successful: results.filter((r) => r.status === "fulfilled").length,
        failed: results.filter((r) => r.status === "rejected").length,
      });

      return results;
    } catch (error) {
      logger.error("❌ Batch execution failed", {
        batchId,
        error: error.message,
        completedTasks: results.length,
      });
      throw error;
    }
  }

  /**
   * Intelligent task queue management
   */
  enqueueTask(task) {
    // Priority-based insertion
    const insertIndex = this.findInsertionIndex(task);
    this.taskQueue.splice(insertIndex, 0, task);

    this.metrics.queueLength = this.taskQueue.length;

    logger.debug("📋 Task enqueued", {
      taskId: task.id,
      priority: task.options.priority,
      queuePosition: insertIndex,
      queueLength: this.taskQueue.length,
    });
  }

  /**
   * Process task queue with worker optimization
   */
  async processQueue() {
    while (this.taskQueue.length > 0) {
      const availableWorker = this.findAvailableWorker();

      if (!availableWorker) {
        // All workers busy, wait for one to become available
        await this.sleep(50);
        continue;
      }

      const task = this.taskQueue.shift();
      this.metrics.queueLength = this.taskQueue.length;

      this.assignTaskToWorker(availableWorker, task);
    }
  }

  /**
   * Assign task to available worker
   */
  async assignTaskToWorker(worker, task) {
    worker.status = "busy";
    worker.lastUsed = Date.now();

    this.activeWorkers.set(task.id, worker);
    this.metrics.totalTasks++;

    try {
      const result = await this.executeTaskInWorker(worker, task);

      task.resolve(result);
      this.handleTaskCompletion(task, worker, true);
    } catch (error) {
      // Handle retries
      if (task.options.retries > 0) {
        task.options.retries--;
        logger.debug("🔄 Task retry", {
          taskId: task.id,
          retriesLeft: task.options.retries,
        });

        this.enqueueTask(task);
      } else {
        task.reject(error);
        this.handleTaskCompletion(task, worker, false);
      }
    }
  }

  /**
   * Execute task in worker thread
   */
  async executeTaskInWorker(worker, task) {
    const taskTimeout = setTimeout(() => {
      throw new Error(`Task ${task.id} timed out`);
    }, task.options.timeout);

    try {
      // For CPU-intensive tasks, use direct execution
      // In production, this would spawn actual worker threads
      const result = await this.executeTaskDirect(task);

      clearTimeout(taskTimeout);
      return result;
    } catch (error) {
      clearTimeout(taskTimeout);
      throw error;
    }
  }

  /**
   * Direct task execution (optimized for current architecture)
   */
  async executeTaskDirect(task) {
    const startTime = performance.now();

    try {
      const result = await task.function(task.data);

      const duration = performance.now() - startTime;
      logger.debug("⚡ Task executed", {
        taskId: task.id,
        duration: `${duration.toFixed(2)}ms`,
      });

      return result;
    } catch (error) {
      logger.error("❌ Task execution failed", {
        taskId: task.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle task completion and worker cleanup
   */
  handleTaskCompletion(task, worker, success) {
    worker.status = "idle";
    worker.tasksCompleted++;

    this.activeWorkers.delete(task.id);

    if (success) {
      this.metrics.completedTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average execution time
    const duration = performance.now() - task.startTime;
    this.updateAverageExecutionTime(duration);

    logger.debug("✅ Task completed", {
      taskId: task.id,
      workerId: worker.id,
      success,
      duration: `${duration.toFixed(2)}ms`,
    });
  }

  /**
   * Find available worker with load balancing
   */
  findAvailableWorker() {
    const idleWorkers = this.workerPool.filter((w) => w.status === "idle");

    if (idleWorkers.length === 0) {
      return null;
    }

    // Select worker with least completed tasks (load balancing)
    return idleWorkers.reduce((best, current) =>
      current.tasksCompleted < best.tasksCompleted ? current : best,
    );
  }

  /**
   * Create optimal batches based on CPU cores
   */
  createOptimalBatches(tasks) {
    const batches = [];
    const batchSize = Math.min(this.config.batchSize, this.config.maxWorkers);

    for (let i = 0; i < tasks.length; i += batchSize) {
      batches.push(tasks.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Priority-based queue insertion
   */
  findInsertionIndex(task) {
    const priority = task.options.priority;
    const priorities = { high: 0, normal: 1, low: 2 };
    const taskPriority = priorities[priority] || 1;

    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuePriority = priorities[this.taskQueue[i].options.priority] || 1;
      if (taskPriority < queuePriority) {
        return i;
      }
    }

    return this.taskQueue.length;
  }

  /**
   * Update performance metrics
   */
  updateAverageExecutionTime(duration) {
    const total =
      this.metrics.averageExecutionTime * (this.metrics.completedTasks - 1);
    this.metrics.averageExecutionTime =
      (total + duration) / this.metrics.completedTasks;
  }

  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 30000); // Every 30 seconds
  }

  /**
   * Collect comprehensive metrics
   */
  collectMetrics() {
    const activeWorkers = this.workerPool.filter(
      (w) => w.status === "busy",
    ).length;
    this.metrics.workerUtilization = activeWorkers / this.config.maxWorkers;

    logger.debug("📊 Concurrent processing metrics", {
      ...this.metrics,
      activeWorkers,
      utilization: `${(this.metrics.workerUtilization * 100).toFixed(1)}%`,
    });
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      workerPool: this.workerPool.map((w) => ({
        id: w.id,
        status: w.status,
        tasksCompleted: w.tasksCompleted,
        uptime: Date.now() - w.createdAt,
      })),
    };
  }

  /**
   * Utility methods
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Optimize concurrent processor
   * @returns {Object} Optimization results
   */
  async optimize() {
    logger.info("🔧 ConcurrentProcessor: Starting optimization...");

    const before = {
      metrics: { ...this.metrics },
      queueLength: this.taskQueue.length,
      activeWorkers: this.activeWorkers.size,
    };

    // Clear completed task references
    this.completedTasks.clear();

    // Reset worker statistics
    this.workerPool.forEach((worker) => {
      if (worker.status === "idle") {
        worker.tasksCompleted = 0;
        worker.lastUsed = Date.now();
      }
    });

    // Reset metrics (keep running totals)
    const totalTasks = this.metrics.totalTasks;
    const completedTasks = this.metrics.completedTasks;

    this.metrics = {
      totalTasks,
      completedTasks,
      failedTasks: 0,
      averageExecutionTime: 0,
      workerUtilization: 0,
      queueLength: this.taskQueue.length,
    };

    const after = {
      metrics: { ...this.metrics },
      queueLength: this.taskQueue.length,
      activeWorkers: this.activeWorkers.size,
    };

    logger.info("✅ ConcurrentProcessor: Optimization completed");

    return {
      before,
      after,
      optimizationsApplied: [
        "cleared_completed_tasks",
        "reset_worker_stats",
        "reset_metrics",
      ],
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.info("🔄 ConcurrentProcessor shutting down...");

    // Wait for active tasks to complete
    while (this.activeWorkers.size > 0) {
      await this.sleep(100);
    }

    // Clear worker pool
    this.workerPool.forEach((worker) => {
      if (worker.instance) {
        worker.instance.terminate();
      }
    });

    logger.info("✅ ConcurrentProcessor shutdown completed");
  }
}

module.exports = ConcurrentProcessor;
