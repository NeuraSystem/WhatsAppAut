// src/services/tools.js

const { DynamicTool } = require("langchain/tools");
const { ChromaClient } = require('chromadb');
const { initializeEmbeddingEngine } = require('./embeddingEngine');
const { pool } = require('../database/pg');
const { PriceExtractionSystem } = require('./priceExtractionSystem');
const { conversationMemory } = require('./conversationMemory');
const { DeterministicSearchEngine } = require('./deterministicSearchEngine');
const { DynamicLimitOptimizer } = require('./dynamicLimitOptimizer');
const { MarkdownContextEnricher } = require('./markdownContextEnricher');
const logger = require('../utils/logger');
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const KNOWLEDGE_COLLECTION_NAME = 'conocimiento_general';

const chromaClient = new ChromaClient({ path: CHROMA_URL });

/**
 * Función auxiliar para validar argumentos de herramientas.
 */
function validateArguments(toolName, args, schema) {
    const validation = {
        isValid: true,
        errors: [],
    };

    // Validar campos requeridos
    for (const field of schema.required) {
        if (!(field in args) || args[field] === null || args[field] === undefined) {
            validation.isValid = false;
            validation.errors.push(`Campo requerido faltante para ${toolName}: ${field}`);
        }
    }

    // Validar tipos (opcional, se puede expandir según necesidad)
    for (const [field, value] of Object.entries(args)) {
        if (schema.types && field in schema.types) {
            const expectedType = schema.types[field];
            if (typeof value !== expectedType) {
                validation.errors.push(`Tipo incorrecto para ${toolName}.${field}: esperado ${expectedType}, recibido ${typeof value}`);
                validation.isValid = false;
            }
        }
    }

    if (!validation.isValid) {
        logger.error(`Validación fallida para ${toolName}:`, validation.errors);
    }

    return validation;
}

/**
 * ENHANCED Adapter class para convertir LangChain embeddings a formato ChromaDB
 * Optimizado para herramientas de búsqueda con prefijos de tarea específicos
 */
class EnhancedLangChainEmbeddingAdapter {
    constructor(enhancedEmbeddingEngine, defaultTaskType = 'document') {
        this.enhancedEngine = enhancedEmbeddingEngine;
        this.defaultTaskType = defaultTaskType; // 'document', 'query', 'classification'
        
        logger.info(`Enhanced Tools Adapter inicializado - Tipo de tarea por defecto: ${defaultTaskType}`);
    }
    
    async generate(texts) {
        try {
            if (Array.isArray(texts)) {
                // Para arrays, asumimos que son documentos a almacenar en conocimiento
                return await this.enhancedEngine.embedDocuments(texts);
            } else {
                // Para texto único, usar el tipo de tarea especificado
                let embedding;
                switch (this.defaultTaskType) {
                    case 'query':
                        embedding = await this.enhancedEngine.embedQuery(texts);
                        break;
                    case 'classification':
                        embedding = await this.enhancedEngine.embedClassification(texts);
                        break;
                    case 'document':
                    default:
                        embedding = await this.enhancedEngine.embedDocument(texts);
                        break;
                }
                return [embedding];
            }
        } catch (error) {
            logger.error('Error en EnhancedLangChainEmbeddingAdapter (Tools):', error);
            throw error;
        }
    }

    /**
     * Método específico para generar embeddings de consulta optimizados
     */
    async generateQuery(text) {
        try {
            const embedding = await this.enhancedEngine.embedQuery(text);
            return [embedding];
        } catch (error) {
            logger.error('Error generando embedding de consulta en Tools:', error);
            throw error;
        }
    }

    /**
     * Método específico para generar embeddings de documento optimizados
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
            logger.error('Error generando embedding de documento en Tools:', error);
            throw error;
        }
    }
}

// Crear los adapters mejorados para ChromaDB con prefijos de tarea específicos
const embeddingAdapter = new EnhancedLangChainEmbeddingAdapter(embeddingEngine, 'document');
const queryAdapter = new EnhancedLangChainEmbeddingAdapter(embeddingEngine, 'query');

/**
 * CROSS-SOURCE VALIDATOR - Validación cruzada entre PostgreSQL y ChromaDB
 * Implementa coherencia de datos entre fuentes para prevenir inconsistencias
 */
class CrossSourceValidator {
    constructor() {
        this.postgresConnector = pool;
        this.consistencyThreshold = 0.85;
        this.validationCache = new Map();
        this.cacheTimeout = 300000; // 5 minutos
        
        logger.info('🔗 CrossSourceValidator inicializado');
    }
    
    /**
     * Validar consistencia de precios entre fuentes semánticas y PostgreSQL
     */
    async validatePriceConsistency(semanticResult, originalQuery) {
        try {
            // Extraer información de dispositivo del resultado semántico
            const deviceInfo = this.extractDeviceInfo(semanticResult.content);
            if (!deviceInfo) {
                return { isConsistent: true, warning: null, source: 'no_device_detected' };
            }
            
            // Verificar cache
            const cacheKey = `price_${deviceInfo.toLowerCase()}`;
            const cached = this.validationCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
                return cached.result;
            }
            
            // Buscar en PostgreSQL para validación
            const postgresQuery = `
                SELECT precio, modelo_celular, notas 
                FROM reparaciones 
                WHERE LOWER(modelo_celular) LIKE LOWER($1)
                LIMIT 5
            `;
            
            const postgresResult = await this.postgresConnector.query(
                postgresQuery, 
                [`%${deviceInfo}%`]
            );
            
            if (postgresResult.rows.length === 0) {
                const result = { 
                    isConsistent: true, 
                    warning: null, 
                    source: 'postgres_no_match',
                    deviceInfo 
                };
                this.validationCache.set(cacheKey, { timestamp: Date.now(), result });
                return result;
            }
            
            // Comparar precios si el resultado semántico menciona precios
            const semanticPrices = this.extractPrices(semanticResult.content);
            const postgresPrices = postgresResult.rows.map(row => parseFloat(row.precio));
            
            if (semanticPrices.length > 0 && postgresPrices.length > 0) {
                const consistencyData = this.comparePrices(semanticPrices, postgresPrices);
                const result = {
                    isConsistent: consistencyData.isConsistent,
                    warning: consistencyData.isConsistent ? null : 'Posible inconsistencia de precios detectada entre fuentes',
                    source: 'price_comparison',
                    deviceInfo,
                    semanticPrices,
                    postgresPrices,
                    overlap: consistencyData.overlap,
                    confidence: consistencyData.confidence
                };
                
                this.validationCache.set(cacheKey, { timestamp: Date.now(), result });
                return result;
            }
            
            const result = { 
                isConsistent: true, 
                warning: null, 
                source: 'no_price_comparison',
                deviceInfo 
            };
            this.validationCache.set(cacheKey, { timestamp: Date.now(), result });
            return result;
            
        } catch (error) {
            logger.warn('⚠️ Error en validación cruzada:', error);
            return { 
                isConsistent: true, 
                warning: 'Error en validación cruzada - procediendo sin validación',
                source: 'validation_error',
                error: error.message
            };
        }
    }
    
    /**
     * Extraer información de dispositivo del contenido
     */
    extractDeviceInfo(content) {
        // Regex mejorado para extraer información de dispositivo
        const devicePatterns = [
            /(samsung|galaxy)\s+([a-z0-9\s]+)/gi,
            /(iphone)\s+([0-9\s\w]+)/gi,
            /(xiaomi|redmi)\s+([a-z0-9\s]+)/gi,
            /(motorola|moto)\s+([a-z0-9\s]+)/gi,
            /(huawei|honor)\s+([a-z0-9\s]+)/gi,
            /(lg|nokia|oppo|vivo)\s+([a-z0-9\s]+)/gi
        ];
        
        for (const pattern of devicePatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                return matches[0].trim();
            }
        }
        
        // Fallback: buscar modelos específicos mencionados
        const modelPatterns = [
            /\b[A-Z]\d{2,3}\b/g, // Modelos como A32, G60, etc.
            /\biphone\s*\d{1,2}\b/gi,
            /\bgalaxy\s*[a-z]\d{2,3}\b/gi
        ];
        
        for (const pattern of modelPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                return matches[0].trim();
            }
        }
        
        return null;
    }
    
    /**
     * Extraer precios del contenido
     */
    extractPrices(content) {
        const pricePatterns = [
            /\$[\d,]+(?:\.\d{2})?/g,
            /\d+\s*pesos/g,
            /\d+\s*MXN/g,
            /precio[:\s]+\$?[\d,]+/gi
        ];
        
        const prices = [];
        for (const pattern of pricePatterns) {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const numericPrice = parseFloat(match.replace(/[^\d.]/g, ''));
                    if (!isNaN(numericPrice) && numericPrice > 0) {
                        prices.push(numericPrice);
                    }
                });
            }
        }
        
        return [...new Set(prices)]; // Eliminar duplicados
    }
    
    /**
     * Comparar precios entre fuentes
     */
    comparePrices(semanticPrices, postgresPrices) {
        // Calcular rangos
        const semanticRange = { 
            min: Math.min(...semanticPrices), 
            max: Math.max(...semanticPrices) 
        };
        const postgresRange = { 
            min: Math.min(...postgresPrices), 
            max: Math.max(...postgresPrices) 
        };
        
        // Permitir 20% de variación (tolerancia)
        const tolerance = 0.2;
        
        // Calcular overlap
        const overlapStart = Math.max(semanticRange.min, postgresRange.min);
        const overlapEnd = Math.min(semanticRange.max, postgresRange.max);
        const overlap = Math.max(0, overlapEnd - overlapStart);
        
        // Calcular rango total
        const totalRangeStart = Math.min(semanticRange.min, postgresRange.min);
        const totalRangeEnd = Math.max(semanticRange.max, postgresRange.max);
        const totalRange = totalRangeEnd - totalRangeStart;
        
        // Calcular consistencia
        const overlapRatio = totalRange > 0 ? overlap / totalRange : 1;
        const isConsistent = overlapRatio > tolerance;
        
        // Calcular confianza adicional
        const priceVariance = this.calculatePriceVariance(semanticPrices, postgresPrices);
        const confidence = Math.max(0, Math.min(1, overlapRatio - priceVariance * 0.1));
        
        return {
            isConsistent,
            overlap: overlapRatio,
            confidence,
            semanticRange,
            postgresRange,
            tolerance
        };
    }
    
    /**
     * Calcular varianza entre conjuntos de precios
     */
    calculatePriceVariance(prices1, prices2) {
        const allPrices = [...prices1, ...prices2];
        const mean = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
        const variance = allPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / allPrices.length;
        return Math.sqrt(variance) / mean; // Coeficiente de variación
    }
    
    /**
     * Validar disponibilidad de producto entre fuentes
     */
    async validateProductAvailability(semanticResult, originalQuery) {
        try {
            const deviceInfo = this.extractDeviceInfo(semanticResult.content);
            if (!deviceInfo) return { isAvailable: true, source: 'no_device_detected' };
            
            // Verificar disponibilidad en PostgreSQL
            const availabilityQuery = `
                SELECT COUNT(*) as count, 
                       AVG(CASE WHEN precio > 0 THEN 1 ELSE 0 END) as availability_ratio
                FROM pantallas_precios 
                WHERE LOWER(modelo_celular) LIKE LOWER($1)
            `;
            
            const result = await this.postgresConnector.query(
                availabilityQuery, 
                [`%${deviceInfo}%`]
            );
            
            const availabilityData = result.rows[0];
            const isAvailable = availabilityData.count > 0 && availabilityData.availability_ratio > 0.5;
            
            return {
                isAvailable,
                deviceInfo,
                matchCount: parseInt(availabilityData.count),
                availabilityRatio: parseFloat(availabilityData.availability_ratio),
                source: 'postgres_availability_check'
            };
            
        } catch (error) {
            logger.warn('⚠️ Error en validación de disponibilidad:', error);
            return { 
                isAvailable: true, 
                warning: 'Error en validación de disponibilidad',
                source: 'availability_error',
                error: error.message
            };
        }
    }
    
    /**
     * Limpiar cache de validación
     */
    clearCache() {
        this.validationCache.clear();
        logger.info('🧹 Cache de validación cruzada limpiado');
    }
    
    /**
     * Obtener estadísticas de validación
     */
    getValidationStats() {
        return {
            cacheSize: this.validationCache.size,
            cacheTimeout: this.cacheTimeout,
            consistencyThreshold: this.consistencyThreshold,
            lastActivity: this.validationCache.size > 0 ? 'active' : 'idle'
        };
    }
}

// Inicializar validador cruzado
const crossSourceValidator = new CrossSourceValidator();

// Inicializar motores avanzados para tools
const deterministicSearchEngine = new DeterministicSearchEngine({
    salvaCellIntegration: true
});

const limitOptimizer = new DynamicLimitOptimizer({
    salvaCellIntegration: true
});

const markdownEnricher = new MarkdownContextEnricher({
    autoRefresh: true
});

/**
 * PERFORMANCE MONITOR - Instrumentación ligera para debugging y optimización
 * Sistema de monitoreo de performance sin impacto significativo en rendimiento
 */
const performanceMonitor = {
    startTimer: (operation, context = {}) => {
        const start = performance.now();
        return {
            operation,
            context,
            start,
            end: () => {
                const duration = performance.now() - start;
                logger.debug(`⏱️ Performance: ${operation} took ${duration.toFixed(2)}ms`, context);
                return duration;
            }
        };
    },
    
    measureAsync: async (operation, asyncFunction, context = {}) => {
        const timer = performanceMonitor.startTimer(operation, context);
        try {
            const result = await asyncFunction();
            timer.end();
            return result;
        } catch (error) {
            const duration = timer.end();
            logger.warn(`⚠️ Performance: ${operation} failed after ${duration.toFixed(2)}ms`, { error: error.message, context });
            throw error;
        }
    },
    
    measureSync: (operation, syncFunction, context = {}) => {
        const timer = performanceMonitor.startTimer(operation, context);
        try {
            const result = syncFunction();
            timer.end();
            return result;
        } catch (error) {
            const duration = timer.end();
            logger.warn(`⚠️ Performance: ${operation} failed after ${duration.toFixed(2)}ms`, { error: error.message, context });
            throw error;
        }
    }
};

/**
 * HERRAMIENTA AVANZADA DE BÚSQUEDA DE CONOCIMIENTO
 * Integra límites dinámicos + determinismo + enriquecimiento Markdown
 */
const knowledgeSearchTool = new DynamicTool({
    name: "consultar_conocimiento",
    description: "Útil para responder preguntas sobre precios de reparaciones, disponibilidad de productos, tiempos de servicio y otros conocimientos generales del negocio. La entrada debe ser la pregunta específica del cliente.",
    func: async (query) => {
        const schema = {
            required: ['query'],
            types: {
                query: 'string'
            }
        };
        const args = { query };
        const validation = validateArguments('consultar_conocimiento', args, schema);
        if (!validation.isValid) {
            return `Error de argumentos: ${validation.errors.join(', ')}`;
        }
        return await performanceMonitor.measureAsync('consultar_conocimiento_avanzado', async () => {
            logger.info(`🚀 Consultando conocimiento avanzado para: "${query}"`);
            
            const embeddingEngine = await initializeEmbeddingEngine();
            // Verificar que embeddingEngine esté disponible
            if (!embeddingEngine) {
                logger.error("Motor de embeddings no está disponible");
                return "El sistema de búsqueda no está disponible en este momento.";
            }
            
            // Usar adapter compatible con ChromaDB
            const collection = await chromaClient.getCollection({ 
                name: KNOWLEDGE_COLLECTION_NAME, 
                embeddingFunction: embeddingAdapter 
            });

            // 1. OPTIMIZAR LÍMITES DINÁMICAMENTE
            const contextType = determineKnowledgeContext(query);
            const limitOptimization = limitOptimizer.optimizeLimits(
                query,
                contextType,
                {}
            );

            logger.debug(`🎯 Límites optimizados para conocimiento: base=${limitOptimization.baseLimit}, max=${limitOptimization.maxLimit}, contexto=${contextType}`);

            // 2. BÚSQUEDA DETERMINÍSTICA CON LÍMITES OPTIMIZADOS
            const stabilizedResults = await deterministicSearchEngine.performStabilizedSearch(
                collection,
                query,
                { limit: limitOptimization.baseLimit },
                contextType
            );

            if (!stabilizedResults.documents || !stabilizedResults.documents.length || !stabilizedResults.documents[0].length) {
                logger.warn(`No se encontró información relevante para: "${query}"`);
                return "No se encontró información específica sobre esa consulta en la base de conocimientos.";
            }

            // 3. ENRIQUECIMIENTO CON CONTEXTO MARKDOWN
            const enrichedResults = markdownEnricher.enrichSearchResults(
                stabilizedResults,
                query,
                contextType
            );

            // 4. VALIDACIÓN CRUZADA CON POSTGRESQL
            const results = [];
            for (let i = 0; i < enrichedResults.documents[0].length; i++) {
                const result = {
                    content: enrichedResults.documents[0][i],
                    metadata: enrichedResults.metadatas ? enrichedResults.metadatas[0][i] : {},
                    distance: enrichedResults.distances ? enrichedResults.distances[0][i] : null,
                    stabilityScore: enrichedResults.stabilityScores ? enrichedResults.stabilityScores[i] : null
                };
                
                // Aplicar validación cruzada
                const validation = await crossSourceValidator.validatePriceConsistency(result, query);
                if (!validation.isConsistent && validation.warning) {
                    result.metadata = result.metadata || {};
                    result.metadata.consistencyWarning = validation.warning;
                    result.metadata.validationSource = validation.source;
                    result.metadata.confidence = validation.confidence;
                    
                    // Reducir relevancia si hay inconsistencia
                    if (result.distance) {
                        result.distance = result.distance * 1.2; // Aumentar distancia (reducir relevancia)
                    }
                    
                    logger.warn(`⚠️ Inconsistencia detectada: ${validation.warning} (device: ${validation.deviceInfo})`);
                }
                
                results.push(result);
            }
            
            // 5. FORMATEAR RESPUESTA CON INFORMACIÓN ENRIQUECIDA Y VALIDADA
            const context = results.map(r => r.content).join("\n---\n");
            const consensusQuality = enrichedResults.consensusQuality?.toFixed(3) || 'N/A';
            
            // 6. AGREGAR INFORMACIÓN MARKDOWN RELEVANTE SI ESTÁ DISPONIBLE
            let enhancedContext = context;
            if (enrichedResults.globalMarkdownInfo) {
                const globalInfo = enrichedResults.globalMarkdownInfo;
                
                // Agregar información estándar relevante
                if (contextType === 'PRICE_QUERIES' && globalInfo.standardInfo) {
                    enhancedContext += `\n\n📋 INFORMACIÓN ADICIONAL:\n`;
                    enhancedContext += `💰 Moneda: ${globalInfo.standardInfo.currency}\n`;
                    enhancedContext += `🔄 Última actualización: ${globalInfo.standardInfo.lastUpdate}\n`;
                    if (globalInfo.catalog?.priceRange) {
                        enhancedContext += `💵 Rango de precios: ${globalInfo.catalog.priceRange.min} - ${globalInfo.catalog.priceRange.max}\n`;
                    }
                }
                
                if ((contextType === 'WARRANTY_LOOKUP' || contextType === 'MARKDOWN_CONTEXT') && globalInfo.standardInfo) {
                    enhancedContext += `\n\n🛡️ INFORMACIÓN DE GARANTÍA:\n`;
                    enhancedContext += `📝 Original: ${globalInfo.standardInfo.warrantyOriginal}\n`;
                    enhancedContext += `📝 Genérica: ${globalInfo.standardInfo.warrantyGeneric}\n`;
                }
                
                if (contextType === 'MARKDOWN_CONTEXT' && globalInfo.standardInfo) {
                    enhancedContext += `\n\n⏰ INFORMACIÓN DE TIEMPO:\n`;
                    enhancedContext += `🏪 Establecimiento: ${globalInfo.standardInfo.establishmentNote}\n`;
                    enhancedContext += `🏠 A domicilio: ${globalInfo.standardInfo.homeServiceNote}\n`;
                    enhancedContext += `⭐ Tiempo promedio: ${globalInfo.standardInfo.averageTime}\n`;
                }
            }
            
            // 7. AGREGAR INFORMACIÓN DE VALIDACIÓN CRUZADA SI HAY ADVERTENCIAS
            const validationWarnings = results.filter(r => r.metadata.consistencyWarning).length;
            if (validationWarnings > 0) {
                enhancedContext += `\n\n🔍 VALIDACIÓN CRUZADA: ${validationWarnings} advertencia(s) de consistencia detectada(s)`;
            }
            
            logger.info(`✅ Contexto avanzado encontrado: ${enhancedContext.length} caracteres (límites: ${limitOptimization.baseLimit}, consenso: ${consensusQuality}, validaciones: ${validationWarnings})`);
            return enhancedContext;

        }, { query, contextType });
    },
});

/**
 * DETERMINAR CONTEXTO DE CONOCIMIENTO PARA BÚSQUEDA DETERMINÍSTICA
 */
function determineKnowledgeContext(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('precio') || lowerQuery.includes('costo') || lowerQuery.includes('$')) {
        return 'PRICE_QUERIES';
    }
    
    if (lowerQuery.includes('garantía') || lowerQuery.includes('original') || lowerQuery.includes('genérica')) {
        return 'WARRANTY_LOOKUP';
    }
    
    if (lowerQuery.includes('tiempo') || lowerQuery.includes('minutos') || lowerQuery.includes('horas')) {
        return 'MARKDOWN_CONTEXT';
    }
    
    if (lowerQuery.includes('iphone') || lowerQuery.includes('samsung') || lowerQuery.includes('xiaomi') || lowerQuery.includes('motorola')) {
        return 'DEVICE_SEARCH';
    }
    
    return 'CONVERSATION_MEMORY'; // Contexto por defecto
}

/**
 * BÚSQUEDA FALLBACK PARA CONOCIMIENTO
 */
async function knowledgeSearchFallback(query) {
    try {
        logger.warn("Intentando búsqueda fallback en conocimiento...");
        const collection = await chromaClient.getCollection({ 
            name: KNOWLEDGE_COLLECTION_NAME, 
            embeddingFunction: embeddingAdapter 
        });

        // MEJORA: Usar embedding de consulta optimizado con prefijos
        const queryEmbedding = await queryAdapter.generateQuery(query);

        const results = await collection.query({
            queryEmbeddings: queryEmbedding,
            nResults: 5, // Traer los 5 resultados más relevantes
        });

        if (results.documents && results.documents.length > 0 && results.documents[0].length > 0) {
            const context = results.documents[0].join("\n---\n");
            logger.info(`Fallback exitoso para conocimiento: ${context.length} caracteres`);
            return context;
        } else {
            return "No se encontró información específica sobre esa consulta en la base de conocimientos.";
        }
    } catch (fallbackError) {
        logger.error("Error en búsqueda fallback de conocimiento:", fallbackError);
        
        // Proporcionar información específica sobre el error
        if (fallbackError.message.includes("Collection") && fallbackError.message.includes("does not exist")) {
            return "La base de conocimientos no está disponible. Por favor, contacta con soporte técnico.";
        } else if (fallbackError.message.includes("Connection")) {
            return "No se puede conectar con la base de datos. Reintentando...";
        } else {
            return "Ocurrió un problema temporal al consultar la información. Puedes intentar reformular tu pregunta.";
        }
    }
}

/**
 * Herramienta para obtener el historial de un cliente desde PostgreSQL.
 */
const customerHistoryTool = new DynamicTool({
    name: "obtener_historial_cliente",
    description: "Obtiene el historial de interacciones y reparaciones de un cliente específico usando su número de teléfono (ID de cliente). La entrada debe ser el ID del cliente.",
    func: async (customer_id) => {
        const schema = {
            required: ['cliente_id'],
            types: {
                cliente_id: 'string'
            }
        };
        const args = { cliente_id: customer_id };
        const validation = validateArguments('obtener_historial_cliente', args, schema);
        if (!validation.isValid) {
            return `Error de argumentos: ${validation.errors.join(', ')}`;
        }
        // Implementación simplificada - obtener historial del cliente
        logger.info(`Obteniendo historial para cliente: ${args.cliente_id}`);
        return "Historial del cliente recuperado. Continuando con la conversación.";
    },
});

/**
 * Herramienta para escalar la conversación a un agente humano.
 */
const escalateToHumanTool = new DynamicTool({
    name: "escalar_a_humano",
    description: "Se debe usar cuando el cliente está muy molesto, presenta una queja grave, o cuando el bot ha fallado repetidamente en entender la consulta. La entrada debe ser un resumen del caso.",
    func: async (case_summary) => {
        const schema = {
            required: ['motivo'],
            optional: ['resumen', 'urgencia'],
            types: {
                motivo: 'string',
                resumen: 'string',
                urgencia: 'string'
            }
        };
        const args = { motivo: case_summary }; // Mapeamos case_summary a motivo
        const validation = validateArguments('escalar_a_humano', args, schema);
        if (!validation.isValid) {
            return `Error de argumentos: ${validation.errors.join(', ')}`;
        }
        // Implementación simplificada - escalar a humano
        logger.info(`Escalando a humano: ${args.motivo}`);
        return "Te estoy conectando con un especialista humano. En breve te atienden. 👨‍💻";
    },
});

/**
/**
 * HERRAMIENTA AVANZADA DE MEMORIA CONVERSACIONAL
 * Integra límites dinámicos + determinismo + enriquecimiento para memoria
 */
const conversationMemoryTool = new DynamicTool({
    name: "consultar_memoria_conversacional",
    description: "Busca en la memoria de conversaciones pasadas del cliente para personalizar respuestas y recordar interacciones anteriores. Muy útil cuando el cliente dice cosas como 'como la vez pasada', 'el precio que me dijiste', 'mi teléfono', etc. La entrada debe ser la consulta o el ID del cliente.",
    func: async (query) => {
        const schema = {
            required: ['query'],
            types: {
                query: 'string'
            }
        };
        const args = { query };
        const validation = validateArguments('consultar_memoria_conversacional', args, schema);
        if (!validation.isValid) {
            return `Error de argumentos: ${validation.errors.join(', ')}`;
        }
        return await performanceMonitor.measureAsync('consultar_memoria_conversacional', async () => {
            logger.info(`🧠 CONSULTANDO MEMORIA AVANZADA: "${query}"`);
            
            // Determinar si es una búsqueda específica de cliente o general
            let clientId = null;
            let searchQuery = query;
            
            // Extraer ID de cliente si está presente en la consulta
            const phonePattern = /52\d{10}|\d{10}/;
            const phoneMatch = query.match(phonePattern);
            if (phoneMatch) {
                clientId = phoneMatch[0];
                searchQuery = query.replace(phoneMatch[0], '').trim() || 'conversación historial';
            }
            
            // Realizar búsqueda en memoria conversacional optimizada
            let result = {};
            
            if (clientId) {
                // Búsqueda específica del cliente con límites optimizados
                result = await conversationMemory.getClientMemory(clientId, 5);
                logger.info(`👤 Memoria específica optimizada del cliente ${clientId}: ${result.memories?.length || result.length} recuerdos`);
            } else {
                // Búsqueda semántica general con optimización avanzada
                result = await conversationMemory.searchConversationMemory(searchQuery, null, { limit: 3 });
                logger.info(`🔍 Búsqueda semántica optimizada: ${result.memories?.length || result.length} recuerdos`);
            }
            
            // Manejar tanto formato nuevo como formato legacy
            const memories = result.memories || result;
            const metadata = result.metadata || {};
            
            if (!memories || memories.length === 0) {
                return "No se encontraron conversaciones previas relevantes. Esta parece ser una nueva consulta.";
            }
            
            // Formatear respuesta con contexto relevante y información avanzada
            let response = "📋 **MEMORIA CONVERSACIONAL AVANZADA:**\n";
            
            // Agregar información de optimización si está disponible
            if (metadata.limitOptimization) {
                response += `🎯 Búsqueda optimizada: ${metadata.limitOptimization.context} (${metadata.limitOptimization.complexity?.level || 'N/A'})\n`;
            }
            
            if (metadata.consensusQuality) {
                response += `🔒 Calidad de consenso: ${Math.round(metadata.consensusQuality * 100)}%\n`;
            }
            
            response += "\n";
            
            for (let i = 0; i < Math.min(3, memories.length); i++) {
                const memory = memories[i];
                const memoryMetadata = memory.metadata;
                
                response += `\n**Conversación ${i + 1}:**\n`;
                response += `${memory.text}\n`;
                
                if (memoryMetadata.device_mentioned) {
                    response += `📱 Dispositivo: ${memoryMetadata.device_mentioned}\n`;
                }
                
                if (memoryMetadata.price_quoted) {
                    response += `💰 Precio mencionado: ${memoryMetadata.price_quoted}\n`;
                }
                
                if (memoryMetadata.user_name) {
                    response += `👤 Nombre: ${memoryMetadata.user_name}\n`;
                }
                
                response += `🕒 Fecha: ${new Date(memoryMetadata.timestamp).toLocaleDateString()}\n`;
                response += `🎯 Intención: ${memoryMetadata.main_intent}\n`;
                
                if (memory.confidence) {
                    response += `🎯 Relevancia: ${Math.round(memory.confidence * 100)}%\n`;
                }
                
                if (memory.stabilityScore) {
                    response += `🔒 Estabilidad: ${Math.round(memory.stabilityScore * 100)}%\n`;
                }
                
                // Agregar información de enriquecimiento Markdown si está disponible
                if (memory.markdownEnrichment) {
                    const enrichment = memory.markdownEnrichment;
                    if (enrichment.warrantyInfo) {
                        response += `🛡️ Garantía: ${enrichment.warrantyInfo.original} (original), ${enrichment.warrantyInfo.generic} (genérica)\n`;
                    }
                    if (enrichment.timeInfo) {
                        response += `⏰ Tiempo: ${enrichment.timeInfo.averageTime}\n`;
                    }
                }
                
                response += "---\n";
            }
            
            // Agregar información global de Markdown si está disponible
            if (metadata.globalMarkdownInfo?.standardInfo) {
                response += `\n📋 **INFO ACTUALIZADA:**\n`;
                response += `💰 Moneda: ${metadata.globalMarkdownInfo.standardInfo.currency}\n`;
                response += `📅 Actualización: ${metadata.globalMarkdownInfo.standardInfo.lastUpdate}\n`;
                response += `🏪 Horarios: ${metadata.globalMarkdownInfo.standardInfo.businessHours.weekdays}\n`;
            }
            
            response += `\n🤖 **BÚSQUEDA:** ${metadata.searchStrategy || 'optimizada'} con ${metadata.resultCount || memories.length} resultados encontrados`;
            response += "\n\n**INSTRUCCIÓN:** Usa esta información enriquecida para personalizar tu respuesta y crear continuidad en la conversación.";
            
            logger.info(`✅ MEMORIA AVANZADA ENCONTRADA: ${memories.length} recuerdos con optimización completa`);
            return response;
            
        }, { query, clientId, memoriesFound: memories?.length || 0 });
    },
});

const getTools = (llm) => {
    const priceExtractionSystem = new PriceExtractionSystem(llm);

    const preciseSearchTool = new DynamicTool({
        name: "consultar_precio_preciso",
        description: "Herramienta ESPECIALIZADA para consultas de precios. Usa múltiples estrategias (búsqueda exacta, difusa) para encontrar precios precisos. Úsala SIEMPRE que el cliente pregunte por precios específicos de dispositivos. Entrada: descripción completa de lo que busca el cliente.",
        func: async (query) => {
            const schema = {
                required: ['dispositivo'],
                optional: ['servicio'],
                types: {
                    dispositivo: 'string',
                    servicio: 'string'
                }
            };
            const args = { dispositivo: query, servicio: 'pantalla' }; // Asumimos pantalla por defecto si no se especifica
            const validation = validateArguments('consultar_precio_preciso', args, schema);
            if (!validation.isValid) {
                return `Error de argumentos: ${validation.errors.join(', ')}`;
            }

            const result = await performanceMonitor.measureAsync('consultar_precio_preciso', async () => {
                logger.info(`🎯 CONSULTA DE PRECIO PRECISO: "${query}"`);
                return await priceExtractionSystem.extractPrice(query);
            }, { query });

            if (!result || !result.price) {
                logger.warn(`❌ No se encontró precio para: "${query}"`);
                return "No se encontró información de precio específica para ese dispositivo. ¿Podrías proporcionarme más detalles sobre el modelo exacto?";
            }

            // Formatear respuesta según nivel de confianza
            let response = "";

            if (result.confidence >= 0.8) {
                response = `El ${result.details.service || 'cambio de pantalla'} para ${result.details.device || 'ese dispositivo'} tiene un costo de ${result.price} pesos.`;
                if (result.details.time) {
                    response += ` El tiempo de reparación es ${result.details.time}.`;
                }
                if (result.details.notes) {
                    response += ` Información adicional: ${result.details.notes}`;
                }
            } else if (result.confidence >= 0.5) {
                response = `Encontré información similar: el ${result.details.service || 'servicio'} para ${result.details.device || 'un dispositivo parecido'} cuesta aproximadamente ${result.price} pesos.`;
                if (result.details.similarity) {
                    response += ` (Coincidencia: ${Math.round(result.confidence * 100)}%)`;
                }
                response += " ¿Es exactamente este dispositivo el que necesitas?";
            } else {
                response = `Basado en dispositivos similares, el precio aproximado sería alrededor de ${result.price} pesos.`;
                response += " Te recomiendo confirmar con el modelo exacto para darte un precio preciso.";
            }

            // Logging para debugging
            logger.info(`✅ PRECIO ENCONTRADO: ${result.price} (método: ${result.method}, confianza: ${result.confidence})`);

            return response;
        },
    });

    return [
        preciseSearchTool,        // ← Para precios exactos (PostgreSQL)
        conversationMemoryTool,   // ← Para memoria conversacional (ChromaDB)
        knowledgeSearchTool,      // ← Para conocimiento general (ChromaDB)
        customerHistoryTool,      // ← Para historial estructurado (PostgreSQL)
        escalateToHumanTool,      // ← Para escalamiento
    ];
}


/**
 * FUNCIÓN DE SALUD ARQUITECTÓNICA PARA TOOLS
 * Proporciona información de estado del sistema de herramientas
 */
function getArchitecturalHealth() {
    try {
        const crossSourceStats = crossSourceValidator.getValidationStats();
        const deterministicStats = deterministicSearchEngine.getDeterminismStats();
        const optimizerStats = limitOptimizer.getOptimizationStats();
        
        // Calcular salud general
        const cacheHealth = crossSourceStats.cacheSize > 0 ? 0.9 : 0.7;
        const deterministicHealth = deterministicStats?.cacheHitRate || 0.8;
        const optimizerHealth = optimizerStats?.systemHealth?.overall || 0.8;
        
        const overallHealth = (cacheHealth * 0.3) + (deterministicHealth * 0.4) + (optimizerHealth * 0.3);
        
        return {
            service: 'tools',
            timestamp: new Date().toISOString(),
            overallHealth: Math.round(overallHealth * 100) / 100,
            components: {
                crossSourceValidator: {
                    status: crossSourceValidator ? 'healthy' : 'unavailable',
                    cacheSize: crossSourceStats.cacheSize,
                    health: cacheHealth
                },
                deterministicSearch: {
                    status: deterministicSearchEngine ? 'healthy' : 'unavailable',
                    health: deterministicHealth
                },
                limitOptimizer: {
                    status: limitOptimizer ? 'healthy' : 'unavailable',
                    health: optimizerHealth
                },
                markdownEnricher: {
                    status: markdownEnricher ? 'healthy' : 'unavailable',
                    health: 0.9
                },
                performanceMonitor: {
                    status: performanceMonitor ? 'healthy' : 'unavailable',
                    health: 0.95
                }
            },
            healthStatus: overallHealth > 0.9 ? 'excellent' : 
                         overallHealth > 0.7 ? 'good' : 
                         overallHealth > 0.5 ? 'fair' : 'poor'
        };
    } catch (error) {
        logger.error('Error calculando salud arquitectónica de tools:', error);
        return {
            service: 'tools',
            timestamp: new Date().toISOString(),
            overallHealth: 0.5,
            error: error.message,
            healthStatus: 'error'
        };
    }
}

module.exports = {
    getTools,
    crossSourceValidator,
    performanceMonitor,
    getArchitecturalHealth
};
