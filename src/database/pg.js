const { Pool } = require('pg');
const logger = require('../utils/logger');

// Configuración de PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'whatsapp_reparaciones',
    user: process.env.DB_USER || 'Salvador',
    password: process.env.DB_PASSWORD || 'KKrauser969271',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    logger.error('Error en pool de PostgreSQL:', { error: err.message });
});

async function initializeDatabase() {
    try {
        logger.info('Conectando a PostgreSQL...');

        const client = await pool.connect();
        logger.info('✅ Conexión a PostgreSQL establecida.');

        // Inspeccionar y normalizar esquema antes de crear tablas
        await inspectAndNormalizeSchema(client);
        
        // Crear tablas básicas con esquema normalizado
        await createBasicTablesWithInspection(client);
        
        // Verificar que las tablas existen
        await verifyTables(client);
        
        client.release();
        logger.info('✅ Base de datos PostgreSQL inicializada y lista.');
        
    } catch (error) {
        logger.error('❌ Error al inicializar PostgreSQL:', { error: error.message, stack: error.stack });
        logger.warn('⚠️ Continuando sin base de datos PostgreSQL...');
    }
}

async function inspectAndNormalizeSchema(client) {
    try {
        logger.info('🔍 Inspeccionando esquema existente...');
        
        // Verificar si admin_users existe
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'admin_users'
            )
        `);
        
        if (tableExists.rows[0].exists) {
            // Obtener columnas actuales
            const columnsResult = await client.query(`
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'admin_users' AND table_schema = 'public'
                ORDER BY ordinal_position
            `);
            
            const columns = columnsResult.rows.map(row => row.column_name);
            logger.info('📊 Columnas existentes en admin_users:', { columns });
            
            // Normalizar nomenclatura si es necesario
            await normalizeAdminUsersColumns(client, columns);
        } else {
            logger.info('📝 Tabla admin_users no existe, se creará con esquema correcto');
        }
        
    } catch (error) {
        logger.error('❌ Error inspeccionando esquema:', { error: error.message });
        throw error;
    }
}

async function normalizeAdminUsersColumns(client, existingColumns) {
    try {
        // Mapeo de posibles nombres de columnas
        const columnMapping = {
            'phone_number': ['numero_telefono', 'telefono', 'phone', 'mobile', 'celular'],
            'name': ['nombre', 'full_name', 'username'],
            'is_active': ['activo', 'active', 'enabled', 'habilitado'],
            'created_at': ['fecha_creacion', 'created', 'timestamp']
        };
        
        for (const [standardName, alternatives] of Object.entries(columnMapping)) {
            if (!existingColumns.includes(standardName)) {
                // Buscar alternativa existente
                const existingAlternative = alternatives.find(alt => existingColumns.includes(alt));
                
                if (existingAlternative) {
                    logger.info(`🔄 Normalizando columna: ${existingAlternative} -> ${standardName}`);
                    await client.query(`
                        ALTER TABLE admin_users 
                        RENAME COLUMN ${existingAlternative} TO ${standardName}
                    `);
                }
            }
        }
        
        logger.info('✅ Esquema de admin_users normalizado');
        
    } catch (error) {
        logger.error('❌ Error normalizando columnas:', { error: error.message });
        // No lanzar error, continuar con creación
    }
}

async function createBasicTablesWithInspection(client) {
    try {
        logger.info('Creando tablas básicas...');
        
        // Crear tabla de clientes
        await client.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                numero_telefono VARCHAR(20) UNIQUE NOT NULL,
                nombre VARCHAR(100) DEFAULT '',
                ya_se_presento_ia BOOLEAN DEFAULT false,
                ultima_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_consultas INTEGER DEFAULT 0,
                tono_preferido VARCHAR(20) DEFAULT 'neutral',
                horario_preferido VARCHAR(20) DEFAULT 'mixto',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de conocimientos
        await client.query(`
            CREATE TABLE IF NOT EXISTS conocimientos (
                id SERIAL PRIMARY KEY,
                texto TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de reparaciones
        await client.query(`
            CREATE TABLE IF NOT EXISTS reparaciones (
                id SERIAL PRIMARY KEY,
                modelo_celular VARCHAR(100) NOT NULL,
                tipo_reparacion VARCHAR(100) NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                descripcion TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de historial de interacciones
        await client.query(`
            CREATE TABLE IF NOT EXISTS historial_interacciones (
                id SERIAL PRIMARY KEY,
                numero_telefono VARCHAR(20) NOT NULL,
                consulta_original TEXT,
                intencion_detectada VARCHAR(100),
                respuesta_enviada TEXT,
                productos_mencionados TEXT,
                tono_detectado VARCHAR(20) DEFAULT 'neutral',
                hora_del_dia VARCHAR(20),
                satisfaccion_estimada INTEGER DEFAULT 5,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de admin_users con verificación previa
        await createAdminUsersTableSafely(client);

        logger.info('✅ Tablas básicas creadas correctamente.');
        
    } catch (error) {
        logger.error('Error creando tablas básicas:', { error: error.message });
        throw error;
    }
}

async function createAdminUsersTableSafely(client) {
    try {
        // Verificar si ya existe
        const tableExists = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'admin_users'
            )
        `);
        
        if (!tableExists.rows[0].exists) {
            // Crear tabla con esquema estándar
            await client.query(`
                CREATE TABLE admin_users (
                    id SERIAL PRIMARY KEY,
                    phone_number VARCHAR(20) UNIQUE NOT NULL,
                    name VARCHAR(100),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            logger.info('✅ Tabla admin_users creada con esquema estándar');
        }
        
        // Insertar admin por defecto usando nomenclatura correcta
        await insertDefaultAdminSafely(client);
        
    } catch (error) {
        logger.error('❌ Error creando tabla admin_users:', { error: error.message });
        throw error;
    }
}

async function insertDefaultAdminSafely(client) {
    try {
        // Verificar qué columnas existen realmente
        const columnsResult = await client.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'admin_users' AND table_schema = 'public'
        `);
        
        const columns = columnsResult.rows.map(row => row.column_name);
        
        // Construir INSERT dinámicamente basado en columnas existentes
        const phoneColumn = columns.find(col => 
            ['phone_number', 'numero_telefono', 'telefono'].includes(col)
        ) || 'phone_number';
        
        const nameColumn = columns.find(col => 
            ['name', 'nombre', 'full_name'].includes(col)
        ) || 'name';
        
        await client.query(`
            INSERT INTO admin_users (${phoneColumn}, ${nameColumn}) 
            VALUES ('5216862262377', 'Admin Principal')
            ON CONFLICT (${phoneColumn}) DO NOTHING
        `);
        
        logger.info('✅ Admin por defecto insertado correctamente');
        
    } catch (error) {
        logger.warn('⚠️ No se pudo insertar admin por defecto:', { error: error.message });
        // No lanzar error, continuar
    }
}

async function verifyTables(client) {
    try {
        const tables = ['clientes', 'conocimientos', 'reparaciones', 'historial_interacciones', 'admin_users'];
        
        for (const table of tables) {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )
            `, [table]);
            
            if (result.rows[0].exists) {
                logger.info(`✅ Tabla ${table} verificada`);
            } else {
                logger.warn(`⚠️ Tabla ${table} no existe`);
            }
        }

        // Verificar cantidad de administradores
        try {
            const adminResult = await client.query('SELECT COUNT(*) FROM admin_users');
            logger.info(`✅ Administradores configurados: ${adminResult.rows[0].count}`);
        } catch (error) {
            logger.warn('⚠️ No se pudo verificar administradores:', { error: error.message });
        }
        
    } catch (error) {
        logger.error('Error verificando tablas:', { error: error.message });
        throw error;
    }
}

// Funciones auxiliares para manejo de datos
async function getClientByNumber(phoneNumber) {
    try {
        const result = await pool.query(
            'SELECT * FROM clientes WHERE numero_telefono = $1',
            [phoneNumber]
        );
        return result.rows[0] || null;
    } catch (error) {
        logger.error('Error al buscar cliente:', { error: error.message });
        return null;
    }
}

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
        logger.error('Error al agregar/actualizar cliente:', { error: error.message });
    }
}

async function buildConversationalContext(phoneNumber) {
    try {
        const clientRecord = await getClientByNumber(phoneNumber);
        
        const contexto = {
            esNuevo: !clientRecord,
            tieneNombre: clientRecord && clientRecord.nombre && clientRecord.nombre.trim() !== '',
            nombreCliente: clientRecord?.nombre || null,
            yaSePresentoIA: clientRecord?.ya_se_presento_ia === true,
            ultimaInteraccion: clientRecord?.ultima_interaccion || null,
            tonoPreferido: clientRecord?.tono_preferido || 'neutral',
            horarioPreferido: clientRecord?.horario_preferido || 'mixto',
            totalConsultas: clientRecord?.total_consultas || 0,
            horaActual: new Date().getHours(),
            franjaTiempo: getTimeFrame(new Date().getHours()),
        };
        
        return contexto;
    } catch (error) {
        logger.error('Error al construir contexto:', { error: error.message });
        // Retornar contexto básico si hay error
        return {
            esNuevo: true,
            tieneNombre: false,
            nombreCliente: null,
            yaSePresentoIA: false,
            ultimaInteraccion: null,
            tonoPreferido: 'neutral',
            horarioPreferido: 'mixto',
            totalConsultas: 0,
            horaActual: new Date().getHours(),
            franjaTiempo: getTimeFrame(new Date().getHours()),
        };
    }
}

function getTimeFrame(hour) {
    if (hour >= 6 && hour < 12) return 'mañana';
    if (hour >= 12 && hour < 19) return 'tarde';
    return 'noche';
}

async function closeDatabase() {
    try {
        await pool.end();
        logger.info('Pool de PostgreSQL cerrado');
    } catch (error) {
        logger.error('Error al cerrar pool:', { error: error.message });
    }
}

module.exports = {
    pool,
    initializeDatabase,
    getClientByNumber,
    addOrUpdateClient,
    buildConversationalContext,
    closeDatabase
};
