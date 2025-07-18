#!/usr/bin/env node

// src/services/simpleDeduplicationEngine.js
// MOTOR DE DEDUPLICACIÓN INTELIGENTE SIMPLIFICADO - SOLUCIÓN 6
// Sistema conservador para eliminar duplicados obvios sin riesgo informativo

const { MarkdownContextEnricher } = require("./markdownContextEnricher");
const logger = require("../utils/logger");

/**
 * SIMPLE DEDUPLICATION ENGINE
 * Motor de deduplicación conservador que elimina solo duplicados obvios
 *
 * Filosofía de diseño:
 * - Conservador por defecto (preservar > eliminar)
 * - Solo eliminar duplicados obvios (>95% similitud)
 * - Priorizar tipos específicos de información
 * - Integración con contexto Markdown actualizado
 * - Métricas simples y efectivas
 */
class SimpleDeduplicationEngine {
  constructor(options = {}) {
    this.config = {
      // Umbral conservador - solo duplicados muy obvios
      similarityThreshold: options.threshold || 0.95,

      // Tipos de información prioritarios para deduplicación
      priorityTypes: [
        "PRICE_INFORMATION",
        "WARRANTY_INFORMATION",
        "SERVICE_DESCRIPTIONS",
        "DEVICE_INFORMATION",
      ],

      // Configuración específica SalvaCell
      salvaCellConfig: {
        preserveClientContext: true, // Preservar contexto de cliente
        preserveTimeVariations: true, // Mantener variaciones temporales
        markdownIntegration: true, // Usar contexto markdown
      },

      // Configuración de similitud por tipo
      typeThresholds: {
        PRICE_INFORMATION: 0.98, // Muy restrictivo para precios
        WARRANTY_INFORMATION: 0.95, // Estándar para garantías
        SERVICE_DESCRIPTIONS: 0.92, // Más permisivo para servicios
        DEVICE_INFORMATION: 0.96, // Restrictivo para dispositivos
        CLIENT_CONVERSATIONS: 0.99, // Muy restrictivo para conversaciones
      },

      ...options,
    };

    // Integración con enriquecedor Markdown
    this.markdownEnricher = new MarkdownContextEnricher({
      autoRefresh: false, // Evitar refresh automático en deduplicación
    });

    // Métricas de deduplicación
    this.metrics = {
      totalChecks: 0,
      duplicatesFound: 0,
      duplicatesSkipped: 0,
      informationPreserved: 0,
      typeBreakdown: {},
      lastCleanup: Date.now(),
    };

    // Cache de similitudes para optimización
    this.similarityCache = new Map();
    this.maxCacheSize = 1000;

    logger.info("🔄 SimpleDeduplicationEngine inicializado:", {
      threshold: this.config.similarityThreshold,
      priorityTypes: this.config.priorityTypes.length,
      markdownIntegration: this.config.salvaCellConfig.markdownIntegration,
    });
  }

  /**
   * VERIFICACIÓN PRINCIPAL DE DUPLICADOS
   * Verifica si un chunk nuevo es duplicado de contenido existente
   */
  async checkForDuplicates(newChunk, existingChunks = []) {
    const startTime = Date.now();
    this.metrics.totalChecks++;

    try {
      // 1. Clasificar tipo de información
      const infoType = this.classifyInformationType(newChunk);

      // 2. Verificar si es tipo prioritario
      if (!this.isPriorityType(infoType)) {
        this.recordPreservation(infoType, "not_priority_type");
        return {
          isDuplicate: false,
          action: "store_new",
          reason: "not_priority_type",
          infoType,
        };
      }

      // 3. Obtener umbral específico para el tipo
      const threshold = this.getThresholdForType(infoType);

      // 4. Buscar duplicados con contexto Markdown
      const duplicateAnalysis = await this.findDuplicatesWithContext(
        newChunk,
        existingChunks,
        threshold,
        infoType,
      );

      // 5. Tomar decisión conservadora
      const decision = this.makeConservativeDecision(
        duplicateAnalysis,
        newChunk,
      );

      // 6. Registrar métricas
      this.recordMetrics(decision, infoType, Date.now() - startTime);

      logger.debug(
        `🔍 Deduplicación: ${newChunk.text.substring(0, 50)}... → ${decision.action} (${infoType}, similitud: ${duplicateAnalysis.maxSimilarity?.toFixed(3) || "N/A"})`,
      );

      return decision;
    } catch (error) {
      logger.error("❌ Error en verificación de duplicados:", error);
      // En caso de error, preservar por seguridad
      return {
        isDuplicate: false,
        action: "store_new",
        reason: "error_fallback",
        error: error.message,
      };
    }
  }

  /**
   * CLASIFICACIÓN DE TIPO DE INFORMACIÓN
   * Determina el tipo de información para aplicar reglas específicas
   */
  classifyInformationType(chunk) {
    const text = chunk.text.toLowerCase();
    const metadata = chunk.metadata || {};

    // Análisis de patrones específicos SalvaCell
    if (
      this.containsPatterns(text, ["precio", "costo", "$", "vale", "cobran"]) ||
      metadata.price_quoted
    ) {
      return "PRICE_INFORMATION";
    }

    if (
      this.containsPatterns(text, [
        "garantía",
        "warranty",
        "30 días",
        "15 días",
      ]) ||
      metadata.main_intent === "warranty_query"
    ) {
      return "WARRANTY_INFORMATION";
    }

    if (
      this.containsPatterns(text, [
        "samsung",
        "iphone",
        "xiaomi",
        "motorola",
        "lg",
        "huawei",
      ]) ||
      metadata.device_mentioned
    ) {
      return "DEVICE_INFORMATION";
    }

    if (
      this.containsPatterns(text, [
        "pantalla",
        "batería",
        "cámara",
        "puerto",
        "reparación",
      ]) ||
      metadata.service_mentioned
    ) {
      return "SERVICE_DESCRIPTIONS";
    }

    return "CLIENT_CONVERSATIONS";
  }

  /**
   * BÚSQUEDA DE DUPLICADOS CON CONTEXTO MARKDOWN
   * Busca duplicados considerando información de archivos Markdown
   */
  async findDuplicatesWithContext(
    newChunk,
    existingChunks,
    threshold,
    infoType,
  ) {
    const duplicates = [];
    let maxSimilarity = 0;

    // Obtener contexto Markdown relevante
    const markdownContext = await this.getRelevantMarkdownContext(
      newChunk,
      infoType,
    );

    for (const existingChunk of existingChunks) {
      try {
        // Calcular similitud básica con contexto
        const similarity = await this.calculateContextualSimilarity(
          newChunk,
          existingChunk,
          markdownContext,
          infoType,
        );

        if (similarity > threshold) {
          duplicates.push({
            chunkId: existingChunk.id,
            similarity,
            existingChunk,
            reason: this.getDuplicateReason(similarity, infoType),
          });
        }

        maxSimilarity = Math.max(maxSimilarity, similarity);
      } catch (error) {
        logger.warn(
          `⚠️ Error calculando similitud con chunk ${existingChunk.id}:`,
          error.message,
        );
      }
    }

    return {
      duplicates,
      maxSimilarity,
      threshold,
      markdownContext,
      checkedCount: existingChunks.length,
    };
  }

  /**
   * CÁLCULO DE SIMILITUD CONTEXTUAL
   * Calcula similitud considerando contexto Markdown y tipo de información
   */
  async calculateContextualSimilarity(
    newChunk,
    existingChunk,
    markdownContext,
    infoType,
  ) {
    // Cache key para optimización
    const cacheKey = `${this.hashText(newChunk.text)}-${this.hashText(existingChunk.text)}`;

    if (this.similarityCache.has(cacheKey)) {
      return this.similarityCache.get(cacheKey);
    }

    // 1. Similitud textual básica (Jaccard)
    const textSimilarity = this.calculateJaccardSimilarity(
      newChunk.text,
      existingChunk.text,
    );

    // 2. Similitud de metadatos específicos SalvaCell
    const metadataSimilarity = this.calculateMetadataSimilarity(
      newChunk.metadata || {},
      existingChunk.metadata || {},
      infoType,
    );

    // 3. Similitud de contexto Markdown (si aplica)
    const markdownSimilarity = this.calculateMarkdownContextSimilarity(
      newChunk,
      existingChunk,
      markdownContext,
    );

    // 4. Combinar similitudes con pesos específicos por tipo
    const weights = this.getWeightsForType(infoType);
    const combinedSimilarity =
      textSimilarity * weights.text +
      metadataSimilarity * weights.metadata +
      markdownSimilarity * weights.markdown;

    // Cache del resultado
    if (this.similarityCache.size >= this.maxCacheSize) {
      // Limpiar cache cuando está lleno
      this.similarityCache.clear();
    }
    this.similarityCache.set(cacheKey, combinedSimilarity);

    return Math.max(0, Math.min(1, combinedSimilarity));
  }

  /**
   * SIMILITUD JACCARD PARA TEXTO
   * Calcula similitud basada en conjuntos de palabras
   */
  calculateJaccardSimilarity(text1, text2) {
    // Normalizar y tokenizar
    const tokens1 = new Set(this.tokenizeText(text1));
    const tokens2 = new Set(this.tokenizeText(text2));

    // Calcular intersección y unión
    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * SIMILITUD DE METADATOS ESPECÍFICOS SALVACELL
   * Compara metadatos relevantes para el negocio
   */
  calculateMetadataSimilarity(metadata1, metadata2, infoType) {
    let similarity = 0;
    let factors = 0;

    // Factores comunes
    if (metadata1.client_id && metadata2.client_id) {
      similarity += metadata1.client_id === metadata2.client_id ? 1 : 0;
      factors++;
    }

    // Factores específicos por tipo
    switch (infoType) {
      case "PRICE_INFORMATION":
        if (metadata1.device_mentioned && metadata2.device_mentioned) {
          const deviceSim = this.calculateDeviceSimilarity(
            metadata1.device_mentioned,
            metadata2.device_mentioned,
          );
          similarity += deviceSim;
          factors++;
        }
        if (metadata1.price_quoted && metadata2.price_quoted) {
          const priceDiff = Math.abs(
            parseFloat(metadata1.price_quoted) -
              parseFloat(metadata2.price_quoted),
          );
          similarity += priceDiff < 100 ? 1 : 0; // Diferencia menor a $100
          factors++;
        }
        break;

      case "WARRANTY_INFORMATION":
        if (metadata1.main_intent && metadata2.main_intent) {
          similarity += metadata1.main_intent === metadata2.main_intent ? 1 : 0;
          factors++;
        }
        break;

      case "SERVICE_DESCRIPTIONS":
        if (metadata1.service_mentioned && metadata2.service_mentioned) {
          similarity +=
            metadata1.service_mentioned === metadata2.service_mentioned ? 1 : 0;
          factors++;
        }
        break;
    }

    return factors > 0 ? similarity / factors : 0.5; // Neutro si no hay factores
  }

  /**
   * SIMILITUD DE CONTEXTO MARKDOWN
   * Considera información de archivos Markdown actualizados
   */
  calculateMarkdownContextSimilarity(newChunk, existingChunk, markdownContext) {
    if (!markdownContext || !this.config.salvaCellConfig.markdownIntegration) {
      return 0.5; // Neutro si no hay contexto
    }

    let similarity = 0;
    let factors = 0;

    // Comparar información temporal
    if (markdownContext.timeInfo) {
      const newHasTime = this.containsPatterns(newChunk.text, [
        "tiempo",
        "minutos",
        "horas",
        "4 pm",
      ]);
      const existingHasTime = this.containsPatterns(existingChunk.text, [
        "tiempo",
        "minutos",
        "horas",
        "4 pm",
      ]);

      if (newHasTime && existingHasTime) {
        similarity += 1;
      } else if (newHasTime || existingHasTime) {
        similarity += 0.5;
      }
      factors++;
    }

    // Comparar información de garantía
    if (markdownContext.warrantyInfo) {
      const newHasWarranty = this.containsPatterns(newChunk.text, [
        "garantía",
        "30 días",
        "15 días",
      ]);
      const existingHasWarranty = this.containsPatterns(existingChunk.text, [
        "garantía",
        "30 días",
        "15 días",
      ]);

      if (newHasWarranty && existingHasWarranty) {
        similarity += 1;
      } else if (newHasWarranty || existingHasWarranty) {
        similarity += 0.5;
      }
      factors++;
    }

    return factors > 0 ? similarity / factors : 0.5;
  }

  /**
   * DECISIÓN CONSERVADORA
   * Toma decisión final priorizando preservación de información
   */
  makeConservativeDecision(duplicateAnalysis, newChunk) {
    const { duplicates, maxSimilarity, threshold } = duplicateAnalysis;

    // No hay duplicados - almacenar como nuevo
    if (duplicates.length === 0) {
      return {
        isDuplicate: false,
        action: "store_new",
        reason: "no_duplicates_found",
        similarity: maxSimilarity,
      };
    }

    // Encontrar el mejor duplicado
    const bestDuplicate = duplicates.reduce((best, current) =>
      current.similarity > best.similarity ? current : best,
    );

    // Decisión conservadora basada en similitud
    if (bestDuplicate.similarity >= 0.98) {
      // Duplicado muy obvio - omitir
      return {
        isDuplicate: true,
        action: "skip",
        reason: "obvious_duplicate",
        similarity: bestDuplicate.similarity,
        duplicateId: bestDuplicate.chunkId,
      };
    } else if (bestDuplicate.similarity >= 0.92) {
      // Duplicado posible pero conservador - almacenar como variante
      return {
        isDuplicate: true,
        action: "store_variant",
        reason: "possible_duplicate_preserved",
        similarity: bestDuplicate.similarity,
        duplicateId: bestDuplicate.chunkId,
      };
    } else {
      // No es duplicado según umbral - almacenar como nuevo
      return {
        isDuplicate: false,
        action: "store_new",
        reason: "below_threshold",
        similarity: bestDuplicate.similarity,
      };
    }
  }

  /**
   * MÉTODOS AUXILIARES
   */
  isPriorityType(infoType) {
    return this.config.priorityTypes.includes(infoType);
  }

  getThresholdForType(infoType) {
    return (
      this.config.typeThresholds[infoType] || this.config.similarityThreshold
    );
  }

  getWeightsForType(infoType) {
    const weights = {
      PRICE_INFORMATION: { text: 0.4, metadata: 0.4, markdown: 0.2 },
      WARRANTY_INFORMATION: { text: 0.3, metadata: 0.3, markdown: 0.4 },
      SERVICE_DESCRIPTIONS: { text: 0.6, metadata: 0.3, markdown: 0.1 },
      DEVICE_INFORMATION: { text: 0.5, metadata: 0.4, markdown: 0.1 },
      CLIENT_CONVERSATIONS: { text: 0.7, metadata: 0.3, markdown: 0.0 },
    };

    return weights[infoType] || { text: 0.6, metadata: 0.3, markdown: 0.1 };
  }

  containsPatterns(text, patterns) {
    const lowerText = text.toLowerCase();
    return patterns.some((pattern) =>
      lowerText.includes(pattern.toLowerCase()),
    );
  }

  tokenizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1);
  }

  hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  calculateDeviceSimilarity(device1, device2) {
    const d1 = device1.toLowerCase().trim();
    const d2 = device2.toLowerCase().trim();

    if (d1 === d2) return 1;

    // Verificar si son variantes del mismo modelo
    const tokens1 = new Set(d1.split(/\s+/));
    const tokens2 = new Set(d2.split(/\s+/));
    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));

    return intersection.size / Math.max(tokens1.size, tokens2.size);
  }

  getDuplicateReason(similarity, infoType) {
    if (similarity >= 0.98) return "exact_duplicate";
    if (similarity >= 0.95) return "very_similar";
    if (similarity >= 0.9) return "similar";
    return "potentially_similar";
  }

  async getRelevantMarkdownContext(chunk, infoType) {
    try {
      // Solo obtener contexto si está configurado
      if (!this.config.salvaCellConfig.markdownIntegration) {
        return null;
      }

      // Simular enrichment results para obtener contexto global
      const mockResults = {
        documents: [[chunk.text]],
        metadatas: [[chunk.metadata || {}]],
      };

      const enriched = this.markdownEnricher.enrichSearchResults(
        mockResults,
        chunk.text,
        infoType,
      );
      return enriched.globalMarkdownInfo;
    } catch (error) {
      logger.warn("⚠️ Error obteniendo contexto Markdown:", error.message);
      return null;
    }
  }

  /**
   * MÉTODOS DE MÉTRICAS Y MONITOREO
   */
  recordMetrics(decision, infoType, duration) {
    if (decision.isDuplicate) {
      this.metrics.duplicatesFound++;
      if (decision.action === "skip") {
        this.metrics.duplicatesSkipped++;
      }
    } else {
      this.metrics.informationPreserved++;
    }

    // Métricas por tipo
    if (!this.metrics.typeBreakdown[infoType]) {
      this.metrics.typeBreakdown[infoType] = {
        checked: 0,
        duplicates: 0,
        preserved: 0,
        avgDuration: 0,
      };
    }

    const typeStats = this.metrics.typeBreakdown[infoType];
    typeStats.checked++;

    if (decision.isDuplicate) {
      typeStats.duplicates++;
    } else {
      typeStats.preserved++;
    }

    // Actualizar duración promedio
    typeStats.avgDuration =
      (typeStats.avgDuration * (typeStats.checked - 1) + duration) /
      typeStats.checked;
  }

  recordPreservation(infoType, reason) {
    this.metrics.informationPreserved++;
    logger.debug(`📝 Información preservada: ${infoType} (${reason})`);
  }

  getDeduplicationStats() {
    const totalProcessed =
      this.metrics.duplicatesFound + this.metrics.informationPreserved;

    return {
      totalChecks: this.metrics.totalChecks,
      totalProcessed,
      duplicatesFound: this.metrics.duplicatesFound,
      duplicatesSkipped: this.metrics.duplicatesSkipped,
      informationPreserved: this.metrics.informationPreserved,
      duplicateRate:
        totalProcessed > 0 ? this.metrics.duplicatesFound / totalProcessed : 0,
      preservationRate:
        totalProcessed > 0
          ? this.metrics.informationPreserved / totalProcessed
          : 0,
      typeBreakdown: this.metrics.typeBreakdown,
      cacheSize: this.similarityCache.size,
      systemHealth: this.calculateSystemHealth(),
    };
  }

  calculateSystemHealth() {
    // Evitar recursión usando métricas directas
    const totalProcessed =
      this.metrics.duplicatesFound + this.metrics.informationPreserved;
    const preservationRate =
      totalProcessed > 0
        ? this.metrics.informationPreserved / totalProcessed
        : 0.9;
    const duplicateRate =
      totalProcessed > 0 ? this.metrics.duplicatesFound / totalProcessed : 0;

    // Métricas de salud del sistema
    const preservationScore = preservationRate; // Más preservación = mejor
    const efficiencyScore = Math.min(1, duplicateRate * 2); // Algo de deduplicación es bueno
    const performanceScore = this.metrics.totalChecks > 0 ? 1 : 0; // Sistema funcionando

    const overallHealth =
      preservationScore * 0.5 + efficiencyScore * 0.3 + performanceScore * 0.2;

    return {
      overall: Math.round(overallHealth * 100) / 100,
      preservation: Math.round(preservationScore * 100) / 100,
      efficiency: Math.round(efficiencyScore * 100) / 100,
      performance: Math.round(performanceScore * 100) / 100,
      status:
        overallHealth > 0.8
          ? "excellent"
          : overallHealth > 0.6
            ? "good"
            : "needs_attention",
    };
  }

  /**
   * MANTENIMIENTO
   */
  performMaintenance() {
    const now = Date.now();

    // Limpiar cache si es necesario
    if (this.similarityCache.size >= this.maxCacheSize * 0.8) {
      this.similarityCache.clear();
      logger.info("🧹 Cache de similitudes limpiado");
    }

    // Reset de métricas diarias (opcional)
    if (now - this.metrics.lastCleanup > 86400000) {
      // 24 horas
      this.resetDailyMetrics();
    }

    logger.info("🔧 Mantenimiento de SimpleDeduplicationEngine completado");
  }

  resetDailyMetrics() {
    // Mantener estadísticas acumulativas, resetear contadores diarios
    this.metrics.lastCleanup = Date.now();
    logger.info("📊 Métricas diarias de deduplicación reseteadas");
  }
}

module.exports = {
  SimpleDeduplicationEngine,
};
