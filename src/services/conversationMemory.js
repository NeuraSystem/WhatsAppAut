// src/services/conversationMemory.js
// SISTEMA DE MEMORIA CONVERSACIONAL HÍBRIDA
// Implementa "La Memoria" según estrategia del curso RAG

const { ChromaClient } = require("chromadb");
const { pool } = require("../database/pg");
const { embeddingEngine, getEmbedding } = require("./embeddingEngine");
const { SemanticChunker } = require("./semanticChunker");
const { DeterministicSearchEngine } = require("./deterministicSearchEngine");
const { DynamicLimitOptimizer } = require("./dynamicLimitOptimizer");
const { MarkdownContextEnricher } = require("./markdownContextEnricher");
const { SimpleDeduplicationEngine } = require("./simpleDeduplicationEngine");
const { MetadataEnhancer } = require("./metadataEnhancer");
const { ClientHistorySearchEngine } = require("./clientHistorySearchEngine");
const logger = require("../utils/logger");

// Performance Monitor
const performanceMonitor = {
  startTimer: (operation, context = {}) => {
    const start = performance.now();
    return {
      operation,
      context,
      start,
      end: () => {
        const duration = performance.now() - start;
        logger.debug(
          `⏱️ ConversationMemory: ${operation} took ${duration.toFixed(2)}ms`,
          context,
        );
        return duration;
      },
    };
  },
};

// Parse CHROMA_URL to extract host, port and protocol
const { URL } = require("url");
const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const url = new URL(CHROMA_URL);
const CONVERSATIONS_COLLECTION_NAME = "memoria_conversacional";

// Initialize ChromaDB client with the new format
const chromaClient = new ChromaClient({
  host: url.hostname,
  port: url.port || (url.protocol === "https:" ? 443 : 80),
  ssl: url.protocol === "https:",
});

/**
 * ENHANCED Adapter class para convertir LangChain embeddings a formato ChromaDB
 * Ahora soporta prefijos de tarea específicos para mejorar calidad de embeddings
 */
class EnhancedLangChainEmbeddingAdapter {
  constructor(enhancedEmbeddingEngine, defaultTaskType = "document") {
    this.enhancedEngine = enhancedEmbeddingEngine;
    this.defaultTaskType = defaultTaskType; // 'document', 'query', 'classification'

    logger.info(
      `Enhanced Adapter inicializado - Tipo de tarea por defecto: ${defaultTaskType}`,
    );
  }

  async generate(texts) {
    try {
      if (Array.isArray(texts)) {
        // Para arrays, asumimos que son documentos a almacenar
        return await this.enhancedEngine.embedDocuments(texts);
      } else {
        // Para texto único, usar el tipo de tarea especificado
        let embedding;
        switch (this.defaultTaskType) {
          case "query":
            embedding = await this.enhancedEngine.embedQuery(texts);
            break;
          case "classification":
            embedding = await this.enhancedEngine.embedClassification(texts);
            break;
          case "document":
          default:
            embedding = await this.enhancedEngine.embedDocument(texts);
            break;
        }
        return [embedding];
      }
    } catch (error) {
      logger.error(
        "Error en EnhancedLangChainEmbeddingAdapter (ConversationMemory):",
        error,
      );
      throw error;
    }
  }

  /**
   * Método específico para generar embeddings de consulta
   */
  async generateQuery(text) {
    try {
      const embedding = await this.enhancedEngine.embedQuery(text);
      return [embedding];
    } catch (error) {
      logger.error("Error generando embedding de consulta:", error);
      throw error;
    }
  }

  /**
   * Método específico para generar embeddings de documento
   */
  async generateDocument(texts) {
    try {
      if (Array.isArray(texts)) {
        return await this.enhancedEngine.embedDocuments(texts);
      } else {
        const embedding = await this.enhancedEngine.embedDocument(texts);
        return [embedding];
      }
    } catch (error) {
      logger.error("Error generando embedding de documento:", error);
      throw error;
    }
  }
}

// Crear el enhanced adapter para ChromaDB con prefijos de tarea
const embeddingAdapter = new EnhancedLangChainEmbeddingAdapter(
  embeddingEngine,
  "document",
);
const queryAdapter = new EnhancedLangChainEmbeddingAdapter(
  embeddingEngine,
  "query",
);

/**
 * SISTEMA DE MEMORIA CONVERSACIONAL HÍBRIDA
 * Maneja la vectorización estratégica de conversaciones con metadatos ricos
 */
class ConversationMemory {
  constructor() {
    this.collection = null;
    this.semanticChunker = new SemanticChunker({
      useMarkdownContext: true,
      defaultWindowSize: 3,
      defaultOverlapSize: 1,
    });

    // Inicializar motor de búsqueda determinística
    this.deterministicSearch = new DeterministicSearchEngine({
      salvaCellIntegration: true,
    });

    // Inicializar optimizador de límites dinámicos
    this.limitOptimizer = new DynamicLimitOptimizer({
      salvaCellIntegration: true,
    });

    // Inicializar enriquecedor de contexto Markdown
    this.markdownEnricher = new MarkdownContextEnricher({
      autoRefresh: true,
    });

    // Inicializar motor de deduplicación simple
    this.deduplicationEngine = new SimpleDeduplicationEngine({
      threshold: 0.95, // Conservador
      markdownIntegration: true,
    });

    // Inicializar enhancer de metadatos
    this.metadataEnhancer = new MetadataEnhancer({
      markdownIntegration: true,
      autoEnrichment: true,
      safeFallback: true,
    });

    // Inicializar motor de búsqueda de historial de cliente
    this.clientHistorySearch = new ClientHistorySearchEngine(
      {
        enableAlternativeSearch: true,
        enableProfileAnalysis: true,
        enableSearchCache: true,
      },
      this,
    ); // <-- Se inyecta 'this' para romper la dependencia circular

    logger.info(
      "💾 ConversationMemory inicializado con SemanticChunker + DeterministicSearchEngine + DynamicLimits + MarkdownEnricher + SimpleDeduplication + MetadataEnhancer + ClientHistorySearch",
    );
  }

  /**
   * Inicializa la colección de memoria conversacional
   */
  async initialize() {
    try {
      if (!embeddingEngine) {
        throw new Error("Motor de embeddings no está disponible");
      }

      this.collection = await chromaClient.getOrCreateCollection({
        name: CONVERSATIONS_COLLECTION_NAME,
        embeddingFunction: embeddingAdapter,
      });

      logger.info(
        `Sistema de memoria conversacional inicializado: ${CONVERSATIONS_COLLECTION_NAME}`,
      );
      return true;
    } catch (error) {
      logger.error("Error inicializando memoria conversacional:", error);
      return false;
    }
  }

  /**
   * CHUNKING SEMÁNTICO MEJORADO: Usa SemanticChunker con overlap inteligente
   * Nueva implementación basada en Plan Estratégico Solución Crítica 2
   *
   * @param {string} clientId - ID del cliente (número de teléfono)
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} botResponse - Respuesta del bot
   * @param {string} intent - Intención detectada
   * @param {Object} extractedData - Datos extraídos (dispositivo, precio, etc.)
   * @returns {Promise<boolean>} True si se almacenó correctamente
   */
  async storeConversationChunk(
    clientId,
    userMessage,
    botResponse,
    intent,
    extractedData = {},
  ) {
    const timer = performanceMonitor.startTimer("storeConversationChunk", {
      clientId,
      intent,
    });

    try {
      await this.ensureInitialized();

      // 1. CREAR CHUNKS SEMÁNTICOS CON OVERLAP
      const semanticChunks = await this.semanticChunker.createSemanticChunks(
        clientId,
        userMessage,
        botResponse,
        intent,
        extractedData,
      );

      // 2. VERIFICAR DEDUPLICACIÓN Y ALMACENAR CADA CHUNK EN CHROMADB
      const storedChunks = [];
      const deduplicationStats = {
        processed: 0,
        duplicatesSkipped: 0,
        variantsStored: 0,
        newStored: 0,
      };

      for (const chunk of semanticChunks) {
        try {
          deduplicationStats.processed++;

          // ENHANCED: VALIDAR Y ENRIQUECER METADATOS
          const enhancedMetadata = await this.metadataEnhancer.enhanceMetadata(
            chunk.metadata,
            {
              userMessage,
              botResponse,
              device: extractedData.device,
              service: extractedData.service,
            },
          );

          // Actualizar chunk con metadatos enriquecidos
          chunk.metadata = enhancedMetadata;
          chunk.metadata.chunk_length = chunk.text.length;

          // 2a. VERIFICAR DUPLICACIÓN CON CHUNKS EXISTENTES RECIENTES
          const recentChunks = await this.getRecentChunksForDeduplication(
            clientId,
            50,
          );
          const deduplicationResult =
            await this.deduplicationEngine.checkForDuplicates(
              chunk,
              recentChunks,
            );

          // 2b. APLICAR DECISIÓN DE DEDUPLICACIÓN
          switch (deduplicationResult.action) {
            case "skip":
              logger.debug(
                `🔄 Chunk duplicado omitido: ${
                  chunk.id
                } (similitud: ${deduplicationResult.similarity?.toFixed(3)})`,
              );
              deduplicationStats.duplicatesSkipped++;
              continue; // No almacenar

            case "store_variant":
              // Marcar como variante en metadata
              chunk.metadata.is_variant = true;
              chunk.metadata.original_chunk_id =
                deduplicationResult.duplicateId;
              chunk.metadata.similarity_score = deduplicationResult.similarity;
              deduplicationStats.variantsStored++;
              break;

            case "store_new":
            default:
              // Almacenar como información nueva
              chunk.metadata.is_unique = true;
              deduplicationStats.newStored++;
              break;
          }

          // 2c. ALMACENAR EN CHROMADB
          await this.collection.add({
            ids: [chunk.id],
            documents: [chunk.text],
            metadatas: [chunk.metadata],
          });

          storedChunks.push(chunk.id);
        } catch (chunkError) {
          logger.error(`Error almacenando chunk ${chunk.id}:`, chunkError);
        }
      }

      // 3. FALLBACK: Si falla el semantic chunking, usar método tradicional
      if (storedChunks.length === 0) {
        logger.warn("Fallback a chunking tradicional");
        return await this.storeTraditionalChunk(
          clientId,
          userMessage,
          botResponse,
          intent,
          extractedData,
        );
      }

      // 4. OPCIONAL: Almacenar también en PostgreSQL para backup/analytics
      await this.storeInPostgreSQL(clientId, userMessage, botResponse, intent, {
        semantic_chunks: storedChunks.length,
        chunking_method: "semantic_overlap",
      });

      logger.info(
        `💾 Chunks semánticos procesados: ${clientId} -> ${intent} (${storedChunks.length} almacenados, ${deduplicationStats.duplicatesSkipped} duplicados omitidos, ${deduplicationStats.variantsStored} variantes)`,
      );
      timer.end();
      return true;
    } catch (error) {
      logger.error("Error en chunking semántico:", error);
      timer.end();
      // Fallback completo a método tradicional
      return await this.storeTraditionalChunk(
        clientId,
        userMessage,
        botResponse,
        intent,
        extractedData,
      );
    }
  }

  /**
   * BÚSQUEDA AVANZADA DE MEMORIA CONVERSACIONAL
   * Integra límites dinámicos + determinismo + enriquecimiento Markdown
   *
   * @param {string} query - Consulta para buscar en el historial
   * @param {string} clientId - ID del cliente (opcional, para filtrar)
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Array>} Recuerdos relevantes optimizados
   */
  async searchConversationMemory(query, clientId = null, filters = {}) {
    const timer = performanceMonitor.startTimer("searchConversationMemory", {
      query,
      clientId,
      hasFilters: Object.keys(filters).length > 0,
    });

    try {
      await this.ensureInitialized();

      // 1. OPTIMIZAR LÍMITES DINÁMICAMENTE
      const limitOptimization = this.limitOptimizer.optimizeLimits(
        query,
        "CONVERSATION_MEMORY",
        { ...filters, client_id: clientId },
      );

      logger.debug(
        `🎯 Límites optimizados: base=${limitOptimization.baseLimit}, max=${limitOptimization.maxLimit}, contexto=${limitOptimization.context}`,
      );

      // 2. CONSTRUIR FILTROS DE METADATA
      const whereFilter = this.buildWhereFilter(clientId, filters);

      // 3. BÚSQUEDA DETERMINÍSTICA CON LÍMITES OPTIMIZADOS
      const stabilizedResults =
        await this.deterministicSearch.performStabilizedSearch(
          this.collection,
          query,
          {
            ...filters,
            ...whereFilter,
            limit: limitOptimization.baseLimit, // Usar límite optimizado
          },
          limitOptimization.context,
        );

      if (!stabilizedResults.documents || !stabilizedResults.documents[0]) {
        logger.info(`🧠 No se encontraron recuerdos para: "${query}"`);
        return [];
      }

      // 4. ENRIQUECIMIENTO CON CONTEXTO MARKDOWN
      const enrichedResults = this.markdownEnricher.enrichSearchResults(
        stabilizedResults,
        query,
        limitOptimization.context,
      );

      // 5. FORMATEAR RESULTADOS CON TODA LA INFORMACIÓN
      const memories = [];
      for (let i = 0; i < enrichedResults.documents[0].length; i++) {
        memories.push({
          text: enrichedResults.documents[0][i],
          metadata: enrichedResults.metadatas[0][i],
          distance: enrichedResults.distances
            ? enrichedResults.distances[0][i]
            : null,
          confidence: enrichedResults.distances
            ? 1 - enrichedResults.distances[0][i]
            : null,
          stabilityScore: enrichedResults.stabilityScores
            ? enrichedResults.stabilityScores[i]
            : null,
          markdownEnrichment:
            enrichedResults.metadatas[0][i].markdown_enrichment || null,
        });
      }

      // 6. AGREGAR METADATA DE OPTIMIZACIÓN
      const optimizationMetadata = {
        limitOptimization,
        consensusQuality: enrichedResults.consensusQuality,
        globalMarkdownInfo: enrichedResults.globalMarkdownInfo,
        resultCount: memories.length,
        searchStrategy: "dynamic_deterministic_enriched",
      };

      logger.info(
        `🚀 Búsqueda avanzada completada: ${
          memories.length
        } recuerdos (límites: ${limitOptimization.baseLimit}, consenso: ${
          enrichedResults.consensusQuality?.toFixed(3) || "N/A"
        })`,
      );

      timer.end();
      return {
        memories,
        metadata: optimizationMetadata,
      };
    } catch (error) {
      logger.error("Error en búsqueda avanzada:", error);
      timer.end();
      // Fallback a búsqueda determinística simple
      return await this.searchConversationMemoryFallback(
        query,
        clientId,
        filters,
      );
    }
  }

  /**
   * BÚSQUEDA FALLBACK (MÉTODO ANTERIOR)
   * Mantiene funcionalidad si falla la búsqueda determinística
   */
  async searchConversationMemoryFallback(query, clientId = null, filters = {}) {
    try {
      await this.ensureInitialized();

      // Construir filtros de metadata
      const whereFilter = this.buildWhereFilter(clientId, filters);

      // MEJORA: Generar embedding de consulta con prefijo específico
      const queryEmbedding = await queryAdapter.generateQuery(query);

      // Realizar búsqueda semántica usando embedding de consulta optimizado
      const results = await this.collection.query({
        queryEmbeddings: queryEmbedding,
        nResults: filters.limit || 5,
        where: whereFilter,
      });

      if (!results.documents || !results.documents[0]) {
        logger.info(`🧠 No se encontraron recuerdos para: "${query}"`);
        return [];
      }

      // Formatear resultados
      const memories = [];
      for (let i = 0; i < results.documents[0].length; i++) {
        memories.push({
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
          distance: results.distances ? results.distances[0][i] : null,
          confidence: results.distances ? 1 - results.distances[0][i] : null,
        });
      }

      logger.info(
        `🧠 Fallback exitoso: ${memories.length} recuerdos para: "${query}"`,
      );
      return memories;
    } catch (fallbackError) {
      logger.error("Error en búsqueda fallback:", fallbackError);
      return [];
    }
  }

  /**
   * MEMORIA ESPECÍFICA DE CLIENTE CON OPTIMIZACIÓN AVANZADA
   * Historial del cliente con límites dinámicos, determinismo y enriquecimiento
   *
   * @param {string} clientId - ID del cliente
   * @param {number} requestedLimit - Límite solicitado de resultados
   * @returns {Promise<Array>} Historial del cliente optimizado
   */
  async getClientMemory(clientId, requestedLimit = 10) {
    try {
      await this.ensureInitialized();

      // 1. OPTIMIZAR LÍMITES PARA HISTORIAL ESPECÍFICO
      const historyQuery = `conversación historial interacciones cliente ${clientId}`;
      const limitOptimization = this.limitOptimizer.optimizeLimits(
        historyQuery,
        "CONVERSATION_MEMORY",
        { client_id: clientId, requestedLimit },
      );

      // Usar el mayor entre el límite solicitado y el optimizado
      const finalLimit = Math.max(requestedLimit, limitOptimization.baseLimit);

      logger.debug(
        `👤 Límites optimizados para cliente ${clientId}: solicitado=${requestedLimit}, optimizado=${finalLimit}`,
      );

      // 2. BÚSQUEDA DETERMINÍSTICA CON LÍMITES OPTIMIZADOS
      const stabilizedResults =
        await this.deterministicSearch.performStabilizedSearch(
          this.collection,
          historyQuery,
          {
            limit: finalLimit,
            client_id: clientId,
          },
          "CONVERSATION_MEMORY",
        );

      if (!stabilizedResults.documents || !stabilizedResults.documents[0]) {
        logger.info(`👤 No se encontró historial para cliente ${clientId}`);
        return [];
      }

      // 3. ENRIQUECIMIENTO CON CONTEXTO MARKDOWN PARA HISTORIAL
      const enrichedResults = this.markdownEnricher.enrichSearchResults(
        stabilizedResults,
        historyQuery,
        "client_history",
      );

      // 4. FORMATEAR Y ORDENAR RESULTADOS
      const memories = [];
      for (let i = 0; i < enrichedResults.documents[0].length; i++) {
        memories.push({
          text: enrichedResults.documents[0][i],
          metadata: enrichedResults.metadatas[0][i],
          stabilityScore: enrichedResults.stabilityScores
            ? enrichedResults.stabilityScores[i]
            : null,
          markdownEnrichment:
            enrichedResults.metadatas[0][i].markdown_enrichment || null,
        });
      }

      // Ordenar por timestamp (más recientes primero)
      memories.sort(
        (a, b) =>
          new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp),
      );

      // 5. LIMITAR AL NÚMERO SOLICITADO DESPUÉS DE OPTIMIZACIÓN
      const finalMemories = memories.slice(0, requestedLimit);

      logger.info(
        `👤 Historial avanzado de ${clientId}: ${finalMemories.length}/${
          memories.length
        } recuerdos (consenso: ${
          enrichedResults.consensusQuality?.toFixed(3) || "N/A"
        })`,
      );

      return {
        memories: finalMemories,
        metadata: {
          clientId,
          totalFound: memories.length,
          returned: finalMemories.length,
          limitOptimization,
          consensusQuality: enrichedResults.consensusQuality,
          searchStrategy: "client_history_optimized",
        },
      };
    } catch (error) {
      logger.error(`Error obteniendo memoria del cliente ${clientId}:`, error);
      return await this.getClientMemoryFallback(clientId, requestedLimit);
    }
  }

  /**
   * MEMORIA ESPECÍFICA DE CLIENTE FALLBACK
   * Método anterior para casos donde falla la búsqueda determinística
   */
  async getClientMemoryFallback(clientId, limit = 10) {
    try {
      await this.ensureInitialized();

      // MEJORA: Usar prefijo de consulta específico para búsqueda de historial
      const queryEmbedding = await queryAdapter.generateQuery(
        "conversación historial interacciones cliente",
      );

      const results = await this.collection.query({
        queryEmbeddings: queryEmbedding,
        nResults: limit,
        where: { client_id: clientId },
      });

      if (!results.documents || !results.documents[0]) {
        logger.info(`👤 No se encontró historial para cliente ${clientId}`);
        return [];
      }

      // Ordenar por timestamp (más recientes primero)
      const memories = [];
      for (let i = 0; i < results.documents[0].length; i++) {
        memories.push({
          text: results.documents[0][i],
          metadata: results.metadatas[0][i],
        });
      }

      // Ordenar por timestamp
      memories.sort(
        (a, b) =>
          new Date(b.metadata.timestamp) - new Date(a.metadata.timestamp),
      );

      logger.info(
        `👤 Historial fallback de ${clientId}: ${memories.length} recuerdos`,
      );
      return memories;
    } catch (fallbackError) {
      logger.error(
        `Error en búsqueda fallback para cliente ${clientId}:`,
        fallbackError,
      );
      return [];
    }
  }

  /**
   * MÉTODO TRADICIONAL DE CHUNKING (FALLBACK)
   * Mantiene compatibilidad con implementación anterior
   */
  async storeTraditionalChunk(
    clientId,
    userMessage,
    botResponse,
    intent,
    extractedData = {},
  ) {
    try {
      const timestamp = new Date().toISOString();
      const chunkText = this.createChunkText(
        clientId,
        userMessage,
        botResponse,
      );

      const rawMetadata = {
        client_id: clientId,
        timestamp: timestamp,
        main_intent: intent,
        device_mentioned: extractedData.device || "",
        service_mentioned: extractedData.service || "",
        price_quoted: extractedData.price || "",
        user_name: extractedData.userName || "",
        conversation_stage: extractedData.stage || "ongoing",
        satisfaction_level: extractedData.satisfaction || 5,
        hour_of_day: this.getHourCategory(new Date()),
        has_price_info: extractedData.price ? "yes" : "no",
        has_device_info: extractedData.device ? "yes" : "no",
        message_length: userMessage.length,
        response_type: this.classifyResponseType(botResponse),
        chunking_method: "traditional_fallback",
      };

      // ENHANCED: VALIDAR Y ENRIQUECER METADATOS TRADICIONALES
      const enhancedMetadata = await this.metadataEnhancer.enhanceMetadata(
        rawMetadata,
        {
          userMessage,
          botResponse,
          device: extractedData.device,
          service: extractedData.service,
        },
      );

      const chunkId = `conv_${clientId}_${Date.now()}`;

      await this.collection.add({
        ids: [chunkId],
        documents: [chunkText],
        metadatas: [enhancedMetadata],
      });

      logger.info(`💾 Chunk tradicional almacenado: ${clientId} -> ${intent}`);
      return true;
    } catch (error) {
      logger.error("Error en chunking tradicional:", error);
      return false;
    }
  }

  /**
   * CREAR TEXTO DEL CHUNK (RECUERDO)
   * Formato específico según el curso: [Conversación con ID] Usuario: '...' -> Bot: '...'
   */
  createChunkText(clientId, userMessage, botResponse) {
    return `[Conversación con ${clientId}] Usuario: '${userMessage}' -> Sofia: '${botResponse}'`;
  }

  /**
   * CONSTRUIR FILTROS DE METADATA
   */
  buildWhereFilter(clientId, filters) {
    const where = {};

    if (clientId) {
      where.client_id = clientId;
    }

    if (filters.intent) {
      where.main_intent = filters.intent;
    }

    if (filters.device) {
      where.device_mentioned = { $contains: filters.device };
    }

    if (filters.hasPrice) {
      where.has_price_info = "yes";
    }

    if (filters.dateFrom) {
      where.timestamp = { $gte: filters.dateFrom };
    }

    return Object.keys(where).length > 0 ? where : null;
  }

  /**
   * CLASIFICAR TIPO DE RESPUESTA
   */
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

  /**
   * OBTENER CATEGORÍA DE HORA
   */
  getHourCategory(date) {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return "mañana";
    if (hour >= 12 && hour < 18) return "tarde";
    return "noche";
  }

  /**
   * ALMACENAR BACKUP EN POSTGRESQL
   */
  async storeInPostgreSQL(
    clientId,
    userMessage,
    botResponse,
    intent,
    metadata,
  ) {
    try {
      await pool.query(
        `
                INSERT INTO historial_interacciones 
                (numero_telefono, consulta_original, intencion_detectada, respuesta_enviada, 
                 productos_mencionados, tono_detectado, hora_del_dia, satisfaccion_estimada)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
        [
          clientId,
          userMessage,
          intent,
          botResponse,
          JSON.stringify({
            device: metadata.device_mentioned,
            service: metadata.service_mentioned,
            price: metadata.price_quoted,
          }),
          "neutral", // Por ahora
          metadata.hour_of_day,
          metadata.satisfaction_level,
        ],
      );
    } catch (error) {
      logger.warn("Error almacenando backup en PostgreSQL:", error.message);
    }
  }

  /**
   * ASEGURAR QUE ESTÁ INICIALIZADO
   */
  async ensureInitialized() {
    if (!this.collection) {
      const success = await this.initialize();
      if (!success) {
        throw new Error("No se pudo inicializar la memoria conversacional");
      }
    }
  }

  /**
   * OBTENER ESTADÍSTICAS COMPLETAS DE MEMORIA
   * Incluye todas las métricas de optimización avanzada
   */
  async getMemoryStats() {
    try {
      await this.ensureInitialized();

      const count = await this.collection.count();
      const chunkerStats = this.semanticChunker.getChunkerStats();
      const determinismStats = this.deterministicSearch.getDeterminismStats();
      const optimizationStats = this.limitOptimizer.getOptimizationStats();
      const markdownStats = this.markdownEnricher.getCacheStats();
      const deduplicationStats =
        this.deduplicationEngine.getDeduplicationStats();
      const metadataEnhancementStats =
        this.metadataEnhancer.getEnhancementStats();
      const clientSearchStats = this.clientHistorySearch.getSearchStats();

      return {
        total_memories: count,
        collection_name: CONVERSATIONS_COLLECTION_NAME,
        chunking_method: "semantic_overlap_deduplicated_enhanced",
        search_strategy:
          "dynamic_deterministic_enriched_deduplicated_validated",
        chunker_stats: chunkerStats,
        determinism_stats: determinismStats,
        optimization_stats: optimizationStats,
        markdown_stats: markdownStats,
        deduplication_stats: deduplicationStats,
        metadata_enhancement_stats: metadataEnhancementStats,
        client_search_stats: clientSearchStats,
        system_health: this.calculateSystemHealth(),
        status: "active_advanced_enhanced",
      };
    } catch (error) {
      logger.error("Error obteniendo estadísticas de memoria:", error);
      return { status: "error", error: error.message };
    }
  }

  /**
   * CALCULAR SALUD GENERAL DEL SISTEMA
   */
  calculateSystemHealth() {
    try {
      const determinismHealth = this.deterministicSearch.getDeterminismStats();
      const optimizationHealth = this.limitOptimizer.getOptimizationStats();
      const deduplicationHealth =
        this.deduplicationEngine.getDeduplicationStats();

      const determinismScore = determinismHealth.cacheHitRate || 0;
      const stabilizationScore = determinismHealth.stabilizationRate || 0;
      const optimizationScore = optimizationHealth.systemHealth?.overall || 0;
      const deduplicationScore =
        deduplicationHealth.systemHealth?.overall || 0.8; // Por defecto bueno si no hay datos

      const overallHealth =
        determinismScore * 0.25 +
        stabilizationScore * 0.3 +
        optimizationScore * 0.25 +
        deduplicationScore * 0.2;

      return {
        overall: Math.round(overallHealth * 100) / 100,
        determinism: Math.round(determinismScore * 100) / 100,
        stabilization: Math.round(stabilizationScore * 100) / 100,
        optimization: Math.round(optimizationScore * 100) / 100,
        deduplication: Math.round(deduplicationScore * 100) / 100,
        status:
          overallHealth > 0.8
            ? "excellent"
            : overallHealth > 0.6
              ? "good"
              : overallHealth > 0.4
                ? "fair"
                : "poor",
      };
    } catch (error) {
      logger.warn("Error calculando salud del sistema:", error.message);
      return { overall: 0.5, status: "unknown" };
    }
  }

  /**
   * OBTENER CHUNKS RECIENTES PARA DEDUPLICACIÓN
   * Busca chunks recientes del cliente para comparación de duplicados
   */
  async getRecentChunksForDeduplication(clientId, limit = 50) {
    try {
      await this.ensureInitialized();

      // Buscar chunks recientes del cliente específico
      const results = await this.collection.query({
        where: { client_id: clientId },
        nResults: limit,
      });

      // Formatear chunks para deduplicación
      const recentChunks = [];
      if (results.documents && results.documents[0]) {
        for (let i = 0; i < results.documents[0].length; i++) {
          recentChunks.push({
            id: results.ids[0][i],
            text: results.documents[0][i],
            metadata: results.metadatas[0][i],
            embedding: null, // No necesario para deduplicación básica
          });
        }
      }

      logger.debug(
        `🔍 Chunks recientes para deduplicación: ${recentChunks.length} encontrados para cliente ${clientId}`,
      );
      return recentChunks;
    } catch (error) {
      logger.warn(
        `⚠️ Error obteniendo chunks recientes para deduplicación:`,
        error.message,
      );
      return []; // Retornar array vacío en caso de error
    }
  }

  /**
   * BÚSQUEDA ESPECÍFICA DE HISTORIAL DE CLIENTE
   * Método público para buscar historial completo de un cliente específico
   */
  async searchClientHistory(clientPhone, options = {}) {
    try {
      return await this.clientHistorySearch.searchClientHistory(
        clientPhone,
        options,
      );
    } catch (error) {
      logger.error(
        `Error en búsqueda de historial de cliente ${clientPhone}:`,
        error,
      );
      return this.clientHistorySearch.getEmptyClientHistory(
        clientPhone,
        "search_error",
      );
    }
  }

  /**
   * BÚSQUEDA SEMÁNTICA EN HISTORIAL DE CLIENTE
   * Busca contenido específico dentro del historial de un cliente
   */
  async searchInClientHistory(clientPhone, query, options = {}) {
    try {
      return await this.clientHistorySearch.searchInClientHistory(
        clientPhone,
        query,
        options,
      );
    } catch (error) {
      logger.error(
        `Error en búsqueda semántica para cliente ${clientPhone}:`,
        error,
      );
      return {
        clientId: clientPhone,
        query,
        results: [],
        error: error.message,
      };
    }
  }

  /**
   * OBTENER PERFIL DE CLIENTE
   * Extrae perfil y análisis del comportamiento del cliente
   */
  async getClientProfile(clientPhone) {
    try {
      const history = await this.searchClientHistory(clientPhone, {
        limit: 100,
      });
      return {
        clientId: clientPhone,
        profile: history.clientProfile,
        totalInteractions: history.totalInteractions,
        lastInteraction: history.lastInteraction,
        loyaltyScore: this.calculateLoyaltyScore(history),
        status:
          history.totalInteractions > 0 ? "existing_client" : "new_client",
      };
    } catch (error) {
      logger.error(`Error obteniendo perfil de cliente ${clientPhone}:`, error);
      return {
        clientId: clientPhone,
        profile: null,
        status: "error",
        error: error.message,
      };
    }
  }

  /**
   * BUSCAR CLIENTES SIMILARES
   * Encuentra clientes con patrones similares de comportamiento
   */
  async findSimilarClients(referenceClientPhone, options = {}) {
    try {
      const referenceProfile =
        await this.getClientProfile(referenceClientPhone);

      if (!referenceProfile.profile) {
        return {
          referenceClient: referenceClientPhone,
          similarClients: [],
          reason: "no_reference_profile",
        };
      }

      // Implementar búsqueda de clientes similares basada en perfil
      // Por ahora retorna estructura base
      return {
        referenceClient: referenceClientPhone,
        similarClients: [],
        searchCriteria: {
          preferredDevices: referenceProfile.profile.preferredDevices,
          commonServices: referenceProfile.profile.commonServices,
          priceRange: referenceProfile.profile.averagePrice,
        },
        status: "implemented_placeholder",
      };
    } catch (error) {
      logger.error(
        `Error buscando clientes similares a ${referenceClientPhone}:`,
        error,
      );
      return {
        referenceClient: referenceClientPhone,
        similarClients: [],
        error: error.message,
      };
    }
  }

  /**
   * MÉTODOS AUXILIARES PARA CLIENTE
   */
  calculateLoyaltyScore(clientHistory) {
    if (!clientHistory || clientHistory.totalInteractions === 0) return 0;

    let score = 0;

    // Base por número de interacciones
    score += Math.min(0.4, clientHistory.totalInteractions * 0.05);

    // Timespan (más tiempo = más leal)
    if (clientHistory.clientProfile?.loyaltyIndicators?.timespan) {
      const days =
        clientHistory.clientProfile.loyaltyIndicators.timespan /
        (1000 * 60 * 60 * 24);
      score += Math.min(0.3, days / 365); // Máximo 30% por un año
    }

    // Satisfacción
    if (clientHistory.clientProfile?.loyaltyIndicators?.satisfactionLevel) {
      score +=
        (clientHistory.clientProfile.loyaltyIndicators.satisfactionLevel / 5) *
        0.2;
    }

    // Diversidad de servicios
    if (clientHistory.clientProfile?.commonServices?.length > 1) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * CONFIGURAR PARÁMETROS DEL SEMANTIC CHUNKER
   * Permite ajustar ventana y overlap dinámicamente
   */
  configureSemanticChunker(options) {
    this.semanticChunker.config = {
      ...this.semanticChunker.config,
      ...options,
    };
    logger.info("🔧 Configuración de SemanticChunker actualizada:", options);
  }

  /**
   * CONFIGURAR METADATA ENHANCER
   * Permite ajustar configuración de validación de metadatos
   */
  configureMetadataEnhancer(options) {
    this.metadataEnhancer.config = {
      ...this.metadataEnhancer.config,
      ...options,
    };
    logger.info("🔧 Configuración de MetadataEnhancer actualizada:", options);
  }

  /**
   * FUNCIÓN DE SALUD ARQUITECTÓNICA PARA CONVERSATION MEMORY
   * Proporciona información detallada del estado del sistema de memoria
   */
  getArchitecturalHealth() {
    try {
      const systemHealth = this.calculateSystemHealth();
      const memoryStats = this.getMemoryStats ? this.getMemoryStats() : {};

      return {
        service: "conversationMemory",
        timestamp: new Date().toISOString(),
        overallHealth: systemHealth.overall,
        components: {
          semanticChunker: {
            status: this.semanticChunker ? "healthy" : "unavailable",
            health: 0.9,
          },
          deterministicSearch: {
            status: this.deterministicSearch ? "healthy" : "unavailable",
            health: systemHealth.determinism,
          },
          limitOptimizer: {
            status: this.limitOptimizer ? "healthy" : "unavailable",
            health: systemHealth.optimization,
          },
          markdownEnricher: {
            status: this.markdownEnricher ? "healthy" : "unavailable",
            health: 0.9,
          },
          deduplicationEngine: {
            status: this.deduplicationEngine ? "healthy" : "unavailable",
            health: systemHealth.deduplication,
          },
          metadataEnhancer: {
            status: this.metadataEnhancer ? "healthy" : "unavailable",
            health: 0.9,
          },
          clientHistorySearch: {
            status: this.clientHistorySearch ? "healthy" : "unavailable",
            health: 0.85,
          },
          chromaCollection: {
            status: this.collection ? "healthy" : "unavailable",
            health: this.collection ? 0.95 : 0.0,
          },
        },
        metrics: {
          totalMemories: memoryStats.total_memories || 0,
          systemHealth: systemHealth,
          chunkingMethod: "semantic_overlap_deduplicated_enhanced",
          searchStrategy: "dynamic_deterministic_enriched",
        },
        healthStatus: systemHealth.status || "unknown",
      };
    } catch (error) {
      logger.error(
        "Error calculando salud arquitectónica de conversationMemory:",
        error,
      );
      return {
        service: "conversationMemory",
        timestamp: new Date().toISOString(),
        overallHealth: 0.5,
        error: error.message,
        healthStatus: "error",
      };
    }
  }
}

// Instancia singleton
const conversationMemory = new ConversationMemory();

module.exports = {
  ConversationMemory,
  conversationMemory,
};
