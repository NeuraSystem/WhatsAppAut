/**
 * @file ContextAwareResponseGenerator.js
 * @description Generador de respuestas consciente del contexto que crea respuestas personalizadas
 * @module core/intelligence/ContextAwareResponseGenerator
 * @version 1.0.0
 * @author Claude (Anthropic AI) & Gemini (Google AI)
 * @date 2025-07-17
 */

const logger = require('../../utils/logger');
const config = require('../../../config/config');

/**
 * Generador que crea respuestas personalizadas basadas en contexto del cliente,
 * historial de conversación, horario, y tipo de consulta.
 * Esta es la versión completa y ensamblada.
 */
class ContextAwareResponseGenerator {
    constructor() {
        this.contextDatabase = new Map(); // clienteId -> contexto
        this.responseTemplates = new Map(); // tipo -> plantillas
        this.businessContext = null;
        this.conversationMemory = new Map(); // clienteId -> historial reciente

        this.metrics = {
            responsesGenerated: 0,
            personalizedResponses: 0,
            contextualResponses: 0,
            templateUsage: new Map()
        };

        this.MEMORY_WINDOW = 5; // Recordar últimas 5 interacciones
        this.PERSONALIZATION_THRESHOLD = 0.7; // Confianza mínima para personalización

        this.initializeTemplates();
        this.addAdditionalTemplates(); // Cargar todas las plantillas
        this.loadBusinessContext();

        logger.info('🧠 ContextAwareResponseGenerator inicializado');
    }

    /**
   * Genera una respuesta consciente del contexto
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Promise<Object>} - Respuesta generada con metadatos
   */
    async generateResponse(requestData) {
        const startTime = Date.now();

        try {
            // 1. Analizar contexto del cliente
            const clientContext = await this.analyzeClientContext(requestData);

            // 2. Determinar tipo de respuesta necesaria
            const responseType = this.determineResponseType(
                requestData,
                clientContext
            );

            // 3. Obtener contexto temporal (horario, día, etc.)
            const temporalContext = this.getTemporalContext();

            // 4. Recuperar historial de conversación
            const conversationHistory = this.getConversationHistory(
                requestData.clientId
            );

            // 5. Generar respuesta personalizada
            const response = await this.createPersonalizedResponse({
                requestData,
                clientContext,
                responseType,
                temporalContext,
                conversationHistory
            });

            // 6. Actualizar memoria de conversación
            this.updateConversationMemory(
                requestData.clientId,
                requestData,
                response
            );

            // 7. Actualizar métricas
            this.updateMetrics(responseType, response);

            const responseTime = Date.now() - startTime;

            logger.info('🎨 Respuesta contextual generada', {
                clientId: requestData.clientId?.substr(-4) || 'anon',
                responseType,
                personalized: response.metadata.personalized,
                responseTime: `${responseTime}ms`
            });

            return {
                success: true,
                response: response.text,
                metadata: {
                    ...response.metadata,
                    responseTime,
                    contextualFactors: response.contextualFactors
                }
            };
        } catch (error) {
            logger.error('❌ Error generando respuesta contextual:', error);

            // Fallback a respuesta genérica
            const fallbackResponse = await this.generateFallbackResponse(requestData);

            return {
                success: false,
                response: fallbackResponse,
                metadata: {
                    responseTime: Date.now() - startTime,
                    fallback: true,
                    error: error.message
                }
            };
        }
    }

    /**
   * Analiza el contexto del cliente
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Promise<Object>} - Contexto del cliente
   */
    async analyzeClientContext(requestData) {
        const clientId = requestData.clientId;

        // Obtener contexto existente o crear nuevo
        let context = this.contextDatabase.get(clientId) || {
            clientId,
            name: requestData.customerInfo?.name || null,
            phone: requestData.customerInfo?.phone || requestData.from,
            preferences: {},
            history: {
                totalInteractions: 0,
                lastInteraction: null,
                commonQueries: [],
                preferredTimeSlots: [],
                deviceTypes: new Set(),
                serviceTypes: new Set()
            },
            personality: {
                communicationStyle: 'formal', // formal | casual | friendly
                responseLength: 'medium', // short | medium | long
                technicalLevel: 'basic', // basic | intermediate | advanced
                urgencyLevel: 'normal' // normal | high
            },
            customerType: 'new' // new | returning | vip
        };

        // Actualizar contexto con nueva información
        context = await this.updateClientContext(context, requestData);

        // Enriquecer con análisis de comportamiento
        context = this.enrichClientBehavior(context, requestData);

        // Guardar contexto actualizado
        this.contextDatabase.set(clientId, context);

        return context;
    }

    /**
   * Actualiza el contexto del cliente con nueva información
   * @param {Object} context - Contexto existente
   * @param {Object} requestData - Nuevos datos
   * @returns {Promise<Object>} - Contexto actualizado
   */
    async updateClientContext(context, requestData) {
        const now = Date.now();
        const currentHour = new Date().getHours();

        // Actualizar historial básico
        context.history.totalInteractions++;
        context.history.lastInteraction = now;

        // Analizar tipo de dispositivo mencionado
        const deviceType = this.extractDeviceType(requestData.query);
        if (deviceType) {
            context.history.deviceTypes.add(deviceType);
        }

        // Analizar tipo de servicio
        const serviceType = this.extractServiceType(requestData.query);
        if (serviceType) {
            context.history.serviceTypes.add(serviceType);
        }

        // Registrar horario preferido
        if (!context.history.preferredTimeSlots.includes(currentHour)) {
            context.history.preferredTimeSlots.push(currentHour);
            // Mantener solo últimos 10 horarios
            if (context.history.preferredTimeSlots.length > 10) {
                context.history.preferredTimeSlots.shift();
            }
        }

        // Analizar estilo de comunicación del mensaje
        const communicationStyle = this.analyzeCommunicationStyle(
            requestData.query
        );
        if (
            communicationStyle &&
      communicationStyle !== context.personality.communicationStyle
        ) {
            context.personality.communicationStyle = communicationStyle;
        }

        // Determinar tipo de cliente
        if (context.history.totalInteractions >= 5) {
            context.customerType = 'returning';
        }
        if (context.history.totalInteractions >= 15) {
            context.customerType = 'vip';
        }

        // Actualizar nombre si está disponible
        if (requestData.customerInfo?.name && !context.name) {
            context.name = requestData.customerInfo.name;
        }

        return context;
    }

    /**
   * Determina el tipo de respuesta necesaria
   * @param {Object} requestData - Datos de la solicitud
   * @param {Object} clientContext - Contexto del cliente
   * @returns {String} - Tipo de respuesta
   */
    determineResponseType(requestData, clientContext) {
        const query = requestData.query.toLowerCase();

        // Tipos específicos de consulta
        if (
            query.includes('precio') ||
      query.includes('costo') ||
      query.includes('cuanto')
        ) {
            return 'pricing_inquiry';
        }
        if (
            query.includes('horario') ||
      query.includes('hora') ||
      query.includes('abierto')
        ) {
            return 'hours_inquiry';
        }
        if (
            query.includes('ubicacion') ||
      query.includes('direccion') ||
      query.includes('donde')
        ) {
            return 'location_inquiry';
        }
        if (
            query.includes('cita') ||
      query.includes('agendar') ||
      query.includes('reservar')
        ) {
            return 'appointment_request';
        }
        if (query.includes('garantia') || query.includes('warranty')) {
            return 'warranty_inquiry';
        }
        if (
            query.includes('reparar') ||
      query.includes('arreglar') ||
      query.includes('componer')
        ) {
            return 'repair_inquiry';
        }
        if (
            query.includes('hola') ||
      query.includes('buenos') ||
      query.includes('buenas')
        ) {
            return 'greeting';
        }
        if (query.includes('gracias') || query.includes('thank')) {
            return 'gratitude';
        }
        if (
            query.includes('ayuda') ||
      query.includes('help') ||
      query.includes('auxilio')
        ) {
            return 'help_request';
        }

        return 'general_inquiry';
    }

    /**
   * Obtiene contexto temporal actual
   * @returns {Object} - Contexto temporal
   */
    getTemporalContext() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const dayName = [
            'domingo',
            'lunes',
            'martes',
            'miércoles',
            'jueves',
            'viernes',
            'sábado'
        ][day];

        let timeOfDay;
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        let businessStatus;
        if (day >= 1 && day <= 6) {
            // Monday to Saturday
            if (hour >= 11 && hour < 21) {
                businessStatus = 'open';
            } else {
                businessStatus = 'closed';
            }
        } else {
            // Sunday
            if (hour >= 12 && hour < 17) {
                businessStatus = 'open';
            } else {
                businessStatus = 'closed';
            }
        }

        return {
            hour,
            day,
            dayName,
            timeOfDay,
            businessStatus,
            isWeekend: day === 0 || day === 6,
            timestamp: now.toISOString()
        };
    }

    /**
   * Crea respuesta personalizada
   * @param {Object} contextData - Todos los datos de contexto
   * @returns {Promise<Object>} - Respuesta personalizada
   */
    async createPersonalizedResponse(contextData) {
        const {
            requestData,
            clientContext,
            responseType,
            temporalContext,
            conversationHistory
        } = contextData;

        // Obtener plantilla base
        const template = this.getResponseTemplate(responseType, clientContext);

        // Crear variables de personalización
        const personalizationVars = this.createPersonalizationVariables({
            clientContext,
            temporalContext,
            conversationHistory,
            requestData
        });

        // Generar respuesta usando plantilla y variables
        let responseText = await this.populateTemplate(
            template,
            personalizationVars
        );

        // Analizar sentimiento y ajustar respuesta
        const sentimentAnalysis = this.analyzeSentiment(requestData.query);
        responseText = this.applySentimentAdjustments(
            responseText,
            sentimentAnalysis
        );

        // Aplicar ajustes de estilo según el cliente
        const styledResponse = this.applyPersonalityStyle(
            responseText,
            clientContext.personality
        );

        // Agregar elementos contextuales específicos
        const contextualResponse = await this.addContextualElements(
            styledResponse,
            contextData
        );

        return {
            text: contextualResponse,
            metadata: {
                responseType,
                personalized:
          personalizationVars.personalizationLevel >
          this.PERSONALIZATION_THRESHOLD,
                templateUsed: template.id,
                personalizationLevel: personalizationVars.personalizationLevel,
                contextualFactors: Object.keys(personalizationVars).filter(
                    (k) => k !== 'personalizationLevel'
                ),
                sentiment: sentimentAnalysis
            },
            contextualFactors: {
                clientName: clientContext.name,
                customerType: clientContext.customerType,
                timeOfDay: temporalContext.timeOfDay,
                businessStatus: temporalContext.businessStatus,
                previousInteractions: clientContext.history.totalInteractions
            }
        };
    }

    /**
   * Crea variables de personalización
   * @param {Object} contextInfo - Información de contexto
   * @returns {Object} - Variables de personalización
   */
    createPersonalizationVariables(contextInfo) {
        const { clientContext, temporalContext, conversationHistory } = contextInfo;

        // Saludo personalizado
        let greeting = '';
        if (clientContext.name) {
            if (temporalContext.timeOfDay === 'morning') {
                greeting = `Buenos días, ${clientContext.name}`;
            } else if (
                temporalContext.timeOfDay === 'afternoon' ||
        temporalContext.timeOfDay === 'evening'
            ) {
                greeting = `Buenas tardes, ${clientContext.name}`;
            } else {
                greeting = `Hola, ${clientContext.name}`;
            }
        } else {
            if (temporalContext.timeOfDay === 'morning') {
                greeting = 'Buenos días';
            } else if (
                temporalContext.timeOfDay === 'afternoon' ||
        temporalContext.timeOfDay === 'evening'
            ) {
                greeting = 'Buenas tardes';
            } else {
                greeting = 'Hola';
            }
        }

        // Referencia a historial si aplica
        let historyReference = '';
        if (
            clientContext.customerType === 'returning' &&
      conversationHistory.length > 0
        ) {
            historyReference = 'Como siempre, estoy aquí para ayudarte.';
        } else if (clientContext.customerType === 'vip') {
            historyReference = 'Es un gusto verte de nuevo por aquí.';
        }

        // Estado del negocio
        let businessStatusInfo = '';
        if (temporalContext.businessStatus === 'open') {
            businessStatusInfo = 'Estamos abiertos y listos para atenderte.';
        } else {
            businessStatusInfo = `Actualmente estamos cerrados, pero puedes escribirnos y te responderemos cuando abramos (${this.businessContext.hours}).`;
        }

        // Nivel de personalización (0-1)
        let personalizationLevel = 0.3; // Base
        if (clientContext.name) personalizationLevel += 0.2;
        if (clientContext.customerType !== 'new') personalizationLevel += 0.2;
        if (conversationHistory.length > 0) personalizationLevel += 0.2;
        if (clientContext.history.totalInteractions > 3)
            personalizationLevel += 0.1;

        return {
            greeting,
            clientName: clientContext.name || '',
            historyReference,
            businessStatusInfo,
            customerType: clientContext.customerType,
            timeOfDay: temporalContext.timeOfDay,
            dayName: temporalContext.dayName,
            businessName: this.businessContext.name,
            businessAddress: this.businessContext.address,
            businessHours: this.businessContext.hours,
            personalizationLevel: Math.min(personalizationLevel, 1.0)
        };
    }

    /**
   * Obtiene plantilla de respuesta según tipo y contexto
   * @param {String} responseType - Tipo de respuesta
   * @param {Object} clientContext - Contexto del cliente
   * @returns {Object} - Plantilla seleccionada
   */
    getResponseTemplate(responseType, clientContext) {
        const templates =
      this.responseTemplates.get(responseType) ||
      this.responseTemplates.get('general_inquiry');

        // Seleccionar plantilla según estilo de comunicación del cliente
        const style = clientContext.personality.communicationStyle;
        const selectedTemplate =
      templates.find((t) => t.style === style) || templates[0];

        return selectedTemplate;
    }

    /**
   * Rellena plantilla con variables de personalización
   * @param {Object} template - Plantilla seleccionada
   * @param {Object} vars - Variables de personalización
   * @returns {Promise<String>} - Texto con variables sustituidas
   */
    async populateTemplate(template, vars) {
        let responseText = template.text;

        // Sustituir variables en el texto
        Object.entries(vars).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            responseText = responseText.replace(
                new RegExp(placeholder, 'g'),
                value || ''
            );
        });

        // Limpiar espacios y líneas vacías extras
        responseText = responseText
            .replace(/\s+/g, ' ')
            .replace(/\.\s+\./g, '.')
            .trim();

        return responseText;
    }

    /**
   * Aplica estilo de personalidad a la respuesta
   * @param {String} responseText - Texto base
   * @param {Object} personality - Configuración de personalidad
   * @returns {String} - Texto con estilo aplicado
   */
    applyPersonalityStyle(responseText, personality) {
        let styledText = responseText;

        // Ajustar según estilo de comunicación
        switch (personality.communicationStyle) {
        case 'casual':
            styledText = styledText
                .replace(/estimado cliente/gi, 'amigo')
                .replace(/le informamos/gi, 'te cuento')
                .replace(/usted/gi, 'tú');
            break;

        case 'friendly':
            styledText = styledText
                .replace(/estimado cliente/gi, 'querido cliente')
                .replace(/le ayudo/gi, 'te ayudo con mucho gusto');
            break;

        case 'formal':
        default:
        // Mantener estilo formal por defecto
            break;
        }

        // Ajustar longitud según preferencia
        if (personality.responseLength === 'short') {
            // Simplificar respuesta
            styledText = styledText
                .replace(/\. [^.]*detalles[^.]*\./g, '.')
                .replace(/\. [^.]*información adicional[^.]*\./g, '.');
        }

        return styledText;
    }

    /**
   * Agrega elementos contextuales específicos
   * @param {String} baseResponse - Respuesta base
   * @param {Object} contextData - Datos de contexto
   * @returns {Promise<String>} - Respuesta con elementos contextuales
   */
    async addContextualElements(baseResponse, contextData) {
        let enhancedResponse = baseResponse;
        const { temporalContext, clientContext, requestData } = contextData;

        // Agregar información de estado del negocio si es relevante
        if (
            temporalContext.businessStatus === 'closed' &&
      requestData.query.toLowerCase().includes('venir')
        ) {
            enhancedResponse += ` Ten en cuenta que abrimos ${this.businessContext.hours}.`;
        }

        // Agregar sugerencia de cita si es cliente recurrente
        if (
            clientContext.customerType === 'returning' &&
      !requestData.query.toLowerCase().includes('cita')
        ) {
            enhancedResponse +=
        ' ¿Te gustaría que te agende una cita para que no esperes?';
        }

        // Agregar información de garantía si es reparación
        if (
            requestData.query.toLowerCase().includes('reparar') &&
      !requestData.query.toLowerCase().includes('garantia')
        ) {
            enhancedResponse +=
        ' Todas nuestras reparaciones incluyen garantía de 30 días.';
        }

        return enhancedResponse;
    }

    /**
   * Actualiza memoria de conversación
   * @param {String} clientId - ID del cliente
   * @param {Object} requestData - Datos de la solicitud
   * @param {Object} response - Respuesta generada
   */
    updateConversationMemory(clientId, requestData, response) {
        let memory = this.conversationMemory.get(clientId) || [];

        // Agregar nueva interacción
        memory.push({
            timestamp: Date.now(),
            userQuery: requestData.query,
            responseType: response.metadata.responseType,
            personalized: response.metadata.personalized
        });

        // Mantener solo las últimas N interacciones
        if (memory.length > this.MEMORY_WINDOW) {
            memory = memory.slice(-this.MEMORY_WINDOW);
        }

        this.conversationMemory.set(clientId, memory);
    }

    /**
   * Obtiene historial de conversación
   * @param {String} clientId - ID del cliente
   * @returns {Array} - Historial de conversación
   */
    getConversationHistory(clientId) {
        return this.conversationMemory.get(clientId) || [];
    }

    /**
   * Actualiza métricas del sistema
   * @param {String} responseType - Tipo de respuesta
   * @param {Object} response - Respuesta generada
   */
    updateMetrics(responseType, response) {
        this.metrics.responsesGenerated++;

        if (response.metadata.personalized) {
            this.metrics.personalizedResponses++;
        }

        if (response.metadata.personalizationLevel > 0.5) {
            this.metrics.contextualResponses++;
        }

        // Actualizar uso de plantillas
        const templateId = response.metadata.templateUsed;
        this.metrics.templateUsage.set(
            templateId,
            (this.metrics.templateUsage.get(templateId) || 0) + 1
        );
    }

    /**
   * Genera respuesta de fallback
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Promise<String>} - Respuesta de fallback
   */
    async generateFallbackResponse(requestData) {
        const temporalContext = this.getTemporalContext();

        let greeting = '';
        if (temporalContext.timeOfDay === 'morning') {
            greeting = 'Buenos días';
        } else if (temporalContext.timeOfDay === 'afternoon') {
            greeting = 'Buenas tardes';
        } else {
            greeting = 'Hola';
        }

        return (
            `${greeting}. Disculpa, estoy teniendo dificultades técnicas para procesar tu consulta. ` +
      `¿Podrías reformular tu pregunta? Estoy aquí para ayudarte con información sobre ` +
      `reparaciones, precios, horarios y citas en ${this.businessContext.name}.`
        );
    }

    /**
   * Métodos de análisis y extracción
   */
    extractDeviceType(query) {
        const devicePatterns = {
            iPhone: /iphone/i,
            Samsung: /samsung|galaxy/i,
            Xiaomi: /xiaomi|redmi/i,
            Huawei: /huawei/i,
            Motorola: /motorola|moto/i,
            LG: /\blg\b/i,
            Nokia: /nokia/i
        };

        for (const [type, pattern] of Object.entries(devicePatterns)) {
            if (pattern.test(query)) return type;
        }

        return null;
    }

    extractServiceType(query) {
        const servicePatterns = {
            pantalla: /pantalla|display|screen|tactil/i,
            bateria: /bateria|battery|carga/i,
            camara: /camara|camera|foto/i,
            puerto: /puerto|charging|cargador/i,
            audio: /parlante|microfono|sonido|audio/i,
            general: /reparar|arreglar|componer/i
        };

        for (const [type, pattern] of Object.entries(servicePatterns)) {
            if (pattern.test(query)) return type;
        }

        return null;
    }

    analyzeCommunicationStyle(query) {
        const formalIndicators = /estimado|cordial|agradecer|solicitar/i;
        const casualIndicators = /que tal|que onda|oye|we\b/i;
        const friendlyIndicators = /hola.*como.*estas|buenos.*dias.*como/i;

        if (casualIndicators.test(query)) return 'casual';
        if (friendlyIndicators.test(query)) return 'friendly';
        if (formalIndicators.test(query)) return 'formal';

        return null; // No cambiar estilo existente
    }

    /**
   * Inicializa plantillas de respuesta base
   */
    initializeTemplates() {
    // Plantillas para consultas de precios
        this.responseTemplates.set('pricing_inquiry', [
            {
                id: 'pricing_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} El precio para la reparación que consultas es información que nuestro especialista puede confirmarte con precisión. {businessStatusInfo} ¿Te gustaría que te agende una cita para una evaluación gratuita?'
            },
            {
                id: 'pricing_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} Para darte el precio exacto necesito que nuestro técnico revise tu equipo. {businessStatusInfo} ¿Qué te parece si agendamos una cita?'
            },
            {
                id: 'pricing_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} Me da mucho gusto ayudarte con el precio. Para darte una cotización precisa, nuestro técnico necesita revisar tu dispositivo. {businessStatusInfo} ¿Te conviene agendar una cita?'
            }
        ]);

        // Plantillas para consultas de horarios
        this.responseTemplates.set('hours_inquiry', [
            {
                id: 'hours_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Nuestros horarios de atención en {businessName} son: {businessHours}. {businessStatusInfo}'
            },
            {
                id: 'hours_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} Estamos abiertos {businessHours}. {businessStatusInfo}'
            },
            {
                id: 'hours_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} Nos da mucho gusto atenderte. Nuestros horarios son {businessHours}. {businessStatusInfo}'
            }
        ]);

        // Plantillas para saludos
        this.responseTemplates.set('greeting', [
            {
                id: 'greeting_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Bienvenido a {businessName}. ¿En qué puedo asistirle hoy?'
            },
            {
                id: 'greeting_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} ¿Cómo te puedo ayudar?'
            },
            {
                id: 'greeting_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} Es un placer saludarte. ¿En qué puedo ayudarte hoy?'
            }
        ]);

        // Plantilla genérica
        this.responseTemplates.set('general_inquiry', [
            {
                id: 'general_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Estoy aquí para ayudarle con información sobre nuestros servicios de reparación en {businessName}. {businessStatusInfo} ¿Podría proporcionarme más detalles sobre su consulta?'
            }
        ]);

        logger.debug('📝 Plantillas de respuesta inicializadas');
    }

    /**
   * Carga contexto del negocio desde la configuración
   */
    async loadBusinessContext() {
        try {
            // Simulación de carga desde un archivo de configuración
            this.businessContext = {
                name: config.business.name || 'Salva Cell',
                address:
          config.business.address ||
          'Av. C. del Refugio, fraccionamiento Valle de las Misiones',
                hours:
          config.business.hours ||
          'Lunes a Sábado de 11:00 AM a 9:00 PM, Domingos de 12:00 PM a 5:00 PM',
                logoUrl: config.business.logoUrl || null
            };

            logger.info('🏢 Contexto del negocio cargado', {
                name: this.businessContext.name
            });
        } catch (error) {
            logger.error('❌ Error cargando contexto del negocio:', error);

            // Valores por defecto en caso de error
            this.businessContext = {
                name: 'Salva Cell',
                address: 'Av. C. del Refugio, fraccionamiento Valle de las Misiones',
                hours:
          'Lunes a Sábado de 11:00 AM a 9:00 PM, Domingos de 12:00 PM a 5:00 PM',
                logoUrl: null
            };
        }
    }

    /**
   * Agrega plantillas adicionales para más tipos de consulta
   */
    addAdditionalTemplates() {
    // Plantillas para consultas de ubicación
        this.responseTemplates.set('location_inquiry', [
            {
                id: 'location_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Nos encontramos en {businessAddress}. {businessStatusInfo} ¿Necesita indicaciones específicas para llegar?'
            },
            {
                id: 'location_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} Estamos en {businessAddress}. {businessStatusInfo} ¿Te ayudo con las direcciones?'
            },
            {
                id: 'location_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} Con mucho gusto te doy nuestra ubicación: {businessAddress}. {businessStatusInfo}'
            }
        ]);

        // Plantillas para solicitudes de cita
        this.responseTemplates.set('appointment_request', [
            {
                id: 'appointment_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Será un placer atenderle. Para agendar su cita, necesito algunos detalles. ¿Qué tipo de reparación requiere y cuál sería su horario preferido?'
            },
            {
                id: 'appointment_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} Perfecto, te agendo una cita. ¿Qué necesitas reparar y cuándo te conviene venir?'
            },
            {
                id: 'appointment_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} Me encanta ayudarte con tu cita. ¿Qué dispositivo vas a traer y cuándo te gustaría venir?'
            }
        ]);

        // Plantillas para consultas de garantía
        this.responseTemplates.set('warranty_inquiry', [
            {
                id: 'warranty_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Todas nuestras reparaciones incluyen garantía de 30 días contra defectos de manufactura. {businessStatusInfo} ¿Tiene alguna consulta específica sobre la garantía?'
            },
            {
                id: 'warranty_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} Claro, te damos 30 días de garantía en todas las reparaciones. {businessStatusInfo} ¿Algo específico que quieras saber?'
            }
        ]);

        // Plantillas para consultas de reparación
        this.responseTemplates.set('repair_inquiry', [
            {
                id: 'repair_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Estaremos encantados de ayudarle con la reparación de su dispositivo. {businessStatusInfo} Para brindarle un diagnóstico preciso, sería necesario revisar físicamente el equipo.'
            },
            {
                id: 'repair_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} ¡Claro que te ayudamos con la reparación! {businessStatusInfo} ¿Qué le pasó a tu equipo?'
            }
        ]);

        // Plantillas para agradecimientos
        this.responseTemplates.set('gratitude', [
            {
                id: 'gratitude_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Ha sido un placer ayudarle. Si necesita algo más, no dude en contactarnos. ¡Que tenga un excelente {dayName}!'
            },
            {
                id: 'gratitude_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} ¡De nada! Para eso estamos. ¡Que tengas un buen {dayName}!'
            },
            {
                id: 'gratitude_friendly',
                style: 'friendly',
                text: '{greeting}! {historyReference} ¡Fue un placer ayudarte! Siempre estaremos aquí cuando nos necesites. ¡Qué tengas un hermoso {dayName}!'
            }
        ]);

        // Plantillas para solicitudes de ayuda
        this.responseTemplates.set('help_request', [
            {
                id: 'help_formal',
                style: 'formal',
                text: '{greeting}. {historyReference} Estoy aquí para asistirle. Puedo ayudarle con información sobre reparaciones, precios, horarios, ubicación y agendar citas. {businessStatusInfo} ¿En qué aspecto específico puedo ayudarle?'
            },
            {
                id: 'help_casual',
                style: 'casual',
                text: '{greeting}! {historyReference} ¡Por supuesto que te ayudo! Puedo darte info sobre reparaciones, precios, horarios y hasta agendarte una cita. {businessStatusInfo} ¿Qué necesitas?'
            }
        ]);
    }

    /**
   * Enriquece el contexto del cliente con análisis de comportamiento
   * @param {Object} context - Contexto del cliente
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Object} - Contexto enriquecido
   */
    enrichClientBehavior(context, requestData) {
        const query = requestData.query.toLowerCase();

        // Análisis de urgencia
        const urgencyIndicators = [
            /urgente/i,
            /rapido/i,
            /ya/i,
            /ahora/i,
            /inmediato/i,
            /emergency/i,
            /emergencia/i,
            /pronto/i
        ];

        if (urgencyIndicators.some((pattern) => pattern.test(query))) {
            context.personality.urgencyLevel = 'high';
        }

        // Análisis de nivel técnico
        const technicalTerms = [
            /digitalizador/i,
            /lcd/i,
            /oled/i,
            /amoled/i,
            /flex/i,
            /conector/i,
            /firmware/i,
            /software/i,
            /hardware/i
        ];

        if (technicalTerms.some((pattern) => pattern.test(query))) {
            context.personality.technicalLevel = 'advanced';
        }

        // Análisis de preferencia de comunicación por longitud del mensaje
        if (requestData.query.length < 20) {
            context.personality.responseLength = 'short';
        } else if (requestData.query.length > 100) {
            context.personality.responseLength = 'long';
        }

        return context;
    }

    /**
   * Analiza sentimiento del mensaje del cliente
   * @param {String} query - Consulta del cliente
   * @returns {Object} - Análisis de sentimiento
   */
    analyzeSentiment(query) {
        const positiveWords = [
            /gracias/i,
            /excelente/i,
            /perfecto/i,
            /genial/i,
            /bueno/i,
            /contento/i,
            /feliz/i,
            /satisfecho/i
        ];

        const negativeWords = [
            /molesto/i,
            /enojado/i,
            /furioso/i,
            /malo/i,
            /terrible/i,
            /pesimo/i,
            /horrible/i,
            /decepcionado/i,
            /frustrado/i
        ];

        let sentiment = 'neutral';
        let confidence = 0.5;

        if (positiveWords.some((pattern) => pattern.test(query))) {
            sentiment = 'positive';
            confidence = 0.8;
        } else if (negativeWords.some((pattern) => pattern.test(query))) {
            sentiment = 'negative';
            confidence = 0.8;
        }

        return { sentiment, confidence };
    }

    /**
   * Aplica ajustes según el sentimiento detectado
   * @param {String} responseText - Texto de respuesta
   * @param {Object} sentimentAnalysis - Análisis de sentimiento
   * @returns {String} - Respuesta ajustada
   */
    applySentimentAdjustments(responseText, sentimentAnalysis) {
        if (
            sentimentAnalysis.sentiment === 'negative' &&
      sentimentAnalysis.confidence > 0.7
        ) {
            // Agregar elementos de empatía y solución
            responseText =
        `Lamento escuchar que estás teniendo problemas. Entiendo tu preocupación y estoy aquí para ayudarte. ` +
        responseText;
        } else if (
            sentimentAnalysis.sentiment === 'positive' &&
      sentimentAnalysis.confidence > 0.7
        ) {
            // Mantener el tono positivo
            if (!responseText.endsWith('!')) {
                responseText = responseText.replace(
                    /\.$/,
                    '! Me alegra mucho poder ayudarte.'
                );
            }
        }
        return responseText;
    }

    /**
   * Obtener estadísticas del contexto de clientes
   * @returns {Object} - Estadísticas
   */
    getContextStats() {
        const stats = {
            totalClients: this.contextDatabase.size,
            newClients: 0,
            returningClients: 0,
            vipClients: 0,
            communicationStyles: { formal: 0, casual: 0, friendly: 0 },
            topDeviceTypes: new Map(),
            topServiceTypes: new Map(),
            averageInteractions: 0
        };

        let totalInteractions = 0;

        for (const context of this.contextDatabase.values()) {
            // Contar tipos de cliente
            switch (context.customerType) {
            case 'new':
                stats.newClients++;
                break;
            case 'returning':
                stats.returningClients++;
                break;
            case 'vip':
                stats.vipClients++;
                break;
            }

            // Contar estilos de comunicación
            stats.communicationStyles[context.personality.communicationStyle]++;

            // Contar tipos de dispositivos
            context.history.deviceTypes.forEach((device) => {
                stats.topDeviceTypes.set(
                    device,
                    (stats.topDeviceTypes.get(device) || 0) + 1
                );
            });

            // Contar tipos de servicios
            context.history.serviceTypes.forEach((service) => {
                stats.topServiceTypes.set(
                    service,
                    (stats.topServiceTypes.get(service) || 0) + 1
                );
            });

            totalInteractions += context.history.totalInteractions;
        }

        stats.averageInteractions =
      stats.totalClients > 0 ? totalInteractions / stats.totalClients : 0;

        return stats;
    }

    /**
   * Obtener métricas completas del sistema
   * @returns {Object} - Métricas del sistema
   */
    getMetrics() {
        return {
            ...this.metrics,
            personalizationRate:
        this.metrics.responsesGenerated > 0
            ? this.metrics.personalizedResponses / this.metrics.responsesGenerated
            : 0,
            contextualRate:
        this.metrics.responsesGenerated > 0
            ? this.metrics.contextualResponses / this.metrics.responsesGenerated
            : 0,
            memoryUsage: {
                contextsStored: this.contextDatabase.size,
                conversationsInMemory: this.conversationMemory.size,
                templatesLoaded: this.responseTemplates.size
            },
            topTemplates: Array.from(this.metrics.templateUsage.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }

    /**
   * Limpia datos antiguos de memoria
   * @param {Number} maxAge - Edad máxima en milisegundos
   */
    cleanupOldData(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // 7 días por defecto
        const cutoffTime = Date.now() - maxAge;
        let cleaned = 0;

        // Limpiar contextos antiguos
        for (const [clientId, context] of this.contextDatabase.entries()) {
            if (context.history.lastInteraction < cutoffTime) {
                this.contextDatabase.delete(clientId);
                this.conversationMemory.delete(clientId);
                cleaned++;
            }
        }

        logger.info('🧹 Limpieza de datos antiguos completada', {
            contextsCleaned: cleaned,
            remainingContexts: this.contextDatabase.size
        });

        return cleaned;
    }

    /**
   * Exporta contextos de clientes para respaldo
   * @returns {Object} - Datos de respaldo
   */
    exportContextData() {
        const exportData = {
            timestamp: Date.now(),
            version: '1.0.0',
            contexts: {},
            conversations: {},
            metrics: this.metrics
        };

        // Convertir Maps a objetos para serialización
        for (const [clientId, context] of this.contextDatabase.entries()) {
            exportData.contexts[clientId] = {
                ...context,
                history: {
                    ...context.history,
                    deviceTypes: Array.from(context.history.deviceTypes),
                    serviceTypes: Array.from(context.history.serviceTypes)
                }
            };
        }

        for (const [clientId, conversation] of this.conversationMemory.entries()) {
            exportData.conversations[clientId] = conversation;
        }

        return exportData;
    }

    /**
   * Importa contextos de clientes desde respaldo
   * @param {Object} exportData - Datos de respaldo
   */
    importContextData(exportData) {
        try {
            if (exportData.contexts) {
                for (const [clientId, context] of Object.entries(exportData.contexts)) {
                    // Restaurar Sets desde arrays
                    context.history.deviceTypes = new Set(
                        context.history.deviceTypes || []
                    );
                    context.history.serviceTypes = new Set(
                        context.history.serviceTypes || []
                    );

                    this.contextDatabase.set(clientId, context);
                }
            }

            if (exportData.conversations) {
                for (const [clientId, conversation] of Object.entries(
                    exportData.conversations
                )) {
                    this.conversationMemory.set(clientId, conversation);
                }
            }

            if (exportData.metrics) {
                // Restaurar métricas seleccionadas (no sobreescribir contadores actuales)
                this.metrics.templateUsage = new Map(
                    Object.entries(exportData.metrics.templateUsage || {})
                );
            }

            logger.info('📥 Datos de contexto importados exitosamente', {
                contextsImported: Object.keys(exportData.contexts || {}).length,
                conversationsImported: Object.keys(exportData.conversations || {})
                    .length
            });
        } catch (error) {
            logger.error('❌ Error importando datos de contexto:', error);
            throw error;
        }
    }

    /**
   * Optimiza plantillas basado en uso
   */
    optimizeTemplates() {
    // Identificar plantillas poco usadas
        const usageThreshold = Math.max(1, this.metrics.responsesGenerated * 0.01); // 1% del total
        const underusedTemplates = [];

        for (const [templateId, usage] of this.metrics.templateUsage.entries()) {
            if (usage < usageThreshold) {
                underusedTemplates.push(templateId);
            }
        }

        logger.info('📊 Análisis de uso de plantillas', {
            totalTemplates: this.metrics.templateUsage.size,
            underusedTemplates: underusedTemplates.length,
            usageThreshold
        });

        return {
            underusedTemplates,
            topUsedTemplates: Array.from(this.metrics.templateUsage.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10),
            optimizationSuggestions: this.generateOptimizationSuggestions()
        };
    }

    /**
   * Genera sugerencias de optimización (función placeholder)
   * @returns {Array<String>}
   */
    generateOptimizationSuggestions() {
    // Lógica futura para generar sugerencias basadas en métricas
        const suggestions = [];
        const stats = this.getContextStats();

        if (stats.topServiceTypes.size > 0) {
            const topService = Array.from(stats.topServiceTypes.entries()).sort(
                (a, b) => b[1] - a[1]
            )[0][0];
            suggestions.push(
                `Considera crear una plantilla más específica para el servicio más popular: '${topService}'.`
            );
        }

        if (this.metrics.templateUsage.size > 10) {
            suggestions.push(
                `Revisa las plantillas menos usadas para consolidar o mejorar su efectividad.`
            );
        }

        return suggestions;
    }
}

module.exports = ContextAwareResponseGenerator;
