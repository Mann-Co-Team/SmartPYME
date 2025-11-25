-- Script para poblar usuarios, clientes y categorías según plan de cada tenant
-- SmartPYME - Datos de prueba multi-tenant

USE smartpyme_db;

-- ========================================
-- PASO 1: POBLAR USUARIOS SEGÚN LIMITACIONES DE PLAN
-- ========================================

-- Obtener IDs de los tenants
SET @tenant_pasteleria = (SELECT id_tenant FROM tenants WHERE slug = 'pasteleria-dulce-sabor');
SET @tenant_megamarket = (SELECT id_tenant FROM tenants WHERE slug = 'megamarket-empresarial');

-- ========================================
-- PASTELERÍA DULCE SABOR (Plan Básico: máx 2 usuarios)
-- ========================================

-- Admin de Pastelería
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_pasteleria, 1, 'María', 'González', 'admin@pasteleria-dulce-sabor.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56912345678', 1);
-- Password: Admin123!

-- Empleado de Pastelería
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_pasteleria, 2, 'Carlos', 'Ramírez', 'empleado1@pasteleria-dulce-sabor.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56987654321', 1);
-- Password: Empleado123!

-- Clientes de Pastelería
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_pasteleria, 3, 'Ana', 'López', 'cliente1@pasteleria-dulce-sabor.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56911111111', 1),
(@tenant_pasteleria, 3, 'Pedro', 'Martínez', 'cliente2@pasteleria-dulce-sabor.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56922222222', 1),
(@tenant_pasteleria, 3, 'Laura', 'Silva', 'cliente3@pasteleria-dulce-sabor.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56933333333', 1);
-- Password: Cliente123!

-- ========================================
-- MEGAMARKET EMPRESARIAL (Plan Empresarial: usuarios ilimitados)
-- ========================================

-- Admin de MegaMarket
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_megamarket, 1, 'Roberto', 'Fernández', 'admin@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56945678901', 1);
-- Password: Admin123!

-- Empleados de MegaMarket
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_megamarket, 2, 'Sofía', 'Vargas', 'empleado1@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56956789012', 1),
(@tenant_megamarket, 2, 'Diego', 'Morales', 'empleado2@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56967890123', 1);
-- Password: Empleado123!

-- Clientes de MegaMarket
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo) VALUES
(@tenant_megamarket, 3, 'Camila', 'Torres', 'cliente1@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56944444444', 1),
(@tenant_megamarket, 3, 'Andrés', 'Rojas', 'cliente2@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56955555555', 1),
(@tenant_megamarket, 3, 'Valentina', 'Muñoz', 'cliente3@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56966666666', 1),
(@tenant_megamarket, 3, 'Mateo', 'Castro', 'cliente4@megamarket-empresarial.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', '+56977777777', 1);
-- Password: Cliente123!

-- ========================================
-- PASO 2: LIMPIAR Y CREAR CATEGORÍAS ESPECÍFICAS
-- ========================================

-- Eliminar categorías genéricas existentes
DELETE FROM categorias WHERE id_tenant IN (@tenant_pasteleria, @tenant_megamarket);

-- ========================================
-- CATEGORÍAS PARA PASTELERÍA DULCE SABOR
-- ========================================

INSERT INTO categorias (id_tenant, nombre, descripcion, activo) VALUES
(@tenant_pasteleria, 'Tortas', 'Tortas de cumpleaños, celebraciones y ocasiones especiales', 1),
(@tenant_pasteleria, 'Pasteles', 'Pasteles individuales y para compartir', 1),
(@tenant_pasteleria, 'Pan Dulce', 'Pan dulce, bollería y masas horneadas', 1),
(@tenant_pasteleria, 'Pan Salado', 'Pan salado, marraquetas, hallullas y panes especiales', 1),
(@tenant_pasteleria, 'Galletas', 'Galletas artesanales y de mantequilla', 1),
(@tenant_pasteleria, 'Postres', 'Postres refrigerados y mousses', 1),
(@tenant_pasteleria, 'Bocaditos', 'Bocaditos dulces y salados para eventos', 1),
(@tenant_pasteleria, 'Bebidas', 'Café, té y jugos naturales', 1);

-- ========================================
-- CATEGORÍAS PARA MEGAMARKET EMPRESARIAL
-- ========================================

INSERT INTO categorias (id_tenant, nombre, descripcion, activo) VALUES
(@tenant_megamarket, 'Electrónica', 'Tecnología, computadoras, smartphones y accesorios', 1),
(@tenant_megamarket, 'Electrodomésticos', 'Electrodomésticos para el hogar', 1),
(@tenant_megamarket, 'Ropa y Moda', 'Vestuario para toda la familia', 1),
(@tenant_megamarket, 'Deportes', 'Equipamiento deportivo y fitness', 1),
(@tenant_megamarket, 'Hogar y Muebles', 'Muebles y decoración para el hogar', 1),
(@tenant_megamarket, 'Alimentos', 'Alimentos envasados y despensa', 1),
(@tenant_megamarket, 'Bebidas', 'Bebidas alcohólicas y no alcohólicas', 1),
(@tenant_megamarket, 'Cuidado Personal', 'Productos de higiene y belleza', 1),
(@tenant_megamarket, 'Juguetes', 'Juguetes y entretenimiento infantil', 1),
(@tenant_megamarket, 'Automotriz', 'Accesorios y productos para vehículos', 1),
(@tenant_megamarket, 'Mascotas', 'Alimentos y accesorios para mascotas', 1),
(@tenant_megamarket, 'Librería', 'Libros, útiles escolares y oficina', 1);

-- ========================================
-- RESUMEN DE DATOS INSERTADOS
-- ========================================

SELECT '✅ USUARIOS CREADOS POR TENANT' as '═══════════════════════════';

SELECT 
    t.nombre_empresa as 'Empresa',
    t.plan as 'Plan',
    r.nombre_rol as 'Rol',
    COUNT(*) as 'Cantidad',
    GROUP_CONCAT(CONCAT(u.nombre, ' ', u.apellido, ' (', u.email, ')') SEPARATOR '\n') as 'Usuarios'
FROM usuarios u
JOIN tenants t ON u.id_tenant = t.id_tenant
JOIN roles r ON u.id_rol = r.id_rol
WHERE t.slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
GROUP BY t.id_tenant, t.nombre_empresa, t.plan, r.nombre_rol
ORDER BY t.nombre_empresa, r.id_rol;

SELECT '✅ CATEGORÍAS CREADAS POR TENANT' as '═══════════════════════════';

SELECT 
    t.nombre_empresa as 'Empresa',
    COUNT(*) as 'Total Categorías',
    GROUP_CONCAT(c.nombre SEPARATOR ', ') as 'Categorías'
FROM categorias c
JOIN tenants t ON c.id_tenant = t.id_tenant
WHERE t.slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
GROUP BY t.id_tenant, t.nombre_empresa
ORDER BY t.nombre_empresa;

SELECT '✅ Datos de prueba multi-tenant insertados correctamente' as 'ESTADO';
