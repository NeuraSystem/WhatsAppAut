// src/services/guardrails.js

const logger = require('../utils/logger');
const config = require('../utils/config'); // Importar la configuración centralizada

/**
 * Clase Guardrails para filtrar y validar las respuestas del agente.
 * Asegura que las respuestas cumplan con las reglas de negocio y ética.
 */
class Guardrails {
    constructor() {
        // Las reglas ahora usan la configuración externa
        this.rules = [
            this.checkNoPromises.bind(this),
            this.checkNoToxicity.bind(this),
            this.checkNoOffTopic.bind(this),
            this.checkNoPersonalOpinions.bind(this),
            this.checkNoSensitiveInfoRequest.bind(this),
            this.checkResponseLength.bind(this),
        ];
        logger.info('🛡️ Guardrails inicializados con reglas de validación desde la configuración central.');
    }

    /**
     * Procesa la respuesta del agente a través de todas las reglas de guardarraíl.
     * @param {string} agentResponse - La respuesta generada por el agente.
     * @param {string} userQuery - La consulta original del usuario (para contexto).
     * @returns {string} La respuesta filtrada o una respuesta de fallback si se viola una regla crítica.
     */
    processResponse(agentResponse, userQuery) {
        let filteredResponse = agentResponse;
        let violations = [];

        for (const rule of this.rules) {
            const result = rule(filteredResponse, userQuery);
            if (result.violation) {
                violations.push(result.message);
                // Si es una violación crítica, devolvemos un fallback inmediato
                if (result.critical) {
                    logger.warn(`CRITICAL GUARDRAIL VIOLATION: ${result.message} for query: "${userQuery}"`);
                    return "Disculpa, no puedo responder a eso. Por favor, intenta con otra pregunta.";
                }
            }
        }

        if (violations.length > 0) {
            logger.warn(`Guardrail violations detected for query: "${userQuery}": ${violations.join('; ')}`);
            // Aquí podríamos ajustar la respuesta o simplemente loguear la violación
        }

        return filteredResponse;
    }

    /**
     * Regla: No prometer cosas que el bot no puede garantizar.
     * @param {string} response
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkNoPromises(response) {
        if (config.guardrails.noPromises.some(keyword => keyword.test(response))) {
            return { violation: true, message: 'Respuesta contiene promesas no garantizadas.', critical: false };
        }
        return { violation: false };
    }

    /**
     * Regla: No ser tóxico, ofensivo o inapropiado.
     * @param {string} response
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkNoToxicity(response) {
        if (config.guardrails.noToxicity.some(keyword => keyword.test(response))) {
            return { violation: true, message: 'Respuesta contiene lenguaje tóxico.', critical: true };
        }
        return { violation: false };
    }

    /**
     * Regla: Mantenerse en el tema del negocio (reparación de celulares).
     * @param {string} response
     * @param {string} userQuery
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkNoOffTopic(response, userQuery) {
        // Lógica simple mejorada para detectar si el tema es de negocio o no
        const isBusinessRelated = config.guardrails.businessKeywords.some(keyword => keyword.test(response) || keyword.test(userQuery));
        const isClearlyOffTopic = config.guardrails.offTopicKeywords.some(keyword => keyword.test(response));

        if (isClearlyOffTopic && !isBusinessRelated) {
            return { violation: true, message: 'Respuesta fuera de tema.', critical: false };
        }
        return { violation: false };
    }

    /**
     * Regla: No expresar opiniones personales.
     * @param {string} response
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkNoPersonalOpinions(response) {
        if (config.guardrails.noPersonalOpinions.some(keyword => keyword.test(response))) {
            return { violation: true, message: 'Respuesta contiene opinión personal.', critical: false };
        }
        return { violation: false };
    }

    /**
     * Regla: No solicitar información sensible (ej. contraseñas, datos bancarios).
     * @param {string} response
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkNoSensitiveInfoRequest(response) {
        if (config.guardrails.noSensitiveInfoRequest.some(keyword => keyword.test(response))) {
            return { violation: true, message: 'Respuesta solicita información sensible.', critical: true };
        }
        return { violation: false };
    }

    /**
     * Regla: Limitar la longitud de la respuesta para mantenerla concisa.
     * @param {string} response
     * @returns {{violation: boolean, message: string, critical: boolean}}
     */
    checkResponseLength(response) {
        const maxLength = config.guardrails.maxLength;
        if (response.length > maxLength) {
            return { violation: true, message: `Respuesta excede la longitud máxima de ${maxLength} caracteres.`, critical: false };
        }
        return { violation: false };
    }
}

module.exports = { Guardrails };