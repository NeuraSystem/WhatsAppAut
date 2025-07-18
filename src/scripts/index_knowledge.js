// src/scripts/index_knowledge.js

const { ChromaClient } = require("chromadb");
const { embeddingEngine } = require("../services/embeddingEngine");
const { pool } = require("../database/pg");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const KNOWLEDGE_COLLECTION_NAME =
  process.env.KNOWLEDGE_COLLECTION_NAME || "conocimiento_general";
const PERFIL_EMPRESARIAL_CHUNKS_PATH = path.join(
  __dirname,
  "../../data/processed_for_ai/PERFIL_EMPRESARIAL_SALVACELL_CHUNKS.json",
);

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
        "Error en LangChainEmbeddingAdapter (index_knowledge):",
        error,
      );
      throw error;
    }
  }
}

async function indexKnowledge() {
  let connection;
  try {
    logger.info("Iniciando indexación de conocimiento en ChromaDB...");

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
      name: KNOWLEDGE_COLLECTION_NAME,
      embeddingFunction: embeddingAdapter,
    });
    logger.info(`Colección '${KNOWLEDGE_COLLECTION_NAME}' lista en ChromaDB.`);

    connection = await pool.connect();
    logger.info("Conexión a PostgreSQL establecida.");

    const documentsToEmbed = [];
    const metadatasToEmbed = [];
    const idsToEmbed = [];

    // 1. Procesar conocimientos de PostgreSQL
    const conocimientosRes = await connection.query(
      "SELECT id, texto FROM conocimientos",
    );
    const conocimientos = conocimientosRes.rows;
    logger.info(
      `Obtenidos ${conocimientos.length} conocimientos generales de PostgreSQL.`,
    );

    conocimientos.forEach((con) => {
      documentsToEmbed.push(`Conocimiento general: ${con.texto}`);
      metadatasToEmbed.push({
        source: "conocimientos_pg",
        original_text: con.texto,
      });
      idsToEmbed.push(`conocimiento_pg_${con.id}`);
    });

    // 2. Procesar PERFIL_EMPRESARIAL_SALVACELL_CHUNKS.json
    if (fs.existsSync(PERFIL_EMPRESARIAL_CHUNKS_PATH)) {
      logger.info(
        `Procesando chunks de perfil empresarial desde: ${PERFIL_EMPRESARIAL_CHUNKS_PATH}`,
      );
      const perfilChunks = JSON.parse(
        fs.readFileSync(PERFIL_EMPRESARIAL_CHUNKS_PATH, "utf-8"),
      );

      perfilChunks.forEach((chunk) => {
        // Validar que el chunk tenga los campos necesarios
        if (chunk.id && chunk.content && chunk.metadata) {
          documentsToEmbed.push(chunk.content);
          metadatasToEmbed.push(chunk.metadata);
          idsToEmbed.push(chunk.id);
        } else {
          logger.warn(
            `Chunk inválido encontrado en ${PERFIL_EMPRESARIAL_CHUNKS_PATH}:`,
            chunk,
          );
        }
      });
      logger.info(
        `Añadidos ${perfilChunks.length} chunks de perfil empresarial.`,
      );
    } else {
      logger.warn(
        `Archivo de chunks de perfil empresarial no encontrado: ${PERFIL_EMPRESARIAL_CHUNKS_PATH}`,
      );
    }

    logger.info(
      `Preparados ${documentsToEmbed.length} documentos para indexación.`,
    );

    // Añadir documentos a ChromaDB
    await collection.add({
      documents: documentsToEmbed,
      metadatas: metadatasToEmbed,
      ids: idsToEmbed,
    });

    logger.info(
      `Indexación completada. ${documentsToEmbed.length} documentos añadidos/actualizados en la colección '${KNOWLEDGE_COLLECTION_NAME}'.`,
    );
  } catch (error) {
    logger.error("Error durante la indexación de conocimiento:", error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
      logger.info("Conexión a PostgreSQL cerrada.");
    }
  }
}

// Ejecutar la función de indexación si el script es llamado directamente
if (require.main === module) {
  indexKnowledge();
}

module.exports = { indexKnowledge };
