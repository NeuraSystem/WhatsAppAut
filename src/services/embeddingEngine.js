// src/services/embeddingEngine.js

const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const logger = require('../utils/logger');
const CircuitBreaker = require('opossum');

// Configuración del modelo de embeddings de Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

let embeddingEngineInstance = null;

const embeddingOptions = {
    timeout: 15000, // 15 segundos
    errorThresholdPercentage: 50,
    resetTimeout: 30000 // 30 segundos
};

function createEmbeddingEngine() {
    return new OllamaEmbeddings({
        baseUrl: OLLAMA_BASE_URL,
        model: OLLAMA_EMBEDDING_MODEL,
    });
}

const embeddingBreaker = new CircuitBreaker(createEmbeddingEngine, embeddingOptions);

embeddingBreaker.on('open', () => logger.warn('EmbeddingEngine Circuit Breaker ABIERTO.'));
embeddingBreaker.on('close', () => logger.info('EmbeddingEngine Circuit Breaker CERRADO.'));
embeddingBreaker.fallback(() => {
    logger.error('EmbeddingEngine fallback: No se pudo crear la instancia de OllamaEmbeddings.');
    return null;
});


/**
 * Inicializa y devuelve una instancia singleton de OllamaEmbeddings.
 * @returns {OllamaEmbeddings}
 */
async function getEmbeddingEngine() {
    if (!embeddingEngineInstance) {
        try {
            embeddingEngineInstance = await embeddingBreaker.fire();
            if (embeddingEngineInstance) {
                logger.info(`EmbeddingEngine: OllamaEmbeddings inicializado con base URL: ${OLLAMA_BASE_URL} y modelo: ${OLLAMA_EMBEDDING_MODEL}`);
            }
        } catch (error) {
            logger.error('EmbeddingEngine: Error al inicializar OllamaEmbeddings a través del circuit breaker:', error);
            embeddingEngineInstance = null;
        }
    }
    return embeddingEngineInstance;
}

// Exportar una función de inicialización asíncrona
let embeddingEngine;

async function initializeEmbeddingEngine() {
    if (!embeddingEngine) {
        embeddingEngine = await getEmbeddingEngine();
    }
    return embeddingEngine;
}

module.exports = {
    initializeEmbeddingEngine,
    getEmbeddingEngine // Exportar también la función por si se necesita re-inicializar o verificar
};