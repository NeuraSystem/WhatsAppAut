// src/scripts/index_intentions.js

const { ChromaClient } = require("chromadb");
const { embeddingEngine } = require("../services/embeddingEngine");
const intentionsData = require("../../intentions_dataset.json");
const logger = require("../utils/logger");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const INTENTIONS_COLLECTION_NAME =
  process.env.INTENTIONS_COLLECTION_NAME || "intenciones";

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
      logger.error(
        "Error en LangChainEmbeddingAdapter (index_intentions):",
        error,
      );
      throw error;
    }
  }
}

async function indexIntentions() {
  try {
    logger.info("Iniciando indexación de intenciones en ChromaDB...");

    // Verificar que el motor de embeddings esté disponible
    if (!embeddingEngine) {
      logger.error(
        "Motor de embeddings no inicializado. Asegúrate de que Ollama esté corriendo y el modelo esté disponible.",
      );
      process.exit(1);
    }

    // Crear el adapter para ChromaDB
    const embeddingAdapter = new LangChainEmbeddingAdapter(embeddingEngine);

    // Obtener o crear la colección de ChromaDB
    const collection = await client.getOrCreateCollection({
      name: INTENTIONS_COLLECTION_NAME,
      embeddingFunction: embeddingAdapter,
    });
    logger.info(`Colección '${INTENTIONS_COLLECTION_NAME}' lista en ChromaDB.`);

    const documents = [];
    const metadatas = [];
    const ids = [];

    intentionsData.intenciones.forEach((item, index) => {
      documents.push(item.texto);
      metadatas.push({ intencion: item.intencion });
      ids.push(`intencion_${index}`);
    });

    logger.info(
      `Preparados ${documents.length} documentos de intención para indexación.`,
    );

    // Añadir documentos a ChromaDB
    await collection.add({
      documents: documents,
      metadatas: metadatas,
      ids: ids,
    });

    logger.info(
      `Indexación completada. ${documents.length} intenciones añadidas/actualizadas en la colección '${INTENTIONS_COLLECTION_NAME}'.`,
    );
  } catch (error) {
    logger.error("Error durante la indexación de intenciones:", error);
    process.exit(1);
  }
}

// Ejecutar la función de indexación si el script es llamado directamente
if (require.main === module) {
  indexIntentions();
}

module.exports = { indexIntentions };
