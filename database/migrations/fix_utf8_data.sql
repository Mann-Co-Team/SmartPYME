-- Script para arreglar encoding UTF-8 en datos existentes
-- Este script convierte datos mal codificados a UTF-8 correcto

USE smartpyme_db;

-- Arreglar tabla productos
UPDATE productos 
SET nombre = CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre LIKE '%?%';

UPDATE productos 
SET descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE descripcion LIKE '%?%' AND descripcion IS NOT NULL;

-- Arreglar tabla categorias
UPDATE categorias 
SET nombre = CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre LIKE '%?%';

UPDATE categorias 
SET descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE descripcion LIKE '%?%' AND descripcion IS NOT NULL;

-- Arreglar tabla tenants
UPDATE tenants 
SET nombre_empresa = CONVERT(CAST(CONVERT(nombre_empresa USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre_empresa LIKE '%?%';

UPDATE tenants 
SET descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE descripcion LIKE '%?%' AND descripcion IS NOT NULL;

UPDATE tenants 
SET direccion = CONVERT(CAST(CONVERT(direccion USING latin1) AS BINARY) USING utf8mb4)
WHERE direccion LIKE '%?%' AND direccion IS NOT NULL;

-- Verificar cambios
SELECT id_producto, nombre FROM productos WHERE nombre REGEXP '[áéíóúñÁÉÍÓÚÑ]';
SELECT id_categoria, nombre FROM categorias WHERE nombre REGEXP '[áéíóúñÁÉÍÓÚÑ]';

COMMIT;
