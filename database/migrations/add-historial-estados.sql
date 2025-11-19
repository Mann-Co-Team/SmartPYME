-- Migration: Agregar tabla de historial de estados para RF-4
-- Fecha: 2025-11-19
-- Descripción: Permitir seguimiento del estado del pedido con historial de cambios

USE smartpyme_db;

-- Crear tabla de historial de estados de pedidos
CREATE TABLE IF NOT EXISTS historial_estados_pedido (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_estado INT NOT NULL,
    id_usuario INT NULL,
    notas TEXT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_pedido_fecha (id_pedido, fecha_cambio DESC)
);

-- Insertar historial para pedidos existentes (estado inicial)
INSERT IGNORE INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas, fecha_cambio)
SELECT 
    id_pedido, 
    id_estado, 
    id_usuario,
    'Estado inicial del pedido',
    fecha_pedido
FROM pedidos;
