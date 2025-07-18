#!/usr/bin/env node

// src/services/metadataEnhancer.js
// ENHANCED METADATA INTEGRATION - SOLUCIÓN 8 SIMPLIFICADA
// Sistema de validación y enriquecimiento de metadatos con integración Markdown

const { MarkdownMetadataExtractor } = require("./markdownMetadataExtractor");
const logger = require("../utils/logger");

/**
 * METADATA ENHANCER
 * Validación básica y enriquecimiento de metadatos para SalvaCell
 *
 * Características:
 * - Validación de tipos compatibles con ChromaDB (string, number, boolean)
 * - Integración con metadatos YAML de archivos Markdown
 * - Enriquecimiento automático con información de garantías y timing
 * - Compatible con sistemas existentes (deduplicación, límites dinámicos)
 */
class MetadataEnhancer {
  constructor(options = {}) {
    this.config = {
      // Validación conservadora - solo tipos básicos
      enableStrictValidation: options.strictValidation || false,

      // Integración con archivos Markdown
      markdownIntegration: options.markdownIntegration !== false,

      // Auto-enriquecimiento de metadatos
      autoEnrichment: options.autoEnrichment !== false,

      // Fallback seguro para datos inválidos
      safeFallback: options.safeFallback !== false,
    };

    // Inicializar extractor de metadatos Markdown
    if (this.config.markdownIntegration) {
      this.markdownExtractor = new MarkdownMetadataExtractor({
        autoRefresh: false, // Evitar refresh automático
      });
    }

    // Schema simplificado compatible con ChromaDB
    this.salvaCellSchema = {
      // Identificación (requeridos)
      client_id: { type: "string", required: true },
      timestamp: { type: "number", required: true },

      // Clasificación de consulta
      main_intent: {
        type: "string",
        required: true,
        enum: [
          "price_inquiry",
          "location_request",
          "availability_check",
          "warranty_claim",
          "general_inquiry",
        ],
      },

      // Información de dispositivo
      device_mentioned: { type: "string", required: false },
      device_brand: {
        type: "string",
        required: false,
        enum: [
          "iphone",
          "samsung",
          "motorola",
          "xiaomi",
          "huawei",
          "lg",
          "other",
        ],
      },

      // Información de servicio
      service_mentioned: { type: "string", required: false },
      service_type: {
        type: "string",
        required: false,
        enum: ["pantalla", "batería", "cámara", "puerto", "general"],
      },

      // Información comercial
      price_quoted: { type: "number", required: false },
      has_price_info: { type: "boolean", required: false },

      // Información de garantía (integrada desde Markdown)
      warranty_days: { type: "number", required: false },
      warranty_type: {
        type: "string",
        required: false,
        enum: ["original", "generica", "none"],
      },

      // Información de timing (integrada desde Markdown)
      estimated_service_time: { type: "number", required: false }, // en minutos
      same_day_eligible: { type: "boolean", required: false },

      // Métricas de calidad
      confidence_score: { type: "number", required: false },
      message_length: { type: "number", required: false },

      // Compatibilidad con sistema actual
      user_name: { type: "string", required: false },
      conversation_stage: { type: "string", required: false },
      satisfaction_level: { type: "number", required: false },
      hour_of_day: { type: "string", required: false },
      response_type: { type: "string", required: false },
      chunking_method: { type: "string", required: false },
    };

    // Métricas de validación
    this.metrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      enrichmentsApplied: 0,
      markdownIntegrations: 0,
    };

    logger.info("🔧 MetadataEnhancer inicializado:", {
      markdownIntegration: this.config.markdownIntegration,
      autoEnrichment: this.config.autoEnrichment,
      strictValidation: this.config.enableStrictValidation,
    });
  }

  /**
   * ENHANCER PRINCIPAL DE METADATOS
   * Valida, limpia y enriquece metadatos para almacenamiento
   */
  async enhanceMetadata(rawMetadata, context = {}) {
    const startTime = Date.now();
    this.metrics.totalValidations++;

    try {
      // 1. LIMPIAR Y NORMALIZAR DATOS BASE
      const cleanedMetadata = this.cleanRawMetadata(rawMetadata);

      // 2. VALIDAR TIPOS Y ESTRUCTURA
      const validationResult = this.validateMetadata(cleanedMetadata);

      if (!validationResult.isValid && this.config.enableStrictValidation) {
        logger.warn("Metadata validation failed:", validationResult.errors);
        this.metrics.failedValidations++;
        return this.createFallbackMetadata(rawMetadata, context);
      }

      // 3. ENRIQUECER CON INFORMACIÓN DE MARKDOWN
      let enhancedMetadata = validationResult.sanitizedMetadata;

      if (this.config.markdownIntegration && this.markdownExtractor) {
        enhancedMetadata = await this.enrichWithMarkdownData(
          enhancedMetadata,
          context,
        );
        this.metrics.markdownIntegrations++;
      }

      // 4. APLICAR AUTO-ENRIQUECIMIENTO
      if (this.config.autoEnrichment) {
        enhancedMetadata = this.applyAutoEnrichment(enhancedMetadata, context);
        this.metrics.enrichmentsApplied++;
      }

      // 5. VALIDACIÓN FINAL Y LIMPIEZA
      const finalMetadata = this.finalizeMetadata(enhancedMetadata);

      this.metrics.successfulValidations++;

      logger.debug(`✅ Metadata enhanced in ${Date.now() - startTime}ms:`, {
        originalFields: Object.keys(rawMetadata).length,
        enhancedFields: Object.keys(finalMetadata).length,
        markdownEnriched: this.config.markdownIntegration,
        validationPassed: validationResult.isValid,
      });

      return finalMetadata;
    } catch (error) {
      logger.error("Error enhancing metadata:", error);
      this.metrics.failedValidations++;
      return this.createFallbackMetadata(rawMetadata, context);
    }
  }

  /**
   * LIMPIAR METADATOS RAW
   * Normaliza y limpia datos de entrada
   */
  cleanRawMetadata(rawMetadata) {
    const cleaned = {};

    Object.entries(rawMetadata).forEach(([key, value]) => {
      // Normalizar nombres de campos
      const normalizedKey = this.normalizeFieldName(key);

      // Limpiar valores
      const cleanedValue = this.cleanFieldValue(value, normalizedKey);

      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[normalizedKey] = cleanedValue;
      }
    });

    // Asegurar campos requeridos básicos
    cleaned.client_id = this.normalizeClientId(cleaned.client_id);
    cleaned.timestamp = this.normalizeTimestamp(cleaned.timestamp);
    cleaned.main_intent = this.normalizeIntent(cleaned.main_intent);

    return cleaned;
  }

  /**
   * VALIDAR METADATOS
   * Validación de tipos compatible con ChromaDB
   */
  validateMetadata(metadata) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedMetadata: {},
    };

    // Validar cada campo según el schema
    Object.entries(metadata).forEach(([key, value]) => {
      const fieldSchema = this.salvaCellSchema[key];

      if (!fieldSchema) {
        // Campo desconocido - mantener si es tipo válido
        if (this.isChromaCompatibleType(value)) {
          result.sanitizedMetadata[key] = value;
        } else {
          result.warnings.push(`Unknown field with invalid type: ${key}`);
        }
        return;
      }

      const fieldValidation = this.validateField(key, value, fieldSchema);
      if (fieldValidation.isValid) {
        result.sanitizedMetadata[key] = fieldValidation.sanitizedValue;
      } else {
        result.isValid = false;
        result.errors.push(...fieldValidation.errors);
      }
    });

    // Verificar campos requeridos
    Object.entries(this.salvaCellSchema).forEach(([fieldName, fieldSchema]) => {
      if (fieldSchema.required && !(fieldName in result.sanitizedMetadata)) {
        result.isValid = false;
        result.errors.push(`Required field missing: ${fieldName}`);
      }
    });

    return result;
  }

  /**
   * VALIDAR CAMPO INDIVIDUAL
   * Validación y conversión de tipos
   */
  validateField(fieldName, value, schema) {
    const result = {
      isValid: true,
      errors: [],
      sanitizedValue: value,
    };

    // Validación de tipo
    if (!this.isValidType(value, schema.type)) {
      const converted = this.attemptTypeConversion(value, schema.type);
      if (converted.success) {
        result.sanitizedValue = converted.value;
      } else {
        result.isValid = false;
        result.errors.push(
          `Invalid type for ${fieldName}: expected ${schema.type}`,
        );
        return result;
      }
    }

    // Validaciones específicas
    if (schema.enum && !schema.enum.includes(result.sanitizedValue)) {
      // Intentar mapear a valor válido
      const mapped = this.mapToValidEnum(result.sanitizedValue, schema.enum);
      if (mapped) {
        result.sanitizedValue = mapped;
      } else {
        result.isValid = false;
        result.errors.push(`Invalid enum value for ${fieldName}`);
      }
    }

    return result;
  }

  /**
   * ENRIQUECER CON DATOS DE MARKDOWN
   * Integra información de archivos de precios
   */
  async enrichWithMarkdownData(metadata, context) {
    try {
      const enriched = { ...metadata };

      // Obtener información de dispositivo desde Markdown
      if (metadata.device_mentioned || context.device) {
        const deviceInfo = await this.markdownExtractor.getDeviceInfo(
          metadata.device_mentioned || context.device,
        );

        if (deviceInfo) {
          // Enriquecer con información de garantía
          enriched.warranty_days = deviceInfo.garantia_original || 30;
          enriched.warranty_type = "original";

          // Enriquecer con información de timing
          enriched.estimated_service_time = deviceInfo.tiempo_promedio || 52;
          enriched.same_day_eligible = true; // Basado en regla de 4 PM

          // Enriquecer con información de marca
          if (deviceInfo.marca && !enriched.device_brand) {
            enriched.device_brand = deviceInfo.marca.toLowerCase();
          }
        }
      }

      // Aplicar información global de timing
      if (!enriched.estimated_service_time) {
        enriched.estimated_service_time = 52; // Promedio según Markdown
      }

      // Aplicar reglas de negocio de SalvaCell
      if (!enriched.same_day_eligible) {
        const currentHour = new Date().getHours();
        enriched.same_day_eligible = currentHour < 16; // Antes de 4 PM
      }

      return enriched;
    } catch (error) {
      logger.warn("Error enriching with Markdown data:", error.message);
      return metadata; // Retornar sin enriquecimiento si falla
    }
  }

  /**
   * APLICAR AUTO-ENRIQUECIMIENTO
   * Mejoras automáticas basadas en contexto
   */
  applyAutoEnrichment(metadata, context) {
    const enriched = { ...metadata };

    // Calcular confidence score si no existe
    if (!enriched.confidence_score) {
      enriched.confidence_score = this.calculateConfidenceScore(
        metadata,
        context,
      );
    }

    // Detectar tipo de servicio si no existe
    if (!enriched.service_type && enriched.service_mentioned) {
      enriched.service_type = this.mapServiceType(enriched.service_mentioned);
    }

    // Detectar marca de dispositivo si no existe
    if (!enriched.device_brand && enriched.device_mentioned) {
      enriched.device_brand = this.extractDeviceBrand(
        enriched.device_mentioned,
      );
    }

    // Establecer flags boolean
    enriched.has_price_info = Boolean(enriched.price_quoted);

    return enriched;
  }

  /**
   * FINALIZAR METADATOS
   * Limpieza final y asegurar compatibilidad ChromaDB
   */
  finalizeMetadata(metadata) {
    const finalized = {};

    Object.entries(metadata).forEach(([key, value]) => {
      if (this.isChromaCompatibleType(value)) {
        finalized[key] = value;
      } else {
        logger.debug(`Filtered incompatible field: ${key} (${typeof value})`);
      }
    });

    return finalized;
  }

  /**
   * MÉTODOS AUXILIARES DE VALIDACIÓN
   */
  isValidType(value, expectedType) {
    const actualType = typeof value;

    switch (expectedType) {
      case "string":
        return actualType === "string";
      case "number":
        return actualType === "number" && !isNaN(value);
      case "boolean":
        return actualType === "boolean";
      default:
        return false;
    }
  }

  isChromaCompatibleType(value) {
    const type = typeof value;
    return type === "string" || type === "number" || type === "boolean";
  }

  attemptTypeConversion(value, targetType) {
    try {
      switch (targetType) {
        case "string":
          return { success: true, value: String(value) };
        case "number":
          // Manejar casos especiales para SalvaCell
          if (typeof value === "string") {
            // Remover $ y comas de precios
            const cleaned = value.replace(/[$,]/g, "");
            const num = Number(cleaned);
            if (!isNaN(num)) {
              return { success: true, value: num };
            }
          }
          const num = Number(value);
          if (!isNaN(num)) {
            return { success: true, value: num };
          }
          break;
        case "boolean":
          if (typeof value === "string") {
            const lower = value.toLowerCase();
            if (["true", "yes", "sí", "1"].includes(lower)) {
              return { success: true, value: true };
            }
            if (["false", "no", "0"].includes(lower)) {
              return { success: true, value: false };
            }
          }
          break;
      }
    } catch (error) {
      // Conversion failed
    }

    return { success: false };
  }

  mapToValidEnum(value, validOptions) {
    if (!value || typeof value !== "string") return null;

    const lowerValue = value.toLowerCase();

    // Mapeo específico para intenciones SalvaCell
    const intentMappings = {
      precio: "price_inquiry",
      price: "price_inquiry",
      cuanto: "price_inquiry",
      ubicacion: "location_request",
      location: "location_request",
      donde: "location_request",
      disponible: "availability_check",
      availability: "availability_check",
      garantia: "warranty_claim",
      warranty: "warranty_claim",
      general: "general_inquiry",
    };

    // Mapeo específico para marcas
    const brandMappings = {
      apple: "iphone",
      galaxy: "samsung",
      moto: "motorola",
      redmi: "xiaomi",
      mi: "xiaomi",
    };

    const mappings = { ...intentMappings, ...brandMappings };

    // Buscar mapeo directo
    if (mappings[lowerValue]) {
      return mappings[lowerValue];
    }

    // Buscar coincidencia parcial
    for (const option of validOptions) {
      if (
        lowerValue.includes(option.toLowerCase()) ||
        option.toLowerCase().includes(lowerValue)
      ) {
        return option;
      }
    }

    return null;
  }

  /**
   * MÉTODOS AUXILIARES DE NORMALIZACIÓN
   */
  normalizeFieldName(fieldName) {
    // Mapear nombres de campos antiguos a nuevos
    const fieldMappings = {
      clientId: "client_id",
      mainIntent: "main_intent",
      deviceMentioned: "device_mentioned",
      serviceMentioned: "service_mentioned",
      priceQuoted: "price_quoted",
      userName: "user_name",
      messageLength: "message_length",
      responseType: "response_type",
      chunkingMethod: "chunking_method",
    };

    return fieldMappings[fieldName] || fieldName;
  }

  normalizeClientId(clientId) {
    if (!clientId) return "";

    // Normalizar número de teléfono
    const cleaned = String(clientId).replace(/[^\d]/g, "");

    // Aplicar formato estándar mexicano
    if (cleaned.length === 10) {
      return `52${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith("52")) {
      return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith("152")) {
      return cleaned.substring(1);
    }

    return cleaned || String(clientId);
  }

  normalizeTimestamp(timestamp) {
    if (typeof timestamp === "number") {
      return timestamp;
    }

    if (typeof timestamp === "string") {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) {
        return parsed.getTime();
      }
    }

    return Date.now();
  }

  normalizeIntent(intent) {
    if (!intent) return "general_inquiry";

    const mapped = this.mapToValidEnum(intent, [
      "price_inquiry",
      "location_request",
      "availability_check",
      "warranty_claim",
      "general_inquiry",
    ]);

    return mapped || "general_inquiry";
  }

  cleanFieldValue(value, fieldName) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    // Limpiar strings
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "" || trimmed === "undefined" || trimmed === "null") {
        return null;
      }
      return trimmed;
    }

    return value;
  }

  /**
   * MÉTODOS AUXILIARES DE ENRIQUECIMIENTO
   */
  calculateConfidenceScore(metadata, context) {
    let score = 0.5; // Base score

    // Aumentar por información específica
    if (metadata.price_quoted) score += 0.2;
    if (metadata.device_mentioned) score += 0.15;
    if (metadata.service_mentioned) score += 0.15;
    if (context.userMessage && context.userMessage.length > 20) score += 0.1;

    return Math.min(1.0, score);
  }

  mapServiceType(serviceMentioned) {
    if (!serviceMentioned) return null;

    const lower = serviceMentioned.toLowerCase();

    if (lower.includes("pantalla") || lower.includes("display"))
      return "pantalla";
    if (lower.includes("batería") || lower.includes("battery"))
      return "batería";
    if (lower.includes("cámara") || lower.includes("camera")) return "cámara";
    if (lower.includes("puerto") || lower.includes("carga")) return "puerto";

    return "general";
  }

  extractDeviceBrand(deviceMentioned) {
    if (!deviceMentioned) return "other";

    const lower = deviceMentioned.toLowerCase();

    if (lower.includes("iphone") || lower.includes("apple")) return "iphone";
    if (lower.includes("samsung") || lower.includes("galaxy")) return "samsung";
    if (lower.includes("motorola") || lower.includes("moto")) return "motorola";
    if (
      lower.includes("xiaomi") ||
      lower.includes("redmi") ||
      lower.includes("mi ")
    )
      return "xiaomi";
    if (lower.includes("huawei")) return "huawei";
    if (lower.includes("lg")) return "lg";

    return "other";
  }

  /**
   * CREAR METADATOS DE FALLBACK
   * Fallback seguro cuando la validación falla
   */
  createFallbackMetadata(rawMetadata, context) {
    return {
      client_id: this.normalizeClientId(
        rawMetadata.client_id || rawMetadata.clientId || "unknown",
      ),
      timestamp: Date.now(),
      main_intent: "general_inquiry",
      has_price_info: false,
      confidence_score: 0.3,
      chunking_method: "fallback_safe",
      validation_status: "fallback_applied",
    };
  }

  /**
   * OBTENER ESTADÍSTICAS
   */
  getEnhancementStats() {
    const totalProcessed =
      this.metrics.successfulValidations + this.metrics.failedValidations;

    return {
      totalValidations: this.metrics.totalValidations,
      successRate:
        totalProcessed > 0
          ? this.metrics.successfulValidations / totalProcessed
          : 0,
      enrichmentsApplied: this.metrics.enrichmentsApplied,
      markdownIntegrations: this.metrics.markdownIntegrations,
      config: this.config,
      status: "active",
    };
  }

  /**
   * RESETEAR MÉTRICAS
   */
  resetMetrics() {
    this.metrics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      enrichmentsApplied: 0,
      markdownIntegrations: 0,
    };

    logger.info("📊 MetadataEnhancer metrics reset");
  }
}

module.exports = {
  MetadataEnhancer,
};
