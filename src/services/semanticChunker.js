#!/usr/bin/env node

// src/services/semanticChunker.js
// CHUNKING SEMÁNTICO CON OVERLAP - SOLUCIÓN CRÍTICA 2
// Implementa ventana deslizante para mejorar coherencia conversacional

const logger = require("../utils/logger");
const { embeddingEngine } = require("./embeddingEngine");

/**
 * SEMANTIC CHUNKER CON OVERLAP INTELIGENTE
 * Basado en Plan Estratégico Solución Crítica 2
 *
 * Funcionalidades:
 * - Ventana deslizante con overlap configurable
 * - Contexto conversacional preservado
 * - Metadata enriquecida con flujo de conversación
 * - Patrones específicos para SalvaCell
 */
class SemanticChunker {
  constructor(options = {}) {
    // Configuración por defecto basada en análisis de SalvaCell
    this.config = {
      // Ventana base para conversaciones generales
      defaultWindowSize: 3,
      defaultOverlapSize: 1,
      maxChunkLength: 1000,

      // Patrones específicos de SalvaCell
      patterns: {
        PRICE_INQUIRY_FLOW: {
          pattern: ["device_inquiry", "price_request", "availability_check"],
          windowSize: 3,
          overlapSize: 2,
        },
        WARRANTY_CLAIM_FLOW: {
          pattern: ["repair_history", "issue_description", "warranty_request"],
          windowSize: 4,
          overlapSize: 2,
        },
        MULTI_DEVICE_FAMILY: {
          pattern: ["device_1", "device_2", "comparison_request"],
          windowSize: 5,
          overlapSize: 3,
        },
        TIMING_CONSULTATION: {
          pattern: ["service_inquiry", "timing_request", "decision_pending"],
          windowSize: 3,
          overlapSize: 2,
        },
      },

      // Integración con información Markdown
      useMarkdownContext: true,
      markdownKeywords: [
        "establecimiento",
        "domicilio",
        "4 PM",
        "garantía",
        "original",
        "genérica",
      ],

      ...options,
    };

    // Buffer circular para mantener conversaciones recientes
    this.conversationBuffer = new Map(); // clientId -> Array<ConversationEntry>
    this.patternAnalyzer = new ConversationPatternAnalyzer();

    logger.info("🔄 SemanticChunker inicializado con configuración:", {
      windowSize: this.config.defaultWindowSize,
      overlapSize: this.config.defaultOverlapSize,
      patterns: Object.keys(this.config.patterns).length,
    });
  }

  /**
   * MÉTODO PRINCIPAL: Crear chunks semánticos con overlap
   *
   * @param {string} clientId - ID del cliente
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} botResponse - Respuesta del bot
   * @param {string} intent - Intención detectada
   * @param {Object} extractedData - Datos extraídos
   * @returns {Promise<Array>} Array de chunks con contexto y overlap
   */
  async createSemanticChunks(
    clientId,
    userMessage,
    botResponse,
    intent,
    extractedData = {},
  ) {
    try {
      // 1. Crear entrada de conversación actual
      const conversationEntry = this.createConversationEntry(
        clientId,
        userMessage,
        botResponse,
        intent,
        extractedData,
      );

      // 2. Actualizar buffer circular
      this.updateConversationBuffer(clientId, conversationEntry);

      // 3. Detectar patrón conversacional
      const detectedPattern = this.patternAnalyzer.detectPattern(
        this.getClientConversations(clientId),
      );

      // 4. Configurar ventana según patrón
      const windowConfig = this.getWindowConfig(detectedPattern);

      // 5. Crear chunks con ventana deslizante
      const chunks = await this.createSlidingWindowChunks(
        clientId,
        conversationEntry,
        windowConfig,
      );

      logger.info(`🔄 Chunks semánticos creados para ${clientId}:`, {
        pattern: detectedPattern,
        chunks: chunks.length,
        windowSize: windowConfig.windowSize,
        overlapSize: windowConfig.overlapSize,
      });

      return chunks;
    } catch (error) {
      logger.error("Error creando chunks semánticos:", error);
      // Fallback a chunk simple
      return [
        await this.createFallbackChunk(
          clientId,
          userMessage,
          botResponse,
          intent,
          extractedData,
        ),
      ];
    }
  }

  /**
   * CREAR CHUNKS CON VENTANA DESLIZANTE
   * Implementa overlap semántico según documentación LangChain
   *
   * @param {string} clientId - ID del cliente
   * @param {Object} currentEntry - Entrada actual
   * @param {Object} windowConfig - Configuración de ventana
   * @returns {Promise<Array>} Chunks con overlap
   */
  async createSlidingWindowChunks(clientId, currentEntry, windowConfig) {
    const chunks = [];
    const conversations = this.getClientConversations(clientId);
    const { windowSize, overlapSize } = windowConfig;

    // Si no hay suficiente historial, crear chunk simple
    if (conversations.length < windowSize) {
      const chunk = await this.createContextualChunk(
        conversations,
        conversations.length - 1,
        currentEntry,
        "simple",
      );
      chunks.push(chunk);
      return chunks;
    }

    // Crear ventana deslizante con overlap
    for (let i = 0; i < conversations.length; i++) {
      const windowStart = Math.max(0, i - Math.floor(windowSize / 2));
      const windowEnd = Math.min(
        conversations.length,
        windowStart + windowSize,
      );
      const contextWindow = conversations.slice(windowStart, windowEnd);

      // Determinar índice focal dentro de la ventana
      const focusIndex = i - windowStart;

      // Crear chunk contextual con overlap
      const chunk = await this.createContextualChunk(
        contextWindow,
        focusIndex,
        currentEntry,
        "windowed",
      );

      chunks.push(chunk);

      // Implementar overlap: si no es el último chunk, avanzar solo por (windowSize - overlapSize)
      if (i < conversations.length - 1) {
        i += Math.max(1, windowSize - overlapSize) - 1; // -1 porque el for loop incrementa
      }
    }

    return chunks;
  }

  /**
   * CREAR CHUNK CONTEXTUAL CON OVERLAP
   * Estructura: [CONTEXTO PREVIO] + [CONVERSACIÓN PRINCIPAL] + [CONTEXTO POSTERIOR]
   *
   * @param {Array} contextWindow - Ventana de conversaciones
   * @param {number} focusIndex - Índice de la conversación principal
   * @param {Object} currentEntry - Entrada actual
   * @param {string} type - Tipo de chunk ('simple' o 'windowed')
   * @returns {Promise<Object>} Chunk con contexto y metadata
   */
  async createContextualChunk(
    contextWindow,
    focusIndex,
    currentEntry,
    type = "windowed",
  ) {
    const primaryConversation = contextWindow[focusIndex];
    const timestamp = new Date().toISOString();

    // 1. CONSTRUIR TEXTO CONTEXTUAL
    let chunkText = "";

    // [CONTEXTO PREVIO] - Overlap anterior
    if (focusIndex > 0 && type === "windowed") {
      chunkText += "[CONTEXTO PREVIO]\n";
      for (let i = 0; i < focusIndex; i++) {
        const conv = contextWindow[i];
        chunkText += `Usuario: "${conv.userMessage}" -> Sofia: "${conv.botResponse}"\n`;
      }
      chunkText += "\n";
    }

    // [CONVERSACIÓN PRINCIPAL] - Foco actual
    chunkText += "[CONVERSACIÓN PRINCIPAL]\n";
    chunkText += `[Cliente ${primaryConversation.clientId}] `;
    chunkText += `Usuario: "${primaryConversation.userMessage}" -> `;
    chunkText += `Sofia: "${primaryConversation.botResponse}"\n`;

    // [CONTEXTO POSTERIOR] - Overlap posterior
    if (focusIndex < contextWindow.length - 1 && type === "windowed") {
      chunkText += "\n[CONTEXTO POSTERIOR]\n";
      for (let i = focusIndex + 1; i < contextWindow.length; i++) {
        const conv = contextWindow[i];
        chunkText += `Usuario: "${conv.userMessage}" -> Sofia: "${conv.botResponse}"\n`;
      }
    }

    // 2. INTEGRAR INFORMACIÓN MARKDOWN SI APLICA
    if (this.config.useMarkdownContext) {
      const markdownContext = this.extractMarkdownContext(primaryConversation);
      if (markdownContext) {
        chunkText += "\n[INFORMACIÓN CONTEXTUAL]\n";
        chunkText += markdownContext;
      }
    }

    // 3. CREAR METADATA ENRIQUECIDA
    const metadata = this.buildEnhancedMetadata(
      primaryConversation,
      contextWindow,
      currentEntry,
      type,
    );

    // 4. VALIDAR LONGITUD
    if (chunkText.length > this.config.maxChunkLength) {
      chunkText = this.truncateChunk(chunkText, this.config.maxChunkLength);
      metadata.truncated = true;
    }

    return {
      id: `semantic_${primaryConversation.clientId}_${Date.now()}_${focusIndex}`,
      text: chunkText,
      metadata: metadata,
      type: type,
      timestamp: timestamp,
    };
  }

  /**
   * EXTRAER CONTEXTO MARKDOWN RELEVANTE
   * Integra información de archivos Markdown de precios según contexto
   *
   * @param {Object} conversation - Conversación principal
   * @returns {string|null} Contexto Markdown relevante
   */
  extractMarkdownContext(conversation) {
    const { userMessage, botResponse, intent, extractedData } = conversation;
    let context = "";

    // Detectar si se mencionan temas relacionados con tiempos
    if (
      this.containsAny(userMessage + " " + botResponse, [
        "tiempo",
        "cuánto",
        "demora",
        "domicilio",
        "establecimiento",
      ])
    ) {
      context +=
        "• Tiempo establecimiento: Mismo día (antes 4PM) / Siguiente día (después 4PM)\n";
      context += "• Tiempo domicilio: 45-60 minutos una vez iniciado\n";
    }

    // Detectar si se mencionan temas relacionados con garantías
    if (
      this.containsAny(userMessage + " " + botResponse, [
        "garantía",
        "original",
        "genérica",
        "calidad",
      ])
    ) {
      context += "• Garantía original: 30 días\n";
      context += "• Garantía genérica: 15 días\n";
    }

    // Detectar si se mencionan precios específicos
    if (
      extractedData.device &&
      (intent === "consulta_precio" || botResponse.includes("$"))
    ) {
      context += `• Información de precios disponible para ${extractedData.device}\n`;
    }

    return context.trim() || null;
  }

  /**
   * CONSTRUIR METADATA ENRIQUECIDA
   * Incluye análisis de flujo conversacional y contexto semántico
   *
   * @param {Object} primaryConversation - Conversación principal
   * @param {Array} contextWindow - Ventana de contexto
   * @param {Object} currentEntry - Entrada actual
   * @param {string} type - Tipo de chunk
   * @returns {Object} Metadata enriquecida
   */
  buildEnhancedMetadata(
    primaryConversation,
    contextWindow,
    currentEntry,
    type,
  ) {
    const conversationFlow = this.analyzeConversationFlow(contextWindow);
    const semanticDensity = this.calculateSemanticDensity(contextWindow);

    return {
      // Metadata original
      client_id: primaryConversation.clientId,
      main_intent: primaryConversation.intent,
      device_mentioned: primaryConversation.extractedData.device || "",
      service_mentioned: primaryConversation.extractedData.service || "",
      price_quoted: primaryConversation.extractedData.price || "",

      // Metadata de contexto semántico
      context_window_size: contextWindow.length,
      conversation_flow: conversationFlow,
      semantic_density: semanticDensity,
      chunk_type: type,
      focus_index: contextWindow.indexOf(primaryConversation),

      // Metadata de patrones conversacionales
      detected_pattern: this.patternAnalyzer.detectPattern(contextWindow),
      flow_stage: this.determineFlowStage(contextWindow, primaryConversation),
      continuity_score: this.calculateContinuityScore(contextWindow),

      // Metadata temporal
      timestamp: primaryConversation.timestamp,
      hour_of_day: this.getHourCategory(
        new Date(primaryConversation.timestamp),
      ),

      // Metadata de contenido
      has_markdown_context: this.config.useMarkdownContext,
      markdown_keywords: this.extractMarkdownKeywords(primaryConversation),

      // Metadata de calidad
      chunk_length: 0, // Se actualizará después
      has_price_info: primaryConversation.extractedData.price ? "yes" : "no",
      has_device_info: primaryConversation.extractedData.device ? "yes" : "no",
      response_type: this.classifyResponseType(primaryConversation.botResponse),
    };
  }

  /**
   * ANALIZAR FLUJO CONVERSACIONAL
   * Identifica patrones y progresión de la conversación
   *
   * @param {Array} contextWindow - Ventana de conversaciones
   * @returns {string} Tipo de flujo identificado
   */
  analyzeConversationFlow(contextWindow) {
    const intents = contextWindow.map((conv) => conv.intent);
    const devices = contextWindow
      .map((conv) => conv.extractedData.device)
      .filter(Boolean);
    const prices = contextWindow
      .map((conv) => conv.extractedData.price)
      .filter(Boolean);

    // Detectar patrones específicos de SalvaCell
    if (
      intents.includes("consulta_precio") &&
      intents.includes("consulta_disponibilidad")
    ) {
      return "price_to_availability";
    }

    if (devices.length > 1) {
      return "multi_device_comparison";
    }

    if (intents.includes("saludo") && intents.includes("consulta_precio")) {
      return "greeting_to_inquiry";
    }

    if (prices.length > 0 && intents.includes("agradecimiento")) {
      return "inquiry_to_closing";
    }

    return "general_conversation";
  }

  /**
   * CALCULAR DENSIDAD SEMÁNTICA
   * Mide la riqueza de información en la ventana de contexto
   *
   * @param {Array} contextWindow - Ventana de conversaciones
   * @returns {number} Puntuación de densidad semántica (0-1)
   */
  calculateSemanticDensity(contextWindow) {
    let score = 0;
    let factors = 0;

    // Factor 1: Diversidad de intenciones
    const uniqueIntents = new Set(contextWindow.map((conv) => conv.intent));
    score += uniqueIntents.size / Math.max(contextWindow.length, 1);
    factors++;

    // Factor 2: Información extraída
    const extractedInfo = contextWindow.reduce(
      (acc, conv) => {
        if (conv.extractedData.device)
          acc.devices.add(conv.extractedData.device);
        if (conv.extractedData.service)
          acc.services.add(conv.extractedData.service);
        if (conv.extractedData.price) acc.prices.add(conv.extractedData.price);
        return acc;
      },
      { devices: new Set(), services: new Set(), prices: new Set() },
    );

    const infoRichness =
      (extractedInfo.devices.size +
        extractedInfo.services.size +
        extractedInfo.prices.size) /
      (contextWindow.length * 3);
    score += infoRichness;
    factors++;

    // Factor 3: Longitud promedio de mensajes
    const avgLength =
      contextWindow.reduce((sum, conv) => sum + conv.userMessage.length, 0) /
      contextWindow.length;
    score += Math.min(avgLength / 100, 1); // Normalizar a 100 caracteres
    factors++;

    return score / factors;
  }

  /**
   * DETERMINAR ETAPA DEL FLUJO
   * Identifica en qué etapa se encuentra la conversación
   *
   * @param {Array} contextWindow - Ventana de conversaciones
   * @param {Object} primaryConversation - Conversación principal
   * @returns {string} Etapa del flujo
   */
  determineFlowStage(contextWindow, primaryConversation) {
    const position = contextWindow.indexOf(primaryConversation);
    const totalLength = contextWindow.length;

    if (position === 0) return "opening";
    if (position === totalLength - 1) return "current";
    if (position / totalLength < 0.3) return "early";
    if (position / totalLength > 0.7) return "late";
    return "middle";
  }

  /**
   * CALCULAR PUNTUACIÓN DE CONTINUIDAD
   * Mide qué tan bien conectadas están las conversaciones
   *
   * @param {Array} contextWindow - Ventana de conversaciones
   * @returns {number} Puntuación de continuidad (0-1)
   */
  calculateContinuityScore(contextWindow) {
    if (contextWindow.length < 2) return 1.0;

    let continuityScore = 0;
    let connections = 0;

    for (let i = 1; i < contextWindow.length; i++) {
      const prev = contextWindow[i - 1];
      const curr = contextWindow[i];

      // Verificar continuidad temática
      if (
        prev.extractedData.device === curr.extractedData.device &&
        prev.extractedData.device
      ) {
        continuityScore += 0.3;
      }

      // Verificar continuidad de servicio
      if (
        prev.extractedData.service === curr.extractedData.service &&
        prev.extractedData.service
      ) {
        continuityScore += 0.2;
      }

      // Verificar continuidad de intención
      if (this.areRelatedIntents(prev.intent, curr.intent)) {
        continuityScore += 0.3;
      }

      // Verificar continuidad temporal (menos de 30 minutos)
      const timeDiff = Math.abs(
        new Date(curr.timestamp) - new Date(prev.timestamp),
      );
      if (timeDiff < 30 * 60 * 1000) {
        // 30 minutos
        continuityScore += 0.2;
      }

      connections++;
    }

    return connections > 0 ? continuityScore / connections : 0;
  }

  /**
   * VERIFICAR INTENCIONES RELACIONADAS
   * Determina si dos intenciones están relacionadas semánticamente
   *
   * @param {string} intent1 - Primera intención
   * @param {string} intent2 - Segunda intención
   * @returns {boolean} True si están relacionadas
   */
  areRelatedIntents(intent1, intent2) {
    const relatedGroups = [
      ["saludo", "consulta_precio", "consulta_disponibilidad"],
      ["consulta_precio", "consulta_disponibilidad", "agradecimiento"],
      ["queja", "escalar_a_humano"],
      ["consulta_ubicacion", "consulta_horario"],
    ];

    return relatedGroups.some(
      (group) => group.includes(intent1) && group.includes(intent2),
    );
  }

  /**
   * EXTRAER PALABRAS CLAVE MARKDOWN
   * Identifica palabras clave relacionadas con información Markdown
   *
   * @param {Object} conversation - Conversación
   * @returns {Array} Array de palabras clave encontradas
   */
  extractMarkdownKeywords(conversation) {
    const text = conversation.userMessage + " " + conversation.botResponse;
    return this.config.markdownKeywords.filter((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  /**
   * MÉTODOS AUXILIARES
   */

  createConversationEntry(
    clientId,
    userMessage,
    botResponse,
    intent,
    extractedData,
  ) {
    return {
      clientId,
      userMessage,
      botResponse,
      intent,
      extractedData,
      timestamp: new Date().toISOString(),
    };
  }

  updateConversationBuffer(clientId, entry) {
    if (!this.conversationBuffer.has(clientId)) {
      this.conversationBuffer.set(clientId, []);
    }

    const buffer = this.conversationBuffer.get(clientId);
    buffer.push(entry);

    // Mantener solo las últimas 20 conversaciones por cliente
    if (buffer.length > 20) {
      buffer.shift();
    }

    this.conversationBuffer.set(clientId, buffer);
  }

  getClientConversations(clientId) {
    return this.conversationBuffer.get(clientId) || [];
  }

  getWindowConfig(detectedPattern) {
    const patternConfig = this.config.patterns[detectedPattern];
    if (patternConfig) {
      return {
        windowSize: patternConfig.windowSize,
        overlapSize: patternConfig.overlapSize,
      };
    }

    return {
      windowSize: this.config.defaultWindowSize,
      overlapSize: this.config.defaultOverlapSize,
    };
  }

  async createFallbackChunk(
    clientId,
    userMessage,
    botResponse,
    intent,
    extractedData,
  ) {
    return {
      id: `fallback_${clientId}_${Date.now()}`,
      text: `[Conversación con ${clientId}] Usuario: '${userMessage}' -> Sofia: '${botResponse}'`,
      metadata: {
        client_id: clientId,
        main_intent: intent,
        device_mentioned: extractedData.device || "",
        service_mentioned: extractedData.service || "",
        price_quoted: extractedData.price || "",
        chunk_type: "fallback",
        timestamp: new Date().toISOString(),
      },
      type: "fallback",
      timestamp: new Date().toISOString(),
    };
  }

  truncateChunk(text, maxLength) {
    if (text.length <= maxLength) return text;

    // Truncar preservando estructura
    const truncated = text.substring(0, maxLength - 50);
    const lastNewline = truncated.lastIndexOf("\n");

    if (lastNewline > maxLength * 0.8) {
      return truncated.substring(0, lastNewline) + "\n[...TRUNCADO...]";
    }

    return truncated + "\n[...TRUNCADO...]";
  }

  containsAny(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.some((keyword) =>
      lowerText.includes(keyword.toLowerCase()),
    );
  }

  classifyResponseType(response) {
    if (response.includes("$") || response.includes("precio"))
      return "price_quote";
    if (response.includes("minutos") || response.includes("tiempo"))
      return "time_estimate";
    if (response.includes("disponible")) return "availability";
    if (response.includes("Hola") || response.includes("soy Sofia"))
      return "greeting";
    if (response.includes("gracias") || response.includes("Perfecto"))
      return "closing";
    return "information";
  }

  getHourCategory(date) {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return "mañana";
    if (hour >= 12 && hour < 18) return "tarde";
    return "noche";
  }

  /**
   * OBTENER ESTADÍSTICAS DEL CHUNKER
   *
   * @returns {Object} Estadísticas de uso
   */
  getChunkerStats() {
    const totalClients = this.conversationBuffer.size;
    const totalConversations = Array.from(
      this.conversationBuffer.values(),
    ).reduce((sum, buffer) => sum + buffer.length, 0);

    return {
      total_clients: totalClients,
      total_conversations: totalConversations,
      average_conversations_per_client:
        totalClients > 0 ? totalConversations / totalClients : 0,
      patterns_configured: Object.keys(this.config.patterns).length,
      markdown_integration: this.config.useMarkdownContext,
    };
  }
}

/**
 * ANALIZADOR DE PATRONES CONVERSACIONALES
 * Detecta automáticamente patrones en las conversaciones
 */
class ConversationPatternAnalyzer {
  constructor() {
    this.patterns = {
      PRICE_INQUIRY_FLOW: [
        "saludo",
        "consulta_precio",
        "consulta_disponibilidad",
      ],
      WARRANTY_CLAIM_FLOW: ["queja", "escalar_a_humano"],
      MULTI_DEVICE_FAMILY: [
        "consulta_precio",
        "consulta_precio",
        "consulta_precio",
      ],
      TIMING_CONSULTATION: ["consulta_precio", "consulta_horario"],
    };
  }

  detectPattern(conversations) {
    if (conversations.length < 2) return "SIMPLE_CONVERSATION";

    const recentIntents = conversations.slice(-4).map((conv) => conv.intent);

    // Verificar patrones específicos
    for (const [patternName, patternIntents] of Object.entries(this.patterns)) {
      if (this.matchesPattern(recentIntents, patternIntents)) {
        return patternName;
      }
    }

    // Detectar patrones dinámicos
    const uniqueDevices = new Set(
      conversations.map((conv) => conv.extractedData.device).filter(Boolean),
    );
    if (uniqueDevices.size > 1) {
      return "MULTI_DEVICE_FAMILY";
    }

    const hasPriceQuotes = conversations.some(
      (conv) => conv.extractedData.price,
    );
    const hasTimeQuestions = conversations.some(
      (conv) =>
        conv.userMessage.toLowerCase().includes("tiempo") ||
        conv.userMessage.toLowerCase().includes("cuánto"),
    );

    if (hasPriceQuotes && hasTimeQuestions) {
      return "TIMING_CONSULTATION";
    }

    return "GENERAL_CONVERSATION";
  }

  matchesPattern(intents, patternIntents) {
    if (intents.length < patternIntents.length) return false;

    for (let i = 0; i <= intents.length - patternIntents.length; i++) {
      let matches = true;
      for (let j = 0; j < patternIntents.length; j++) {
        if (intents[i + j] !== patternIntents[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }

    return false;
  }
}

module.exports = {
  SemanticChunker,
  ConversationPatternAnalyzer,
};
