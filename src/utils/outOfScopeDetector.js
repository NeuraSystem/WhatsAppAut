// src/utils/outOfScopeDetector.js

/**
 * Detector de consultas fuera del alcance del negocio
 */

/**
 * Servicios y productos que definitivamente NO ofrece Salva Cell.
 */
const OUT_OF_SCOPE_KEYWORDS = {
    // Dispositivos que no reparan
    devices: [
        'laptop', 'computadora', 'pc', 'notebook', 'tablet', 'ipad',
        'television', 'tv', 'smart tv', 'monitor', 'impresora', 'router',
        'xbox', 'playstation', 'nintendo', 'consola', 'videojuego',
        'camara', 'gopro', 'drone', 'smartwatch', 'reloj inteligente',
        'audifonos', 'bocina', 'speaker', 'parlante'
    ],
    
    // Servicios que no ofrecen
    services: [
        'programacion', 'desarrollo', 'software', 'app', 'aplicacion',
        'diseño web', 'pagina web', 'hosting', 'dominio', 'seo',
        'marketing', 'publicidad', 'redes sociales', 'facebook', 'instagram',
        'recuperacion de datos', 'backup', 'sincronizacion', 'cloud',
        'antivirus', 'malware', 'virus', 'formateo', 'sistema operativo',
        'jailbreak', 'root', 'unlock', 'liberacion'
    ],
    
    // Marcas/productos específicos fuera de alcance
    brands: [
        'apple watch', 'macbook', 'imac', 'ipad',
        'surface', 'kindle', 'alexa', 'google home',
        'chromecast', 'roku', 'fire stick'
    ],
    
    // Reparaciones que no hacen
    repairs: [
        'soldadura avanzada', 'microchip', 'reballing', 'bga',
        'water damage', 'board repair', 'logicboard'
    ]
};

/**
 * Servicios que SÍ ofrece Salva Cell (para redirección).
 */
const IN_SCOPE_SERVICES = {
    main: [
        'pantalla', 'display', 'touch', 'tactil',
        'bateria', 'carga', 'cargador',
        'bocina', 'altavoz', 'audio', 'sonido',
        'camara', 'lente', 'flash',
        'boton', 'volumen', 'encendido', 'home',
        'conector', 'puerto', 'jack', 'usb',
        'microfono', 'llamadas'
    ],
    
    accessories: [
        'funda', 'case', 'protector',
        'mica', 'cristal', 'vidrio templado',
        'cable', 'cargador', 'adaptador',
        'memoria', 'sd', 'micro sd'
    ],
    
    devices: [
        'celular', 'telefono', 'smartphone', 'movil',
        'iphone', 'samsung', 'xiaomi', 'huawei', 'lg',
        'motorola', 'nokia', 'oppo', 'vivo', 'oneplus'
    ]
};

/**
 * Detecta si una consulta está fuera del alcance del negocio.
 * @param {string} query - La consulta del usuario.
 * @returns {Object} Resultado de la detección.
 */
function detectOutOfScope(query) {
    const lowerQuery = query.toLowerCase();
    const matches = {
        outOfScope: [],
        suggestedRedirects: []
    };
    
    // Buscar palabras clave fuera de alcance
    for (const [category, keywords] of Object.entries(OUT_OF_SCOPE_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerQuery.includes(keyword)) {
                matches.outOfScope.push({
                    keyword,
                    category,
                    confidence: calculateConfidence(lowerQuery, keyword)
                });
            }
        }
    }
    
    // Buscar servicios relacionados que SÍ ofrecen
    for (const [category, services] of Object.entries(IN_SCOPE_SERVICES)) {
        for (const service of services) {
            if (lowerQuery.includes(service)) {
                matches.suggestedRedirects.push({
                    service,
                    category,
                    confidence: calculateConfidence(lowerQuery, service)
                });
            }
        }
    }
    
    // Determinar si está fuera de alcance
    const isOutOfScope = matches.outOfScope.length > 0;
    const highConfidenceOutOfScope = matches.outOfScope.some(match => match.confidence > 0.7);
    
    return {
        isOutOfScope,
        highConfidence: highConfidenceOutOfScope,
        outOfScopeMatches: matches.outOfScope,
        suggestedRedirects: matches.suggestedRedirects,
        recommendation: generateRecommendation(matches, isOutOfScope, highConfidenceOutOfScope)
    };
}

/**
 * Calcula la confianza de una coincidencia basada en la longitud y contexto.
 * @param {string} query - La consulta completa.
 * @param {string} keyword - La palabra clave encontrada.
 * @returns {number} Nivel de confianza entre 0 y 1.
 */
function calculateConfidence(query, keyword) {
    const keywordLength = keyword.length;
    const queryLength = query.length;
    
    // Confianza base por longitud de palabra clave
    let confidence = Math.min(keywordLength / 10, 1);
    
    // Bonus si la palabra clave es una porción significativa de la consulta
    const portion = keywordLength / queryLength;
    if (portion > 0.3) confidence += 0.2;
    
    // Bonus si está al principio o final de la consulta
    if (query.startsWith(keyword) || query.endsWith(keyword)) {
        confidence += 0.1;
    }
    
    // Bonus si está como palabra completa (con espacios)
    const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (wordBoundaryRegex.test(query)) {
        confidence += 0.2;
    }
    
    return Math.min(confidence, 1);
}

/**
 * Genera recomendaciones basadas en los resultados de detección.
 * @param {Object} matches - Las coincidencias encontradas.
 * @param {boolean} isOutOfScope - Si está fuera de alcance.
 * @param {boolean} highConfidence - Si tiene alta confianza.
 * @returns {string} Recomendación de acción.
 */
function generateRecommendation(matches, isOutOfScope, highConfidence) {
    if (!isOutOfScope) {
        return 'PROCEDER: Consulta dentro del alcance del negocio.';
    }
    
    if (highConfidence) {
        if (matches.suggestedRedirects.length > 0) {
            return 'REDIRIGIR: Consulta fuera de alcance pero hay servicios relacionados disponibles.';
        } else {
            return 'EXPLICAR: Consulta definitivamente fuera de alcance, explicar especialización.';
        }
    }
    
    return 'VERIFICAR: Posible consulta fuera de alcance, proceder con precaución.';
}

/**
 * Genera respuesta empática para consultas fuera de alcance.
 * @param {Object} detection - Resultado de la detección.
 * @param {string} clientName - Nombre del cliente (opcional).
 * @returns {string} Respuesta empática sugerida.
 */
function generateEmpathicResponse(detection, clientName = '') {
    const greeting = clientName ? `¡Hola ${clientName}!` : '¡Hola!';
    
    if (!detection.isOutOfScope) {
        return null; // No necesita respuesta especial
    }
    
    const mainOutOfScope = detection.outOfScopeMatches[0];
    let response = `${greeting} `;
    
    // Generar respuesta según la categoría
    switch (mainOutOfScope.category) {
        case 'devices':
            response += `Entiendo que necesitas ayuda con tu ${mainOutOfScope.keyword}. Nosotros nos especializamos en celulares, pero me encantaría saber si tienes algún teléfono que necesite atención. `;
            break;
            
        case 'services':
            response += `Me encantaría ayudarte con ${mainOutOfScope.keyword}, pero nuestro fuerte son las reparaciones físicas de celulares. `;
            break;
            
        case 'brands':
            response += `Para ${mainOutOfScope.keyword} específicamente no manejo información, pero sí trabajo con una gran variedad de celulares. `;
            break;
            
        case 'repairs':
            response += `Entiendo que necesitas ${mainOutOfScope.keyword}. Nosotros manejamos las reparaciones más comunes de celulares. `;
            break;
            
        default:
            response += `Entiendo lo que necesitas. Nuestro enfoque principal son las reparaciones de celulares. `;
    }
    
    // Añadir redirección si hay servicios relacionados
    if (detection.suggestedRedirects.length > 0) {
        const redirect = detection.suggestedRedirects[0];
        response += `¿Tienes algún tema con ${redirect.service} de tu celular que pueda ayudarte? `;
    } else {
        response += `¿Hay algo relacionado con tu celular en lo que te pueda ayudar? `;
    }
    
    response += `😊`;
    
    return response;
}

module.exports = {
    detectOutOfScope,
    generateEmpathicResponse,
    OUT_OF_SCOPE_KEYWORDS,
    IN_SCOPE_SERVICES
};