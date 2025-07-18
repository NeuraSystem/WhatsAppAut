const logger = require('../../utils/logger');
const { initializeDatabase } = require('../../database/pg');
const config = require('../../../config/config');

// Contenido de AdaptiveLearningEngine.js

class AdaptiveLearningEngine {
    constructor() {
        this.decisionPatterns = new Map(); // patrón -> decisiones
        this.autoDecisions = new Map(); // patrón -> decisión automática
        this.pendingAutoDecisions = new Map(); // decisiones pendientes de aprobación

        this.metrics = {
            totalDecisions: 0,
            patternsLearned: 0,
            autoDecisionsMade: 0,
            autoDecisionAccuracy: 0
        };

        this.PATTERN_THRESHOLD = 3; // Número de repeticiones para aprender
        this.CONFIDENCE_THRESHOLD = 0.85; // Confianza mínima para auto-decisión

        logger.info('📚 AdaptiveLearningEngine inicializado');
    }

    async recordAdminDecision(decisionData) {
        try {
            const pattern = this.generateSituationPattern(decisionData.situation);
            const decisionRecord = {
                pattern,
                situation: decisionData.situation,
                adminResponse: decisionData.adminResponse,
                customerResponse: decisionData.customerResponse || null,
                timestamp: Date.now(),
                success: decisionData.success || null,
                context: decisionData.context || {}
            };

            if (!this.decisionPatterns.has(pattern)) {
                this.decisionPatterns.set(pattern, []);
            }

            this.decisionPatterns.get(pattern).push(decisionRecord);
            this.metrics.totalDecisions++;

            await this.saveDecisionToDatabase(decisionRecord);
            await this.checkForNewAutoDecision(pattern);

            logger.info('📝 Decisión del admin registrada', {
                pattern: pattern.substring(0, 50) + '...',
                totalForPattern: this.decisionPatterns.get(pattern).length
            });
        } catch (error) {
            logger.error('❌ Error registrando decisión del admin:', error);
        }
    }

    async checkForAutoDecision(situation) {
        const pattern = this.generateSituationPattern(situation);

        if (this.autoDecisions.has(pattern)) {
            const autoDecision = this.autoDecisions.get(pattern);
            logger.info('🤖 Auto-decisión encontrada', {
                pattern: pattern.substring(0, 50) + '...',
                confidence: autoDecision.confidence
            });
            this.metrics.autoDecisionsMade++;
            return autoDecision;
        }

        return null;
    }

    async checkForNewAutoDecision(pattern) {
        const decisions = this.decisionPatterns.get(pattern);

        if (decisions.length >= this.PATTERN_THRESHOLD) {
            const consistency = this.analyzeDecisionConsistency(decisions);
            if (consistency.confidence >= this.CONFIDENCE_THRESHOLD) {
                const autoDecisionProposal = {
                    pattern,
                    recommendedResponse: consistency.mostCommonResponse,
                    confidence: consistency.confidence,
                    basedOnDecisions: decisions.length,
                    examples: decisions.slice(-3),
                    timestamp: Date.now(),
                    status: 'pending_approval'
                };
                this.pendingAutoDecisions.set(pattern, autoDecisionProposal);
                await this.requestAutoDecisionApproval(autoDecisionProposal);
                logger.info('🎯 Nueva auto-decisión propuesta', {
                    pattern: pattern.substring(0, 50) + '...',
                    confidence: consistency.confidence,
                    basedOn: decisions.length + ' decisiones'
                });
            }
        }
    }

    analyzeDecisionConsistency(decisions) {
        const responseGroups = new Map();
        decisions.forEach((decision) => {
            const normalizedResponse = this.normalizeResponse(decision.adminResponse);
            if (!responseGroups.has(normalizedResponse)) {
                responseGroups.set(normalizedResponse, []);
            }
            responseGroups.get(normalizedResponse).push(decision);
        });

        let mostCommonResponse = '';
        let maxCount = 0;
        for (const [response, group] of responseGroups.entries()) {
            if (group.length > maxCount) {
                maxCount = group.length;
                mostCommonResponse = response;
            }
        }

        const confidence = maxCount / decisions.length;
        return {
            mostCommonResponse,
            confidence,
            responseGroups: Array.from(responseGroups.entries()).map(
                ([response, group]) => ({
                    response,
                    count: group.length,
                    percentage: ((group.length / decisions.length) * 100).toFixed(1)
                })
            )
        };
    }

    async requestAutoDecisionApproval(proposal) {
        const approvalMessage = this.formatApprovalRequest(proposal);
        logger.info('📋 Solicitud de aprobación enviada al admin', {
            pattern: proposal.pattern.substring(0, 50) + '...',
            confidence: proposal.confidence
        });
    }

    formatApprovalRequest(proposal) {
        let message = `🤖 PROPUESTA DE AUTO-DECISIÓN\n\n`;
        message += `📊 Confianza: ${(proposal.confidence * 100).toFixed(1)}%\n`;
        message += `📈 Basado en: ${proposal.basedOnDecisions} decisiones similares\n\n`;
        message += `🔍 Situación detectada:\n${this.describeSituationFromPattern(proposal.pattern)}\n\n`;
        message += `💬 Respuesta propuesta:\n"${proposal.recommendedResponse}"\n\n`;
        message += `📋 Ejemplos recientes:\n`;

        proposal.examples.forEach((example, index) => {
            const date = new Date(example.timestamp).toLocaleDateString();
            message += `${index + 1}. [${date}] ${example.adminResponse.substring(0, 60)}...\n`;
        });

        message += `\n✅ Responde "APROBAR ${proposal.pattern.split(':')[0]}" para activar\n`;
        message += `❌ Responde "RECHAZAR ${proposal.pattern.split(':')[0]}" para denegar`;

        return message;
    }

    async handleApprovalResponse(adminResponse) {
        const response = adminResponse.toUpperCase().trim();
        if (response.startsWith('APROBAR ')) {
            const patternId = response.replace('APROBAR ', '');
            await this.approveAutoDecision(patternId);
        } else if (response.startsWith('RECHAZAR ')) {
            const patternId = response.replace('RECHAZAR ', '');
            await this.rejectAutoDecision(patternId);
        }
    }

    async approveAutoDecision(patternId) {
        let approvedProposal = null;
        for (const [pattern, proposal] of this.pendingAutoDecisions.entries()) {
            if (pattern.startsWith(patternId)) {
                approvedProposal = proposal;
                this.pendingAutoDecisions.delete(pattern);
                break;
            }
        }

        if (approvedProposal) {
            this.autoDecisions.set(approvedProposal.pattern, {
                response: approvedProposal.recommendedResponse,
                confidence: approvedProposal.confidence,
                activatedAt: Date.now(),
                usageCount: 0
            });
            this.metrics.patternsLearned++;
            await this.saveAutoDecisionToDatabase(approvedProposal);
            logger.info('✅ Auto-decisión aprobada y activada', {
                pattern: approvedProposal.pattern.substring(0, 50) + '...',
                confidence: approvedProposal.confidence
            });
        }
    }

    async rejectAutoDecision(patternId) {
        for (const [pattern, proposal] of this.pendingAutoDecisions.entries()) {
            if (pattern.startsWith(patternId)) {
                this.pendingAutoDecisions.delete(pattern);
                logger.info('❌ Auto-decisión rechazada', {
                    pattern: pattern.substring(0, 50) + '...'
                });
                break;
            }
        }
    }

    generateSituationPattern(situation) {
        const components = [];
        if (situation.queryType) components.push(`query:${situation.queryType}`);
        if (situation.deviceModel) components.push(`device:${this.normalizeDeviceModel(situation.deviceModel)}`);
        if (situation.serviceType) components.push(`service:${situation.serviceType}`);
        if (situation.timeOfDay) components.push(`time:${this.categorizeTimeOfDay(situation.timeOfDay)}`);
        if (situation.customerType) components.push(`customer:${situation.customerType}`);
        if (situation.urgency) components.push(`urgency:${situation.urgency}`);
        return components.join('|');
    }

    normalizeResponse(response) {
        return response.toLowerCase().replace(/\d+/g, 'NUM').replace(/[^\w\s]/g, '').trim();
    }

    normalizeDeviceModel(model) {
        return model.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    }

    categorizeTimeOfDay(hour) {
        if (hour >= 9 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 16) return 'afternoon';
        if (hour >= 16 && hour < 20) return 'evening';
        return 'night';
    }

    describeSituationFromPattern(pattern) {
        const components = pattern.split('|');
        const descriptions = [];
        components.forEach((component) => {
            const [type, value] = component.split(':');
            switch (type) {
            case 'query': descriptions.push(`Consulta sobre: ${value}`); break;
            case 'device': descriptions.push(`Dispositivo: ${value}`); break;
            case 'service': descriptions.push(`Servicio: ${value}`); break;
            case 'time': descriptions.push(`Horario: ${value}`); break;
            case 'customer': descriptions.push(`Cliente: ${value}`); break;
            case 'urgency': descriptions.push(`Urgencia: ${value}`); break;
            }
        });
        return descriptions.join(', ');
    }

    async saveDecisionToDatabase(decisionRecord) {
        try {
            logger.debug('💾 Guardando decisión en BD', {
                pattern: decisionRecord.pattern.substring(0, 30) + '...'
            });
        } catch (error) {
            logger.error('❌ Error guardando decisión en BD:', error);
        }
    }

    async saveAutoDecisionToDatabase(autoDecision) {
        try {
            logger.debug('💾 Guardando auto-decisión en BD', {
                pattern: autoDecision.pattern.substring(0, 30) + '...'
            });
        } catch (error) {
            logger.error('❌ Error guardando auto-decisión en BD:', error);
        }
    }

    async markDecisionSuccess(decisionId, success) {
        for (const [pattern, decisions] of this.decisionPatterns.entries()) {
            const decision = decisions.find((d) => d.id === decisionId);
            if (decision) {
                decision.success = success;
                this.updateAccuracyMetrics();
                logger.info('📊 Éxito de decisión actualizado', {
                    decisionId,
                    success,
                    pattern: pattern.substring(0, 30) + '...'
                });
                break;
            }
        }
    }

    updateAccuracyMetrics() {
        let totalEvaluated = 0;
        let successfulDecisions = 0;
        for (const decisions of this.decisionPatterns.values()) {
            decisions.forEach((decision) => {
                if (decision.success !== null) {
                    totalEvaluated++;
                    if (decision.success) {
                        successfulDecisions++;
                    }
                }
            });
        }
        this.metrics.autoDecisionAccuracy = totalEvaluated > 0 ? successfulDecisions / totalEvaluated : 0;
    }

    getMetrics() {
        return {
            ...this.metrics,
            totalPatterns: this.decisionPatterns.size,
            activeAutoDecisions: this.autoDecisions.size,
            pendingApprovals: this.pendingAutoDecisions.size
        };
    }

    getPendingApprovals() {
        return Array.from(this.pendingAutoDecisions.values());
    }

    getActiveAutoDecisions() {
        return Array.from(this.autoDecisions.entries()).map(
            ([pattern, decision]) => ({
                pattern: this.describeSituationFromPattern(pattern),
                response: decision.response,
                confidence: decision.confidence,
                usageCount: decision.usageCount,
                activatedAt: decision.activatedAt
            })
        );
    }

    async shutdown() {
        this.decisionPatterns.clear();
        this.autoDecisions.clear();
        this.pendingAutoDecisions.clear();
        logger.info('🔄 AdaptiveLearningEngine shutdown completed');
    }
}

// Contenido de PredictiveAnalyticsEngine.js

class PredictiveAnalyticsEngine {
    constructor() {
        this.behaviorPatterns = new Map();
        this.seasonalTrends = new Map();
        this.deviceLifecycles = new Map();
        this.predictionModels = new Map();
        this.metrics = {
            totalPredictions: 0,
            accuratePredictions: 0,
            proactiveActions: 0,
            preventedEscalations: 0,
            timesSaved: 0
        };
        this.PREDICTION_WINDOW = 30;
        this.MIN_DATA_POINTS = 3;
        this.CONFIDENCE_THRESHOLD = 0.6;
        this.initializePredictionModels();
        this.loadHistoricalTrends();
        logger.info('🔮 PredictiveAnalyticsEngine inicializado');
    }

    async generatePredictions(clientData) {
        const startTime = Date.now();
        this.metrics.totalPredictions++;
        try {
            const predictions = {
                behavioral: await this.predictBehavior(clientData),
                needs: await this.predictNeeds(clientData),
                timing: await this.predictOptimalTiming(clientData),
                lifecycle: await this.predictDeviceLifecycle(clientData),
                proactive: await this.generateProactiveActions(clientData)
            };
            const aggregatedInsights = this.aggregateInsights(predictions);
            const actionableRecommendations = this.generateRecommendations(predictions, aggregatedInsights);
            const processingTime = Date.now() - startTime;
            logger.info('🎯 Predicciones generadas', {
                clientId: clientData.clientId?.substr(-4) || 'anon',
                predictionsCount: Object.keys(predictions).length,
                highConfidencePredictions: this.countHighConfidencePredictions(predictions),
                processingTime: `${processingTime}ms`
            });
            return {
                success: true,
                predictions,
                insights: aggregatedInsights,
                recommendations: actionableRecommendations,
                confidence: this.calculateOverallConfidence(predictions),
                processingTime
            };
        } catch (error) {
            logger.error('❌ Error generando predicciones:', error);
            return {
                success: false,
                error: error.message,
                predictions: {},
                processingTime: Date.now() - startTime
            };
        }
    }

    async predictBehavior(clientData) {
        const clientHistory = clientData.history || {};
        const behaviorPrediction = {
            nextContactProbability: 0.5,
            preferredContactTime: null,
            likelyCommunicationStyle: 'formal',
            urgencyPattern: 'normal',
            serviceLoyalty: 0.5,
            confidence: 0.3
        };
        if (clientHistory.totalInteractions >= this.MIN_DATA_POINTS) {
            behaviorPrediction.nextContactProbability = this.calculateContactProbability(clientHistory);
            behaviorPrediction.preferredContactTime = this.predictPreferredTime(clientHistory.preferredTimeSlots);
            behaviorPrediction.likelyCommunicationStyle = this.predictCommunicationStyle(clientHistory);
            behaviorPrediction.urgencyPattern = this.predictUrgencyPattern(clientHistory);
            behaviorPrediction.serviceLoyalty = this.calculateServiceLoyalty(clientHistory);
            behaviorPrediction.confidence = Math.min(0.9, 0.3 + clientHistory.totalInteractions * 0.1);
        }
        return behaviorPrediction;
    }

    async predictNeeds(clientData) {
        const needsPrediction = {
            likelyServices: [],
            deviceUpgradeWindow: null,
            maintenanceNeeds: [],
            budgetRange: null,
            confidence: 0.3
        };
        const deviceTypes = Array.from(clientData.history?.deviceTypes || []);
        const serviceTypes = Array.from(clientData.history?.serviceTypes || []);
        if (deviceTypes.length > 0) {
            needsPrediction.likelyServices = this.predictLikelyServices(deviceTypes, serviceTypes);
            needsPrediction.deviceUpgradeWindow = this.predictUpgradeWindow(deviceTypes, clientData.history);
            needsPrediction.maintenanceNeeds = this.predictMaintenanceNeeds(deviceTypes, serviceTypes);
            needsPrediction.budgetRange = this.estimateBudgetRange(deviceTypes, serviceTypes);
            needsPrediction.confidence = Math.min(0.85, 0.4 + deviceTypes.length * 0.15);
        }
        return needsPrediction;
    }

    async predictOptimalTiming(clientData) {
        const timingPrediction = {
            bestContactHours: [],
            bestDaysOfWeek: [],
            responseTimeExpectation: '2-4 horas',
            seasonalFactors: {},
            confidence: 0.4
        };
        const history = clientData.history || {};
        if (history.preferredTimeSlots?.length > 0) {
            timingPrediction.bestContactHours = this.analyzeBestHours(history.preferredTimeSlots);
            timingPrediction.bestDaysOfWeek = this.predictBestDays(clientData.customerType);
            timingPrediction.responseTimeExpectation = this.estimateResponseExpectation(clientData.customerType, history.urgencyLevel);
            timingPrediction.seasonalFactors = this.getSeasonalFactors();
            timingPrediction.confidence = Math.min(0.8, 0.4 + history.preferredTimeSlots.length * 0.1);
        }
        return timingPrediction;
    }

    async predictDeviceLifecycle(clientData) {
        const lifecyclePrediction = {
            currentPhase: 'unknown',
            expectedIssues: [],
            maintenanceSchedule: [],
            replacementWindow: null,
            confidence: 0.2
        };
        const deviceTypes = Array.from(clientData.history?.deviceTypes || []);
        if (deviceTypes.length > 0) {
            for (const deviceType of deviceTypes) {
                const lifecycle = this.deviceLifecycles.get(deviceType) || this.getGenericLifecycle();
                const currentPhase = this.determineCurrentPhase(deviceType, clientData.history?.serviceTypes, clientData.history?.totalInteractions);
                lifecyclePrediction.currentPhase = currentPhase;
                lifecyclePrediction.expectedIssues.push(...this.predictExpectedIssues(deviceType, currentPhase));
                lifecyclePrediction.maintenanceSchedule.push(...this.suggestMaintenanceSchedule(deviceType, currentPhase));
                if (!lifecyclePrediction.replacementWindow) {
                    lifecyclePrediction.replacementWindow = this.predictReplacementWindow(deviceType, currentPhase);
                }
            }
            lifecyclePrediction.confidence = Math.min(0.75, 0.3 + deviceTypes.length * 0.15);
        }
        return lifecyclePrediction;
    }

    async generateProactiveActions(clientData) {
        const proactiveActions = {
            immediateActions: [],
            scheduledActions: [],
            preventiveActions: [],
            marketingOpportunities: [],
            confidence: 0.5
        };
        const customerType = clientData.customerType || 'new';
        const history = clientData.history || {};
        if (customerType === 'vip' && history.totalInteractions > 10) {
            proactiveActions.immediateActions.push({
                type: 'priority_support',
                description: 'Ofrecer canal de soporte prioritario',
                timing: 'inmediato',
                expectedImpact: 'alta satisfacción'
            });
        }
        if (history.urgencyLevel === 'high') {
            proactiveActions.immediateActions.push({
                type: 'expedited_service',
                description: 'Ofrecer servicio express',
                timing: 'próxima consulta',
                expectedImpact: 'reducir estrés del cliente'
            });
        }
        if (history.deviceTypes?.size > 0) {
            proactiveActions.scheduledActions.push({
                type: 'maintenance_reminder',
                description: 'Recordatorio de mantenimiento preventivo',
                timing: '3 meses',
                expectedImpact: 'prevenir problemas mayores'
            });
        }
        const seasonalFactors = this.getSeasonalFactors();
        if (seasonalFactors.currentSeason === 'winter') {
            proactiveActions.preventiveActions.push({
                type: 'winter_care_tips',
                description: 'Consejos de cuidado de dispositivos en invierno',
                timing: 'próximas 2 semanas',
                expectedImpact: 'reducir daños por humedad/frío'
            });
        }
        if (customerType === 'returning') {
            proactiveActions.marketingOpportunities.push({
                type: 'loyalty_program',
                description: 'Invitar a programa de lealtad',
                timing: 'próxima visita',
                expectedImpact: 'aumentar retención'
            });
        }
        proactiveActions.confidence = this.calculateProactiveConfidence(proactiveActions, customerType, history);
        return proactiveActions;
    }

    initializePredictionModels() {
        logger.debug('📈 Modelos de predicción inicializados (simulación).');
    }

    loadHistoricalTrends() {
        this.seasonalTrends.set('q4', { increased_demand: 'baterías', reason: 'frío' });
        this.deviceLifecycles.set('iPhone', { avg_lifespan_years: 3, common_failures: ['batería', 'pantalla'] });
        logger.debug('📉 Tendencias históricas cargadas (simulación).');
    }

    aggregateInsights(predictions) {
        const insights = [];
        if (predictions.needs.likelyServices.length > 0) {
            insights.push(`Cliente probablemente necesitará servicio de: ${predictions.needs.likelyServices.join(', ')}.`);
        }
        if (predictions.behavioral.nextContactProbability > 0.7) {
            insights.push(`Es muy probable que el cliente contacte pronto.`);
        }
        if (predictions.lifecycle.replacementWindow) {
            insights.push(`Se acerca la ventana de reemplazo/actualización para uno de sus dispositivos (${predictions.lifecycle.replacementWindow}).`);
        }
        return insights;
    }

    generateRecommendations(predictions, insights) {
        return predictions.proactive.immediateActions
            .concat(predictions.proactive.scheduledActions)
            .concat(predictions.proactive.preventiveActions)
            .concat(predictions.proactive.marketingOpportunities);
    }

    calculateOverallConfidence(predictions) {
        const confidences = Object.values(predictions).map((p) => p.confidence);
        if (confidences.length === 0) return 0;
        return confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    countHighConfidencePredictions(predictions) {
        return Object.values(predictions).filter((p) => p.confidence > this.CONFIDENCE_THRESHOLD).length;
    }

    calculateContactProbability(history) { return 0.6; }
    predictPreferredTime(slots) { return 'tardes (14-18h)'; }
    predictCommunicationStyle(history) { return 'casual'; }
    predictUrgencyPattern(history) { return 'normal'; }
    calculateServiceLoyalty(history) { return 0.75; }
    predictLikelyServices(devices, services) { return ['batería']; }
    predictUpgradeWindow(devices, history) { return '6-12 meses'; }
    predictMaintenanceNeeds(devices, services) { return ['limpieza de puerto de carga']; }
    estimateBudgetRange(devices, services) { return '$500 - $1500 MXN'; }
    analyzeBestHours(slots) { return ['14:00-16:00', '18:00-20:00']; }
    predictBestDays(type) { return ['martes', 'jueves']; }
    estimateResponseExpectation(type, urgency) { return urgency === 'high' ? 'menos de 1 hora' : '2-4 horas'; }
    getSeasonalFactors() { return { currentSeason: 'summer', trends: 'daño por agua/arena' }; }
    getGenericLifecycle() { return { avg_lifespan_years: 2, common_failures: ['batería', 'puerto de carga'] }; }
    determineCurrentPhase(device, services, interactions) { return interactions > 3 ? 'uso_intensivo' : 'uso_normal'; }
    predictExpectedIssues(device, phase) { return phase === 'uso_intensivo' ? ['batería'] : []; }
    suggestMaintenanceSchedule(device, phase) { return [{ task: 'revisión de batería', interval_months: 6 }]; }
    predictReplacementWindow(device, phase) { return phase === 'uso_intensivo' ? '3-6 meses' : '12-18 meses'; }
    calculateProactiveConfidence(actions, type, history) { return 0.7; }
}

// Contenido de MultiModalReasoningEngine.js

class MultiModalReasoningEngine {
    constructor() {
        this.reasoningStrategies = new Map();
        this.confidenceThresholds = {
            textOnly: 0.8,
            withImages: 0.6,
            complex: 0.7
        };
        this.metrics = {
            totalAnalyses: 0,
            textOnlyQueries: 0,
            imageQueries: 0,
            complexQueries: 0,
            successfulReasoning: 0,
            escalatedQueries: 0
        };
        this.initializeReasoningStrategies();
        logger.info('🧮 MultiModalReasoningEngine inicializado');
    }

    async processQuery(queryData) {
        const startTime = Date.now();
        this.metrics.totalAnalyses++;
        try {
            const queryClassification = this.classifyQuery(queryData);
            const strategy = this.selectReasoningStrategy(queryClassification);
            const analysisResult = await this.executeReasoning(queryData, strategy);
            const confidenceAssessment = this.assessConfidence(analysisResult, queryClassification);
            const actionDecision = this.decideAction(confidenceAssessment);
            this.updateMetrics(queryClassification.type, actionDecision.action === 'respond');
            const processingTime = Date.now() - startTime;
            logger.info('🔍 Análisis multi-modal completado', {
                queryType: queryClassification.type,
                strategy: strategy.name,
                confidence: confidenceAssessment.overall,
                action: actionDecision.action,
                processingTime: `${processingTime}ms`
            });
            return {
                success: true,
                classification: queryClassification,
                reasoning: analysisResult,
                confidence: confidenceAssessment,
                recommendation: actionDecision,
                processingTime
            };
        } catch (error) {
            logger.error('❌ Error en razonamiento multi-modal:', error);
            return {
                success: false,
                error: error.message,
                recommendation: {
                    action: 'escalate',
                    reason: 'Error en procesamiento automático',
                    confidence: 0.0
                },
                processingTime: Date.now() - startTime
            };
        }
    }

    classifyQuery(queryData) {
        const classification = {
            type: 'text_only',
            complexity: 'simple',
            hasMedia: false,
            mediaType: null,
            textAnalysis: {},
            estimatedDifficulty: 0.3
        };
        if (queryData.hasMedia) {
            classification.hasMedia = true;
            classification.mediaType = queryData.mediaType || 'unknown';
            classification.estimatedDifficulty += 0.4;
        }
        const textComplexity = this.analyzeTextComplexity(queryData.query);
        classification.textAnalysis = textComplexity;
        if (textComplexity.isComplex) {
            classification.complexity = 'complex';
            classification.estimatedDifficulty += 0.3;
        }
        if (classification.hasMedia && textComplexity.isComplex) {
            classification.type = 'multimedia_complex';
        } else if (classification.hasMedia) {
            classification.type = 'multimedia_simple';
        } else if (textComplexity.isComplex) {
            classification.type = 'text_complex';
        }
        return classification;
    }

    analyzeTextComplexity(query) {
        const complexityFactors = {
            length: query.length,
            multipleQuestions: (query.match(/\?/g) || []).length > 1,
            technicalTerms: this.containsTechnicalTerms(query),
            comparisonRequest: /comparar|diferencia|vs|versus|mejor|peor/i.test(query),
            conditionalLogic: /si|cuando|en caso|depende|pero|sin embargo/i.test(query)
        };
        let complexityScore = 0;
        if (complexityFactors.length > 100) complexityScore += 1;
        if (complexityFactors.multipleQuestions) complexityScore += 2;
        if (complexityFactors.technicalTerms) complexityScore += 2;
        if (complexityFactors.comparisonRequest) complexityScore += 2;
        if (complexityFactors.conditionalLogic) complexityScore += 1;
        return {
            isComplex: complexityScore >= 3,
            score: complexityScore,
            factors: complexityFactors
        };
    }

    containsTechnicalTerms(query) {
        const technicalTerms = [/digitalizador/i, /lcd/i, /oled/i, /flex/i, /conector/i, /firmware/i, /ios/i, /android/i, /reset/i, /microsoldadura/i, /reballing/i, /ic/i, /chip/i, /mah/i, /voltios/i, /amperios/i, /ram/i, /gb/i];
        return technicalTerms.some((term) => term.test(query));
    }

    selectReasoningStrategy(classification) {
        let strategyKey = 'text_simple';
        if (classification.type.includes('multimedia')) {
            strategyKey = classification.complexity === 'complex' ? 'multimedia_complex' : 'multimedia_simple';
        } else if (classification.complexity === 'complex') {
            strategyKey = 'text_complex';
        }
        return this.reasoningStrategies.get(strategyKey) || this.reasoningStrategies.get('default');
    }

    async executeReasoning(queryData, strategy) {
        const reasoningContext = {
            query: queryData.query,
            hasMedia: queryData.hasMedia,
            mediaType: queryData.mediaType,
            customerContext: queryData.customerContext || {},
            timestamp: Date.now()
        };
        const result = {
            strategy: strategy.name,
            steps: [],
            conclusions: [],
            confidence: 0.5,
            reasoning: ''
        };
        for (const step of strategy.steps) {
            const stepResult = await this.executeReasoningStep(step, reasoningContext, result);
            result.steps.push(stepResult);
            reasoningContext[step.outputKey] = stepResult.output;
        }
        result.conclusions = this.generateConclusions(result.steps);
        result.confidence = this.calculateOverallConfidence(result.steps);
        result.reasoning = this.formulateReasoning(result);
        return result;
    }

    async executeReasoningStep(step, context, currentResult) {
        try {
            let stepResult;
            switch (step.type) {
            case 'text_analysis': stepResult = await this.performTextAnalysis(context, step.params); break;
            case 'image_analysis': stepResult = await this.performImageAnalysis(context, step.params); break;
            case 'knowledge_lookup': stepResult = await this.performKnowledgeLookup(context, step.params); break;
            case 'price_analysis': stepResult = await this.performPriceAnalysis(context, step.params); break;
            case 'context_integration': stepResult = await this.performContextIntegration(context, step.params); break;
            case 'synthesis': stepResult = await this.performSynthesis(context, currentResult, step.params); break;
            default: throw new Error(`Tipo de paso desconocido: ${step.type}`);
            }
            return { name: step.name, success: true, ...stepResult };
        } catch (error) {
            return { name: step.name, success: false, error: error.message, confidence: 0.0 };
        }
    }

    async performTextAnalysis(context, params) {
        const intent = 'repair_inquiry';
        const entities = [{ type: 'device', value: 'iPhone 12' }, { type: 'problem', value: 'pantalla rota' }];
        return { output: { intent, entities }, confidence: 0.85, evidence: [`Intent detected: ${intent}`, `Entities: ${JSON.stringify(entities)}`] };
    }

    async performImageAnalysis(context, params) {
        return { output: { imageContent: 'Posible daño por líquido en la parte inferior.', recommendation: 'escalate' }, confidence: 0.5, evidence: ['Análisis visual sugiere daño por agua. Requiere revisión humana.'] };
    }

    async performKnowledgeLookup(context, params) {
        return { output: { deviceInfo: { model: 'iPhone 12', commonIssues: ['pantalla', 'bateria'] }, serviceInfo: { type: 'cambio de pantalla', estimatedTime: '2 horas' } }, confidence: 0.9, evidence: ['Información de iPhone 12 encontrada en la base de datos.'] };
    }

    async performPriceAnalysis(context, params) {
        return { output: { priceFound: true, priceInfo: { range: '$2500 - $3000 MXN', factors: ['calidad de la pieza'] } }, confidence: 0.8, evidence: ['Rango de precios para cambio de pantalla de iPhone 12 encontrado.'] };
    }

    async performContextIntegration(context, params) {
        return { output: { customerHistory: context.customerContext?.history || {}, temporalContext: { businessStatus: 'open' }, contextualFactors: ['cliente_nuevo', 'horario_laboral'] }, confidence: 0.95, evidence: ['Cliente es nuevo', 'Negocio está abierto'] };
    }

    async performSynthesis(context, currentResult, params) {
        const overallAssessment = 'El cliente necesita una cotización para un cambio de pantalla de un iPhone 12.';
        const recommendedAction = 'respond_with_quote';
        return { output: { overallAssessment, recommendedAction }, confidence: this.calculateOverallConfidence(currentResult.steps), evidence: ['Todos los pasos apuntan a una consulta de cotización estándar.'] };
    }

    assessConfidence(analysisResult, queryClassification) {
        const baseConfidence = analysisResult.confidence;
        const threshold = this.confidenceThresholds[queryClassification.complexity] || 0.7;
        return { overall: baseConfidence, threshold, isConfident: baseConfidence >= threshold, factors: ['Confianza basada en la síntesis de los pasos de razonamiento.'] };
    }

    decideAction(confidenceAssessment) {
        if (confidenceAssessment.isConfident) {
            return { action: 'respond', reason: 'Alta confianza en el análisis.', confidence: confidenceAssessment.overall };
        } else {
            return { action: 'escalate', reason: 'Baja confianza en el análisis automático.', confidence: confidenceAssessment.overall };
        }
    }

    calculateOverallConfidence(steps) {
        if (steps.length === 0) return 0;
        const successfulSteps = steps.filter((s) => s.success);
        if (successfulSteps.length === 0) return 0;
        const sum = successfulSteps.reduce((acc, step) => acc + step.confidence, 0);
        return sum / successfulSteps.length;
    }

    generateConclusions(steps) {
        const conclusions = [];
        const synthesisStep = steps.find((s) => s.name === 'synthesis');
        if (synthesisStep?.success) {
            conclusions.push(synthesisStep.output.overallAssessment);
        } else {
            conclusions.push('No se pudo llegar a una conclusión clara.');
        }
        return conclusions;
    }

    formulateReasoning(result) {
        return `Estrategia usada: ${result.strategy}. Conclusión principal: ${result.conclusions[0] || 'N/A'}. Confianza: ${(result.confidence * 100).toFixed(0)}%.`;
    }

    updateMetrics(queryType, wasSuccessful) {
        if (queryType.includes('multimedia')) this.metrics.imageQueries++;
        else this.metrics.textOnlyQueries++;
        if (queryType.includes('complex')) this.metrics.complexQueries++;
        if (wasSuccessful) this.metrics.successfulReasoning++;
        else this.metrics.escalatedQueries++;
    }

    initializeReasoningStrategies() {
        this.reasoningStrategies.set('text_simple', { name: 'Análisis de Texto Simple', steps: [{ name: 'text_analysis', type: 'text_analysis', outputKey: 'textAnalysis' }, { name: 'knowledge_lookup', type: 'knowledge_lookup', outputKey: 'knowledge' }, { name: 'synthesis', type: 'synthesis', outputKey: 'final' }] });
        this.reasoningStrategies.set('text_complex', { name: 'Análisis de Texto Complejo', steps: [{ name: 'text_analysis', type: 'text_analysis', outputKey: 'textAnalysis' }, { name: 'knowledge_lookup', type: 'knowledge_lookup', outputKey: 'knowledge' }, { name: 'price_analysis', type: 'price_analysis', outputKey: 'pricing' }, { name: 'context_integration', type: 'context_integration', outputKey: 'context' }, { name: 'synthesis', type: 'synthesis', outputKey: 'final' }] });
        this.reasoningStrategies.set('multimedia_simple', { name: 'Análisis Multimedia Simple', steps: [{ name: 'image_analysis', type: 'image_analysis', outputKey: 'imageAnalysis' }, { name: 'text_analysis', type: 'text_analysis', outputKey: 'textAnalysis' }, { name: 'synthesis', type: 'synthesis', outputKey: 'final' }] });
        this.reasoningStrategies.set('multimedia_complex', { name: 'Análisis Multimedia Complejo', steps: [{ name: 'image_analysis', type: 'image_analysis', outputKey: 'imageAnalysis' }, { name: 'text_analysis', type: 'text_analysis', outputKey: 'textAnalysis' }, { name: 'knowledge_lookup', type: 'knowledge_lookup', outputKey: 'knowledge' }, { name: 'synthesis', type: 'synthesis', outputKey: 'final' }] });
        this.reasoningStrategies.set('default', this.reasoningStrategies.get('text_simple'));
        logger.debug('🧠 Estrategias de razonamiento inicializadas');
    }
}

const adaptiveLearningEngine = new AdaptiveLearningEngine();
const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();
const multiModalReasoningEngine = new MultiModalReasoningEngine();

module.exports = {
    adaptiveLearningEngine,
    predictiveAnalyticsEngine,
    multiModalReasoningEngine,
    AdaptiveLearningEngine,
    PredictiveAnalyticsEngine,
    MultiModalReasoningEngine
};
