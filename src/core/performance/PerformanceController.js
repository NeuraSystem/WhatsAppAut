const { Worker } = require('worker_threads');
const { performance } = require('perf_hooks');
const logger = require('../../utils/logger');
const { LRUCache, MetricsLRUCache } = require('../../utils/cache');
const { getEmbeddingEngine } = require('../../services/embeddingEngine');
const config = require('../../../config/config');

class ConcurrentProcessor {
    constructor(options = {}) {
        this.config = {
            maxWorkers: options.maxWorkers || 4,
            workerTimeout: options.workerTimeout || 30000,
            queueTimeout: options.queueTimeout || 10000,
            batchSize: options.batchSize || 10,
            enableHyperthreading: options.enableHyperthreading || true,
            ...options
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
            queueLength: 0
        };
        this.initializeWorkerPool();
        this.startMetricsCollection();
        logger.info('🚀 ConcurrentProcessor inicializado con arquitectura paralela optimizada', {
            config: this.config,
            workerPool: this.workerPool.length
        });
    }

    initializeWorkerPool() {
        for (let i = 0; i < this.config.maxWorkers; i++) {
            const worker = {
                id: `worker_${i}`,
                instance: null,
                status: 'idle',
                tasksCompleted: 0,
                createdAt: Date.now(),
                lastUsed: Date.now()
            };
            this.workerPool.push(worker);
        }
        logger.debug('🏗️ Worker pool inicializado', {
            workers: this.workerPool.length,
            maxConcurrency: this.config.maxWorkers
        });
    }

    async executeTask(taskFunction, data, options = {}) {
        const taskId = this.generateTaskId();
        const startTime = performance.now();
        const task = {
            id: taskId,
            function: taskFunction,
            data,
            options: {
                priority: options.priority || 'normal',
                timeout: options.timeout || this.config.workerTimeout,
                retries: options.retries || 2,
                ...options
            },
            createdAt: Date.now(),
            startTime
        };
        return new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
            this.enqueueTask(task);
            this.processQueue();
        });
    }

    async executeBatch(tasks, options = {}) {
        const batchId = this.generateBatchId();
        const startTime = performance.now();
        logger.info('🔄 Batch execution started', {
            batchId,
            taskCount: tasks.length,
            batchSize: this.config.batchSize
        });
        const batches = this.createOptimalBatches(tasks);
        const results = [];
        try {
            for (const batch of batches) {
                const batchPromises = batch.map((task) =>
                    this.executeTask(task.function, task.data, task.options)
                );
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
                await this.sleep(10);
            }
            const duration = performance.now() - startTime;
            logger.info('✅ Batch execution completed', {
                batchId,
                duration: `${duration.toFixed(2)}ms`,
                totalTasks: tasks.length,
                successful: results.filter((r) => r.status === 'fulfilled').length,
                failed: results.filter((r) => r.status === 'rejected').length
            });
            return results;
        } catch (error) {
            logger.error('❌ Batch execution failed', {
                batchId,
                error: error.message,
                completedTasks: results.length
            });
            throw error;
        }
    }

    enqueueTask(task) {
        const insertIndex = this.findInsertionIndex(task);
        this.taskQueue.splice(insertIndex, 0, task);
        this.metrics.queueLength = this.taskQueue.length;
        logger.debug('📋 Task enqueued', {
            taskId: task.id,
            priority: task.options.priority,
            queuePosition: insertIndex,
            queueLength: this.taskQueue.length
        });
    }

    async processQueue() {
        while (this.taskQueue.length > 0) {
            const availableWorker = this.findAvailableWorker();
            if (!availableWorker) {
                await this.sleep(50);
                continue;
            }
            const task = this.taskQueue.shift();
            this.metrics.queueLength = this.taskQueue.length;
            this.assignTaskToWorker(availableWorker, task);
        }
    }

    async assignTaskToWorker(worker, task) {
        worker.status = 'busy';
        worker.lastUsed = Date.now();
        this.activeWorkers.set(task.id, worker);
        this.metrics.totalTasks++;
        try {
            const result = await this.executeTaskInWorker(worker, task);
            task.resolve(result);
            this.handleTaskCompletion(task, worker, true);
        } catch (error) {
            if (task.options.retries > 0) {
                task.options.retries--;
                logger.debug('🔄 Task retry', {
                    taskId: task.id,
                    retriesLeft: task.options.retries
                });
                this.enqueueTask(task);
            } else {
                task.reject(error);
                this.handleTaskCompletion(task, worker, false);
            }
        }
    }

    async executeTaskInWorker(worker, task) {
        const taskTimeout = setTimeout(() => {
            throw new Error(`Task ${task.id} timed out`);
        }, task.options.timeout);
        try {
            const result = await this.executeTaskDirect(task);
            clearTimeout(taskTimeout);
            return result;
        } catch (error) {
            clearTimeout(taskTimeout);
            throw error;
        }
    }

    async executeTaskDirect(task) {
        const startTime = performance.now();
        try {
            const result = await task.function(task.data);
            const duration = performance.now() - startTime;
            logger.debug('⚡ Task executed', {
                taskId: task.id,
                duration: `${duration.toFixed(2)}ms`
            });
            return result;
        } catch (error) {
            logger.error('❌ Task execution failed', {
                taskId: task.id,
                error: error.message
            });
            throw error;
        }
    }

    handleTaskCompletion(task, worker, success) {
        worker.status = 'idle';
        worker.tasksCompleted++;
        this.activeWorkers.delete(task.id);
        if (success) {
            this.metrics.completedTasks++;
        } else {
            this.metrics.failedTasks++;
        }
        const duration = performance.now() - task.startTime;
        this.updateAverageExecutionTime(duration);
        logger.debug('✅ Task completed', {
            taskId: task.id,
            workerId: worker.id,
            success,
            duration: `${duration.toFixed(2)}ms`
        });
    }

    findAvailableWorker() {
        const idleWorkers = this.workerPool.filter((w) => w.status === 'idle');
        if (idleWorkers.length === 0) {
            return null;
        }
        return idleWorkers.reduce((best, current) =>
            current.tasksCompleted < best.tasksCompleted ? current : best
        );
    }

    createOptimalBatches(tasks) {
        const batches = [];
        const batchSize = Math.min(this.config.batchSize, this.config.maxWorkers);
        for (let i = 0; i < tasks.length; i += batchSize) {
            batches.push(tasks.slice(i, i + batchSize));
        }
        return batches;
    }

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

    updateAverageExecutionTime(duration) {
        const total = this.metrics.averageExecutionTime * (this.metrics.completedTasks - 1);
        this.metrics.averageExecutionTime = (total + duration) / this.metrics.completedTasks;
    }

    startMetricsCollection() {
        setInterval(() => {
            this.collectMetrics();
        }, 30000);
    }

    collectMetrics() {
        const activeWorkers = this.workerPool.filter((w) => w.status === 'busy').length;
        this.metrics.workerUtilization = activeWorkers / this.config.maxWorkers;
        logger.debug('📊 Concurrent processing metrics', {
            ...this.metrics,
            activeWorkers,
            utilization: `${(this.metrics.workerUtilization * 100).toFixed(1)}%`
        });
    }

    getMetrics() {
        return {
            ...this.metrics,
            workerPool: this.workerPool.map((w) => ({
                id: w.id,
                status: w.status,
                tasksCompleted: w.tasksCompleted,
                uptime: Date.now() - w.createdAt
            }))
        };
    }

    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async optimize() {
        logger.info('🔧 ConcurrentProcessor: Starting optimization...');
        const before = {
            metrics: { ...this.metrics },
            queueLength: this.taskQueue.length,
            activeWorkers: this.activeWorkers.size
        };
        this.completedTasks.clear();
        this.workerPool.forEach((worker) => {
            if (worker.status === 'idle') {
                worker.tasksCompleted = 0;
                worker.lastUsed = Date.now();
            }
        });
        const totalTasks = this.metrics.totalTasks;
        const completedTasks = this.metrics.completedTasks;
        this.metrics = {
            totalTasks,
            completedTasks,
            failedTasks: 0,
            averageExecutionTime: 0,
            workerUtilization: 0,
            queueLength: this.taskQueue.length
        };
        const after = {
            metrics: { ...this.metrics },
            queueLength: this.taskQueue.length,
            activeWorkers: this.activeWorkers.size
        };
        logger.info('✅ ConcurrentProcessor: Optimization completed');
        return {
            before,
            after,
            optimizationsApplied: [
                'cleared_completed_tasks',
                'reset_worker_stats',
                'reset_metrics'
            ]
        };
    }

    async shutdown() {
        logger.info('🔄 ConcurrentProcessor shutting down...');
        while (this.activeWorkers.size > 0) {
            await this.sleep(100);
        }
        this.workerPool.forEach((worker) => {
            if (worker.instance) {
                worker.instance.terminate();
            }
        });
        logger.info('✅ ConcurrentProcessor shutdown completed');
    }
}

class MemoryManager {
    constructor(options = {}) {
        this.config = {
            maxMemoryUsage: options.maxMemoryUsage || 0.75,
            gcThreshold: options.gcThreshold || 0.85,
            monitoringInterval: options.monitoringInterval || 30000,
            memoryPoolSize: options.memoryPoolSize || 1024 * 1024 * 100,
            ...options
        };
        this.memoryPools = new Map();
        this.memoryMetrics = {
            peak: 0,
            current: 0,
            allocated: 0,
            freed: 0,
            gcCycles: 0,
            lastGC: Date.now()
        };
        this.activeReferences = new WeakMap();
        this.monitoringTimer = null;
        this.initializeMemoryPools();
        this.startMonitoring();
        logger.info('🧠 MemoryManager inicializado con arquitectura de pools optimizada', {
            config: this.config,
            availableMemory: this.getAvailableMemory()
        });
    }

    initializeMemoryPools() {
        this.memoryPools.set('embeddings', { type: 'float32', size: this.config.memoryPoolSize, allocated: 0, pool: [] });
        this.memoryPools.set('queries', { type: 'string', size: this.config.memoryPoolSize / 2, allocated: 0, pool: [] });
        this.memoryPools.set('cache', { type: 'object', size: this.config.memoryPoolSize / 4, allocated: 0, pool: [] });
        logger.debug('🏗️ Memory pools inicializados', { pools: Array.from(this.memoryPools.keys()) });
    }

    allocateMemory(type, size, data = null) {
        const pool = this.memoryPools.get(type);
        if (!pool) {
            logger.warn('⚠️ Pool type not found, using default allocation', { type });
            return this.fallbackAllocation(size, data);
        }
        const currentMemory = this.getCurrentMemoryUsage();
        if (currentMemory > this.config.maxMemoryUsage) {
            logger.warn('🚨 Memory threshold exceeded, triggering cleanup');
            this.performIntelligentCleanup();
        }
        const allocation = this.allocateFromPool(pool, size, data);
        this.memoryMetrics.allocated += size;
        this.memoryMetrics.current = currentMemory;
        if (currentMemory > this.memoryMetrics.peak) {
            this.memoryMetrics.peak = currentMemory;
        }
        return allocation;
    }

    allocateFromPool(pool, size, data) {
        const reusableIndex = pool.pool.findIndex((item) => item && item.size >= size && !item.inUse);
        if (reusableIndex !== -1) {
            const reusable = pool.pool[reusableIndex];
            reusable.inUse = true;
            reusable.data = data;
            logger.debug('♻️ Memory reused from pool', { type: pool.type, size });
            return reusable;
        }
        const allocation = {
            id: this.generateAllocationId(),
            type: pool.type,
            size,
            data,
            inUse: true,
            createdAt: Date.now(),
            accessCount: 0
        };
        pool.pool.push(allocation);
        pool.allocated += size;
        logger.debug('🆕 New memory allocation created', {
            type: pool.type,
            size,
            totalAllocated: pool.allocated
        });
        return allocation;
    }

    performIntelligentCleanup() {
        const startTime = performance.now();
        let freedMemory = 0;
        for (const [type, pool] of this.memoryPools.entries()) {
            const before = pool.allocated;
            this.cleanupPool(pool);
            const freed = before - pool.allocated;
            freedMemory += freed;
            logger.debug('🧹 Pool cleanup completed', {
                type,
                freedMemory: freed,
                remaining: pool.pool.length
            });
        }
        if (this.getCurrentMemoryUsage() > this.config.gcThreshold) {
            this.forceGarbageCollection();
        }
        this.memoryMetrics.freed += freedMemory;
        this.memoryMetrics.lastGC = Date.now();
        const duration = performance.now() - startTime;
        logger.info('✅ Memory cleanup completed', {
            duration: `${duration.toFixed(2)}ms`,
            freedMemory,
            currentUsage: this.getCurrentMemoryUsage()
        });
    }

    cleanupPool(pool) {
        const cutoffTime = Date.now() - 300000;
        const initialLength = pool.pool.length;
        pool.pool = pool.pool.filter((allocation) => {
            if (!allocation.inUse && allocation.createdAt < cutoffTime) {
                pool.allocated -= allocation.size;
                return false;
            }
            if (allocation.accessCount < 2 && allocation.createdAt < cutoffTime) {
                allocation.inUse = false;
                allocation.data = null;
            }
            return true;
        });
        logger.debug('🗑️ Pool cleanup stats', {
            type: pool.type,
            removed: initialLength - pool.pool.length,
            remaining: pool.pool.length
        });
    }

    forceGarbageCollection() {
        const before = this.getCurrentMemoryUsage();
        if (global.gc) {
            global.gc();
            this.memoryMetrics.gcCycles++;
            const after = this.getCurrentMemoryUsage();
            logger.info('🗑️ Forced garbage collection', {
                before: `${(before * 100).toFixed(1)}%`,
                after: `${(after * 100).toFixed(1)}%`,
                freed: `${((before - after) * 100).toFixed(1)}%`
            });
        } else {
            logger.warn('⚠️ Garbage collection not available');
        }
    }

    getCurrentMemoryUsage() {
        const memUsage = process.memoryUsage();
        const totalMemory = this.getTotalSystemMemory();
        return memUsage.heapUsed / totalMemory;
    }

    getAvailableMemory() {
        const memUsage = process.memoryUsage();
        const totalMemory = this.getTotalSystemMemory();
        return {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
            systemTotal: Math.round(totalMemory / 1024 / 1024),
            usage: `${((memUsage.heapUsed / totalMemory) * 100).toFixed(1)}%`
        };
    }

    getTotalSystemMemory() {
        return 16 * 1024 * 1024 * 1024;
    }

    startMonitoring() {
        this.monitoringTimer = setInterval(() => {
            this.monitorMemoryUsage();
        }, this.config.monitoringInterval);
        logger.debug('📊 Memory monitoring started', {
            interval: this.config.monitoringInterval
        });
    }

    monitorMemoryUsage() {
        const currentUsage = this.getCurrentMemoryUsage();
        const memInfo = this.getAvailableMemory();
        logger.debug('📈 Memory usage report', {
            current: `${(currentUsage * 100).toFixed(1)}%`,
            peak: `${(this.memoryMetrics.peak * 100).toFixed(1)}%`,
            ...memInfo
        });
        if (currentUsage > this.config.maxMemoryUsage) {
            logger.warn('🚨 Memory usage threshold exceeded');
            this.performIntelligentCleanup();
        }
        this.memoryMetrics.current = currentUsage;
        if (currentUsage > this.memoryMetrics.peak) {
            this.memoryMetrics.peak = currentUsage;
        }
    }

    getMemoryMetrics() {
        return {
            ...this.memoryMetrics,
            pools: Array.from(this.memoryPools.entries()).map(([type, pool]) => ({
                type,
                allocated: pool.allocated,
                count: pool.pool.length,
                active: pool.pool.filter((item) => item.inUse).length
            })),
            system: this.getAvailableMemory()
        };
    }

    generateAllocationId() {
        return `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    fallbackAllocation(size, data) {
        logger.warn('⚠️ Using fallback allocation');
        return {
            id: this.generateAllocationId(),
            type: 'fallback',
            size,
            data,
            inUse: true,
            createdAt: Date.now(),
            accessCount: 0
        };
    }

    async optimizeForOperation() {
        const currentUsage = this.getCurrentMemoryUsage();
        if (currentUsage > this.config.maxMemoryUsage * 0.8) {
            logger.debug('🔧 Optimizing memory before operation');
            this.performIntelligentCleanup();
        }
    }

    async forceCleanup() {
        const before = this.getCurrentMemoryUsage();
        const beforeMetrics = { ...this.memoryMetrics };
        this.performIntelligentCleanup();
        const after = this.getCurrentMemoryUsage();
        return {
            beforeUsage: before,
            afterUsage: after,
            memoryFreed: before - after,
            beforeMetrics,
            afterMetrics: { ...this.memoryMetrics }
        };
    }

    async shutdown() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
        for (const [type, pool] of this.memoryPools.entries()) {
            pool.pool = [];
            pool.allocated = 0;
        }
        logger.info('🔄 MemoryManager shutdown completed');
    }
}

class QueryOptimizer {
    constructor(customConfig = {}) {
        this.config = {
            maxCacheSize: customConfig.maxCacheSize || config.performance?.maxCacheSize || 1000,
            defaultTTL: customConfig.defaultTTL || 300000,
            semanticThreshold: customConfig.semanticThreshold || 0.85,
            timeoutMs: customConfig.timeoutMs || 30000,
            emergencyMode: false,
            ...customConfig
        };
        this.operationMode = 'full';
        this.embeddingEngine = null;
        this.queryCache = new LRUCache({ max: this.config.maxCacheSize, ttl: this.config.defaultTTL });
        this.semanticCache = new LRUCache({ max: Math.floor(this.config.maxCacheSize / 2), ttl: this.config.defaultTTL * 2 });
        this.priceCache = new LRUCache({ max: 500, ttl: this.config.defaultTTL * 4 });
        this.frequencyMap = new Map();
        this.performanceMetrics = {
            hits: 0,
            misses: 0,
            errors: 0,
            avgResponseTime: 0,
            totalRequests: 0,
            semanticMatches: 0,
            priceQueries: 0,
            conversationQueries: 0,
            lastOptimization: Date.now()
        };
        this.queryPatterns = {
            pricePatterns: [/precio/i, /costo/i, /vale/i, /cuanto/i, /tarifa/i],
            devicePatterns: [/iphone/i, /samsung/i, /xiaomi/i, /huawei/i, /motorola/i, /celular/i, /telefono/i, /movil/i],
            servicePatterns: [/reparacion/i, /arreglo/i, /cambio/i, /pantalla/i, /bateria/i]
        };
        this.initializeOptimizer();
    }

    async initializeOptimizer() {
        try {
            this.embeddingEngine = await getEmbeddingEngine();
            logger.info('🚀 QueryOptimizer: Inicializado con embedding engine');
        } catch (error) {
            logger.error('❌ QueryOptimizer: Error inicializando embedding engine', error);
            this.embeddingEngine = null;
        }
    }

    setMode(mode) {
        this.operationMode = mode;
        if (mode === 'minimal') {
            logger.info('⚠️ QueryOptimizer: Cambiando a modo mínimo');
            this.queryCache.max = Math.floor(this.config.maxCacheSize / 2);
            this.semanticCache.max = Math.floor(this.config.maxCacheSize / 4);
            this.priceCache.max = 250;
            this.config.emergencyMode = true;
        } else {
            logger.info('✅ QueryOptimizer: Cambiando a modo completo');
            this.queryCache.max = this.config.maxCacheSize;
            this.semanticCache.max = this.config.maxCacheSize / 2;
            this.priceCache.max = 500;
            this.config.emergencyMode = false;
        }
    }

    async optimize() {
        logger.info('🔧 QueryOptimizer: Iniciando optimización...');
        const before = {
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size,
            priceCacheSize: this.priceCache.size,
            metrics: { ...this.performanceMetrics }
        };
        try {
            this.optimizeCacheContents();
            this.cleanupFrequencyMap();
            const after = {
                cacheSize: this.queryCache.size,
                semanticCacheSize: this.semanticCache.size,
                priceCacheSize: this.priceCache.size,
                metrics: { ...this.performanceMetrics }
            };
            this.performanceMetrics.lastOptimization = Date.now();
            logger.info('🎯 QueryOptimizer: Optimización completada', {
                reduccionCache: before.cacheSize - after.cacheSize,
                reduccionSemantico: before.semanticCacheSize - after.semanticCacheSize,
                reduccionPrecios: before.priceCacheSize - after.priceCacheSize
            });
            return {
                success: true,
                before,
                after,
                improvements: {
                    cacheOptimized: before.cacheSize !== after.cacheSize,
                    metricsReset: true,
                    emergencyMode: this.config.emergencyMode
                }
            };
        } catch (error) {
            logger.error('❌ QueryOptimizer: Optimización falló', error);
            return { success: false, error: error.message };
        }
    }

    optimizeCacheContents() {
        const threshold = Math.max(2, Math.floor(this.frequencyMap.size * 0.1));
        let removed = 0;
        for (const [key, data] of this.frequencyMap.entries()) {
            if (data.frequency < threshold) {
                this.queryCache.delete(key);
                this.semanticCache.delete(key);
                this.priceCache.delete(key);
                removed++;
            }
        }
        if (removed > 0) {
            logger.info(`🧹 QueryOptimizer: Limpiados ${removed} elementos de baja frecuencia`);
        }
    }

    cleanupFrequencyMap() {
        const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
        let cleaned = 0;
        for (const [key, data] of this.frequencyMap.entries()) {
            if (data.lastAccessed < cutoffTime) {
                this.frequencyMap.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger.info(`🧹 QueryOptimizer: Limpiadas ${cleaned} entradas de frecuencia antiguas`);
        }
    }

    async executeOptimizedQuery(query, queryFunction, options = {}) {
        const startTime = Date.now();
        const queryKey = this.generateQueryKey(query, options);
        const queryType = this.detectQueryType(query);
        try {
            this.performanceMetrics.totalRequests++;
            const targetCache = this.selectTargetCache(queryType);
            const cached = targetCache.get(queryKey);
            if (cached) {
                this.performanceMetrics.hits++;
                this.updateFrequencyMap(queryKey);
                this.updateMetrics(startTime, true);
                return this.enrichCachedResult(cached, queryType);
            }
            if (this.embeddingEngine && !this.config.emergencyMode) {
                const semanticMatch = await this.findSemanticMatch(query, queryType);
                if (semanticMatch) {
                    this.performanceMetrics.hits++;
                    this.performanceMetrics.semanticMatches++;
                    this.updateFrequencyMap(queryKey);
                    this.updateMetrics(startTime, true);
                    return this.enrichCachedResult(semanticMatch, queryType);
                }
            }
            const result = await this.executeWithOptimization(queryFunction, options);
            const ttl = this.calculateAdaptiveTTL(queryKey, queryType);
            targetCache.set(queryKey, result, { ttl });
            this.performanceMetrics.misses++;
            this.updateFrequencyMap(queryKey);
            this.updateMetrics(startTime, false);
            logger.info(`💡 QueryOptimizer: Consulta ejecutada [${queryType}] - ${Date.now() - startTime}ms`);
            return this.enrichResult(result, queryType);
        } catch (error) {
            this.performanceMetrics.errors++;
            this.updateMetrics(startTime, false);
            logger.error('❌ QueryOptimizer: Error ejecutando consulta', error);
            throw error;
        }
    }

    detectQueryType(query) {
        const lowerQuery = query.toLowerCase();
        if (this.queryPatterns.pricePatterns.some((pattern) => pattern.test(lowerQuery))) {
            this.performanceMetrics.priceQueries++;
            return 'price';
        }
        if (this.queryPatterns.devicePatterns.some((pattern) => pattern.test(lowerQuery))) {
            return 'device';
        }
        if (this.queryPatterns.servicePatterns.some((pattern) => pattern.test(lowerQuery))) {
            return 'service';
        }
        this.performanceMetrics.conversationQueries++;
        return 'conversation';
    }

    selectTargetCache(queryType) {
        switch (queryType) {
        case 'price': return this.priceCache;
        case 'conversation':
        case 'device':
        case 'service':
        default: return this.queryCache;
        }
    }

    async findSemanticMatch(query, queryType = 'conversation') {
        if (!this.embeddingEngine) return null;
        try {
            const queryEmbedding = await this.embeddingEngine.embedQuery(query);
            const targetCache = queryType === 'price' ? this.priceCache : this.semanticCache;
            for (const [cachedKey, cachedResult] of targetCache.entries()) {
                if (cachedResult.embedding) {
                    const similarity = this.calculateSimilarity(queryEmbedding, cachedResult.embedding);
                    if (similarity >= this.config.semanticThreshold) {
                        logger.info(`🎯 QueryOptimizer: Coincidencia semántica encontrada (${similarity.toFixed(3)})`);
                        return cachedResult;
                    }
                }
            }
            return null;
        } catch (error) {
            logger.error('❌ QueryOptimizer: Error en búsqueda semántica', error);
            return null;
        }
    }

    async executeWithOptimization(queryFunction, options) {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Query timeout after ${this.config.timeoutMs}ms`));
            }, this.config.timeoutMs);
            try {
                const result = await queryFunction(options);
                clearTimeout(timeout);
                resolve(result);
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    calculateAdaptiveTTL(queryKey, queryType) {
        const baseMultipliers = { price: 4, device: 2, service: 2, conversation: 1 };
        const frequency = this.frequencyMap.get(queryKey)?.frequency || 1;
        const multiplier = baseMultipliers[queryType] || 1;
        const frequencyBonus = Math.min(frequency / 10, 2);
        return this.config.defaultTTL * multiplier * (1 + frequencyBonus);
    }

    generateQueryKey(query, options = {}) {
        const normalizedQuery = query.toLowerCase().trim();
        const optionsHash = this.hashString(JSON.stringify(options));
        return `${this.hashString(normalizedQuery)}_${optionsHash}`;
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    updateFrequencyMap(queryKey) {
        const existing = this.frequencyMap.get(queryKey) || { frequency: 0, lastAccessed: 0 };
        this.frequencyMap.set(queryKey, {
            frequency: existing.frequency + 1,
            lastAccessed: Date.now()
        });
    }

    createTimeoutPromise(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), ms);
        });
    }

    enrichCachedResult(cached, queryType) {
        return { ...cached, _cache: { hit: true, type: queryType, timestamp: Date.now(), source: 'QueryOptimizer' } };
    }

    enrichResult(result, queryType) {
        return { ...result, _cache: { hit: false, type: queryType, timestamp: Date.now(), source: 'QueryOptimizer' } };
    }

    calculateSimilarity(embedding1, embedding2) {
        if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) return 0;
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }

    updateMetrics(startTime, wasHit) {
        const responseTime = Date.now() - startTime;
        const totalTime = this.performanceMetrics.avgResponseTime * (this.performanceMetrics.totalRequests - 1);
        this.performanceMetrics.avgResponseTime = (totalTime + responseTime) / this.performanceMetrics.totalRequests;
    }

    getPerformanceMetrics() {
        const hitRate = this.performanceMetrics.totalRequests > 0 ? ((this.performanceMetrics.hits / this.performanceMetrics.totalRequests) * 100).toFixed(2) : 0;
        return {
            ...this.performanceMetrics,
            hitRate: `${hitRate}%`,
            cacheStatus: {
                queryCache: { size: this.queryCache.size, max: this.queryCache.max },
                semanticCache: { size: this.semanticCache.size, max: this.semanticCache.max },
                priceCache: { size: this.priceCache.size, max: this.priceCache.max }
            },
            mode: this.operationMode,
            emergencyMode: this.config.emergencyMode,
            lastOptimization: new Date(this.performanceMetrics.lastOptimization).toISOString()
        };
    }
}

class PerformanceController {
    constructor(options = {}) {
        this.config = {
            enableQueryOptimization: options.enableQueryOptimization !== false,
            enableMemoryManagement: options.enableMemoryManagement !== false,
            enableConcurrentProcessing: options.enableConcurrentProcessing !== false,
            performanceTargets: {
                averageResponseTime: options.averageResponseTime || 1500,
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
        this.isInitialized = false;
        this.emergencyMode = false;
        this.onPerformanceDegradation = null;
        if (!options.deferInitialization) {
            this.initialize();
        }
    }

    async initialize() {
        try {
            this.initializeComponents();
            this.startPerformanceMonitoring();
            this.isInitialized = true;
            logger.info('🚀 PerformanceController iniciado con arquitectura unificada', {
                config: this.config,
                components: Object.keys(this.components)
            });
            return true;
        } catch (error) {
            logger.error('❌ Error inicializando PerformanceController:', error);
            return false;
        }
    }

    initializeComponents() {
        if (this.config.enableQueryOptimization) {
            this.components.queryOptimizer = new QueryOptimizer({ maxCacheSize: 1000, semanticThreshold: 0.85 });
        }
        if (this.config.enableMemoryManagement) {
            this.components.memoryManager = new MemoryManager({ maxMemoryUsage: this.config.performanceTargets.memoryUsageThreshold });
        }
        if (this.config.enableConcurrentProcessing) {
            this.components.concurrentProcessor = new ConcurrentProcessor({ maxWorkers: 4, batchSize: 10 });
        }
    }

    async executeOptimizedQuery(query, searchFunction, context = {}) {
        const startTime = Date.now();
        try {
            let result;
            if (this.components.queryOptimizer) {
                result = await this.components.queryOptimizer.executeOptimizedQuery(query, searchFunction, context);
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

    allocateOptimizedMemory(type, size, data) {
        if (!this.components.memoryManager) {
            logger.warn('MemoryManager not available, using standard allocation');
            return { data, size, type };
        }
        return this.components.memoryManager.allocateMemory(type, size, data);
    }

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

    updateMetrics(duration, success) {
        this.metrics.totalRequests++;
        if (success) {
            const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
            this.metrics.averageResponseTime = (total + duration) / this.metrics.totalRequests;
            if (this.metrics.averageResponseTime > this.config.performanceTargets.averageResponseTime) {
                this.triggerPerformanceDegradation();
            }
        }
    }

    triggerPerformanceDegradation() {
        if (this.onPerformanceDegradation && typeof this.onPerformanceDegradation === 'function') {
            this.onPerformanceDegradation({
                averageResponseTime: this.metrics.averageResponseTime,
                target: this.config.performanceTargets.averageResponseTime,
                degradationLevel: this.metrics.averageResponseTime / this.config.performanceTargets.averageResponseTime
            });
        }
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            this.performanceHealthCheck();
        }, 60000);
    }

    performanceHealthCheck() {
        const metrics = this.getPerformanceMetrics();
        logger.info('📊 Performance health check', {
            averageResponseTime: `${metrics.controller.averageResponseTime.toFixed(2)}ms`,
            target: `${this.config.performanceTargets.averageResponseTime}ms`,
            memoryUsage: metrics.components.memoryManager ? `${metrics.components.memoryManager.system.usage}` : 'N/A',
            cacheHitRate: metrics.components.queryOptimizer ? `${(metrics.components.queryOptimizer.hitRate * 100).toFixed(1)}%` : 'N/A'
        });
    }

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

    async optimizeOperation(operation, context = {}) {
        if (!this.isInitialized) {
            return operation;
        }
        return async (ctx) => {
            if (this.components.memoryManager) {
                await this.components.memoryManager.optimizeForOperation();
            }
            return await operation(ctx);
        };
    }

    activateEmergencyMode() {
        this.emergencyMode = true;
        logger.warn('⚠️ PerformanceController: Emergency mode activated');
        if (this.components.queryOptimizer) {
            this.components.queryOptimizer.setMode('minimal');
        }
    }

    deactivateEmergencyMode() {
        this.emergencyMode = false;
        logger.info('✅ PerformanceController: Emergency mode deactivated');
        if (this.components.queryOptimizer) {
            this.components.queryOptimizer.setMode('full');
        }
    }

    async optimize() {
        logger.info('🔧 PerformanceController: Iniciando optimización forzada...');
        const results = {
            memoryCleanup: null,
            cacheOptimization: null,
            concurrentOptimization: null
        };
        try {
            if (this.components.memoryManager) {
                results.memoryCleanup = await this.components.memoryManager.forceCleanup();
            }
            if (this.components.queryOptimizer) {
                results.cacheOptimization = await this.components.queryOptimizer.optimize();
            }
            if (this.components.concurrentProcessor) {
                results.concurrentOptimization = await this.components.concurrentProcessor.optimize();
            }
            logger.info('✅ PerformanceController: Optimización completada');
            return results;
        } catch (error) {
            logger.error('❌ PerformanceController: Error durante optimización:', error);
            throw error;
        }
    }

    async getStatus() {
        return {
            isInitialized: this.isInitialized,
            emergencyMode: this.emergencyMode,
            metrics: this.getPerformanceMetrics(),
            componentsStatus: {
                queryOptimizer: !!this.components.queryOptimizer,
                memoryManager: !!this.components.memoryManager,
                concurrentProcessor: !!this.components.concurrentProcessor
            }
        };
    }

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
        this.isInitialized = false;
        logger.info('✅ PerformanceController shutdown completed');
    }
}

module.exports = PerformanceController;
