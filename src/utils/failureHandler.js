// src/utils/failureHandler.js

const { pool } = require('../database/pg');
const logger = require('./logger');

/**
 * Manejador de fallos consecutivos para evitar frustración del usuario
 */
class FailureHandler {
    constructor() {
        this.config = {
            maxConsecutiveFailures: 2, // Máximo 2 fallos antes de escalar
            failureResetTime: 3600000, // 1 hora - tiempo para resetear contador
            escalationCooldown: 1800000 // 30 minutos - tiempo entre escalaciones
        };

        this.escalationMessages = {
            beforeEscalation: [
                'Veo que estoy teniendo problemas para entenderte, y lo lamento. Permíteme pasarte con un experto humano para no hacerte perder más tiempo.',
                'Disculpa, parece que no estoy captando bien lo que necesitas. Te voy a conectar con uno de nuestros especialistas para que te ayude mejor.',
                'Lo siento, creo que necesitas una atención más personalizada. Déjame transferirte con alguien de nuestro equipo que podrá ayudarte directamente.'
            ],
            escalationInstructions:
        'Para hablar con un experto humano, escribe \'CONTACTAR HUMANO\' o llámanos directamente. Mientras tanto, seguiré aquí por si necesitas información básica.'
        };
    }

    /**
   * Registra un fallo del bot con un cliente específico
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @param {string} userQuery - Consulta que causó el fallo
   * @param {string} errorType - Tipo de error (semantic_router, agent_executor, etc.)
   * @returns {Promise<Object>} Información sobre el fallo y si debe escalar
   */
    async recordFailure(phoneNumber, userQuery, errorType = 'unknown') {
        try {
            const client = await pool.connect();

            try {
                // Obtener información actual del cliente
                const clientResult = await client.query(
                    'SELECT consecutive_failures, last_failure_timestamp FROM clientes WHERE numero_telefono = $1',
                    [phoneNumber]
                );

                let consecutiveFailures = 0;
                let lastFailureTime = null;

                if (clientResult.rows.length > 0) {
                    consecutiveFailures = clientResult.rows[0].consecutive_failures || 0;
                    lastFailureTime = clientResult.rows[0].last_failure_timestamp;
                }

                const now = new Date();

                // Verificar si debemos resetear el contador (han pasado más de 1 hora)
                if (
                    lastFailureTime &&
          now - lastFailureTime > this.config.failureResetTime
                ) {
                    consecutiveFailures = 0;
                    logger.info(
                        `Reseteando contador de fallos para ${phoneNumber} - han pasado más de 1 hora`
                    );
                }

                // Incrementar contador de fallos
                consecutiveFailures += 1;

                // Actualizar en base de datos
                await client.query(
                    `UPDATE clientes
                     SET consecutive_failures = $1, last_failure_timestamp = $2
                     WHERE numero_telefono = $3`,
                    [consecutiveFailures, now, phoneNumber]
                );

                // Registrar el fallo en logs
                logger.warn(`Fallo registrado para ${phoneNumber}`, {
                    consecutiveFailures,
                    errorType,
                    userQuery: userQuery.substring(0, 100),
                    shouldEscalate:
            consecutiveFailures >= this.config.maxConsecutiveFailures
                });

                const shouldEscalate =
          consecutiveFailures >= this.config.maxConsecutiveFailures;

                return {
                    consecutiveFailures,
                    shouldEscalate,
                    escalationMessage: shouldEscalate
                        ? this.getEscalationMessage()
                        : null,
                    canRetry: !shouldEscalate
                };
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Error registrando fallo del cliente:', error);
            // En caso de error, no escalar para evitar más problemas
            return {
                consecutiveFailures: 0,
                shouldEscalate: false,
                escalationMessage: null,
                canRetry: true,
                error: error.message
            };
        }
    }

    /**
   * Registra un éxito del bot, reseteando el contador de fallos
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @returns {Promise<boolean>} True si se reseteo correctamente
   */
    async recordSuccess(phoneNumber) {
        try {
            const client = await pool.connect();

            try {
                // Resetear contador de fallos
                const result = await client.query(
                    `UPDATE clientes
                     SET consecutive_failures = 0, last_failure_timestamp = NULL
                     WHERE numero_telefono = $1 AND consecutive_failures > 0`,
                    [phoneNumber]
                );

                if (result.rowCount > 0) {
                    logger.info(
                        `Contador de fallos reseteado para ${phoneNumber} - respuesta exitosa`
                    );
                }

                return true;
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Error reseteando contador de fallos:', error);
            return false;
        }
    }

    /**
   * Obtiene un mensaje de escalación aleatorio
   * @returns {string} Mensaje de escalación
   */
    getEscalationMessage() {
        const messages = this.escalationMessages.beforeEscalation;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return `${randomMessage}\n\n${this.escalationMessages.escalationInstructions}`;
    }

    /**
   * Verifica si un cliente debe ser escalado (sin incrementar contador)
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @returns {Promise<Object>} Estado del cliente
   */
    async checkFailureStatus(phoneNumber) {
        try {
            const client = await pool.connect();

            try {
                const result = await client.query(
                    'SELECT consecutive_failures, last_failure_timestamp FROM clientes WHERE numero_telefono = $1',
                    [phoneNumber]
                );

                if (result.rows.length === 0) {
                    return {
                        consecutiveFailures: 0,
                        shouldEscalate: false,
                        canRetry: true
                    };
                }

                const failures = result.rows[0].consecutive_failures || 0;
                const lastFailure = result.rows[0].last_failure_timestamp;
                const now = new Date();

                // Verificar si el contador debe resetearse
                const shouldReset =
          lastFailure && now - lastFailure > this.config.failureResetTime;
                const effectiveFailures = shouldReset ? 0 : failures;

                return {
                    consecutiveFailures: effectiveFailures,
                    shouldEscalate:
            effectiveFailures >= this.config.maxConsecutiveFailures,
                    canRetry: effectiveFailures < this.config.maxConsecutiveFailures,
                    lastFailureTime: lastFailure
                };
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Error verificando estado de fallos:', error);
            return {
                consecutiveFailures: 0,
                shouldEscalate: false,
                canRetry: true,
                error: error.message
            };
        }
    }

    /**
   * Obtiene estadísticas de fallos del sistema
   * @returns {Promise<Object>} Estadísticas de fallos
   */
    async getFailureStats() {
        try {
            const client = await pool.connect();

            try {
                const stats = await client.query(
                    `
                    SELECT 
                        COUNT(*) as total_clients,
                        COUNT(CASE WHEN consecutive_failures > 0 THEN 1 END) as clients_with_failures,
                        COUNT(CASE WHEN consecutive_failures >= $1 THEN 1 END) as clients_needing_escalation,
                        AVG(consecutive_failures) as avg_failures,
                        MAX(consecutive_failures) as max_failures
                    FROM clientes
                `,
                    [this.config.maxConsecutiveFailures]
                );

                const recentFailures = await client.query(`
                    SELECT COUNT(*) as recent_failures
                    FROM clientes 
                    WHERE last_failure_timestamp > NOW() - INTERVAL '1 hour'
                `);

                return {
                    ...stats.rows[0],
                    recent_failures: recentFailures.rows[0].recent_failures,
                    config: this.config
                };
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Error obteniendo estadísticas de fallos:', error);
            return {
                error: error.message,
                config: this.config
            };
        }
    }

    /**
   * Resetea manualmente el contador de fallos para un cliente
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @returns {Promise<boolean>} True si se reseteo correctamente
   */
    async manualReset(phoneNumber) {
        logger.info(`Reset manual de fallos solicitado para ${phoneNumber}`);
        return await this.recordSuccess(phoneNumber);
    }

    /**
   * Configura los umbrales de fallos
   * @param {Object} newConfig - Nueva configuración
   */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        logger.info('Configuración de fallos actualizada:', this.config);
    }
}

// Singleton instance
const failureHandler = new FailureHandler();

module.exports = failureHandler;
