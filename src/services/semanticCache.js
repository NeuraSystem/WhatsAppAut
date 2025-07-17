// src/services/semanticCache.js

const { ChromaClient } = require('chromadb');
const { embeddingEngine } = require('./embeddingEngine');
const logger = require('../utils/logger');

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const CACHE_COLLECTION_NAME = 'cache_semantico';
const SIMILARITY_THRESHOLD = process.env.SEMANTIC_CACHE_THRESHOLD || 0.95; // Umbral de similitud muy alto

const client = new ChromaClient({ path: CHROMA_URL });
let cacheCollection;

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
            logger.error('Error en LangChainEmbeddingAdapter (SemanticCache):', error);
            throw error;
        }
    }
}

// Crear el adapter para ChromaDB
const embeddingAdapter = new LangChainEmbeddingAdapter(embeddingEngine);

/**
 * Inicializa la colección de caché semántico.
 */
async function initializeCache() {
    try {
        // PRIMERO: Intentar eliminar la colección rota
        try {
            await client.deleteCollection({ name: CACHE_COLLECTION_NAME });
            logger.info("Colección de caché rota eliminada");
        } catch (deleteError) {
            logger.info("No había colección de caché previa o ya estaba eliminada");
        }
        
        // SEGUNDO: Crear nueva con adapter correcto
        cacheCollection = await client.getOrCreateCollection({ 
            name: CACHE_COLLECTION_NAME,
            embeddingFunction: embeddingAdapter 
        });
        logger.info("Caché semántico inicializado CORRECTAMENTE con adapter compatible.");
    } catch (error) {
        logger.error("Error al inicializar el caché semántico:", error);
        cacheCollection = null;
    }
}

/**
 * Busca una respuesta en el caché semántico.
 * @param {string} userQuery - La consulta del usuario.
 * @returns {Promise<string|null>} La respuesta cacheada si se encuentra, o null.
 */

/**
 * Busca una respuesta en el caché semántico, considerando coherencia y frescura.
 * @param {string} userQuery - La consulta del usuario.
 * @param {object} [options] - Opcional: { minCoherence, maxAgeMs }
 * @returns {Promise<object|null>} Objeto con respuesta y metadatos, o null.
 */
async function findInCache(userQuery, options = {}) {
    if (!cacheCollection) {
        logger.warn("El caché semántico no está disponible. Saltando búsqueda.");
        return null;
    }

    const minCoherence = options.minCoherence || 0.8;
    const maxAgeMs = options.maxAgeMs || 1000 * 60 * 60 * 24 * 2; // 2 días por defecto

    try {
        const queryEmbedding = await embeddingEngine.embedQuery(userQuery);

        // --- VALIDACIÓN DEL EMBEDDING ---
        if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            logger.warn(`Se generó un embedding vacío para la consulta: "${userQuery}". Saltando búsqueda en caché.`);
            return null;
        }

        const results = await cacheCollection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: 1,
            include: ["metadatas", "documents"]
        });

        if (results.distances && results.distances.length > 0 && results.distances[0].length > 0) {
            const similarity = 1 - results.distances[0][0];
            const meta = results.metadatas[0][0] || {};
            const coherence = meta.coherenceScore || 1;
            const timestamp = meta.timestamp || Date.now();
            const age = Date.now() - timestamp;
            if (
                similarity >= SIMILARITY_THRESHOLD &&
                coherence >= minCoherence &&
                age <= maxAgeMs
            ) {
                const cachedResponse = results.documents[0][0];
                logger.info(`HIT de caché semántico (similitud ${similarity.toFixed(4)}, coherencia ${coherence}, edad ${Math.round(age/1000)}s) para: "${userQuery}"`);
                return {
                    response: cachedResponse,
                    similarity,
                    coherence,
                    age,
                    metadatos: meta
                };
            }
        }
        logger.info(`MISS de caché semántico para la consulta: "${userQuery}"`);
        return null;
    } catch (error) {
        logger.error("Error al buscar en el caché semántico:", error);
        return null;
    }
}

/**
 * Añade una nueva entrada al caché semántico.
 * @param {string} userQuery - La consulta original del usuario.
 * @param {string} agentResponse - La respuesta generada por el agente.
 */

/**
 * Añade una nueva entrada al caché semántico, con metadatos de coherencia y temporalidad.
 * @param {string} userQuery - Consulta original.
 * @param {string} agentResponse - Respuesta generada.
 * @param {object} [meta] - Metadatos opcionales: { coherenceScore, validation, ... }
 */
async function addToCache(userQuery, agentResponse, meta = {}) {
    if (!cacheCollection) {
        logger.warn("El caché semántico no está disponible. No se puede añadir la entrada.");
        return;
    }
    try {
        const queryEmbedding = await embeddingEngine.embedQuery(userQuery);
        const id = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const metadatos = {
            query: userQuery,
            timestamp: Date.now(),
            coherenceScore: meta.coherenceScore || 1,
            ...meta
        };
        await cacheCollection.add({
            ids: [id],
            embeddings: [queryEmbedding],
            documents: [agentResponse],
            metadatas: [metadatos],
        });
        logger.info(`Nueva entrada añadida al caché semántico para la consulta: "${userQuery}" (coherencia: ${metadatos.coherenceScore})`);
    } catch (error) {
        logger.error("Error al añadir al caché semántico:", error);
    }
}

/**
 * Invalida entradas del caché por baja coherencia o antigüedad.
 * @param {object} [options] - { minCoherence, maxAgeMs }
 */
async function invalidateCache(options = {}) {
    if (!cacheCollection) return;
    const minCoherence = options.minCoherence || 0.7;
    const maxAgeMs = options.maxAgeMs || 1000 * 60 * 60 * 24 * 3; // 3 días
    try {
        const all = await cacheCollection.get();
        const idsToDelete = [];
        for (let i = 0; i < all.ids.length; i++) {
            const meta = all.metadatas[i];
            const coherence = meta.coherenceScore || 1;
            const timestamp = meta.timestamp || Date.now();
            const age = Date.now() - timestamp;
            if (coherence < minCoherence || age > maxAgeMs) {
                idsToDelete.push(all.ids[i]);
            }
        }
        if (idsToDelete.length > 0) {
            await cacheCollection.delete({ ids: idsToDelete });
            logger.info(`Entradas inválidas eliminadas del caché: ${idsToDelete.length}`);
        }
    } catch (error) {
        logger.error('Error al invalidar el caché semántico:', error);
    }
}

// Inicializar el caché al cargar el módulo
initializeCache();

module.exports = {
    findInCache,
    addToCache,
    invalidateCache
};
