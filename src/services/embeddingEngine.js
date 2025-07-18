const { OllamaEmbeddings } = require('@langchain/community/embeddings/ollama');
const logger = require('../utils/logger');
const { retryHandler } = require('../utils/resilience'); // Importar el handler de reintentos

// Configuración del modelo de embeddings de Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

let embeddingEngineInstance = null;

/**
 * Inicializa y devuelve una instancia singleton de OllamaEmbeddings con reintentos.
 * @returns {Promise<OllamaEmbeddings>}
 */
async function getEmbeddingEngine() {
    if (!embeddingEngineInstance) {
        try {
            embeddingEngineInstance = await retryHandler(
                async () => {
                    const instance = new OllamaEmbeddings({
                        baseUrl: OLLAMA_BASE_URL,
                        model: OLLAMA_EMBEDDING_MODEL
                    });
                    // Opcional: Probar una pequeña operación para confirmar la conexión
                    // await instance.embedQuery("test");
                    logger.info(
                        `EmbeddingEngine: OllamaEmbeddings inicializado con base URL: ${OLLAMA_BASE_URL} y modelo: ${OLLAMA_EMBEDDING_MODEL}`
                    );
                    return instance;
                },
                5,
                2000,
                true
            ); // 5 reintentos, 2 segundos de delay inicial, exponencial
        } catch (error) {
            logger.error(
                'EmbeddingEngine: Error crítico al inicializar OllamaEmbeddings después de varios reintentos:',
                error
            );
            embeddingEngineInstance = null; // Asegura que la instancia es null si falla completamente
            throw error; // Re-lanza el error para que la aplicación maneje la falla
        }
    }
    return embeddingEngineInstance;
}

module.exports = {
    getEmbeddingEngine // Solo exportar la función, la instancia se obtiene asíncronamente
};
