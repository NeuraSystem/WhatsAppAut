#!/usr/bin/env node

// src/services/markdownMetadataExtractor.js
// MARKDOWN METADATA EXTRACTOR - SOLUCIÓN 8 SIMPLIFICADA
// Extractor de metadatos YAML de archivos de precios Markdown

const fs = require("fs").promises;
const path = require("path");
const yaml = require("js-yaml");
const logger = require("../utils/logger");

/**
 * MARKDOWN METADATA EXTRACTOR
 * Extrae y procesa metadatos YAML de archivos de precios SalvaCell
 *
 * Características:
 * - Lectura de metadatos YAML de archivos Markdown
 * - Cache inteligente para optimizar performance
 * - Integración de información de garantías y timing
 * - Mapeo de marcas y modelos disponibles
 */
class MarkdownMetadataExtractor {
  constructor(options = {}) {
    this.config = {
      // Directorio de archivos Markdown
      markdownDir:
        options.markdownDir ||
        path.join(
          process.cwd(),
          "data",
          "processed_for_ai",
          "precios_markdown",
        ),

      // Cache configuration
      enableCache: options.enableCache !== false,
      cacheRefreshInterval: options.cacheRefreshInterval || 3600000, // 1 hora

      // Auto-refresh
      autoRefresh: options.autoRefresh !== false,
    };

    // Cache de metadatos
    this.metadataCache = new Map();
    this.lastCacheUpdate = 0;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      refreshes: 0,
      errors: 0,
    };

    // Información global extraída de Markdown
    this.globalInfo = {
      garantia_original: 30,
      garantia_generica: 15,
      tiempo_promedio: 52,
      cutoff_time: 16, // 4 PM
      service_time_range: "45-60 minutos",
      moneda: "MXN",
      ultima_actualizacion: null,
    };

    // Mapeo de marcas
    this.brandMapping = {
      Iphone: "iphone",
      Samsung: "samsung",
      Motorola: "motorola",
      Xiaomi: "xiaomi",
      Huawei: "huawei",
      Lg: "lg",
      Nokia: "nokia",
      Oppo: "oppo",
      Vivo: "vivo",
      Realme: "realme",
      Zte: "zte",
      Alcatel: "alcatel",
      Lanix: "lanix",
      Hisense: "hisense",
      M4: "m4",
      Xperia: "xperia",
    };

    logger.info("📁 MarkdownMetadataExtractor inicializado:", {
      markdownDir: this.config.markdownDir,
      enableCache: this.config.enableCache,
      autoRefresh: this.config.autoRefresh,
    });

    // Inicializar cache si está habilitado
    if (this.config.enableCache) {
      this.initializeCache();
    }
  }

  /**
   * INICIALIZAR CACHE
   * Carga inicial de metadatos desde archivos
   */
  async initializeCache() {
    try {
      await this.refreshCache();

      // Auto-refresh si está habilitado
      if (this.config.autoRefresh) {
        setInterval(() => {
          this.refreshCache().catch((error) => {
            logger.warn("Error en auto-refresh de cache:", error.message);
          });
        }, this.config.cacheRefreshInterval);
      }
    } catch (error) {
      logger.error("Error inicializando cache de metadatos Markdown:", error);
    }
  }

  /**
   * REFRESH CACHE
   * Actualiza cache de metadatos desde archivos
   */
  async refreshCache() {
    const startTime = Date.now();
    let filesProcessed = 0;
    let errorsCount = 0;

    try {
      // Verificar que el directorio existe
      await fs.access(this.config.markdownDir);

      // Leer archivos Markdown
      const files = await fs.readdir(this.config.markdownDir);
      const markdownFiles = files.filter((file) => file.endsWith(".md"));

      // Limpiar cache anterior
      this.metadataCache.clear();

      // Procesar cada archivo
      for (const file of markdownFiles) {
        try {
          const filePath = path.join(this.config.markdownDir, file);
          const metadata = await this.extractMetadataFromFile(filePath);

          if (metadata) {
            const brand = this.extractBrandFromFilename(file);
            this.metadataCache.set(brand, metadata);
            filesProcessed++;
          }
        } catch (fileError) {
          logger.warn(`Error procesando ${file}:`, fileError.message);
          errorsCount++;
          this.cacheStats.errors++;
        }
      }

      this.lastCacheUpdate = Date.now();
      this.cacheStats.refreshes++;

      logger.info(`📁 Cache de metadatos Markdown actualizado:`, {
        filesProcessed,
        errorsCount,
        duration: Date.now() - startTime,
        totalBrands: this.metadataCache.size,
      });
    } catch (error) {
      logger.error("Error refreshing Markdown metadata cache:", error);
      this.cacheStats.errors++;
    }
  }

  /**
   * EXTRAER METADATOS DE ARCHIVO
   * Lee y parsea metadatos YAML de archivo Markdown
   */
  async extractMetadataFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, "utf8");

      // Buscar sección de metadatos YAML
      const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);

      if (yamlMatch) {
        const yamlContent = yamlMatch[1];
        const metadata = yaml.load(yamlContent);

        // Enriquecer con información global
        const enrichedMetadata = {
          ...metadata,
          ...this.globalInfo,
          archivo_origen: path.basename(filePath),
          fecha_extraccion: new Date().toISOString(),
        };

        return enrichedMetadata;
      }

      // Si no hay YAML, extraer información básica del contenido
      return this.extractBasicInfoFromContent(content, filePath);
    } catch (error) {
      logger.warn(`Error extrayendo metadatos de ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * EXTRAER INFORMACIÓN BÁSICA DEL CONTENIDO
   * Fallback cuando no hay metadatos YAML
   */
  extractBasicInfoFromContent(content, filePath) {
    try {
      const lines = content.split("\n");
      const metadata = { ...this.globalInfo };

      // Buscar información en las primeras líneas
      for (const line of lines.slice(0, 20)) {
        // Extraer fecha de actualización
        if (line.includes("Última actualización:")) {
          const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            metadata.ultima_actualizacion = dateMatch[1];
          }
        }

        // Extraer información de garantía
        if (line.includes("30 días original") || line.includes("30 días")) {
          metadata.garantia_original = 30;
        }
        if (line.includes("15 días genérica") || line.includes("15 días")) {
          metadata.garantia_generica = 15;
        }

        // Extraer información de timing
        if (line.includes("45 minutos") || line.includes("45-60 min")) {
          metadata.tiempo_promedio = 52;
          metadata.service_time_range = "45-60 minutos";
        }

        if (line.includes("4 PM") || line.includes("antes de las 4")) {
          metadata.cutoff_time = 16;
        }
      }

      // Contar modelos disponibles (líneas de tabla)
      const tableLines = lines.filter(
        (line) => line.includes("|") && !line.includes("Modelo"),
      );
      metadata.modelos_disponibles = Math.max(0, tableLines.length - 1); // -1 para header

      metadata.archivo_origen = path.basename(filePath);
      metadata.fecha_extraccion = new Date().toISOString();

      return metadata;
    } catch (error) {
      logger.warn(
        `Error extrayendo información básica de ${filePath}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * EXTRAER MARCA DEL NOMBRE DE ARCHIVO
   * Normaliza nombre de archivo a marca estándar
   */
  extractBrandFromFilename(filename) {
    // Remover extensión y sufijo "_precios"
    const baseName = filename.replace("_precios.md", "").replace(".md", "");

    // Capitalizar primera letra
    const capitalized = baseName.charAt(0).toUpperCase() + baseName.slice(1);

    // Mapear a marca estándar
    return this.brandMapping[capitalized] || baseName.toLowerCase();
  }

  /**
   * OBTENER INFORMACIÓN DE DISPOSITIVO
   * Busca metadatos específicos de un dispositivo
   */
  async getDeviceInfo(deviceQuery) {
    try {
      // Verificar cache
      await this.ensureCacheValid();

      if (!deviceQuery || typeof deviceQuery !== "string") {
        return this.getGlobalInfo();
      }

      const query = deviceQuery.toLowerCase();

      // Buscar por marca específica
      for (const [brand, metadata] of this.metadataCache.entries()) {
        if (query.includes(brand) || brand.includes(query)) {
          this.cacheStats.hits++;

          return {
            ...metadata,
            marca: brand,
            match_type: "brand_specific",
          };
        }
      }

      // Buscar por palabras clave
      const brandKeywords = {
        iphone: "iphone",
        apple: "iphone",
        samsung: "samsung",
        galaxy: "samsung",
        motorola: "motorola",
        moto: "motorola",
        xiaomi: "xiaomi",
        redmi: "xiaomi",
        mi: "xiaomi",
        huawei: "huawei",
        lg: "lg",
      };

      for (const [keyword, brand] of Object.entries(brandKeywords)) {
        if (query.includes(keyword)) {
          const metadata = this.metadataCache.get(brand);
          if (metadata) {
            this.cacheStats.hits++;
            return {
              ...metadata,
              marca: brand,
              match_type: "keyword_match",
            };
          }
        }
      }

      // No se encontró marca específica, retornar información global
      this.cacheStats.misses++;
      return this.getGlobalInfo();
    } catch (error) {
      logger.warn("Error getting device info:", error.message);
      this.cacheStats.errors++;
      return this.getGlobalInfo();
    }
  }

  /**
   * OBTENER INFORMACIÓN GLOBAL
   * Información por defecto cuando no se encuentra marca específica
   */
  getGlobalInfo() {
    return {
      ...this.globalInfo,
      marca: "general",
      match_type: "global_fallback",
      modelos_disponibles: this.getTotalModelsCount(),
    };
  }

  /**
   * OBTENER INFORMACIÓN DE MARCA
   * Metadatos específicos de una marca
   */
  async getBrandInfo(brand) {
    try {
      await this.ensureCacheValid();

      const normalizedBrand = brand.toLowerCase();
      const metadata = this.metadataCache.get(normalizedBrand);

      if (metadata) {
        this.cacheStats.hits++;
        return {
          ...metadata,
          marca: normalizedBrand,
        };
      }

      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.warn(`Error getting brand info for ${brand}:`, error.message);
      this.cacheStats.errors++;
      return null;
    }
  }

  /**
   * LISTAR TODAS LAS MARCAS
   * Obtiene lista de marcas disponibles
   */
  async getAllBrands() {
    try {
      await this.ensureCacheValid();
      return Array.from(this.metadataCache.keys());
    } catch (error) {
      logger.warn("Error getting all brands:", error.message);
      return [];
    }
  }

  /**
   * OBTENER ESTADÍSTICAS GLOBALES
   * Información agregada de todos los archivos
   */
  async getGlobalStats() {
    try {
      await this.ensureCacheValid();

      const stats = {
        total_brands: this.metadataCache.size,
        total_models: this.getTotalModelsCount(),
        coverage_info: this.globalInfo,
        cache_stats: this.cacheStats,
        last_update: this.lastCacheUpdate,
        brands_available: Array.from(this.metadataCache.keys()),
      };

      return stats;
    } catch (error) {
      logger.warn("Error getting global stats:", error.message);
      return null;
    }
  }

  /**
   * BUSCAR EN METADATOS
   * Búsqueda de texto en metadatos
   */
  async searchInMetadata(query) {
    try {
      await this.ensureCacheValid();

      const results = [];
      const searchQuery = query.toLowerCase();

      for (const [brand, metadata] of this.metadataCache.entries()) {
        let relevanceScore = 0;

        // Buscar en marca
        if (brand.includes(searchQuery)) {
          relevanceScore += 1.0;
        }

        // Buscar en servicios
        if (metadata.servicios && metadata.servicios.includes(searchQuery)) {
          relevanceScore += 0.8;
        }

        // Buscar en archivo origen
        if (
          metadata.archivo_origen &&
          metadata.archivo_origen.toLowerCase().includes(searchQuery)
        ) {
          relevanceScore += 0.6;
        }

        if (relevanceScore > 0) {
          results.push({
            brand,
            metadata,
            relevance: relevanceScore,
          });
        }
      }

      // Ordenar por relevancia
      results.sort((a, b) => b.relevance - a.relevance);

      return results;
    } catch (error) {
      logger.warn("Error searching in metadata:", error.message);
      return [];
    }
  }

  /**
   * MÉTODOS AUXILIARES
   */
  async ensureCacheValid() {
    if (!this.config.enableCache) {
      return;
    }

    const now = Date.now();
    if (
      this.metadataCache.size === 0 ||
      now - this.lastCacheUpdate > this.config.cacheRefreshInterval
    ) {
      await this.refreshCache();
    }
  }

  getTotalModelsCount() {
    let total = 0;
    for (const metadata of this.metadataCache.values()) {
      if (metadata.modelos_disponibles) {
        total += metadata.modelos_disponibles;
      }
    }
    return total || 295; // Fallback al total conocido
  }

  /**
   * OBTENER ESTADÍSTICAS DEL CACHE
   */
  getCacheStats() {
    const hitRate =
      this.cacheStats.hits + this.cacheStats.misses > 0
        ? this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)
        : 0;

    return {
      ...this.cacheStats,
      hit_rate: hitRate,
      cache_size: this.metadataCache.size,
      last_update: this.lastCacheUpdate,
      cache_age_ms: Date.now() - this.lastCacheUpdate,
      status: this.metadataCache.size > 0 ? "active" : "empty",
    };
  }

  /**
   * FORZAR REFRESH DEL CACHE
   */
  async forceRefresh() {
    logger.info("🔄 Forzando refresh de cache de metadatos Markdown...");
    await this.refreshCache();
    return this.getCacheStats();
  }

  /**
   * LIMPIAR CACHE
   */
  clearCache() {
    this.metadataCache.clear();
    this.lastCacheUpdate = 0;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      refreshes: 0,
      errors: 0,
    };

    logger.info("🧹 Cache de metadatos Markdown limpiado");
  }

  /**
   * VERIFICAR SALUD DEL EXTRACTOR
   */
  async healthCheck() {
    try {
      const stats = await this.getGlobalStats();
      const cacheStats = this.getCacheStats();

      const health = {
        status: "healthy",
        issues: [],
        cache_operational: cacheStats.cache_size > 0,
        files_accessible: true,
        last_successful_refresh: this.lastCacheUpdate,
        brands_loaded: stats ? stats.total_brands : 0,
      };

      // Verificar problemas
      if (cacheStats.cache_size === 0) {
        health.status = "degraded";
        health.issues.push("Cache vacío - no se pudieron cargar metadatos");
      }

      if (
        cacheStats.hit_rate < 0.5 &&
        cacheStats.hits + cacheStats.misses > 10
      ) {
        health.status = "degraded";
        health.issues.push("Baja tasa de hit rate en cache");
      }

      if (cacheStats.errors > 5) {
        health.status = "degraded";
        health.issues.push("Múltiples errores detectados");
      }

      // Verificar acceso a directorio
      try {
        await fs.access(this.config.markdownDir);
      } catch (error) {
        health.status = "unhealthy";
        health.files_accessible = false;
        health.issues.push(
          "No se puede acceder al directorio de archivos Markdown",
        );
      }

      return health;
    } catch (error) {
      return {
        status: "unhealthy",
        issues: [`Error en health check: ${error.message}`],
        cache_operational: false,
        files_accessible: false,
      };
    }
  }
}

module.exports = {
  MarkdownMetadataExtractor,
};
