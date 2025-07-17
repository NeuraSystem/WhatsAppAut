#!/usr/bin/env node

// src/utils/robustSofiaParser.js
// ROBUST SOFIA PARSER - Reemplazo del ReActParser frágil
// Parser personalizado a prueba de balas para SalvaCell Orchestrator

const logger = require('./logger');

/**
 * ROBUST SOFIA PARSER
 * Reemplaza el ReActSingleInputOutputParser problemático
 * 
 * Funcionalidades:
 * - Parse robusto de respuestas LLM
 * - Detección confiable de TOOL_CALL
 * - Manejo de errores graceful
 * - Logging detallado para debugging
 * - Zero fragilidad en parsing
 */
class RobustSofiaParser {
    
    /**
     * MÉTODO PRINCIPAL - Parse respuesta del LLM
     * 
     * @param {string} llmResponse - Respuesta completa del LLM
     * @returns {Object} Resultado parseado con tipo y datos
     */
    static parse(llmResponse) {
        if (!llmResponse || typeof llmResponse !== 'string') {
            logger.warn('🔧 Parser: Respuesta LLM inválida o vacía');
            return {
                type: 'error',
                message: 'Lo siento, hubo un problema procesando tu consulta. ¿Podrías repetirla?',
                error: 'invalid_llm_response'
            };
        }
        
        try {
            // Limpiar respuesta
            const cleanResponse = llmResponse.trim();
            
            // Verificar que no sea solo espacios en blanco
            if (cleanResponse.length === 0) {
                logger.warn('🔧 Parser: Respuesta vacía después de limpiar');
                return {
                    type: 'error',
                    message: 'Lo siento, parece que no recibí tu mensaje correctamente. ¿Podrías repetirlo?',
                    error: 'empty_after_trim'
                };
            }
            
            // Buscar patrón TOOL_CALL con regex robusto
            const toolResult = this.extractToolCall(cleanResponse);
            
            if (toolResult.found) {
                logger.info(`🔧 Parser: Tool detectado - ${toolResult.toolName}`);
                return {
                    type: 'tool_call',
                    tool: toolResult.toolName,
                    arguments: toolResult.arguments,
                    raw: cleanResponse,
                    confidence: toolResult.confidence
                };
            }
            
            // Si no es tool call, es respuesta para usuario
            logger.debug('🔧 Parser: Respuesta conversacional detectada');
            return {
                type: 'user_response',
                message: this.sanitizeUserResponse(cleanResponse),
                raw: cleanResponse
            };
            
        } catch (error) {
            logger.error('🔧 Parser: Error en parsing:', error);
            return {
                type: 'error',
                message: 'Disculpa, permíteme procesar mejor tu consulta. ¿Puedes reformularla?',
                error: 'parse_exception',
                details: error.message
            };
        }
    }
    
    /**
     * EXTRAER TOOL CALL - Detección robusta de herramientas
     * 
     * @param {string} response - Respuesta limpia del LLM
     * @returns {Object} Resultado de extracción
     */
    static extractToolCall(response) {
        // Patrones múltiples para máxima robustez
        const patterns = [
            // Patrón principal: TOOL_CALL: function({"key": "value"})
            /TOOL_CALL:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(\{[^}]*\})\s*\)/i,
            
            // Patrón alternativo: TOOL: function(args)
            /TOOL:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(\{[^}]*\})\s*\)/i,
            
            // Patrón flexible: [TOOL] function(args)
            /\[TOOL\]\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(\{[^}]*\})\s*\)/i
        ];
        
        for (let i = 0; i < patterns.length; i++) {
            const match = response.match(patterns[i]);
            
            if (match) {
                try {
                    const toolName = match[1].toLowerCase();
                    const argsString = match[2];
                    
                    // Validar nombre de herramienta
                    if (!this.isValidToolName(toolName)) {
                        logger.warn(`🔧 Parser: Herramienta inválida - ${toolName}`);
                        continue;
                    }
                    
                    // Parse argumentos JSON
                    const toolArguments = this.parseToolArguments(argsString);
                    
                    if (toolArguments === null) {
                        logger.warn(`🔧 Parser: Argumentos JSON inválidos - ${argsString}`);
                        continue;
                    }
                    
                    return {
                        found: true,
                        toolName: toolName,
                        arguments: toolArguments,
                        confidence: this.calculateConfidence(i, argsString),
                        pattern: i
                    };
                    
                } catch (parseError) {
                    logger.warn(`🔧 Parser: Error parsing patrón ${i}:`, parseError.message);
                    continue;
                }
            }
        }
        
        return { found: false };
    }
    
    /**
     * VALIDAR NOMBRE DE HERRAMIENTA
     * 
     * @param {string} toolName - Nombre de la herramienta
     * @returns {boolean} True si es válida
     */
    static isValidToolName(toolName) {
        const validTools = [
            'buscar_precio',
            'confirmar_orden', 
            'escalar_a_humano',
            'consultar_garantia',
            'verificar_disponibilidad',
            'buscar_servicio',
            'calcular_tiempo',
            'obtener_ubicacion'
        ];
        
        return validTools.includes(toolName);
    }
    
    /**
     * PARSE ARGUMENTOS DE HERRAMIENTA
     * 
     * @param {string} argsString - String JSON de argumentos
     * @returns {Object|null} Argumentos parseados o null si error
     */
    static parseToolArguments(argsString) {
        try {
            // Limpiar y normalizar JSON
            let cleanJson = argsString.trim();
            
            // Manejar comillas simples → dobles
            cleanJson = cleanJson.replace(/'/g, '"');
            
            // Parsear JSON
            const args = JSON.parse(cleanJson);
            
            // Validar que sea objeto
            if (typeof args !== 'object' || args === null || Array.isArray(args)) {
                return null;
            }
            
            // Sanitizar valores string
            const sanitizedArgs = {};
            for (const [key, value] of Object.entries(args)) {
                if (typeof value === 'string') {
                    sanitizedArgs[key] = value.trim().toLowerCase();
                } else {
                    sanitizedArgs[key] = value;
                }
            }
            
            return sanitizedArgs;
            
        } catch (error) {
            logger.debug(`🔧 Parser: JSON parse failed - ${argsString}`);
            return null;
        }
    }
    
    /**
     * CALCULAR CONFIANZA DE PARSING
     * 
     * @param {number} patternIndex - Índice del patrón usado
     * @param {string} argsString - String de argumentos
     * @returns {number} Score de confianza 0-1
     */
    static calculateConfidence(patternIndex, argsString) {
        let confidence = 1.0;
        
        // Penalizar patrones menos específicos
        confidence -= patternIndex * 0.1;
        
        // Bonus por JSON bien formado
        if (argsString.includes('"') && argsString.includes(':')) {
            confidence += 0.1;
        }
        
        // Penalizar JSON muy simple
        if (argsString.length < 10) {
            confidence -= 0.1;
        }
        
        return Math.max(0.5, Math.min(1.0, confidence));
    }
    
    /**
     * SANITIZAR RESPUESTA DE USUARIO
     * 
     * @param {string} response - Respuesta para usuario
     * @returns {string} Respuesta sanitizada
     */
    static sanitizeUserResponse(response) {
        // Remover cualquier trace de TOOL_CALL que pudiera quedar
        let cleaned = response.replace(/TOOL_CALL:.*$/gi, '').trim();
        cleaned = cleaned.replace(/TOOL:.*$/gi, '').trim();
        cleaned = cleaned.replace(/\[TOOL\].*$/gi, '').trim();
        
        // Remover líneas vacías múltiples
        cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();
        
        // Fallback si quedó vacío
        if (!cleaned) {
            return 'Disculpa, ¿podrías repetir tu consulta? No pude procesarla correctamente.';
        }
        
        return cleaned;
    }
    
    /**
     * VALIDAR ESTRUCTURA DE TOOL CALL
     * 
     * @param {string} toolName - Nombre de herramienta
     * @param {Object} arguments - Argumentos
     * @returns {Object} Resultado de validación
     */
    static validateToolCall(toolName, toolArguments) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // Esquemas de validación por herramienta
        const schemas = {
            buscar_precio: {
                required: ['dispositivo'],
                optional: ['servicio'],
                types: {
                    dispositivo: 'string',
                    servicio: 'string'
                }
            },
            confirmar_orden: {
                required: ['dispositivo', 'precio', 'tipo_pantalla'],
                optional: ['contacto'],
                types: {
                    dispositivo: 'string',
                    precio: 'number',
                    tipo_pantalla: 'string',
                    contacto: 'string'
                }
            },
            escalar_a_humano: {
                required: ['motivo'],
                optional: ['resumen', 'urgencia'],
                types: {
                    motivo: 'string',
                    resumen: 'string',
                    urgencia: 'string'
                }
            }
        };
        
        const schema = schemas[toolName];
        if (!schema) {
            validation.isValid = false;
            validation.errors.push(`Herramienta desconocida: ${toolName}`);
            return validation;
        }
        
        // Validar campos requeridos
        for (const field of schema.required) {
            if (!(field in toolArguments)) {
                validation.isValid = false;
                validation.errors.push(`Campo requerido faltante: ${field}`);
            }
        }
        
        // Validar tipos
        for (const [field, value] of Object.entries(toolArguments)) {
            const expectedType = schema.types[field];
            if (expectedType && typeof value !== expectedType) {
                validation.warnings.push(`Tipo incorrecto para ${field}: esperado ${expectedType}, recibido ${typeof value}`);
            }
        }
        
        return validation;
    }
    
    /**
     * OBTENER ESTADÍSTICAS DE PARSING
     * 
     * @returns {Object} Estadísticas de uso
     */
    static getParsingStats() {
        // En implementación real, esto vendría de métricas persistidas
        return {
            total_parses: 0,
            successful_tool_calls: 0,
            user_responses: 0,
            parse_errors: 0,
            confidence_avg: 0.85,
            most_used_tool: 'buscar_precio'
        };
    }
}

module.exports = {
    RobustSofiaParser
};