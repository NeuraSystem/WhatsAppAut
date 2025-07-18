// src/scripts/migrate_to_task_prefixes.js

require("dotenv").config({ path: "../../.env" });
const { ChromaClient } = require("chromadb");
const logger = require("../utils/logger");

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const CONVERSATIONS_COLLECTION_NAME = "memoria_conversacional";
const KNOWLEDGE_COLLECTION_NAME = "conocimiento_general";

const chromaClient = new ChromaClient({ path: CHROMA_URL });

/**
 * SCRIPT DE MIGRACIÓN PARA PREFIJOS DE TAREA
 * Este script prepara el sistema para la implementación de prefijos de tarea
 * gestionando la transición de embeddings antiguos a nuevos
 */

/**
 * Verifica si las colecciones existen
 */
async function checkCollections() {
  logger.info("🔍 Verificando colecciones existentes...");

  try {
    const collections = await chromaClient.listCollections();
    const collectionNames = collections.map((c) => c.name);

    logger.info(`📋 Colecciones encontradas: ${collectionNames.join(", ")}`);

    const conversationExists = collectionNames.includes(
      CONVERSATIONS_COLLECTION_NAME,
    );
    const knowledgeExists = collectionNames.includes(KNOWLEDGE_COLLECTION_NAME);

    return {
      conversationExists,
      knowledgeExists,
      collections: collectionNames,
    };
  } catch (error) {
    logger.error("Error verificando colecciones:", error);
    return {
      conversationExists: false,
      knowledgeExists: false,
      collections: [],
    };
  }
}

/**
 * Obtiene estadísticas de una colección
 */
async function getCollectionStats(collectionName) {
  try {
    const collection = await chromaClient.getCollection({
      name: collectionName,
    });
    const count = await collection.count();

    // Obtener una muestra de documentos para análisis
    const sample = await collection.peek({ limit: 3 });

    return {
      name: collectionName,
      count: count,
      sampleDocuments: sample.documents || [],
      sampleMetadata: sample.metadatas || [],
      hasData: count > 0,
    };
  } catch (error) {
    logger.error(`Error obteniendo estadísticas de ${collectionName}:`, error);
    return {
      name: collectionName,
      count: 0,
      sampleDocuments: [],
      sampleMetadata: [],
      hasData: false,
    };
  }
}

/**
 * Crea backup de una colección
 */
async function createCollectionBackup(collectionName) {
  try {
    logger.info(`💾 Creando backup de ${collectionName}...`);

    const collection = await chromaClient.getCollection({
      name: collectionName,
    });
    const backupName = `${collectionName}_backup_${Date.now()}`;

    // Obtener todos los datos de la colección original
    const allData = await collection.get();

    if (!allData.documents || allData.documents.length === 0) {
      logger.warn(
        `⚠️ Colección ${collectionName} está vacía, no se requiere backup`,
      );
      return { success: true, backupName: null, reason: "empty" };
    }

    // Crear colección de backup
    const backupCollection = await chromaClient.createCollection({
      name: backupName,
    });

    // Copiar datos en lotes para evitar problemas de memoria
    const batchSize = 100;
    const totalDocs = allData.documents.length;

    for (let i = 0; i < totalDocs; i += batchSize) {
      const endIndex = Math.min(i + batchSize, totalDocs);

      const batchDocs = allData.documents.slice(i, endIndex);
      const batchIds = allData.ids.slice(i, endIndex);
      const batchMetadata = allData.metadatas
        ? allData.metadatas.slice(i, endIndex)
        : undefined;
      const batchEmbeddings = allData.embeddings
        ? allData.embeddings.slice(i, endIndex)
        : undefined;

      await backupCollection.add({
        documents: batchDocs,
        ids: batchIds,
        metadatas: batchMetadata,
        embeddings: batchEmbeddings,
      });

      logger.info(`📦 Backup: ${endIndex}/${totalDocs} documentos copiados`);
    }

    logger.info(`✅ Backup creado exitosamente: ${backupName}`);
    return {
      success: true,
      backupName: backupName,
      documentsBackedUp: totalDocs,
    };
  } catch (error) {
    logger.error(`Error creando backup de ${collectionName}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Estrategia de migración: Crear colección nueva vs limpiar existente
 */
async function planMigrationStrategy(stats) {
  logger.info("📋 Planificando estrategia de migración...");

  const strategy = {
    conversations: { action: "none", reason: "" },
    knowledge: { action: "none", reason: "" },
  };

  // Estrategia para memoria conversacional
  if (stats.conversations.hasData) {
    if (stats.conversations.count > 1000) {
      strategy.conversations = {
        action: "backup_and_recreate",
        reason: `Colección grande (${stats.conversations.count} docs) - recrear para mejor rendimiento`,
      };
    } else {
      strategy.conversations = {
        action: "backup_and_clear",
        reason: `Colección pequeña (${stats.conversations.count} docs) - limpiar y re-indexar`,
      };
    }
  } else {
    strategy.conversations = {
      action: "ready",
      reason: "Colección vacía - lista para prefijos",
    };
  }

  // Estrategia para conocimiento general
  if (stats.knowledge.hasData) {
    strategy.knowledge = {
      action: "backup_only",
      reason: `Base de conocimiento estable (${stats.knowledge.count} docs) - solo backup preventivo`,
    };
  } else {
    strategy.knowledge = {
      action: "ready",
      reason: "Colección vacía - lista para prefijos",
    };
  }

  return strategy;
}

/**
 * Ejecuta la migración según la estrategia
 */
async function executeMigrationStrategy(strategy, stats) {
  logger.info("🚀 Ejecutando migración...");

  const results = {
    conversations: { success: false, details: "" },
    knowledge: { success: false, details: "" },
  };

  // Migrar memoria conversacional
  try {
    switch (strategy.conversations.action) {
      case "backup_and_recreate":
        const convBackup = await createCollectionBackup(
          CONVERSATIONS_COLLECTION_NAME,
        );
        if (convBackup.success) {
          await chromaClient.deleteCollection({
            name: CONVERSATIONS_COLLECTION_NAME,
          });
          logger.info(
            `🗑️ Colección ${CONVERSATIONS_COLLECTION_NAME} eliminada`,
          );
          results.conversations = {
            success: true,
            details: `Backup creado: ${convBackup.backupName}, colección recreada`,
          };
        } else {
          throw new Error(`Falló backup: ${convBackup.error}`);
        }
        break;

      case "backup_and_clear":
        const convBackup2 = await createCollectionBackup(
          CONVERSATIONS_COLLECTION_NAME,
        );
        if (convBackup2.success) {
          // Simplemente mantener backup, la colección se limpiará automáticamente
          results.conversations = {
            success: true,
            details: `Backup creado: ${convBackup2.backupName}, lista para nueva indexación`,
          };
        } else {
          throw new Error(`Falló backup: ${convBackup2.error}`);
        }
        break;

      case "ready":
        results.conversations = {
          success: true,
          details: "Colección lista para prefijos de tarea",
        };
        break;
    }
  } catch (error) {
    logger.error("Error en migración de conversaciones:", error);
    results.conversations = { success: false, details: error.message };
  }

  // Migrar conocimiento general
  try {
    switch (strategy.knowledge.action) {
      case "backup_only":
        const knowBackup = await createCollectionBackup(
          KNOWLEDGE_COLLECTION_NAME,
        );
        if (knowBackup.success) {
          results.knowledge = {
            success: true,
            details: `Backup preventivo creado: ${knowBackup.backupName}`,
          };
        } else {
          throw new Error(`Falló backup: ${knowBackup.error}`);
        }
        break;

      case "ready":
        results.knowledge = {
          success: true,
          details: "Colección lista para prefijos de tarea",
        };
        break;
    }
  } catch (error) {
    logger.error("Error en migración de conocimiento:", error);
    results.knowledge = { success: false, details: error.message };
  }

  return results;
}

/**
 * Función principal de migración
 */
async function runMigration(dryRun = false) {
  logger.info("🔄 Iniciando migración para prefijos de tarea...");
  logger.info(
    `📋 Modo: ${dryRun ? "DRY RUN (solo análisis)" : "EJECUCIÓN REAL"}`,
  );

  try {
    // 1. Verificar estado actual
    const { conversationExists, knowledgeExists } = await checkCollections();

    if (!conversationExists && !knowledgeExists) {
      logger.info(
        "✅ No hay colecciones existentes - sistema listo para prefijos",
      );
      return {
        success: true,
        message: "Sistema limpio, listo para implementación",
      };
    }

    // 2. Obtener estadísticas
    const stats = {
      conversations: conversationExists
        ? await getCollectionStats(CONVERSATIONS_COLLECTION_NAME)
        : null,
      knowledge: knowledgeExists
        ? await getCollectionStats(KNOWLEDGE_COLLECTION_NAME)
        : null,
    };

    logger.info("📊 Estadísticas actuales:");
    if (stats.conversations) {
      logger.info(
        `  💬 Conversaciones: ${stats.conversations.count} documentos`,
      );
    }
    if (stats.knowledge) {
      logger.info(`  🧠 Conocimiento: ${stats.knowledge.count} documentos`);
    }

    // 3. Planificar estrategia
    const strategy = await planMigrationStrategy(stats);

    logger.info("📋 Estrategia de migración:");
    logger.info(
      `  💬 Conversaciones: ${strategy.conversations.action} - ${strategy.conversations.reason}`,
    );
    logger.info(
      `  🧠 Conocimiento: ${strategy.knowledge.action} - ${strategy.knowledge.reason}`,
    );

    if (dryRun) {
      logger.info("✅ DRY RUN completado - no se realizaron cambios");
      return { success: true, strategy, stats, message: "Análisis completado" };
    }

    // 4. Ejecutar migración
    const results = await executeMigrationStrategy(strategy, stats);

    // 5. Reporte final
    logger.info("📋 Reporte de migración:");
    logger.info(
      `  💬 Conversaciones: ${results.conversations.success ? "✅" : "❌"} ${results.conversations.details}`,
    );
    logger.info(
      `  🧠 Conocimiento: ${results.knowledge.success ? "✅" : "❌"} ${results.knowledge.details}`,
    );

    const overallSuccess =
      results.conversations.success && results.knowledge.success;

    if (overallSuccess) {
      logger.info("🎉 Migración completada exitosamente!");
      logger.info("💡 Próximos pasos:");
      logger.info("   1. Configurar ENABLE_TASK_PREFIXES=true en .env");
      logger.info("   2. Reiniciar la aplicación");
      logger.info("   3. Re-indexar conocimiento si es necesario");
      logger.info("   4. Ejecutar tests de validación");
    } else {
      logger.error("❌ Migración falló parcialmente");
    }

    return { success: overallSuccess, results, strategy, stats };
  } catch (error) {
    logger.error("💥 Error crítico en migración:", error);
    return { success: false, error: error.message };
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  const dryRun = process.argv.includes("--dry-run");

  runMigration(dryRun)
    .then((result) => {
      if (result.success) {
        logger.info("✅ Script completado exitosamente");
        process.exit(0);
      } else {
        logger.error("❌ Script falló:", result.error || "Error desconocido");
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error("💥 Error fatal en script:", error);
      process.exit(1);
    });
}

module.exports = {
  runMigration,
  checkCollections,
  getCollectionStats,
  createCollectionBackup,
};
