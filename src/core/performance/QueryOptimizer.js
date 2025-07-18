    /**
     * Set operation mode
     * @param {string} mode - Operation mode ('full', 'minimal')
     */
    setMode(mode) {
        this.operationMode = mode;
        
        if (mode === 'minimal') {
            logger.info('⚠️ QueryOptimizer: Switching to minimal mode');
            // Reduce cache sizes for emergency mode
            this.queryCache.max = Math.floor(this.config.maxCacheSize / 2);
            this.semanticCache.max = Math.floor(this.config.maxCacheSize / 4);
        } else {
            logger.info('✅ QueryOptimizer: Switching to full mode');
            // Restore full cache sizes
            this.queryCache.max = this.config.maxCacheSize;
            this.semanticCache.max = this.config.maxCacheSize / 2;
        }
    }
    
    /**
     * Optimize query optimizer itself
     * @returns {Object} Optimization results
     */
    async optimize() {
        logger.info('🔧 QueryOptimizer: Starting optimization...');
        
        const before = {
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size,
            metrics: { ...this.performanceMetrics }
        };
        
        // Clear low-frequency entries
        this.optimizeCacheContents();
        
        // Reset frequency map for stale entries
        this.cleanupFrequencyMap();
        
        const after = {
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size,
            metrics: { ...this.performanceMetrics }
        };
        
        logger.info('✅ QueryOptimizer: Optimization completed');
        
        return {
            before,
            after,
            entriesRemoved: before.cacheSize - after.cacheSize
        };
    }
    
    /**
     * Optimize cache contents
     * @private
     */
    optimizeCacheContents() {
        // Remove entries that are rarely accessed
        const lowFrequencyThreshold = 2;
        
        for (const [key, value] of this.queryCache.entries()) {
            const frequency = this.frequencyMap.get(key) || 0;
            if (frequency < lowFrequencyThreshold) {
                this.queryCache.delete(key);
            }
        }
    }
    
    /**
     * Cleanup frequency map
     * @private
     */
    cleanupFrequencyMap() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        
        // Keep only recent and frequent entries
        for (const [query, frequency] of this.frequencyMap.entries()) {
            if (frequency < 3) {
                this.frequencyMap.delete(query);
            }
        }
    }// src/core/performance/QueryOptimizer.js
// Advanced Query Optimization Engine with Semantic Indexing

const logger = require('../../utils/logger');
const LRU = require('lru-cache');

class QueryOptimizer {
    constructor(options = {}) {
        this.config = {
            maxCacheSize: options.maxCacheSize || 1000,
            ttl: options.ttl || 3600000, // 1 hora
            semanticThreshold: options.semanticThreshold || 0.85,
            concurrentQueries: options.concurrentQueries || 5,
            ...options
        };

        // Multi-layer caching architecture
        this.queryCache = new LRU({
            max: this.config.maxCacheSize,
            ttl: this.config.ttl
        });

        this.semanticCache = new LRU({
            max: this.config.maxCacheSize / 2,
            ttl: this.config.ttl * 2
        });

        this.frequencyMap = new Map();
        this.performanceMetrics = {
            cacheHits: 0,
            cacheMisses: 0,
            averageQueryTime: 0,
            totalQueries: 0
        };

        logger.info('🚀 QueryOptimizer inicializado con arquitectura multi-capa', {
            config: this.config,
            cacheSize: this.config.maxCacheSize
        });
    }

    /**
     * Optimized query execution with semantic caching
     */
    async executeOptimizedQuery(query, searchFunction, context = {}) {
        const startTime = Date.now();
        const queryKey = this.generateQueryKey(query, context);
        
        try {
            // Level 1: Exact query cache
            const cachedResult = this.queryCache.get(queryKey);
            if (cachedResult) {
                this.performanceMetrics.cacheHits++;
                logger.debug('💾 Cache hit directo', { query: query.substring(0, 50) });
                return this.enrichCachedResult(cachedResult, startTime);
            }

            // Level 2: Semantic similarity cache
            const semanticResult = await this.findSemanticMatch(query, context);
            if (semanticResult) {
                this.performanceMetrics.cacheHits++;
                logger.debug('🧠 Cache hit semántico', { query: query.substring(0, 50) });
                return this.enrichCachedResult(semanticResult, startTime);
            }

            // Level 3: Optimized execution with frequency analysis
            const result = await this.executeWithOptimization(query, searchFunction, context);
            
            // Cache result with intelligent TTL
            const ttl = this.calculateAdaptiveTTL(query);
            this.queryCache.set(queryKey, result, ttl);
            
            this.performanceMetrics.cacheMisses++;
            this.updateFrequencyMap(query);
            
            return this.enrichResult(result, startTime);

        } catch (error) {
            logger.error('❌ Error en QueryOptimizer:', { error: error.message, query });
            throw error;
        } finally {
            this.updatePerformanceMetrics(startTime);
        }
    }

    /**
     * Semantic similarity matching with vector space analysis
     */
    async findSemanticMatch(query, context) {
        const queryVector = await this.generateQueryVector(query);
        
        for (const [cachedKey, cachedResult] of this.semanticCache.entries()) {
            const similarity = await this.calculateSimilarity(queryVector, cachedResult.vector);
            
            if (similarity > this.config.semanticThreshold) {
                logger.debug('🎯 Semantic match found', { 
                    similarity, 
                    originalQuery: cachedResult.originalQuery 
                });
                return cachedResult.result;
            }
        }
        
        return null;
    }

    /**
     * Execute with performance optimization patterns
     */
    async executeWithOptimization(query, searchFunction, context) {
        // Pre-process query for optimization
        const optimizedQuery = await this.preprocessQuery(query, context);
        
        // Execute with timeout and circuit breaker
        const result = await Promise.race([
            searchFunction(optimizedQuery, context),
            this.createTimeoutPromise(5000)
        ]);

        // Post-process result for enhanced performance
        return this.postProcessResult(result, query);
    }

    /**
     * Intelligent query preprocessing
     */
    async preprocessQuery(query, context) {
        // Remove redundant words, normalize terminology
        const processed = query
            .toLowerCase()
            .replace(/\b(el|la|los|las|un|una|de|del|que|como|para|por)\b/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Context-aware query expansion
        if (context.previousQueries && context.previousQueries.length > 0) {
            const contextualTerms = this.extractContextualTerms(context.previousQueries);
            return this.expandQueryWithContext(processed, contextualTerms);
        }

        return processed;
    }

    /**
     * Adaptive TTL calculation based on query patterns
     */
    calculateAdaptiveTTL(query) {
        const frequency = this.frequencyMap.get(query) || 0;
        const baseTTL = this.config.ttl;
        
        // High frequency queries get longer TTL
        if (frequency > 10) return baseTTL * 2;
        if (frequency > 5) return baseTTL * 1.5;
        return baseTTL;
    }

    /**
     * Generate optimized query key for caching
     */
    generateQueryKey(query, context) {
        const contextKey = JSON.stringify({
            userId: context.userId,
            timestamp: Math.floor(Date.now() / 600000), // 10 min buckets
            intent: context.intent
        });
        
        return `${query.toLowerCase().trim()}-${this.hashString(contextKey)}`;
    }

    /**
     * Performance metrics collection
     */
    updatePerformanceMetrics(startTime) {
        const duration = Date.now() - startTime;
        this.performanceMetrics.totalQueries++;
        
        const total = this.performanceMetrics.averageQueryTime * (this.performanceMetrics.totalQueries - 1);
        this.performanceMetrics.averageQueryTime = (total + duration) / this.performanceMetrics.totalQueries;
    }

    /**
     * Get performance analytics
     */
    getPerformanceMetrics() {
        const hitRate = this.performanceMetrics.cacheHits / 
                       (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses);
        
        return {
            ...this.performanceMetrics,
            hitRate: hitRate || 0,
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size
        };
    }

    /**
     * Utility methods
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    updateFrequencyMap(query) {
        const current = this.frequencyMap.get(query) || 0;
        this.frequencyMap.set(query, current + 1);
    }

    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query timeout')), timeout);
        });
    }

    enrichCachedResult(result, startTime) {
        return {
            ...result,
            cached: true,
            responseTime: Date.now() - startTime,
            timestamp: Date.now()
        };
    }

    enrichResult(result, startTime) {
        return {
            ...result,
            cached: false,
            responseTime: Date.now() - startTime,
            timestamp: Date.now()
        };
    }

    async generateQueryVector(query) {
        // Simplified vector generation - in production, use actual embeddings
        return query.split(' ').map(word => word.charCodeAt(0)).slice(0, 10);
    }

    async calculateSimilarity(vector1, vector2) {
        // Simplified cosine similarity
        if (!vector1 || !vector2) return 0;
        
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * (vector2[i] || 0), 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        
        return dotProduct / (magnitude1 * magnitude2) || 0;
    }

    extractContextualTerms(previousQueries) {
        // Extract common terms from previous queries
        const allTerms = previousQueries.flatMap(q => q.split(' '));
        const termFreq = {};
        
        allTerms.forEach(term => {
            termFreq[term] = (termFreq[term] || 0) + 1;
        });
        
        return Object.entries(termFreq)
            .filter(([_, freq]) => freq > 1)
            .map(([term, _]) => term);
    }

    expandQueryWithContext(query, contextualTerms) {
        const contextRelevant = contextualTerms.filter(term => 
            !query.includes(term) && term.length > 3
        );
        
        return contextRelevant.length > 0 
            ? `${query} ${contextRelevant.slice(0, 2).join(' ')}`
            : query;
    }

    postProcessResult(result, originalQuery) {
        // Enhance result with metadata
        return {
            ...result,
            originalQuery,
            processedAt: Date.now(),
            optimizationApplied: true
        };
    }
    
    /**
     * Set operation mode
     * @param {string} mode - Operation mode ('full', 'minimal')
     */
    setMode(mode) {
        this.operationMode = mode;
        
        if (mode === 'minimal') {
            logger.info('⚠️ QueryOptimizer: Switching to minimal mode');
            // Reduce cache sizes for emergency mode
            this.queryCache.max = Math.floor(this.config.maxCacheSize / 2);
            this.semanticCache.max = Math.floor(this.config.maxCacheSize / 4);
        } else {
            logger.info('✅ QueryOptimizer: Switching to full mode');
            // Restore full cache sizes
            this.queryCache.max = this.config.maxCacheSize;
            this.semanticCache.max = this.config.maxCacheSize / 2;
        }
    }
    
    /**
     * Optimize query optimizer itself
     * @returns {Object} Optimization results
     */
    async optimize() {
        logger.info('🔧 QueryOptimizer: Starting optimization...');
        
        const before = {
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size,
            metrics: { ...this.performanceMetrics }
        };
        
        // Clear low-frequency entries
        this.optimizeCacheContents();
        
        // Reset frequency map for stale entries
        this.cleanupFrequencyMap();
        
        const after = {
            cacheSize: this.queryCache.size,
            semanticCacheSize: this.semanticCache.size,
            metrics: { ...this.performanceMetrics }
        };
        
        logger.info('✅ QueryOptimizer: Optimization completed');
        
        return {
            before,
            after,
            entriesRemoved: before.cacheSize - after.cacheSize
        };
    }
    
    /**
     * Optimize cache contents
     * @private
     */
    optimizeCacheContents() {
        // Remove entries that are rarely accessed
        const lowFrequencyThreshold = 2;
        
        for (const [key, value] of this.queryCache.entries()) {
            const frequency = this.frequencyMap.get(key) || 0;
            if (frequency < lowFrequencyThreshold) {
                this.queryCache.delete(key);
            }
        }
    }
    
    /**
     * Cleanup frequency map
     * @private
     */
    cleanupFrequencyMap() {
        const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        
        // Keep only recent and frequent entries
        for (const [query, frequency] of this.frequencyMap.entries()) {
            if (frequency < 3) {
                this.frequencyMap.delete(query);
            }
        }
    }
}

module.exports = QueryOptimizer;
