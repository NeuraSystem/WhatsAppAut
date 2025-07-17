// src/services/guardrails.js

const { RunnableSequence } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { initializeEmbeddingEngine } = require('./embeddingEngine');
const logger = require('../utils/logger');
const config = require('../utils/config');

class Guardrails {
    constructor(llm) {
        this.llm = llm;
        this.validationChain = this.createValidationChain();
        logger.info('🛡️ Guardrails inicializados con cadena de validación LCEL.');
    }

    createValidationChain() {
        const validationTemplate = `
            Eres un sistema de validación de respuestas para un bot de reparaciones de celulares.
            Evalúa la siguiente respuesta generada por el bot en el contexto de la consulta del usuario.
            Consulta del usuario: "{userQuery}"
            Respuesta del bot: "{agentResponse}"

            Realiza las siguientes comprobaciones:
            1.  **Toxicidad**: ¿La respuesta es tóxica, ofensiva o inapropiada? (Sí/No)
            2.  **Fuera de Tema**: ¿La respuesta se desvía del tema de reparaciones de celulares, precios, o información del negocio? (Sí/No)
            3.  **Opiniones Personales**: ¿La respuesta contiene opiniones personales como "creo que" o "en mi opinión"? (Sí/No)
            4.  **Promesas Falsas**: ¿La respuesta garantiza algo que no puede cumplir, como "100% seguro" o "garantizado"? (Sí/No)
            5.  **Solicitud de Información Sensible**: ¿La respuesta pide información sensible como contraseñas o datos bancarios? (Sí/No)

            Formato de salida:
            Toxicidad: [Sí/No]
            Fuera de Tema: [Sí/No]
            Opiniones Personales: [Sí/No]
            Promesas Falsas: [Sí/No]
            Solicitud de Información Sensible: [Sí/No]
            Veredicto: [PASA/FALLA]
            Razón: [Explica brevemente por qué FALLA, o "N/A" si PASA]
        `;

        const validationPrompt = new PromptTemplate({
            template: validationTemplate,
            inputVariables: ["userQuery", "agentResponse"],
        });

        return RunnableSequence.from([
            validationPrompt,
            this.llm,
            new StringOutputParser(),
        ]);
    }

    async processResponse(agentResponse, userQuery) {
        if (agentResponse.length > config.guardrails.responseMaxLength) {
            logger.warn(`Guardrail VIOLATION: La respuesta excede la longitud máxima de ${config.guardrails.responseMaxLength} caracteres.`);
            return "La respuesta es demasiado larga. Por favor, sé más conciso.";
        }

        try {
            const validationResult = await this.validationChain.invoke({
                userQuery,
                agentResponse,
            });

            const verdict = this.parseVerdict(validationResult);

            if (verdict.veredicto === 'FALLA') {
                logger.warn(`Guardrail VIOLATION: ${verdict.razon} for query: "${userQuery}"`);
                return "Disculpa, no puedo responder a eso. Por favor, intenta con otra pregunta.";
            }

            return agentResponse;
        } catch (error) {
            logger.error('Error durante la validación de guardrails:', error);
            // En caso de error en la validación, ser conservador y no enviar la respuesta.
            return "Hubo un problema al validar la respuesta. Inténtalo de nuevo.";
        }
    }

    parseVerdict(validationResult) {
        const lines = validationResult.split('\n');
        const result = {};
        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                result[key] = value;
            }
        });

        return {
            veredicto: result.Veredicto || 'FALLA',
            razon: result.Razón || 'No se pudo parsear el veredicto.',
        };
    }
}

module.exports = { Guardrails };