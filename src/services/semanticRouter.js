// src/services/semanticRouter.js

const { ChromaClient } = require('chromadb');
const { embeddingEngine } = require('./embeddingEngine');
const logger = require('../utils/logger');

// Configuración de ChromaDB
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const INTENTIONS_COLLECTION_NAME = process.env.INTENTIONS_COLLECTION_NAME || 'intenciones';

// Cliente de ChromaDB inicializado
const client = new ChromaClient({ path: CHROMA_URL });

/**
 * Adapter class para convertir LangChain embeddings a formato ChromaDB
 */
class LangChainEmbeddingAdapter {
    constructor(langchainEmbeddings) {
        this.langchainEmbeddings = langchainEmbeddings;
    }
    
    async generate(texts) {
        try {
            if (Array.isArray(texts)) {
                return await this.langchainEmbeddings.embedDocuments(texts);
            } else {
                return [await this.langchainEmbeddings.embedQuery(texts)];
            }
        } catch (error) {
            logger.error('Error en LangChainEmbeddingAdapter (SemanticRouter):', error);
            throw error;
        }
    }
}

// Crear el adapter para ChromaDB
const embeddingAdapter = new LangChainEmbeddingAdapter(embeddingEngine);

/**
 * Clasifica la intención de una consulta de usuario utilizando búsqueda de similitud en ChromaDB.
 * @param {string} userQuery - La consulta del usuario.
 * @returns {Promise<string>} La etiqueta de la intención más probable (ej. "consulta_precio").
 */
async function classifyIntent(userQuery) {
    try {
        logger.info(`Clasificando intención para: "${userQuery}"`);
        
        // Verificar que embeddingEngine esté disponible
        if (!embeddingEngine) {
            logger.error("Motor de embeddings no está disponible para clasificación");
            return determineIntentByKeywords(userQuery);
        }
        
        // 1. Obtener la colección de intenciones usando el adapter compatible
        const collection = await client.getCollection({ 
            name: INTENTIONS_COLLECTION_NAME,
            embeddingFunction: embeddingAdapter
        });

        // 2. Realizar la búsqueda de similitud en ChromaDB con más resultados para mejor análisis
        const results = await collection.query({
            queryTexts: [userQuery],
            nResults: 3, // Obtener top 3 para mejor análisis
        });

        // 3. Analizar resultados y extraer la intención
        if (results.metadatas && results.metadatas.length > 0 && results.metadatas[0].length > 0) {
            const bestMatch = results.metadatas[0][0];
            const intent = bestMatch.intencion;
            
            // Log adicional para debugging
            if (results.distances && results.distances[0] && results.distances[0][0]) {
                const confidence = 1 - results.distances[0][0]; // Convertir distancia a confianza
                logger.info(`Intención: '${intent}' (confianza: ${(confidence * 100).toFixed(1)}%) para: "${userQuery}"`);
                
                // Si la confianza es muy baja, usar fallback de keywords
                if (confidence < 0.5) {
                    logger.warn(`Confianza baja en clasificación semántica, usando keywords como respaldo`);
                    const keywordIntent = determineIntentByKeywords(userQuery);
                    return keywordIntent !== 'otro' ? keywordIntent : intent;
                }
            }
            
            return intent;
        } else {
            logger.warn(`No se encontraron resultados en ChromaDB para: "${userQuery}"`);
            return determineIntentByKeywords(userQuery);
        }

    } catch (error) {
        logger.error('Error al clasificar la intención:', error);
        
        // Proporcionar información específica sobre el error
        if (error.message.includes("Collection") && error.message.includes("does not exist")) {
            logger.error("La colección de intenciones no existe. Usando clasificación por palabras clave.");
        } else if (error.message.includes("Connection")) {
            logger.error("Error de conexión con ChromaDB. Usando clasificación por palabras clave.");
        }
        
        // Fallback a clasificación por palabras clave
        return determineIntentByKeywords(userQuery);
    }
}

/**
 * Clasificación de respaldo usando palabras clave cuando ChromaDB no está disponible
 * @param {string} userQuery - La consulta del usuario
 * @returns {string} Intención detectada
 */
function determineIntentByKeywords(userQuery) {
    const query = userQuery.toLowerCase();
    
    // Definir patrones de palabras clave para cada intención
    const intentKeywords = {
        'saludo': ['hola', 'buenos', 'buenas', 'buen día', 'saludos', 'qué tal'],
        'despedida': ['adiós', 'chao', 'nos vemos', 'hasta luego', 'gracias', 'bye'],
        'consulta_precio': ['precio', 'cuesta', 'cuánto', 'valor', 'cobran', 'cotizar', 'reparaciones'],
        'consulta_ubicacion': ['dónde', 'ubicación', 'dirección', 'encuentro', 'quedan'],
        'consulta_horario': ['horario', 'hora', 'abren', 'cierran', 'atienden', 'cuando'],
        'consulta_disponibilidad': ['disponible', 'tienen', 'stock', 'hay', 'manejan', 'reparaciones', 'cambios', 'pantalla', 'celulares'],
        'consulta_tiempo': ['cuánto tiempo', 'demora', 'tarda', 'entregan', 'listo'],
        'problema_tecnico': ['no funciona', 'roto', 'dañado', 'problema', 'falla', 'no prende'],
        'consulta_garantia': ['garantía', 'garantiza', 'cubre', 'respaldan'],
        'agradecimiento': ['gracias', 'agradezco', 'excelente', 'perfecto'],
        'escalacion_humana': ['encargado', 'persona', 'humano', 'alguien del equipo', 'hablar con', 'conectar con', 'pasar con', 'dueño', 'jefe', 'responsable']
    };
    
    // Buscar coincidencias
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(keyword => query.includes(keyword))) {
            logger.info(`Intención detectada por keywords: '${intent}' para: "${userQuery}"`);
            return intent;
        }
    }
    
    // Detectar mensajes ambiguos que requieren clarificación
    const ambiguousPatterns = [
        // Información personal sin contexto
        /^(este es mi|mi número|mi teléfono|aquí tienes|te doy|mi contacto)/i,
        // Mensajes muy cortos sin contexto claro
        /^(hola|buenos|buenas|saludos|buen día)$/i,
        // Solo números sin contexto
        /^[\d\s\-\+\(\)]+$/,
        // Mensajes dirigidos a personas específicas
        /^(para el dueño|para el jefe|hablar con|mensaje para|dile a|avísale)/i,
        // Información personal random
        /^(soy|me llamo|yo soy|mi nombre)/i,
        // Ubicaciones sin contexto de servicio
        /^(estoy en|vengo de|voy a)/i
    ];
    
    // Si es ambiguo, necesita clarificación
    if (ambiguousPatterns.some(pattern => pattern.test(query))) {
        logger.info(`Mensaje ambiguo detectado que necesita clarificación: "${userQuery}"`);
        return 'mensaje_ambiguo';
    }
    
    // Si contiene números pero en contexto de servicio, es consulta
    if (/\d/.test(query) && (query.includes('precio') || query.includes('cuesta') || query.includes('modelo'))) {
        return 'consulta_precio';
    }
    
    logger.info(`No se pudo clasificar la intención por keywords para: "${userQuery}". Usando 'otro'.`);
    return 'otro';
}

module.exports = {
    classifyIntent,
};
