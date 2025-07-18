-- Estructura de la base de datos para el bot de reparaciones
-- Convertido de SQLite a PostgreSQL

-- Tabla para almacenar la información sobre las reparaciones disponibles
CREATE TABLE IF NOT EXISTS reparaciones (
    id SERIAL PRIMARY KEY,
    modelo_celular VARCHAR(255) NOT NULL,
    tipo_reparacion VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    tiempo_reparacion VARCHAR(100),
    disponibilidad VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registrar las consultas de los usuarios
CREATE TABLE IF NOT EXISTS consultas_log (
    id SERIAL PRIMARY KEY,
    numero_telefono VARCHAR(20) NOT NULL,
    consulta TEXT,
    respuesta TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modo VARCHAR(10) CHECK(modo IN ('cliente', 'admin'))
);

-- Tabla para gestionar los administradores del bot
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    numero_telefono VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar información de los clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    numero_telefono VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ya_se_presento_ia BOOLEAN DEFAULT FALSE,
    ultima_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tono_preferido VARCHAR(20) DEFAULT 'neutral', -- formal, informal, neutral
    total_consultas INTEGER DEFAULT 0,
    productos_consultados JSONB, -- JSON array de productos consultados
    horario_preferido VARCHAR(20) DEFAULT 'mixto', -- mañana, tarde, noche, mixto
    consecutive_failures INTEGER DEFAULT 0, -- Contador de fallos consecutivos
    last_failure_timestamp TIMESTAMP NULL -- Timestamp del último fallo
);

-- Tabla para el conocimiento adicional de la IA
CREATE TABLE IF NOT EXISTS conocimientos (
    id SERIAL PRIMARY KEY,
    texto TEXT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para historial detallado de interacciones
CREATE TABLE IF NOT EXISTS historial_interacciones (
    id SERIAL PRIMARY KEY,
    numero_telefono VARCHAR(20) NOT NULL,
    consulta_original TEXT NOT NULL,
    intencion_detectada VARCHAR(100),
    respuesta_enviada TEXT,
    productos_mencionados JSONB, -- JSON array
    tono_detectado VARCHAR(20), -- formal, informal, neutral
    hora_del_dia VARCHAR(20), -- mañana, tarde, noche
    satisfaccion_estimada INTEGER DEFAULT 5 CHECK(satisfaccion_estimada >= 1 AND satisfaccion_estimada <= 10),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (numero_telefono) REFERENCES clientes(numero_telefono)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reparaciones_modelo ON reparaciones(modelo_celular);
CREATE INDEX IF NOT EXISTS idx_reparaciones_tipo ON reparaciones(tipo_reparacion);
CREATE INDEX IF NOT EXISTS idx_reparaciones_precio ON reparaciones(precio);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(numero_telefono);
CREATE INDEX IF NOT EXISTS idx_historial_telefono ON historial_interacciones(numero_telefono);
CREATE INDEX IF NOT EXISTS idx_historial_timestamp ON historial_interacciones(timestamp);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar timestamp en tabla reparaciones
CREATE TRIGGER update_reparaciones_updated_at 
    BEFORE UPDATE ON reparaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales para administradores
INSERT INTO admin_users (numero_telefono, nombre) VALUES 
    ('5216862262377', 'Administrador Principal')
ON CONFLICT (numero_telefono) DO NOTHING;