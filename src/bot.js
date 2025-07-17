#!/usr/bin/env node

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const CircuitBreaker = require('opossum');

const config = require('./utils/config');
const { initializeDatabase } = require('./database/pg');
const { isChatPaused } = require('./utils/chatState');
const logger = require('./utils/logger');
const { SalvaCellAgentExecutor, OllamaError } = require('./services/agentExecutor');

class SalvaCellPureOrchestrator {
    constructor() {
        this.client = null;
        this.agentExecutor = null;
        this.isReady = false;
        this.adminTimers = new Map(); // Inicializar adminTimers

        this.metrics = {
            totalMessages: 0,
            orchestratorMessages: 0,
            successfulResponses: 0,
            errors: 0,
            circuitBreakerOpen: 0,
            startTime: Date.now(),
            averageResponseTime: 0
        };

        this.agentBreaker = null;

        logger.info('🤖 SalvaCellPureOrchestrator inicializando...');
    }

    async initialize() {
        try {
            logger.info('🗄️ Inicializando base de datos...');
            try {
                await initializeDatabase();
                logger.info('✅ Base de datos inicializada correctamente');
            } catch (dbError) {
                logger.error('❌ Error con la base de datos, continuando sin ella:', dbError.message);
                // Continuar sin base de datos
            }
            
            await this.initializePureOrchestrator();
            await this.initializeWhatsAppClient();
            this.setupEventHandlers();
            this.setupCircuitBreaker();
            logger.info('🤖 SalvaCellPureOrchestrator listo.');
        } catch (error) {
            logger.error('🤖 Error inicializando bot puro:', error);
            throw error;
        }
    }

    async initializePureOrchestrator() {
        try {
            this.agentExecutor = new SalvaCellAgentExecutor(config.orchestrator);
            await this.agentExecutor.initialize(); // Call the new async initializer
            logger.info('🎭 SalvaCellAgentExecutor configurado.');
        } catch (error) {
            logger.error('🎭 Error inicializando AgentExecutor:', error);
            throw error;
        }
    }

    async initializeWhatsAppClient() {
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: "salvacell-pure-orchestrator" }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        logger.info('📱 Cliente WhatsApp inicializado');
    }

    setupCircuitBreaker() {
        const options = {
            timeout: config.bot.responseTimeout,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        };
        this.agentBreaker = new CircuitBreaker(async (userMessage) => this.agentExecutor.execute(userMessage), options);

        this.agentBreaker.on('open', () => {
            logger.warn('Circuit Breaker ABIERTO. El AgentExecutor está fallando.');
            this.metrics.circuitBreakerOpen++;
        });
        this.agentBreaker.on('close', () => logger.info('Circuit Breaker CERRADO. El AgentExecutor se ha recuperado.'));
        this.agentBreaker.fallback(() => {
            throw new Error('CIRCUIT_BREAKER_OPEN');
        });
    }

    setupEventHandlers() {
        this.client.on('qr', (qr) => {
            logger.info('Se generó un nuevo código QR. Escanéalo con tu teléfono.');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.isReady = true;
            logger.info('🤖 SalvaCell Pure Orchestrator LISTO');
        });

        this.client.on('message', this.handleIncomingMessage.bind(this));

        this.client.on('disconnected', (reason) => {
            logger.warn(`📱 WhatsApp desconectado: ${reason}`);
            this.isReady = false;
        });

        process.on('SIGINT', this.shutdown.bind(this));
        process.on('SIGTERM', this.shutdown.bind(this));
    }

    async handleIncomingMessage(message) {
        const startTime = Date.now();
        this.metrics.totalMessages++;

        try {
            const chat = await message.getChat();
            if (chat.isGroup || message.fromMe) return;

            const contact = await message.getContact();
            const userMessage = message.body;
            logger.info(`📥 Mensaje de ${contact.pushname} (${contact.number}): "${userMessage}"`);

            if (isChatPaused(message.from) || config.bot.maintenanceMode) {
                return;
            }

            this.metrics.orchestratorMessages++;
            const response = await this.agentBreaker.fire(userMessage);
            await message.reply(response);

            this.recordSuccess(Date.now() - startTime);
            logger.info(`📤 Respuesta (${Date.now() - startTime}ms): "${response}"`);
        } catch (error) {
            await this.handleMessageError(error, message, Date.now() - startTime);
        }
    }

    async handleMessageError(error, message, responseTime) {
        this.metrics.errors++;
        let errorResponse = 'Disculpa, hay un problema técnico momentáneo. Intenta de nuevo más tarde.';

        if (error.message === 'CIRCUIT_BREAKER_OPEN') {
            errorResponse = 'El sistema está sobrecargado. Por favor, espera un momento.';
            logger.warn(`Circuit Breaker abierto para ${message.from} (${responseTime}ms)`);
        } else if (error instanceof OllamaError) {
            errorResponse = 'No puedo conectarme con el modelo de lenguaje en este momento.';
            logger.error(`Error de Ollama para ${message.from}:`, error);
        } else {
            logger.error(`Error procesando mensaje de ${message.from}:`, error);
        }

        try {
            await message.reply(errorResponse);
        } catch (replyError) {
            logger.error(`Error enviando respuesta de error:`, replyError);
        }
    }

    recordSuccess(responseTime) {
        this.metrics.successfulResponses++;
        const total = this.metrics.averageResponseTime * (this.metrics.successfulResponses - 1) + responseTime;
        this.metrics.averageResponseTime = total / this.metrics.successfulResponses;
        logger.info('Métricas actualizadas', this.getMetrics());
    }

    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        return {
            ...this.metrics,
            uptime: `${(uptime / 1000 / 60).toFixed(2)} minutos`,
            successRate: this.metrics.totalMessages > 0 ? (this.metrics.successfulResponses / this.metrics.totalMessages) : 0,
        };
    }

    async start() {
        try {
            await this.initialize();
            await this.client.initialize();
        } catch (error) {
            logger.error('💥 Error fatal iniciando bot:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.info('🤖 Cerrando bot...');
        if (this.client) {
            this.client.removeAllListeners();
            await this.client.destroy();
        }
        for (const timer of this.adminTimers.values()) {
            clearTimeout(timer);
        }
        this.adminTimers.clear();
        logger.info('🤖 Bot cerrado exitosamente.');
        process.exit(0);
    }
}

if (require.main === module) {
    const bot = new SalvaCellPureOrchestrator();
    bot.start();
}

module.exports = { SalvaCellPureOrchestrator };