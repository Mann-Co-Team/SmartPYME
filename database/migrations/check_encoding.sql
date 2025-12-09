-- Verificar el charset actual de las tablas
USE smartpyme_db;

-- Ver charset de las tablas
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'smartpyme_db'
AND TABLE_NAME IN ('productos', 'categorias', 'tenants');

-- Ver charset de las columnas específicas
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CHARACTER_SET_NAME,
    COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'smartpyme_db'
AND TABLE_NAME IN ('productos', 'categorias', 'tenants')
AND COLUMN_NAME IN ('nombre', 'descripcion', 'nombre_empresa');

-- Ver algunos datos de ejemplo
SELECT id_producto, nombre, HEX(nombre) as hex_nombre 
FROM productos 
WHERE nombre LIKE '%Lim%' OR nombre LIKE '%T%' 
LIMIT 5;

SELECT id_categoria, nombre, HEX(nombre) as hex_nombre 
FROM categorias 
LIMIT 5;
