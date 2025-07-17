// src/utils/fuzzyMatcher.js

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
                    matrix[i - 1][j] + 1,     // eliminación
                    matrix[i][j - 1] + 1,     // inserción
                    matrix[i - 1][j - 1] + 1  // sustitución
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
    'iphone': ['iphone', 'iphone', 'ip', 'i phone', 'iphon', 'ifone', 'aifon'],
    'iphone 13': ['iphone 13', 'iphone13', 'ip13', 'i13', 'iphone 13', 'iphon 13', 'ifone 13'],
    'iphone 13 pro': ['iphone 13 pro', 'iphone13pro', 'ip13pro', 'i13pro', 'iphone 13 pro', 'iphon 13 pro'],
    'iphone 13 pro max': ['iphone 13 pro max', 'iphone13promax', 'ip13promax', 'i13promax', 'iphone 13 pro max'],
    'iphone 14': ['iphone 14', 'iphone14', 'ip14', 'i14', 'iphone 14', 'iphon 14', 'ifone 14'],
    'iphone 14 pro': ['iphone 14 pro', 'iphone14pro', 'ip14pro', 'i14pro', 'iphone 14 pro', 'iphon 14 pro'],
    'iphone 14 pro max': ['iphone 14 pro max', 'iphone14promax', 'ip14promax', 'i14promax', 'iphone 14 pro max'],
    'iphone 15': ['iphone 15', 'iphone15', 'ip15', 'i15', 'iphone 15', 'iphon 15', 'ifone 15'],
    'iphone 15 pro': ['iphone 15 pro', 'iphone15pro', 'ip15pro', 'i15pro', 'iphone 15 pro', 'iphon 15 pro'],
    'iphone 15 pro max': ['iphone 15 pro max', 'iphone15promax', 'ip15promax', 'i15promax', 'iphone 15 pro max'],
    'samsung galaxy': ['samsung galaxy', 'galaxy', 'samsung', 'galaxi', 'galax', 'samsung galax'],
    'samsung galaxy s21': ['samsung galaxy s21', 'galaxy s21', 'samsung s21', 's21', 'galaxi s21', 'galax s21'],
    'samsung galaxy s22': ['samsung galaxy s22', 'galaxy s22', 'samsung s22', 's22', 'galaxi s22', 'galax s22'],
    'samsung galaxy s23': ['samsung galaxy s23', 'galaxy s23', 'samsung s23', 's23', 'galaxi s23', 'galax s23'],
    'samsung galaxy s24': ['samsung galaxy s24', 'galaxy s24', 'samsung s24', 's24', 'galaxi s24', 'galax s24'],
    'xiaomi': ['xiaomi', 'shaomi', 'xiaomi', 'shiaomi', 'xaomi', 'xiami'],
    'xiaomi redmi': ['xiaomi redmi', 'redmi', 'shaomi redmi', 'xaomi redmi', 'xiami redmi'],
    'huawei': ['huawei', 'hauwei', 'huawei', 'hawuei', 'hwauei'],
    'motorola': ['motorola', 'moto', 'motorola', 'motorla', 'motoral'],
    'oppo': ['oppo', 'opo', 'oppo', 'opoo'],
    'vivo': ['vivo', 'vibo', 'vivo', 'vifo']
};

/**
 * Diccionario de tipos de reparación con variantes comunes
 */
const repairVariants = {
    'pantalla': ['pantalla', 'screen', 'display', 'pantaya', 'pantala', 'pantal', 'panatalla'],
    'bateria': ['bateria', 'battery', 'batería', 'bateria', 'vateria', 'batria', 'beteria'],
    'camara': ['camara', 'camera', 'cámara', 'camara', 'kamara', 'camere', 'camera'],
    'bocina': ['bocina', 'speaker', 'altavoz', 'bocina', 'bozina', 'bosina', 'bocina'],
    'microfono': ['microfono', 'micrófono', 'microphone', 'mic', 'micrófono', 'microfon'],
    'puerto de carga': ['puerto de carga', 'puerto', 'charging port', 'conector', 'puerto carga', 'puerto de carga'],
    'vidrio': ['vidrio', 'glass', 'cristal', 'vidrio', 'bidrio', 'vidreo', 'vidro'],
    'tactil': ['tactil', 'touch', 'táctil', 'tactil', 'taktil', 'tactiel', 'taktil'],
    'lcd': ['lcd', 'pantalla lcd', 'display lcd', 'lcd', 'lc d', 'lsd'],
    'oled': ['oled', 'pantalla oled', 'display oled', 'oled', 'ole d', 'olde']
};

/**
 * Diccionario de tipos de calidad con variantes comunes
 */
const qualityVariants = {
    'original': ['original', 'oem', 'originl', 'orijinal', 'original', 'origina'],
    'generica': ['generica', 'genérica', 'generic', 'generico', 'generica', 'jenérica', 'generika'],
    'aftermarket': ['aftermarket', 'after market', 'altermarket', 'aftermarke', 'aftermarket'],
    'compatible': ['compatible', 'compativle', 'compatibel', 'compatible', 'conpatible'],
    'economica': ['economica', 'económica', 'barata', 'economica', 'economika', 'ekonómica'],
    'premium': ['premium', 'premiun', 'premiu', 'premium', 'preimu', 'premiem'],
    'alta calidad': ['alta calidad', 'high quality', 'alta calidad', 'buena calidad', 'alta calida']
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
    if (normalizedComponents.device && normalizedComponents.device.confidence > 0.8) {
        normalizedQuery = normalizedQuery.replace(
            new RegExp(normalizedComponents.device.original, 'gi'),
            normalizedComponents.device.normalized
        );
    }
    
    if (normalizedComponents.repair && normalizedComponents.repair.confidence > 0.8) {
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
    qualityVariants
};