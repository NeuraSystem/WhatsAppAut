/**
 * @file UncertaintyDetector.js
 * @description Detector de incertidumbre que determina cuándo el agente necesita escalación
 * @module core/intelligence/UncertaintyDetector
 * @version 1.0.0
 * @author Claude (Anthropic AI)
 * @date 2025-07-17
 */

const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * Detector que analiza consultas y determina si requieren escalación al administrador
 */
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
            analysis.reasons = indicators.map(i => i.description);
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
        
        // Verificar presencia de media
        if (queryData.message?.hasMedia) {
            indicators.push({
                type: 'media',
                weight: this.uncertaintyIndicators.media.weight,
                description: this.uncertaintyIndicators.media.description,
                details: { mediaType: queryData.message.mediaType, reason: 'Requiere análisis visual humano' }
            });
        }
        
        // Verificar modelo de dispositivo
        const modelAnalysis = await this.analyzeDeviceModel(queryData.query);
        if (!modelAnalysis.found) {
            indicators.push({
                type: 'unknownModel',
                weight: this.uncertaintyIndicators.unknownModel.weight,
                description: this.uncertaintyIndicators.unknownModel.description,
                details: { extractedModel: modelAnalysis.extractedModel, suggestions: modelAnalysis.suggestions }
            });
        }
        
        // Verificar complejidad
        const complexityAnalysis = this.analyzeQueryComplexity(queryData.query);
        if (complexityAnalysis.isComplex) {
            indicators.push({
                type: 'complexQuery',
                weight: this.uncertaintyIndicators.complexQuery.weight,
                description: this.uncertaintyIndicators.complexQuery.description,
                details: complexityAnalysis
            });
        }
        
        // Verificar precios
        if (modelAnalysis.found) {
            const priceAnalysis = await this.analyzePriceAvailability(modelAnalysis.model, queryData.query);
            if (!priceAnalysis.available) {
                indicators.push({
                    type: 'priceNotFound',
                    weight: this.uncertaintyIndicators.priceNotFound.weight,
                    description: this.uncertaintyIndicators.priceNotFound.description,
                    details: priceAnalysis
                });
            }
        }
        
        // Verificar solicitudes personalizadas
        const customRequestAnalysis = this.detectCustomRequests(queryData.query);
        if (customRequestAnalysis.isCustom) {
            indicators.push({
                type: 'customRequest',
                weight: this.uncertaintyIndicators.customRequest.weight,
                description: this.uncertaintyIndicators.customRequest.description,
                details: customRequestAnalysis
            });
        }
        
        // Verificar complejidad técnica
        const technicalAnalysis = this.analyzeTechnicalComplexity(queryData.query);
        if (technicalAnalysis.requiresExpertise) {
            indicators.push({
                type: 'technicalIssue',
                weight: this.uncertaintyIndicators.technicalIssue.weight,
                description: this.uncertaintyIndicators.technicalIssue.description,
                details: technicalAnalysis
            });
        }
        
        return indicators;
    }
    
    async analyzeDeviceModel(query) {
        const queryLower = query.toLowerCase();
        const modelPatterns = [
            /iphone\\s*(\\d+(?:\\s*pro(?:\\s*max)?)?)/i,
            /samsung\\s*([a-z]\\d+(?:\\s*[a-z]*)?)/i,
            /galaxy\\s*([a-z]\\d+(?:\\s*[a-z]*)?)/i,
            /xiaomi\\s*([a-z]*\\s*\\d+(?:[a-z]*)?)/i
        ];
        
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
        return {
            found: modelExists,
            brand,
            model: extractedModel,
            normalizedModel: this.normalizeModel(extractedModel)
        };
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
        return {
            isComplex: complexityScore >= 2,
            score: complexityScore,
            factors: Object.entries(complexityFactors).filter(([_, value]) => value).map(([factor, _]) => factor),
            queryLength: query.length
        };
    }
    
    async analyzePriceAvailability(model, query) {
        const serviceType = this.detectServiceType(query);
        const priceInfo = await this.findPriceInDatabase(model, serviceType);
        
        return {
            available: priceInfo !== null,
            serviceType,
            priceInfo,
            reason: priceInfo ? 'Precio encontrado' : 'Precio no disponible en base de datos'
        };
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
        
        const detectedIndicators = Object.entries(customIndicators)
            .filter(([_, matches]) => matches)
            .map(([indicator, _]) => indicator);
        
        return {
            isCustom: detectedIndicators.length > 0,
            indicators: detectedIndicators,
            requiresPersonalization: detectedIndicators.includes('negotiation') || detectedIndicators.includes('discount')
        };
    }
    
    analyzeTechnicalComplexity(query) {
        const technicalTerms = ['digitalizador', 'lcd', 'oled', 'amoled', 'tactil', 'touch', 'flex', 'conector', 'puerto', 'camara', 'sensor', 'parlante', 'microfono', 'vibrador', 'bateria', 'placa', 'board'];
        
        const problemDescriptions = [/no enciende/i, /pantalla negra/i, /lineas/i, /manchas/i, /no carga/i, /se calienta/i, /se apaga/i, /lento/i, /no funciona/i, /roto/i, /quebrado/i, /dañado/i];
        
        const containsTechnicalTerms = technicalTerms.some(term => query.toLowerCase().includes(term));
        const containsProblemDescription = problemDescriptions.some(pattern => pattern.test(query));
        const requiresExpertise = containsTechnicalTerms || (containsProblemDescription && this.isComplexProblem(query));
        
        return {
            requiresExpertise,
            technicalTermsFound: containsTechnicalTerms,
            problemDescriptionFound: containsProblemDescription,
            reason: requiresExpertise ? 'Requiere conocimiento técnico especializado' : 'Consulta técnica estándar'
        };
    }
    
    calculateConfidence(indicators) {
        if (indicators.length === 0) return 1.0;
        
        let totalImpact = 0;
        let maxImpact = 0;
        
        indicators.forEach(indicator => {
            totalImpact += indicator.weight;
            maxImpact = Math.max(maxImpact, indicator.weight);
        });
        
        const confidence = 1.0 - (maxImpact + (totalImpact - maxImpact) * 0.3);
        return Math.max(0, Math.min(1, confidence));
    }
    
    async prepareEscalationData(queryData, indicators) {
        const aiAnalysis = indicators.length > 0 ? 
            indicators.map(i => `${i.description} (${(i.weight * 100).toFixed(0)}%)`).join(', ') :
            'Sin análisis específico disponible';
        
        return {
            customerInfo: {
                name: queryData.customerInfo?.name || 'Cliente',
                phone: queryData.customerInfo?.phone || queryData.from
            },
            query: queryData.query,
            media: queryData.message?.hasMedia ? { type: queryData.message.mediaType, present: true } : null,
            aiAnalysis,
            confidence: this.calculateConfidence(indicators),
            detectedIssues: indicators.map(i => ({ type: i.type, description: i.description, weight: i.weight, details: i.details })),
            timestamp: Date.now()
        };
    }
    
    async assessAgentCapabilities(queryData) {
        const capabilities = {
            canProvidePricing: false,
            canScheduleAppointment: false,
            canProvideServiceInfo: false,
            canHandleBasicQuestions: true
        };
        
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
        
        lines.forEach(line => {
            if (line.startsWith('|') && line.includes('Pantalla')) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 4) {
                    const model = parts[1]?.toLowerCase();
                    const original = parts[3];
                    const generica = parts[4];
                    
                    if (model && original) {
                        prices.set(model, {
                            original: parseFloat(original) || null,
                            generica: parseFloat(generica) || null
                        });
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
        return technicalTerms.some(term => query.toLowerCase().includes(term));
    }
    
    isComplexProblem(query) {
        const complexProblems = [/no enciende.*despues/i, /a veces.*funciona/i, /solo.*cuando/i, /intermitente/i, /depende.*de/i];
        return complexProblems.some(pattern => pattern.test(query));
    }
    
    canProvideServiceInfo(query) {
        const serviceQuestions = [/horario/i, /ubicacion/i, /direccion/i, /garantia/i, /tiempo/i, /cuanto.*tarda/i];
        return serviceQuestions.some(pattern => pattern.test(query));
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

const uncertaintyDetector = new UncertaintyDetector();
module.exports = uncertaintyDetector;
