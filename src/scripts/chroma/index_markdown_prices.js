#!/usr/bin/env node

// src/scripts/index_markdown_prices.js
// Script para indexar archivos Markdown de precios en ChromaDB

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');
const { embeddingEngine } = require('../../services/embeddingEngine');
const logger = require('../../utils/logger');

const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const KNOWLEDGE_COLLECTION_NAME = 'conocimiento_general';
const PRICES_MARKDOWN_DIR = path.join(
    __dirname,
    '../../data/processed_for_ai/precios_markdown'
);

const chromaClient = new ChromaClient({ path: CHROMA_URL });

/**
 * Procesa un archivo Markdown de precios y extrae chunks de información
 * @param {string} filePath - Ruta del archivo Markdown
 * @returns {Array<Object>} Array de chunks con metadata
 */
function processMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.md');
    const brand = fileName.replace('_precios', '');

    const chunks = [];

    // Dividir el contenido en secciones
    const sections = content.split('## ');

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;

        let sectionTitle, sectionContent;

        if (i === 0) {
            // Primera sección (título y información general)
            const lines = section.split('\n');
            sectionTitle = lines[0].replace('# ', '');
            sectionContent = section;
        } else {
            // Otras secciones
            const lines = section.split('\n');
            sectionTitle = lines[0];
            sectionContent = '## ' + section;
        }

        // Crear chunk según el tipo de sección
        const chunkId = `${brand}_${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${i}`;

        let chunkType = 'general';
        let keywords = [brand.toLowerCase()];

        if (sectionTitle.includes('Información General')) {
            chunkType = 'info_general';
            keywords.push(
                'garantía',
                'moneda',
                'tiempo',
                'domicilio',
                'establecimiento'
            );
        } else if (sectionTitle.includes('Tabla de Precios')) {
            chunkType = 'precios_tabla';
            keywords.push('precios', 'pantalla', 'original', 'genérica', 'servicio');

            // Extraer modelos de la tabla
            const tableMatches = sectionContent.match(/\| ([^|]+) \| Pantalla/g);
            if (tableMatches) {
                tableMatches.forEach((match) => {
                    const modelo = match.split('|')[1].trim();
                    keywords.push(modelo.toLowerCase());
                });
            }
        } else if (sectionTitle.includes('Metadatos')) {
            chunkType = 'metadatos';
            keywords.push('marca', 'modelos', 'servicios');
        }

        chunks.push({
            id: chunkId,
            content: sectionContent,
            metadata: {
                source: 'markdown_prices',
                brand: brand,
                section: sectionTitle,
                chunk_type: chunkType,
                file_path: filePath,
                keywords: keywords.join(', '),
                indexed_at: new Date().toISOString(),
                content_length: sectionContent.length
            }
        });
    }

    return chunks;
}

/**
 * Función principal para indexar todos los archivos Markdown
 */
async function indexMarkdownPrices() {
    try {
        logger.info('🔄 Iniciando indexación de archivos Markdown de precios...');

        // Verificar que embeddingEngine esté disponible
        if (!embeddingEngine) {
            throw new Error('El motor de embeddings no está disponible');
        }

        // Verificar directorio de archivos Markdown
        if (!fs.existsSync(PRICES_MARKDOWN_DIR)) {
            throw new Error(`Directorio no encontrado: ${PRICES_MARKDOWN_DIR}`);
        }

        // Obtener lista de archivos Markdown
        const markdownFiles = fs
            .readdirSync(PRICES_MARKDOWN_DIR)
            .filter((file) => file.endsWith('.md'))
            .map((file) => path.join(PRICES_MARKDOWN_DIR, file));

        if (markdownFiles.length === 0) {
            logger.warn('No se encontraron archivos Markdown en el directorio');
            return;
        }

        logger.info(`📂 Encontrados ${markdownFiles.length} archivos Markdown`);

        // Obtener o crear colección
        let collection;
        try {
            collection = await chromaClient.getCollection({
                name: KNOWLEDGE_COLLECTION_NAME
            });
            logger.info(
                `📚 Usando colección existente: ${KNOWLEDGE_COLLECTION_NAME}`
            );
        } catch (error) {
            logger.info(`📚 Creando nueva colección: ${KNOWLEDGE_COLLECTION_NAME}`);
            collection = await chromaClient.createCollection({
                name: KNOWLEDGE_COLLECTION_NAME,
                metadata: {
                    description:
            'Conocimiento general incluyendo precios de reparaciones'
                }
            });
        }

        // Procesar cada archivo
        let totalChunks = 0;
        let processedBrands = [];

        for (const filePath of markdownFiles) {
            try {
                logger.info(`📄 Procesando: ${path.basename(filePath)}`);

                const chunks = processMarkdownFile(filePath);
                logger.info(`   ├─ Chunks extraídos: ${chunks.length}`);

                if (chunks.length === 0) {
                    logger.warn(`   └─ ⚠️  No se extrajeron chunks del archivo`);
                    continue;
                }

                // Generar embeddings para cada chunk usando el Enhanced Engine
                const documents = chunks.map((chunk) => chunk.content);
                const embeddings = await embeddingEngine.embedDocuments(documents);

                // Preparar datos para ChromaDB
                const ids = chunks.map((chunk) => chunk.id);
                const metadatas = chunks.map((chunk) => chunk.metadata);

                // Agregar a la colección
                await collection.add({
                    ids: ids,
                    embeddings: embeddings,
                    documents: documents,
                    metadatas: metadatas
                });

                totalChunks += chunks.length;
                processedBrands.push(chunks[0].metadata.brand);

                logger.info(`   └─ ✅ Indexado exitosamente`);
            } catch (error) {
                logger.error(
                    `   └─ ❌ Error procesando ${path.basename(filePath)}:`,
                    error.message
                );
            }
        }

        // Resumen final
        logger.info('🎉 Indexación completada');
        logger.info(`   📊 Total de chunks indexados: ${totalChunks}`);
        logger.info(`   🏷️  Marcas procesadas: ${processedBrands.join(', ')}`);
        logger.info(
            `   🔍 Prefijos de tarea habilitados: ${process.env.ENABLE_TASK_PREFIXES === 'true'}`
        );

        // Verificar indexación
        const collectionInfo = await collection.count();
        logger.info(`   📈 Total de documentos en colección: ${collectionInfo}`);
    } catch (error) {
        logger.error('❌ Error durante la indexación:', error);
        throw error;
    }
}

/**
 * Función para limpiar chunks de precios existentes
 */
async function cleanExistingPriceChunks() {
    try {
        logger.info('🧹 Limpiando chunks de precios existentes...');

        const collection = await chromaClient.getCollection({
            name: KNOWLEDGE_COLLECTION_NAME
        });

        // Buscar chunks con source = 'markdown_prices'
        const results = await collection.get({
            where: { source: 'markdown_prices' }
        });

        if (results.ids && results.ids.length > 0) {
            await collection.delete({
                ids: results.ids
            });
            logger.info(
                `   └─ Eliminados ${results.ids.length} chunks de precios existentes`
            );
        } else {
            logger.info('   └─ No se encontraron chunks de precios previos');
        }
    } catch (error) {
        logger.warn('⚠️  Error al limpiar chunks existentes:', error.message);
    // No es crítico, continuar con la indexación
    }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const cleanFirst = args.includes('--clean');

    (async () => {
        try {
            if (cleanFirst) {
                await cleanExistingPriceChunks();
            }
            await indexMarkdownPrices();
            logger.info('✅ Script completado exitosamente');
            process.exit(0);
        } catch (error) {
            logger.error('💥 Script falló:', error);
            process.exit(1);
        }
    })();
}

module.exports = {
    indexMarkdownPrices,
    cleanExistingPriceChunks,
    processMarkdownFile
};
