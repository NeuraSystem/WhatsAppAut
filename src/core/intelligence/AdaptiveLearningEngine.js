/**
 * @file AdaptiveLearningEngine.js
 * @description Motor de aprendizaje adaptativo que aprende de las decisiones del administrador
 * @module core/intelligence/AdaptiveLearningEngine
 * @version 1.0.0
 * @author Claude (Anthropic AI)
 * @date 2025-07-17
 */

const logger = require('../../utils/logger');
const { initializeDatabase } = require('../../database/pg');

/**
 * Motor de aprendizaje que registra decisiones del administrador y las automatiza
 * después de 3 decisiones similares repetidas
 */
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
    
    /**
     * Registra una decisión del administrador
     * @param {Object} decisionData - Datos de la decisión
     */
    async recordAdminDecision(decisionData) {
        try {
            // Generar patrón de la situación
            const pattern = this.generateSituationPattern(decisionData.situation);
            
            // Crear registro de decisión
            const decisionRecord = {
                pattern,
                situation: decisionData.situation,
                adminResponse: decisionData.adminResponse,
                customerResponse: decisionData.customerResponse || null,
                timestamp: Date.now(),
                success: decisionData.success || null, // Se actualiza después
                context: decisionData.context || {}
            };
            
            // Añadir a patrones
            if (!this.decisionPatterns.has(pattern)) {
                this.decisionPatterns.set(pattern, []);
            }
            
            this.decisionPatterns.get(pattern).push(decisionRecord);
            this.metrics.totalDecisions++;
            
            // Guardar en base de datos
            await this.saveDecisionToDatabase(decisionRecord);
            
            // Verificar si podemos crear auto-decisión
            await this.checkForNewAutoDecision(pattern);
            
            logger.info('📝 Decisión del admin registrada', {
                pattern: pattern.substring(0, 50) + '...',
                totalForPattern: this.decisionPatterns.get(pattern).length
            });
            
        } catch (error) {
            logger.error('❌ Error registrando decisión del admin:', error);
        }
    }
    
    /**
     * Verifica si una situación puede manejarse automáticamente
     * @param {Object} situation - Situación a evaluar
     * @returns {Object|null} - Auto-decisión si disponible
     */
    async checkForAutoDecision(situation) {
        const pattern = this.generateSituationPattern(situation);
        
        // Verificar si hay auto-decisión aprobada
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
    
    /**
     * Verifica si se puede crear una nueva auto-decisión
     * @param {String} pattern - Patrón de la situación
     */
    async checkForNewAutoDecision(pattern) {
        const decisions = this.decisionPatterns.get(pattern);
        
        if (decisions.length >= this.PATTERN_THRESHOLD) {
            // Analizar consistencia de decisiones
            const consistency = this.analyzeDecisionConsistency(decisions);
            
            if (consistency.confidence >= this.CONFIDENCE_THRESHOLD) {
                // Crear propuesta de auto-decisión
                const autoDecisionProposal = {
                    pattern,
                    recommendedResponse: consistency.mostCommonResponse,
                    confidence: consistency.confidence,
                    basedOnDecisions: decisions.length,
                    examples: decisions.slice(-3), // Últimas 3 decisiones
                    timestamp: Date.now(),
                    status: 'pending_approval'
                };
                
                this.pendingAutoDecisions.set(pattern, autoDecisionProposal);
                
                // Solicitar aprobación del administrador
                await this.requestAutoDecisionApproval(autoDecisionProposal);
                
                logger.info('🎯 Nueva auto-decisión propuesta', {
                    pattern: pattern.substring(0, 50) + '...',
                    confidence: consistency.confidence,
                    basedOn: decisions.length + ' decisiones'
                });
            }
        }
    }
    
    /**
     * Analiza la consistencia de las decisiones para un patrón
     * @param {Array} decisions - Array de decisiones
     * @returns {Object} - Análisis de consistencia
     */
    analyzeDecisionConsistency(decisions) {
        // Agrupar decisiones similares
        const responseGroups = new Map();
        
        decisions.forEach(decision => {
            const normalizedResponse = this.normalizeResponse(decision.adminResponse);
            
            if (!responseGroups.has(normalizedResponse)) {
                responseGroups.set(normalizedResponse, []);
            }
            
            responseGroups.get(normalizedResponse).push(decision);
        });
        
        // Encontrar respuesta más común
        let mostCommonResponse = '';
        let maxCount = 0;
        
        for (const [response, group] of responseGroups.entries()) {
            if (group.length > maxCount) {
                maxCount = group.length;
                mostCommonResponse = response;
            }
        }
        
        // Calcular confianza
        const confidence = maxCount / decisions.length;
        
        return {
            mostCommonResponse,
            confidence,
            responseGroups: Array.from(responseGroups.entries()).map(([response, group]) => ({
                response,
                count: group.length,
                percentage: (group.length / decisions.length * 100).toFixed(1)
            }))
        };
    }
    
    /**
     * Solicita aprobación del administrador para auto-decisión
     * @param {Object} proposal - Propuesta de auto-decisión
     */
    async requestAutoDecisionApproval(proposal) {
        // Formatear mensaje para el administrador
        const approvalMessage = this.formatApprovalRequest(proposal);
        
        // Aquí enviarías el mensaje al administrador
        // Por ahora solo logueamos
        logger.info('📋 Solicitud de aprobación enviada al admin', {
            pattern: proposal.pattern.substring(0, 50) + '...',
            confidence: proposal.confidence
        });
        
        // En una implementación real, esto se enviaría via WhatsApp al admin
        // await whatsappClient.sendMessage(adminNumber, approvalMessage);
    }
    
    /**
     * Formatea la solicitud de aprobación para el administrador
     * @param {Object} proposal - Propuesta de auto-decisión
     * @returns {String} - Mensaje formateado
     */
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
    
    /**
     * Maneja la respuesta del admin a una propuesta de auto-decisión
     * @param {String} adminResponse - Respuesta del administrador
     */
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
    
    /**
     * Aprueba una auto-decisión
     * @param {String} patternId - ID del patrón
     */
    async approveAutoDecision(patternId) {
        // Buscar propuesta pendiente
        let approvedProposal = null;
        for (const [pattern, proposal] of this.pendingAutoDecisions.entries()) {
            if (pattern.startsWith(patternId)) {
                approvedProposal = proposal;
                this.pendingAutoDecisions.delete(pattern);
                break;
            }
        }
        
        if (approvedProposal) {
            // Activar auto-decisión
            this.autoDecisions.set(approvedProposal.pattern, {
                response: approvedProposal.recommendedResponse,
                confidence: approvedProposal.confidence,
                activatedAt: Date.now(),
                usageCount: 0
            });
            
            this.metrics.patternsLearned++;
            
            // Guardar en base de datos
            await this.saveAutoDecisionToDatabase(approvedProposal);
            
            logger.info('✅ Auto-decisión aprobada y activada', {
                pattern: approvedProposal.pattern.substring(0, 50) + '...',
                confidence: approvedProposal.confidence
            });
        }
    }
    
    /**
     * Rechaza una auto-decisión
     * @param {String} patternId - ID del patrón
     */
    async rejectAutoDecision(patternId) {
        // Buscar y remover propuesta pendiente
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
    
    /**
     * Genera un patrón de situación para identificar casos similares
     * @param {Object} situation - Datos de la situación
     * @returns {String} - Patrón generado
     */
    generateSituationPattern(situation) {
        const components = [];
        
        // Tipo de consulta
        if (situation.queryType) {
            components.push(`query:${situation.queryType}`);
        }
        
        // Modelo de dispositivo (normalizado)
        if (situation.deviceModel) {
            const normalizedModel = this.normalizeDeviceModel(situation.deviceModel);
            components.push(`device:${normalizedModel}`);
        }
        
        // Tipo de servicio
        if (situation.serviceType) {
            components.push(`service:${situation.serviceType}`);
        }
        
        // Hora del día (categorizada)
        if (situation.timeOfDay) {
            const timeCategory = this.categorizeTimeOfDay(situation.timeOfDay);
            components.push(`time:${timeCategory}`);
        }
        
        // Tipo de cliente
        if (situation.customerType) {
            components.push(`customer:${situation.customerType}`);
        }
        
        // Urgencia
        if (situation.urgency) {
            components.push(`urgency:${situation.urgency}`);
        }
        
        return components.join('|');
    }
    
    /**
     * Normaliza la respuesta del administrador para comparación
     * @param {String} response - Respuesta original
     * @returns {String} - Respuesta normalizada
     */
    normalizeResponse(response) {
        return response
            .toLowerCase()
            .replace(/\d+/g, 'NUM') // Reemplazar números con placeholder
            .replace(/[^\w\s]/g, '') // Remover puntuación
            .trim();
    }
    
    /**
     * Normaliza modelo de dispositivo
     * @param {String} model - Modelo original
     * @returns {String} - Modelo normalizado
     */
    normalizeDeviceModel(model) {
        return model
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 10); // Limitar longitud
    }
    
    /**
     * Categoriza hora del día
     * @param {Number} hour - Hora (0-23)
     * @returns {String} - Categoría
     */
    categorizeTimeOfDay(hour) {
        if (hour >= 9 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 16) return 'afternoon';
        if (hour >= 16 && hour < 20) return 'evening';
        return 'night';
    }
    
    /**
     * Describe situación desde patrón para mostrar al admin
     * @param {String} pattern - Patrón de situación
     * @returns {String} - Descripción legible
     */
    describeSituationFromPattern(pattern) {
        const components = pattern.split('|');
        const descriptions = [];
        
        components.forEach(component => {
            const [type, value] = component.split(':');
            
            switch (type) {
                case 'query':
                    descriptions.push(`Consulta sobre: ${value}`);
                    break;
                case 'device':
                    descriptions.push(`Dispositivo: ${value}`);
                    break;
                case 'service':
                    descriptions.push(`Servicio: ${value}`);
                    break;
                case 'time':
                    descriptions.push(`Horario: ${value}`);
                    break;
                case 'customer':
                    descriptions.push(`Cliente: ${value}`);
                    break;
                case 'urgency':
                    descriptions.push(`Urgencia: ${value}`);
                    break;
            }
        });
        
        return descriptions.join(', ');
    }
    
    /**
     * Guarda decisión en base de datos
     * @param {Object} decisionRecord - Registro de decisión
     */
    async saveDecisionToDatabase(decisionRecord) {
        try {
            // Implementar guardado en PostgreSQL
            // Por ahora solo logueamos
            logger.debug('💾 Guardando decisión en BD', {
                pattern: decisionRecord.pattern.substring(0, 30) + '...'
            });
        } catch (error) {
            logger.error('❌ Error guardando decisión en BD:', error);
        }
    }
    
    /**
     * Guarda auto-decisión en base de datos
     * @param {Object} autoDecision - Auto-decisión aprobada
     */
    async saveAutoDecisionToDatabase(autoDecision) {
        try {
            // Implementar guardado en PostgreSQL
            logger.debug('💾 Guardando auto-decisión en BD', {
                pattern: autoDecision.pattern.substring(0, 30) + '...'
            });
        } catch (error) {
            logger.error('❌ Error guardando auto-decisión en BD:', error);
        }
    }
    
    /**
     * Marca el éxito/fracaso de una decisión
     * @param {String} decisionId - ID de la decisión
     * @param {Boolean} success - Si fue exitosa
     */
    async markDecisionSuccess(decisionId, success) {
        // Buscar decisión y actualizar éxito
        for (const [pattern, decisions] of this.decisionPatterns.entries()) {
            const decision = decisions.find(d => d.id === decisionId);
            if (decision) {
                decision.success = success;
                
                // Actualizar métricas de precisión
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
    
    /**
     * Actualiza métricas de precisión
     */
    updateAccuracyMetrics() {
        let totalEvaluated = 0;
        let successfulDecisions = 0;
        
        for (const decisions of this.decisionPatterns.values()) {
            decisions.forEach(decision => {
                if (decision.success !== null) {
                    totalEvaluated++;
                    if (decision.success) {
                        successfulDecisions++;
                    }
                }
            });
        }
        
        this.metrics.autoDecisionAccuracy = totalEvaluated > 0 ? 
            successfulDecisions / totalEvaluated : 0;
    }
    
    /**
     * Obtener métricas del sistema de aprendizaje
     * @returns {Object} - Métricas
     */
    getMetrics() {
        return {
            ...this.metrics,
            totalPatterns: this.decisionPatterns.size,
            activeAutoDecisions: this.autoDecisions.size,
            pendingApprovals: this.pendingAutoDecisions.size
        };
    }
    
    /**
     * Obtener decisiones pendientes de aprobación
     * @returns {Array} - Lista de propuestas pendientes
     */
    getPendingApprovals() {
        return Array.from(this.pendingAutoDecisions.values());
    }
    
    /**
     * Obtener auto-decisiones activas
     * @returns {Array} - Lista de auto-decisiones activas
     */
    getActiveAutoDecisions() {
        return Array.from(this.autoDecisions.entries()).map(([pattern, decision]) => ({
            pattern: this.describeSituationFromPattern(pattern),
            response: decision.response,
            confidence: decision.confidence,
            usageCount: decision.usageCount,
            activatedAt: decision.activatedAt
        }));
    }
    
    /**
     * Shutdown del sistema
     */
    async shutdown() {
        // Limpiar datos en memoria
        this.decisionPatterns.clear();
        this.autoDecisions.clear();
        this.pendingAutoDecisions.clear();
        
        logger.info('🔄 AdaptiveLearningEngine shutdown completed');
    }
}

// Export singleton instance
const adaptiveLearningEngine = new AdaptiveLearningEngine();
module.exports = adaptiveLearningEngine;
