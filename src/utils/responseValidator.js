
// src/utils/responseValidator.js
// Multi-Layer Response Validator: pipeline extensible, scoring de confianza, integración futura con KnowledgeCoherenceLayer

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
            if (typeof result.confidence === 'number') confidences.push(result.confidence);
        }
        const riskLevel = calculateRiskLevel(allIssues);
        const confidenceScore = confidences.length ? (confidences.reduce((a, b) => a + b, 0) / confidences.length) : 1;
        return {
            isSafe: riskLevel === 'low' || riskLevel === 'medium',
            shouldBlock: riskLevel === 'high' || riskLevel === 'critical',
            issues: allIssues,
            riskLevel,
            confidenceScore,
            sanitizedResponse: allIssues.length ? sanitizeResponse(response, allIssues) : response,
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
        /Galaxy\s+S\d{2,}/gi,  // Galaxy S32, S45, etc.
        /iPhone\s+\d{2,}/gi,   // iPhone 16, 17, etc.
        /Redmi\s+\d{2,}/gi     // Redmi 15, etc.
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
    const highRiskIssues = issues.filter(issue => issue.risk === 'high').length;
    const mediumRiskIssues = issues.filter(issue => issue.risk === 'medium').length;
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
    responseValidatorPipeline,
    ValidationPipeline,
    detectInventedDataValidator,
    calculateRiskLevel,
    sanitizeResponse,
    getRecommendation
};