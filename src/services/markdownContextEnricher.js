#!/usr/bin/env node

// src/services/markdownContextEnricher.js
// ENRIQUECEDOR DE CONTEXTO MARKDOWN - INTEGRACIÓN SOLUCIÓN 5
// Sistema para integrar información actualizada de archivos Markdown

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * MARKDOWN CONTEXT ENRICHER
 * Integra información actualizada de archivos Markdown con sistema de búsqueda
 * 
 * Funcionalidades:
 * - Carga automática de metadatos Markdown actualizados
 * - Enriquecimiento de resultados con información temporal
 * - Integración con sistema de garantías y precios
 * - Cache inteligente de información Markdown
 * - Detección de cambios y actualización automática
 */
class MarkdownContextEnricher {
    constructor(options = {}) {
        this.config = {
            markdownPath: options.markdownPath || path.join(process.cwd(), 'data', 'processed_for_ai', 'precios_markdown'),
            cacheTimeout: options.cacheTimeout || 3600000, // 1 hora
            autoRefresh: options.autoRefresh !== false,
            
            // Información estándar SalvaCell
            standardInfo: {
                lastUpdate: '2025-07-10',
                currency: 'Pesos Mexicanos (MXN)',
                warrantyOriginal: '30 días',
                warrantyGeneric: '15 días',
                establishmentNote: 'Mismo día (antes 4PM) / Siguiente día (después 4PM)',
                homeServiceNote: '45-60 minutos una vez iniciado',
                averageTime: '52 minutos',
                businessHours: {
                    weekdays: '11:00 AM - 9:00 PM',
                    sunday: '12:00 PM - 5:00 PM'
                }
            },

            ...options
        };

        // Cache de información Markdown
        this.cache = {
            brandInfo: new Map(),
            globalMetadata: null,
            lastRefresh: 0,
            fileHashes: new Map()
        };

        // Patrones de enriquecimiento
        this.enrichmentPatterns = {
            timeRelated: ['tiempo', 'minutos', 'horas', 'cuando', 'cuánto', 'demora', 'tarda'],
            warrantyRelated: ['garantía', 'garantia', 'cobertura', 'respaldo', 'original', 'genérica'],
            serviceRelated: ['servicio', 'reparación', 'arreglo', 'cambio', 'establecimiento', 'domicilio'],
            priceRelated: ['precio', 'costo', 'cuánto', 'vale', 'cobran', '$', 'pesos'],
            scheduleRelated: ['horario', 'abierto', 'cerrado', 'atienden', 'hora', 'día']
        };

        logger.info('📄 MarkdownContextEnricher inicializado:', {
            markdownPath: this.config.markdownPath,
            autoRefresh: this.config.autoRefresh,
            cacheTimeout: this.config.cacheTimeout
        });

        // Inicializar cache
        this.initializeCache();
    }

    /**
     * INICIALIZAR CACHE
     * Carga inicial de información Markdown
     */
    async initializeCache() {
        try {
            await this.refreshMarkdownCache();
            
            if (this.config.autoRefresh) {
                // Configurar refresh automático cada hora
                setInterval(() => {
                    this.refreshMarkdownCache();
                }, this.config.cacheTimeout);
            }
            
        } catch (error) {
            logger.warn('⚠️ Error inicializando cache Markdown:', error.message);
        }
    }

    /**
     * REFRESCAR CACHE MARKDOWN
     * Recarga información de archivos Markdown
     */
    async refreshMarkdownCache() {
        try {
            const startTime = Date.now();
            logger.debug('🔄 Refrescando cache Markdown...');

            // Verificar si el directorio existe
            try {
                await fs.access(this.config.markdownPath);
            } catch (error) {
                logger.warn(`📁 Directorio Markdown no encontrado: ${this.config.markdownPath}`);
                return;
            }

            // Leer archivos Markdown
            const files = await fs.readdir(this.config.markdownPath);
            const markdownFiles = files.filter(file => file.endsWith('.md'));

            let updatedCount = 0;

            for (const file of markdownFiles) {
                const filePath = path.join(this.config.markdownPath, file);
                const brand = this.extractBrandFromFilename(file);
                
                try {
                    // Verificar si el archivo cambió
                    const stats = await fs.stat(filePath);
                    const currentHash = `${stats.mtime.getTime()}-${stats.size}`;
                    
                    if (this.cache.fileHashes.get(file) !== currentHash) {
                        const content = await fs.readFile(filePath, 'utf8');
                        const brandInfo = this.parseMarkdownContent(content, brand);
                        
                        this.cache.brandInfo.set(brand.toLowerCase(), brandInfo);
                        this.cache.fileHashes.set(file, currentHash);
                        updatedCount++;
                    }
                    
                } catch (error) {
                    logger.warn(`⚠️ Error procesando ${file}:`, error.message);
                }
            }

            // Actualizar metadata global
            this.cache.globalMetadata = this.buildGlobalMetadata();
            this.cache.lastRefresh = Date.now();

            const duration = Date.now() - startTime;
            logger.info(`✅ Cache Markdown actualizado: ${updatedCount} archivos procesados en ${duration}ms`);

        } catch (error) {
            logger.error('❌ Error refrescando cache Markdown:', error);
        }
    }

    /**
     * EXTRAER MARCA DE NOMBRE DE ARCHIVO
     */
    extractBrandFromFilename(filename) {
        const baseName = path.basename(filename, '.md');
        const brandName = baseName.replace('_precios', '').replace(/[_-]/g, ' ');
        
        // Capitalizar primera letra
        return brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
    }

    /**
     * PARSEAR CONTENIDO MARKDOWN
     * Extrae metadatos e información relevante
     */
    parseMarkdownContent(content, brand) {
        const brandInfo = {
            brand,
            lastUpdate: this.config.standardInfo.lastUpdate,
            currency: this.config.standardInfo.currency,
            warranty: {
                original: this.config.standardInfo.warrantyOriginal,
                generic: this.config.standardInfo.warrantyGeneric
            },
            serviceInfo: {
                establishment: this.config.standardInfo.establishmentNote,
                homeService: this.config.standardInfo.homeServiceNote,
                averageTime: this.config.standardInfo.averageTime
            },
            businessHours: this.config.standardInfo.businessHours,
            models: [],
            priceRanges: this.extractPriceRanges(content),
            serviceTypes: this.extractServiceTypes(content),
            metadata: this.extractMetadata(content)
        };

        // Extraer modelos y precios de las tablas
        const tableMatches = content.match(/\|.*\|/g);
        if (tableMatches) {
            brandInfo.models = this.parseTableModels(tableMatches, brand);
        }

        return brandInfo;
    }

    /**
     * EXTRAER RANGOS DE PRECIOS
     */
    extractPriceRanges(content) {
        const pricePattern = /\d+\.?\d*/g;
        const prices = [...content.matchAll(pricePattern)]
            .map(match => parseFloat(match[0]))
            .filter(price => price > 100 && price < 10000); // Filtrar precios válidos

        if (prices.length === 0) return null;

        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            count: prices.length
        };
    }

    /**
     * EXTRAER TIPOS DE SERVICIO
     */
    extractServiceTypes(content) {
        const serviceTypes = new Set();
        const commonServices = ['pantalla', 'batería', 'cámara', 'puerto', 'sensor', 'altavoz', 'micrófono'];
        
        const lowerContent = content.toLowerCase();
        commonServices.forEach(service => {
            if (lowerContent.includes(service)) {
                serviceTypes.add(service);
            }
        });

        return Array.from(serviceTypes);
    }

    /**
     * EXTRAER METADATA YAML
     */
    extractMetadata(content) {
        const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
        if (!yamlMatch) return {};

        try {
            // Parser YAML simple para metadata básica
            const yamlContent = yamlMatch[1];
            const metadata = {};
            
            const lines = yamlContent.split('\n');
            lines.forEach(line => {
                const match = line.match(/^\s*([^:]+):\s*(.+)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim();
                    
                    // Convertir arrays simples
                    if (value.startsWith('[') && value.endsWith(']')) {
                        metadata[key] = value.slice(1, -1).split(',').map(s => s.trim());
                    } else {
                        metadata[key] = value;
                    }
                }
            });

            return metadata;
        } catch (error) {
            logger.warn('⚠️ Error parseando metadata YAML:', error.message);
            return {};
        }
    }

    /**
     * PARSEAR MODELOS DE TABLA
     */
    parseTableModels(tableRows, brand) {
        const models = [];
        
        // Saltar encabezados (primeras 2 filas generalmente)
        for (let i = 2; i < tableRows.length; i++) {
            const row = tableRows[i];
            const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
            
            if (cells.length >= 4) {
                const model = {
                    name: cells[0] || '',
                    service: cells[1] || 'Pantalla',
                    priceOriginal: this.parsePrice(cells[2]),
                    priceGeneric: this.parsePrice(cells[3]),
                    brand,
                    availability: 'available'
                };

                if (model.name && (model.priceOriginal || model.priceGeneric)) {
                    models.push(model);
                }
            }
        }

        return models;
    }

    /**
     * PARSEAR PRECIO DE TEXTO
     */
    parsePrice(priceText) {
        if (!priceText || priceText === 'N/A') return null;
        
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));
        return isNaN(price) ? null : price;
    }

    /**
     * CONSTRUIR METADATA GLOBAL
     */
    buildGlobalMetadata() {
        const allBrands = Array.from(this.cache.brandInfo.keys());
        const allModels = Array.from(this.cache.brandInfo.values())
            .flatMap(brandInfo => brandInfo.models);

        const allPrices = allModels
            .flatMap(model => [model.priceOriginal, model.priceGeneric])
            .filter(price => price !== null);

        return {
            totalBrands: allBrands.length,
            totalModels: allModels.length,
            priceRange: allPrices.length > 0 ? {
                min: Math.min(...allPrices),
                max: Math.max(...allPrices),
                average: Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
            } : null,
            brands: allBrands,
            lastUpdate: this.config.standardInfo.lastUpdate,
            cacheStats: {
                lastRefresh: this.cache.lastRefresh,
                fileCount: this.cache.fileHashes.size
            }
        };
    }

    /**
     * ENRIQUECER RESULTADOS DE BÚSQUEDA
     * Agrega información Markdown relevante a los resultados
     */
    enrichSearchResults(results, query, context = 'general') {
        if (!results || !results.metadatas || !results.metadatas[0]) {
            return results;
        }

        try {
            const enrichmentType = this.detectEnrichmentType(query);
            const relevantBrands = this.extractBrandsFromQuery(query);

            // Enriquecer cada resultado
            results.metadatas[0].forEach((metadata, index) => {
                metadata.markdown_enrichment = this.buildEnrichmentForResult(
                    metadata,
                    enrichmentType,
                    relevantBrands,
                    context
                );
            });

            // Agregar metadata global
            results.globalMarkdownInfo = this.getRelevantGlobalInfo(enrichmentType, relevantBrands);

            logger.debug(`📄 Resultados enriquecidos con contexto Markdown: ${enrichmentType.join(', ')}`);

        } catch (error) {
            logger.warn('⚠️ Error enriqueciendo resultados con Markdown:', error.message);
        }

        return results;
    }

    /**
     * DETECTAR TIPO DE ENRIQUECIMIENTO
     */
    detectEnrichmentType(query) {
        const lowerQuery = query.toLowerCase();
        const enrichmentTypes = [];

        Object.entries(this.enrichmentPatterns).forEach(([type, patterns]) => {
            if (patterns.some(pattern => lowerQuery.includes(pattern))) {
                enrichmentTypes.push(type.replace('Related', ''));
            }
        });

        return enrichmentTypes.length > 0 ? enrichmentTypes : ['general'];
    }

    /**
     * EXTRAER MARCAS DE CONSULTA
     */
    extractBrandsFromQuery(query) {
        const lowerQuery = query.toLowerCase();
        const brands = [];

        this.cache.brandInfo.forEach((brandInfo, brandKey) => {
            if (lowerQuery.includes(brandKey) || lowerQuery.includes(brandInfo.brand.toLowerCase())) {
                brands.push(brandKey);
            }
        });

        return brands;
    }

    /**
     * CONSTRUIR ENRIQUECIMIENTO PARA RESULTADO
     */
    buildEnrichmentForResult(metadata, enrichmentTypes, relevantBrands, context) {
        const enrichment = {
            context,
            enrichmentTypes,
            timestamp: Date.now(),
            source: 'markdown_context_enricher'
        };

        // Información estándar siempre incluida
        enrichment.standardInfo = {
            currency: this.config.standardInfo.currency,
            lastUpdate: this.config.standardInfo.lastUpdate,
            businessHours: this.config.standardInfo.businessHours
        };

        // Enriquecimiento específico por tipo
        enrichmentTypes.forEach(type => {
            switch (type) {
                case 'time':
                    enrichment.timeInfo = {
                        establishment: this.config.standardInfo.establishmentNote,
                        homeService: this.config.standardInfo.homeServiceNote,
                        averageTime: this.config.standardInfo.averageTime,
                        note: 'Tiempos pueden variar según complejidad'
                    };
                    break;

                case 'warranty':
                    enrichment.warrantyInfo = {
                        original: this.config.standardInfo.warrantyOriginal,
                        generic: this.config.standardInfo.warrantyGeneric,
                        coverage: 'Defectos de fabricación e instalación',
                        exclusions: 'Mal uso, caídas, líquidos'
                    };
                    break;

                case 'service':
                    enrichment.serviceInfo = {
                        establishment: this.config.standardInfo.establishmentNote,
                        homeService: this.config.standardInfo.homeServiceNote,
                        averageTime: this.config.standardInfo.averageTime,
                        businessHours: this.config.standardInfo.businessHours
                    };
                    break;

                case 'price':
                    enrichment.priceInfo = {
                        currency: this.config.standardInfo.currency,
                        priceValidity: 'Sujeto a disponibilidad',
                        lastUpdate: this.config.standardInfo.lastUpdate,
                        note: 'Precios pueden variar sin previo aviso'
                    };
                    break;

                case 'schedule':
                    enrichment.scheduleInfo = {
                        weekdays: this.config.standardInfo.businessHours.weekdays,
                        sunday: this.config.standardInfo.businessHours.sunday,
                        virtualSupport: '24/7 con asistente Sofia',
                        note: 'Horarios pueden variar en días festivos'
                    };
                    break;
            }
        });

        // Información específica de marca si aplica
        if (relevantBrands.length > 0) {
            enrichment.brandSpecificInfo = {};
            
            relevantBrands.forEach(brand => {
                const brandInfo = this.cache.brandInfo.get(brand);
                if (brandInfo) {
                    enrichment.brandSpecificInfo[brand] = {
                        totalModels: brandInfo.models.length,
                        priceRange: brandInfo.priceRanges,
                        serviceTypes: brandInfo.serviceTypes,
                        availability: 'available'
                    };
                }
            });
        }

        return enrichment;
    }

    /**
     * OBTENER INFORMACIÓN GLOBAL RELEVANTE
     */
    getRelevantGlobalInfo(enrichmentTypes, relevantBrands) {
        const globalInfo = {
            catalog: {
                totalBrands: this.cache.globalMetadata?.totalBrands || 0,
                totalModels: this.cache.globalMetadata?.totalModels || 0,
                priceRange: this.cache.globalMetadata?.priceRange
            },
            standardInfo: this.config.standardInfo,
            lastUpdate: this.cache.lastRefresh
        };

        // Agregar información específica de marcas si se requiere
        if (relevantBrands.length > 0) {
            globalInfo.brandInfo = {};
            relevantBrands.forEach(brand => {
                const brandInfo = this.cache.brandInfo.get(brand);
                if (brandInfo) {
                    globalInfo.brandInfo[brand] = {
                        modelsCount: brandInfo.models.length,
                        priceRange: brandInfo.priceRanges,
                        serviceTypes: brandInfo.serviceTypes
                    };
                }
            });
        }

        return globalInfo;
    }

    /**
     * MÉTODOS PÚBLICOS DE CONSULTA
     */
    getBrandInfo(brand) {
        return this.cache.brandInfo.get(brand.toLowerCase()) || null;
    }

    getGlobalMetadata() {
        return this.cache.globalMetadata;
    }

    getStandardInfo() {
        return this.config.standardInfo;
    }

    getCacheStats() {
        return {
            lastRefresh: this.cache.lastRefresh,
            brandCount: this.cache.brandInfo.size,
            fileCount: this.cache.fileHashes.size,
            cacheAge: Date.now() - this.cache.lastRefresh,
            autoRefresh: this.config.autoRefresh
        };
    }

    /**
     * FORZAR ACTUALIZACIÓN
     */
    async forceRefresh() {
        logger.info('🔄 Forzando actualización de cache Markdown...');
        await this.refreshMarkdownCache();
    }
}

module.exports = {
    MarkdownContextEnricher
};