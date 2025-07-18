// src/utils/proactiveMonitor.js

const logger = require('./logger');
const { pool } = require('../database/pg');
const { CircuitBreaker, apiRateLimiter } = require('./resilience');
const circuitBreaker = {
    // Mocking the old structure for now. This will be replaced later.
    anthropicCircuitBreaker: new CircuitBreaker(() => {}, { serviceName: 'anthropic' })
};
const failureHandler = require('./failureHandler');
const conversationContext = require('./conversationContext');
const { conversationFSM } = require('./conversationFSM');

/**
 * Sistema de monitoreo proactivo para detectar problemas antes de que afecten a los usuarios
 */
class ProactiveMonitor {
    constructor() {
        this.monitoringInterval = 300000; // 5 minutos
        this.alerts = [];
        this.metrics = {
            systemHealth: 100,
            responseTime: 0,
            errorRate: 0,
            userSatisfaction: 0,
            lastHealthCheck: null
        };

        this.thresholds = {
            criticalErrorRate: 0.1, // 10% error rate
            warningErrorRate: 0.05, // 5% error rate
            criticalResponseTime: 10000, // 10 segundos
            warningResponseTime: 5000, // 5 segundos
            minUserSatisfaction: 6, // Satisfacción mínima sobre 10
            maxConsecutiveFailures: 5, // Máximo fallos consecutivos
            minSystemHealth: 70 // Salud mínima del sistema
        };

        this.healthChecks = {
            database: false,
            anthropicAPI: false,
            chromaDB: false,
            circuitBreaker: false,
            rateLimiter: false
        };

        this.isMonitoring = false;
    }

    /**
   * Inicia el monitoreo proactivo
   */
    start() {
        if (this.isMonitoring) {
            logger.warn('Monitoreo proactivo ya está en ejecución');
            return;
        }

        this.isMonitoring = true;
        logger.info('Iniciando sistema de monitoreo proactivo');

        // Ejecutar verificación inicial
        this.performHealthCheck();

        // Configurar monitoreo periódico
        this.monitorInterval = setInterval(() => {
            this.performHealthCheck();
        }, this.monitoringInterval);

        // Configurar monitoreo de alertas críticas cada minuto
        this.alertInterval = setInterval(() => {
            this.checkCriticalAlerts();
        }, 60000);
    }

    /**
   * Detiene el monitoreo proactivo
   */
    stop() {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;

        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }

        if (this.alertInterval) {
            clearInterval(this.alertInterval);
        }

        logger.info('Sistema de monitoreo proactivo detenido');
    }

    /**
   * Realiza verificación completa de salud del sistema
   */
    async performHealthCheck() {
        const startTime = Date.now();
        logger.info('Ejecutando verificación de salud del sistema');

        try {
            // Verificar componentes principales
            await this.checkDatabaseHealth();
            await this.checkAnthropicAPIHealth();
            await this.checkCircuitBreakerHealth();
            await this.checkRateLimiterHealth();

            // Calcular métricas
            await this.calculateSystemMetrics();

            // Evaluar salud general
            this.evaluateSystemHealth();

            // Generar alertas si es necesario
            this.generateAlerts();

            const endTime = Date.now();
            this.metrics.lastHealthCheck = new Date();

            logger.info(
                `Verificación de salud completada en ${endTime - startTime}ms`,
                {
                    systemHealth: this.metrics.systemHealth,
                    healthChecks: this.healthChecks
                }
            );
        } catch (error) {
            logger.error('Error en verificación de salud del sistema:', error);
            this.addAlert(
                'critical',
                'health_check_failed',
                'Error en verificación de salud del sistema'
            );
        }
    }

    /**
   * Verifica la salud de la base de datos
   */
    async checkDatabaseHealth() {
        try {
            const client = await pool.connect();
            const result = await client.query(
                'SELECT 1 as health_check, NOW() as timestamp'
            );
            client.release();

            this.healthChecks.database = result.rows.length > 0;

            if (!this.healthChecks.database) {
                this.addAlert(
                    'critical',
                    'database_connection',
                    'No se puede conectar a la base de datos'
                );
            }
        } catch (error) {
            this.healthChecks.database = false;
            this.addAlert(
                'critical',
                'database_error',
                `Error de base de datos: ${error.message}`
            );
        }
    }

    /**
   * Verifica la salud de la API de Anthropic
   */
    async checkAnthropicAPIHealth() {
        try {
            const status = circuitBreaker.anthropicCircuitBreaker?.getStatus();
            this.healthChecks.anthropicAPI = status ? status.state !== 'open' : false;

            if (!this.healthChecks.anthropicAPI) {
                this.addAlert(
                    'critical',
                    'anthropic_api',
                    'API de Anthropic no disponible (Circuit Breaker abierto)'
                );
            }
        } catch (error) {
            this.healthChecks.anthropicAPI = false;
            this.addAlert(
                'warning',
                'anthropic_api_check',
                `Error verificando API Anthropic: ${error.message}`
            );
        }
    }

    /**
   * Verifica la salud del Circuit Breaker
   */
    async checkCircuitBreakerHealth() {
        try {
            const status = circuitBreaker.anthropicCircuitBreaker?.getStatus();

            if (status) {
                this.healthChecks.circuitBreaker = true;

                if (status.state === 'open') {
                    this.addAlert(
                        'critical',
                        'circuit_breaker_open',
                        'Circuit Breaker abierto - API no disponible'
                    );
                } else if (status.state === 'half-open') {
                    this.addAlert(
                        'warning',
                        'circuit_breaker_half_open',
                        'Circuit Breaker en modo de prueba'
                    );
                }
            } else {
                this.healthChecks.circuitBreaker = false;
                this.addAlert(
                    'warning',
                    'circuit_breaker_missing',
                    'Circuit Breaker no inicializado'
                );
            }
        } catch (error) {
            this.healthChecks.circuitBreaker = false;
            this.addAlert(
                'warning',
                'circuit_breaker_error',
                `Error en Circuit Breaker: ${error.message}`
            );
        }
    }

    /**
   * Verifica la salud del Rate Limiter
   */
    async checkRateLimiterHealth() {
        try {
            const stats = apiRateLimiter.getStats();
            this.healthChecks.rateLimiter = Object.keys(stats).length > 0;

            // Verificar si hay demasiadas solicitudes bloqueadas
            for (const [apiType, apiStats] of Object.entries(stats)) {
                const hitRate = apiStats.cacheMetrics.hitRate;
                if (hitRate < 50) {
                    // Si menos del 50% de requests son exitosos
                    this.addAlert(
                        'warning',
                        'rate_limit_high',
                        `Alto rate limiting en ${apiType}: ${hitRate}% éxito`
                    );
                }
            }
        } catch (error) {
            this.healthChecks.rateLimiter = false;
            this.addAlert(
                'warning',
                'rate_limiter_error',
                `Error en Rate Limiter: ${error.message}`
            );
        }
    }

    /**
   * Calcula métricas del sistema
   */
    async calculateSystemMetrics() {
        try {
            // Calcular tasa de error basada en fallos registrados
            const failureStats = await failureHandler.getFailureStats();
            if (failureStats.total_clients > 0) {
                this.metrics.errorRate =
          failureStats.clients_with_failures / failureStats.total_clients;
            }

            // Calcular satisfacción del usuario basada en interacciones recientes
            const client = await pool.connect();
            const satisfactionResult = await client.query(`
                SELECT AVG(estimated_satisfaction) as avg_satisfaction
                FROM interaction_history 
                WHERE created_at > NOW() - INTERVAL '1 hour'
            `);
            client.release();

            if (satisfactionResult.rows[0]?.avg_satisfaction) {
                this.metrics.userSatisfaction = parseFloat(
                    satisfactionResult.rows[0].avg_satisfaction
                );
            }

            // Métricas de contexto conversacional
            const contextStats = conversationContext.getStats();
            const cacheHitRate = contextStats.cacheMetrics.hitRate;

            // Métricas de FSM
            const fsmStats = conversationFSM.getStats();
            const completionRate = fsmStats.completionRate;

            logger.debug('Métricas calculadas:', {
                errorRate: this.metrics.errorRate,
                userSatisfaction: this.metrics.userSatisfaction,
                cacheHitRate,
                completionRate
            });
        } catch (error) {
            logger.error('Error calculando métricas del sistema:', error);
        }
    }

    /**
   * Evalúa la salud general del sistema
   */
    evaluateSystemHealth() {
        let healthScore = 100;

        // Penalizar por componentes no saludables
        const healthyComponents = Object.values(this.healthChecks).filter(
            Boolean
        ).length;
        const totalComponents = Object.keys(this.healthChecks).length;
        const componentHealth = (healthyComponents / totalComponents) * 100;

        // Penalizar por alta tasa de error
        const errorPenalty = this.metrics.errorRate * 50; // 50 puntos por cada 100% de error

        // Penalizar por baja satisfacción
        const satisfactionPenalty = Math.max(
            0,
            (this.thresholds.minUserSatisfaction - this.metrics.userSatisfaction) *
        10
        );

        healthScore = Math.max(
            0,
            componentHealth - errorPenalty - satisfactionPenalty
        );

        this.metrics.systemHealth = Math.round(healthScore);

        logger.info(`Salud del sistema: ${this.metrics.systemHealth}%`, {
            componentHealth: Math.round(componentHealth),
            errorRate: this.metrics.errorRate,
            userSatisfaction: this.metrics.userSatisfaction
        });
    }

    /**
   * Genera alertas basadas en las métricas
   */
    generateAlerts() {
    // Alertas por salud del sistema
        if (this.metrics.systemHealth < this.thresholds.minSystemHealth) {
            this.addAlert(
                'critical',
                'system_health_low',
                `Salud del sistema crítica: ${this.metrics.systemHealth}%`
            );
        }

        // Alertas por tasa de error
        if (this.metrics.errorRate >= this.thresholds.criticalErrorRate) {
            this.addAlert(
                'critical',
                'error_rate_high',
                `Tasa de error crítica: ${(this.metrics.errorRate * 100).toFixed(1)}%`
            );
        } else if (this.metrics.errorRate >= this.thresholds.warningErrorRate) {
            this.addAlert(
                'warning',
                'error_rate_elevated',
                `Tasa de error elevada: ${(this.metrics.errorRate * 100).toFixed(1)}%`
            );
        }

        // Alertas por satisfacción del usuario
        if (this.metrics.userSatisfaction < this.thresholds.minUserSatisfaction) {
            this.addAlert(
                'warning',
                'user_satisfaction_low',
                `Satisfacción del usuario baja: ${this.metrics.userSatisfaction}/10`
            );
        }
    }

    /**
   * Añade una alerta al sistema
   * @param {string} severity - Severidad (critical, warning, info)
   * @param {string} type - Tipo de alerta
   * @param {string} message - Mensaje de la alerta
   */
    addAlert(severity, type, message) {
        const alert = {
            id: Date.now().toString(),
            severity,
            type,
            message,
            timestamp: new Date(),
            acknowledged: false
        };

        // Evitar alertas duplicadas recientes
        const isDuplicate = this.alerts.some(
            (existingAlert) =>
                existingAlert.type === type &&
        existingAlert.severity === severity &&
        Date.now() - existingAlert.timestamp.getTime() < 300000 // 5 minutos
        );

        if (!isDuplicate) {
            this.alerts.push(alert);
            logger.warn(`Alerta ${severity}: ${type} - ${message}`);

            // Mantener solo las últimas 100 alertas
            if (this.alerts.length > 100) {
                this.alerts = this.alerts.slice(-100);
            }
        }
    }

    /**
   * Verifica alertas críticas que requieren acción inmediata
   */
    checkCriticalAlerts() {
        const criticalAlerts = this.alerts.filter(
            (alert) =>
                alert.severity === 'critical' &&
        !alert.acknowledged &&
        Date.now() - alert.timestamp.getTime() < 600000 // Últimos 10 minutos
        );

        if (criticalAlerts.length > 0) {
            logger.error(
                `${criticalAlerts.length} alertas críticas sin atender:`,
                criticalAlerts.map((a) => a.message)
            );
        }
    }

    /**
   * Obtiene el estado completo del monitoreo
   * @returns {Object} Estado del monitoreo
   */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            lastHealthCheck: this.metrics.lastHealthCheck,
            systemHealth: this.metrics.systemHealth,
            healthChecks: this.healthChecks,
            metrics: this.metrics,
            alerts: this.alerts.slice(-20), // Últimas 20 alertas
            thresholds: this.thresholds
        };
    }

    /**
   * Reconoce una alerta
   * @param {string} alertId - ID de la alerta
   * @returns {boolean} True si se reconoció correctamente
   */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find((a) => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            logger.info(`Alerta reconocida: ${alert.type}`);
            return true;
        }
        return false;
    }

    /**
   * Limpia alertas antiguas y reconocidas
   * @returns {number} Número de alertas limpiadas
   */
    cleanupAlerts() {
        const oldAlerts = this.alerts.length;
        const oneDayAgo = Date.now() - 86400000; // 24 horas

        this.alerts = this.alerts.filter(
            (alert) =>
                alert.timestamp.getTime() > oneDayAgo &&
        (!alert.acknowledged || alert.severity === 'critical')
        );

        const cleaned = oldAlerts - this.alerts.length;
        if (cleaned > 0) {
            logger.info(`Limpieza de alertas: ${cleaned} alertas eliminadas`);
        }

        return cleaned;
    }
}

// Singleton instance
const proactiveMonitor = new ProactiveMonitor();

module.exports = proactiveMonitor;
