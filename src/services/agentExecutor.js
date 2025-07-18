// src/services/agentExecutor.js

const { AgentExecutor, createReactAgent } = require("langchain/agents");
const { ChatOllama } = require("@langchain/community/chat_models/ollama");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const { tools } = require("./tools");
const logger = require("../utils/logger");
const config = require("../utils/config");
const { findInCache, addToCache } = require("./semanticCache");
const { Guardrails } = require("./guardrails");

// --- Custom Errors ---
class OllamaError extends Error {
  constructor(message) {
    super(message);
    this.name = "OllamaError";
  }
}

class ToolError extends Error {
  constructor(message) {
    super(message);
    this.name = "ToolError";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class SalvaCellAgentExecutor {
  constructor(options = {}) {
    this.primaryLlm = new ChatOllama({
      baseUrl: config.orchestrator.ollamaBaseUrl,
      model: config.orchestrator.ollamaAgentModel,
      temperature: options.temperature || config.orchestrator.temperature,
    });

    this.fallbackLlm = new ChatOllama({
      baseUrl: config.orchestrator.ollamaBaseUrl,
      model: config.orchestrator.ollamaFallbackModel || "llama3:8b", // A default fallback
      temperature: options.temperature || config.orchestrator.temperature,
    });

    this.tools = tools;
    this.guardrails = new Guardrails();
    this.options = options;
    this.agentExecutor = null; // Will be initialized async

    this.prompt = PromptTemplate.fromTemplate(`
Eres Sofía, una asistente experta de SalvaCell. Tu objetivo es ayudar a los clientes con sus consultas sobre reparación de celulares, precios, disponibilidad, y escalamiento a humanos si es necesario.

Responde de manera concisa, profesional y amigable. Utiliza las herramientas disponibles para obtener información precisa.

TOOLS:
------
You have access to the following tools:

{tools}

To use a tool, please use the following format:

\`\`\`
Thought: Do I need to use a tool? Yes
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
\`\`\`

When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:

\`\`\`
Thought: Do I need to use a tool? No
Final Answer: [your response here]
\`\`\`

Begin!

Question: {input}
Thought: {agent_scratchpad}`);

    this.rateLimiter = new RateLimiterMemory({
      points: 10, // 10 requests
      duration: 1, // per second
    });
  }

  async initialize() {
    const agent = await createReactAgent({
      llm: this.primaryLlm,
      tools: this.tools,
      prompt: this.prompt,
    });

    this.agentExecutor = new AgentExecutor({
      agent,
      tools: this.tools,
      verbose: true,
      maxIterations:
        this.options.maxToolCalls || config.orchestrator.maxToolCalls || 3,
      returnIntermediateSteps: false,
    });

    logger.info(
      "🧠 SalvaCellAgentExecutor inicializado con fallback y rate limiting.",
    );
  }

  async execute(input) {
    try {
      await this.rateLimiter.consume(input).catch((err) => {
        logger.warn("Rate limit excedido para la consulta:", input);
        throw new Error("RATE_LIMIT_EXCEEDED");
      });

      const cachedResponse = await findInCache(input);
      if (cachedResponse) {
        logger.info(`HIT de caché para la consulta: "${input}"`);
        return cachedResponse;
      }

      let result;
      try {
        result = await this.agentExecutor.invoke({ input });
      } catch (error) {
        logger.warn(
          "Error en el LLM primario. Intentando con el fallback...",
          error,
        );
        this.agentExecutor.agent = this.prompt.pipe(this.fallbackLlm); // Switch to fallback
        try {
          result = await this.agentExecutor.invoke({ input });
        } catch (fallbackError) {
          logger.error(
            "Error en el LLM de fallback. No se pudo procesar la solicitud.",
            fallbackError,
          );
          throw new OllamaError(
            "Los modelos de lenguaje no están disponibles.",
          );
        } finally {
          this.agentExecutor.agent = this.prompt.pipe(this.primaryLlm); // Switch back to primary
        }
      }

      let agentResponse = result.output;
      agentResponse = this.guardrails.processResponse(agentResponse, input);
      await addToCache(input, agentResponse);

      return agentResponse;
    } catch (error) {
      logger.error(
        "SalvaCellAgentExecutor: Error ejecutando el agente:",
        error,
      );
      if (error.name === "RateLimiterRes") {
        // Correct error handling for rate-limiter-flexible
        throw new Error("RATE_LIMIT_EXCEEDED");
      }
      if (error instanceof OllamaError) {
        throw error;
      }
      if (error.message.includes("Tool")) {
        throw new ToolError("Error en la ejecución de una herramienta.");
      }
      throw error;
    }
  }
}

module.exports = {
  SalvaCellAgentExecutor,
  OllamaError,
  ToolError,
  ValidationError,
};
