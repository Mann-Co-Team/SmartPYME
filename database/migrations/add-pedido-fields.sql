-- Migration: Agregar campos para RF-3 (Creación de Pedidos)
-- Fecha: 2025-01-18

USE smartpyme_db;

-- Agregar campos a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN numero_pedido VARCHAR(50) UNIQUE AFTER id_pedido,
ADD COLUMN direccion_entrega TEXT AFTER notas,
ADD COLUMN metodo_entrega ENUM('delivery', 'pickup') DEFAULT 'pickup' AFTER direccion_entrega;

-- Crear índice para búsqueda rápida por número de pedido
CREATE INDEX idx_numero_pedido ON pedidos(numero_pedido);

-- Actualizar pedidos existentes con números de pedido si los hay
UPDATE pedidos 
SET numero_pedido = CONCAT('PED-', LPAD(id_pedido, 8, '0'))
WHERE numero_pedido IS NULL;
