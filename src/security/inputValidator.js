/**
 * INPUT VALIDATION FRAMEWORK - FASE 0 SECURITY FOUNDATION
 *
 * Middleware pattern con validation chains para security-by-design
 * Sanitización robusta y protection contra injection attacks
 *
 * Arquitectura: Chain of Responsibility + Strategy Pattern
 * Integración: Pre-processing layer antes del message handling
 */

const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * VALIDATION RULE STRATEGIES
 */
class ValidationRule {
    constructor(name, severity = 'medium') {
        this.name = name;
        this.severity = severity; // low, medium, high, critical
        this.id = uuidv4();
    }

    async validate(input, _context = {}) {
        throw new Error('validate method must be implemented');
    }

    createResult(isValid, message = '', sanitizedInput = null, risk = {}) {
        return {
            ruleId: this.id,
            ruleName: this.name,
            severity: this.severity,
            isValid,
            message,
            sanitizedInput,
            risk,
            timestamp: Date.now()
        };
    }
}

/**
 * INJECTION ATTACK PROTECTION
 */
class SQLInjectionValidator extends ValidationRule {
    constructor() {
        super('SQL_INJECTION_PROTECTION', 'critical');
        this.sqlPatterns = [
            /(')+.*(')/i,
            /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
            /(\b(union|select|insert|update|delete|drop)\s)/i,
            /(script|javascript|vbscript|onload|onerror|onclick)/i,
            /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
            /(;|\s|^)(exec|execute|sp_executesql)/i
        ];
    }

    async validate(input, context = {}) {
        const inputStr = String(input).toLowerCase();

        for (const pattern of this.sqlPatterns) {
            if (pattern.test(inputStr)) {
                logger.warn(`🚨 SQL Injection attempt detected: ${this.name}`, {
                    input: input.substring(0, 100),
                    pattern: pattern.toString(),
                    clientId: context.clientId,
                    ruleId: this.id
                });

                return this.createResult(
                    false,
                    'Potential SQL injection detected',
                    null,
                    { level: 'critical', type: 'injection_attack' }
                );
            }
        }

        return this.createResult(true, 'No SQL injection patterns detected', input);
    }
}

/**
 * XSS ATTACK PROTECTION
 */
class XSSValidator extends ValidationRule {
    constructor() {
        super('XSS_PROTECTION', 'high');
        this.xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript\s*:/i,
            /on\w+\s*=/i,
            /<object[^>]*>.*?<\/object>/gi,
            /<embed[^>]*>.*?<\/embed>/gi,
            /expression\s*\(/i,
            /<link[^>]*href\s*=\s*["\']?\s*javascript:/i
        ];
    }

    async validate(input, context = {}) {
        const inputStr = String(input);

        for (const pattern of this.xssPatterns) {
            if (pattern.test(inputStr)) {
                logger.warn(`🚨 XSS attempt detected: ${this.name}`, {
                    input: input.substring(0, 100),
                    pattern: pattern.toString(),
                    clientId: context.clientId,
                    ruleId: this.id
                });

                // Sanitize by removing dangerous patterns
                const sanitized = inputStr.replace(pattern, '');

                return this.createResult(
                    false,
                    'Potential XSS attack detected and sanitized',
                    sanitized,
                    { level: 'high', type: 'xss_attack' }
                );
            }
        }

        return this.createResult(true, 'No XSS patterns detected', input);
    }
}

/**
 * INPUT LENGTH AND FORMAT VALIDATION
 */
class LengthValidator extends ValidationRule {
    constructor(maxLength = 10000, minLength = 1) {
        super('LENGTH_VALIDATION', 'medium');
        this.maxLength = maxLength;
        this.minLength = minLength;
    }

    async validate(input, context = {}) {
        const inputStr = String(input);
        const length = inputStr.length;

        if (length < this.minLength) {
            return this.createResult(
                false,
                `Input too short (${length} < ${this.minLength})`,
                null,
                { level: 'low', type: 'format_violation' }
            );
        }

        if (length > this.maxLength) {
            logger.warn(`📏 Input length exceeded: ${length} > ${this.maxLength}`, {
                clientId: context.clientId,
                actualLength: length,
                maxLength: this.maxLength
            });

            // Truncate to max length
            const truncated = inputStr.substring(0, this.maxLength);

            return this.createResult(
                false,
                `Input truncated (${length} > ${this.maxLength})`,
                truncated,
                { level: 'medium', type: 'length_violation' }
            );
        }

        return this.createResult(true, 'Length validation passed', input);
    }
}

/**
 * ENCODING AND CHARACTER VALIDATION
 */
class EncodingValidator extends ValidationRule {
    constructor() {
        super('ENCODING_VALIDATION', 'medium');
        this.dangerousChars = ['\x00', '\x08', '\x0B', '\x0C', '\x0E', '\x0F'];
        this.suspiciousPatterns = [
            /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
            /[\uFEFF\uFFFE\uFFFF]/g, // Unicode issues
            /%[0-9a-fA-F]{2}/g // URL encoding attempts
        ];
    }

    async validate(input, context = {}) {
        const inputStr = String(input);

        // Check for dangerous control characters
        for (const char of this.dangerousChars) {
            if (inputStr.includes(char)) {
                logger.warn(`🚨 Dangerous character detected: ${char.charCodeAt(0)}`, {
                    clientId: context.clientId,
                    character: char.charCodeAt(0)
                });

                const sanitized = inputStr.replace(new RegExp(char, 'g'), '');
                return this.createResult(
                    false,
                    'Dangerous control characters removed',
                    sanitized,
                    { level: 'high', type: 'encoding_attack' }
                );
            }
        }

        // Check for suspicious patterns
        let sanitized = inputStr;
        let foundIssues = false;

        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(sanitized)) {
                foundIssues = true;
                sanitized = sanitized.replace(pattern, '');
            }
        }

        if (foundIssues) {
            return this.createResult(
                false,
                'Suspicious encoding patterns sanitized',
                sanitized,
                { level: 'medium', type: 'encoding_issue' }
            );
        }

        return this.createResult(true, 'Encoding validation passed', input);
    }
}

/**
 * BUSINESS LOGIC VALIDATION
 */
class BusinessRuleValidator extends ValidationRule {
    constructor() {
        super('BUSINESS_RULES', 'low');
        this.spamPatterns = [
            /(.)\1{10,}/g, // Repeated characters
            /^[A-Z\s!]{20,}$/g, // All caps messages
            /(buy|sell|offer|discount|free|win|prize|urgent|act now)/gi
        ];
    }

    async validate(input, context = {}) {
        const inputStr = String(input);

        // Check for spam patterns
        for (const pattern of this.spamPatterns) {
            if (pattern.test(inputStr)) {
                return this.createResult(
                    false,
                    'Message flagged as potential spam',
                    input,
                    { level: 'low', type: 'business_violation', subtype: 'spam' }
                );
            }
        }

        // Check message frequency (if context provided)
        if (context.messageCount && context.timeWindow) {
            const messagesPerMinute =
        context.messageCount / (context.timeWindow / 60000);
            if (messagesPerMinute > 10) {
                return this.createResult(false, 'Message rate too high', input, {
                    level: 'medium',
                    type: 'business_violation',
                    subtype: 'rate_abuse'
                });
            }
        }

        return this.createResult(true, 'Business rules validation passed', input);
    }
}

/**
 * VALIDATION CHAIN ORCHESTRATOR
 */
class InputValidationChain {
    constructor() {
        this.validators = new Map();
        this.metrics = {
            totalValidations: 0,
            failedValidations: 0,
            sanitizations: 0,
            criticalBlocks: 0,
            startTime: Date.now()
        };

        // Initialize default validators
        this.addValidator(new SQLInjectionValidator());
        this.addValidator(new XSSValidator());
        this.addValidator(new LengthValidator());
        this.addValidator(new EncodingValidator());
        this.addValidator(new BusinessRuleValidator());

        logger.info('🛡️ InputValidationChain initialized with default validators');
    }

    addValidator(validator) {
        if (!(validator instanceof ValidationRule)) {
            throw new Error('Validator must extend ValidationRule class');
        }

        this.validators.set(validator.name, validator);
        logger.info(
            `✅ Validator added: ${validator.name} (${validator.severity})`
        );
    }

    removeValidator(name) {
        const removed = this.validators.delete(name);
        if (removed) {
            logger.info(`❌ Validator removed: ${name}`);
        }
        return removed;
    }

    async validateInput(input, context = {}) {
        const startTime = Date.now();
        this.metrics.totalValidations++;

        const results = {
            isValid: true,
            finalInput: input,
            violations: [],
            sanitizations: [],
            risks: [],
            processingTime: 0,
            validationId: uuidv4()
        };

        logger.info(`🔍 Starting validation chain for input`, {
            validationId: results.validationId,
            inputLength: String(input).length,
            clientId: context.clientId,
            validatorCount: this.validators.size
        });

        try {
            for (const [name, validator] of this.validators) {
                const result = await validator.validate(results.finalInput, context);

                if (!result.isValid) {
                    results.isValid = false;
                    results.violations.push(result);
                    this.metrics.failedValidations++;

                    // Handle based on severity
                    if (result.severity === 'critical') {
                        this.metrics.criticalBlocks++;
                        logger.error(`🚨 CRITICAL violation in ${name}`, {
                            validationId: results.validationId,
                            violation: result,
                            clientId: context.clientId
                        });

                        // Critical violations block processing immediately
                        results.finalInput = null;
                        results.risks.push(result.risk);
                        break;
                    }

                    // For non-critical violations, continue with sanitized input
                    if (result.sanitizedInput !== null) {
                        results.finalInput = result.sanitizedInput;
                        results.sanitizations.push(result);
                        this.metrics.sanitizations++;
                    }

                    if (result.risk) {
                        results.risks.push(result.risk);
                    }
                }
            }

            results.processingTime = Date.now() - startTime;

            logger.info(`✅ Validation chain completed`, {
                validationId: results.validationId,
                isValid: results.isValid,
                violations: results.violations.length,
                sanitizations: results.sanitizations.length,
                processingTime: results.processingTime,
                clientId: context.clientId
            });

            return results;
        } catch (error) {
            logger.error(`❌ Validation chain error`, {
                validationId: results.validationId,
                error: error.message,
                stack: error.stack,
                clientId: context.clientId
            });

            return {
                isValid: false,
                finalInput: null,
                violations: [
                    {
                        ruleName: 'VALIDATION_ERROR',
                        severity: 'critical',
                        message: 'Internal validation error',
                        error: error.message
                    }
                ],
                sanitizations: [],
                risks: [{ level: 'critical', type: 'system_error' }],
                processingTime: Date.now() - startTime,
                validationId: results.validationId
            };
        }
    }

    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        return {
            ...this.metrics,
            uptime,
            validationsPerMinute: this.metrics.totalValidations / (uptime / 60000),
            failureRate:
        this.metrics.failedValidations / this.metrics.totalValidations,
            sanitizationRate:
        this.metrics.sanitizations / this.metrics.totalValidations,
            criticalBlockRate:
        this.metrics.criticalBlocks / this.metrics.totalValidations,
            validatorCount: this.validators.size
        };
    }
}

/**
 * MIDDLEWARE INTEGRATION HELPER
 */
class ValidationMiddleware {
    constructor(validationChain = null) {
        this.validationChain = validationChain || new InputValidationChain();
        this.bypassEnabled = false;
    }

    enableBypass(enabled = true) {
        this.bypassEnabled = enabled;
        logger.warn(`🚨 Validation bypass ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    async middleware(req, res, next) {
        if (this.bypassEnabled) {
            logger.warn('⚠️ Validation bypassed for request');
            return next();
        }

        try {
            const input = req.body?.message || req.query?.input || req.params?.input;

            if (!input) {
                return next(); // No input to validate
            }

            const context = {
                clientId: req.body?.clientId || req.headers['x-client-id'],
                userAgent: req.headers['user-agent'],
                ip: req.ip || req.connection.remoteAddress,
                timestamp: Date.now()
            };

            const validationResult = await this.validationChain.validateInput(
                input,
                context
            );

            // Attach validation result to request
            req.validationResult = validationResult;

            if (!validationResult.isValid && validationResult.finalInput === null) {
                // Critical violation - block request
                return res.status(400).json({
                    error: 'Input validation failed',
                    violations: validationResult.violations.map((v) => ({
                        rule: v.ruleName,
                        severity: v.severity,
                        message: v.message
                    })),
                    validationId: validationResult.validationId
                });
            }

            // Update request with sanitized input
            if (validationResult.finalInput !== input) {
                if (req.body?.message) req.body.message = validationResult.finalInput;
                if (req.query?.input) req.query.input = validationResult.finalInput;
                if (req.params?.input) req.params.input = validationResult.finalInput;
            }

            next();
        } catch (error) {
            logger.error('❌ Validation middleware error', { error: error.message });
            res.status(500).json({
                error: 'Internal validation error',
                message: 'Please try again later'
            });
        }
    }
}

/**
 * FACTORY FOR EASY INSTANTIATION
 */
class InputValidatorFactory {
    static createDefault() {
        return new InputValidationChain();
    }

    static createStrict() {
        const chain = new InputValidationChain();
        chain.addValidator(new LengthValidator(5000, 1)); // Stricter length
        return chain;
    }

    static createPermissive() {
        const chain = new InputValidationChain();
        chain.removeValidator('BUSINESS_RULES');
        return chain;
    }

    static createMiddleware(type = 'default') {
        const chain =
      this[`create${type.charAt(0).toUpperCase() + type.slice(1)}`]();
        return new ValidationMiddleware(chain);
    }
}

module.exports = {
    ValidationRule,
    SQLInjectionValidator,
    XSSValidator,
    LengthValidator,
    EncodingValidator,
    BusinessRuleValidator,
    InputValidationChain,
    ValidationMiddleware,
    InputValidatorFactory
};
