// src/utils/llmJudge.js

const { ChatAnthropic } = require("@langchain/anthropic");
const logger = require("./logger");
const { LRUCache } = require("./lruCache");
const { apiRateLimiter } = require("./rateLimiter");

/**
 * Sistema LLM-as-Judge para evaluación automática de calidad de respuestas
 */
class LLMJudge {
  constructor() {
    // Configurar LLM para evaluación (usar modelo más pequeño para eficiencia)
    this.llm = new ChatAnthropic({
      modelName: "claude-3-haiku-20240307",
      apiKey: process.env.ANTHROPIC_API_KEY,
      temperature: 0.1, // Baja temperatura para evaluaciones consistentes
    });

    // Cache de evaluaciones para evitar re-evaluar
    this.evaluationCache = new LRUCache(1000);

    // Métricas de evaluación
    this.metrics = {
      totalEvaluations: 0,
      averageScore: 0,
      distributionByScore: {},
      lastEvaluation: null,
    };

    // Criterios de evaluación
    this.evaluationCriteria = {
      relevance: {
        weight: 0.3,
        description:
          "¿Qué tan relevante es la respuesta a la pregunta del usuario?",
      },
      accuracy: {
        weight: 0.25,
        description: "¿Es la información técnica correcta y precisa?",
      },
      clarity: {
        weight: 0.2,
        description: "¿Es la respuesta clara y fácil de entender?",
      },
      completeness: {
        weight: 0.15,
        description: "¿Responde completamente a la pregunta del usuario?",
      },
      tone: {
        weight: 0.1,
        description: "¿Es el tono apropiado para el contexto del negocio?",
      },
    };
  }

  /**
   * Evalúa la calidad de una respuesta del bot
   * @param {string} userQuery - Consulta original del usuario
   * @param {string} botResponse - Respuesta del bot
   * @param {string} intent - Intención detectada
   * @param {Object} context - Contexto adicional
   * @returns {Promise<Object>} Evaluación detallada
   */
  async evaluateResponse(
    userQuery,
    botResponse,
    intent = "unknown",
    context = {},
  ) {
    try {
      // Verificar rate limiting
      const rateLimitCheck = apiRateLimiter.checkLimit(
        "anthropic",
        "llm_judge",
      );
      if (!rateLimitCheck.allowed) {
        logger.warn("Rate limit excedido para LLM Judge");
        return this.getFallbackEvaluation();
      }

      // Generar clave de cache
      const cacheKey = this.generateCacheKey(userQuery, botResponse, intent);

      // Verificar cache
      const cachedEvaluation = this.evaluationCache.get(cacheKey);
      if (cachedEvaluation) {
        logger.debug("Evaluación encontrada en cache");
        return cachedEvaluation;
      }

      // Preparar prompt de evaluación
      const evaluationPrompt = this.buildEvaluationPrompt(
        userQuery,
        botResponse,
        intent,
        context,
      );

      // Ejecutar evaluación
      const evaluation = await this.performEvaluation(evaluationPrompt);

      // Guardar en cache
      this.evaluationCache.set(cacheKey, evaluation);

      // Actualizar métricas
      this.updateMetrics(evaluation);

      logger.debug(`Respuesta evaluada: ${evaluation.overallScore}/10`, {
        userQuery: userQuery.substring(0, 50),
        scores: evaluation.scores,
      });

      return evaluation;
    } catch (error) {
      logger.error("Error en evaluación LLM Judge:", error);
      return this.getFallbackEvaluation();
    }
  }

  /**
   * Construye el prompt de evaluación
   * @param {string} userQuery - Consulta del usuario
   * @param {string} botResponse - Respuesta del bot
   * @param {string} intent - Intención detectada
   * @param {Object} context - Contexto adicional
   * @returns {string} Prompt de evaluación
   */
  buildEvaluationPrompt(userQuery, botResponse, intent, context) {
    return `
Eres un evaluador experto de sistemas de atención al cliente para un taller de reparación de celulares.

Tu tarea es evaluar la calidad de una respuesta del bot de atención al cliente.

**CONTEXTO DEL NEGOCIO:**
- Empresa: Salva Cell (taller de reparación de celulares)
- Objetivo: Proporcionar información precisa sobre reparaciones, precios y servicios
- Tono esperado: Amigable, profesional, servicial

**CONSULTA DEL USUARIO:**
"${userQuery}"

**INTENCIÓN DETECTADA:** ${intent}

**RESPUESTA DEL BOT:**
"${botResponse}"

**CONTEXTO ADICIONAL:**
${context.device ? `Dispositivo mencionado: ${context.device}` : ""}
${context.repairType ? `Tipo de reparación: ${context.repairType}` : ""}
${context.conversationStage ? `Etapa de conversación: ${context.conversationStage}` : ""}

**CRITERIOS DE EVALUACIÓN:**
Evalúa cada criterio en una escala de 1-10:

1. **RELEVANCIA (30%)**: ¿La respuesta aborda directamente la consulta del usuario?
2. **PRECISIÓN (25%)**: ¿La información técnica es correcta y apropiada?
3. **CLARIDAD (20%)**: ¿Es fácil de entender para el usuario promedio?
4. **COMPLETITUD (15%)**: ¿Responde completamente a la pregunta?
5. **TONO (10%)**: ¿Es el tono apropiado y profesional?

**FORMATO DE RESPUESTA REQUERIDO:**
Responde EXACTAMENTE en este formato JSON:

{
  "relevance": <número 1-10>,
  "accuracy": <número 1-10>,
  "clarity": <número 1-10>,
  "completeness": <número 1-10>,
  "tone": <número 1-10>,
  "reasoning": {
    "relevance": "<explicación breve>",
    "accuracy": "<explicación breve>",
    "clarity": "<explicación breve>",
    "completeness": "<explicación breve>",
    "tone": "<explicación breve>"
  },
  "overallScore": <promedio ponderado>,
  "strengths": ["<fortaleza 1>", "<fortaleza 2>"],
  "improvements": ["<mejora 1>", "<mejora 2>"],
  "category": "<excellent|good|average|poor>"
}

Evalúa objetivamente basándote en los criterios específicos del negocio.
`;
  }

  /**
   * Ejecuta la evaluación usando el LLM
   * @param {string} prompt - Prompt de evaluación
   * @returns {Promise<Object>} Resultado de evaluación
   */
  async performEvaluation(prompt) {
    try {
      const response = await this.llm.invoke(prompt);

      // Intentar parsear la respuesta JSON
      const evaluation = this.parseEvaluationResponse(response.content);

      // Validar y normalizar
      return this.validateEvaluation(evaluation);
    } catch (error) {
      logger.error("Error ejecutando evaluación LLM:", error);
      throw error;
    }
  }

  /**
   * Parsea la respuesta del LLM
   * @param {string} content - Contenido de respuesta
   * @returns {Object} Evaluación parseada
   */
  parseEvaluationResponse(content) {
    try {
      // Buscar JSON en el contenido
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se encontró JSON válido en la respuesta");
      }

      const evaluation = JSON.parse(jsonMatch[0]);
      return evaluation;
    } catch (error) {
      logger.error("Error parseando respuesta de evaluación:", error);
      throw error;
    }
  }

  /**
   * Valida y normaliza una evaluación
   * @param {Object} evaluation - Evaluación a validar
   * @returns {Object} Evaluación validada
   */
  validateEvaluation(evaluation) {
    const requiredFields = [
      "relevance",
      "accuracy",
      "clarity",
      "completeness",
      "tone",
    ];
    const validatedEvaluation = {
      scores: {},
      reasoning: evaluation.reasoning || {},
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      timestamp: new Date(),
    };

    // Validar puntuaciones
    let totalWeightedScore = 0;
    for (const field of requiredFields) {
      const score = Math.max(1, Math.min(10, evaluation[field] || 5));
      validatedEvaluation.scores[field] = score;

      const weight = this.evaluationCriteria[field].weight;
      totalWeightedScore += score * weight;
    }

    validatedEvaluation.overallScore = Math.round(totalWeightedScore * 10) / 10;

    // Determinar categoría
    if (validatedEvaluation.overallScore >= 8.5) {
      validatedEvaluation.category = "excellent";
    } else if (validatedEvaluation.overallScore >= 7) {
      validatedEvaluation.category = "good";
    } else if (validatedEvaluation.overallScore >= 5) {
      validatedEvaluation.category = "average";
    } else {
      validatedEvaluation.category = "poor";
    }

    return validatedEvaluation;
  }

  /**
   * Genera evaluación de fallback cuando el LLM no está disponible
   * @returns {Object} Evaluación básica
   */
  getFallbackEvaluation() {
    return {
      scores: {
        relevance: 6,
        accuracy: 6,
        clarity: 6,
        completeness: 6,
        tone: 6,
      },
      overallScore: 6.0,
      category: "average",
      reasoning: {
        relevance: "Evaluación no disponible",
        accuracy: "Evaluación no disponible",
        clarity: "Evaluación no disponible",
        completeness: "Evaluación no disponible",
        tone: "Evaluación no disponible",
      },
      strengths: ["Respuesta proporcionada"],
      improvements: ["Evaluación completa pendiente"],
      timestamp: new Date(),
      fallback: true,
    };
  }

  /**
   * Genera clave de cache para evaluación
   * @param {string} userQuery - Consulta del usuario
   * @param {string} botResponse - Respuesta del bot
   * @param {string} intent - Intención
   * @returns {string} Clave de cache
   */
  generateCacheKey(userQuery, botResponse, intent) {
    const content = `${userQuery}|${botResponse}|${intent}`;
    // Generar hash simple para la clave
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Actualiza métricas de evaluación
   * @param {Object} evaluation - Evaluación realizada
   */
  updateMetrics(evaluation) {
    this.metrics.totalEvaluations++;

    // Actualizar promedio de puntuación
    const currentTotal =
      this.metrics.averageScore * (this.metrics.totalEvaluations - 1);
    this.metrics.averageScore =
      (currentTotal + evaluation.overallScore) / this.metrics.totalEvaluations;

    // Actualizar distribución por puntuación
    const scoreRange = Math.floor(evaluation.overallScore);
    this.metrics.distributionByScore[scoreRange] =
      (this.metrics.distributionByScore[scoreRange] || 0) + 1;

    this.metrics.lastEvaluation = new Date();
  }

  /**
   * Realiza evaluación en lote de múltiples respuestas
   * @param {Array} interactions - Array de interacciones a evaluar
   * @returns {Promise<Object>} Resultados de evaluación en lote
   */
  async batchEvaluate(interactions) {
    const results = {
      total: interactions.length,
      evaluated: 0,
      failed: 0,
      averageScore: 0,
      results: [],
    };

    for (const interaction of interactions) {
      try {
        const evaluation = await this.evaluateResponse(
          interaction.userQuery,
          interaction.botResponse,
          interaction.intent,
          interaction.context,
        );

        results.results.push({
          ...interaction,
          evaluation,
        });

        results.evaluated++;
        results.averageScore += evaluation.overallScore;
      } catch (error) {
        logger.error("Error en evaluación de lote:", error);
        results.failed++;
      }
    }

    if (results.evaluated > 0) {
      results.averageScore /= results.evaluated;
    }

    return results;
  }

  /**
   * Obtiene estadísticas del LLM Judge
   * @returns {Object} Estadísticas completas
   */
  getStats() {
    return {
      totalEvaluations: this.metrics.totalEvaluations,
      averageScore: this.metrics.averageScore,
      distributionByScore: this.metrics.distributionByScore,
      lastEvaluation: this.metrics.lastEvaluation,
      cacheMetrics: this.evaluationCache.getMetrics(),
      evaluationCriteria: this.evaluationCriteria,
    };
  }

  /**
   * Identifica respuestas que necesitan mejora
   * @param {number} threshold - Umbral mínimo de puntuación
   * @returns {Array} Evaluaciones por debajo del umbral
   */
  getResponsesNeedingImprovement(threshold = 6) {
    const poorResponses = [];

    this.evaluationCache.forEach((evaluation, key) => {
      if (evaluation.overallScore < threshold) {
        poorResponses.push({
          cacheKey: key,
          evaluation,
          needsAttention: evaluation.category === "poor",
        });
      }
    });

    return poorResponses.sort(
      (a, b) => a.evaluation.overallScore - b.evaluation.overallScore,
    );
  }

  /**
   * Limpia cache de evaluaciones antiguas
   * @returns {number} Número de evaluaciones limpiadas
   */
  cleanupCache() {
    const sizeBefore = this.evaluationCache.size();
    // El LRU Cache se limpia automáticamente, pero podemos forzar limpieza manual
    this.evaluationCache.clear();
    const cleaned = sizeBefore;

    if (cleaned > 0) {
      logger.info(
        `Cache de evaluaciones limpiado: ${cleaned} entradas eliminadas`,
      );
    }

    return cleaned;
  }
}

// Singleton instance
const llmJudge = new LLMJudge();

module.exports = llmJudge;
