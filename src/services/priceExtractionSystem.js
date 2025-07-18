// src/services/priceExtractionSystem.js
const { pool } = require('../database/pg');
const { ChromaClient } = require('chromadb');
const { getEmbeddingEngine } = require('./embeddingEngine');
const {
    KnowledgeCoherenceLayer
} = require('./knowledge/KnowledgeCoherenceLayer');
const logger = require('../utils/logger');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const { JsonOutputParser } = require('@langchain/core/output_parsers');
const config = require('../../config/config'); // Corregido: require, no antrp

const chromaClient = new ChromaClient({
    path: process.env.CHROMA_URL || 'http://localhost:8000'
});
const coherenceLayer = new KnowledgeCoherenceLayer();

const llm = new ChatOllama({
    baseUrl: config.orchestrator.ollamaBaseUrl,
    model: config.orchestrator.ollamaAgentModel,
    format: 'json' // Especificar que la salida debe ser JSON
});

const parser = new JsonOutputParser();
const extractionPrompt = `
    Eres un experto en extraer información clave de consultas de clientes para un taller de reparación de celulares.
    Tu tarea es identificar el "dispositivo" y el "servicio de reparación" de la siguiente consulta.
    Debes devolver un objeto JSON con las claves "device" y "service".

    Ejemplos:
    - Consulta: "cuanto por cambiar la pantalla de un iphone 13" -> {"device": "iPhone 13", "service": "pantalla"}
    - Consulta: "necesito arreglar la batería de mi samsung s22 ultra" -> {"device": "Samsung S22 Ultra", "service": "bateria"}
    - Consulta: "qué precio tiene el puerto de carga para un motorola g60" -> {"device": "Motorola G60", "service": "puerto_carga"}

    Si no puedes determinar el dispositivo o el servicio, devuelve un string vacío para esa clave.
    Consulta del usuario: "{query}"
`;

class PriceExtractionSystem {
    constructor() {
        this.strategies = [
            this.exactDatabaseMatch.bind(this),
            this.fuzzyDatabaseMatch.bind(this),
            this.fallbackSearch.bind(this)
        ];
    }

    async extractWithLLM(query) {
        try {
            const chain = llm.pipe(parser);
            const prompt = extractionPrompt.replace('{query}', query);
            const result = await chain.invoke(prompt);
            return {
                device: result.device || '',
                service: result.service || 'pantalla' // Default a 'pantalla' si no se extrae
            };
        } catch (error) {
            logger.error('Error en la extracción con LLM:', error);
            return { device: '', service: 'pantalla' }; // Fallback a valores por defecto
        }
    }

    async extractPrice(query) {
        logger.info(`🔍 INICIANDO EXTRACCIÓN DE PRECIO PARA: "${query}"`);
        const normalizedQuery = this.normalizeQuery(query);
        const extracted = await this.extractWithLLM(normalizedQuery);

        logger.info(`📱 DISPOSITIVO EXTRAÍDO (LLM): "${extracted.device}"`);
        logger.info(`🔧 SERVICIO EXTRAÍDO (LLM): "${extracted.service}"`);

        if (!extracted.device) {
            logger.warn(
                'No se pudo extraer el dispositivo con el LLM. Terminando extracción.'
            );
            return {
                price: null,
                confidence: 0,
                method: 'no_device_extracted',
                message:
          'No pude identificar el modelo del dispositivo en tu pregunta. ¿Podrías ser más específico?',
                coherenceValidation: null,
                temporalValidation: null
            };
        }

        for (let i = 0; i < this.strategies.length; i++) {
            try {
                const result = await this.strategies[i](
                    extracted.device,
                    extracted.service,
                    query
                );
                if (result && this.validateResult(result)) {
                    result.method = this.getStrategyName(i);
                    let coherenceValidation = null;
                    try {
                        coherenceValidation = await coherenceLayer.validateBusinessLogic({
                            results: [
                                {
                                    id: `${extracted.device}_${extracted.service}`,
                                    price: result.price
                                }
                            ],
                            metadata: {
                                searchType: 'PRICE_SPECIFIC',
                                sources: ['postgresql']
                            }
                        });
                    } catch (e) {
                        logger.warn(
                            'No se pudo validar con KnowledgeCoherenceLayer:',
                            e.message
                        );
                    }
                    let temporalValidation = null;
                    try {
                        temporalValidation = await coherenceLayer.validateDataFreshness({
                            metadata: { sources: ['postgresql'] }
                        });
                    } catch (e) {
                        logger.warn('No se pudo validar frescura de datos:', e.message);
                    }
                    logger.info(
                        `✅ PRECIO ENCONTRADO: $${result.price} (${result.method}, confianza: ${result.confidence})`
                    );
                    return { ...result, coherenceValidation, temporalValidation };
                }
            } catch (error) {
                logger.warn(
                    `⚠️ Estrategia ${this.getStrategyName(i)} falló:`,
                    error.message
                );
                continue;
            }
        }

        logger.error(`❌ NO SE PUDO EXTRAER PRECIO PARA: "${query}"`);
        return {
            price: null,
            confidence: 0,
            method: 'no_encontrado',
            message:
        'No se encontró información de precio para ese dispositivo específico.',
            coherenceValidation: null,
            temporalValidation: null
        };
    }

    async exactDatabaseMatch(device, service, originalQuery) {
        logger.info(`🎯 ESTRATEGIA 1: Búsqueda exacta - ${device} + ${service}`);
        const query = `
            SELECT modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas
            FROM reparaciones 
            WHERE LOWER(modelo_celular) = LOWER($1) 
            AND LOWER(tipo_reparacion) = LOWER($2)
            AND disponibilidad = 'disponible'
        `;
        const result = await pool.query(query, [device, service]);
        if (result.rows.length > 0) {
            const row = result.rows[0];
            return {
                price: row.precio,
                confidence: 1.0,
                details: {
                    device: row.modelo_celular,
                    service: row.tipo_reparacion,
                    time: row.tiempo_reparacion,
                    availability: row.disponibilidad,
                    notes: row.notas
                }
            };
        }
        return null;
    }

    async fuzzyDatabaseMatch(device, service, originalQuery) {
        logger.info(`🔍 ESTRATEGIA 2: Búsqueda difusa - ${device} + ${service}`);
        const query = `
            SELECT modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas,
                   SIMILARITY(LOWER(modelo_celular), LOWER($1)) as device_sim,
                   SIMILARITY(LOWER(tipo_reparacion), LOWER($2)) as service_sim
            FROM reparaciones 
            WHERE (LOWER(modelo_celular) LIKE LOWER($3) OR SIMILARITY(LOWER(modelo_celular), LOWER($1)) > 0.3)
            AND (LOWER(tipo_reparacion) LIKE LOWER($4) OR SIMILARITY(LOWER(tipo_reparacion), LOWER($2)) > 0.3)
            AND disponibilidad = 'disponible'
            ORDER BY (device_sim + service_sim) DESC
            LIMIT 3
        `;
        const fuzzyDevice = `%${device}%`;
        const fuzzyService = `%${service}%`;
        try {
            const result = await pool.query(query, [
                device,
                service,
                fuzzyDevice,
                fuzzyService
            ]);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                const confidence = (row.device_sim + row.service_sim) / 2;
                if (confidence > config.priceExtraction.fuzzyMatchConfidence) {
                    return {
                        price: row.precio,
                        confidence: confidence,
                        details: {
                            device: row.modelo_celular,
                            service: row.tipo_reparacion,
                            time: row.tiempo_reparacion,
                            availability: row.disponibilidad,
                            notes: row.notas,
                            similarity: confidence
                        }
                    };
                }
            }
        } catch (error) {
            logger.warn('SIMILARITY no disponible, usando LIKE simple');
            const simpleQuery = `
                SELECT modelo_celular, tipo_reparacion, precio, tiempo_reparacion, disponibilidad, notas
                FROM reparaciones 
                WHERE LOWER(modelo_celular) LIKE LOWER($1)
                AND LOWER(tipo_reparacion) LIKE LOWER($2)
                AND disponibilidad = 'disponible'
                LIMIT 3
            `;
            const result = await pool.query(simpleQuery, [fuzzyDevice, fuzzyService]);
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    price: row.precio,
                    confidence: config.priceExtraction.fuzzyFallbackConfidence,
                    details: {
                        device: row.modelo_celular,
                        service: row.tipo_reparacion,
                        time: row.tiempo_reparacion,
                        availability: row.disponibilidad,
                        notes: row.notas
                    }
                };
            }
        }
        return null;
    }

    async fallbackSearch(device, service, originalQuery) {
        logger.info(`🎲 ESTRATEGIA 3: Fallback inteligente`);
        const query = `
            SELECT DISTINCT modelo_celular, tipo_reparacion, precio
            FROM reparaciones 
            WHERE disponibilidad = 'disponible'
            ORDER BY precio
        `;
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            const deviceWords = device.toLowerCase().split(' ');
            const brand = deviceWords[0];
            const similarDevices = result.rows.filter(
                (row) =>
                    row.modelo_celular.toLowerCase().includes(brand) ||
          row.tipo_reparacion.toLowerCase().includes(service.toLowerCase())
            );
            if (similarDevices.length > 0) {
                const avgPrice =
          Math.round(
              similarDevices.reduce(
                  (sum, row) => sum + (Number(row.precio) || 0),
                  0
              ) / similarDevices.length
          ) || 0;
                return {
                    price: avgPrice,
                    confidence: config.priceExtraction.fallbackSearchConfidence,
                    details: {
                        source: 'similar_devices',
                        sample_size: similarDevices.length,
                        note: `Precio estimado basado en dispositivos similares de la marca ${brand}`
                    }
                };
            }
        }
        return null;
    }

    normalizeQuery(query) {
        return query
            .toLowerCase()
            .replace(/[¿?¡!]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getStrategyName(index) {
        const names = [
            'exact_database_match',
            'fuzzy_database_match',
            'fallback_search'
        ];
        return names[index] || 'unknown';
    }

    validateResult(result) {
        if (!result || result.price === null || result.price === undefined)
            return false;
        const price = Number(result.price);
        if (isNaN(price) || price <= 0) return false;
        if (
            price < config.priceExtraction.minPriceValidation ||
      price > config.priceExtraction.maxPriceValidation
        )
            return false;
        if (result.confidence < config.priceExtraction.minConfidenceValidation)
            return false;
        return true;
    }
}

const priceExtractionSystem = new PriceExtractionSystem();

module.exports = {
    PriceExtractionSystem,
    priceExtractionSystem
};
