const { ChromaClient } = require('chromadb');
const { getEmbeddingEngine } = require('./embeddingEngine'); // Importar la función asíncrona
const logger = require('../utils/logger');
const { retryHandler } = require('../utils/resilience'); // Importar el handler de reintentos

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const CACHE_COLLECTION_NAME = 'cache_semantico';
const SIMILARITY_THRESHOLD =
  parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD) || 0.85; // Umbral de similitud más flexible por defecto

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
        return retryHandler(
            async () => {
                if (Array.isArray(texts)) {
                    return await this.langchainEmbeddings.embedDocuments(texts);
                } else {
                    return [await this.langchainEmbeddings.embedQuery(texts)];
                }
            },
            5,
            1000
        ); // Reintentos para la generación de embeddings
    }
}

let embeddingAdapterInstance = null; // Instancia del adapter para el caché

/**
 * Inicializa la colección de caché semántico, usando getOrCreateCollection para persistencia.
 */
async function initializeCache() {
    try {
    // Asegurarse de que el motor de embeddings esté inicializado
        const embeddingEngine = await getEmbeddingEngine();
        if (!embeddingEngine) {
            throw new Error('El motor de embeddings no pudo ser inicializado.');
        }

        embeddingAdapterInstance = new LangChainEmbeddingAdapter(embeddingEngine);

        cacheCollection = await retryHandler(
            async () => {
                return await client.getOrCreateCollection({
                    name: CACHE_COLLECTION_NAME,
                    embeddingFunction: embeddingAdapterInstance
                });
            },
            5,
            2000
        ); // 5 reintentos, 2 segundos de delay inicial

        logger.info('Caché semántico inicializado o recuperado CORRECTAMENTE.');
    } catch (error) {
        logger.error(
            'Error crítico al inicializar el caché semántico después de varios reintentos:',
            error
        );
        cacheCollection = null;
        throw error; // Re-lanza el error
    }
}

/**
 * Busca una respuesta en el caché semántico, considerando coherencia y frescura.
 * @param {string} userQuery - La consulta del usuario.
 * @param {object} [options] - Opcional: { minCoherence, maxAgeMs }
 * @returns {Promise<object|null>} Objeto con respuesta y metadatos, o null.
 */
async function findInCache(userQuery, options = {}) {
    if (!cacheCollection) {
        logger.warn('El caché semántico no está disponible. Saltando búsqueda.');
        return null;
    }

    const minCoherence = options.minCoherence || 0.8;
    const maxAgeMs = options.maxAgeMs || 1000 * 60 * 60 * 24 * 7; // 7 días por defecto

    try {
        const embeddingEngine = await getEmbeddingEngine();
        const queryEmbedding = await embeddingEngine.embedQuery(userQuery);

        // --- VALIDACIÓN DEL EMBEDDING ---
        if (
            !queryEmbedding ||
      !Array.isArray(queryEmbedding) ||
      queryEmbedding.length === 0
        ) {
            logger.warn(
                `Se generó un embedding vacío para la consulta: "${userQuery}". Saltando búsqueda en caché.`
            );
            return null;
        }

        const results = await retryHandler(
            async () => {
                return await cacheCollection.query({
                    queryEmbeddings: [queryEmbedding],
                    nResults: 1,
                    include: ['metadatas', 'documents']
                });
            },
            3,
            500
        ); // Reintentos para la consulta a ChromaDB

        if (
            results.distances &&
      results.distances.length > 0 &&
      results.distances[0].length > 0
        ) {
            const similarity = 1 - results.distances[0][0];
            const meta = results.metadatas[0][0] || {};
            const coherence = meta.coherenceScore || 1;
            const timestamp = meta.timestamp || 0; // Si no hay timestamp, asume muy viejo
            const age = Date.now() - timestamp;

            if (
                similarity >= SIMILARITY_THRESHOLD &&
        coherence >= minCoherence &&
        (timestamp === 0 || age <= maxAgeMs) // Considera entradas sin timestamp como siempre válidas si no se define edad máxima
            ) {
                const cachedResponse = results.documents[0][0];
                logger.info(
                    `HIT de caché semántico (similitud ${similarity.toFixed(4)}, coherencia ${coherence}, edad ${Math.round(age / 1000)}s) para: "${userQuery}"`
                );
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
        logger.error('Error al buscar en el caché semántico:', error);
        return null; // Devuelve null en caso de error para no romper el flujo
    }
}

/**
 * Añade una nueva entrada al caché semántico, con metadatos de coherencia y temporalidad.
 * @param {string} userQuery - Consulta original.
 * @param {string} agentResponse - Respuesta generada.
 * @param {object} [meta] - Metadatos opcionales: { coherenceScore, validation, ... }
 */
async function addToCache(userQuery, agentResponse, meta = {}) {
    if (!cacheCollection) {
        logger.warn(
            'El caché semántico no está disponible. No se puede añadir la entrada.'
        );
        return;
    }
    try {
        const embeddingEngine = await getEmbeddingEngine();
        const queryEmbedding = await embeddingEngine.embedQuery(userQuery);
        const id = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const metadatos = {
            query: userQuery,
            timestamp: Date.now(),
            coherenceScore: meta.coherenceScore || 1,
            ...meta
        };
        await retryHandler(
            async () => {
                await cacheCollection.add({
                    ids: [id],
                    embeddings: [queryEmbedding],
                    documents: [agentResponse],
                    metadatas: [metadatos]
                });
            },
            3,
            500
        ); // Reintentos para añadir a ChromaDB
        logger.info(
            `Nueva entrada añadida al caché semántico para la consulta: "${userQuery}" (coherencia: ${metadatos.coherenceScore})`
        );
    } catch (error) {
        logger.error('Error al añadir al caché semántico:', error);
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
    // Se necesita una forma de paginar si hay muchas entradas, o un get más específico
    // Por simplicidad, obtenemos todo para la demostración, pero esto podría ser ineficiente
        const all = await retryHandler(
            async () => {
                return await cacheCollection.get({
                    include: ['metadatas']
                });
            },
            3,
            500
        ); // Reintentos para obtener datos del caché

        const idsToDelete = [];
        if (all && all.ids && all.ids.length > 0) {
            for (let i = 0; i < all.ids.length; i++) {
                const meta = all.metadatas[i];
                const coherence = meta.coherenceScore || 1;
                const timestamp = meta.timestamp || 0;
                const age = Date.now() - timestamp;

                if (coherence < minCoherence || (timestamp !== 0 && age > maxAgeMs)) {
                    idsToDelete.push(all.ids[i]);
                }
            }
        }

        if (idsToDelete.length > 0) {
            await retryHandler(
                async () => {
                    await cacheCollection.delete({ ids: idsToDelete });
                },
                3,
                500
            ); // Reintentos para eliminar de ChromaDB
            logger.info(
                `Entradas inválidas eliminadas del caché: ${idsToDelete.length}`
            );
        } else {
            logger.info(
                'No se encontraron entradas inválidas en el caché para eliminar.'
            );
        }
    } catch (error) {
        logger.error('Error al invalidar el caché semántico:', error);
    }
}

// Inicializar el caché al cargar el módulo, manejando errores críticos
initializeCache().catch((err) => {
    logger.error(
        'Fallo la inicialización del caché semántico de manera crítica.',
        err
    );
    // Dependiendo de la lógica de la aplicación, aquí podrías querer salir del proceso
    // o deshabilitar funcionalidades que dependen del caché.
});

module.exports = {
    findInCache,
    addToCache,
    invalidateCache,
    initializeCache // Exportar para permitir inicialización explícita si es necesario
};
