-- Agregar columna numero_cuota a tabla pagos
USE coop_smart;

ALTER TABLE pagos ADD COLUMN numero_cuota INT DEFAULT 1 AFTER id_prestamo;

-- Verificar que se agregó
DESCRIBE pagos;
