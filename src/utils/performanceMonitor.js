// src/utils/performanceMonitor.js

const logger = require("./logger");
const { MetricsLRUCache } = require("./lruCache");

/**
 * Monitor de rendimiento para el sistema híbrido LLM
 */
class PerformanceMonitor {
  constructor() {
    // Reemplazar arrays con LRU Caches para evitar memory leaks
    this.latencyCache = new MetricsLRUCache(1000); // Máximo 1000 métricas de latencia
    this.alertsCache = new MetricsLRUCache(500); // Máximo 500 alertas

    this.metrics = {
      // Métricas generales
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,

      // Métricas por fuente
      sourceStats: {
        qwen_local: { count: 0, totalLatency: 0, errors: 0 },
        claude_remote: { count: 0, totalLatency: 0, errors: 0 },
        emergency: { count: 0, totalLatency: 0, errors: 0 },
      },

      // Métricas por tipo de consulta
      intentionStats: {},

      // Métricas por hora del día
      hourlyStats: {},

      // Configuración
      config: {
        latencyWarningThreshold: 3000, // 3 segundos
        latencyErrorThreshold: 6000, // 6 segundos
        errorRateThreshold: 10, // 10% de errores
        maxMetricsHistory: 1000, // Máximo 1000 métricas en memoria
        alertCooldown: 300000, // 5 minutos entre alertas del mismo tipo
      },
    };

    this.startTime = Date.now();
    this.lastCleanup = Date.now();
    this.lastAlerts = {};
  }

  /**
   * Registra una nueva solicitud procesada.
   * @param {Object} requestData - Datos de la solicitud.
   */
  recordRequest(requestData) {
    const { userQuery, source, latency, success, intention, clientId, error } =
      requestData;

    this.metrics.totalRequests++;

    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      this.metrics.sourceStats[source].errors++;
    }

    // Registrar latencia
    this.recordLatency(source, latency);

    // Registrar por fuente
    this.recordSourceStats(source, latency);

    // Registrar por intención
    this.recordIntentionStats(intention, latency, success);

    // Registrar por hora
    this.recordHourlyStats(latency, success);

    // Verificar alertas
    this.checkAlerts(requestData);

    // Limpieza periódica
    this.periodicCleanup();

    // Log detallado si es necesario
    this.logIfNeeded(requestData);
  }

  /**
   * Registra métricas de latencia usando LRU Cache.
   * @param {string} source - Fuente de la respuesta.
   * @param {number} latency - Latencia en ms.
   */
  recordLatency(source, latency) {
    const timestamp = Date.now();
    const key = `${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    // Usar LRU Cache en lugar de arrays
    this.latencyCache.addMetric(key, {
      value: latency,
      source,
      timestamp,
    });

    // Limpieza automática periódica
    if (this.latencyCache.size() % 100 === 0) {
      this.latencyCache.cleanup();
    }
  }

  /**
   * Registra estadísticas por fuente.
   * @param {string} source - Fuente utilizada.
   * @param {number} latency - Latencia en ms.
   */
  recordSourceStats(source, latency) {
    if (!this.metrics.sourceStats[source]) {
      this.metrics.sourceStats[source] = {
        count: 0,
        totalLatency: 0,
        errors: 0,
      };
    }

    this.metrics.sourceStats[source].count++;
    this.metrics.sourceStats[source].totalLatency += latency;
  }

  /**
   * Registra estadísticas por tipo de intención.
   * @param {string} intention - Tipo de intención.
   * @param {number} latency - Latencia en ms.
   * @param {boolean} success - Si fue exitosa.
   */
  recordIntentionStats(intention, latency, success) {
    if (!intention) intention = "unknown";

    if (!this.metrics.intentionStats[intention]) {
      this.metrics.intentionStats[intention] = {
        count: 0,
        totalLatency: 0,
        successes: 0,
        failures: 0,
      };
    }

    const stats = this.metrics.intentionStats[intention];
    stats.count++;
    stats.totalLatency += latency;

    if (success) {
      stats.successes++;
    } else {
      stats.failures++;
    }
  }

  /**
   * Registra estadísticas por hora del día.
   * @param {number} latency - Latencia en ms.
   * @param {boolean} success - Si fue exitosa.
   */
  recordHourlyStats(latency, success) {
    const hour = new Date().getHours();

    if (!this.metrics.hourlyStats[hour]) {
      this.metrics.hourlyStats[hour] = {
        count: 0,
        totalLatency: 0,
        successes: 0,
        failures: 0,
      };
    }

    const stats = this.metrics.hourlyStats[hour];
    stats.count++;
    stats.totalLatency += latency;

    if (success) {
      stats.successes++;
    } else {
      stats.failures++;
    }
  }

  /**
   * Verifica si se deben generar alertas.
   * @param {Object} requestData - Datos de la solicitud.
   */
  checkAlerts(requestData) {
    const { source, latency, success, error } = requestData;
    const now = Date.now();

    // Alerta por latencia alta
    if (latency > this.metrics.config.latencyErrorThreshold) {
      this.generateAlert("high_latency_error", {
        latency,
        source,
        threshold: this.metrics.config.latencyErrorThreshold,
      });
    } else if (latency > this.metrics.config.latencyWarningThreshold) {
      this.generateAlert("high_latency_warning", {
        latency,
        source,
        threshold: this.metrics.config.latencyWarningThreshold,
      });
    }

    // Alerta por tasa de error alta
    const errorRate = this.getErrorRate();
    if (errorRate > this.metrics.config.errorRateThreshold) {
      this.generateAlert("high_error_rate", {
        errorRate,
        threshold: this.metrics.config.errorRateThreshold,
      });
    }

    // Alerta si local no está disponible
    if (
      source === "claude_remote" &&
      requestData.reason === "local_unavailable"
    ) {
      this.generateAlert("local_unavailable", {
        message: "Qwen local no disponible, usando solo Claude remoto",
      });
    }
  }

  /**
   * Genera una alerta si no está en cooldown.
   * @param {string} type - Tipo de alerta.
   * @param {Object} data - Datos de la alerta.
   */
  generateAlert(type, data) {
    const now = Date.now();
    const lastAlert = this.lastAlerts[type] || 0;

    if (now - lastAlert > this.metrics.config.alertCooldown) {
      const alert = {
        type,
        timestamp: now,
        data,
        message: this.formatAlertMessage(type, data),
      };

      // Usar LRU Cache para alertas en lugar de arrays
      const alertKey = `${type}_${now}_${Math.random().toString(36).substr(2, 9)}`;
      this.alertsCache.addMetric(alertKey, alert);

      logger.warn(`ALERT: ${alert.message}`, data);

      this.lastAlerts[type] = now;
    }
  }

  /**
   * Formatea el mensaje de una alerta.
   * @param {string} type - Tipo de alerta.
   * @param {Object} data - Datos de la alerta.
   * @returns {string} Mensaje formateado.
   */
  formatAlertMessage(type, data) {
    switch (type) {
      case "high_latency_error":
        return `Latencia crítica: ${data.latency}ms (>${data.threshold}ms) en ${data.source}`;
      case "high_latency_warning":
        return `Latencia alta: ${data.latency}ms (>${data.threshold}ms) en ${data.source}`;
      case "high_error_rate":
        return `Tasa de error alta: ${data.errorRate}% (>${data.threshold}%)`;
      case "local_unavailable":
        return data.message;
      default:
        return `Alerta desconocida: ${type}`;
    }
  }

  /**
   * Obtiene la tasa de error actual.
   * @returns {number} Tasa de error en porcentaje.
   */
  getErrorRate() {
    if (this.metrics.totalRequests === 0) return 0;
    return (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
  }

  /**
   * Limpieza periódica de métricas usando LRU Cache.
   */
  periodicCleanup() {
    const now = Date.now();

    // Limpiar cada 10 minutos
    if (now - this.lastCleanup > 600000) {
      // Limpiar caches automáticamente
      const latencyEvicted = this.latencyCache.cleanup();
      const alertsEvicted = this.alertsCache.cleanup();

      if (latencyEvicted > 0 || alertsEvicted > 0) {
        logger.info(`Performance Monitor: Limpieza automática completada`, {
          latencyEvicted,
          alertsEvicted,
          currentLatencySize: this.latencyCache.size(),
          currentAlertsSize: this.alertsCache.size(),
        });
      }

      this.lastCleanup = now;
    }
  }

  /**
   * Log detallado si es necesario.
   * @param {Object} requestData - Datos de la solicitud.
   */
  logIfNeeded(requestData) {
    const { latency, success, source, intention } = requestData;

    // Log requests lentas
    if (latency > this.metrics.config.latencyWarningThreshold) {
      logger.info(`Slow request: ${latency}ms`, {
        source,
        intention,
        success,
      });
    }

    // Log cada 100 requests
    if (this.metrics.totalRequests % 100 === 0) {
      logger.info("Performance summary", this.getSummary());
    }
  }

  /**
   * Obtiene un resumen de rendimiento.
   * @returns {Object} Resumen de métricas.
   */
  getSummary() {
    const now = Date.now();
    const uptime = now - this.startTime;

    // Calcular latencia promedio por fuente
    const sourceAverages = {};
    Object.keys(this.metrics.sourceStats).forEach((source) => {
      const stats = this.metrics.sourceStats[source];
      sourceAverages[source] = {
        count: stats.count,
        avgLatency:
          stats.count > 0 ? Math.round(stats.totalLatency / stats.count) : 0,
        errorRate:
          stats.count > 0 ? Math.round((stats.errors / stats.count) * 100) : 0,
      };
    });

    // Calcular latencia promedio usando LRU Cache
    const latencyValues = [];
    this.latencyCache.forEach((metric) => {
      latencyValues.push(metric.value);
    });

    const totalLatency = latencyValues.reduce((sum, value) => sum + value, 0);
    const avgLatency =
      latencyValues.length > 0
        ? Math.round(totalLatency / latencyValues.length)
        : 0;

    // Percentiles de latencia
    const sortedLatencies = latencyValues.sort((a, b) => a - b);

    const p50 = this.getPercentile(sortedLatencies, 50);
    const p95 = this.getPercentile(sortedLatencies, 95);
    const p99 = this.getPercentile(sortedLatencies, 99);

    return {
      uptime: Math.round(uptime / 1000), // en segundos
      totalRequests: this.metrics.totalRequests,
      successRate:
        this.metrics.totalRequests > 0
          ? Math.round(
              (this.metrics.successfulRequests / this.metrics.totalRequests) *
                100,
            )
          : 100,
      errorRate: this.getErrorRate(),
      avgLatency,
      latencyPercentiles: { p50, p95, p99 },
      sourceStats: sourceAverages,
      alertsCount: this.alertsCache.size(),
      cacheStats: {
        latency: this.latencyCache.getMetrics(),
        alerts: this.alertsCache.getMetrics(),
      },
    };
  }

  /**
   * Calcula un percentil de un array ordenado.
   * @param {Array} sortedArray - Array ordenado de números.
   * @param {number} percentile - Percentil a calcular (0-100).
   * @returns {number} Valor del percentil.
   */
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  /**
   * Obtiene métricas detalladas para análisis.
   * @returns {Object} Métricas completas.
   */
  getDetailedMetrics() {
    return {
      summary: this.getSummary(),
      intentionStats: this.metrics.intentionStats,
      hourlyStats: this.metrics.hourlyStats,
      recentAlerts: this.getRecentAlerts(),
      latencyTrends: this.getLatencyTrends(),
    };
  }

  /**
   * Obtiene alertas recientes usando LRU Cache.
   * @param {number} hours - Horas hacia atrás (por defecto 24).
   * @returns {Array} Alertas recientes.
   */
  getRecentAlerts(hours = 24) {
    const cutoff = Date.now() - hours * 3600000;
    const recentAlerts = [];

    this.alertsCache.forEach((alert, key) => {
      if (alert.timestamp > cutoff) {
        // Extraer tipo del key
        const type = key.split("_")[0];
        recentAlerts.push({ ...alert, type });
      }
    });

    return recentAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Obtiene tendencias de latencia por hora.
   * @returns {Object} Tendencias de latencia.
   */
  getLatencyTrends() {
    const hourlyAverages = {};

    Object.keys(this.metrics.hourlyStats).forEach((hour) => {
      const stats = this.metrics.hourlyStats[hour];
      hourlyAverages[hour] =
        stats.count > 0 ? Math.round(stats.totalLatency / stats.count) : 0;
    });

    return {
      byHour: hourlyAverages,
      currentHourAvg: this.getCurrentHourAverage(),
    };
  }

  /**
   * Obtiene el promedio de latencia de la hora actual usando LRU Cache.
   * @returns {number} Promedio de latencia en ms.
   */
  getCurrentHourAverage() {
    const oneHourAgo = Date.now() - 3600000;
    const currentHourValues = [];

    this.latencyCache.forEach((metric) => {
      if (metric.timestamp > oneHourAgo) {
        currentHourValues.push(metric.value);
      }
    });

    if (currentHourValues.length === 0) return 0;

    const sum = currentHourValues.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / currentHourValues.length);
  }

  /**
   * Reinicia todas las métricas.
   */
  reset() {
    // Reiniciar métricas básicas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      sourceStats: {},
      intentionStats: {},
      hourlyStats: {},
      config: this.metrics.config, // Mantener configuración
    };

    // Limpiar caches LRU
    this.latencyCache.clear();
    this.alertsCache.clear();

    this.startTime = Date.now();
    this.lastCleanup = Date.now();
    this.lastAlerts = {};

    logger.info("Performance metrics y LRU caches reiniciados");
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;
