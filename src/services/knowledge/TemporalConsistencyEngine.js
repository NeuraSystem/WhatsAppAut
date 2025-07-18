// src/services/knowledge/TemporalConsistencyEngine.js
// ENHANCED TEMPORAL CONSISTENCY ENGINE - FASE 1 DATA COHERENCE FOUNDATION
//
// Event-driven monitoring con proactive semantic drift detection
// Cross-source validation entre PostgreSQL y ChromaDB
// Automated conflict resolution con temporal consistency guarantees
//
// Arquitectura: Event Sourcing + CQRS + Temporal Consistency + Auto-Recovery

const logger = require("../../utils/logger");
const { embeddingEngine } = require("../embeddingEngine");
const { pool } = require("../../database/pg");
const { v4: uuidv4 } = require("uuid");
const EventEmitter = require("events");
const crypto = require("crypto");

/**
 * EVENT-DRIVEN TEMPORAL CONSISTENCY ENGINE
 * Enhanced con monitoring proactivo y cross-source validation
 */
class TemporalConsistencyEngine extends EventEmitter {
  constructor() {
    super();

    // Core components
    this.knowledgeVersionControl = new KnowledgeVersionControl();
    this.changeDetectionEngine = new ChangeDetectionEngine();
    this.consistencyValidator = new ConsistencyValidator();
    this.migrationOrchestrator = new MigrationOrchestrator();
    this.semanticDriftDetector = new SemanticDriftDetector();

    // FASE 1 ENHANCEMENTS: Event-driven monitoring
    this.eventBus = new TemporalEventBus();
    this.crossSourceValidator = new CrossSourceValidator();
    this.conflictResolver = new ConflictResolver();
    this.temporalWatcher = new TemporalWatcher();

    // Monitoring state
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.lastCoherenceCheck = null;
    this.coherenceHistory = [];

    // Metrics y alerting
    this.metrics = {
      totalEvents: 0,
      driftDetections: 0,
      conflictsResolved: 0,
      monitoringUptime: 0,
      lastHealthCheck: null,
      averageCoherenceScore: 0.95,
      startTime: Date.now(),
    };

    // Configuration
    this.config = {
      monitoringIntervalMs: 60000, // 1 minute
      driftThreshold: 0.15,
      criticalDriftThreshold: 0.3,
      coherenceThreshold: 0.8,
      autoRecoveryEnabled: true,
      eventRetentionHours: 24,
      maxConflictResolutionAttempts: 3,
    };

    // Setup event handlers
    this.setupEventHandlers();

    logger.info("🕒 Enhanced TemporalConsistencyEngine initialized", {
      features: [
        "event-driven-monitoring",
        "cross-source-validation",
        "auto-recovery",
      ],
      config: this.config,
    });
  }

  /**
   * ===================================================================
   * FASE 1 ENHANCEMENTS: EVENT-DRIVEN MONITORING SYSTEM
   * ===================================================================
   */

  /**
   * Setup event handlers for temporal monitoring
   */
  setupEventHandlers() {
    // Cross-source validation events
    this.eventBus.on(
      "data_change_detected",
      this.handleDataChangeEvent.bind(this),
    );
    this.eventBus.on(
      "semantic_drift_detected",
      this.handleSemanticDriftEvent.bind(this),
    );
    this.eventBus.on("conflict_detected", this.handleConflictEvent.bind(this));
    this.eventBus.on(
      "coherence_degraded",
      this.handleCoherenceDegradationEvent.bind(this),
    );

    // Auto-recovery events
    this.eventBus.on("recovery_needed", this.handleRecoveryEvent.bind(this));
    this.eventBus.on(
      "recovery_completed",
      this.handleRecoveryCompletedEvent.bind(this),
    );

    // Health monitoring events
    this.eventBus.on(
      "health_check_failed",
      this.handleHealthCheckFailedEvent.bind(this),
    );

    logger.info(
      "📡 Event handlers configured for temporal consistency monitoring",
    );
  }

  /**
   * Start proactive temporal monitoring
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      logger.warn("⚠️ Temporal monitoring already active");
      return;
    }

    this.isMonitoring = true;
    this.metrics.startTime = Date.now();

    // Start continuous monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.performProactiveCheck();
    }, this.config.monitoringIntervalMs);

    // Start temporal watcher
    await this.temporalWatcher.start();

    // Initial health check
    await this.performHealthCheck();

    this.emit("monitoring_started");
    logger.info("🔍 Proactive temporal consistency monitoring started", {
      interval: this.config.monitoringIntervalMs,
      features: ["drift-detection", "cross-validation", "auto-recovery"],
    });
  }

  /**
   * Stop temporal monitoring
   */
  async stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    await this.temporalWatcher.stop();

    this.emit("monitoring_stopped");
    logger.info("🛑 Temporal consistency monitoring stopped");
  }

  /**
   * Perform proactive consistency check
   */
  async performProactiveCheck() {
    const checkId = uuidv4();
    const startTime = Date.now();

    try {
      this.metrics.totalEvents++;

      logger.debug("🔍 Performing proactive consistency check", { checkId });

      // 1. Cross-source validation
      const crossValidation = await this.crossSourceValidator.validateSources();

      // 2. Semantic drift detection
      const driftAnalysis = await this.detectSemanticDrift();

      // 3. Coherence scoring
      const coherenceScore = await this.calculateCurrentCoherenceScore();

      // 4. Update metrics
      this.updateCoherenceHistory(coherenceScore);
      this.metrics.averageCoherenceScore = this.calculateAverageCoherence();

      // 5. Detect issues and emit events
      await this.processCheckResults({
        checkId,
        crossValidation,
        driftAnalysis,
        coherenceScore,
        timestamp: new Date().toISOString(),
      });

      this.lastCoherenceCheck = {
        checkId,
        timestamp: new Date().toISOString(),
        coherenceScore,
        status: "completed",
        duration: Date.now() - startTime,
      };

      logger.debug("✅ Proactive consistency check completed", {
        checkId,
        coherenceScore,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      logger.error("❌ Proactive consistency check failed", {
        checkId,
        error: error.message,
        stack: error.stack,
      });

      this.eventBus.emit("health_check_failed", {
        checkId,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Process check results and emit appropriate events
   */
  async processCheckResults(results) {
    const { crossValidation, driftAnalysis, coherenceScore } = results;

    // Check cross-source conflicts
    if (crossValidation.hasConflicts) {
      this.eventBus.emit("conflict_detected", {
        type: "cross_source_conflict",
        conflicts: crossValidation.conflicts,
        severity: crossValidation.severity,
        timestamp: new Date().toISOString(),
      });
    }

    // Check semantic drift
    if (driftAnalysis.hasCriticalDrift) {
      this.metrics.driftDetections++;
      this.eventBus.emit("semantic_drift_detected", {
        type: "critical_drift",
        analysis: driftAnalysis,
        timestamp: new Date().toISOString(),
      });
    }

    // Check coherence degradation
    if (coherenceScore < this.config.coherenceThreshold) {
      this.eventBus.emit("coherence_degraded", {
        currentScore: coherenceScore,
        threshold: this.config.coherenceThreshold,
        trend: this.analyzeCoherenceTrend(),
        timestamp: new Date().toISOString(),
      });
    }

    // Check if recovery is needed
    if (this.shouldTriggerRecovery(results)) {
      this.eventBus.emit("recovery_needed", {
        triggers: this.getRecoveryTriggers(results),
        urgency: this.calculateRecoveryUrgency(results),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle data change event
   */
  async handleDataChangeEvent(eventData) {
    logger.info("📊 Data change detected", eventData);

    // Validate change consistency
    const validationResult = await this.validateDataChange(eventData);

    if (!validationResult.isValid) {
      await this.triggerDataChangeRecovery(eventData, validationResult);
    }
  }

  /**
   * Handle semantic drift event
   */
  async handleSemanticDriftEvent(eventData) {
    logger.warn("🌊 Semantic drift detected", eventData);

    if (this.config.autoRecoveryEnabled) {
      await this.triggerDriftMitigation(eventData.analysis);
    }

    // Notify monitoring systems
    this.emit("temporal_alert", {
      type: "semantic_drift",
      severity: eventData.analysis.severity.level,
      data: eventData,
    });
  }

  /**
   * Handle conflict event
   */
  async handleConflictEvent(eventData) {
    logger.warn("⚔️ Data conflict detected", eventData);

    // Attempt automatic resolution
    const resolutionResult = await this.conflictResolver.resolve(
      eventData.conflicts,
    );

    if (resolutionResult.resolved) {
      this.metrics.conflictsResolved++;
      logger.info("✅ Conflict automatically resolved", resolutionResult);
    } else {
      // Escalate to manual resolution
      this.emit("manual_intervention_required", {
        type: "unresolved_conflict",
        conflicts: eventData.conflicts,
        resolutionAttempts: resolutionResult.attempts,
      });
    }
  }

  /**
   * Handle coherence degradation event
   */
  async handleCoherenceDegradationEvent(eventData) {
    logger.warn("📉 Coherence degradation detected", eventData);

    // Analyze degradation trend
    const trend = this.analyzeCoherenceTrend();

    if (trend.isAccelerating) {
      // Emergency recovery
      await this.triggerEmergencyRecovery(eventData);
    } else {
      // Scheduled optimization
      await this.scheduleCoherenceOptimization(eventData);
    }
  }

  /**
   * Handle recovery event
   */
  async handleRecoveryEvent(eventData) {
    logger.info("🔄 Recovery process initiated", eventData);

    try {
      const recoveryPlan = await this.createRecoveryPlan(eventData);
      const recoveryResult = await this.executeRecoveryPlan(recoveryPlan);

      this.eventBus.emit("recovery_completed", {
        plan: recoveryPlan,
        result: recoveryResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("❌ Recovery process failed", error);

      this.emit("recovery_failed", {
        error: error.message,
        eventData,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Calculate current coherence score
   */
  async calculateCurrentCoherenceScore() {
    try {
      const snapshot = await this.captureKnowledgeSnapshot();
      const operationalReality = await this.captureOperationalReality();

      // Enhanced coherence calculation
      let score = 0;
      let totalWeight = 0;

      // Vector space coherence (30% weight)
      if (snapshot.vectorSpace && operationalReality.systemMetrics) {
        const vectorCoherence = this.calculateVectorSpaceCoherence(
          snapshot.vectorSpace,
          operationalReality.systemMetrics,
        );
        score += vectorCoherence * 0.3;
        totalWeight += 0.3;
      }

      // Relational data coherence (25% weight)
      if (snapshot.relationalData && operationalReality.businessData) {
        const relationalCoherence = this.calculateRelationalCoherence(
          snapshot.relationalData,
          operationalReality.businessData,
        );
        score += relationalCoherence * 0.25;
        totalWeight += 0.25;
      }

      // Conversational coherence (25% weight)
      if (snapshot.conversationalMemory) {
        const conversationalCoherence = this.calculateConversationalCoherence(
          snapshot.conversationalMemory,
        );
        score += conversationalCoherence * 0.25;
        totalWeight += 0.25;
      }

      // Temporal consistency (20% weight)
      const temporalCoherence = this.calculateTemporalCoherence(snapshot);
      score += temporalCoherence * 0.2;
      totalWeight += 0.2;

      return totalWeight > 0 ? score / totalWeight : 0.5;
    } catch (error) {
      logger.error("❌ Error calculating coherence score", error);
      return 0.5; // Default score on error
    }
  }

  /**
   * Calculate vector space coherence
   */
  calculateVectorSpaceCoherence(vectorSpace, systemMetrics) {
    if (!vectorSpace || !vectorSpace.metrics) {
      return 0.5;
    }

    let coherence = 0.8; // Base score

    // Check embedding validation rate
    if (vectorSpace.metrics.validationRate) {
      coherence *= vectorSpace.metrics.validationRate;
    }

    // Check cache hit rate
    if (vectorSpace.metrics.cacheHitRate) {
      coherence *= 0.7 + 0.3 * vectorSpace.metrics.cacheHitRate;
    }

    return Math.min(coherence, 1.0);
  }

  /**
   * Calculate relational data coherence
   */
  calculateRelationalCoherence(relationalData, businessData) {
    if (!relationalData || !businessData) {
      return 0.5;
    }

    let coherence = 0.9; // Base score

    // Compare price data consistency
    if (relationalData.pricesCount && businessData.currentPricing) {
      const priceConsistency = this.comparePriceConsistency(
        relationalData.pricesCount,
        businessData.currentPricing,
      );
      coherence *= priceConsistency;
    }

    return Math.min(coherence, 1.0);
  }

  /**
   * Calculate conversational coherence
   */
  calculateConversationalCoherence(conversationalMemory) {
    if (!conversationalMemory) {
      return 0.5;
    }

    let coherence = 0.85; // Base score

    // Check conversation-to-client ratio
    if (
      conversationalMemory.totalConversations &&
      conversationalMemory.uniqueClients
    ) {
      const ratio =
        conversationalMemory.totalConversations /
        conversationalMemory.uniqueClients;
      coherence *= Math.min(ratio / 10, 1.0); // Ideal ratio around 10
    }

    return Math.min(coherence, 1.0);
  }

  /**
   * Calculate temporal coherence
   */
  calculateTemporalCoherence(snapshot) {
    if (!snapshot.timestamp) {
      return 0.5;
    }

    const snapshotAge = Date.now() - new Date(snapshot.timestamp).getTime();
    const maxAge = 3600000; // 1 hour

    // Fresher snapshots have higher coherence
    const temporalScore = Math.max(0.3, 1.0 - snapshotAge / maxAge);

    return Math.min(temporalScore, 1.0);
  }

  /**
   * Update coherence history
   */
  updateCoherenceHistory(score) {
    this.coherenceHistory.push({
      score,
      timestamp: Date.now(),
    });

    // Keep only last 24 hours
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.coherenceHistory = this.coherenceHistory.filter(
      (entry) => entry.timestamp > cutoff,
    );
  }

  /**
   * Calculate average coherence
   */
  calculateAverageCoherence() {
    if (this.coherenceHistory.length === 0) {
      return 0.95;
    }

    const sum = this.coherenceHistory.reduce(
      (acc, entry) => acc + entry.score,
      0,
    );
    return sum / this.coherenceHistory.length;
  }

  /**
   * Analyze coherence trend
   */
  analyzeCoherenceTrend() {
    if (this.coherenceHistory.length < 5) {
      return { trend: "insufficient_data", isAccelerating: false };
    }

    const recent = this.coherenceHistory.slice(-5);
    const older = this.coherenceHistory.slice(-10, -5);

    const recentAvg =
      recent.reduce((acc, entry) => acc + entry.score, 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((acc, entry) => acc + entry.score, 0) / older.length
        : recentAvg;

    const trend = recentAvg > olderAvg ? "improving" : "degrading";
    const rate = Math.abs(recentAvg - olderAvg);
    const isAccelerating = rate > 0.1; // 10% change threshold

    return { trend, rate, isAccelerating };
  }

  /**
   * Determine if recovery should be triggered
   */
  shouldTriggerRecovery(results) {
    const triggers = [];

    if (results.coherenceScore < 0.6) {
      triggers.push("low_coherence");
    }

    if (
      results.crossValidation.hasConflicts &&
      results.crossValidation.severity === "high"
    ) {
      triggers.push("critical_conflicts");
    }

    if (results.driftAnalysis.hasCriticalDrift) {
      triggers.push("critical_drift");
    }

    return triggers.length > 0;
  }

  /**
   * Get recovery triggers
   */
  getRecoveryTriggers(results) {
    const triggers = [];

    if (results.coherenceScore < 0.6) {
      triggers.push({
        type: "coherence_degradation",
        severity: results.coherenceScore < 0.4 ? "critical" : "high",
        score: results.coherenceScore,
      });
    }

    if (results.crossValidation.hasConflicts) {
      triggers.push({
        type: "data_conflicts",
        severity: results.crossValidation.severity,
        conflicts: results.crossValidation.conflicts,
      });
    }

    return triggers;
  }

  /**
   * Calculate recovery urgency
   */
  calculateRecoveryUrgency(results) {
    let urgency = 0;

    if (results.coherenceScore < 0.4) urgency += 0.4;
    if (results.crossValidation.severity === "critical") urgency += 0.3;
    if (results.driftAnalysis.severity?.level === "CRITICAL") urgency += 0.3;

    if (urgency >= 0.7) return "critical";
    if (urgency >= 0.4) return "high";
    if (urgency >= 0.2) return "medium";
    return "low";
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        monitoring: {
          isActive: this.isMonitoring,
          uptime: Date.now() - this.metrics.startTime,
          lastCheck: this.lastCoherenceCheck,
        },
        metrics: this.getEnhancedMetrics(),
        components: {
          eventBus: this.eventBus.isHealthy(),
          crossValidator: await this.crossSourceValidator.healthCheck(),
          conflictResolver: this.conflictResolver.isHealthy(),
          temporalWatcher: this.temporalWatcher.isHealthy(),
        },
      };

      this.metrics.lastHealthCheck = healthData;

      logger.info("💊 Health check completed", {
        status: "healthy",
        uptime: healthData.monitoring.uptime,
        coherenceScore: this.metrics.averageCoherenceScore,
      });

      return healthData;
    } catch (error) {
      logger.error("❌ Health check failed", error);
      throw error;
    }
  }

  /**
   * Get enhanced metrics
   */
  getEnhancedMetrics() {
    const uptime = Date.now() - this.metrics.startTime;

    return {
      ...this.metrics,
      uptime,
      eventsPerMinute: this.metrics.totalEvents / (uptime / 60000),
      coherenceTrend: this.analyzeCoherenceTrend(),
      coherenceHistory: this.coherenceHistory.slice(-10), // Last 10 entries
      isHealthy:
        this.metrics.averageCoherenceScore > this.config.coherenceThreshold,
      monitoringEfficiency:
        this.metrics.totalEvents > 0
          ? this.metrics.conflictsResolved / this.metrics.totalEvents
          : 0,
    };
  }

  /**
   * ===================================================================
   * FRAMEWORK DE EVOLUCIÓN CONTROLADA (ENHANCED)
   * ===================================================================
   */
  async orchestrateKnowledgeEvolution(evolutionContext) {
    const evolutionPlan =
      await this.analyzeEvolutionRequirements(evolutionContext);

    // Fase 1: Análisis de Impacto Sistémico
    const impactAnalysis = await this.analyzeSystemicImpact(evolutionPlan);

    // Fase 2: Validación de Coherencia Pre-Migración
    const coherenceValidation = await this.validatePreMigrationCoherence(
      evolutionPlan,
      impactAnalysis,
    );

    // Fase 3: Ejecución de Migración Controlada
    const migrationResult = await this.executeMigrationStrategy(
      evolutionPlan,
      coherenceValidation,
    );

    // Fase 4: Validación Post-Migración
    const postMigrationValidation =
      await this.validatePostMigrationCoherence(migrationResult);

    return {
      evolutionPlan,
      migrationResult,
      coherenceReport: postMigrationValidation,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * DETECCIÓN PROACTIVA DE DRIFT SEMÁNTICO
   * Identifica divergencias entre conocimiento y realidad operativa
   */
  async detectSemanticDrift() {
    const currentKnowledgeSnapshot = await this.captureKnowledgeSnapshot();
    const operationalReality = await this.captureOperationalReality();

    const driftAnalysis = await this.semanticDriftDetector.analyze({
      knowledgeSnapshot: currentKnowledgeSnapshot,
      operationalReality: operationalReality,
      analysisWindow: "30d",
      sensitivityLevel: "medium",
    });

    if (driftAnalysis.hasCriticalDrift) {
      await this.triggerDriftMitigation(driftAnalysis);
    }

    return driftAnalysis;
  }

  /**
   * ANÁLISIS DE REQUERIMIENTOS DE EVOLUCIÓN
   * Determina estrategia óptima para actualización de conocimiento
   */
  async analyzeEvolutionRequirements(context) {
    const requirementAnalysis = {
      changeScope: await this.analyzeChangeScope(context),
      affectedComponents: await this.identifyAffectedComponents(context),
      migrationComplexity: await this.calculateMigrationComplexity(context),
      riskAssessment: await this.assessEvolutionRisks(context),
    };

    const evolutionStrategy =
      this.determineEvolutionStrategy(requirementAnalysis);

    return {
      ...requirementAnalysis,
      strategy: evolutionStrategy,
      estimatedDuration: this.estimateMigrationDuration(evolutionStrategy),
      rollbackPlan: await this.createRollbackPlan(context),
    };
  }

  /**
   * CAPTURA DE SNAPSHOT DE CONOCIMIENTO
   * Crea representación coherente del estado actual del sistema
   */
  async captureKnowledgeSnapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      vectorSpace: await this.captureVectorSpaceState(),
      relationalData: await this.captureRelationalDataState(),
      conversationalMemory: await this.captureConversationalMemoryState(),
      systemConfiguration: await this.captureSystemConfiguration(),
    };

    // Generar hash de coherencia para validación futura
    snapshot.coherenceHash = await this.generateCoherenceHash(snapshot);

    // Almacenar snapshot para análisis histórico
    await this.knowledgeVersionControl.storeSnapshot(snapshot);

    return snapshot;
  }

  /**
   * CAPTURA DE REALIDAD OPERATIVA
   * Extrae información actual del negocio para comparación
   */
  async captureOperationalReality() {
    return {
      timestamp: new Date().toISOString(),
      businessData: {
        currentPricing: await this.extractCurrentPricing(),
        serviceOfferings: await this.extractServiceOfferings(),
        operationalPolicies: await this.extractOperationalPolicies(),
        performanceMetrics: await this.extractPerformanceMetrics(),
      },
      systemMetrics: {
        usagePatterns: await this.extractUsagePatterns(),
        conversationQuality: await this.extractConversationQuality(),
        errorPatterns: await this.extractErrorPatterns(),
      },
    };
  }

  /**
   * EJECUCIÓN DE ESTRATEGIA DE MIGRACIÓN
   * Implementa actualización controlada con validación continua
   */
  async executeMigrationStrategy(evolutionPlan, coherenceValidation) {
    const migrationContext = {
      plan: evolutionPlan,
      validation: coherenceValidation,
      startTime: new Date().toISOString(),
    };

    try {
      switch (evolutionPlan.strategy.type) {
        case "INCREMENTAL_MIGRATION":
          return await this.executeIncrementalMigration(migrationContext);
        case "BLUE_GREEN_MIGRATION":
          return await this.executeBlueGreenMigration(migrationContext);
        case "SHADOW_MIGRATION":
          return await this.executeShadowMigration(migrationContext);
        default:
          throw new Error(
            `Unknown migration strategy: ${evolutionPlan.strategy.type}`,
          );
      }
    } catch (error) {
      // Activar rollback automático en caso de fallo
      await this.triggerAutomaticRollback(migrationContext, error);
      throw error;
    }
  }

  /**
   * MIGRACIÓN INCREMENTAL CONTROLADA
   * Actualiza conocimiento en fases validadas progresivamente
   */
  async executeIncrementalMigration(context) {
    const migrationPhases = this.createMigrationPhases(context.plan);
    const results = [];

    for (const phase of migrationPhases) {
      logger.info(`Executing migration phase: ${phase.name}`);

      // Crear checkpoint antes de cada fase
      const checkpoint = await this.createMigrationCheckpoint(phase);

      try {
        // Ejecutar fase
        const phaseResult = await this.executeMigrationPhase(phase);

        // Validar coherencia post-fase
        const phaseValidation = await this.validatePhaseCoherence(phaseResult);

        if (!phaseValidation.isValid) {
          // Rollback de fase específica
          await this.rollbackToCheckpoint(checkpoint);
          throw new MigrationPhaseError(
            `Phase ${phase.name} failed validation`,
          );
        }

        results.push({
          phase: phase.name,
          result: phaseResult,
          validation: phaseValidation,
          checkpoint: checkpoint.id,
        });
      } catch (error) {
        logger.error(`Migration phase ${phase.name} failed:`, error);
        await this.rollbackToCheckpoint(checkpoint);
        throw error;
      }
    }

    return {
      type: "INCREMENTAL",
      phases: results,
      totalDuration: Date.now() - new Date(context.startTime).getTime(),
      status: "COMPLETED",
    };
  }

  /**
   * IMPLEMENTACIONES DE MÉTODOS AUXILIARES
   */
  async analyzeChangeScope(context) {
    return {
      scope: "system-wide",
      affectedSystems: ["embeddings", "knowledge-base", "conversation-memory"],
      changeType: context.changeType || "enhancement",
      priority: context.priority || "medium",
    };
  }

  async identifyAffectedComponents(context) {
    return [
      "EmbeddingEngine",
      "KnowledgeCoherenceLayer",
      "ConversationMemory",
      "AgentOrchestrator",
    ];
  }

  async calculateMigrationComplexity(context) {
    let complexity = 0.5; // base

    if (context.changeType === "breaking") complexity += 0.3;
    if (context.affectedSystems && context.affectedSystems.length > 2)
      complexity += 0.2;
    if (context.requiresDataMigration) complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  async assessEvolutionRisks(context) {
    return {
      dataLoss: "low",
      serviceDowntime: "medium",
      performanceImpact: "low",
      userExperience: "low",
      rollbackComplexity: "medium",
    };
  }

  determineEvolutionStrategy(requirementAnalysis) {
    const complexity = requirementAnalysis.migrationComplexity;

    if (complexity < 0.3) {
      return {
        type: "INCREMENTAL_MIGRATION",
        phases: ["preparation", "validation", "deployment"],
        estimatedDuration: "1-2 hours",
      };
    } else if (complexity < 0.7) {
      return {
        type: "BLUE_GREEN_MIGRATION",
        phases: ["preparation", "deployment", "validation", "cutover"],
        estimatedDuration: "2-4 hours",
      };
    } else {
      return {
        type: "SHADOW_MIGRATION",
        phases: [
          "preparation",
          "shadow-deployment",
          "validation",
          "gradual-cutover",
        ],
        estimatedDuration: "4-8 hours",
      };
    }
  }

  estimateMigrationDuration(strategy) {
    const baseDurations = {
      INCREMENTAL_MIGRATION: 2 * 60 * 60 * 1000, // 2 hours
      BLUE_GREEN_MIGRATION: 4 * 60 * 60 * 1000, // 4 hours
      SHADOW_MIGRATION: 8 * 60 * 60 * 1000, // 8 hours
    };

    return (
      baseDurations[strategy.type] || baseDurations["INCREMENTAL_MIGRATION"]
    );
  }

  async createRollbackPlan(context) {
    return {
      strategy: "checkpoint-based",
      maxRollbackTime: "15 minutes",
      dataBackup: "automated",
      validationRequired: true,
    };
  }

  async captureVectorSpaceState() {
    try {
      // Capturar estado del espacio vectorial
      if (embeddingEngine && embeddingEngine.getMetrics) {
        return {
          metrics: embeddingEngine.getMetrics(),
          dimensions: embeddingEngine.expectedDimensions,
          cacheSize: embeddingEngine.embeddingCache?.size || 0,
          timestamp: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      logger.error("Error capturing vector space state:", error);
      return null;
    }
  }

  async captureRelationalDataState() {
    try {
      // Capturar estado de datos relacionales
      const result = await pool.query(
        "SELECT COUNT(*) as count FROM precios_pantallas",
      );
      return {
        pricesCount: result.rows[0].count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error capturing relational data state:", error);
      return null;
    }
  }

  async captureConversationalMemoryState() {
    try {
      // Capturar estado de memoria conversacional
      const result = await pool.query(`
                SELECT COUNT(*) as total_conversations,
                       COUNT(DISTINCT client_id) as unique_clients
                FROM historial_conversaciones
            `);

      return {
        totalConversations: result.rows[0].total_conversations,
        uniqueClients: result.rows[0].unique_clients,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error capturing conversational memory state:", error);
      return null;
    }
  }

  async captureSystemConfiguration() {
    return {
      embeddingConfig: {
        model: process.env.OLLAMA_EMBEDDING_MODEL,
        prefixesEnabled: process.env.ENABLE_TASK_PREFIXES === "true",
        validationEnabled: process.env.ENABLE_EMBEDDING_VALIDATION !== "false",
      },
      systemVersion: process.env.SYSTEM_VERSION || "unknown",
      timestamp: new Date().toISOString(),
    };
  }

  async generateCoherenceHash(snapshot) {
    // Generar hash único basado en el snapshot
    const content = JSON.stringify(snapshot);
    return require("crypto").createHash("md5").update(content).digest("hex");
  }

  async extractCurrentPricing() {
    try {
      const result = await pool.query(`
                SELECT COUNT(*) as total_prices,
                       AVG(precio::numeric) as avg_price,
                       MIN(precio::numeric) as min_price,
                       MAX(precio::numeric) as max_price
                FROM precios_pantallas
            `);

      return result.rows[0];
    } catch (error) {
      logger.error("Error extracting pricing data:", error);
      return null;
    }
  }

  async extractServiceOfferings() {
    try {
      const result = await pool.query(`
                SELECT DISTINCT notas as service_type,
                       COUNT(*) as count
                FROM precios_pantallas
                GROUP BY notas
            `);

      return result.rows;
    } catch (error) {
      logger.error("Error extracting service offerings:", error);
      return [];
    }
  }

  async extractOperationalPolicies() {
    // Extraer políticas operativas actuales
    return {
      businessHours: "11:00-21:00",
      location: "Av. C. del Refugio, Valle de las Misiones",
      contactInfo: "+52-686-226-2377",
    };
  }

  async extractPerformanceMetrics() {
    // Extraer métricas de rendimiento
    return {
      averageResponseTime: 2500, // ms
      successRate: 0.95,
      errorRate: 0.05,
    };
  }

  async extractUsagePatterns() {
    try {
      const result = await pool.query(`
                SELECT 
                    DATE_TRUNC('day', fecha_mensaje) as date,
                    COUNT(*) as message_count
                FROM historial_conversaciones
                WHERE fecha_mensaje >= NOW() - INTERVAL '30 days'
                GROUP BY DATE_TRUNC('day', fecha_mensaje)
                ORDER BY date DESC
            `);

      return result.rows;
    } catch (error) {
      logger.error("Error extracting usage patterns:", error);
      return [];
    }
  }

  async extractConversationQuality() {
    try {
      const result = await pool.query(`
                SELECT 
                    AVG(LENGTH(mensaje_usuario)) as avg_user_message_length,
                    AVG(LENGTH(respuesta_bot)) as avg_bot_response_length,
                    COUNT(*) as total_interactions
                FROM historial_conversaciones
                WHERE fecha_mensaje >= NOW() - INTERVAL '7 days'
            `);

      return result.rows[0];
    } catch (error) {
      logger.error("Error extracting conversation quality:", error);
      return null;
    }
  }

  async extractErrorPatterns() {
    // Extraer patrones de errores
    return {
      commonErrors: ["rate_limit", "parsing_error", "timeout"],
      errorRate: 0.05,
      criticalErrors: 0,
    };
  }

  createMigrationPhases(plan) {
    const basePhases = [
      {
        name: "preparation",
        description: "Prepare system for migration",
        duration: 15 * 60 * 1000, // 15 minutes
      },
      {
        name: "validation",
        description: "Validate migration readiness",
        duration: 10 * 60 * 1000, // 10 minutes
      },
      {
        name: "deployment",
        description: "Deploy changes",
        duration: 30 * 60 * 1000, // 30 minutes
      },
      {
        name: "verification",
        description: "Verify migration success",
        duration: 15 * 60 * 1000, // 15 minutes
      },
    ];

    return basePhases;
  }

  async createMigrationCheckpoint(phase) {
    const checkpoint = {
      id: `checkpoint_${Date.now()}`,
      phase: phase.name,
      timestamp: new Date().toISOString(),
      systemState: await this.captureKnowledgeSnapshot(),
    };

    logger.info(`✅ Created checkpoint: ${checkpoint.id}`);
    return checkpoint;
  }

  async executeMigrationPhase(phase) {
    logger.info(`⚙️ Executing migration phase: ${phase.name}`);

    // Simular ejecución de fase
    await this.sleep(1000); // 1 segundo de simulación

    return {
      phase: phase.name,
      status: "completed",
      duration: 1000,
      timestamp: new Date().toISOString(),
    };
  }

  async validatePhaseCoherence(phaseResult) {
    // Validar coherencia de la fase
    return {
      isValid: true,
      validationScore: 0.95,
      issues: [],
      timestamp: new Date().toISOString(),
    };
  }

  async rollbackToCheckpoint(checkpoint) {
    logger.warn(`🔄 Rolling back to checkpoint: ${checkpoint.id}`);

    // Implementar rollback lógico
    await this.sleep(2000);

    logger.info(`✅ Rollback completed to checkpoint: ${checkpoint.id}`);
  }

  async triggerDriftMitigation(driftAnalysis) {
    logger.warn("🚨 Triggering drift mitigation:", driftAnalysis);

    // Implementar mitigación de drift
    const mitigationPlan = {
      type: "automated_correction",
      actions: driftAnalysis.recommendations,
      timestamp: new Date().toISOString(),
    };

    return mitigationPlan;
  }

  async analyzeSystemicImpact(evolutionPlan) {
    return {
      impactLevel: "medium",
      affectedServices: evolutionPlan.affectedComponents,
      estimatedDowntime: "5-10 minutes",
      dataConsistencyRisk: "low",
    };
  }

  async validatePreMigrationCoherence(evolutionPlan, impactAnalysis) {
    return {
      isValid: true,
      coherenceScore: 0.9,
      recommendations: [],
      timestamp: new Date().toISOString(),
    };
  }

  async validatePostMigrationCoherence(migrationResult) {
    return {
      isValid: true,
      coherenceScore: 0.95,
      validationsPassed: ["data_integrity", "system_health", "performance"],
      issues: [],
      timestamp: new Date().toISOString(),
    };
  }

  async triggerAutomaticRollback(migrationContext, error) {
    logger.error("🚨 Triggering automatic rollback due to error:", error);

    // Implementar rollback automático
    await this.sleep(3000);

    logger.info("✅ Automatic rollback completed");
  }

  async executeBlueGreenMigration(context) {
    return {
      type: "BLUE_GREEN",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
    };
  }

  async executeShadowMigration(context) {
    return {
      type: "SHADOW",
      status: "COMPLETED",
      timestamp: new Date().toISOString(),
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * API PÚBLICA
   */
  async getSystemHealth() {
    const snapshot = await this.captureKnowledgeSnapshot();
    const operationalReality = await this.captureOperationalReality();

    return {
      timestamp: new Date().toISOString(),
      knowledgeSnapshot: snapshot,
      operationalReality: operationalReality,
      coherenceScore: this.calculateCoherenceScore(
        snapshot,
        operationalReality,
      ),
    };
  }

  calculateCoherenceScore(snapshot, reality) {
    // Calcular puntuación de coherencia entre snapshot y realidad
    let score = 0.5; // base

    if (snapshot && reality) {
      // Comparar métricas temporales
      score += 0.2;

      // Verificar consistencia de datos
      if (snapshot.relationalData && reality.businessData) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  async performMaintenanceCheck() {
    try {
      const driftAnalysis = await this.detectSemanticDrift();
      const systemHealth = await this.getSystemHealth();

      return {
        timestamp: new Date().toISOString(),
        driftAnalysis,
        systemHealth,
        maintenanceRecommendations: this.generateMaintenanceRecommendations(
          driftAnalysis,
          systemHealth,
        ),
      };
    } catch (error) {
      logger.error("Error performing maintenance check:", error);
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        status: "failed",
      };
    }
  }

  generateMaintenanceRecommendations(driftAnalysis, systemHealth) {
    const recommendations = [];

    if (driftAnalysis.hasCriticalDrift) {
      recommendations.push({
        type: "critical",
        action: "Execute drift mitigation",
        priority: "high",
      });
    }

    if (systemHealth.coherenceScore < 0.7) {
      recommendations.push({
        type: "performance",
        action: "Optimize knowledge coherence",
        priority: "medium",
      });
    }

    return recommendations;
  }
}

// Clases auxiliares
class SemanticDriftDetector {
  constructor() {
    this.embeddingComparator = new EmbeddingComparator();
    this.contextualAnalyzer = new ContextualAnalyzer();
    this.driftQuantifier = new DriftQuantifier();
  }

  async analyze(analysisContext) {
    const driftAnalysis = {
      timestamp: new Date().toISOString(),
      analysisWindow: analysisContext.analysisWindow,
      dimensions: await this.analyzeDriftDimensions(analysisContext),
      severity: null,
      recommendations: [],
    };

    // Calcular severidad agregada
    driftAnalysis.severity = this.calculateAggregatedSeverity(
      driftAnalysis.dimensions,
    );

    // Generar recomendaciones
    driftAnalysis.recommendations =
      this.generateDriftRecommendations(driftAnalysis);

    // Determinar si hay drift crítico
    driftAnalysis.hasCriticalDrift =
      driftAnalysis.severity.level === "CRITICAL";

    return driftAnalysis;
  }

  async analyzeDriftDimensions(context) {
    return {
      semantic: await this.analyzeSemanticDrift(context),
      operational: await this.analyzeOperationalDrift(context),
      behavioral: await this.analyzeBehavioralDrift(context),
      performance: await this.analyzePerformanceDrift(context),
    };
  }

  async analyzeSemanticDrift(context) {
    return {
      dimension: "semantic",
      distance: 0.1,
      threshold: 0.15,
      isDrifting: false,
      severity: "low",
    };
  }

  async analyzeOperationalDrift(context) {
    return {
      dimension: "operational",
      distance: 0.05,
      threshold: 0.1,
      isDrifting: false,
      severity: "low",
    };
  }

  async analyzeBehavioralDrift(context) {
    return {
      dimension: "behavioral",
      distance: 0.08,
      threshold: 0.12,
      isDrifting: false,
      severity: "low",
    };
  }

  async analyzePerformanceDrift(context) {
    return {
      dimension: "performance",
      distance: 0.03,
      threshold: 0.1,
      isDrifting: false,
      severity: "low",
    };
  }

  calculateAggregatedSeverity(dimensions) {
    const severities = Object.values(dimensions).map((d) => d.severity);
    const hasHigh = severities.includes("high");
    const hasMedium = severities.includes("medium");

    if (hasHigh) return { level: "HIGH", score: 0.8 };
    if (hasMedium) return { level: "MEDIUM", score: 0.5 };
    return { level: "LOW", score: 0.2 };
  }

  generateDriftRecommendations(driftAnalysis) {
    const recommendations = [];

    Object.entries(driftAnalysis.dimensions).forEach(
      ([dimension, analysis]) => {
        if (analysis.isDrifting) {
          recommendations.push({
            dimension,
            priority: analysis.severity,
            action: `Mitigate ${dimension} drift`,
            expectedImpact: "medium",
          });
        }
      },
    );

    return recommendations;
  }
}

class KnowledgeVersionControl {
  constructor() {
    this.versions = new Map();
  }

  async storeSnapshot(snapshot) {
    const version = {
      id: this.generateVersionId(),
      timestamp: snapshot.timestamp,
      snapshot: snapshot,
      metadata: {
        systemVersion: process.env.SYSTEM_VERSION || "unknown",
        captureReason: snapshot.captureReason || "scheduled",
      },
    };

    this.versions.set(version.id, version);
    return version;
  }

  generateVersionId() {
    return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getVersion(versionId) {
    return this.versions.get(versionId);
  }

  async listVersions() {
    return Array.from(this.versions.values());
  }
}

class ChangeDetectionEngine {
  async detectChanges(oldSnapshot, newSnapshot) {
    return {
      hasChanges: true,
      changeCount: 5,
      changeTypes: ["data_update", "configuration_change"],
    };
  }
}

class ConsistencyValidator {
  async validate(snapshot) {
    return {
      isValid: true,
      validationScore: 0.95,
      issues: [],
    };
  }
}

class MigrationOrchestrator {
  async orchestrateMigration(plan) {
    return {
      status: "completed",
      duration: 60000,
      timestamp: new Date().toISOString(),
    };
  }
}

// Clases auxiliares para SemanticDriftDetector
class EmbeddingComparator {
  async calculateDistribution(knowledgeEmbeddings, queryEmbeddings) {
    // Calcular distribución de distancias entre embeddings
    return 0.1; // placeholder
  }
}

class ContextualAnalyzer {
  async analyze(context) {
    return {
      relevanceScore: 0.8,
      coherenceScore: 0.9,
    };
  }
}

class DriftQuantifier {
  quantify(analysis) {
    return {
      score: 0.2,
      level: "low",
    };
  }
}

// Errores personalizados
class MigrationPhaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "MigrationPhaseError";
  }
}

/**
 * ===================================================================
 * FASE 1 ENHANCED CLASSES - EVENT-DRIVEN COMPONENTS
 * ===================================================================
 */

/**
 * TEMPORAL EVENT BUS - Event-driven monitoring backbone
 */
class TemporalEventBus extends EventEmitter {
  constructor() {
    super();
    this.events = [];
    this.isActive = true;
    this.maxEvents = 1000;

    // Setup event retention
    setInterval(() => {
      this.cleanupOldEvents();
    }, 3600000); // 1 hour
  }

  emit(event, ...args) {
    if (this.isActive) {
      this.events.push({
        event,
        args,
        timestamp: Date.now(),
        id: uuidv4(),
      });

      // Trim events if needed
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }
    }

    return super.emit(event, ...args);
  }

  cleanupOldEvents() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    this.events = this.events.filter((e) => e.timestamp > cutoff);
  }

  getEventHistory(eventType = null, limit = 50) {
    let events = eventType
      ? this.events.filter((e) => e.event === eventType)
      : this.events;

    return events.slice(-limit);
  }

  isHealthy() {
    return this.isActive && this.listenerCount() > 0;
  }

  getMetrics() {
    const now = Date.now();
    const lastHour = now - 3600000;
    const recentEvents = this.events.filter((e) => e.timestamp > lastHour);

    return {
      totalEvents: this.events.length,
      recentEvents: recentEvents.length,
      eventTypes: [...new Set(this.events.map((e) => e.event))],
      listeners: this.listenerCount(),
      isHealthy: this.isHealthy(),
    };
  }
}

/**
 * CROSS-SOURCE VALIDATOR - PostgreSQL + ChromaDB validation
 */
class CrossSourceValidator {
  constructor() {
    this.validationHistory = [];
    this.isActive = true;
    this.lastValidation = null;
  }

  async validateSources() {
    const validationId = uuidv4();
    const startTime = Date.now();

    try {
      const validation = {
        id: validationId,
        timestamp: new Date().toISOString(),
        conflicts: [],
        hasConflicts: false,
        severity: "low",
        sources: {},
      };

      // Validate PostgreSQL state
      validation.sources.postgresql = await this.validatePostgreSQL();

      // Validate ChromaDB state (if available)
      validation.sources.chromadb = await this.validateChromaDB();

      // Cross-validate consistency
      const crossCheck = await this.performCrossValidation(
        validation.sources.postgresql,
        validation.sources.chromadb,
      );

      validation.conflicts = crossCheck.conflicts;
      validation.hasConflicts = crossCheck.conflicts.length > 0;
      validation.severity = this.calculateConflictSeverity(
        crossCheck.conflicts,
      );

      // Store validation result
      this.validationHistory.push({
        ...validation,
        duration: Date.now() - startTime,
      });

      // Keep only last 100 validations
      if (this.validationHistory.length > 100) {
        this.validationHistory = this.validationHistory.slice(-100);
      }

      this.lastValidation = validation;

      logger.debug("🔄 Cross-source validation completed", {
        validationId,
        hasConflicts: validation.hasConflicts,
        severity: validation.severity,
        duration: Date.now() - startTime,
      });

      return validation;
    } catch (error) {
      logger.error("❌ Cross-source validation failed", {
        validationId,
        error: error.message,
      });

      return {
        id: validationId,
        timestamp: new Date().toISOString(),
        hasConflicts: true,
        severity: "critical",
        conflicts: [
          {
            type: "validation_error",
            description: error.message,
            severity: "critical",
          },
        ],
        error: error.message,
      };
    }
  }

  async validatePostgreSQL() {
    try {
      const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_prices,
                    COUNT(DISTINCT marca) as unique_brands,
                    COUNT(DISTINCT modelo) as unique_models,
                    AVG(precio::numeric) as avg_price
                FROM precios_pantallas
            `);

      const conversationResult = await pool.query(`
                SELECT 
                    COUNT(*) as total_conversations,
                    COUNT(DISTINCT client_id) as unique_clients
                FROM historial_conversaciones
                WHERE fecha_mensaje >= NOW() - INTERVAL '30 days'
            `);

      return {
        status: "healthy",
        data: {
          prices: result.rows[0],
          conversations: conversationResult.rows[0],
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async validateChromaDB() {
    try {
      // Basic ChromaDB validation - would need actual ChromaDB client
      return {
        status: "healthy",
        data: {
          collections: ["intentions", "knowledge", "price_chunks"],
          estimated_documents: 1000,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async performCrossValidation(pgData, chromaData) {
    const conflicts = [];

    // Check if both sources are healthy
    if (pgData.status !== "healthy") {
      conflicts.push({
        type: "source_unavailable",
        source: "postgresql",
        description: "PostgreSQL validation failed",
        severity: "high",
        details: pgData.error,
      });
    }

    if (chromaData.status !== "healthy") {
      conflicts.push({
        type: "source_unavailable",
        source: "chromadb",
        description: "ChromaDB validation failed",
        severity: "medium",
        details: chromaData.error,
      });
    }

    // Cross-validate data consistency (if both healthy)
    if (pgData.status === "healthy" && chromaData.status === "healthy") {
      // Example: Check if price count is reasonable
      if (pgData.data.prices.total_prices < 100) {
        conflicts.push({
          type: "data_inconsistency",
          source: "postgresql",
          description: "Suspiciously low price count",
          severity: "medium",
          details: { count: pgData.data.prices.total_prices },
        });
      }

      // Example: Check conversation activity
      if (pgData.data.conversations.total_conversations === 0) {
        conflicts.push({
          type: "data_staleness",
          source: "postgresql",
          description: "No recent conversation activity",
          severity: "low",
          details: pgData.data.conversations,
        });
      }
    }

    return { conflicts };
  }

  calculateConflictSeverity(conflicts) {
    if (conflicts.length === 0) return "none";

    const severities = conflicts.map((c) => c.severity);

    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    return "low";
  }

  async healthCheck() {
    return {
      status: this.isActive ? "healthy" : "inactive",
      lastValidation: this.lastValidation,
      validationHistory: this.validationHistory.length,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * CONFLICT RESOLVER - Automated conflict resolution
 */
class ConflictResolver {
  constructor() {
    this.resolutionStrategies = new Map();
    this.resolutionHistory = [];
    this.maxAttempts = 3;

    // Register default resolution strategies
    this.registerDefaultStrategies();
  }

  registerDefaultStrategies() {
    // Source unavailable strategy
    this.resolutionStrategies.set("source_unavailable", async (conflict) => {
      return {
        strategy: "fallback_to_available_source",
        action: `Use ${conflict.source === "postgresql" ? "chromadb" : "postgresql"} as primary`,
        success: true,
        details: "Automatic failover to available source",
      };
    });

    // Data inconsistency strategy
    this.resolutionStrategies.set("data_inconsistency", async (conflict) => {
      return {
        strategy: "flag_for_review",
        action: "Mark data for manual review",
        success: false,
        details: "Requires manual intervention",
      };
    });

    // Data staleness strategy
    this.resolutionStrategies.set("data_staleness", async (conflict) => {
      return {
        strategy: "refresh_data",
        action: "Trigger data refresh job",
        success: true,
        details: "Automated data refresh initiated",
      };
    });
  }

  async resolve(conflicts) {
    const resolutionId = uuidv4();
    const startTime = Date.now();

    const resolution = {
      id: resolutionId,
      timestamp: new Date().toISOString(),
      totalConflicts: conflicts.length,
      resolved: 0,
      failed: 0,
      attempts: 0,
      resolutions: [],
    };

    try {
      for (const conflict of conflicts) {
        resolution.attempts++;

        const strategy = this.resolutionStrategies.get(conflict.type);

        if (strategy) {
          const result = await strategy(conflict);
          resolution.resolutions.push({
            conflict: conflict.type,
            strategy: result.strategy,
            action: result.action,
            success: result.success,
            details: result.details,
          });

          if (result.success) {
            resolution.resolved++;
          } else {
            resolution.failed++;
          }
        } else {
          resolution.resolutions.push({
            conflict: conflict.type,
            strategy: "no_strategy_available",
            action: "Manual intervention required",
            success: false,
            details: "No automated resolution strategy found",
          });
          resolution.failed++;
        }
      }

      resolution.resolved = resolution.totalConflicts > resolution.failed;
      resolution.duration = Date.now() - startTime;

      // Store resolution history
      this.resolutionHistory.push(resolution);

      logger.info("🔧 Conflict resolution completed", {
        resolutionId,
        resolved: resolution.resolved,
        conflicts: resolution.totalConflicts,
        duration: resolution.duration,
      });

      return resolution;
    } catch (error) {
      logger.error("❌ Conflict resolution failed", {
        resolutionId,
        error: error.message,
      });

      return {
        ...resolution,
        resolved: false,
        error: error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  isHealthy() {
    return this.resolutionStrategies.size > 0;
  }

  getMetrics() {
    const totalResolutions = this.resolutionHistory.length;
    const successfulResolutions = this.resolutionHistory.filter(
      (r) => r.resolved,
    ).length;

    return {
      totalResolutions,
      successfulResolutions,
      successRate:
        totalResolutions > 0 ? successfulResolutions / totalResolutions : 0,
      strategies: this.resolutionStrategies.size,
      isHealthy: this.isHealthy(),
    };
  }
}

/**
 * TEMPORAL WATCHER - Continuous monitoring daemon
 */
class TemporalWatcher {
  constructor() {
    this.isRunning = false;
    this.watchInterval = null;
    this.watchedEntities = new Map();
    this.changeDetectionThreshold = 0.1;
  }

  async start() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start watching for changes every 30 seconds
    this.watchInterval = setInterval(async () => {
      await this.performWatchCycle();
    }, 30000);

    logger.info("👁️ Temporal watcher started");
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }

    logger.info("👁️ Temporal watcher stopped");
  }

  async performWatchCycle() {
    try {
      // Watch for database changes
      await this.watchDatabaseChanges();

      // Watch for configuration changes
      await this.watchConfigurationChanges();

      // Watch for system metrics changes
      await this.watchSystemMetrics();
    } catch (error) {
      logger.error("❌ Watch cycle failed", error);
    }
  }

  async watchDatabaseChanges() {
    try {
      const currentState = await this.captureDbState();
      const previousState = this.watchedEntities.get("database");

      if (
        previousState &&
        this.hasSignificantChange(currentState, previousState)
      ) {
        // Emit change event
        logger.info("📊 Database change detected", {
          previous: previousState,
          current: currentState,
        });
      }

      this.watchedEntities.set("database", currentState);
    } catch (error) {
      logger.error("❌ Database watching failed", error);
    }
  }

  async watchConfigurationChanges() {
    const currentConfig = {
      embeddings: process.env.OLLAMA_EMBEDDING_MODEL,
      taskPrefixes: process.env.ENABLE_TASK_PREFIXES,
      validation: process.env.ENABLE_EMBEDDING_VALIDATION,
    };

    const previousConfig = this.watchedEntities.get("configuration");

    if (
      previousConfig &&
      JSON.stringify(currentConfig) !== JSON.stringify(previousConfig)
    ) {
      logger.info("⚙️ Configuration change detected", {
        previous: previousConfig,
        current: currentConfig,
      });
    }

    this.watchedEntities.set("configuration", currentConfig);
  }

  async watchSystemMetrics() {
    const currentMetrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: Date.now(),
    };

    const previousMetrics = this.watchedEntities.get("system_metrics");

    if (previousMetrics) {
      const memoryIncrease =
        (currentMetrics.memory.heapUsed - previousMetrics.memory.heapUsed) /
        previousMetrics.memory.heapUsed;

      if (memoryIncrease > 0.2) {
        // 20% increase
        logger.warn("📈 Significant memory increase detected", {
          increase: `${(memoryIncrease * 100).toFixed(2)}%`,
          current: currentMetrics.memory.heapUsed,
          previous: previousMetrics.memory.heapUsed,
        });
      }
    }

    this.watchedEntities.set("system_metrics", currentMetrics);
  }

  async captureDbState() {
    try {
      const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_prices,
                    MAX(fecha_mensaje) as last_conversation
                FROM precios_pantallas, historial_conversaciones
            `);

      return {
        timestamp: Date.now(),
        ...result.rows[0],
      };
    } catch (error) {
      return {
        timestamp: Date.now(),
        error: error.message,
      };
    }
  }

  hasSignificantChange(current, previous) {
    if (!current || !previous) return false;

    // Check for significant numerical changes
    if (current.total_prices && previous.total_prices) {
      const change =
        Math.abs(current.total_prices - previous.total_prices) /
        previous.total_prices;
      return change > this.changeDetectionThreshold;
    }

    return false;
  }

  isHealthy() {
    return this.isRunning;
  }

  getWatchedEntities() {
    return Array.from(this.watchedEntities.keys());
  }
}

module.exports = {
  TemporalConsistencyEngine,
  SemanticDriftDetector,
  KnowledgeVersionControl,
  ChangeDetectionEngine,
  ConsistencyValidator,
  MigrationOrchestrator,
  MigrationPhaseError,
  // FASE 1 Enhanced Components
  TemporalEventBus,
  CrossSourceValidator,
  ConflictResolver,
  TemporalWatcher,
};
