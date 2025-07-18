const logger = require('./logger');

// Contenido de fuzzyMatcher.js

/**
 * Utilidad para fuzzy matching de nombres de dispositivos y reparaciones
 */

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * @param {string} str1 - Primer string
 * @param {string} str2 - Segundo string
 * @returns {number} Distancia de Levenshtein
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Inicializar matriz
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Llenar matriz
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // eliminación
                    matrix[i][j - 1] + 1, // inserción
                    matrix[i - 1][j - 1] + 1 // sustitución
                );
            }
        }
    }

    return matrix[len1][len2];
}

/**
 * Calcula la similitud entre dos strings (0-1, donde 1 es idéntico)
 * @param {string} str1 - Primer string
 * @param {string} str2 - Segundo string
 * @returns {number} Puntuación de similitud
 */
function similarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const distance = levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);

    return maxLength === 0 ? 1.0 : (maxLength - distance) / maxLength;
}

/**
 * Diccionario de modelos de dispositivos con variantes comunes
 */
const deviceVariants = {
    iphone: ['iphone', 'iphone', 'ip', 'i phone', 'iphon', 'ifone', 'aifon'],
    'iphone 13': [
        'iphone 13',
        'iphone13',
        'ip13',
        'i13',
        'iphone 13',
        'iphon 13',
        'ifone 13'
    ],
    'iphone 13 pro': [
        'iphone 13 pro',
        'iphone13pro',
        'ip13pro',
        'i13pro',
        'iphone 13 pro',
        'iphon 13 pro'
    ],
    'iphone 13 pro max': [
        'iphone 13 pro max',
        'iphone13promax',
        'ip13promax',
        'i13promax',
        'iphone 13 pro max'
    ],
    'iphone 14': [
        'iphone 14',
        'iphone14',
        'ip14',
        'i14',
        'iphone 14',
        'iphon 14',
        'ifone 14'
    ],
    'iphone 14 pro': [
        'iphone 14 pro',
        'iphone14pro',
        'ip14pro',
        'i14pro',
        'iphone 14 pro',
        'iphon 14 pro'
    ],
    'iphone 14 pro max': [
        'iphone 14 pro max',
        'iphone14promax',
        'ip14promax',
        'i14promax',
        'iphone 14 pro max'
    ],
    'iphone 15': [
        'iphone 15',
        'iphone15',
        'ip15',
        'i15',
        'iphone 15',
        'iphon 15',
        'ifone 15'
    ],
    'iphone 15 pro': [
        'iphone 15 pro',
        'iphone15pro',
        'ip15pro',
        'i15pro',
        'iphone 15 pro',
        'iphon 15 pro'
    ],
    'iphone 15 pro max': [
        'iphone 15 pro max',
        'iphone15promax',
        'ip15promax',
        'i15promax',
        'iphone 15 pro max'
    ],
    'samsung galaxy': [
        'samsung galaxy',
        'galaxy',
        'samsung',
        'galaxi',
        'galax',
        'samsung galax'
    ],
    'samsung galaxy s21': [
        'samsung galaxy s21',
        'galaxy s21',
        'samsung s21',
        's21',
        'galaxi s21',
        'galax s21'
    ],
    'samsung galaxy s22': [
        'samsung galaxy s22',
        'galaxy s22',
        'samsung s22',
        's22',
        'galaxi s22',
        'galax s22'
    ],
    'samsung galaxy s23': [
        'samsung galaxy s23',
        'galaxy s23',
        'samsung s23',
        's23',
        'galaxi s23',
        'galax s23'
    ],
    'samsung galaxy s24': [
        'samsung galaxy s24',
        'galaxy s24',
        'samsung s24',
        's24',
        'galaxi s24',
        'galax s24'
    ],
    xiaomi: ['xiaomi', 'shaomi', 'xiaomi', 'shiaomi', 'xaomi', 'xiami'],
    'xiaomi redmi': [
        'xiaomi redmi',
        'redmi',
        'shaomi redmi',
        'xaomi redmi',
        'xiami redmi'
    ],
    huawei: ['huawei', 'hauwei', 'huawei', 'hawuei', 'hwauei'],
    motorola: ['motorola', 'moto', 'motorola', 'motorla', 'motoral'],
    oppo: ['oppo', 'opo', 'oppo', 'opoo'],
    vivo: ['vivo', 'vibo', 'vivo', 'vifo']
};

/**
 * Diccionario de tipos de reparación con variantes comunes
 */
const repairVariants = {
    pantalla: [
        'pantalla',
        'screen',
        'display',
        'pantaya',
        'pantala',
        'pantal',
        'panatalla'
    ],
    bateria: [
        'bateria',
        'battery',
        'batería',
        'bateria',
        'vateria',
        'batria',
        'beteria'
    ],
    camara: [
        'camara',
        'camera',
        'cámara',
        'camara',
        'kamara',
        'camere',
        'camera'
    ],
    bocina: [
        'bocina',
        'speaker',
        'altavoz',
        'bocina',
        'bozina',
        'bosina',
        'bocina'
    ],
    microfono: [
        'microfono',
        'micrófono',
        'microphone',
        'mic',
        'micrófono',
        'microfon'
    ],
    'puerto de carga': [
        'puerto de carga',
        'puerto',
        'charging port',
        'conector',
        'puerto carga',
        'puerto de carga'
    ],
    vidrio: ['vidrio', 'glass', 'cristal', 'vidrio', 'bidrio', 'vidreo', 'vidro'],
    tactil: [
        'tactil',
        'touch',
        'táctil',
        'tactil',
        'taktil',
        'tactiel',
        'taktil'
    ],
    lcd: ['lcd', 'pantalla lcd', 'display lcd', 'lcd', 'lc d', 'lsd'],
    oled: ['oled', 'pantalla oled', 'display oled', 'oled', 'ole d', 'olde']
};

/**
 * Diccionario de tipos de calidad con variantes comunes
 */
const qualityVariants = {
    original: ['original', 'oem', 'originl', 'orijinal', 'original', 'origina'],
    generica: [
        'generica',
        'genérica',
        'generic',
        'generico',
        'generica',
        'jenérica',
        'generika'
    ],
    aftermarket: [
        'aftermarket',
        'after market',
        'altermarket',
        'aftermarke',
        'aftermarket'
    ],
    compatible: [
        'compatible',
        'compativle',
        'compatibel',
        'compatible',
        'conpatible'
    ],
    economica: [
        'economica',
        'económica',
        'barata',
        'economica',
        'economika',
        'ekonómica'
    ],
    premium: ['premium', 'premiun', 'premiu', 'premium', 'preimu', 'premiem'],
    'alta calidad': [
        'alta calidad',
        'high quality',
        'alta calidad',
        'buena calidad',
        'alta calida'
    ]
};

/**
 * Encuentra la mejor coincidencia para un término dado
 * @param {string} input - Término de entrada
 * @param {Object} variantDict - Diccionario de variantes
 * @param {number} threshold - Umbral mínimo de similitud (0-1)
 * @returns {Object|null} Mejor coincidencia o null si no hay coincidencia
 */
function findBestMatch(input, variantDict, threshold = 0.6) {
    let bestMatch = null;
    let bestScore = 0;

    const inputLower = input.toLowerCase().trim();

    // Buscar coincidencia exacta primero
    for (const [canonical, variants] of Object.entries(variantDict)) {
        for (const variant of variants) {
            if (variant.toLowerCase() === inputLower) {
                return {
                    canonical,
                    variant,
                    score: 1.0,
                    exact: true
                };
            }
        }
    }

    // Buscar coincidencia fuzzy
    for (const [canonical, variants] of Object.entries(variantDict)) {
        for (const variant of variants) {
            const score = similarity(inputLower, variant.toLowerCase());
            if (score > bestScore && score >= threshold) {
                bestScore = score;
                bestMatch = {
                    canonical,
                    variant,
                    score,
                    exact: false
                };
            }
        }
    }

    return bestMatch;
}

/**
 * Normaliza un nombre de dispositivo usando fuzzy matching
 * @param {string} deviceName - Nombre del dispositivo a normalizar
 * @returns {Object} Resultado de la normalización
 */
function normalizeDeviceName(deviceName) {
    const match = findBestMatch(deviceName, deviceVariants, 0.7);

    if (match) {
        return {
            original: deviceName,
            normalized: match.canonical,
            confidence: match.score,
            exact: match.exact
        };
    }

    return {
        original: deviceName,
        normalized: deviceName.toLowerCase().trim(),
        confidence: 0,
        exact: false
    };
}

/**
 * Normaliza un tipo de reparación usando fuzzy matching
 * @param {string} repairType - Tipo de reparación a normalizar
 * @returns {Object} Resultado de la normalización
 */
function normalizeRepairType(repairType) {
    const match = findBestMatch(repairType, repairVariants, 0.6);

    if (match) {
        return {
            original: repairType,
            normalized: match.canonical,
            confidence: match.score,
            exact: match.exact
        };
    }

    return {
        original: repairType,
        normalized: repairType.toLowerCase().trim(),
        confidence: 0,
        exact: false
    };
}

/**
 * Normaliza un tipo de calidad usando fuzzy matching
 * @param {string} qualityType - Tipo de calidad a normalizar
 * @returns {Object} Resultado de la normalización
 */
function normalizeQualityType(qualityType) {
    const match = findBestMatch(qualityType, qualityVariants, 0.6);

    if (match) {
        return {
            original: qualityType,
            normalized: match.canonical,
            confidence: match.score,
            exact: match.exact
        };
    }

    return {
        original: qualityType,
        normalized: qualityType.toLowerCase().trim(),
        confidence: 0,
        exact: false
    };
}

/**
 * Normaliza una consulta completa extrayendo y normalizando componentes
 * @param {string} query - Consulta del usuario
 * @returns {Object} Consulta normalizada con componentes identificados
 */
function normalizeQuery(query) {
    const words = query.toLowerCase().split(/\s+/);
    const normalizedComponents = {
        device: null,
        repair: null,
        quality: null,
        originalQuery: query
    };

    // Buscar dispositivos (buscar secuencias de palabras)
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j <= Math.min(i + 4, words.length); j++) {
            const phrase = words.slice(i, j).join(' ');
            const deviceMatch = normalizeDeviceName(phrase);

            if (deviceMatch.confidence > 0.6) {
                normalizedComponents.device = deviceMatch;
                break;
            }
        }
        if (normalizedComponents.device) break;
    }

    // Buscar tipos de reparación
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j <= Math.min(i + 3, words.length); j++) {
            const phrase = words.slice(i, j).join(' ');
            const repairMatch = normalizeRepairType(phrase);

            if (repairMatch.confidence > 0.6) {
                normalizedComponents.repair = repairMatch;
                break;
            }
        }
        if (normalizedComponents.repair) break;
    }

    // Buscar tipos de calidad
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j <= Math.min(i + 3, words.length); j++) {
            const phrase = words.slice(i, j).join(' ');
            const qualityMatch = normalizeQualityType(phrase);

            if (qualityMatch.confidence > 0.6) {
                normalizedComponents.quality = qualityMatch;
                break;
            }
        }
        if (normalizedComponents.quality) break;
    }

    // Generar consulta normalizada
    let normalizedQuery = query;
    if (
        normalizedComponents.device &&
    normalizedComponents.device.confidence > 0.8
    ) {
        normalizedQuery = normalizedQuery.replace(
            new RegExp(normalizedComponents.device.original, 'gi'),
            normalizedComponents.device.normalized
        );
    }

    if (
        normalizedComponents.repair &&
    normalizedComponents.repair.confidence > 0.8
    ) {
        normalizedQuery = normalizedQuery.replace(
            new RegExp(normalizedComponents.repair.original, 'gi'),
            normalizedComponents.repair.normalized
        );
    }

    return {
        ...normalizedComponents,
        normalizedQuery,
        confidence: Math.max(
            normalizedComponents.device?.confidence || 0,
            normalizedComponents.repair?.confidence || 0,
            normalizedComponents.quality?.confidence || 0
        )
    };
}

// Contenido de robustSofiaParser.js

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
                message:
          'Lo siento, hubo un problema procesando tu consulta. ¿Podrías repetirla?',
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
                    message:
            'Lo siento, parece que no recibí tu mensaje correctamente. ¿Podrías repetirlo?',
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
                message:
          'Disculpa, permíteme procesar mejor tu consulta. ¿Puedes reformularla?',
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
                    logger.warn(
                        `🔧 Parser: Error parsing patrón ${i}:`,
                        parseError.message
                    );
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
                validation.warnings.push(
                    `Tipo incorrecto para ${field}: esperado ${expectedType}, recibido ${typeof value}`
                );
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

// Contenido de responseValidator.js

class ValidationPipeline {
    constructor() {
        this.validators = [];
    }

    /**
   * Agrega un validador al pipeline
   * @param {function} validatorFn - Debe retornar { issues: [], confidence: 0-1 }
   */
    use(validatorFn) {
        this.validators.push(validatorFn);
    }

    /**
   * Ejecuta el pipeline de validación
   * @param {string} response
   * @param {object} [context] - Contexto opcional para validadores avanzados
   * @returns {object} Resultado de la validación multicapa
   */
    async validate(response, context = {}) {
        let allIssues = [];
        let confidences = [];
        for (const validator of this.validators) {
            const result = await validator(response, context);
            if (result && result.issues) allIssues = allIssues.concat(result.issues);
            if (typeof result.confidence === 'number')
                confidences.push(result.confidence);
        }
        const riskLevel = calculateRiskLevel(allIssues);
        const confidenceScore = confidences.length
            ? confidences.reduce((a, b) => a + b, 0) / confidences.length
            : 1;
        return {
            isSafe: riskLevel === 'low' || riskLevel === 'medium',
            shouldBlock: riskLevel === 'high' || riskLevel === 'critical',
            issues: allIssues,
            riskLevel,
            confidenceScore,
            sanitizedResponse: allIssues.length
                ? sanitizeResponse(response, allIssues)
                : response,
            recommendation: getRecommendation(riskLevel)
        };
    }
}

// --- Validadores base ---

function detectInventedDataValidator(response) {
    const issues = [];
    // Detectar precios específicos
    const pricePatterns = [
        /\$\s*\d{1,4}(?:,\d{3})*(?:\.\d{2})?\s*pesos?/gi,
        /\d{1,4}(?:,\d{3})*(?:\.\d{2})?\s*pesos?/gi,
        /precio.*?\$\s*\d+/gi,
        /cuesta.*?\$\s*\d+/gi,
        /tenemos.*?\$\s*\d+/gi
    ];
    for (const pattern of pricePatterns) {
        const matches = response.match(pattern);
        if (matches) {
            issues.push({
                type: 'specific_price',
                matches,
                risk: 'high',
                reason: 'Contiene precios específicos que podrían ser inventados'
            });
        }
    }
    // Detectar tiempos específicos de reparación
    const timePatterns = [
        /\d+\s*(horas?|días?|semanas?|minutos?)/gi,
        /mismo\s+día/gi,
        /en\s+\d+\s+(horas?|días?)/gi,
        /listo\s+en\s+\d+/gi
    ];
    for (const pattern of timePatterns) {
        const matches = response.match(pattern);
        if (matches) {
            issues.push({
                type: 'specific_time',
                matches,
                risk: 'medium',
                reason: 'Contiene tiempos específicos que podrían no ser precisos'
            });
        }
    }
    // Detectar afirmaciones demasiado específicas sobre disponibilidad
    const availabilityPatterns = [
        /tenemos\s+\d+\s+en\s+stock/gi,
        /disponible\s+inmediatamente/gi,
        /entrega\s+garantizada/gi,
        /última\s+unidad/gi
    ];
    for (const pattern of availabilityPatterns) {
        const matches = response.match(pattern);
        if (matches) {
            issues.push({
                type: 'specific_availability',
                matches,
                risk: 'medium',
                reason: 'Contiene afirmaciones específicas sobre disponibilidad'
            });
        }
    }
    // Detectar modelos de celular muy específicos que podrían no existir
    const modelPatterns = [
        /Galaxy\s+S\d{2,}/gi, // Galaxy S32, S45, etc.
        /iPhone\s+\d{2,}/gi, // iPhone 16, 17, etc.
        /Redmi\s+\d{2,}/gi // Redmi 15, etc.
    ];
    for (const pattern of modelPatterns) {
        const matches = response.match(pattern);
        if (matches) {
            issues.push({
                type: 'suspicious_model',
                matches,
                risk: 'medium',
                reason: 'Contiene modelos de celular que podrían no existir'
            });
        }
    }
    // Scoring de confianza simple: menos issues = mayor confianza
    let confidence = 1 - Math.min(issues.length * 0.2, 0.9);
    return { issues, confidence };
}

// --- Utilidades y helpers ---

function calculateRiskLevel(issues) {
    if (issues.length === 0) return 'low';
    const highRiskIssues = issues.filter((issue) => issue.risk === 'high').length;
    const mediumRiskIssues = issues.filter(
        (issue) => issue.risk === 'medium'
    ).length;
    if (highRiskIssues >= 2) return 'critical';
    if (highRiskIssues >= 1) return 'high';
    if (mediumRiskIssues >= 3) return 'high';
    if (mediumRiskIssues >= 1) return 'medium';
    return 'low';
}

function sanitizeResponse(response, issues) {
    let sanitized = response;
    for (const issue of issues) {
        if (issue.risk === 'high') {
            if (issue.type === 'specific_price') {
                for (const match of issue.matches) {
                    sanitized = sanitized.replace(match, '[PRECIO_PENDIENTE]');
                }
            }
        }
    }
    return sanitized;
}

function getRecommendation(riskLevel) {
    switch (riskLevel) {
    case 'critical':
        return 'BLOQUEAR: Respuesta contiene múltiples datos inventados. Usar fallback.';
    case 'high':
        return 'REVISAR: Respuesta contiene datos específicos sin validar. Sanitizar o usar fallback.';
    case 'medium':
        return 'PRECAUCIÓN: Respuesta contiene datos que deberían verificarse.';
    case 'low':
    default:
        return 'SEGURO: Respuesta no contiene datos sospechosos.';
    }
}

// --- Instancia y API principal ---

const responseValidatorPipeline = new ValidationPipeline();
responseValidatorPipeline.use(detectInventedDataValidator);

module.exports = {
    similarity,
    levenshteinDistance,
    normalizeDeviceName,
    normalizeRepairType,
    normalizeQualityType,
    normalizeQuery,
    findBestMatch,
    deviceVariants,
    repairVariants,
    qualityVariants,
    RobustSofiaParser,
    responseValidatorPipeline,
    ValidationPipeline,
    detectInventedDataValidator,
    calculateRiskLevel,
    sanitizeResponse,
    getRecommendation
};
