-- Script simple: Actualizar nombres con tildes correctas
USE smartpyme_db;

-- Productos con tildes rotas
UPDATE productos SET nombre = 'Pie de Limón' WHERE nombre LIKE '%Lim%n%';
UPDATE productos SET nombre = 'Té Premium' WHERE nombre LIKE 'T%Premium%';

-- Categorías con tildes rotas  
UPDATE categorias SET nombre = 'Bebidas' WHERE nombre LIKE '%Bebida%';
UPDATE categorias SET nombre = 'Categoría' WHERE nombre LIKE '%Categor%a%';

-- Ver cambios
SELECT id_producto, nombre FROM productos WHERE nombre REGEXP '[áéíóúñÁÉÍÓÚÑ]';
SELECT id_categoria, nombre FROM categorias WHERE nombre REGEXP '[áéíóúñÁÉÍÓÚÑ]';

COMMIT;
