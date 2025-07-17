// src/scripts/migrateConversations.js
// MIGRACIÓN DE CONVERSACIONES EXISTENTES AL SISTEMA HÍBRIDO

require('dotenv').config();
const { pool } = require('../database/pg');
const { conversationMemory } = require('../services/conversationMemory');
const logger = require('../utils/logger');

/**
 * MIGRADOR DE CONVERSACIONES AL SISTEMA HÍBRIDO
 * Convierte historial existente en chunks vectorizados con metadatos ricos
 */
class ConversationMigrator {
    constructor() {
        this.processedCount = 0;
        this.errorCount = 0;
        this.skippedCount = 0;
    }

    /**
     * Migra todas las conversaciones existentes
     */
    async migrateAllConversations() {
        console.log('🔄 INICIANDO MIGRACIÓN DE CONVERSACIONES AL SISTEMA HÍBRIDO');
        console.log('================================================================\n');

        try {
            // 1. Inicializar sistema de memoria conversacional
            const initialized = await conversationMemory.initialize();
            if (!initialized) {
                throw new Error("No se pudo inicializar el sistema de memoria conversacional");
            }

            // 2. Obtener conversaciones existentes
            const conversations = await this.fetchExistingConversations();
            console.log(`📊 Conversaciones encontradas: ${conversations.length}\n`);

            if (conversations.length === 0) {
                console.log('ℹ️ No hay conversaciones existentes para migrar.');
                return;
            }

            // 3. Procesar cada conversación
            for (const conversation of conversations) {
                await this.processConversation(conversation);
            }

            // 4. Mostrar resumen
            this.printMigrationSummary();

        } catch (error) {
            console.error('❌ Error en migración:', error);
            logger.error('Error en migración de conversaciones:', error);
        } finally {
            await pool.end();
        }
    }

    /**
     * Obtiene conversaciones existentes de PostgreSQL
     */
    async fetchExistingConversations() {
        try {
            const result = await pool.query(`
                SELECT 
                    id,
                    numero_telefono,
                    consulta_original,
                    intencion_detectada,
                    respuesta_enviada,
                    productos_mencionados,
                    tono_detectado,
                    hora_del_dia,
                    satisfaccion_estimada,
                    timestamp,
                    chunk_id
                FROM historial_interacciones 
                WHERE consulta_original IS NOT NULL 
                AND respuesta_enviada IS NOT NULL
                AND (chunk_id IS NULL OR chunk_id = '')
                ORDER BY timestamp DESC
                LIMIT 1000
            `);

            return result.rows;
        } catch (error) {
            logger.error('Error obteniendo conversaciones existentes:', error);
            return [];
        }
    }

    /**
     * Procesa una conversación individual
     */
    async processConversation(conversation) {
        try {
            console.log(`🔄 Procesando conversación ${conversation.id}...`);

            // Extraer datos de la conversación
            const extractedData = this.extractConversationData(conversation);

            // Almacenar como chunk en memoria conversacional
            const success = await conversationMemory.storeConversationChunk(
                conversation.numero_telefono,
                conversation.consulta_original,
                conversation.respuesta_enviada,
                conversation.intencion_detectada || 'otro',
                extractedData
            );

            if (success) {
                // Actualizar registro en PostgreSQL con chunk_id
                const chunkId = `conv_${conversation.numero_telefono}_${Date.now()}`;
                await this.updateConversationWithChunkId(conversation.id, chunkId);
                
                this.processedCount++;
                console.log(`   ✅ Migrada exitosamente (ID: ${conversation.id})`);
            } else {
                this.errorCount++;
                console.log(`   ❌ Error en migración (ID: ${conversation.id})`);
            }

        } catch (error) {
            this.errorCount++;
            console.log(`   ❌ Error procesando conversación ${conversation.id}:`, error.message);
            logger.error(`Error procesando conversación ${conversation.id}:`, error);
        }
    }

    /**
     * Extrae y normaliza datos de la conversación
     */
    extractConversationData(conversation) {
        const extractedData = {
            stage: 'migrated',
            satisfaction: conversation.satisfaccion_estimada || 5
        };

        // Extraer dispositivo mencionado
        if (conversation.productos_mencionados) {
            try {
                const productos = JSON.parse(conversation.productos_mencionados);
                if (productos.device) {
                    extractedData.device = productos.device;
                }
                if (productos.service) {
                    extractedData.service = productos.service;
                }
                if (productos.price) {
                    extractedData.price = productos.price;
                }
            } catch (e) {
                // Si no es JSON válido, tratar como string
                extractedData.device = conversation.productos_mencionados;
            }
        }

        // Extraer precio de la respuesta
        const priceMatch = conversation.respuesta_enviada.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (priceMatch) {
            extractedData.price = priceMatch[1].replace(/,/g, '');
        }

        // Detectar servicio mencionado
        const servicePatterns = [
            { pattern: /bater[ií]a|battery/i, service: 'bateria' },
            { pattern: /pantalla|display|screen/i, service: 'pantalla' },
            { pattern: /c[aá]mara|camera/i, service: 'camara' },
            { pattern: /carga|charging|puerto/i, service: 'puerto_carga' },
            { pattern: /altavoz|speaker/i, service: 'altavoz' }
        ];

        for (const { pattern, service } of servicePatterns) {
            if (pattern.test(conversation.consulta_original) || pattern.test(conversation.respuesta_enviada)) {
                extractedData.service = service;
                break;
            }
        }

        // Extraer nombre de usuario
        const nameMatch = conversation.consulta_original.match(/(?:soy|me llamo|mi nombre es|con)\s+([A-Z][a-z]+)/i);
        if (nameMatch) {
            extractedData.userName = nameMatch[1];
        }

        return extractedData;
    }

    /**
     * Actualiza conversación con chunk_id
     */
    async updateConversationWithChunkId(conversationId, chunkId) {
        try {
            await pool.query(`
                UPDATE historial_interacciones 
                SET chunk_id = $1 
                WHERE id = $2
            `, [chunkId, conversationId]);
        } catch (error) {
            logger.warn(`Error actualizando chunk_id para conversación ${conversationId}:`, error);
        }
    }

    /**
     * Muestra resumen de la migración
     */
    printMigrationSummary() {
        console.log('\n📊 RESUMEN DE MIGRACIÓN');
        console.log('========================');
        console.log(`✅ Conversaciones migradas: ${this.processedCount}`);
        console.log(`❌ Errores: ${this.errorCount}`);
        console.log(`⏭️ Omitidas: ${this.skippedCount}`);
        console.log(`🎯 Total procesadas: ${this.processedCount + this.errorCount + this.skippedCount}`);
        
        if (this.processedCount > 0) {
            console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!');
            console.log('✨ Beneficios del nuevo sistema:');
            console.log('   • Sofia ahora puede recordar conversaciones pasadas');
            console.log('   • Búsqueda semántica de historial por significado');
            console.log('   • Personalización basada en interacciones previas');
            console.log('   • Metadatos ricos para filtrado inteligente');
            console.log('\n💡 Próximos pasos:');
            console.log('   1. Probar el bot con el nuevo sistema');
            console.log('   2. Verificar que Sofia use la memoria conversacional');
            console.log('   3. Monitorear rendimiento de búsquedas semánticas');
        } else {
            console.log('\n⚠️ No se migraron conversaciones nuevas');
            console.log('   • Posiblemente ya estaban migradas');
            console.log('   • O no hay historial de conversaciones');
        }

        console.log('\n🔍 Para verificar la migración:');
        console.log('   node src/scripts/verifyMigration.js');
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    const migrator = new ConversationMigrator();
    migrator.migrateAllConversations()
        .then(() => {
            console.log('\n✅ Script de migración finalizado');
        })
        .catch(error => {
            console.error('\n❌ Error en migración:', error);
        });
}

module.exports = ConversationMigrator;