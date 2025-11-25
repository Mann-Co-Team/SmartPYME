-- Script para limpiar pedidos con datos cruzados entre tenants
-- SmartPYME - Limpieza de datos

USE smartpyme_db;

-- Deshabilitar comprobación de FKs temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas de pedidos
TRUNCATE TABLE detalle_pedidos;
TRUNCATE TABLE pedidos;

-- Volver a habilitar comprobación de FKs
SET FOREIGN_KEY_CHECKS = 1;

-- Confirmar limpieza
SELECT 'Pedidos limpiados exitosamente' as Estado;
SELECT COUNT(*) as 'Total Pedidos' FROM pedidos;
SELECT COUNT(*) as 'Total Detalles' FROM detalle_pedidos;
