// src/services/embeddingEngine.js

const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const logger = require('../utils/logger');

// Configuración del modelo de embeddings de Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

let embeddingEngineInstance = null;

/**
 * Inicializa y devuelve una instancia singleton de OllamaEmbeddings.
 * @returns {OllamaEmbeddings}
 */
function getEmbeddingEngine() {
    if (!embeddingEngineInstance) {
        try {
            embeddingEngineInstance = new OllamaEmbeddings({
                baseUrl: OLLAMA_BASE_URL,
                model: OLLAMA_EMBEDDING_MODEL,
            });
            logger.info(`EmbeddingEngine: OllamaEmbeddings inicializado con base URL: ${OLLAMA_BASE_URL} y modelo: ${OLLAMA_EMBEDDING_MODEL}`);
        } catch (error) {
            logger.error('EmbeddingEngine: Error al inicializar OllamaEmbeddings:', error);
            // En un entorno de producción, podrías querer lanzar el error o manejarlo de otra forma
            // Por ahora, lo dejamos como null para que los módulos que lo usen puedan manejarlo.
            embeddingEngineInstance = null;
        }
    }
    return embeddingEngineInstance;
}

// Exportar la instancia del motor de embeddings
const embeddingEngine = getEmbeddingEngine();

module.exports = {
    embeddingEngine,
    getEmbeddingEngine // Exportar también la función por si se necesita re-inicializar o verificar
};