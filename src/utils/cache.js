const logger = require('./logger');

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
            currentSize: 0
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
            usage: Math.round((this.metrics.currentSize / this.capacity) * 100)
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
            currentSize: this.cache.size
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
            timestamp: Date.now()
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

/**
 * Sistema de cache inteligente para optimizar contexto y reducir latencia
 */
class ContextCache {
    constructor() {
    // Cache estático (se carga una vez y persiste)
        this.staticCache = {
            catalogIndex: null,
            businessInfo: null,
            responseTemplates: null,
            lastUpdated: 0
        };

        // Cache dinámico por cliente usando LRU
        this.clientCache = new LRUCache(100); // Máximo 100 clientes

        // Cache de productos relevantes por keywords usando LRU
        this.productKeywordCache = new LRUCache(500); // Máximo 500 combinaciones

        // Configuración
        this.config = {
            staticCacheTTL: 3600000, // 1 hora
            clientCacheTTL: 300000, // 5 minutos
            productCacheTTL: 1800000, // 30 minutos
            maxClientCacheSize: 100, // Máximo 100 clientes en cache
            maxProductCacheSize: 500 // Máximo 500 combinaciones de keywords
        };
    }

    /**
   * Inicializa el cache estático con información del negocio.
   * @param {Object} db - Instancia de base de datos.
   */
    async initializeStaticCache(dbConnection) {
        const now = Date.now();

        // Solo actualizar si ha pasado más de 1 hora
        if (now - this.staticCache.lastUpdated < this.config.staticCacheTTL) {
            return;
        }

        try {
            logger.info('Inicializando cache estático...');

            // Cargar información del negocio
            this.staticCache.businessInfo = {
                nombre: 'Salva Cell',
                servicios: [
                    'Diagnóstico',
                    'Cambio de pantallas',
                    'Reparación de baterías',
                    'Accesorios'
                ],
                horario: 'L-S 11am-9pm, D 12pm-5pm',
                ubicacion: 'Av. C. del Refugio, Valle de las Misiones',
                mapsUrl: 'https://g.co/kgs/FpfFnJy'
            };

            // Cargar índice de catálogo optimizado
            this.staticCache.catalogIndex =
        await this.buildCatalogIndex(dbConnection);

            // Templates de respuesta optimizados
            this.staticCache.responseTemplates = {
                greeting: {
                    formal: ['Buenos días', 'Buenas tardes', 'Buenas noches'],
                    informal: ['¡Hola!', '¡Qué tal!', '¡Hey!'],
                    neutral: ['Hola', 'Buenas', 'Saludos']
                },
                pricing: [
                    'tengo disponible en',
                    'lo manejo en',
                    'está en',
                    'te puedo ofrecer en'
                ],
                uncertainty: [
                    'déjame consultar',
                    'permíteme verificar',
                    'voy a revisar',
                    'necesito confirmar'
                ]
            };

            this.staticCache.lastUpdated = now;
            logger.info('Cache estático inicializado correctamente');
        } catch (error) {
            logger.error('Error inicializando cache estático:', error);
        }
    }

    /**
   * Construye índice optimizado del catálogo para búsquedas rápidas.
   * @param {Object} db - Instancia de base de datos.
   * @returns {Promise<Object>} Índice del catálogo.
   */
    async buildCatalogIndex(dbConnection) {
        try {
            const index = {
                byBrand: {},
                byRepairType: {},
                byKeyword: {},
                allProducts: []
            };

            const result = await dbConnection.query(
                'SELECT * FROM reparaciones ORDER BY precio ASC'
            );
            const rows = result.rows;

            rows.forEach((product) => {
                // Normalizar datos
                const normalizedProduct = {
                    id: product.id,
                    modelo: product.modelo_celular.toLowerCase(),
                    tipo: product.tipo_reparacion.toLowerCase(),
                    precio: product.precio,
                    tiempo: product.tiempo_reparacion,
                    disponibilidad: product.disponibilidad,
                    notas: product.notas,
                    keywords: this.extractProductKeywords(product)
                };

                index.allProducts.push(normalizedProduct);

                // Índice por marca
                const brand = this.extractBrand(product.modelo_celular);
                if (brand) {
                    if (!index.byBrand[brand]) index.byBrand[brand] = [];
                    index.byBrand[brand].push(normalizedProduct);
                }

                // Índice por tipo de reparación
                const repairType = product.tipo_reparacion.toLowerCase();
                if (!index.byRepairType[repairType])
                    index.byRepairType[repairType] = [];
                index.byRepairType[repairType].push(normalizedProduct);

                // Índice por keywords
                normalizedProduct.keywords.forEach((keyword) => {
                    if (!index.byKeyword[keyword]) index.byKeyword[keyword] = [];
                    index.byKeyword[keyword].push(normalizedProduct);
                });
            });

            return index;
        } catch (error) {
            logger.error('Error construyendo índice de catálogo:', error);
            throw error;
        }
    }

    /**
   * Extrae keywords de un producto para indexación.
   * @param {Object} product - Producto de la BD.
   * @returns {Array} Array de keywords.
   */
    extractProductKeywords(product) {
        const keywords = [];

        // Keywords del modelo
        const modelWords = product.modelo_celular
            .toLowerCase()
            .split(/[\s\-_]+/)
            .filter((word) => word.length > 1);
        keywords.push(...modelWords);

        // Keywords del tipo de reparación
        const repairWords = product.tipo_reparacion
            .toLowerCase()
            .split(/[\s\-_]+/)
            .filter((word) => word.length > 2);
        keywords.push(...repairWords);

        // Extraer marca
        const brand = this.extractBrand(product.modelo_celular);
        if (brand) keywords.push(brand);

        // Extraer números de modelo
        const numbers = product.modelo_celular.match(/\d+/g);
        if (numbers) keywords.push(...numbers);

        return [...new Set(keywords)]; // Remover duplicados
    }

    /**
   * Extrae la marca de un modelo de celular.
   * @param {string} model - Modelo del celular.
   * @returns {string|null} Marca detectada.
   */
    extractBrand(model) {
        const lowerModel = model.toLowerCase();
        const brands = {
            samsung: ['samsung', 'galaxy'],
            iphone: ['iphone', 'apple'],
            xiaomi: ['xiaomi', 'redmi', 'mi '],
            huawei: ['huawei', 'honor', 'mate'],
            lg: ['lg'],
            motorola: ['motorola', 'moto'],
            nokia: ['nokia'],
            oppo: ['oppo'],
            vivo: ['vivo'],
            oneplus: ['oneplus', 'one plus']
        };

        for (const [brand, identifiers] of Object.entries(brands)) {
            if (identifiers.some((id) => lowerModel.includes(id))) {
                return brand;
            }
        }

        return null;
    }

    /**
   * Obtiene contexto optimizado para un cliente específico.
   * @param {string} clientId - ID del cliente.
   * @param {Object} fullContext - Contexto completo del cliente.
   * @returns {Object} Contexto optimizado.
   */
    getOptimizedClientContext(clientId, fullContext) {
    // Verificar cache de cliente
        const cached = this.clientCache.get(clientId);
        const now = Date.now();

        if (cached && now - cached.timestamp < this.config.clientCacheTTL) {
            return {
                ...cached.context,
                _cached: true,
                _cacheAge: now - cached.timestamp
            };
        }

        // Crear contexto optimizado
        const optimizedContext = {
            // Información esencial del cliente
            esNuevo: fullContext.esNuevo,
            nombreCliente: fullContext.nombreCliente,
            tieneNombre: fullContext.tieneNombre,
            yaSePresentoIA: fullContext.yaSePresentoIA,

            // Preferencias detectadas
            tonoPreferido: fullContext.tonoPreferido || 'neutral',
            franjaTiempo: fullContext.franjaTiempo,
            horaActual: fullContext.horaActual,

            // Información de comportamiento (resumida)
            totalConsultas: fullContext.totalConsultas || 0,
            esClienteRecurrente: fullContext.esClienteRecurrente,
            satisfaccionPromedio: fullContext.satisfaccionPromedio || 7,

            // Solo productos de última interacción
            productosAnterior: fullContext.productosAnterior?.slice(0, 3) || [],

            // Solo última interacción del historial
            ultimaConsulta: fullContext.historialReciente?.[0] || null
        };

        // Guardar en cache (LRU maneja automáticamente el límite)
        this.clientCache.set(clientId, {
            context: optimizedContext,
            timestamp: now
        });

        return {
            ...optimizedContext,
            _cached: false,
            _cacheAge: 0
        };
    }

    /**
   * Obtiene productos relevantes para una consulta específica.
   * @param {string} userQuery - Consulta del usuario.
   * @param {number} limit - Límite de productos a retornar.
   * @returns {Array} Array de productos relevantes.
   */
    getRelevantProducts(userQuery, limit = 20) {
        if (!this.staticCache.catalogIndex) {
            logger.warn('Cache estático no inicializado, retornando array vacío');
            return [];
        }

        // Crear clave de cache
        const queryKey = this.normalizeQuery(userQuery);
        const cacheKey = `${queryKey}_${limit}`;

        // Verificar cache de productos
        const cached = this.productKeywordCache.get(cacheKey);
        const now = Date.now();

        if (cached && now - cached.timestamp < this.config.productCacheTTL) {
            return cached.products;
        }

        // Buscar productos relevantes
        const relevantProducts = this.searchRelevantProducts(userQuery, limit);

        // Guardar en cache (LRU maneja automáticamente el límite)
        this.productKeywordCache.set(cacheKey, {
            products: relevantProducts,
            timestamp: now
        });

        return relevantProducts;
    }

    /**
   * Busca productos relevantes usando el índice del catálogo.
   * @param {string} userQuery - Consulta del usuario.
   * @param {number} limit - Límite de resultados.
   * @returns {Array} Productos relevantes.
   */
    searchRelevantProducts(userQuery, limit) {
        const index = this.staticCache.catalogIndex;
        const queryWords = this.normalizeQuery(userQuery).split(' ');
        const scored = [];

        // Buscar en cada producto
        index.allProducts.forEach((product) => {
            let score = 0;

            // Calcular score basado en coincidencias de keywords
            queryWords.forEach((word) => {
                if (product.keywords.includes(word)) {
                    score += 10; // Coincidencia exacta de keyword
                }
                if (product.modelo.includes(word)) {
                    score += 15; // Coincidencia en modelo
                }
                if (product.tipo.includes(word)) {
                    score += 12; // Coincidencia en tipo
                }
            });

            // Bonus por popularidad (precio más bajo = más popular)
            if (score > 0) {
                score += Math.max(0, 20 - product.precio / 100);
            }

            if (score > 0) {
                scored.push({ product, score });
            }
        });

        // Ordenar por score y retornar top N
        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((item) => item.product);
    }

    /**
   * Normaliza una consulta para búsqueda.
   * @param {string} query - Consulta original.
   * @returns {string} Consulta normalizada.
   */
    normalizeQuery(query) {
        return query
            .toLowerCase()
            .replace(/[^\w\s]/g, '') // Remover puntuación
            .replace(/\s+/g, ' ') // Normalizar espacios
            .trim();
    }

    /**
   * Obtiene estadísticas del cache.
   * @returns {Object} Estadísticas del cache.
   */
    getCacheStats() {
        return {
            staticCache: {
                isInitialized: Boolean(this.staticCache.catalogIndex),
                lastUpdated: this.staticCache.lastUpdated,
                catalogSize: this.staticCache.catalogIndex?.allProducts?.length || 0
            },
            clientCache: {
                ...this.clientCache.getMetrics(),
                maxSize: this.config.maxClientCacheSize
            },
            productCache: {
                ...this.productKeywordCache.getMetrics(),
                maxSize: this.config.maxProductCacheSize
            }
        };
    }

    /**
   * Limpia todos los caches.
   */
    clearAllCaches() {
        this.clientCache.clear();
        this.productKeywordCache.clear();
        this.staticCache = {
            catalogIndex: null,
            businessInfo: null,
            responseTemplates: null,
            lastUpdated: 0
        };
        logger.info('Todos los caches LRU limpiados');
    }
}

// Singleton instance
const contextCache = new ContextCache();

module.exports = {
    LRUCache,
    MetricsLRUCache,
    ContextCache,
    contextCache
};
