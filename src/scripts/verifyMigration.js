// src/scripts/verifyMigration.js
// VERIFICADOR DEL SISTEMA HÍBRIDO DE MEMORIA CONVERSACIONAL

require("dotenv").config();
const { pool } = require("../database/pg");
const { conversationMemory } = require("../services/conversationMemory");
const logger = require("../utils/logger");

/**
 * VERIFICADOR DE LA MIGRACIÓN AL SISTEMA HÍBRIDO
 */
class MigrationVerifier {
  constructor() {
    this.stats = {
      postgresql: {},
      chromadb: {},
      integration: {},
    };
  }

  /**
   * Verifica todo el sistema híbrido
   */
  async verifyMigration() {
    console.log(
      "🔍 VERIFICACIÓN DEL SISTEMA HÍBRIDO DE MEMORIA CONVERSACIONAL",
    );
    console.log(
      "==============================================================\n",
    );

    try {
      // 1. Verificar PostgreSQL
      await this.verifyPostgreSQL();

      // 2. Verificar ChromaDB
      await this.verifyChromaDB();

      // 3. Verificar integración
      await this.verifyIntegration();

      // 4. Mostrar resumen
      this.printVerificationResults();
    } catch (error) {
      console.error("❌ Error en verificación:", error);
    } finally {
      await pool.end();
    }
  }

  /**
   * Verifica datos en PostgreSQL
   */
  async verifyPostgreSQL() {
    console.log("📊 Verificando PostgreSQL...");

    try {
      // Contar conversaciones totales
      const totalResult = await pool.query(`
                SELECT COUNT(*) as total FROM historial_interacciones
            `);
      this.stats.postgresql.total_conversations = parseInt(
        totalResult.rows[0].total,
      );

      // Contar conversaciones con chunk_id
      const chunkedResult = await pool.query(`
                SELECT COUNT(*) as chunked FROM historial_interacciones 
                WHERE chunk_id IS NOT NULL AND chunk_id != ''
            `);
      this.stats.postgresql.chunked_conversations = parseInt(
        chunkedResult.rows[0].chunked,
      );

      // Verificar estructura de tabla actualizada
      const columnsResult = await pool.query(`
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'historial_interacciones' 
                AND column_name IN ('chunk_id', 'servicio_mencionado', 'precio_cotizado', 'nombre_usuario')
            `);
      this.stats.postgresql.new_columns = columnsResult.rows.length;

      // Datos de reparaciones
      const reparacionesResult = await pool.query(`
                SELECT COUNT(*) as total FROM reparaciones
            `);
      this.stats.postgresql.total_repairs = parseInt(
        reparacionesResult.rows[0].total,
      );

      console.log(
        `   ✅ Conversaciones totales: ${this.stats.postgresql.total_conversations}`,
      );
      console.log(
        `   ✅ Conversaciones con chunks: ${this.stats.postgresql.chunked_conversations}`,
      );
      console.log(
        `   ✅ Nuevas columnas: ${this.stats.postgresql.new_columns}/4`,
      );
      console.log(
        `   ✅ Datos de reparaciones: ${this.stats.postgresql.total_repairs}`,
      );
    } catch (error) {
      console.log(`   ❌ Error en PostgreSQL: ${error.message}`);
      this.stats.postgresql.error = error.message;
    }
  }

  /**
   * Verifica ChromaDB
   */
  async verifyChromaDB() {
    console.log("\n🧠 Verificando ChromaDB...");

    try {
      // Inicializar memoria conversacional
      const initialized = await conversationMemory.initialize();
      this.stats.chromadb.initialized = initialized;

      if (initialized) {
        // Obtener estadísticas de memoria
        const memoryStats = await conversationMemory.getMemoryStats();
        this.stats.chromadb = { ...this.stats.chromadb, ...memoryStats };

        console.log(`   ✅ Inicialización: Exitosa`);
        console.log(`   ✅ Colección: ${memoryStats.collection_name}`);
        console.log(
          `   ✅ Recuerdos almacenados: ${memoryStats.total_memories || 0}`,
        );
        console.log(`   ✅ Estado: ${memoryStats.status}`);
      } else {
        console.log(`   ❌ Error en inicialización de ChromaDB`);
      }
    } catch (error) {
      console.log(`   ❌ Error en ChromaDB: ${error.message}`);
      this.stats.chromadb.error = error.message;
    }
  }

  /**
   * Verifica integración entre sistemas
   */
  async verifyIntegration() {
    console.log("\n🔗 Verificando integración híbrida...");

    try {
      // Test de búsqueda semántica
      const searchResults = await conversationMemory.searchConversationMemory(
        "precio pantalla iPhone",
        null,
        { limit: 3 },
      );
      this.stats.integration.semantic_search = searchResults.length;

      // Test de memoria de cliente específico (usar un ID de prueba)
      const clientMemory = await conversationMemory.getClientMemory(
        "5216862262377",
        5,
      );
      this.stats.integration.client_memory = clientMemory.length;

      // Verificar que las herramientas están disponibles
      try {
        const { tools } = require("../services/tools");
        this.stats.integration.tools_count = tools.length;

        // Verificar herramienta de memoria conversacional
        const memoryTool = tools.find(
          (tool) => tool.name === "consultar_memoria_conversacional",
        );
        this.stats.integration.memory_tool_available = !!memoryTool;
      } catch (e) {
        this.stats.integration.tools_error = e.message;
      }

      console.log(
        `   ✅ Búsqueda semántica: ${this.stats.integration.semantic_search} resultados`,
      );
      console.log(
        `   ✅ Memoria de cliente: ${this.stats.integration.client_memory} recuerdos`,
      );
      console.log(
        `   ✅ Herramientas disponibles: ${this.stats.integration.tools_count}`,
      );
      console.log(
        `   ✅ Herramienta de memoria: ${this.stats.integration.memory_tool_available ? "Disponible" : "No disponible"}`,
      );
    } catch (error) {
      console.log(`   ❌ Error en integración: ${error.message}`);
      this.stats.integration.error = error.message;
    }
  }

  /**
   * Muestra resultados de verificación
   */
  printVerificationResults() {
    console.log("\n📋 RESUMEN DE VERIFICACIÓN");
    console.log("==========================");

    // Estado general
    const postgresOk =
      !this.stats.postgresql.error && this.stats.postgresql.new_columns >= 3;
    const chromaOk =
      this.stats.chromadb.initialized && !this.stats.chromadb.error;
    const integrationOk =
      !this.stats.integration.error &&
      this.stats.integration.memory_tool_available;

    console.log(
      `🗄️  PostgreSQL (El Bisturí): ${postgresOk ? "✅ OK" : "❌ PROBLEMAS"}`,
    );
    console.log(
      `🧠 ChromaDB (La Memoria): ${chromaOk ? "✅ OK" : "❌ PROBLEMAS"}`,
    );
    console.log(
      `🔗 Integración Híbrida: ${integrationOk ? "✅ OK" : "❌ PROBLEMAS"}`,
    );

    const overallStatus = postgresOk && chromaOk && integrationOk;
    console.log(
      `\n🎯 ESTADO GENERAL: ${overallStatus ? "✅ SISTEMA HÍBRIDO FUNCIONANDO" : "❌ REQUIERE ATENCIÓN"}`,
    );

    // Recomendaciones
    if (overallStatus) {
      console.log("\n🎉 ¡SISTEMA HÍBRIDO COMPLETAMENTE FUNCIONAL!");
      console.log("\n✨ Capacidades disponibles:");
      console.log("   • 🎯 Consultas exactas de precios (PostgreSQL)");
      console.log("   • 🧠 Memoria conversacional semántica (ChromaDB)");
      console.log("   • 👤 Personalización por cliente");
      console.log("   • 📊 Metadatos ricos para filtrado");
      console.log("   • 🔍 Búsqueda por significado en conversaciones");

      console.log("\n💡 Comandos útiles:");
      console.log("   npm start                     # Iniciar el bot");
      console.log(
        "   node src/scripts/index_knowledge.js  # Reindexar conocimiento",
      );
    } else {
      console.log("\n⚠️ PROBLEMAS DETECTADOS:");

      if (!postgresOk) {
        console.log(
          "   • PostgreSQL: Verificar conexión y estructura de tabla",
        );
        console.log(
          "   • Ejecutar: database/migrations/update_historial_for_chunks.sql",
        );
      }

      if (!chromaOk) {
        console.log(
          "   • ChromaDB: Verificar que esté ejecutándose en puerto 8000",
        );
        console.log("   • Ejecutar: docker run -p 8000:8000 chromadb/chroma");
      }

      if (!integrationOk) {
        console.log("   • Integración: Verificar importaciones y dependencias");
        console.log("   • Revisar logs para errores específicos");
      }
    }

    // Estadísticas detalladas
    console.log("\n📈 ESTADÍSTICAS DETALLADAS:");
    console.log("============================");
    console.log(`PostgreSQL:`);
    console.log(
      `  - Conversaciones: ${this.stats.postgresql.total_conversations || 0}`,
    );
    console.log(
      `  - Con chunks: ${this.stats.postgresql.chunked_conversations || 0}`,
    );
    console.log(
      `  - Reparaciones: ${this.stats.postgresql.total_repairs || 0}`,
    );

    console.log(`ChromaDB:`);
    console.log(`  - Recuerdos: ${this.stats.chromadb.total_memories || 0}`);
    console.log(`  - Estado: ${this.stats.chromadb.status || "unknown"}`);

    console.log(`Integración:`);
    console.log(`  - Herramientas: ${this.stats.integration.tools_count || 0}`);
    console.log(
      `  - Búsqueda semántica: ${this.stats.integration.semantic_search || 0} resultados`,
    );
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  const verifier = new MigrationVerifier();
  verifier
    .verifyMigration()
    .then(() => {
      console.log("\n✅ Verificación completada");
    })
    .catch((error) => {
      console.error("\n❌ Error en verificación:", error);
    });
}

module.exports = MigrationVerifier;
