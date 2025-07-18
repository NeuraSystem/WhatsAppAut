#!/usr/bin/env node

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const config = require('../config/config');
const { initializeDatabase } = require('./database/pg');
const { isChatPaused } = require('./utils/chatState');
const logger = require('./utils/logger');
const {
    SalvaCellAgentExecutor,
    OllamaError
} = require('./services/agentExecutor');
const orchestrationController = require('./core/OrchestrationController');
const { registerService } = require('./services/serviceRegistry');

class SalvaCellPureOrchestrator {
    constructor() {
        this.client = null;
        this.agentExecutor = null;
        this.isReady = false;
        this.adminTimers = new Map();

        this.metrics = {
            totalMessages: 0,
            orchestratorMessages: 0,
            successfulResponses: 0,
            errors: 0,
            startTime: Date.now(),
            averageResponseTime: 0
        };

        logger.info(
            '🏢 SalvaCellPureOrchestrator inicializando con arquitectura unificada...'
        );
    }

    async initialize() {
        try {
            logger.info('🗄️ Inicializando base de datos...');
            await initializeDatabase();
            logger.info('✅ Base de datos inicializada correctamente');

            // Inicializar el sistema de orquestación unificado (Performance + Resilience)
            logger.info('🎵 Inicializando sistema de orquestación unificado...');
            const orchestrationSuccess = await orchestrationController.initialize();
            if (!orchestrationSuccess) {
                throw new Error('Error inicializando sistema de orquestación');
            }
            logger.info(
                '✅ Sistema de orquestación unificado inicializado correctamente'
            );

            await this.initializePureOrchestrator();
            await this.initializeWhatsAppClient();
            this.setupEventHandlers();

            logger.info('🤖 SalvaCellPureOrchestrator listo.');
        } catch (error) {
            logger.error('🤖 Error inicializando bot puro:', error);
            // En caso de un error fatal en el inicio, apagar el sistema de orquestación
            await orchestrationController.shutdown();
            throw error;
        }
    }

    async initializePureOrchestrator() {
        try {
            this.agentExecutor = new SalvaCellAgentExecutor(config.orchestrator);
            await this.agentExecutor.initialize();
            // Registrar el agentExecutor como un servicio monitoreable
            registerService('agentExecutor', this.agentExecutor);

            // Registrar el cliente WhatsApp
            registerService('whatsappClient', {
                healthCheck: async () => this.isReady,
                initialize: async () => {
                    await this.initializeWhatsAppClient();
                    return true;
                }
            });

            logger.info('🎭 SalvaCellAgentExecutor configurado y registrado.');
        } catch (error) {
            logger.error('🎭 Error inicializando AgentExecutor:', error);
            throw error;
        }
    }

    async initializeWhatsAppClient() {
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId: 'salvacell-pure-orchestrator' }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        logger.info('📱 Cliente WhatsApp inicializado');
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
            // Reportar la desconexión como una falla del servicio de WhatsApp
            const resilienceController =
        orchestrationController.getResilienceController();
            if (resilienceController) {
                resilienceController.reportFailure('whatsappClient', new Error(reason));
            }
        });

        process.on('SIGINT', this.shutdown.bind(this));
        process.on('SIGTERM', this.shutdown.bind(this));
    }

    async handleIncomingMessage(message) {
        const startTime = Date.now();
        this.metrics.totalMessages++;

        // --- Integración de Graceful Degradation ---
        const gracefulDegradationManager =
      orchestrationController.getGracefulDegradationManager();
        if (gracefulDegradationManager && gracefulDegradationManager.isDegraded()) {
            const level = gracefulDegradationManager.getCurrentLevel();
            logger.warn(
                `Sistema en modo degradado (Nivel ${level.level}: ${level.mode}). Respondiendo con mensaje de mantenimiento.`
            );
            await message.reply(level.userMessage);
            return;
        }
        // --- Fin de la integración ---

        try {
            const chat = await message.getChat();
            if (chat.isGroup || message.fromMe) return;

            const contact = await message.getContact();
            const userMessage = message.body;
            logger.info(
                `📥 Mensaje de ${contact.pushname} (${contact.number}): "${userMessage}"`
            );

            if (isChatPaused(message.from) || config.bot.maintenanceMode) {
                return;
            }

            this.metrics.orchestratorMessages++;

            // --- Ejecución con Orquestación Unificada (Performance + Resilience) ---
            const result = await orchestrationController.executeOperation(
                async (context) => {
                    return await this.agentExecutor.execute(context.userMessage);
                },
                { userMessage, from: message.from }
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            const response = result.result;
            // --- Fin de la ejecución unificada ---

            await message.reply(response);

            this.recordSuccess(Date.now() - startTime);
            logger.info(`📤 Respuesta (${Date.now() - startTime}ms): "${response}"`);
            logger.debug(`📊 Métricas de operación:`, result.metrics);
        } catch (error) {
            await this.handleMessageError(error, message, Date.now() - startTime);
        }
    }

    async handleMessageError(error, message, responseTime) {
        this.metrics.errors++;
        let errorResponse =
      'Disculpa, hay un problema técnico momentáneo. Intenta de nuevo más tarde.';

        // El AdvancedCircuitBreaker lanza un error con nombre 'OpenCircuitError'
        if (error.name === 'OpenCircuitError') {
            errorResponse =
        'El sistema está sobrecargado. Por favor, espera un momento.';
            logger.warn(
                `Circuit Breaker abierto para ${message.from} (${responseTime}ms)`
            );
        } else if (error instanceof OllamaError) {
            errorResponse =
        'No puedo conectarme con el modelo de lenguaje en este momento.';
            logger.error(`Error de Ollama para ${message.from}:`, error);
            // Reportar la falla al sistema de resiliencia
            resilienceController.reportFailure('agentExecutor', error);
        } else {
            logger.error(`Error procesando mensaje de ${message.from}:`, error);
            // Reportar la falla al sistema de orquestación
            const resilienceController =
        orchestrationController.getResilienceController();
            if (resilienceController) {
                resilienceController.reportFailure('agentExecutor', error);
            }
        }

        try {
            await message.reply(errorResponse);
        } catch (replyError) {
            logger.error(`Error enviando respuesta de error:`, replyError);
        }
    }

    recordSuccess(responseTime) {
        this.metrics.successfulResponses++;
        const total =
      this.metrics.averageResponseTime *
        (this.metrics.successfulResponses - 1) +
      responseTime;
        this.metrics.averageResponseTime = total / this.metrics.successfulResponses;
    }

    async getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const systemStatus = await orchestrationController.getSystemStatus();

        return {
            ...this.metrics,
            orchestration: systemStatus, // Métricas completas del sistema unificado
            uptime: `${(uptime / 1000 / 60).toFixed(2)} minutos`,
            successRate:
        this.metrics.totalMessages > 0
            ? this.metrics.successfulResponses / this.metrics.totalMessages
            : 0
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

        // Apagar el sistema de orquestación unificado
        await orchestrationController.shutdown();

        if (this.client) {
            this.client.removeAllListeners();
            await this.client.destroy();
        }

        for (const timer of this.adminTimers.values()) {
            clearTimeout(timer);
        }
        this.adminTimers.clear();

        logger.info('✅ Bot cerrado exitosamente con arquitectura unificada.');
        process.exit(0);
    }
}

if (require.main === module) {
    const bot = new SalvaCellPureOrchestrator();
    bot.start();
}

module.exports = { SalvaCellPureOrchestrator };
