const logger = require('../../utils/logger');
const config = require('../../../config/config');
const path = require('path');
const fs = require('fs').promises;

// Contenido de AdminEscalationSystem.js

class AdminEscalationSystem {
    constructor() {
        this.activeEscalations = new Map();
        this.adminBusy = false;
        this.escalationQueue = [];
        this.adminResponseCallbacks = new Map();
        this.timeoutHandlers = new Map();
        this.metrics = {
            totalEscalations: 0,
            resolvedEscalations: 0,
            timeoutEscalations: 0,
            averageResponseTime: 0
        };
        logger.info('🚨 AdminEscalationSystem inicializado');
    }

    needsEscalation(queryData) {
        const uncertaintyIndicators = [
            queryData.hasMedia,
            queryData.modelNotFound,
            queryData.complexPricing,
            queryData.customRequest,
            queryData.agentConfidence < 0.7
        ];
        const shouldEscalate = uncertaintyIndicators.some((indicator) => indicator === true);
        if (shouldEscalate) {
            logger.info('🔍 Escalación necesaria detectada', {
                reason: this.getEscalationReason(queryData),
                customerInfo: queryData.customerInfo
            });
        }
        return shouldEscalate;
    }

    async escalateToAdmin(escalationData, whatsappClient) {
        try {
            const consultaId = this.generateConsultaId();
            if (this.adminBusy) {
                return await this.enqueueEscalation(escalationData, consultaId);
            }
            return await this.processEscalation(escalationData, consultaId, whatsappClient);
        } catch (error) {
            logger.error('❌ Error en escalación al admin:', error);
            return 'Disculpa, hay un problema técnico. Por favor intenta más tarde.';
        }
    }

    async processEscalation(escalationData, consultaId, whatsappClient) {
        this.adminBusy = true;
        this.metrics.totalEscalations++;
        const escalationRecord = {
            consultaId,
            customerInfo: escalationData.customerInfo,
            originalQuery: escalationData.query,
            mediaAttached: escalationData.media || null,
            aiAnalysis: escalationData.aiAnalysis || 'Sin análisis automático disponible',
            startTime: Date.now(),
            status: 'waiting_admin'
        };
        this.activeEscalations.set(consultaId, escalationRecord);
        const adminMessage = this.formatAdminMessage(escalationRecord);
        await this.sendToAdmin(adminMessage, whatsappClient);
        this.setupAdminTimeout(consultaId, whatsappClient);
        const customerMessage = this.getCustomerWaitMessage(escalationData.customerInfo);
        logger.info('📤 Escalación enviada al admin', {
            consultaId,
            customer: escalationData.customerInfo.name || 'Cliente sin nombre'
        });
        return customerMessage;
    }

    async handleAdminResponse(adminResponse, responseCallback) {
        try {
            const activeEscalation = this.getCurrentEscalation();
            if (!activeEscalation) {
                logger.warn('⚠️ Respuesta del admin sin escalación activa');
                return;
            }
            this.clearAdminTimeout(activeEscalation.consultaId);
            const naturalResponse = await this.formulateNaturalResponse(adminResponse, activeEscalation);
            await responseCallback(naturalResponse);
            this.recordSuccessfulEscalation(activeEscalation);
            this.releaseAdmin();
            await this.processNextInQueue();
        } catch (error) {
            logger.error('❌ Error procesando respuesta del admin:', error);
            this.releaseAdmin();
        }
    }

    async formulateNaturalResponse(adminResponse, escalationRecord) {
        const customerName = escalationRecord.customerInfo.name || '';
        const cleanResponse = this.cleanAdminResponse(adminResponse);
        const greeting = customerName ? `Hola ${customerName}, ` : 'Hola, ';
        let naturalResponse = `${greeting}respecto a tu consulta, me informa el especialista que ${cleanResponse}.`;
        naturalResponse += ' ¿Hay algo más en lo que pueda ayudarte?';
        return naturalResponse;
    }

    cleanAdminResponse(adminResponse) {
        let cleaned = adminResponse.replace(/^(dile que|responde que|contestale que)\s*/i, '');
        cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
        return cleaned.trim();
    }

    setupAdminTimeout(consultaId, whatsappClient) {
        const timeoutHandler = setTimeout(() => {
            this.handleAdminTimeout(consultaId, whatsappClient);
        }, 5 * 60 * 1000);
        this.timeoutHandlers.set(consultaId, timeoutHandler);
    }

    async handleAdminTimeout(consultaId, whatsappClient) {
        const escalation = this.activeEscalations.get(consultaId);
        if (escalation && escalation.status === 'waiting_admin') {
            this.metrics.timeoutEscalations++;
            escalation.status = 'timed_out';
            const timeoutMessage = `Disculpa la demora. Nuestro especialista está atendiendo otra consulta en este momento, pero tu pregunta está en espera. En cuanto se libere, te contactará directamente. Gracias por tu paciencia.`;
            const customerPhone = escalation.customerInfo.phone;
            if (customerPhone && whatsappClient) {
                await whatsappClient.sendMessage(customerPhone, timeoutMessage);
            }
            logger.warn('⏰ Timeout de admin para consulta', {
                consultaId,
                customer: escalation.customerInfo.name
            });
            this.releaseAdmin();
            await this.processNextInQueue(whatsappClient);
        }
    }

    clearAdminTimeout(consultaId) {
        const timeoutHandler = this.timeoutHandlers.get(consultaId);
        if (timeoutHandler) {
            clearTimeout(timeoutHandler);
            this.timeoutHandlers.delete(consultaId);
        }
    }

    async enqueueEscalation(escalationData, consultaId) {
        this.escalationQueue.push({ escalationData, consultaId });
        const position = this.escalationQueue.length;
        return `📋 Tu consulta ha sido recibida. Hay ${position} persona(s) esperando antes que tú. Te atenderemos en cuanto nuestro especialista esté disponible. Agradecemos tu paciencia.`;
    }

    async processNextInQueue(whatsappClient) {
        if (this.escalationQueue.length > 0 && !this.adminBusy) {
            const { escalationData, consultaId } = this.escalationQueue.shift();
            logger.info('▶️ Procesando siguiente consulta en cola', { consultaId });
            await this.processEscalation(escalationData, consultaId, whatsappClient);
        }
    }

    generateConsultaId() {
        return `cons_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    getCurrentEscalation() {
        return Array.from(this.activeEscalations.values()).find((esc) => esc.status === 'waiting_admin');
    }

    releaseAdmin() {
        this.adminBusy = false;
    }

    recordSuccessfulEscalation(escalationRecord) {
        const responseTime = Date.now() - escalationRecord.startTime;
        this.metrics.resolvedEscalations++;
        const totalTime = this.metrics.averageResponseTime * (this.metrics.resolvedEscalations - 1);
        this.metrics.averageResponseTime = (totalTime + responseTime) / this.metrics.resolvedEscalations;
        this.activeEscalations.delete(escalationRecord.consultaId);
        logger.info('✅ Escalación resuelta exitosamente', {
            consultaId: escalationRecord.consultaId,
            responseTime: `${(responseTime / 1000).toFixed(1)}s`
        });
    }

    formatAdminMessage(escalationRecord) {
        const timestamp = new Date().toLocaleTimeString('es-MX');
        const customerName = escalationRecord.customerInfo.name || 'Cliente sin nombre';
        const customerPhone = escalationRecord.customerInfo.phone || 'Sin teléfono';
        let message = `*🚨 CONSULTA PARA TI [${escalationRecord.consultaId}]* 🚨\n\n`;
        message += `*De:* ${customerName} (${customerPhone})\n`;
        message += `*Pregunta:* "${escalationRecord.originalQuery}"\n`;
        if (escalationRecord.mediaAttached) {
            message += `*Adjunto:* Sí (revisa el chat original del bot)\n`;
        }
        message += `*Análisis IA:* _${escalationRecord.aiAnalysis}_\n\n`;
        message += `*Responde a este mensaje para contestarle al cliente.*`;
        return message;
    }

    async sendToAdmin(message, whatsappClient) {
        const adminNumber = config.bot.forwardingNumber;
        if (!adminNumber) {
            throw new Error('Número de administrador no configurado');
        }
        await whatsappClient.sendMessage(adminNumber, message);
        logger.info('📱 Mensaje enviado al administrador', {
            adminNumber: `...${adminNumber.slice(-4)}`
        });
    }

    getCustomerWaitMessage(customerInfo) {
        const name = customerInfo.name || '';
        const greeting = name ? `Hola ${name}, ` : '';
        return `📱 ${greeting}un momento, estoy consultando tu solicitud con nuestro especialista para darte la información más precisa. Te respondo en unos minutos.`;
    }

    getEscalationReason(queryData) {
        if (queryData.hasMedia) return 'imagen/video adjunto';
        if (queryData.modelNotFound) return 'modelo no reconocido';
        if (queryData.complexPricing) return 'consulta de precio compleja';
        if (queryData.customRequest) return 'solicitud personalizada';
        if (queryData.agentConfidence < 0.7) return 'baja confianza del agente';
        return 'razón no especificada';
    }

    getMetrics() {
        return {
            ...this.metrics,
            adminBusy: this.adminBusy,
            queueLength: this.escalationQueue.length,
            activeEscalations: this.activeEscalations.size,
            successRate: this.metrics.totalEscalations > 0 ? this.metrics.resolvedEscalations / this.metrics.totalEscalations : 0
        };
    }

    async shutdown() {
        for (const handler of this.timeoutHandlers.values()) {
            clearTimeout(handler);
        }
        this.timeoutHandlers.clear();
        this.activeEscalations.clear();
        this.escalationQueue = [];
        logger.info('🔄 AdminEscalationSystem shutdown completed');
    }
}

// Contenido de UncertaintyDetector.js

class UncertaintyDetector {
    constructor() {
        this.priceDatabase = new Map();
        this.uncertaintyThreshold = 0.7;
        this.uncertaintyIndicators = {
            media: { weight: 0.9, description: 'Imagen o video adjunto' },
            unknownModel: { weight: 0.8, description: 'Modelo de dispositivo no reconocido' },
            complexQuery: { weight: 0.6, description: 'Consulta compleja o ambigua' },
            priceNotFound: { weight: 0.7, description: 'Precio no encontrado en base de datos' },
            customRequest: { weight: 0.8, description: 'Solicitud personalizada o fuera de estándar' },
            technicalIssue: { weight: 0.6, description: 'Problema técnico específico' }
        };
        this.metrics = {
            totalAnalyses: 0,
            escalationsTriggered: 0,
            accurateDetections: 0
        };
        this.loadPriceDatabase();
        logger.info('🔍 UncertaintyDetector inicializado');
    }

    async analyzeQuery(queryData) {
        this.metrics.totalAnalyses++;
        const analysis = {
            needsEscalation: false,
            confidence: 1.0,
            reasons: [],
            escalationData: null,
            agentCapabilities: {}
        };
        try {
            const indicators = await this.detectUncertaintyIndicators(queryData);
            analysis.confidence = this.calculateConfidence(indicators);
            analysis.reasons = indicators.map((i) => i.description);
            analysis.needsEscalation = analysis.confidence < this.uncertaintyThreshold;
            if (analysis.needsEscalation) {
                analysis.escalationData = await this.prepareEscalationData(queryData, indicators);
                this.metrics.escalationsTriggered++;
                logger.info('🚨 Escalación detectada', {
                    confidence: analysis.confidence,
                    reasons: analysis.reasons,
                    customer: queryData.customerInfo?.name || 'Sin nombre'
                });
            } else {
                analysis.agentCapabilities = await this.assessAgentCapabilities(queryData);
                logger.debug('✅ Respuesta automática posible', {
                    confidence: analysis.confidence,
                    capabilities: Object.keys(analysis.agentCapabilities)
                });
            }
            return analysis;
        } catch (error) {
            logger.error('❌ Error en análisis de incertidumbre:', error);
            return {
                needsEscalation: true,
                confidence: 0.0,
                reasons: ['Error en análisis automático'],
                escalationData: await this.prepareEscalationData(queryData, [])
            };
        }
    }

    async detectUncertaintyIndicators(queryData) {
        const indicators = [];
        if (queryData.message?.hasMedia) {
            indicators.push({ type: 'media', weight: this.uncertaintyIndicators.media.weight, description: this.uncertaintyIndicators.media.description, details: { mediaType: queryData.message.mediaType, reason: 'Requiere análisis visual humano' } });
        }
        const modelAnalysis = await this.analyzeDeviceModel(queryData.query);
        if (!modelAnalysis.found) {
            indicators.push({ type: 'unknownModel', weight: this.uncertaintyIndicators.unknownModel.weight, description: this.uncertaintyIndicators.unknownModel.description, details: { extractedModel: modelAnalysis.extractedModel, suggestions: modelAnalysis.suggestions } });
        }
        const complexityAnalysis = this.analyzeQueryComplexity(queryData.query);
        if (complexityAnalysis.isComplex) {
            indicators.push({ type: 'complexQuery', weight: this.uncertaintyIndicators.complexQuery.weight, description: this.uncertaintyIndicators.complexQuery.description, details: complexityAnalysis });
        }
        if (modelAnalysis.found) {
            const priceAnalysis = await this.analyzePriceAvailability(modelAnalysis.model, queryData.query);
            if (!priceAnalysis.available) {
                indicators.push({ type: 'priceNotFound', weight: this.uncertaintyIndicators.priceNotFound.weight, description: this.uncertaintyIndicators.priceNotFound.description, details: priceAnalysis });
            }
        }
        const customRequestAnalysis = this.detectCustomRequests(queryData.query);
        if (customRequestAnalysis.isCustom) {
            indicators.push({ type: 'customRequest', weight: this.uncertaintyIndicators.customRequest.weight, description: this.uncertaintyIndicators.customRequest.description, details: customRequestAnalysis });
        }
        const technicalAnalysis = this.analyzeTechnicalComplexity(queryData.query);
        if (technicalAnalysis.requiresExpertise) {
            indicators.push({ type: 'technicalIssue', weight: this.uncertaintyIndicators.technicalIssue.weight, description: this.uncertaintyIndicators.technicalIssue.description, details: technicalAnalysis });
        }
        return indicators;
    }

    async analyzeDeviceModel(query) {
        const queryLower = query.toLowerCase();
        const modelPatterns = [/iphone\s*(\d+(?:\s*pro(?:\s*max)?)?)/i, /samsung\s*([a-z]\d+(?:\s*[a-z]*)?)/i, /galaxy\s*([a-z]\d+(?:\s*[a-z]*)?)/i, /xiaomi\s*([a-z]*\s*\d+(?:[a-z]*)?)/i];
        let extractedModel = null;
        let brand = null;
        for (const pattern of modelPatterns) {
            const match = queryLower.match(pattern);
            if (match) {
                brand = this.extractBrand(match[0]);
                extractedModel = match[1]?.trim();
                break;
            }
        }
        if (!extractedModel) {
            return { found: false, extractedModel: null, suggestions: [] };
        }
        const modelExists = await this.checkModelInDatabase(brand, extractedModel);
        return { found: modelExists, brand, model: extractedModel, normalizedModel: this.normalizeModel(extractedModel) };
    }

    analyzeQueryComplexity(query) {
        const complexityFactors = {
            multipleQuestions: (query.match(/\\?/g) || []).length > 1,
            technicalTerms: this.containsTechnicalTerms(query),
            comparisonRequest: /comparar|diferencia|mejor|peor/i.test(query),
            conditionalRequest: /si|cuando|depende|en caso/i.test(query),
            urgencyIndicators: /urgente|rapido|ya|ahora|inmediato/i.test(query),
            lengthComplexity: query.length > 200
        };
        const complexityScore = Object.values(complexityFactors).filter(Boolean).length;
        return { isComplex: complexityScore >= 2, score: complexityScore, factors: Object.entries(complexityFactors).filter(([_, value]) => value).map(([factor, _]) => factor), queryLength: query.length };
    }

    async analyzePriceAvailability(model, query) {
        const serviceType = this.detectServiceType(query);
        const priceInfo = await this.findPriceInDatabase(model, serviceType);
        return { available: priceInfo !== null, serviceType, priceInfo, reason: priceInfo ? 'Precio encontrado' : 'Precio no disponible en base de datos' };
    }

    detectCustomRequests(query) {
        const customIndicators = {
            warranty: /garantia|garantía/i.test(query),
            delivery: /domicilio|entrega|llevar/i.test(query),
            payment: /pago|efectivo|tarjeta|transferencia/i.test(query),
            appointment: /cita|hora|horario|cuando|agendar/i.test(query),
            discount: /descuento|oferta|promocion|barato/i.test(query),
            comparison: /comparar|opciones|alternativa/i.test(query),
            negotiation: /precio final|mejor precio|negociar/i.test(query)
        };
        const detectedIndicators = Object.entries(customIndicators).filter(([_, matches]) => matches).map(([indicator, _]) => indicator);
        return { isCustom: detectedIndicators.length > 0, indicators: detectedIndicators, requiresPersonalization: detectedIndicators.includes('negotiation') || detectedIndicators.includes('discount') };
    }

    analyzeTechnicalComplexity(query) {
        const technicalTerms = ['digitalizador', 'lcd', 'oled', 'amoled', 'tactil', 'touch', 'flex', 'conector', 'puerto', 'camara', 'sensor', 'parlante', 'microfono', 'vibrador', 'bateria', 'placa', 'board'];
        const problemDescriptions = [/no enciende/i, /pantalla negra/i, /lineas/i, /manchas/i, /no carga/i, /se calienta/i, /se apaga/i, /lento/i, /no funciona/i, /roto/i, /quebrado/i, /dañado/i];
        const containsTechnicalTerms = technicalTerms.some((term) => query.toLowerCase().includes(term));
        const containsProblemDescription = problemDescriptions.some((pattern) => pattern.test(query));
        const requiresExpertise = containsTechnicalTerms || (containsProblemDescription && this.isComplexProblem(query));
        return { requiresExpertise, technicalTermsFound: containsTechnicalTerms, problemDescriptionFound: containsProblemDescription, reason: requiresExpertise ? 'Requiere conocimiento técnico especializado' : 'Consulta técnica estándar' };
    }

    calculateConfidence(indicators) {
        if (indicators.length === 0) return 1.0;
        let totalImpact = 0;
        let maxImpact = 0;
        indicators.forEach((indicator) => {
            totalImpact += indicator.weight;
            maxImpact = Math.max(maxImpact, indicator.weight);
        });
        const confidence = 1.0 - (maxImpact + (totalImpact - maxImpact) * 0.3);
        return Math.max(0, Math.min(1, confidence));
    }

    async prepareEscalationData(queryData, indicators) {
        const aiAnalysis = indicators.length > 0 ? indicators.map((i) => `${i.description} (${(i.weight * 100).toFixed(0)}%)`).join(', ') : 'Sin análisis específico disponible';
        return {
            customerInfo: { name: queryData.customerInfo?.name || 'Cliente', phone: queryData.customerInfo?.phone || queryData.from },
            query: queryData.query,
            media: queryData.message?.hasMedia ? { type: queryData.message.mediaType, present: true } : null,
            aiAnalysis,
            confidence: this.calculateConfidence(indicators),
            detectedIssues: indicators.map((i) => ({ type: i.type, description: i.description, weight: i.weight, details: i.details })),
            timestamp: Date.now()
        };
    }

    async assessAgentCapabilities(queryData) {
        const capabilities = { canProvidePricing: false, canScheduleAppointment: false, canProvideServiceInfo: false, canHandleBasicQuestions: true };
        const modelAnalysis = await this.analyzeDeviceModel(queryData.query);
        if (modelAnalysis.found) {
            const serviceType = this.detectServiceType(queryData.query);
            const priceInfo = await this.findPriceInDatabase(modelAnalysis.model, serviceType);
            capabilities.canProvidePricing = priceInfo !== null;
        }
        if (/cita|hora|horario|agendar/i.test(queryData.query)) {
            capabilities.canScheduleAppointment = true;
        }
        capabilities.canProvideServiceInfo = this.canProvideServiceInfo(queryData.query);
        return capabilities;
    }

    async loadPriceDatabase() {
        try {
            const pricesDir = path.join(__dirname, '../../../data/processed_for_ai/precios_markdown');
            const files = await fs.readdir(pricesDir);
            for (const file of files) {
                if (file.endsWith('_precios.md')) {
                    const brand = file.replace('_precios.md', '').toLowerCase();
                    const content = await fs.readFile(path.join(pricesDir, file), 'utf8');
                    this.priceDatabase.set(brand, this.parseMarkdownPrices(content));
                }
            }
            logger.info('💰 Base de datos de precios cargada', { brands: this.priceDatabase.size });
        } catch (error) {
            logger.error('❌ Error cargando base de datos de precios:', error);
        }
    }

    parseMarkdownPrices(content) {
        const prices = new Map();
        const lines = content.split('\\n');
        lines.forEach((line) => {
            if (line.startsWith('|') && line.includes('Pantalla')) {
                const parts = line.split('|').map((p) => p.trim());
                if (parts.length >= 4) {
                    const model = parts[1]?.toLowerCase();
                    const original = parts[3];
                    const generica = parts[4];
                    if (model && original) {
                        prices.set(model, { original: parseFloat(original) || null, generica: parseFloat(generica) || null });
                    }
                }
            }
        });
        return prices;
    }

    extractBrand(modelString) {
        const brandMap = { iphone: 'iphone', samsung: 'samsung', galaxy: 'samsung', xiaomi: 'xiaomi', huawei: 'huawei', motorola: 'motorola', lg: 'lg', nokia: 'nokia' };
        const modelLower = modelString.toLowerCase();
        for (const [key, brand] of Object.entries(brandMap)) {
            if (modelLower.includes(key)) return brand;
        }
        return 'unknown';
    }

    async checkModelInDatabase(brand, model) {
        const brandPrices = this.priceDatabase.get(brand);
        if (!brandPrices) return false;
        const normalizedModel = this.normalizeModel(model);
        for (const [dbModel, _] of brandPrices.entries()) {
            if (dbModel.includes(normalizedModel) || normalizedModel.includes(dbModel)) {
                return true;
            }
        }
        return false;
    }

    async findPriceInDatabase(model, serviceType = 'pantalla') {
        for (const [brand, prices] of this.priceDatabase.entries()) {
            const normalizedModel = this.normalizeModel(model);
            for (const [dbModel, priceInfo] of prices.entries()) {
                if (dbModel.includes(normalizedModel) || normalizedModel.includes(dbModel)) {
                    return { brand, model: dbModel, ...priceInfo };
                }
            }
        }
        return null;
    }

    normalizeModel(model) {
        return model.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    }

    detectServiceType(query) {
        if (/pantalla|display|screen/i.test(query)) return 'pantalla';
        if (/bateria|battery/i.test(query)) return 'bateria';
        if (/camara|camera/i.test(query)) return 'camara';
        if (/puerto|charging/i.test(query)) return 'puerto';
        return 'pantalla';
    }

    containsTechnicalTerms(query) {
        const technicalTerms = ['digitalizador', 'lcd', 'oled', 'amoled', 'tactil', 'flex', 'conector', 'sensor', 'parlante', 'microfono'];
        return technicalTerms.some((term) => query.toLowerCase().includes(term));
    }

    isComplexProblem(query) {
        const complexProblems = [/no enciende.*despues/i, /a veces.*funciona/i, /solo.*cuando/i, /intermitente/i, /depende.*de/i];
        return complexProblems.some((pattern) => pattern.test(query));
    }

    canProvideServiceInfo(query) {
        const serviceQuestions = [/horario/i, /ubicacion/i, /direccion/i, /garantia/i, /tiempo/i, /cuanto.*tarda/i];
        return serviceQuestions.some((pattern) => pattern.test(query));
    }

    getMetrics() {
        return {
            ...this.metrics,
            escalationRate: this.metrics.totalAnalyses > 0 ? this.metrics.escalationsTriggered / this.metrics.totalAnalyses : 0,
            loadedBrands: this.priceDatabase.size,
            uncertaintyThreshold: this.uncertaintyThreshold
        };
    }

    setUncertaintyThreshold(newThreshold) {
        if (newThreshold >= 0 && newThreshold <= 1) {
            this.uncertaintyThreshold = newThreshold;
            logger.info('🎯 Umbral de incertidumbre actualizado', { newThreshold });
        }
    }

    async shutdown() {
        this.priceDatabase.clear();
        logger.info('🔄 UncertaintyDetector shutdown completed');
    }
}

const adminEscalationSystem = new AdminEscalationSystem();
const uncertaintyDetector = new UncertaintyDetector();

module.exports = {
    adminEscalationSystem,
    uncertaintyDetector,
    AdminEscalationSystem,
    UncertaintyDetector
};
