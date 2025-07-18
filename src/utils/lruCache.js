// src/utils/lruCache.js

/**
 * Implementación de LRU (Least Recently Used) Cache
 * Evita memory leaks manteniendo solo los elementos más recientemente usados
 */
class LRUCache {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.cache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      currentSize: 0,
    };
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave a buscar
   * @returns {*} Valor encontrado o null
   */
  get(key) {
    if (this.cache.has(key)) {
      // Mover al final (más reciente)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      this.metrics.hits++;
      return value;
    }

    this.metrics.misses++;
    return null;
  }

  /**
   * Establece un valor en el cache
   * @param {string} key - Clave
   * @param {*} value - Valor a almacenar
   */
  set(key, value) {
    // Si ya existe, actualizar
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Si está lleno, eliminar el más antiguo
    else if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.metrics.evictions++;
    }

    this.cache.set(key, value);
    this.metrics.sets++;
    this.metrics.currentSize = this.cache.size;
  }

  /**
   * Verifica si una clave existe en el cache
   * @param {string} key - Clave a verificar
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Elimina una clave del cache
   * @param {string} key - Clave a eliminar
   * @returns {boolean} True si se eliminó
   */
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.currentSize = this.cache.size;
    }
    return deleted;
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
    this.metrics.currentSize = 0;
  }

  /**
   * Obtiene el tamaño actual del cache
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Obtiene todas las claves del cache
   * @returns {Array}
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtiene todos los valores del cache
   * @returns {Array}
   */
  values() {
    return Array.from(this.cache.values());
  }

  /**
   * Itera sobre el cache (más reciente primero)
   * @param {Function} callback - Función a ejecutar para cada elemento
   */
  forEach(callback) {
    // Reverse para iterar del más reciente al más antiguo
    const entries = Array.from(this.cache.entries()).reverse();
    entries.forEach(([key, value]) => {
      callback(value, key, this);
    });
  }

  /**
   * Obtiene métricas de rendimiento del cache
   * @returns {Object}
   */
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100, // 2 decimales
      capacity: this.capacity,
      usage: Math.round((this.metrics.currentSize / this.capacity) * 100),
    };
  }

  /**
   * Resetea las métricas de rendimiento
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      currentSize: this.cache.size,
    };
  }

  /**
   * Obtiene elementos más antiguos que la fecha especificada
   * @param {number} maxAge - Edad máxima en milisegundos
   * @returns {Array} Array de claves a eliminar
   */
  getExpiredKeys(maxAge) {
    const now = Date.now();
    const expiredKeys = [];

    // Iterar en orden de inserción (más antiguos primero)
    for (const [key, value] of this.cache) {
      if (value.timestamp && now - value.timestamp > maxAge) {
        expiredKeys.push(key);
      }
    }

    return expiredKeys;
  }

  /**
   * Elimina elementos expirados
   * @param {number} maxAge - Edad máxima en milisegundos
   * @returns {number} Número de elementos eliminados
   */
  evictExpired(maxAge) {
    const expiredKeys = this.getExpiredKeys(maxAge);
    let evicted = 0;

    for (const key of expiredKeys) {
      if (this.delete(key)) {
        evicted++;
      }
    }

    return evicted;
  }
}

/**
 * Cache especializado para métricas con funcionalidades adicionales
 */
class MetricsLRUCache extends LRUCache {
  constructor(capacity = 1000) {
    super(capacity);
    this.maxAge = 3600000; // 1 hora por defecto
  }

  /**
   * Agrega una métrica con timestamp automático
   * @param {string} key - Clave de la métrica
   * @param {*} value - Valor de la métrica
   */
  addMetric(key, value) {
    const metric = {
      value,
      timestamp: Date.now(),
    };
    this.set(key, metric);
  }

  /**
   * Obtiene métricas recientes (no expiradas)
   * @param {string} key - Clave a buscar
   * @returns {*} Valor si no ha expirado, null en caso contrario
   */
  getRecentMetric(key) {
    const metric = this.get(key);
    if (!metric) return null;

    const age = Date.now() - metric.timestamp;
    if (age > this.maxAge) {
      this.delete(key);
      return null;
    }

    return metric.value;
  }

  /**
   * Limpia métricas expiradas automáticamente
   */
  cleanup() {
    const evicted = this.evictExpired(this.maxAge);
    if (evicted > 0) {
      console.log(`LRU Cache: ${evicted} métricas expiradas eliminadas`);
    }
    return evicted;
  }

  /**
   * Establece la edad máxima para las métricas
   * @param {number} maxAge - Edad máxima en milisegundos
   */
  setMaxAge(maxAge) {
    this.maxAge = maxAge;
  }
}

module.exports = {
  LRUCache,
  MetricsLRUCache,
};
