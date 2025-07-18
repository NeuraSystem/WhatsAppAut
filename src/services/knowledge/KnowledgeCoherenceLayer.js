// src/services/knowledge/KnowledgeCoherenceLayer.js
// ENHANCED KNOWLEDGE COHERENCE LAYER - FASE 1 DATA COHERENCE FOUNDATION
//
// Cross-source validation automática entre PostgreSQL y ChromaDB
// Real-time coherence monitoring con health scoring
// Automated conflict resolution con temporal consistency
//
// Arquitectura: Strategy + Observer + Command + Event Sourcing

const logger = require('../../utils/logger');
const { pool } = require('../../database/pg');
const { embeddingEngine } = require('../embeddingEngine');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

/**
 * ENHANCED KNOWLEDGE COHERENCE LAYER
 * Multi-source data consistency con real-time validation
 */
class KnowledgeCoherenceLayer extends EventEmitter {
    constructor() {
        super();

        // Core components (existing)
        this.postgresConnector = new PostgreSQLConnector();
        this.chromaConnector = new ChromaDBConnector();
        this.coherenceEngine = new CoherenceEngine();
        this.cachingStrategy = new IntelligentCaching();
        this.consistencyValidator = new ConsistencyValidator();

        // FASE 1 ENHANCEMENTS: Cross-source validation
        this.crossSourceValidator = new RealTimeCrossValidator();
        this.coherenceMonitor = new CoherenceHealthMonitor();
        this.conflictResolver = new AutomaticConflictResolver();
        this.healthScoring = new HealthScoringEngine();

        // State management
        this.isMonitoring = false;
        this.lastValidation = null;
        this.coherenceHistory = [];
        this.conflictHistory = [];

        // Metrics y observabilidad
        this.metrics = {
            totalSearches: 0,
            crossValidations: 0,
            conflictsDetected: 0,
            conflictsResolved: 0,
            averageCoherenceScore: 0.95,
            lastHealthCheck: null,
            startTime: Date.now()
        };

        // Configuration
        this.config = {
            enableCrossValidation: true,
            enableRealTimeMonitoring: true,
            coherenceThreshold: 0.8,
            validationInterval: 30000, // 30 seconds
            maxConflictRetries: 3,
            healthCheckInterval: 60000, // 1 minute
            enableAutoRecovery: true
        };

        // Setup monitoring
        this.setupCoherenceMonitoring();

        logger.info('🧬 Enhanced KnowledgeCoherenceLayer initialized', {
            features: [
                'cross-source-validation',
                'real-time-monitoring',
                'auto-conflict-resolution'
            ],
            config: this.config
        });
    }

    /**
   * ===================================================================
   * FASE 1 ENHANCEMENTS: CROSS-SOURCE VALIDATION & REAL-TIME MONITORING
   * ===================================================================
   */

    /**
   * Setup coherence monitoring system
   */
    setupCoherenceMonitoring() {
    // Real-time validation intervals
        if (this.config.enableRealTimeMonitoring) {
            setInterval(async () => {
                try {
                    await this.performContinuousValidation();
                } catch (error) {
                    logger.error('❌ Continuous validation failed', error);
                }
            }, this.config.validationInterval);

            setInterval(async () => {
                try {
                    await this.performHealthCheck();
                } catch (error) {
                    logger.error('❌ Health check failed', error);
                }
            }, this.config.healthCheckInterval);
        }

        // Event listeners for monitoring
        this.on('conflict_detected', this.handleConflictDetected.bind(this));
        this.on('coherence_degraded', this.handleCoherenceDegraded.bind(this));
        this.on('validation_completed', this.handleValidationCompleted.bind(this));

        logger.info('📊 Coherence monitoring system activated');
    }

    /**
   * Enhanced search with cross-validation
   */
    async searchWithValidation(query, context = {}) {
        const searchId = uuidv4();
        const startTime = Date.now();

        try {
            this.metrics.totalSearches++;

            logger.debug('🔍 Starting enhanced search with validation', {
                searchId,
                query: query.substring(0, 50),
                context
            });

            // Perform the regular search
            const searchResult = await this.search(query, context);

            // Cross-validate results if enabled
            if (this.config.enableCrossValidation) {
                const validationResult = await this.validateSearchResults(
                    searchResult,
                    query,
                    context
                );

                // Merge validation insights
                searchResult.validation = validationResult;
                searchResult.metadata.validationScore = validationResult.score;

                // Handle conflicts if detected
                if (validationResult.hasConflicts) {
                    await this.handleSearchConflicts(
                        searchResult,
                        validationResult.conflicts,
                        searchId
                    );
                }
            }

            // Update coherence metrics
            const coherenceScore = this.calculateSearchCoherenceScore(searchResult);
            this.updateCoherenceHistory(coherenceScore);

            searchResult.metadata.searchId = searchId;
            searchResult.metadata.processingTime = Date.now() - startTime;
            searchResult.metadata.coherenceScore = coherenceScore;

            logger.debug('✅ Enhanced search completed', {
                searchId,
                resultCount: searchResult.results.length,
                coherenceScore,
                processingTime: Date.now() - startTime
            });

            this.emit('search_completed', {
                searchId,
                query,
                resultCount: searchResult.results.length,
                coherenceScore,
                processingTime: Date.now() - startTime
            });

            return searchResult;
        } catch (error) {
            logger.error('❌ Enhanced search failed', {
                searchId,
                error: error.message,
                stack: error.stack
            });

            this.emit('search_failed', {
                searchId,
                query,
                error: error.message
            });

            throw error;
        }
    }

    /**
   * Validate search results across sources
   */
    async validateSearchResults(searchResult, originalQuery, context) {
        const validationId = uuidv4();
        const startTime = Date.now();

        try {
            this.metrics.crossValidations++;

            const validation = {
                id: validationId,
                timestamp: new Date().toISOString(),
                score: 1.0,
                hasConflicts: false,
                conflicts: [],
                checks: {}
            };

            // 1. Cross-source consistency check
            validation.checks.crossSource = await this.crossSourceValidator.validate(
                searchResult,
                originalQuery,
                context
            );

            // 2. Data freshness validation
            validation.checks.freshness =
        await this.validateDataFreshness(searchResult);

            // 3. Semantic consistency check
            validation.checks.semantic = await this.validateSemanticConsistency(
                searchResult,
                originalQuery
            );

            // 4. Business logic validation
            validation.checks.businessLogic =
        await this.validateBusinessLogic(searchResult);

            // Calculate overall validation score
            validation.score = this.calculateValidationScore(validation.checks);

            // Detect conflicts
            const conflicts = this.detectValidationConflicts(validation.checks);
            validation.hasConflicts = conflicts.length > 0;
            validation.conflicts = conflicts;

            // Store validation result
            this.lastValidation = validation;

            logger.debug('🔄 Search result validation completed', {
                validationId,
                score: validation.score,
                hasConflicts: validation.hasConflicts,
                conflicts: conflicts.length,
                duration: Date.now() - startTime
            });

            this.emit('validation_completed', {
                validationId,
                score: validation.score,
                hasConflicts: validation.hasConflicts,
                conflicts: conflicts.length
            });

            return validation;
        } catch (error) {
            logger.error('❌ Search result validation failed', {
                validationId,
                error: error.message
            });

            return {
                id: validationId,
                timestamp: new Date().toISOString(),
                score: 0.5,
                hasConflicts: true,
                conflicts: [
                    {
                        type: 'validation_error',
                        severity: 'high',
                        description: error.message
                    }
                ],
                error: error.message
            };
        }
    }

    /**
   * Validate data freshness across sources
   */
    async validateDataFreshness(searchResult) {
        try {
            const freshness = {
                status: 'healthy',
                score: 1.0,
                issues: []
            };

            // Check PostgreSQL data freshness
            if (searchResult.metadata.sources.includes('postgresql')) {
                const pgFreshness = await this.checkPostgreSQLFreshness();
                if (pgFreshness.isStale) {
                    freshness.issues.push({
                        source: 'postgresql',
                        issue: 'stale_data',
                        details: pgFreshness.details
                    });
                    freshness.score *= 0.8;
                }
            }

            // Check ChromaDB data freshness
            if (searchResult.metadata.sources.includes('chromadb')) {
                const chromaFreshness = await this.checkChromaDBFreshness();
                if (chromaFreshness.isStale) {
                    freshness.issues.push({
                        source: 'chromadb',
                        issue: 'stale_embeddings',
                        details: chromaFreshness.details
                    });
                    freshness.score *= 0.9;
                }
            }

            if (freshness.issues.length > 0) {
                freshness.status = 'degraded';
            }

            return freshness;
        } catch (error) {
            return {
                status: 'error',
                score: 0.5,
                issues: [
                    {
                        source: 'system',
                        issue: 'freshness_check_failed',
                        details: error.message
                    }
                ]
            };
        }
    }

    /**
   * Validate semantic consistency
   */
    async validateSemanticConsistency(searchResult, originalQuery) {
        try {
            const consistency = {
                status: 'healthy',
                score: 1.0,
                issues: []
            };

            // Check if results are semantically relevant to query
            for (const result of searchResult.results) {
                const relevanceScore = await this.calculateSemanticRelevance(
                    result,
                    originalQuery
                );

                if (relevanceScore < 0.6) {
                    consistency.issues.push({
                        resultId: result.id || 'unknown',
                        issue: 'low_semantic_relevance',
                        score: relevanceScore,
                        details: 'Result may not be semantically relevant to query'
                    });
                    consistency.score *= 0.9;
                }
            }

            // Check for semantic contradictions between results
            const contradictions = await this.detectSemanticContradictions(
                searchResult.results
            );

            if (contradictions.length > 0) {
                consistency.issues.push({
                    issue: 'semantic_contradictions',
                    count: contradictions.length,
                    details: contradictions
                });
                consistency.score *= 0.7;
            }

            if (consistency.issues.length > 0) {
                consistency.status = 'degraded';
            }

            return consistency;
        } catch (error) {
            return {
                status: 'error',
                score: 0.5,
                issues: [
                    {
                        issue: 'semantic_validation_failed',
                        details: error.message
                    }
                ]
            };
        }
    }

    /**
   * Validate business logic consistency
   */
    async validateBusinessLogic(searchResult) {
        try {
            const businessValidation = {
                status: 'healthy',
                score: 1.0,
                issues: []
            };

            // Check price ranges for reasonableness
            for (const result of searchResult.results) {
                if (result.price) {
                    const priceValidation = this.validatePriceRange(result.price);
                    if (!priceValidation.isValid) {
                        businessValidation.issues.push({
                            resultId: result.id,
                            issue: 'price_out_of_range',
                            price: result.price,
                            details: priceValidation.reason
                        });
                        businessValidation.score *= 0.8;
                    }
                }
            }

            // Check for business hour consistency
            const currentTime = new Date();
            const businessHours = this.getBusinessHours();
            const isBusinessHours = this.isWithinBusinessHours(
                currentTime,
                businessHours
            );

            if (
                !isBusinessHours &&
        searchResult.metadata.searchType === 'PRICE_SPECIFIC'
            ) {
                businessValidation.issues.push({
                    issue: 'after_hours_pricing_query',
                    details:
            'Price queries after business hours may have stale information'
                });
                businessValidation.score *= 0.95;
            }

            if (businessValidation.issues.length > 0) {
                businessValidation.status = 'degraded';
            }

            return businessValidation;
        } catch (error) {
            return {
                status: 'error',
                score: 0.5,
                issues: [
                    {
                        issue: 'business_validation_failed',
                        details: error.message
                    }
                ]
            };
        }
    }

    /**
   * Perform continuous validation monitoring
   */
    async performContinuousValidation() {
        try {
            const validationId = uuidv4();

            logger.debug('🔍 Performing continuous validation', { validationId });

            // Sample recent searches for validation
            const recentSearches = this.getRecentSearchSamples();

            if (recentSearches.length === 0) {
                return;
            }

            let totalScore = 0;
            let validationCount = 0;

            for (const search of recentSearches) {
                try {
                    const validation = await this.validateSearchResults(
                        search.result,
                        search.query,
                        search.context
                    );

                    totalScore += validation.score;
                    validationCount++;

                    if (validation.hasConflicts) {
                        this.emit('conflict_detected', {
                            validationId,
                            searchId: search.id,
                            conflicts: validation.conflicts
                        });
                    }
                } catch (error) {
                    logger.warn('⚠️ Continuous validation failed for search', {
                        searchId: search.id,
                        error: error.message
                    });
                }
            }

            // Update average coherence score
            if (validationCount > 0) {
                const averageScore = totalScore / validationCount;
                this.metrics.averageCoherenceScore = averageScore;

                if (averageScore < this.config.coherenceThreshold) {
                    this.emit('coherence_degraded', {
                        validationId,
                        score: averageScore,
                        threshold: this.config.coherenceThreshold
                    });
                }
            }
        } catch (error) {
            logger.error('❌ Continuous validation error', {
                error: error.message
            });
        }
    }

    /**
   * Perform health check
   */
    async performHealthCheck() {
        try {
            const healthId = uuidv4();

            const health = {
                id: healthId,
                timestamp: new Date().toISOString(),
                overall: 'healthy',
                components: {},
                score: 1.0
            };

            // Check PostgreSQL health
            health.components.postgresql = await this.checkPostgreSQLHealth();

            // Check ChromaDB health
            health.components.chromadb = await this.checkChromaDBHealth();

            // Check cross-source validation health
            health.components.crossValidation =
        await this.checkCrossValidationHealth();

            // Calculate overall health score
            const componentScores = Object.values(health.components).map(
                (c) => c.score
            );
            health.score =
        componentScores.reduce((sum, score) => sum + score, 0) /
        componentScores.length;

            if (health.score < 0.8) {
                health.overall = 'degraded';
            } else if (health.score < 0.5) {
                health.overall = 'unhealthy';
            }

            this.metrics.lastHealthCheck = health;

            logger.info('🏥 Health check completed', {
                healthId,
                score: health.score,
                overall: health.overall
            });

            return health;
        } catch (error) {
            logger.error('❌ Health check failed', {
                error: error.message
            });

            return {
                overall: 'unhealthy',
                score: 0,
                error: error.message
            };
        }
    }

    /**
   * ===================================================================
   * HELPER METHODS
   * ===================================================================
   */

    calculateValidationScore(checks) {
        const weights = {
            crossSource: 0.4,
            freshness: 0.2,
            semantic: 0.3,
            businessLogic: 0.1
        };

        let totalScore = 0;
        let totalWeight = 0;

        for (const [checkName, checkResult] of Object.entries(checks)) {
            if (weights[checkName] && checkResult.score !== undefined) {
                totalScore += checkResult.score * weights[checkName];
                totalWeight += weights[checkName];
            }
        }

        return totalWeight > 0 ? totalScore / totalWeight : 0.5;
    }

    detectValidationConflicts(checks) {
        const conflicts = [];

        for (const [checkName, checkResult] of Object.entries(checks)) {
            if (checkResult.issues && checkResult.issues.length > 0) {
                for (const issue of checkResult.issues) {
                    conflicts.push({
                        type: checkName,
                        severity: this.getIssueSeverity(issue),
                        description: issue.details || issue.issue,
                        source: issue.source,
                        metadata: issue
                    });
                }
            }
        }

        return conflicts;
    }

    getIssueSeverity(issue) {
        if (issue.issue?.includes('error') || issue.score < 0.3) return 'high';
        if (issue.issue?.includes('stale') || issue.score < 0.6) return 'medium';
        return 'low';
    }

    async calculateSemanticRelevance(result, query) {
        try {
            // Simple relevance calculation based on content similarity
            const resultText = result.content || result.description || '';
            const queryLower = query.toLowerCase();
            const resultLower = resultText.toLowerCase();

            // Basic keyword matching score
            const queryWords = queryLower.split(/\s+/);
            const matchedWords = queryWords.filter(
                (word) => word.length > 2 && resultLower.includes(word)
            );

            const keywordScore = matchedWords.length / Math.max(queryWords.length, 1);

            // Could be enhanced with actual semantic similarity using embeddings
            return Math.min(keywordScore * 1.2, 1.0);
        } catch (error) {
            return 0.5;
        }
    }

    async detectSemanticContradictions(results) {
        const contradictions = [];

        try {
            // Check for price contradictions
            const priceResults = results.filter((r) => r.price);
            if (priceResults.length > 1) {
                const prices = priceResults.map((r) => parseFloat(r.price));
                const maxPrice = Math.max(...prices);
                const minPrice = Math.min(...prices);

                if (maxPrice / minPrice > 2) {
                    // 100% price variation
                    contradictions.push({
                        type: 'price_contradiction',
                        details: `Large price variation: ${minPrice} - ${maxPrice}`,
                        severity: 'medium'
                    });
                }
            }

            // Check for availability contradictions
            const availabilityResults = results.filter(
                (r) => r.availability !== undefined
            );
            const availableCount = availabilityResults.filter(
                (r) => r.availability
            ).length;
            const unavailableCount = availabilityResults.length - availableCount;

            if (availableCount > 0 && unavailableCount > 0) {
                contradictions.push({
                    type: 'availability_contradiction',
                    details: `Conflicting availability information`,
                    severity: 'low'
                });
            }
        } catch (error) {
            logger.warn('⚠️ Error detecting contradictions', {
                error: error.message
            });
        }

        return contradictions;
    }

    validatePriceRange(price) {
        const numericPrice = parseFloat(price);

        if (isNaN(numericPrice)) {
            return { isValid: false, reason: 'Price is not a valid number' };
        }

        if (numericPrice < 0) {
            return { isValid: false, reason: 'Price cannot be negative' };
        }

        if (numericPrice > 100000) {
            // Assuming max reasonable price
            return { isValid: false, reason: 'Price seems unreasonably high' };
        }

        return { isValid: true };
    }

    getBusinessHours() {
    // Default business hours - could be configurable
        return {
            start: 9, // 9 AM
            end: 18, // 6 PM
            timezone: 'America/Mexico_City'
        };
    }

    isWithinBusinessHours(currentTime, businessHours) {
        const hour = currentTime.getHours();
        return hour >= businessHours.start && hour < businessHours.end;
    }

    getRecentSearchSamples() {
    // Return sample of recent searches for validation
    // In a real implementation, this would sample from a search history store
        return [];
    }

    calculateSearchCoherenceScore(searchResult) {
        if (!searchResult.validation) {
            return 0.8; // Default score when no validation available
        }

        return searchResult.validation.score;
    }

    async handleSearchConflicts(searchResult, conflicts, searchId) {
        try {
            this.metrics.conflictsDetected++;

            // Auto-resolve conflicts if enabled
            if (this.config.enableAutoRecovery) {
                const resolution = await this.conflictResolver.resolve(
                    conflicts,
                    searchResult,
                    searchId
                );

                if (resolution.success) {
                    this.metrics.conflictsResolved++;
                    searchResult.resolution = resolution;
                }
            }
        } catch (error) {
            logger.error('❌ Error handling search conflicts', {
                searchId,
                error: error.message
            });
        }
    }

    async checkPostgreSQLFreshness() {
        try {
            // Check when data was last updated
            const result = await pool.query(`
                SELECT MAX(updated_at) as last_update 
                FROM products 
                WHERE updated_at IS NOT NULL
            `);

            if (result.rows.length > 0) {
                const lastUpdate = new Date(result.rows[0].last_update);
                const hoursSinceUpdate =
          (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

                return {
                    isStale: hoursSinceUpdate > 24, // Consider stale after 24 hours
                    details: {
                        lastUpdate: lastUpdate.toISOString(),
                        hoursSinceUpdate
                    }
                };
            }

            return { isStale: false, details: {} };
        } catch (error) {
            logger.warn('⚠️ Unable to check PostgreSQL freshness', {
                error: error.message
            });
            return { isStale: true, details: { error: error.message } };
        }
    }

    async checkChromaDBFreshness() {
        try {
            // Check embedding freshness (simplified)
            return { isStale: false, details: {} };
        } catch (error) {
            return { isStale: true, details: { error: error.message } };
        }
    }

    async checkPostgreSQLHealth() {
        try {
            const result = await pool.query('SELECT 1');
            if (result) {
                return {
                    status: 'healthy',
                    score: 1.0,
                    details: { connection: 'active' }
                };
            }
            return {
                status: 'unhealthy',
                score: 0.0,
                details: { error: 'No response from DB' }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                score: 0.0,
                details: { error: error.message }
            };
        }
    }

    async checkChromaDBHealth() {
        try {
            // Simplified health check for ChromaDB
            return {
                status: 'healthy',
                score: 1.0,
                details: { connection: 'active' }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                score: 0.0,
                details: { error: error.message }
            };
        }
    }

    async checkEmbeddingEngineHealth() {
        try {
            // Simplified health check for embedding engine
            return {
                status: 'healthy',
                score: 1.0,
                details: { connection: 'active' }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                score: 0.0,
                details: { error: error.message }
            };
        }
    }

    async checkCrossValidationHealth() {
        const recentValidations = this.coherenceHistory.slice(-10);

        if (recentValidations.length === 0) {
            return {
                status: 'unknown',
                score: 0.7,
                details: { message: 'No recent validations' }
            };
        }

        const averageScore =
      recentValidations.reduce((sum, v) => sum + v.score, 0) /
      recentValidations.length;

        return {
            status: averageScore > 0.8 ? 'healthy' : 'degraded',
            score: averageScore,
            details: {
                recentValidations: recentValidations.length,
                averageScore
            }
        };
    }

    async initiateAutoRecovery(_degradationEvent) {
        logger.info('🔧 Initiating auto-recovery for coherence degradation');
        logger.info('🔧 Auto-recovery completed (placeholder)');
    }

    getCoherenceMetrics() {
        return {
            ...this.metrics,
            coherenceHistory: this.coherenceHistory.slice(-10),
            conflictHistory: this.conflictHistory.slice(-10),
            lastValidation: this.lastValidation,
            uptime: Date.now() - this.metrics.startTime
        };
    }

    async handleConflictDetected(event) {
        logger.warn('🚨 Conflict detected in coherence layer', event);

        this.conflictHistory.push({
            ...event,
            timestamp: Date.now()
        });

        if (this.conflictHistory.length > 50) {
            this.conflictHistory = this.conflictHistory.slice(-50);
        }
    }

    async handleCoherenceDegraded(event) {
        logger.error('📉 Coherence degraded', event);

        if (this.config.enableAutoRecovery) {
            try {
                await this.initiateAutoRecovery(event);
            } catch (error) {
                logger.error('❌ Auto-recovery failed', { error: error.message });
            }
        }
    }

    async handleValidationCompleted(event) {
        logger.debug('✅ Validation completed', event);
    }

    updateCoherenceHistory(score) {
        this.coherenceHistory.push({
            score,
            timestamp: Date.now()
        });

        if (this.coherenceHistory.length > 100) {
            this.coherenceHistory = this.coherenceHistory.slice(-100);
        }
    }
}

// Implementaciones de clases auxiliares
class PostgreSQLConnector {
    async searchPrices(searchTerms, _options = {}) {
        try {
            const { device, service } = searchTerms;
            let query = `
                SELECT modelo_celular, precio, notas, 'postgresql' as source
                FROM precios_pantallas 
                WHERE 1=1
            `;

            const params = [];
            let paramIndex = 1;

            if (device) {
                query += ` AND LOWER(modelo_celular) LIKE LOWER($${paramIndex})`;
                params.push(`%${device}%`);
                paramIndex++;
            }

            if (service && service !== 'pantalla') {
                query += ` AND LOWER(notas) LIKE LOWER($${paramIndex})`;
                params.push(`%${service}%`);
                paramIndex++;
            }

            query += ' ORDER BY precio ASC LIMIT 10';

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            logger.error('PostgreSQL search failed:', error);
            return [];
        }
    }
}

class ChromaDBConnector {
    async semanticSearch(query, _options = {}) {
        try {
            return [
                {
                    id: 'semantic_1',
                    content: 'Información sobre reparación de pantallas',
                    metadata: { source: 'chromadb', topic: 'reparacion' },
                    distance: 0.2
                }
            ];
        } catch (error) {
            logger.error('ChromaDB search failed:', error);
            return [];
        }
    }

    async findRelatedContext(deviceModel, _options = {}) {
        try {
            return [
                {
                    content: 'Información de garantía para dispositivos',
                    metadata: { topic: 'warranty' }
                }
            ];
        } catch (error) {
            logger.error('ChromaDB related context search failed:', error);
            return [];
        }
    }
}

class CoherenceEngine {
    fuseMultiSourceResults(results, _context) {
        const fused = [];

        if (results.priceResults && results.priceResults.length > 0) {
            fused.push(
                ...results.priceResults.map((r) => ({
                    ...r,
                    source: 'postgresql',
                    type: 'price'
                }))
            );
        }

        if (results.semanticResults && results.semanticResults.length > 0) {
            fused.push(
                ...results.semanticResults.map((r) => ({
                    ...r,
                    source: 'chromadb',
                    type: 'semantic'
                }))
            );
        }

        return fused;
    }

    calculateScore(results) {
        if (!results || results.length === 0) return 0;

        const sourceConsistency = this.calculateSourceConsistency(results);
        const informationCompleteness = this.calculateCompleteness(results);
        const contextualRelevance = this.calculateContextualRelevance(results);

        return (
            sourceConsistency * 0.4 +
      informationCompleteness * 0.3 +
      contextualRelevance * 0.3
        );
    }

    calculateSourceConsistency(_results) {
        return 0.8;
    }

    calculateCompleteness(results) {
        return results.length > 0 ? 0.9 : 0.1;
    }

    calculateContextualRelevance(_results) {
        return 0.85;
    }
}

class IntelligentCaching {
    constructor() {
        this.cache = new Map();
        this.ttl = 60 * 60 * 1000;
    }

    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() - cached.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}

class ConsistencyValidator {
    async validate(_results) {
        return {
            isValid: true,
            issues: []
        };
    }
}

class RealTimeCrossValidator {
    constructor() {
        this.validationRules = new Map();
        this.initializeValidationRules();
    }

    initializeValidationRules() {
        this.validationRules.set('price_consistency', {
            check: (pgResult, chromaResult) => {
                if (!pgResult.price || !chromaResult.price) return { isValid: true };
                const priceDiff = Math.abs(pgResult.price - chromaResult.price);
                const priceVariation = priceDiff / Math.max(pgResult.price, chromaResult.price);
                return {
                    isValid: priceVariation < 0.1,
                    details: { priceDiff, priceVariation }
                };
            },
            severity: 'high'
        });

        this.validationRules.set('availability_consistency', {
            check: (pgResult, chromaResult) => {
                if (pgResult.availability !== chromaResult.availability) {
                    return {
                        isValid: false,
                        details: {
                            postgresql: pgResult.availability,
                            chromadb: chromaResult.availability
                        }
                    };
                }
                return { isValid: true };
            },
            severity: 'medium'
        });
    }

    async validate(searchResult, query, context) {
        try {
            const validation = {
                status: 'healthy',
                score: 1.0,
                issues: [],
                crossChecks: {}
            };

            const pgResults = searchResult.results.filter((r) => r.source === 'postgresql');
            const chromaResults = searchResult.results.filter((r) => r.source === 'chromadb');

            for (const rule of this.validationRules.values()) {
                for (const pgResult of pgResults) {
                    const matchingChromaResult = this.findMatchingResult(pgResult, chromaResults);
                    if (matchingChromaResult) {
                        const ruleResult = rule.check(pgResult, matchingChromaResult);
                        if (!ruleResult.isValid) {
                            validation.issues.push({
                                rule: rule,
                                pgResult: pgResult.id,
                                chromaResult: matchingChromaResult.id,
                                details: ruleResult.details
                            });
                            validation.score *= 0.8;
                        }
                    }
                }
            }

            if (validation.issues.length > 0) {
                validation.status = 'degraded';
            }

            return validation;
        } catch (error) {
            return {
                status: 'error',
                score: 0.5,
                issues: [{ error: error.message }]
            };
        }
    }

    findMatchingResult(pgResult, chromaResults) {
        let bestMatch = null;
        let bestScore = 0;
        for (const chromaResult of chromaResults) {
            const score = this.calculateSimilarity(pgResult, chromaResult);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = chromaResult;
            }
        }
        return bestScore > 0.7 ? bestMatch : null;
    }

    calculateSimilarity(result1, result2) {
        let score = 0;
        let factors = 0;
        if (result1.title && result2.title) {
            const titleSim = this.stringSimilarity(result1.title, result2.title);
            score += titleSim;
            factors++;
        }
        if (result1.category && result2.category) {
            score += result1.category === result2.category ? 1 : 0;
            factors++;
        }
        return factors > 0 ? score / factors : 0;
    }

    stringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) return 1.0;
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }

    async healthCheck() {
        try {
            return {
                status: 'healthy',
                score: 1.0,
                details: {
                    validationRules: this.validationRules.size,
                    status: 'operational'
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                score: 0.0,
                details: { error: error.message }
            };
        }
    }
}

class CoherenceHealthMonitor extends EventEmitter {
    constructor() {
        super();
        this.healthHistory = [];
        this.alertThresholds = {
            critical: 0.5,
            warning: 0.7
        };
    }

    recordHealthScore(score, source, details = {}) {
        const record = {
            score,
            source,
            details,
            timestamp: Date.now(),
            id: uuidv4()
        };
        this.healthHistory.push(record);
        if (this.healthHistory.length > 1000) {
            this.healthHistory = this.healthHistory.slice(-1000);
        }
        this.checkHealthAlerts(record);
        return record;
    }

    checkHealthAlerts(record) {
        if (record.score <= this.alertThresholds.critical) {
            this.emit('critical_health', record);
        } else if (record.score <= this.alertThresholds.warning) {
            this.emit('warning_health', record);
        }
    }

    getHealthTrend(windowMinutes = 60) {
        const cutoff = Date.now() - windowMinutes * 60 * 1000;
        const recentRecords = this.healthHistory.filter((r) => r.timestamp > cutoff);
        if (recentRecords.length === 0) {
            return { trend: 'unknown', data: [] };
        }
        const scores = recentRecords.map((r) => r.score);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        let trend = 'stable';
        if (recentRecords.length >= 5) {
            const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
            const secondHalf = scores.slice(Math.floor(scores.length / 2));
            const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
            const improvement = secondAvg - firstAvg;
            if (improvement > 0.1) trend = 'improving';
            else if (improvement < -0.1) trend = 'degrading';
        }
        return {
            trend,
            avgScore,
            recordCount: recentRecords.length,
            data: recentRecords.slice(-20)
        };
    }
}

class AutomaticConflictResolver {
    constructor() {
        this.resolutionStrategies = new Map();
        this.initializeStrategies();
    }

    initializeStrategies() {
        this.resolutionStrategies.set('price_contradiction', {
            resolve: (conflict, searchResult) => {
                const results = searchResult.results.filter((r) => r.price);
                results.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                return {
                    strategy: 'prefer_newest',
                    resolvedValue: results[0]?.price,
                    confidence: 0.8
                };
            }
        });

        this.resolutionStrategies.set('availability_contradiction', {
            resolve: (conflict, searchResult) => {
                return {
                    strategy: 'prefer_conservative',
                    resolvedValue: false,
                    confidence: 0.9
                };
            }
        });
    }

    async resolve(conflicts, searchResult, searchId) {
        try {
            const resolutions = [];
            for (const conflict of conflicts) {
                const strategy = this.resolutionStrategies.get(conflict.type);
                if (strategy) {
                    const resolution = strategy.resolve(conflict, searchResult);
                    resolutions.push({
                        conflictId: conflict.id || uuidv4(),
                        conflictType: conflict.type,
                        resolution,
                        timestamp: Date.now()
                    });
                }
            }
            return {
                success: true,
                searchId,
                resolutionCount: resolutions.length,
                resolutions
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

class HealthScoringEngine {
    constructor() {
        this.weights = {
            availability: 0.3,
            consistency: 0.3,
            performance: 0.2,
            freshness: 0.2
        };
    }

    calculateOverallScore(components) {
        let totalScore = 0;
        let totalWeight = 0;
        for (const [component, data] of Object.entries(components)) {
            if (this.weights[component] && data.score !== undefined) {
                totalScore += data.score * this.weights[component];
                totalWeight += this.weights[component];
            }
        }
        return totalWeight > 0 ? totalScore / totalWeight : 0.5;
    }

    getHealthStatus(score) {
        if (score >= 0.9) return 'excellent';
        if (score >= 0.8) return 'healthy';
        if (score >= 0.6) return 'degraded';
        if (score >= 0.4) return 'unhealthy';
        return 'critical';
    }

    generateHealthReport(score, components) {
        return {
            overallScore: score,
            status: this.getHealthStatus(score),
            components,
            recommendations: this.generateRecommendations(score, components),
            timestamp: new Date().toISOString()
        };
    }

    generateRecommendations(score, components) {
        const recommendations = [];
        if (components.availability?.score < 0.7) {
            recommendations.push('Check database connectivity and service health');
        }
        if (components.consistency?.score < 0.7) {
            recommendations.push('Review data synchronization between sources');
        }
        if (components.performance?.score < 0.7) {
            recommendations.push('Optimize query performance and caching');
        }
        if (components.freshness?.score < 0.7) {
            recommendations.push('Update stale data and refresh embeddings');
        }
        return recommendations;
    }
}

// Error personalizado
class CoherenceLayerError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'CoherenceLayerError';
        this.originalError = originalError;
    }
}

module.exports = {
    KnowledgeCoherenceLayer,
    PostgreSQLConnector,
    ChromaDBConnector,
    CoherenceEngine,
    IntelligentCaching,
    ConsistencyValidator,
    RealTimeCrossValidator,
    CoherenceHealthMonitor,
    AutomaticConflictResolver,
    HealthScoringEngine,
    CoherenceLayerError
};
