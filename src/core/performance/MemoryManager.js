// src/core/performance/MemoryManager.js
// Intelligent Memory Management System for Resource-Constrained Environments

const logger = require('../../utils/logger');
const { performance } = require('perf_hooks');

class MemoryManager {
    constructor(options = {}) {
        this.config = {
            maxMemoryUsage: options.maxMemoryUsage || 0.75, // 75% of available RAM
            gcThreshold: options.gcThreshold || 0.85,
            monitoringInterval: options.monitoringInterval || 30000, // 30 segundos
            memoryPoolSize: options.memoryPoolSize || 1024 * 1024 * 100, // 100MB pool
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

    /**
     * Initialize memory pools for different data types
     */
    initializeMemoryPools() {
        // Create typed memory pools for optimal allocation
        this.memoryPools.set('embeddings', {
            type: 'float32',
            size: this.config.memoryPoolSize,
            allocated: 0,
            pool: []
        });

        this.memoryPools.set('queries', {
            type: 'string',
            size: this.config.memoryPoolSize / 2,
            allocated: 0,
            pool: []
        });

        this.memoryPools.set('cache', {
            type: 'object',
            size: this.config.memoryPoolSize / 4,
            allocated: 0,
            pool: []
        });

        logger.debug('🏗️ Memory pools inicializados', {
            pools: Array.from(this.memoryPools.keys())
        });
    }

    /**
     * Intelligent memory allocation with pool management
     */
    allocateMemory(type, size, data = null) {
        const pool = this.memoryPools.get(type);
        
        if (!pool) {
            logger.warn('⚠️ Pool type not found, using default allocation', { type });
            return this.fallbackAllocation(size, data);
        }

        // Check if we're approaching memory limits
        const currentMemory = this.getCurrentMemoryUsage();
        if (currentMemory > this.config.maxMemoryUsage) {
            logger.warn('🚨 Memory threshold exceeded, triggering cleanup');
            this.performIntelligentCleanup();
        }

        // Allocate from pool or create new
        const allocation = this.allocateFromPool(pool, size, data);
        
        this.memoryMetrics.allocated += size;
        this.memoryMetrics.current = currentMemory;
        
        if (currentMemory > this.memoryMetrics.peak) {
            this.memoryMetrics.peak = currentMemory;
        }

        return allocation;
    }

    /**
     * Allocate memory from specific pool
     */
    allocateFromPool(pool, size, data) {
        // Try to reuse existing allocation
        const reusableIndex = pool.pool.findIndex(item => 
            item && item.size >= size && !item.inUse
        );

        if (reusableIndex !== -1) {
            const reusable = pool.pool[reusableIndex];
            reusable.inUse = true;
            reusable.data = data;
            logger.debug('♻️ Memory reused from pool', { type: pool.type, size });
            return reusable;
        }

        // Create new allocation
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

    /**
     * Intelligent memory cleanup based on usage patterns
     */
    performIntelligentCleanup() {
        const startTime = performance.now();
        let freedMemory = 0;

        // Cleanup each pool based on usage patterns
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

        // Force garbage collection if necessary
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

    /**
     * Cleanup specific memory pool
     */
    cleanupPool(pool) {
        const cutoffTime = Date.now() - 300000; // 5 minutes ago
        
        // Remove unused and old allocations
        const initialLength = pool.pool.length;
        pool.pool = pool.pool.filter(allocation => {
            if (!allocation.inUse && allocation.createdAt < cutoffTime) {
                pool.allocated -= allocation.size;
                return false;
            }
            
            // Reset low-usage allocations
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

    /**
     * Force garbage collection with metrics
     */
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

    /**
     * Get current memory usage as percentage
     */
    getCurrentMemoryUsage() {
        const memUsage = process.memoryUsage();
        const totalMemory = this.getTotalSystemMemory();
        
        return memUsage.heapUsed / totalMemory;
    }

    /**
     * Get available system memory
     */
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

    /**
     * Get total system memory (approximation for 16GB system)
     */
    getTotalSystemMemory() {
        // Approximate total memory for 16GB system
        return 16 * 1024 * 1024 * 1024; // 16GB in bytes
    }

    /**
     * Start memory monitoring
     */
    startMonitoring() {
        this.monitoringTimer = setInterval(() => {
            this.monitorMemoryUsage();
        }, this.config.monitoringInterval);

        logger.debug('📊 Memory monitoring started', {
            interval: this.config.monitoringInterval
        });
    }

    /**
     * Monitor memory usage patterns
     */
    monitorMemoryUsage() {
        const currentUsage = this.getCurrentMemoryUsage();
        const memInfo = this.getAvailableMemory();

        // Log memory status
        logger.debug('📈 Memory usage report', {
            current: `${(currentUsage * 100).toFixed(1)}%`,
            peak: `${(this.memoryMetrics.peak * 100).toFixed(1)}%`,
            ...memInfo
        });

        // Trigger cleanup if approaching limits
        if (currentUsage > this.config.maxMemoryUsage) {
            logger.warn('🚨 Memory usage threshold exceeded');
            this.performIntelligentCleanup();
        }

        // Update metrics
        this.memoryMetrics.current = currentUsage;
        if (currentUsage > this.memoryMetrics.peak) {
            this.memoryMetrics.peak = currentUsage;
        }
    }

    /**
     * Get comprehensive memory metrics
     */
    getMemoryMetrics() {
        return {
            ...this.memoryMetrics,
            pools: Array.from(this.memoryPools.entries()).map(([type, pool]) => ({
                type,
                allocated: pool.allocated,
                count: pool.pool.length,
                active: pool.pool.filter(item => item.inUse).length
            })),
            system: this.getAvailableMemory()
        };
    }

    /**
     * Utility methods
     */
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

    /**
     * Cleanup on shutdown
     */
    shutdown() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }

        // Cleanup all pools
        for (const [type, pool] of this.memoryPools.entries()) {
            pool.pool = [];
            pool.allocated = 0;
        }

        logger.info('🔄 MemoryManager shutdown completed');
    }
}

module.exports = MemoryManager;
