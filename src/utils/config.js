// src/utils/config.js
require('dotenv').config();
const logger = require('./logger');

const config = {
    // Configuración del negocio
    business: {
        name: "Salva Cell",
        address: "Av. C. del Refugio, fraccionamiento Valle de las Misiones",
        hours: "Lunes a Sábado de 11:00 AM a 9:00 PM, Domingos de 12:00 PM a 5:00 PM",
        logoUrl: process.env.BUSINESS_LOGO_URL,
    },

    // Parámetros del bot
    bot: {
        prefix: '/',
        adminCommand: 'admin',
        exitCommand: 'salir',
        forwardingNumber: process.env.FORWARDING_NUMBER,
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        adminModeTimeout: parseInt(process.env.ADMIN_MODE_TIMEOUT, 10) || 10,
        welcomeMessageDelay: parseInt(process.env.WELCOME_MESSAGE_DELAY, 10) || 2,
        responseTimeout: parseInt(process.env.RESPONSE_TIMEOUT, 10) || 60000,
    },

    // Claves de API
    api: {
        anthropic: process.env.ANTHROPIC_API_KEY,
    },

    // Números de teléfono de administradores
    initialAdmins: process.env.ADMIN_NUMBERS ? process.env.ADMIN_NUMBERS.split(',') : [],

    // Configuración técnica
    uploads: {
        path: process.env.UPLOAD_DIR || 'data/uploads',
    },
    logs: {
        level: process.env.LOG_LEVEL || 'info',
    },

    // Configuración del Orchestrator
    orchestrator: {
        maxTokens: parseInt(process.env.ORCHESTRATOR_MAX_TOKENS, 10) || 150,
        temperature: parseFloat(process.env.ORCHESTRATOR_TEMPERATURE) || 0.3,
        maxToolCalls: parseInt(process.env.ORCHESTRATOR_MAX_TOOL_CALLS, 10) || 3,
        toolTimeout: parseInt(process.env.ORCHESTRATOR_TOOL_TIMEOUT, 10) || 5000,
        maxResponseLength: parseInt(process.env.ORCHESTRATOR_MAX_RESPONSE_LENGTH, 10) || 500,
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        ollamaAgentModel: process.env.OLLAMA_AGENT_MODEL || "qwen2.5:1.5b-instruct-q4_0",
    },

    // Configuración del caché semántico
    semanticCache: {
        similarityThreshold: parseFloat(process.env.SEMANTIC_CACHE_THRESHOLD) || 0.95,
        invalidateInterval: parseInt(process.env.SEMANTIC_CACHE_INVALIDATE_INTERVAL, 10) || 3600000, // 1 hora
    },

    // Configuración de Guardrails
    guardrails: {
        responseMaxLength: parseInt(process.env.GUARDRAILS_MAX_LENGTH, 10) || 500,
    },
};

const validateConfig = () => {
    const requiredEnvVars = [
        'FORWARDING_NUMBER',
        'ADMIN_NUMBERS',
        'OLLAMA_BASE_URL',
        'OLLAMA_AGENT_MODEL'
    ];

    const missingVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
        logger.error(`Faltan las siguientes variables de entorno requeridas: ${missingVars.join(', ')}`);
        process.exit(1);
    }

    // Validar que los números de administrador no estén vacíos
    if (config.initialAdmins.length === 0) {
        logger.warn('No se han configurado números de administrador en ADMIN_NUMBERS. El modo de administración no estará disponible.');
    }
};

validateConfig();

module.exports = config;
