-- Migración para agregar tracking de fallos consecutivos
-- Ejecutar si ya tienes una base de datos existente

-- Agregar columnas para tracking de fallos
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0;

ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS last_failure_timestamp TIMESTAMP NULL;

-- Comentario informativo
COMMENT ON COLUMN clientes.consecutive_failures IS 'Contador de fallos consecutivos del bot con este cliente';
COMMENT ON COLUMN clientes.last_failure_timestamp IS 'Timestamp del último fallo registrado';

-- Índice para optimizar consultas de fallos
CREATE INDEX IF NOT EXISTS idx_clientes_failures ON clientes(consecutive_failures, last_failure_timestamp);

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name IN ('consecutive_failures', 'last_failure_timestamp');