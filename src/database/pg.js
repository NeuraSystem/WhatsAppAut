const { Pool } = require('pg');
const config = require('../utils/config');

// Configuración de PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'whatsapp_reparaciones',
    user: process.env.DB_USER || 'bot_user',
    password: process.env.DB_PASSWORD || 'bot_secure_password_2024',
    max: 20, // máximo número de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Evento de error en el pool
pool.on('error', (err) => {
    console.error('Error en pool de PostgreSQL:', err);
});

/**
 * Inicializa la conexión a PostgreSQL
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa con PostgreSQL');
        
        // Verificar que las tablas existen
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'reparaciones'
        `);
        
        if (result.rows.length === 0) {
            console.log('⚠️  Tablas no encontradas. Ejecuta: docker-compose up -d postgres');
            throw new Error('Base de datos no inicializada');
        }
        
        // Verificar administradores iniciales
        const adminResult = await client.query('SELECT COUNT(*) FROM admin_users');
        console.log(`✅ Administradores configurados: ${adminResult.rows[0].count}`);
        
        client.release();
        console.log('✅ Base de datos PostgreSQL inicializada correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar PostgreSQL:', error.message);
        throw error;
    }
}

/**
 * Busca un cliente por su número de teléfono.
 * @param {string} phoneNumber - El número de teléfono con formato de WhatsApp.
 * @returns {Promise<Object|null>} El objeto del cliente o null si no se encuentra.
 */
async function getClientByNumber(phoneNumber) {
    try {
        const result = await pool.query(
            'SELECT * FROM clientes WHERE numero_telefono = $1',
            [phoneNumber]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error al buscar cliente:', error);
        throw error;
    }
}

/**
 * Registra un nuevo cliente o actualiza su información si ya existe.
 * @param {string} phoneNumber - El número de teléfono con formato de WhatsApp.
 * @param {string} [name=''] - El nombre del cliente.
 * @param {boolean} [yaSePresentoIA=false] - Si ya se presentó como IA.
 * @param {Object} [preferences={}] - Preferencias detectadas del cliente.
 * @returns {Promise<void>}
 */
async function addOrUpdateClient(phoneNumber, name = '', yaSePresentoIA = false, preferences = {}) {
    try {
        await pool.query(`
            INSERT INTO clientes (
                numero_telefono, nombre, ya_se_presento_ia, 
                ultima_interaccion, total_consultas, tono_preferido, horario_preferido
            ) 
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 1, $4, $5)
            ON CONFLICT (numero_telefono) DO UPDATE SET 
                nombre = CASE WHEN EXCLUDED.nombre != '' THEN EXCLUDED.nombre ELSE clientes.nombre END,
                ya_se_presento_ia = CASE WHEN EXCLUDED.ya_se_presento_ia = true THEN true ELSE clientes.ya_se_presento_ia END,
                total_consultas = clientes.total_consultas + 1,
                tono_preferido = COALESCE(EXCLUDED.tono_preferido, clientes.tono_preferido),
                horario_preferido = COALESCE(EXCLUDED.horario_preferido, clientes.horario_preferido),
                ultima_interaccion = CURRENT_TIMESTAMP
        `, [
            phoneNumber,
            name,
            yaSePresentoIA,
            preferences.tono || 'neutral',
            preferences.horario || 'mixto'
        ]);
    } catch (error) {
        console.error('Error al agregar/actualizar cliente:', error);
        throw error;
    }
}

/**
 * Agrega un nuevo texto de conocimiento a la base de datos.
 * @param {string} texto - El conocimiento a agregar.
 * @returns {Promise<void>}
 */
async function addConocimiento(texto) {
    try {
        await pool.query(
            'INSERT INTO conocimientos (texto) VALUES ($1)',
            [texto]
        );
    } catch (error) {
        console.error('Error al agregar conocimiento:', error);
        throw error;
    }
}

/**
 * Obtiene todos los conocimientos de la base de datos.
 * @returns {Promise<Array<string>>} Un array con todos los textos de conocimiento.
 */
async function getConocimientos() {
    try {
        const result = await pool.query(
            'SELECT texto FROM conocimientos ORDER BY id ASC'
        );
        return result.rows.map(row => row.texto);
    } catch (error) {
        console.error('Error al obtener conocimientos:', error);
        throw error;
    }
}

/**
 * Guarda una interacción en el historial detallado.
 * @param {Object} interaction - Datos de la interacción.
 * @returns {Promise<void>}
 */
async function saveInteractionHistory(interaction) {
    try {
        await pool.query(`
            INSERT INTO historial_interacciones 
            (numero_telefono, consulta_original, intencion_detectada, respuesta_enviada, 
             productos_mencionados, tono_detectado, hora_del_dia, satisfaccion_estimada)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            interaction.phoneNumber,
            interaction.originalQuery,
            interaction.detectedIntention,
            interaction.sentResponse,
            JSON.stringify(interaction.mentionedProducts || []),
            interaction.detectedTone || 'neutral',
            interaction.timeOfDay,
            interaction.estimatedSatisfaction || 5
        ]);
    } catch (error) {
        console.error('Error al guardar historial:', error);
        throw error;
    }
}

/**
 * Obtiene el historial reciente de un cliente.
 * @param {string} phoneNumber - El número de teléfono del cliente.
 * @param {number} [limit=5] - Límite de interacciones a obtener.
 * @returns {Promise<Array>} Historial de interacciones.
 */
async function getClientHistory(phoneNumber, limit = 5) {
    try {
        const result = await pool.query(`
            SELECT * FROM historial_interacciones 
            WHERE numero_telefono = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
        `, [phoneNumber, limit]);
        
        // Parsear JSON de productos mencionados
        const history = result.rows.map(row => ({
            ...row,
            productos_mencionados: (() => {
                try {
                    return row.productos_mencionados && row.productos_mencionados !== '' 
                        ? JSON.parse(row.productos_mencionados) 
                        : [];
                } catch (e) {
                    return [];
                }
            })()
        }));
        
        return history;
    } catch (error) {
        console.error('Error al obtener historial:', error);
        throw error;
    }
}

/**
 * Construye el contexto conversacional enriquecido para un cliente.
 * @param {string} phoneNumber - El número de teléfono del cliente.
 * @returns {Promise<Object>} El contexto conversacional enriquecido.
 */
async function buildConversationalContext(phoneNumber) {
    try {
        const clientRecord = await getClientByNumber(phoneNumber);
        const recentHistory = await getClientHistory(phoneNumber, 3);
        
        // Detectar patrones en el historial
        const patterns = analyzeClientPatterns(recentHistory, clientRecord);
        
        const contexto = {
            // Información básica
            esNuevo: !clientRecord,
            tieneNombre: clientRecord && clientRecord.nombre && clientRecord.nombre.trim() !== '',
            nombreCliente: clientRecord?.nombre || null,
            yaSePresentoIA: clientRecord?.ya_se_presento_ia === true,
            ultimaInteraccion: clientRecord?.ultima_interaccion || null,
            
            // Información de personalización
            tonoPreferido: clientRecord?.tono_preferido || 'neutral',
            horarioPreferido: clientRecord?.horario_preferido || 'mixto',
            totalConsultas: clientRecord?.total_consultas || 0,
            
            // Patrones detectados
            esClienteRecurrente: patterns.isRecurrent,
            productosAnterior: patterns.previousProducts,
            tonoDetectado: patterns.detectedTone,
            satisfaccionPromedio: patterns.averageSatisfaction,
            
            // Contexto temporal
            horaActual: new Date().getHours(),
            franjaTiempo: getTimeFrame(new Date().getHours()),
            
            // Historial reciente
            historialReciente: recentHistory
        };
        
        return contexto;
    } catch (error) {
        console.error('Error al construir contexto:', error);
        throw error;
    }
}

/**
 * Analiza patrones en el comportamiento del cliente.
 * @param {Array} history - Historial de interacciones.
 * @param {Object} clientRecord - Registro del cliente.
 * @returns {Object} Patrones detectados.
 */
function analyzeClientPatterns(history, clientRecord) {
    const patterns = {
        isRecurrent: history.length > 1,
        previousProducts: [],
        detectedTone: 'neutral',
        averageSatisfaction: 5
    };
    
    if (history.length > 0) {
        // Productos mencionados anteriormente
        patterns.previousProducts = history.reduce((products, interaction) => {
            return [...products, ...interaction.productos_mencionados];
        }, []);
        
        // Tono más común
        const tones = history.map(h => h.tono_detectado).filter(Boolean);
        if (tones.length > 0) {
            patterns.detectedTone = getMostCommon(tones);
        }
        
        // Satisfacción promedio
        const satisfactions = history.map(h => h.satisfaccion_estimada).filter(Boolean);
        if (satisfactions.length > 0) {
            patterns.averageSatisfaction = Math.round(
                satisfactions.reduce((sum, s) => sum + s, 0) / satisfactions.length
            );
        }
    }
    
    return patterns;
}

/**
 * Obtiene la franja de tiempo actual.
 * @param {number} hour - Hora actual (0-23).
 * @returns {string} Franja de tiempo.
 */
function getTimeFrame(hour) {
    if (hour >= 6 && hour < 12) return 'mañana';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noche';
}

/**
 * Obtiene el elemento más común en un array.
 * @param {Array} arr - Array de elementos.
 * @returns {*} Elemento más común.
 */
function getMostCommon(arr) {
    return arr.sort((a,b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
}

/**
 * Busca productos similares basándose en coincidencias parciales.
 * @param {string} model - El modelo buscado.
 * @param {string} type - El tipo de reparación.
 * @returns {Promise<Array>} Array de productos similares.
 */
async function findSimilarProducts(model, type) {
    try {
        // Limpiar y preparar términos de búsqueda
        const cleanModel = model.toLowerCase().trim();
        const cleanType = type.toLowerCase().trim();
        
        // Extraer marca y modelo
        const brands = ['samsung', 'iphone', 'xiaomi', 'huawei', 'motorola', 'lg', 'nokia'];
        let brand = '';
        let modelNumber = '';
        
        for (const b of brands) {
            if (cleanModel.includes(b)) {
                brand = b;
                break;
            }
        }
        
        // Extraer números/versiones del modelo
        const numberMatch = cleanModel.match(/\d+/);
        if (numberMatch) {
            modelNumber = numberMatch[0];
        }
        
        // Buscar productos similares con PostgreSQL
        const result = await pool.query(`
            SELECT *, 
                   CASE 
                       WHEN LOWER(modelo_celular) = $1 THEN 10
                       WHEN LOWER(modelo_celular) LIKE $2 THEN 8
                       WHEN LOWER(modelo_celular) LIKE $3 THEN 6
                       WHEN LOWER(modelo_celular) LIKE $4 THEN 4
                       ELSE 2
                   END as relevancia
            FROM reparaciones 
            WHERE (
                LOWER(modelo_celular) LIKE $5 OR
                LOWER(modelo_celular) LIKE $6 OR
                LOWER(modelo_celular) LIKE $7
            )
            AND LOWER(tipo_reparacion) LIKE $8
            ORDER BY relevancia DESC, precio ASC
            LIMIT 5
        `, [
            cleanModel, // exacto
            `%${cleanModel}%`, // contiene todo
            `%${brand}%`, // contiene marca
            `%${modelNumber}%`, // contiene número
            `%${brand}%`, // búsquedas LIKE
            `%${modelNumber}%`,
            `%${cleanModel}%`,
            `%${cleanType}%`
        ]);
        
        return result.rows || [];
    } catch (error) {
        console.error('Error en findSimilarProducts:', error);
        throw error;
    }
}

/**
 * Busca exactamente un producto o encuentra similares.
 * @param {string} model - El modelo del celular.
 * @param {string} type - El tipo de reparación.
 * @returns {Promise<Object>} Resultado con producto exacto y similares.
 */
async function searchProductSmart(model, type) {
    try {
        // Primero buscar exacto
        const exactResult = await pool.query(
            'SELECT * FROM reparaciones WHERE LOWER(modelo_celular) = LOWER($1) AND LOWER(tipo_reparacion) = LOWER($2)',
            [model, type]
        );
        
        if (exactResult.rows.length > 0) {
            return {
                exact: exactResult.rows[0],
                similar: [],
                found: true
            };
        }
        
        // Si no hay exacto, buscar similares
        const similar = await findSimilarProducts(model, type);
        
        return {
            exact: null,
            similar: similar,
            found: similar.length > 0
        };
        
    } catch (error) {
        console.error('Error en searchProductSmart:', error);
        throw error;
    }
}

/**
 * Cierra el pool de conexiones
 */
async function closeDatabase() {
    try {
        await pool.end();
        console.log('Pool de PostgreSQL cerrado');
    } catch (error) {
        console.error('Error al cerrar pool:', error);
    }
}

module.exports = {
    pool,
    initializeDatabase,
    getClientByNumber,
    addOrUpdateClient,
    addConocimiento,
    getConocimientos,
    buildConversationalContext,
    findSimilarProducts,
    searchProductSmart,
    saveInteractionHistory,
    getClientHistory,
    analyzeClientPatterns,
    closeDatabase
};