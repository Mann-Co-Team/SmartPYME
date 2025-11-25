-- Agregar campo numero_pedido a la tabla pedidos
ALTER TABLE pedidos 
ADD COLUMN numero_pedido VARCHAR(50) UNIQUE AFTER id_pedido;

-- Generar números de pedido para pedidos existentes
SET @counter = 0;
UPDATE pedidos 
SET numero_pedido = CONCAT('PED-', DATE_FORMAT(fecha_pedido, '%Y%m%d'), '-', LPAD((@counter := @counter + 1), 4, '0'))
WHERE numero_pedido IS NULL;

-- Hacer el campo NOT NULL ahora que todos tienen valor
ALTER TABLE pedidos 
MODIFY COLUMN numero_pedido VARCHAR(50) UNIQUE NOT NULL;
