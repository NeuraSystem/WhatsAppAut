// src/scripts/run_evals.js

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { SimpleAgentExecutor } = require("../services/simpleAgentExecutor");
const { initializeDatabase } = require("../database/pg");
const logger = require("../utils/logger");

const EVAL_DATASET_PATH = path.join(__dirname, "../../eval_dataset.json");

async function runEvals() {
  logger.info("🚀 Iniciando ejecución de evaluaciones...");

  try {
    // Inicializar la base de datos (necesario para algunas herramientas)
    await initializeDatabase();
    logger.info("🗄️ Base de datos inicializada para evaluaciones.");

    // Inicializar el AgentExecutor
    const agentExecutor = new SimpleAgentExecutor();
    logger.info("🧠 SimpleAgentExecutor inicializado para evaluaciones.");

    // Cargar el dataset de evaluaciones
    const evalData = JSON.parse(fs.readFileSync(EVAL_DATASET_PATH, "utf-8"));
    const evaluations = evalData.evaluaciones;
    logger.info(`📋 Cargadas ${evaluations.length} evaluaciones del dataset.`);

    let passedCount = 0;
    let failedCount = 0;

    for (const evalCase of evaluations) {
      logger.info(`
--- Ejecutando evaluación ${evalCase.id} (${evalCase.categoria}) ---`);
      logger.info(`Pregunta: "${evalCase.pregunta}"`);

      let agentResponse;
      try {
        const result = await agentExecutor.execute(evalCase.pregunta);
        agentResponse =
          typeof result === "string"
            ? result
            : result.response || JSON.stringify(result);
        logger.info(`Respuesta del Agente: "${agentResponse}"`);
      } catch (error) {
        logger.error(`Error al ejecutar el agente para ${evalCase.id}:`, error);
        agentResponse = `ERROR: ${error.message}`;
      }

      const isPassed = evalCase.respuesta_ideal_contiene.every((keyword) =>
        String(agentResponse).toLowerCase().includes(keyword.toLowerCase()),
      );

      if (isPassed) {
        passedCount++;
        logger.info(`✅ EVALUACIÓN ${evalCase.id}: PASÓ`);
      } else {
        failedCount++;
        logger.error(`❌ EVALUACIÓN ${evalCase.id}: FALLÓ`);
        logger.error(
          `   Esperaba contener: ${evalCase.respuesta_ideal_contiene.join(", ")}`,
        );
        logger.error(`   Respuesta obtenida: ${agentResponse}`);
      }
    }

    logger.info("\n--- RESUMEN DE EVALUACIONES ---");
    logger.info(`Total de evaluaciones: ${evaluations.length}`);
    logger.info(`Evaluaciones PASADAS: ${passedCount}`);
    logger.info(`Evaluaciones FALLIDAS: ${failedCount}`);

    if (failedCount > 0) {
      logger.error(
        "💥 ALGUNAS EVALUACIONES FALLARON. Revisa los logs para más detalles.",
      );
      process.exit(1);
    } else {
      logger.info("🎉 TODAS LAS EVALUACIONES PASARON EXITOSAMENTE.");
      process.exit(0);
    }
  } catch (error) {
    logger.error("Error crítico durante la ejecución de evaluaciones:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runEvals();
}
