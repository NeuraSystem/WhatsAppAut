// src/services/priceExtractionSystem.js
// SISTEMA ROBUSTO DE EXTRACCIÓN DE PRECIOS

const { pool } = require('../database/pg');
const { findInCache, addToCache } = require('./semanticCache');
const { ChromaClient } = require('chromadb');
const { embeddingEngine } = require('./embeddingEngine');
const { KnowledgeCoherenceLayer } = require('./knowledge/KnowledgeCoherenceLayer');
const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL || 'http://localhost:8000' });
const logger = require('../utils/logger');

// Instancia de la capa de coherencia para validación cruzada
const coherenceLayer = new KnowledgeCoherenceLayer();

/**
 * SISTEMA HÍBRIDO DE EXTRACCIÓN DE PRECIOS
 * Combina múltiples estrategias para garantizar precisión
 */
class PriceExtractionSystem {
    constructor() {
        this.strategies = [
            this.exactDatabaseMatch.bind(this),
            this.fuzzyDatabaseMatch.bind(this),
            this.fallbackSearch.bind(this)
        ];
    }

    /**
     * Extrae información de precios usando múltiples estrategias
     * @param {string} query - Consulta del usuario
     * @returns {Promise<Object>} Resultado con precio, confianza y método usado
     */

    /**
     * Extrae información de precios usando múltiples estrategias y valida con la capa de coherencia
     * @param {string} query - Consulta del usuario
     * @returns {Promise<Object>} Resultado con precio, confianza, método, validación de coherencia y temporalidad
     */
    async extractPrice(query) {
        logger.info(`🔍 INICIANDO EXTRACCIÓN DE PRECIO PARA: "${query}"`);

        // 1. NORMALIZAR CONSULTA
        const normalizedQuery = this.normalizeQuery(query);
        const extracted = this.extractDeviceAndService(normalizedQuery);

        logger.info(`📱 DISPOSITIVO EXTRAÍDO: "${extracted.device}"`);
        logger.info(`🔧 SERVICIO EXTRAÍDO: "${extracted.service}"`);

        // 2. INTENTAR CADA ESTRATEGIA EN ORDEN DE PRECISIÓN
        for (let i = 0; i < this.strategies.length; i++) {
            try {
                const result = await this.strategies[i](extracted.device, extracted.service, query);
                if (result && this.validateResult(result)) {
                    result.method = this.getStrategyName(i);

                    // 3. Validación cruzada con KnowledgeCoherenceLayer (si está disponible)
                    let coherenceValidation = null;
                    try {
                        coherenceValidation = await coherenceLayer.validateBusinessLogic({
                            results: [{
                                id: `${extracted.device}_${extracted.service}`,
                                price: result.price
                            }],
                            metadata: { searchType: 'PRICE_SPECIFIC', sources: ['postgresql'] }
                        });
                    } catch (e) {
                        logger.warn('No se pudo validar con KnowledgeCoherenceLayer:', e.message);
                    }

                    // 4. Validación temporal (frescura de datos)
                    let temporalValidation = null;
                    try {
                        temporalValidation = await coherenceLayer.validateDataFreshness({
                            metadata: { sources: ['postgresql'] }
                        });
                    } catch (e) {
                        logger.warn('No se pudo validar frescura de datos:', e.message);
                    }

                    // 5. Retornar resultado enriquecido
                    logger.info(`✅ PRECIO ENCONTRADO: $${result.price} (${result.method}, confianza: ${result.confidence})`);
                    return {
                        ...result,
                        coherenceValidation,
                        temporalValidation
                    };
                }
            } catch (error) {
                logger.warn(`⚠️ Estrategia ${i} falló:`, error.message);
                continue;
            }
        }

        // 6. SI TODAS FALLAN
        logger.error(`❌ NO SE PUDO EXTRAER PRECIO PARA: "${query}"`);
        return {
            price: null,
            confidence: 0,
            method: 'no_encontrado',
            message: 'No se encontró información de precio para ese dispositivo específico',
            coherenceValidation: null,
            temporalValidation: null
        };
    }

    /**
     * ESTRATEGIA 1: Búsqueda exacta en base de datos
     */
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

    /**
     * ESTRATEGIA 2: Búsqueda difusa en base de datos
     */
    async fuzzyDatabaseMatch(device, service, originalQuery) {
        logger.info(`🔍 ESTRATEGIA 2: Búsqueda difusa - ${device} + ${service}`);
        
        // Búsqueda con LIKE y similitud
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
            const result = await pool.query(query, [device, service, fuzzyDevice, fuzzyService]);
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                const confidence = (row.device_sim + row.service_sim) / 2;
                
                if (confidence > 0.5) {
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
            // Si SIMILARITY no está disponible, usar LIKE simple
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
                    confidence: 0.7,
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

    

    /**
     * ESTRATEGIA 4: Fallback inteligente
     */
    async fallbackSearch(device, service, originalQuery) {
        logger.info(`🎲 ESTRATEGIA 4: Fallback inteligente`);
        
        // Buscar dispositivos similares
        const query = `
            SELECT DISTINCT modelo_celular, tipo_reparacion, precio
            FROM reparaciones 
            WHERE disponibilidad = 'disponible'
            ORDER BY precio
        `;
        
        const result = await pool.query(query);
        
        if (result.rows.length > 0) {
            // Encontrar el dispositivo más similar por marca
            const deviceWords = device.toLowerCase().split(' ');
            const brand = deviceWords[0]; // Primera palabra suele ser la marca
            
            const similarDevices = result.rows.filter(row => 
                row.modelo_celular.toLowerCase().includes(brand) ||
                row.tipo_reparacion.toLowerCase().includes(service.toLowerCase())
            );
            
            if (similarDevices.length > 0) {
                const avgPrice = Math.round(
                    similarDevices.reduce((sum, row) => sum + (row.precio || 0), 0) / similarDevices.length
                ) || 0;
                
                return {
                    price: avgPrice,
                    confidence: 0.4,
                    details: {
                        source: 'similar_devices',
                        sample_size: similarDevices.length,
                        note: `Precio estimado basado en dispositivos similares de ${brand}`
                    }
                };
            }
        }
        
        return null;
    }

    /**
     * Normaliza la consulta del usuario
     */
    normalizeQuery(query) {
        return query
            .toLowerCase()
            .replace(/[¿?¡!]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Extrae dispositivo y servicio de la consulta
     */
    extractDeviceAndService(query) {
        // Patrones comunes de dispositivos
        const devicePatterns = [
            /(?:para\s+(?:un\s+)?)?(\w+\s+\w+\d+(?:\s+\w+)?)/i,  // "para un Samsung A54"
            /(?:de\s+)?(\w+\s+\w+\d+(?:\s+\w+)?)/i,              // "de iPhone 12"
            /(\w+\s+\w+\d+(?:\s+\w+)?)/i                         // "Motorola G60"
        ];

        // Patrones de servicios (BATERÍA DEBE IR ANTES QUE PANTALLA)
        const servicePatterns = [
            { pattern: /bater[ií]a|battery|pila/i, service: 'bateria' },
            { pattern: /carga|charging|puerto/i, service: 'puerto_carga' },
            { pattern: /c[aá]mara|camera/i, service: 'camara' },
            { pattern: /altavoz|speaker|audio/i, service: 'altavoz' },
            { pattern: /pantalla|display|screen/i, service: 'pantalla' }  // ← Pantalla al final como default
        ];

        let device = '';
        let service = 'pantalla'; // Default

        // Extraer dispositivo
        for (const pattern of devicePatterns) {
            const match = query.match(pattern);
            if (match) {
                device = match[1].trim();
                break;
            }
        }

        // Extraer servicio
        for (const { pattern, service: serviceName } of servicePatterns) {
            if (pattern.test(query)) {
                service = serviceName;
                break;
            }
        }

        return { device, service };
    }

    /**
     * Obtiene el nombre de la estrategia por índice
     */
    getStrategyName(index) {
        const names = [
            'exact_database_match',
            'fuzzy_database_match', 
            'fallback_search'
        ];
        return names[index] || 'unknown';
    }

    /**
     * Valida si un resultado de precio es confiable
     */
    validateResult(result) {
        if (!result || !result.price) return false;
        
        // Validaciones básicas
        if (isNaN(result.price) || result.price <= 0) return false;
        if (result.price < 100 || result.price > 10000) return false;
        if (result.confidence < 0.3) return false;
        
        return true;
    }
}

// Instancia singleton
const priceExtractionSystem = new PriceExtractionSystem();

module.exports = {
    PriceExtractionSystem,
    priceExtractionSystem
};