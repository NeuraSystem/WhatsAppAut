// src/services/simpleAgentExecutor.js
// Simplified agent without complex LangChain Agent framework

const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { tools } = require("./tools");
const logger = require("../utils/logger");
const config = require("../utils/config");
const { findInCache, addToCache } = require("./semanticCache");
const { Guardrails } = require("./guardrails");

// Custom Errors
class OllamaError extends Error {
  constructor(message) {
    super(message);
    this.name = "OllamaError";
  }
}

class SimpleAgentExecutor {
  constructor(options = {}) {
    this.primaryLlm = new ChatOllama({
      baseUrl: config.orchestrator.ollamaBaseUrl,
      model: config.orchestrator.ollamaAgentModel,
      temperature:
        options.temperature || config.orchestrator.temperature || 0.1,
    });

    this.fallbackLlm = new ChatOllama({
      baseUrl: config.orchestrator.ollamaBaseUrl,
      model:
        config.orchestrator.ollamaFallbackModel || "qwen2.5:1.5b-instruct-q4_0",
      temperature:
        options.temperature || config.orchestrator.temperature || 0.1,
    });

    this.tools = tools;
    this.guardrails = new Guardrails();
    this.maxIterations =
      options.maxToolCalls || config.orchestrator.maxToolCalls || 3;

    this.rateLimiter = new RateLimiterMemory({
      points: 10,
      duration: 1,
    });

    logger.info(
      "🧠 SimpleAgentExecutor inicializado con fallback y rate limiting.",
    );
  }

  async execute(input) {
    try {
      await this.rateLimiter.consume(input).catch((err) => {
        logger.warn("Rate limit excedido para la consulta:", input);
        throw new Error("RATE_LIMIT_EXCEEDED");
      });

      // Check semantic cache first
      const cached = await findInCache(input);
      if (cached) {
        logger.info("✅ Respuesta encontrada en caché semántico");
        return cached;
      }

      // Simple input validation
      if (!input || typeof input !== "string" || input.trim().length === 0) {
        logger.warn("Input inválido rechazado");
        return {
          response:
            "Lo siento, no puedo procesar esa consulta. ¿Podrías reformularla?",
          success: false,
          cached: false,
        };
      }

      // Simple LLM execution without complex agent framework
      let response;
      try {
        response = await this.executeWithLLM(this.primaryLlm, input);
        logger.info("✅ Respuesta exitosa del LLM primario");
      } catch (error) {
        logger.warn(
          "Error en el LLM primario. Intentando con el fallback...",
          error.message,
        );
        try {
          response = await this.executeWithLLM(this.fallbackLlm, input);
          logger.info("✅ Respuesta exitosa del LLM de fallback");
        } catch (fallbackError) {
          logger.error(
            "Error en el LLM de fallback. No se pudo procesar la solicitud.",
            fallbackError.message,
          );
          throw new OllamaError(
            "Los modelos de lenguaje no están disponibles.",
          );
        }
      }

      // Simple output validation
      if (
        !response ||
        typeof response !== "string" ||
        response.trim().length === 0
      ) {
        logger.warn("Respuesta vacía del LLM");
        response =
          "Lo siento, no puedo proporcionar una respuesta adecuada en este momento.";
      }

      // Cache the response
      await addToCache(input, response);

      return {
        response: response,
        success: true,
        cached: false,
      };
    } catch (error) {
      logger.error(
        "SalvaCellAgentExecutor: Error ejecutando el agente:",
        error,
      );
      throw error;
    }
  }

  async executeWithLLM(llm, input) {
    const systemPrompt = `Eres Sofía, una asistente experta de SalvaCell. Tu objetivo es ayudar a los clientes con sus consultas sobre reparación de celulares, precios, disponibilidad, y escalamiento a humanos si es necesario.

Responde de manera concisa, profesional y amigable. Si necesitas información específica que no tienes, sugiere contactar directamente.

Ejemplos de respuestas:
- Para precios: "Para obtener el precio exacto de reparación de pantalla iPhone 11, te recomiendo contactar directamente al 686-226-2377 para una cotización precisa."
- Para saludos: "¡Hola! Soy Sofía de SalvaCell. ¿En qué puedo ayudarte hoy con tu celular?"
- Para consultas técnicas: "Por el problema que describes, sería mejor que un técnico revise tu dispositivo. Puedes agendar una cita llamando al 686-226-2377."`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ];

    const response = await llm.invoke(messages);
    return response.content;
  }
}

module.exports = { SimpleAgentExecutor };
