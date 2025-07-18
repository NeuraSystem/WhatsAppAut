// src/utils/conversationContext.js

const { LRUCache } = require('./cache');
const logger = require('./logger');
const {
    normalizeQuery,
    normalizeDeviceName,
    normalizeRepairType,
    normalizeQualityType
} = require('./validators');

/**
 * Manejador de contexto conversacional para mantener continuidad entre mensajes
 */
class ConversationContext {
    constructor() {
    // Cache de contextos de conversación por cliente
        this.conversationCache = new LRUCache(200); // Máximo 200 conversaciones activas

        // Configuración
        this.config = {
            maxContextAge: 1800000, // 30 minutos - tiempo de vida del contexto
            maxMessagesInContext: 5, // Máximo 5 mensajes en el contexto
            contextResetWords: [
                // Palabras que resetean el contexto
                'hola',
                'buenas',
                'saludos',
                'nueva consulta',
                'otra pregunta',
                'cambio de tema',
                'ahora sobre',
                'quiero preguntar'
            ],
            anaphoricanWords: [
                // Palabras que indican referencia anafórica
                'ese',
                'esa',
                'eso',
                'el',
                'la',
                'lo',
                'genérica',
                'original',
                'más barata',
                'más cara',
                'otra',
                'también',
                'y'
            ]
        };

        // Entidades comunes que debemos rastrear
        this.entityTypes = {
            phoneModels: [
                'iphone',
                'samsung',
                'galaxy',
                'xiaomi',
                'redmi',
                'huawei',
                'honor',
                'motorola',
                'moto',
                'lg',
                'nokia',
                'oppo',
                'vivo'
            ],
            repairTypes: [
                'pantalla',
                'screen',
                'display',
                'bateria',
                'battery',
                'camara',
                'bocina',
                'speaker',
                'microfono',
                'cargador',
                'puerto',
                'tactil',
                'vidrio',
                'lcd',
                'oled'
            ],
            qualityTypes: [
                'original',
                'genérica',
                'generico',
                'oem',
                'aftermarket',
                'compatible',
                'económica',
                'premium',
                'barata',
                'cara'
            ]
        };
    }

    /**
   * Obtiene el contexto actual de una conversación
   * @param {string} clientId - ID del cliente
   * @returns {Object} Contexto de la conversación
   */
    getContext(clientId) {
        const context = this.conversationCache.get(clientId);

        if (!context) {
            return this.createNewContext(clientId);
        }

        // Verificar si el contexto ha expirado
        const now = Date.now();
        if (now - context.lastUpdate > this.config.maxContextAge) {
            logger.info(`Contexto expirado para ${clientId}, creando nuevo`);
            return this.createNewContext(clientId);
        }

        return context;
    }

    /**
   * Crea un nuevo contexto de conversación
   * @param {string} clientId - ID del cliente
   * @returns {Object} Nuevo contexto
   */
    createNewContext(clientId) {
        const context = {
            clientId,
            messages: [],
            entities: {
                phoneModel: null,
                repairType: null,
                qualityType: null,
                lastMentionedPrice: null,
                lastMentionedTime: null
            },
            currentTopic: null,
            lastIntent: null,
            lastUpdate: Date.now(),
            conversationStage: 'initial' // initial, ongoing, closing
        };

        this.conversationCache.set(clientId, context);
        logger.info(`Nuevo contexto creado para ${clientId}`);
        return context;
    }

    /**
   * Actualiza el contexto con un nuevo mensaje
   * @param {string} clientId - ID del cliente
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} intent - Intención detectada
   * @param {string} botResponse - Respuesta del bot
   * @returns {Object} Contexto actualizado
   */
    updateContext(clientId, userMessage, intent, botResponse) {
        let context = this.getContext(clientId);

        // Verificar si el mensaje resetea el contexto
        if (this.shouldResetContext(userMessage)) {
            logger.info(`Reseteando contexto para ${clientId} por palabra clave`);
            context = this.createNewContext(clientId);
        }

        // Agregar mensaje al historial
        const messageEntry = {
            user: userMessage,
            intent,
            bot: botResponse,
            timestamp: Date.now(),
            entities: this.extractEntities(userMessage)
        };

        context.messages.push(messageEntry);

        // Mantener solo los últimos N mensajes
        if (context.messages.length > this.config.maxMessagesInContext) {
            context.messages = context.messages.slice(
                -this.config.maxMessagesInContext
            );
        }

        // Actualizar entidades del contexto
        this.updateContextEntities(context, messageEntry);

        // Actualizar tema y estado
        context.currentTopic = this.inferCurrentTopic(context);
        context.lastIntent = intent;
        context.lastUpdate = Date.now();
        context.conversationStage = this.inferConversationStage(context);

        // Guardar contexto actualizado
        this.conversationCache.set(clientId, context);

        logger.debug(`Contexto actualizado para ${clientId}`, {
            messagesCount: context.messages.length,
            currentTopic: context.currentTopic,
            entities: context.entities
        });

        return context;
    }

    /**
   * Resuelve referencias anafóricas en el mensaje del usuario
   * @param {string} clientId - ID del cliente
   * @param {string} userMessage - Mensaje con posibles referencias
   * @returns {string} Mensaje con referencias resueltas
   */
    resolveAnaphora(clientId, userMessage) {
        const context = this.getContext(clientId);

        if (!context.entities.phoneModel && !context.entities.repairType) {
            return userMessage; // No hay contexto suficiente
        }

        // Detectar si el mensaje contiene referencias anafóricas
        const hasAnaphora = this.config.anaphoricanWords.some((word) =>
            userMessage.toLowerCase().includes(word)
        );

        if (!hasAnaphora) {
            return userMessage;
        }

        let resolvedMessage = userMessage;

        // Resolver referencias específicas
        const resolutions = {
            genérica: `pantalla genérica para ${context.entities.phoneModel || 'el dispositivo'}`,
            original: `pantalla original para ${context.entities.phoneModel || 'el dispositivo'}`,
            ese: context.entities.phoneModel || 'ese dispositivo',
            esa: context.entities.repairType || 'esa reparación',
            'más barata': `opción más barata de ${context.entities.repairType || 'reparación'} para ${context.entities.phoneModel || 'el dispositivo'}`,
            'más cara': `opción premium de ${context.entities.repairType || 'reparación'} para ${context.entities.phoneModel || 'el dispositivo'}`,
            también: `también para ${context.entities.phoneModel || 'el dispositivo'}`,
            otra: `otra opción de ${context.entities.repairType || 'reparación'} para ${context.entities.phoneModel || 'el dispositivo'}`
        };

        // Aplicar resoluciones
        for (const [anaphora, resolution] of Object.entries(resolutions)) {
            if (userMessage.toLowerCase().includes(anaphora)) {
                resolvedMessage = userMessage.replace(
                    new RegExp(anaphora, 'gi'),
                    resolution
                );

                logger.info(
                    `Anáfora resuelta para ${clientId}: "${anaphora}" -> "${resolution}"`
                );
                break;
            }
        }

        return resolvedMessage;
    }

    /**
   * Genera un contexto enriquecido para el agente
   * @param {string} clientId - ID del cliente
   * @returns {string} Contexto formateado para el agente
   */
    getEnrichedContextForAgent(clientId) {
        const context = this.getContext(clientId);

        if (context.messages.length === 0) {
            return '';
        }

        let contextString = '\n**CONTEXTO CONVERSACIONAL:**\n';

        // Información de entidades actuales
        if (context.entities.phoneModel || context.entities.repairType) {
            contextString += `📱 Dispositivo en conversación: ${context.entities.phoneModel || 'No especificado'}\n`;
            contextString += `🔧 Tipo de reparación: ${context.entities.repairType || 'No especificado'}\n`;

            if (context.entities.qualityType) {
                contextString += `⭐ Calidad buscada: ${context.entities.qualityType}\n`;
            }

            if (context.entities.lastMentionedPrice) {
                contextString += `💰 Último precio mencionado: ${context.entities.lastMentionedPrice}\n`;
            }
        }

        // Último intercambio (más relevante)
        if (context.messages.length > 0) {
            const lastMessage = context.messages[context.messages.length - 1];
            contextString += `\n**ÚLTIMO INTERCAMBIO:**\n`;
            contextString += `Usuario: "${lastMessage.user}"\n`;
            contextString += `Mi respuesta: "${lastMessage.bot}"\n`;
        }

        // Tema actual
        if (context.currentTopic) {
            contextString += `\n🎯 Tema actual: ${context.currentTopic}\n`;
        }

        contextString +=
      '\n**INSTRUCCIÓN:** Usa este contexto para entender referencias como "esa", "la genérica", "también", etc. Mantén la continuidad de la conversación.';

        return contextString;
    }

    /**
   * Verifica si un mensaje debe resetear el contexto
   * @param {string} message - Mensaje del usuario
   * @returns {boolean} True si debe resetear
   */
    shouldResetContext(message) {
        const lowerMessage = message.toLowerCase();
        return this.config.contextResetWords.some((word) =>
            lowerMessage.includes(word)
        );
    }

    /**
   * Extrae entidades de un mensaje usando fuzzy matching
   * @param {string} message - Mensaje del usuario
   * @returns {Object} Entidades extraídas
   */
    extractEntities(message) {
        const entities = {};

        // Usar fuzzy matching para extracción más robusta
        const normalizedQuery = normalizeQuery(message);

        // Extraer modelo de teléfono con fuzzy matching
        if (normalizedQuery.device && normalizedQuery.device.confidence > 0.6) {
            entities.phoneModel = normalizedQuery.device.normalized;
            entities.phoneModelOriginal = normalizedQuery.device.original;
            entities.phoneModelConfidence = normalizedQuery.device.confidence;
        }

        // Extraer tipo de reparación con fuzzy matching
        if (normalizedQuery.repair && normalizedQuery.repair.confidence > 0.6) {
            entities.repairType = normalizedQuery.repair.normalized;
            entities.repairTypeOriginal = normalizedQuery.repair.original;
            entities.repairTypeConfidence = normalizedQuery.repair.confidence;
        }

        // Extraer tipo de calidad con fuzzy matching
        if (normalizedQuery.quality && normalizedQuery.quality.confidence > 0.6) {
            entities.qualityType = normalizedQuery.quality.normalized;
            entities.qualityTypeOriginal = normalizedQuery.quality.original;
            entities.qualityTypeConfidence = normalizedQuery.quality.confidence;
        }

        // Extraer precios mencionados (sin cambios)
        const priceMatch = message.match(
            /\$?(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\s*pesos?/i
        );
        if (priceMatch) {
            entities.price = priceMatch[1];
        }

        // Log de entidades extraídas con fuzzy matching
        if (Object.keys(entities).length > 0) {
            logger.debug('Entidades extraídas con fuzzy matching:', entities);
        }

        return entities;
    }

    /**
   * Actualiza las entidades del contexto con nuevas entidades
   * @param {Object} context - Contexto actual
   * @param {Object} messageEntry - Nueva entrada de mensaje
   */
    updateContextEntities(context, messageEntry) {
        const newEntities = messageEntry.entities;

        // Actualizar entidades si se encontraron nuevas
        if (newEntities.phoneModel) {
            context.entities.phoneModel = newEntities.phoneModel;
        }

        if (newEntities.repairType) {
            context.entities.repairType = newEntities.repairType;
        }

        if (newEntities.qualityType) {
            context.entities.qualityType = newEntities.qualityType;
        }

        if (newEntities.price) {
            context.entities.lastMentionedPrice = newEntities.price;
        }
    }

    /**
   * Infiere el tema actual de la conversación
   * @param {Object} context - Contexto actual
   * @returns {string} Tema inferido
   */
    inferCurrentTopic(context) {
        if (!context.entities.phoneModel && !context.entities.repairType) {
            return 'consulta_general';
        }

        if (context.entities.phoneModel && context.entities.repairType) {
            return `reparacion_${context.entities.repairType}_${context.entities.phoneModel}`;
        }

        if (context.entities.phoneModel) {
            return `consulta_${context.entities.phoneModel}`;
        }

        if (context.entities.repairType) {
            return `reparacion_${context.entities.repairType}`;
        }

        return 'conversacion_activa';
    }

    /**
   * Infiere la etapa de la conversación
   * @param {Object} context - Contexto actual
   * @returns {string} Etapa de la conversación
   */
    inferConversationStage(context) {
        if (context.messages.length === 1) {
            return 'initial';
        }

        const lastIntent = context.lastIntent;
        if (['despedida', 'agradecimiento'].includes(lastIntent)) {
            return 'closing';
        }

        if (context.entities.phoneModel && context.entities.repairType) {
            return 'specific_inquiry';
        }

        return 'ongoing';
    }

    /**
   * Obtiene estadísticas del contexto conversacional
   * @returns {Object} Estadísticas
   */
    getStats() {
        return {
            activeConversations: this.conversationCache.size(),
            cacheMetrics: this.conversationCache.getMetrics(),
            config: this.config
        };
    }

    /**
   * Limpia contextos expirados manualmente
   * @returns {number} Número de contextos limpiados
   */
    cleanupExpiredContexts() {
        const now = Date.now();
        let cleaned = 0;

        this.conversationCache.forEach((context, clientId) => {
            if (now - context.lastUpdate > this.config.maxContextAge) {
                this.conversationCache.delete(clientId);
                cleaned++;
            }
        });

        if (cleaned > 0) {
            logger.info(
                `Limpieza de contextos: ${cleaned} contextos expirados eliminados`
            );
        }

        return cleaned;
    }
}

// Singleton instance
const conversationContext = new ConversationContext();

module.exports = conversationContext;
