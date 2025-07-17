// src/scripts/clear_cache_collection.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { ChromaClient } = require('chromadb');
const logger = require('../utils/logger');

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const CACHE_COLLECTION_NAME = 'conocimiento_general'; // El nombre de la colección a eliminar

const client = new ChromaClient({ path: CHROMA_URL });

async function clearCacheCollection() {
    logger.info(`Intentando eliminar la colección: '${CACHE_COLLECTION_NAME}'...`);
    try {
        const collections = await client.listCollections();
        if (collections.some(c => c.name === CACHE_COLLECTION_NAME)) {
            await client.deleteCollection({ name: CACHE_COLLECTION_NAME });
            logger.info(`✅ Colección '${CACHE_COLLECTION_NAME}' eliminada exitosamente.`);
            logger.info("La caché ha sido vaciada. Por favor, reinicia el bot principal.");
        } else {
            logger.warn(`La colección '${CACHE_COLLECTION_NAME}' no existe. No hay nada que hacer.`);
        }
    } catch (error) {
        logger.error(`Error al intentar eliminar la colección '${CACHE_COLLECTION_NAME}':`, error);
        logger.error("Asegúrate de que el servicio de ChromaDB esté corriendo y accesible en la URL configurada.");
    }
}

clearCacheCollection();
