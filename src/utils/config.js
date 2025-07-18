// src/utils/config.js
require("dotenv").config();
const logger = require("./logger");

const config = {
  // Configuración del negocio
  business: {
    name: "Salva Cell",
    address: "Av. C. del Refugio, fraccionamiento Valle de las Misiones",
    hours:
      "Lunes a Sábado de 11:00 AM a 9:00 PM, Domingos de 12:00 PM a 5:00 PM",
    logoUrl: process.env.BUSINESS_LOGO_URL,
  },

  // Parámetros del bot
  bot: {
    prefix: "/",
    adminCommand: "admin",
    exitCommand: "salir",
    forwardingNumber: process.env.FORWARDING_NUMBER,
    maintenanceMode: process.env.MAINTENANCE_MODE === "true",
    adminModeTimeout: parseInt(process.env.ADMIN_MODE_TIMEOUT, 10) || 10,
    welcomeMessageDelay: parseInt(process.env.WELCOME_MESSAGE_DELAY, 10) || 2,
    responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT, 10) || 60000,
  },

  // Claves de API
  api: {
    anthropic: process.env.ANTHROPIC_API_KEY,
  },

  // Números de teléfono de administradores
  initialAdmins: process.env.ADMIN_NUMBERS
    ? process.env.ADMIN_NUMBERS.split(",")
    : [],

  // Configuración técnica
  uploads: {
    path: process.env.UPLOAD_DIR || "data/uploads",
  },
  logs: {
    level: process.env.LOG_LEVEL || "info",
  },

  // Configuración del Orchestrator
  orchestrator: {
    maxTokens: parseInt(process.env.ORCHESTRATOR_MAX_TOKENS, 10) || 150,
    temperature: parseFloat(process.env.ORCHESTRATOR_TEMPERATURE) || 0.3,
    maxToolCalls: parseInt(process.env.ORCHESTRATOR_MAX_TOOL_CALLS, 10) || 3,
    toolTimeout: parseInt(process.env.ORCHESTRATOR_TOOL_TIMEOUT, 10) || 5000,
    maxResponseLength:
      parseInt(process.env.ORCHESTRATOR_MAX_RESPONSE_LENGTH, 10) || 500,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    ollamaAgentModel:
      process.env.OLLAMA_AGENT_MODEL || "qwen2.5:1.5b-instruct-q4_0",
  },

  // Configuración de Guardrails
  guardrails: {
    maxLength: parseInt(process.env.GUARDRAILS_MAX_LENGTH, 10) || 500,
    noPromises: [
      /te aseguro/i,
      /garantizado/i,
      /sin falta/i,
      /definitivamente/i,
    ],
    noToxicity: [/idiota/i, /estúpido/i, /maldito/i, /grosero/i, /ofensivo/i],
    businessKeywords: [
      /celular/i,
      /reparación/i,
      /pantalla/i,
      /batería/i,
      /precio/i,
      /garantía/i,
      /tienda/i,
      /horario/i,
    ],
    offTopicKeywords: [
      /clima/i,
      /noticias/i,
      /recetas/i,
      /chistes/i,
      /política/i,
      /religión/i,
    ],
    noPersonalOpinions: [
      /creo que/i,
      /en mi opinión/i,
      /me parece que/i,
      /a mí me gusta/i,
    ],
    noSensitiveInfoRequest: [
      /contraseña/i,
      /tarjeta de crédito/i,
      /número de cuenta/i,
      /cvv/i,
      /pin/i,
    ],
  },

  // Configuración de PriceExtractionSystem
  priceExtraction: {
    fuzzyMatchConfidence:
      parseFloat(process.env.PRICE_EXTRACTION_FUZZY_CONFIDENCE) || 0.5,
    fuzzyFallbackConfidence:
      parseFloat(process.env.PRICE_EXTRACTION_FUZZY_FALLBACK_CONFIDENCE) || 0.7,
    fallbackSearchConfidence:
      parseFloat(process.env.PRICE_EXTRACTION_FALLBACK_CONFIDENCE) || 0.4,
    minPriceValidation:
      parseInt(process.env.PRICE_EXTRACTION_MIN_PRICE, 10) || 100,
    maxPriceValidation:
      parseInt(process.env.PRICE_EXTRACTION_MAX_PRICE, 10) || 10000,
    minConfidenceValidation:
      parseFloat(process.env.PRICE_EXTRACTION_MIN_CONFIDENCE) || 0.3,
  },

  // Configuración de Performance
  performance: {
    enableOptimization: process.env.PERFORMANCE_ENABLE_OPTIMIZATION === "true",
    memoryThreshold:
      parseFloat(process.env.PERFORMANCE_MEMORY_THRESHOLD) || 0.75,
    responseTimeTarget:
      parseInt(process.env.PERFORMANCE_RESPONSE_TIME_TARGET, 10) || 1500,
  },

  // Configuración de Resilience
  resilience: {
    enableCircuitBreaker:
      process.env.RESILIENCE_ENABLE_CIRCUIT_BREAKER === "true",
    enableGracefulDegradation:
      process.env.RESILIENCE_ENABLE_GRACEFUL_DEGRADATION === "true",
    emergencyProtocols: process.env.RESILIENCE_EMERGENCY_PROTOCOLS === "true",

    // Circuit Breaker specific configurations
    circuitBreaker: {
      failureThreshold:
        parseInt(process.env.RESILIENCE_CB_FAILURE_THRESHOLD, 10) || 5,
      successThreshold:
        parseInt(process.env.RESILIENCE_CB_SUCCESS_THRESHOLD, 10) || 3,
      timeout: parseInt(process.env.RESILIENCE_CB_TIMEOUT, 10) || 30000, // 30 seconds
      enableAdaptiveThreshold:
        process.env.RESILIENCE_CB_ADAPTIVE_THRESHOLD === "true",
      adaptiveWindow:
        parseInt(process.env.RESILIENCE_CB_ADAPTIVE_WINDOW, 10) || 300000, // 5 minutes
      responseTimeThreshold:
        parseInt(process.env.RESILIENCE_CB_RESPONSE_TIME_THRESHOLD, 10) || 5000, // 5 seconds
      enableResponseTimeCircuit:
        process.env.RESILIENCE_CB_ENABLE_RESPONSE_TIME_CIRCUIT === "true",
      recoveryTimeout:
        parseInt(process.env.RESILIENCE_CB_RECOVERY_TIMEOUT, 10) || 10000, // 10 seconds
      halfOpenMaxAttempts:
        parseInt(process.env.RESILIENCE_CB_HALF_OPEN_MAX_ATTEMPTS, 10) || 3,
    },

    // Graceful Degradation specific configurations
    gracefulDegradation: {
      criticalServices: process.env.RESILIENCE_GD_CRITICAL_SERVICES
        ? process.env.RESILIENCE_GD_CRITICAL_SERVICES.split(",")
        : ["whatsappClient", "agentExecutor", "database"],
      importantServices: process.env.RESILIENCE_GD_IMPORTANT_SERVICES
        ? process.env.RESILIENCE_GD_IMPORTANT_SERVICES.split(",")
        : ["embeddings", "cache", "logging"],
      optionalServices: process.env.RESILIENCE_GD_OPTIONAL_SERVICES
        ? process.env.RESILIENCE_GD_OPTIONAL_SERVICES.split(",")
        : ["analytics", "metrics"],

      degradationThresholds: {
        memory: parseFloat(process.env.RESILIENCE_GD_MEMORY_THRESHOLD) || 0.85,
        cpu: parseFloat(process.env.RESILIENCE_GD_CPU_THRESHOLD) || 0.9,
        responseTime:
          parseInt(process.env.RESILIENCE_GD_RESPONSE_TIME_THRESHOLD, 10) ||
          5000,
        errorRate:
          parseFloat(process.env.RESILIENCE_GD_ERROR_RATE_THRESHOLD) || 0.15,
      },
      recoveryCheckInterval:
        parseInt(process.env.RESILIENCE_GD_RECOVERY_CHECK_INTERVAL, 10) ||
        30000,
      stabilityRequirement:
        parseInt(process.env.RESILIENCE_GD_STABILITY_REQUIREMENT, 10) || 5,
    },
  },

  // Configuración de Intelligence Layer (Phase 3A)
  intelligence: {
    enableEscalation: process.env.INTELLIGENCE_ENABLE_ESCALATION === "true",
    uncertaintyThreshold:
      parseFloat(process.env.INTELLIGENCE_UNCERTAINTY_THRESHOLD) || 0.7,
    learningThreshold:
      parseInt(process.env.INTELLIGENCE_LEARNING_THRESHOLD, 10) || 3,
    adminTimeout:
      parseInt(process.env.INTELLIGENCE_ADMIN_TIMEOUT, 10) || 300000, // 5 minutes
  },
};

const validateConfig = () => {
  const requiredEnvVars = [
    "FORWARDING_NUMBER",
    "ADMIN_NUMBERS",
    "OLLAMA_BASE_URL",
    "OLLAMA_AGENT_MODEL",
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    logger.error(
      `Faltan las siguientes variables de entorno requeridas: ${missingVars.join(", ")}`,
    );
    process.exit(1);
  }

  if (config.initialAdmins.length === 0) {
    logger.warn(
      "No se han configurado números de administrador en ADMIN_NUMBERS. El modo de administración no estará disponible.",
    );
  }
};

validateConfig();

module.exports = config;
