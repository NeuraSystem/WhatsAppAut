-- Migración: Actualizar tabla historial_interacciones para chunks conversacionales
-- Archivo: update_historial_for_chunks.sql
-- Fecha: 2025-07-07
-- Propósito: Optimizar para sistema híbrido de memoria conversacional

-- Agregar columnas para metadatos de chunks si no existen
DO $$ 
BEGIN
    -- Chunk ID para referenciar el vector en ChromaDB
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'chunk_id') THEN
        ALTER TABLE historial_interacciones ADD COLUMN chunk_id VARCHAR(255);
        CREATE INDEX IF NOT EXISTS idx_historial_chunk_id ON historial_interacciones(chunk_id);
    END IF;

    -- Servicio mencionado (batería, pantalla, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'servicio_mencionado') THEN
        ALTER TABLE historial_interacciones ADD COLUMN servicio_mencionado VARCHAR(100);
    END IF;

    -- Precio cotizado en la conversación
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'precio_cotizado') THEN
        ALTER TABLE historial_interacciones ADD COLUMN precio_cotizado DECIMAL(10,2);
    END IF;

    -- Nombre del usuario (si se proporcionó)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'nombre_usuario') THEN
        ALTER TABLE historial_interacciones ADD COLUMN nombre_usuario VARCHAR(255);
    END IF;

    -- Etapa de la conversación
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'etapa_conversacion') THEN
        ALTER TABLE historial_interacciones ADD COLUMN etapa_conversacion VARCHAR(50) DEFAULT 'ongoing';
    END IF;

    -- Tipo de respuesta (price_quote, time_estimate, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'tipo_respuesta') THEN
        ALTER TABLE historial_interacciones ADD COLUMN tipo_respuesta VARCHAR(50);
    END IF;

    -- Longitud del mensaje del usuario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'longitud_mensaje') THEN
        ALTER TABLE historial_interacciones ADD COLUMN longitud_mensaje INTEGER;
    END IF;

    -- Indicadores booleanos para búsquedas rápidas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'tiene_precio') THEN
        ALTER TABLE historial_interacciones ADD COLUMN tiene_precio BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'historial_interacciones' AND column_name = 'tiene_dispositivo') THEN
        ALTER TABLE historial_interacciones ADD COLUMN tiene_dispositivo BOOLEAN DEFAULT FALSE;
    END IF;

END $$;

-- Crear índices para optimizar búsquedas por metadatos
CREATE INDEX IF NOT EXISTS idx_historial_servicio ON historial_interacciones(servicio_mencionado);
CREATE INDEX IF NOT EXISTS idx_historial_precio ON historial_interacciones(precio_cotizado);
CREATE INDEX IF NOT EXISTS idx_historial_nombre ON historial_interacciones(nombre_usuario);
CREATE INDEX IF NOT EXISTS idx_historial_etapa ON historial_interacciones(etapa_conversacion);
CREATE INDEX IF NOT EXISTS idx_historial_tipo_respuesta ON historial_interacciones(tipo_respuesta);
CREATE INDEX IF NOT EXISTS idx_historial_tiene_precio ON historial_interacciones(tiene_precio);
CREATE INDEX IF NOT EXISTS idx_historial_tiene_dispositivo ON historial_interacciones(tiene_dispositivo);

-- Índice compuesto para búsquedas complejas
CREATE INDEX IF NOT EXISTS idx_historial_dispositivo_servicio 
    ON historial_interacciones(productos_mencionados, servicio_mencionado);

-- Función para actualizar automáticamente los indicadores booleanos
CREATE OR REPLACE FUNCTION update_interaction_flags()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar indicador de precio
    NEW.tiene_precio = (NEW.precio_cotizado IS NOT NULL AND NEW.precio_cotizado > 0);
    
    -- Actualizar indicador de dispositivo
    NEW.tiene_dispositivo = (NEW.productos_mencionados IS NOT NULL AND 
                           jsonb_array_length(NEW.productos_mencionados) > 0);
    
    -- Actualizar longitud del mensaje
    NEW.longitud_mensaje = length(NEW.consulta_original);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar automáticamente los indicadores
DROP TRIGGER IF EXISTS trigger_update_interaction_flags ON historial_interacciones;
CREATE TRIGGER trigger_update_interaction_flags 
    BEFORE INSERT OR UPDATE ON historial_interacciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_interaction_flags();

-- Comentarios sobre las columnas nuevas
COMMENT ON COLUMN historial_interacciones.chunk_id IS 'ID del chunk correspondiente en ChromaDB para memoria conversacional';
COMMENT ON COLUMN historial_interacciones.servicio_mencionado IS 'Tipo de servicio mencionado (pantalla, batería, etc.)';
COMMENT ON COLUMN historial_interacciones.precio_cotizado IS 'Precio específico mencionado en la conversación';
COMMENT ON COLUMN historial_interacciones.nombre_usuario IS 'Nombre del usuario si se proporcionó durante la conversación';
COMMENT ON COLUMN historial_interacciones.etapa_conversacion IS 'Etapa de la conversación (initial, ongoing, specific_inquiry, closing)';
COMMENT ON COLUMN historial_interacciones.tipo_respuesta IS 'Categoría de la respuesta del bot (price_quote, time_estimate, etc.)';
COMMENT ON COLUMN historial_interacciones.tiene_precio IS 'Indicador rápido: la conversación incluye información de precio';
COMMENT ON COLUMN historial_interacciones.tiene_dispositivo IS 'Indicador rápido: la conversación incluye información de dispositivo';

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'historial_interacciones' 
ORDER BY ordinal_position;