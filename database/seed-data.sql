-- Script para poblar la base de datos con datos de prueba
-- SmartPYME - Datos de ejemplo

USE smartpyme_db;

-- Limpiar datos existentes (opcional, comentar si no quieres borrar)
-- DELETE FROM pedidos WHERE id_pedido > 0;
-- DELETE FROM productos WHERE id_producto > 0;
-- DELETE FROM categorias WHERE id_categoria > 0;

-- Insertar Categorías
INSERT INTO categorias (nombre, descripcion, activo, imagen) VALUES
('Electrónica', 'Productos electrónicos y tecnología', 1, NULL),
('Ropa', 'Vestuario y accesorios de moda', 1, NULL),
('Hogar', 'Artículos para el hogar y decoración', 1, NULL),
('Deportes', 'Equipamiento y ropa deportiva', 1, NULL),
('Alimentos', 'Alimentos y bebidas', 1, NULL),
('Libros', 'Libros y material educativo', 1, NULL),
('Juguetes', 'Juguetes y entretenimiento infantil', 1, NULL),
('Belleza', 'Productos de belleza y cuidado personal', 1, NULL);

-- Insertar Productos de Electrónica
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Smartphone Samsung Galaxy A54', 'Teléfono inteligente con pantalla AMOLED de 6.4", 128GB de almacenamiento y cámara de 50MP', 349990, 15, 1, 1, NULL),
('Laptop HP 15-dy2045', 'Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD, pantalla 15.6" Full HD', 599990, 8, 1, 1, NULL),
('Auriculares Sony WH-1000XM5', 'Auriculares inalámbricos con cancelación de ruido, batería de 30 horas', 299990, 20, 1, 1, NULL),
('Smart TV LG 55" 4K', 'Televisor LED 4K UHD de 55 pulgadas con WebOS y HDR', 549990, 5, 1, 1, NULL),
('Mouse Logitech MX Master 3', 'Mouse inalámbrico ergonómico con sensor de alta precisión', 89990, 25, 1, 1, NULL),
('Teclado Mecánico Razer', 'Teclado mecánico RGB para gaming con switches mecánicos', 129990, 12, 1, 1, NULL),
('Tablet iPad Air 10.9"', 'Tablet Apple con chip M1, 64GB, pantalla Liquid Retina', 649990, 7, 1, 1, NULL),
('Smartwatch Apple Watch SE', 'Reloj inteligente con GPS, monitor de frecuencia cardíaca y resistente al agua', 279990, 18, 1, 1, NULL);

-- Insertar Productos de Ropa
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Polera Básica Algodón', 'Polera de algodón 100%, disponible en varios colores', 12990, 50, 2, 1, NULL),
('Jeans Levi\'s 501', 'Jeans clásicos de corte recto, denim de alta calidad', 45990, 30, 2, 1, NULL),
('Zapatillas Nike Air Max', 'Zapatillas deportivas con tecnología Air Max, cómodas y estilosas', 89990, 22, 2, 1, NULL),
('Chaqueta North Face', 'Chaqueta impermeable para trekking y actividades al aire libre', 129990, 15, 2, 1, NULL),
('Vestido Casual Verano', 'Vestido ligero de algodón ideal para días calurosos', 29990, 35, 2, 1, NULL),
('Camisa Formal Blanca', 'Camisa de vestir de manga larga, perfecta para la oficina', 34990, 40, 2, 1, NULL);

-- Insertar Productos de Hogar
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Juego de Sábanas King', 'Sábanas de microfibra suave, incluye funda de almohada', 39990, 25, 3, 1, NULL),
('Lámpara de Mesa LED', 'Lámpara moderna con regulador de intensidad y puerto USB', 24990, 18, 3, 1, NULL),
('Set de Ollas 5 Piezas', 'Set de ollas antiadherentes con tapas de vidrio', 79990, 12, 3, 1, NULL),
('Aspiradora Robot Xiaomi', 'Aspiradora inteligente con mapeo láser y control por app', 249990, 8, 3, 1, NULL),
('Cortinas Blackout', 'Cortinas opacas que bloquean la luz, 2.4m x 2.2m', 34990, 20, 3, 1, NULL);

-- Insertar Productos de Deportes
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Balón Fútbol Adidas', 'Balón profesional tamaño 5, certificado FIFA', 29990, 30, 4, 1, NULL),
('Bicicleta MTB Trek', 'Bicicleta de montaña con suspensión delantera y 21 velocidades', 449990, 6, 4, 1, NULL),
('Colchoneta Yoga Premium', 'Colchoneta antideslizante de 6mm de grosor, incluye bolso', 19990, 45, 4, 1, NULL),
('Pesas Ajustables 20kg', 'Set de mancuernas ajustables de 2.5 a 20kg', 89990, 15, 4, 1, NULL),
('Cuerda de Saltar', 'Cuerda de saltar profesional con contador digital', 9990, 60, 4, 1, NULL);

-- Insertar Productos de Alimentos
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Café Grano 1kg Premium', 'Café de grano tostado origen Colombia, intensidad alta', 12990, 40, 5, 1, NULL),
('Aceite de Oliva Extra Virgen', 'Aceite de oliva 500ml de primera extracción en frío', 8990, 35, 5, 1, NULL),
('Miel Orgánica 500g', 'Miel pura de abejas, certificación orgánica', 7990, 28, 5, 1, NULL),
('Frutos Secos Mix 500g', 'Mezcla de nueces, almendras, castañas y pasas', 6990, 50, 5, 1, NULL);

-- Insertar Productos de Libros
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Cien Años de Soledad - Gabriel García Márquez', 'Novela clásica de literatura latinoamericana', 16990, 25, 6, 1, NULL),
('El Principito - Antoine de Saint-Exupéry', 'Cuento filosófico ilustrado para todas las edades', 9990, 40, 6, 1, NULL),
('Sapiens - Yuval Noah Harari', 'De animales a dioses: breve historia de la humanidad', 19990, 20, 6, 1, NULL),
('Curso Completo JavaScript', 'Libro técnico para aprender JavaScript desde cero', 29990, 15, 6, 1, NULL);

-- Insertar Productos de Juguetes
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('LEGO Set Ciudad', 'Set de construcción con 500 piezas, incluye figuras', 39990, 18, 7, 1, NULL),
('Muñeca Barbie Fashionista', 'Muñeca articulada con 3 cambios de ropa', 24990, 25, 7, 1, NULL),
('Hot Wheels Pack 5 Autos', 'Colección de 5 autos a escala 1:64', 14990, 35, 7, 1, NULL),
('Puzzle 1000 Piezas', 'Rompecabezas con imagen de paisaje natural', 12990, 22, 7, 1, NULL);

-- Insertar Productos de Belleza
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Set de Brochas Maquillaje', 'Set profesional de 12 brochas con estuche', 29990, 30, 8, 1, NULL),
('Perfume Channel Inspired', 'Fragancia inspirada en perfumes de lujo, 100ml', 24990, 20, 8, 1, NULL),
('Crema Facial Anti-Edad', 'Crema hidratante con colágeno y vitamina E', 18990, 25, 8, 1, NULL),
('Shampoo Keratina 400ml', 'Shampoo reparador con keratina para cabello dañado', 9990, 40, 8, 1, NULL);

-- Insertar algunos productos agotados para pruebas
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('PlayStation 5 Console', 'Consola de videojuegos de última generación (AGOTADO)', 599990, 0, 1, 1, NULL),
('iPhone 15 Pro Max', 'Smartphone Apple con cámara triple y chip A17 Pro (AGOTADO)', 1299990, 0, 1, 1, NULL);

-- Insertar un producto inactivo para pruebas
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen) VALUES
('Producto Descontinuado', 'Este producto ya no está disponible', 1000, 5, 1, 0, NULL);

-- Mostrar resumen de datos insertados
SELECT 'Categorías insertadas:' as Resumen, COUNT(*) as Total FROM categorias;
SELECT 'Productos insertados:' as Resumen, COUNT(*) as Total FROM productos;
SELECT 'Productos activos:' as Resumen, COUNT(*) as Total FROM productos WHERE activo = 1;
SELECT 'Productos con stock:' as Resumen, COUNT(*) as Total FROM productos WHERE stock > 0 AND activo = 1;

-- Mostrar productos por categoría
SELECT 
    c.nombre as Categoria,
    COUNT(p.id_producto) as 'Total Productos',
    SUM(p.stock) as 'Stock Total'
FROM categorias c
LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = 1
GROUP BY c.id_categoria, c.nombre
ORDER BY c.nombre;

SELECT '✅ Datos de prueba insertados correctamente!' as Estado;
