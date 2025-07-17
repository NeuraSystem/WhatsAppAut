// src/utils/qwenLocal.js

const axios = require('axios');
const logger = require('./logger');

/**
 * Cliente para LLM local Qwen2.5-1.5B via Ollama
 */
class QwenLocalClient {
    constructor() {
        this.baseURL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
        this.model = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b-instruct-q4_0';
        this.defaultOptions = {
            temperature: 0.3,
            top_p: 0.9,
            repeat_penalty: 1.1,
            num_predict: 150, // Máximo 150 tokens para respuestas concisas
            stop: ['Usuario:', 'Human:', 'Cliente:'] // Tokens de parada
        };
        this.isAvailable = false;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = parseInt(process.env.LOCAL_LLM_HEALTH_CHECK_INTERVAL) || 30000;
    }

    /**
     * Verifica si Ollama está disponible y funcionando.
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        const now = Date.now();
        
        // Cache health check por 30 segundos
        if (now - this.lastHealthCheck < this.healthCheckInterval && this.isAvailable) {
            return this.isAvailable;
        }

        try {
            const response = await axios.get(`${this.baseURL}/api/tags`, {
                timeout: 5000
            });
            
            const hasQwen = response.data.models?.some(model => 
                model.name.includes('qwen2.5') && model.name.includes('1.5b')
            );
            
            this.isAvailable = hasQwen;
            this.lastHealthCheck = now;
            
            if (!hasQwen) {
                logger.warn('Qwen2.5-1.5B no encontrado en Ollama. Modelos disponibles:', 
                    response.data.models?.map(m => m.name));
            }
            
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            this.lastHealthCheck = now;
            logger.warn('Ollama no disponible:', error.message);
            return false;
        }
    }

    /**
     * Genera respuesta usando Qwen2.5 local.
     * @param {string} prompt - El prompt completo.
     * @param {Object} options - Opciones de generación.
     * @returns {Promise<Object>} Respuesta del modelo.
     */
    async generate(prompt, options = {}) {
        if (!await this.checkHealth()) {
            throw new Error('Qwen2.5 local no disponible');
        }

        const startTime = Date.now();
        
        try {
            const requestOptions = {
                ...this.defaultOptions,
                ...options
            };

            const response = await axios.post(`${this.baseURL}/api/generate`, {
                model: this.model,
                prompt: prompt,
                options: requestOptions,
                stream: false
            }, {
                timeout: parseInt(process.env.LOCAL_LLM_TIMEOUT) || 15000
            });

            const endTime = Date.now();
            const latency = endTime - startTime;

            logger.info(`Qwen2.5 response time: ${latency}ms`);

            return {
                success: true,
                response: response.data.response,
                latency: latency,
                tokens: response.data.eval_count || 0,
                tokensPerSecond: response.data.eval_count ? 
                    Math.round((response.data.eval_count / latency) * 1000) : 0
            };

        } catch (error) {
            const endTime = Date.now();
            const latency = endTime - startTime;

            logger.error(`Qwen2.5 error after ${latency}ms:`, error.message);
            
            return {
                success: false,
                error: error.message,
                latency: latency
            };
        }
    }

    /**
     * Procesa consulta de cliente y extrae información estructurada.
     * @param {string} userQuery - Consulta del usuario.
     * @param {Object} context - Contexto conversacional.
     * @returns {Promise<Object>} Información extraída.
     */
    async extractQueryInfo(userQuery, context = {}) {
        const prompt = this.buildExtractionPrompt(userQuery, context);
        
        const result = await this.generate(prompt, {
            temperature: 0.1, // Muy determinístico para extracción
            num_predict: 100   // Respuesta corta
        });

        if (!result.success) {
            throw new Error(`Error en extracción: ${result.error}`);
        }

        try {
            // Limpiar respuesta y parsear JSON
            let cleanResponse = result.response.trim();
            
            // Remover markdown si existe
            cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, '');
            
            // Buscar el JSON en la respuesta
            const jsonMatch = cleanResponse.match(/\{.*\}/s);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }

            const extracted = JSON.parse(cleanResponse);
            
            return {
                ...extracted,
                _meta: {
                    latency: result.latency,
                    tokensPerSecond: result.tokensPerSecond
                }
            };

        } catch (parseError) {
            logger.error('Error parsing Qwen2.5 extraction response:', {
                response: result.response,
                error: parseError.message
            });

            // Fallback: extracción básica manual
            return this.fallbackExtraction(userQuery, context);
        }
    }

    /**
     * Genera respuesta conversacional natural.
     * @param {string} userQuery - Consulta original del usuario.
     * @param {Object} context - Contexto conversacional.
     * @param {Object} productInfo - Información de productos (opcional).
     * @returns {Promise<Object>} Respuesta conversacional.
     */
    async generateConversationalResponse(userQuery, context, productInfo = null) {
        const prompt = this.buildConversationalPrompt(userQuery, context, productInfo);
        
        const result = await this.generate(prompt, {
            temperature: 0.4,  // Más creatividad para conversación
            num_predict: 120   // Respuestas de longitud media
        });

        if (!result.success) {
            throw new Error(`Error en generación conversacional: ${result.error}`);
        }

        return {
            respuesta_completa: result.response.trim(),
            _meta: {
                latency: result.latency,
                tokensPerSecond: result.tokensPerSecond,
                tokens: result.tokens
            }
        };
    }

    /**
     * Construye prompt optimizado para extracción de información.
     * @param {string} userQuery - Consulta del usuario.
     * @param {Object} context - Contexto.
     * @returns {string} Prompt optimizado.
     */
    buildExtractionPrompt(userQuery, context) {
        return `Eres un extractor de información para un negocio de reparación de celulares.

CONSULTA DEL CLIENTE: "${userQuery}"

INSTRUCCIONES:
1. Extrae SOLO información específica y clara
2. Si no estás seguro de algo, marca como null
3. Responde ÚNICAMENTE en formato JSON válido

FORMATO DE RESPUESTA:
{
  "marca": "samsung|iphone|xiaomi|huawei|lg|motorola|nokia|otro|null",
  "modelo": "nombre específico del modelo o null",
  "tipo_reparacion": "pantalla|bateria|cargador|bocina|camara|boton|microfono|otro|null",
  "intencion": "consulta_precio|consulta_disponibilidad|consulta_tiempo|consulta_ubicacion|saludo|agradecimiento|otro",
  "tono_cliente": "formal|informal|neutral",
  "es_consulta_tecnica": true/false,
  "productos_mencionados": ["lista", "de", "productos"],
  "necesita_aclaracion": true/false
}

EJEMPLOS:
Usuario: "cuanto pantalla s23" → {"marca": "samsung", "modelo": "galaxy s23", "tipo_reparacion": "pantalla", "intencion": "consulta_precio", "tono_cliente": "informal", "es_consulta_tecnica": false, "productos_mencionados": ["samsung", "s23", "pantalla"], "necesita_aclaracion": false}

Usuario: "hola buenas tardes" → {"marca": null, "modelo": null, "tipo_reparacion": null, "intencion": "saludo", "tono_cliente": "formal", "es_consulta_tecnica": false, "productos_mencionados": [], "necesita_aclaracion": false}

RESPUESTA JSON:`;
    }

    /**
     * Construye prompt para respuesta conversacional natural.
     * @param {string} userQuery - Consulta original.
     * @param {Object} context - Contexto conversacional.
     * @param {Object} productInfo - Información de productos.
     * @returns {string} Prompt conversacional.
     */
    buildConversationalPrompt(userQuery, context, productInfo) {
        const timeGreeting = this.getTimeBasedGreeting(context.horaActual);
        const toneStyle = this.getToneStyle(context.tonoPreferido);
        
        let prompt = `Eres "Salva", asistente virtual empático de Salva Cell (reparación de celulares).

CONTEXTO DEL CLIENTE:
- Nombre: ${context.nombreCliente || 'Nuevo cliente'}
- Es nuevo: ${context.esNuevo ? 'Sí' : 'No'}
- Tono preferido: ${context.tonoPreferido || 'neutral'}
- Consultas anteriores: ${context.totalConsultas || 0}
- Hora: ${timeGreeting}

CONSULTA ORIGINAL: "${userQuery}"
`;

        if (productInfo) {
            prompt += `
INFORMACIÓN VERIFICADA DEL PRODUCTO:
${JSON.stringify(productInfo, null, 2)}
`;
        }

        prompt += `
INSTRUCCIONES PARA RESPUESTA:
1. ${toneStyle}
2. Saluda con energía apropiada para ${timeGreeting}
3. ${context.esNuevo ? 'Pregunta el nombre al final' : `Usa el nombre ${context.nombreCliente}`}
4. ${context.esNuevo && !context.yaSePresentoIA ? 'Preséntate como IA de forma natural' : 'No te presentes de nuevo'}
5. Máximo 100 palabras
6. Incluye emojis naturalmente (😊, 🛠️, etc.)
7. ${productInfo ? 'Usa SOLO la información verificada del producto' : 'Si no tienes información específica, ofrece consultar'}

RESPUESTA NATURAL:`;

        return prompt;
    }

    /**
     * Obtiene saludo basado en la hora.
     * @param {number} hour - Hora del día (0-23).
     * @returns {string} Saludo apropiado.
     */
    getTimeBasedGreeting(hour = new Date().getHours()) {
        if (hour >= 6 && hour < 12) return 'Buenos días';
        if (hour >= 12 && hour < 19) return 'Buenas tardes';
        return 'Buenas noches';
    }

    /**
     * Obtiene estilo de tono para el prompt.
     * @param {string} tone - Tono preferido.
     * @returns {string} Instrucciones de estilo.
     */
    getToneStyle(tone) {
        switch (tone) {
            case 'formal':
                return 'Usa "usted", "disculpe", sé profesional y respetuoso';
            case 'informal':
                return 'Usa "tú", "oye", sé casual y amigable';
            default:
                return 'Usa un tono natural, ni muy formal ni muy informal';
        }
    }

    /**
     * Extracción manual de fallback cuando falla el JSON.
     * @param {string} userQuery - Consulta del usuario.
     * @param {Object} context - Contexto.
     * @returns {Object} Información extraída básica.
     */
    fallbackExtraction(userQuery, context) {
        const lowerQuery = userQuery.toLowerCase();
        
        // Detectar marcas
        const brands = {
            'samsung': ['samsung', 'galaxy', 's23', 's22', 's21', 'note'],
            'iphone': ['iphone', 'apple', 'ios'],
            'xiaomi': ['xiaomi', 'redmi', 'mi'],
            'huawei': ['huawei', 'honor', 'mate'],
            'lg': ['lg'],
            'motorola': ['motorola', 'moto']
        };

        let detectedBrand = null;
        for (const [brand, keywords] of Object.entries(brands)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                detectedBrand = brand;
                break;
            }
        }

        // Detectar tipos de reparación
        const repairs = {
            'pantalla': ['pantalla', 'display', 'screen', 'touch'],
            'bateria': ['bateria', 'battery', 'carga', 'pila'],
            'cargador': ['cargador', 'charger', 'cable'],
            'bocina': ['bocina', 'speaker', 'audio', 'sonido'],
            'camara': ['camara', 'camera', 'foto', 'lente']
        };

        let detectedRepair = null;
        for (const [repair, keywords] of Object.entries(repairs)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                detectedRepair = repair;
                break;
            }
        }

        // Detectar intención
        let intention = 'otro';
        if (lowerQuery.includes('cuanto') || lowerQuery.includes('precio') || lowerQuery.includes('costo')) {
            intention = 'consulta_precio';
        } else if (lowerQuery.includes('hola') || lowerQuery.includes('buenas')) {
            intention = 'saludo';
        } else if (lowerQuery.includes('gracias')) {
            intention = 'agradecimiento';
        } else if (lowerQuery.includes('donde') || lowerQuery.includes('ubicacion')) {
            intention = 'consulta_ubicacion';
        }

        return {
            marca: detectedBrand,
            modelo: null, // Difícil extraer sin IA
            tipo_reparacion: detectedRepair,
            intencion: intention,
            tono_cliente: 'neutral',
            es_consulta_tecnica: Boolean(detectedBrand && detectedRepair),
            productos_mencionados: [detectedBrand, detectedRepair].filter(Boolean),
            necesita_aclaracion: !detectedBrand || !detectedRepair,
            _fallback: true
        };
    }
}

module.exports = QwenLocalClient;