
// src/services/classifiers/qwenClassifier.js

const QwenLocalClient = require('../../utils/qwenLocal');
const logger = require('../../utils/logger');
const intentions = require('../../../intentions_dataset.json').intenciones;

/**
 * Clasificador de intención que utiliza un LLM local (Qwen) para determinar
 * la intención del usuario y un score de confianza.
 */
class QwenClassifier {
    constructor() {
        this.localClient = new QwenLocalClient();
        this.intentionsList = intentions.map(item => item.intencion);
        this.uniqueIntentions = [...new Set(this.intentionsList)];
    }

    /**
     * Clasifica la intención de una consulta de usuario.
     * @param {string} userQuery - La consulta del usuario.
     * @returns {Promise<{intention: string, confidence: number, rawResponse: string}>}
     */
    async classify(userQuery) {
        if (!await this.localClient.checkHealth()) {
            logger.warn('QwenClassifier: LLM local no disponible. Saltando clasificación.');
            return { intention: 'fallback', confidence: 0, rawResponse: 'LLM_UNAVAILABLE' };
        }

        const prompt = this.buildClassificationPrompt(userQuery);

        try {
            const result = await this.localClient.generate(prompt, {
                temperature: 0.1,
                max_tokens: 50,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return this.parseResponse(result.response);

        } catch (error) {
            logger.error('QwenClassifier: Error durante la clasificación:', error);
            return { intention: 'error', confidence: 0, rawResponse: error.message };
        }
    }

    /**
     * Construye el prompt para la clasificación de intención.
     * @param {string} userQuery - La consulta del usuario.
     * @returns {string} El prompt para el LLM.
     */
    buildClassificationPrompt(userQuery) {
        const intentionsString = this.uniqueIntentions.join(', ');

        return `Eres un experto clasificador de intenciones para un bot de WhatsApp de un taller de reparación de celulares.

Tu tarea es analizar la consulta del cliente y clasificarla en UNA de las siguientes categorías. Además, debes proporcionar un score de confianza (de 0 a 1) sobre tu clasificación.

**Categorías de Intención Válidas:**
[${intentionsString}]

**Consulta del Cliente:**
"${userQuery}"

**Formato de Respuesta Obligatorio (SOLO JSON):**
{"intencion": "tu_clasificacion", "confianza": tu_score_de_confianza}

**Ejemplos:**
- Consulta: "hola buenas tardes" -> {"intencion": "saludo", "confianza": 0.99}
- Consulta: "cuanto por la pantalla del s23?" -> {"intencion": "consulta_precio", "confianza": 0.95}
- Consulta: "necesito hablar con un humano" -> {"intencion": "escalacion_humana", "confianza": 1.0}
- Consulta: "gracias" -> {"intencion": "agradecimiento", "confianza": 0.98}

**Tu Clasificación (solo JSON):**
`;
    }

    /**
     * Parsea la respuesta del LLM para extraer la intención y la confianza.
     * @param {string} rawResponse - La respuesta en texto plano del LLM.
     * @returns {{intention: string, confidence: number, rawResponse: string}}
     */
    parseResponse(rawResponse) {
        try {
            let cleanResponse = rawResponse.trim().replace(/```json\n?|\n?```/g, '');
            const jsonMatch = cleanResponse.match(/\{.*\}/s);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanResponse);

            const intention = parsed.intencion || 'unknown';
            const confidence = parseFloat(parsed.confianza) || 0;

            if (!this.uniqueIntentions.includes(intention)) {
                logger.warn(`QwenClassifier: Intención clasificada "${intention}" no es una intención válida.`);
                return { intention: 'unknown', confidence: 0, rawResponse };
            }

            return { intention, confidence, rawResponse };

        } catch (error) {
            logger.error('QwenClassifier: Error parseando la respuesta del LLM.', {
                rawResponse,
                error: error.message
            });
            return { intention: 'error', confidence: 0, rawResponse };
        }
    }
}

module.exports = { QwenClassifier };
