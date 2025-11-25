-- Script para poblar productos según categorías de cada tenant
-- SmartPYME - Productos de prueba multi-tenant

USE smartpyme_db;

-- Obtener IDs de los tenants
SET @tenant_pasteleria = (SELECT id_tenant FROM tenants WHERE slug = 'pasteleria-dulce-sabor');
SET @tenant_megamarket = (SELECT id_tenant FROM tenants WHERE slug = 'megamarket-empresarial');

-- Obtener IDs de categorías de Pastelería
SET @cat_tortas = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Tortas');
SET @cat_pasteles = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Pasteles');
SET @cat_pan_dulce = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Pan Dulce');
SET @cat_pan_salado = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Pan Salado');
SET @cat_galletas = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Galletas');
SET @cat_postres = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Postres');
SET @cat_bocaditos = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Bocaditos');
SET @cat_bebidas_p = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_pasteleria AND nombre = 'Bebidas');

-- Obtener IDs de categorías de MegaMarket
SET @cat_electronica = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Electrónica');
SET @cat_electrodomesticos = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Electrodomésticos');
SET @cat_ropa = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Ropa y Moda');
SET @cat_deportes = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Deportes');
SET @cat_hogar = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Hogar y Muebles');
SET @cat_alimentos = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Alimentos');
SET @cat_bebidas_m = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Bebidas');
SET @cat_cuidado = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Cuidado Personal');
SET @cat_juguetes = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Juguetes');
SET @cat_automotriz = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Automotriz');
SET @cat_mascotas = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Mascotas');
SET @cat_libreria = (SELECT id_categoria FROM categorias WHERE id_tenant = @tenant_megamarket AND nombre = 'Librería');

-- Limpiar productos existentes de estos tenants
DELETE FROM productos WHERE id_tenant IN (@tenant_pasteleria, @tenant_megamarket);

-- ========================================
-- PRODUCTOS PARA PASTELERÍA DULCE SABOR
-- ========================================

-- Tortas
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_tortas, 'Torta de Chocolate', 'Deliciosa torta de chocolate con relleno de manjar y cobertura de ganache', 25000, 10, 1),
(@tenant_pasteleria, @cat_tortas, 'Torta de Vainilla', 'Suave torta de vainilla con relleno de crema pastelera y frutillas', 22000, 8, 1),
(@tenant_pasteleria, @cat_tortas, 'Torta Selva Negra', 'Clásica torta con capas de chocolate, crema y cerezas', 28000, 6, 1),
(@tenant_pasteleria, @cat_tortas, 'Torta Tres Leches', 'Torta húmeda bañada en tres tipos de leche', 24000, 12, 1),
(@tenant_pasteleria, @cat_tortas, 'Torta Red Velvet', 'Torta aterciopelada con cobertura de queso crema', 30000, 5, 1);

-- Pasteles
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_pasteles, 'Milhojas', 'Hojaldre con manjar y merengue italiano', 3500, 20, 1),
(@tenant_pasteleria, @cat_pasteles, 'Brazo de Reina', 'Pionono enrollado relleno de manjar', 2800, 15, 1),
(@tenant_pasteleria, @cat_pasteles, 'Éclair', 'Masa choux rellena de crema pastelera con cobertura de chocolate', 2500, 18, 1),
(@tenant_pasteleria, @cat_pasteles, 'Pie de Limón', 'Base de masa quebrada con relleno de limón y merengue', 4000, 10, 1),
(@tenant_pasteleria, @cat_pasteles, 'Cheesecake', 'Tarta de queso con base de galleta', 4500, 8, 1);

-- Pan Dulce
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_pan_dulce, 'Churros', 'Masa frita espolvoreada con azúcar y canela (6 unidades)', 3000, 30, 1),
(@tenant_pasteleria, @cat_pan_dulce, 'Berlinesas', 'Masa esponjosa rellena de manjar (4 unidades)', 2500, 25, 1),
(@tenant_pasteleria, @cat_pan_dulce, 'Medialunas', 'Medialunas dulces mantecosas (6 unidades)', 2000, 40, 1),
(@tenant_pasteleria, @cat_pan_dulce, 'Pan de Pascua', 'Pan dulce con frutas confitadas y nueces', 8000, 15, 1),
(@tenant_pasteleria, @cat_pan_dulce, 'Sopaipillas Pasadas', 'Sopaipillas bañadas en miel de chancaca (8 unidades)', 3500, 20, 1);

-- Pan Salado
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_pan_salado, 'Marraquetas', 'Pan tradicional chileno crujiente (4 unidades)', 1500, 50, 1),
(@tenant_pasteleria, @cat_pan_salado, 'Hallullas', 'Pan redondo esponjoso (4 unidades)', 1500, 45, 1),
(@tenant_pasteleria, @cat_pan_salado, 'Pan Amasado', 'Pan casero artesanal (500g)', 2000, 30, 1),
(@tenant_pasteleria, @cat_pan_salado, 'Baguette', 'Pan francés crujiente', 2500, 25, 1),
(@tenant_pasteleria, @cat_pan_salado, 'Empanadas de Queso', 'Empanadas horneadas de queso (4 unidades)', 4000, 35, 1);

-- Galletas
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_galletas, 'Galletas de Mantequilla', 'Galletas clásicas de mantequilla (12 unidades)', 2500, 30, 1),
(@tenant_pasteleria, @cat_galletas, 'Alfajores', 'Galletas rellenas de manjar (6 unidades)', 3000, 25, 1),
(@tenant_pasteleria, @cat_galletas, 'Cookies con Chips', 'Galletas con chispas de chocolate (8 unidades)', 2800, 28, 1),
(@tenant_pasteleria, @cat_galletas, 'Galletas de Avena', 'Galletas saludables de avena y pasas (10 unidades)', 2200, 22, 1);

-- Postres
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_postres, 'Mousse de Chocolate', 'Mousse suave de chocolate belga', 3500, 15, 1),
(@tenant_pasteleria, @cat_postres, 'Flan de Caramelo', 'Flan casero con caramelo líquido', 3000, 18, 1),
(@tenant_pasteleria, @cat_postres, 'Tiramisú', 'Postre italiano con café y mascarpone', 4500, 10, 1),
(@tenant_pasteleria, @cat_postres, 'Panacota', 'Postre de crema con coulis de frutos rojos', 3800, 12, 1);

-- Bocaditos
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_bocaditos, 'Mini Tortas Decoradas', 'Bocaditos decorados para eventos (12 unidades)', 8000, 20, 1),
(@tenant_pasteleria, @cat_bocaditos, 'Petit Fours', 'Pequeños pasteles dulces variados (15 unidades)', 6500, 15, 1),
(@tenant_pasteleria, @cat_bocaditos, 'Canapés Dulces', 'Bases con cremas y decoraciones (20 unidades)', 7000, 18, 1);

-- Bebidas
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_pasteleria, @cat_bebidas_p, 'Café Latte', 'Café con leche espumosa', 2500, 100, 1),
(@tenant_pasteleria, @cat_bebidas_p, 'Capuchino', 'Café expreso con espuma de leche', 2800, 100, 1),
(@tenant_pasteleria, @cat_bebidas_p, 'Té Verde', 'Infusión de té verde premium', 2000, 80, 1),
(@tenant_pasteleria, @cat_bebidas_p, 'Jugo Natural Naranja', 'Jugo recién exprimido', 3000, 50, 1);

-- ========================================
-- PRODUCTOS PARA MEGAMARKET EMPRESARIAL
-- ========================================

-- Electrónica
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_electronica, 'Smartphone Samsung Galaxy A54', 'Pantalla AMOLED 6.4", 128GB, Cámara 50MP', 349990, 15, 1),
(@tenant_megamarket, @cat_electronica, 'Notebook HP 15.6" Intel i5', '8GB RAM, 256GB SSD, Windows 11', 499990, 10, 1),
(@tenant_megamarket, @cat_electronica, 'Tablet Samsung Galaxy Tab A8', '10.5", 32GB, Android', 179990, 20, 1),
(@tenant_megamarket, @cat_electronica, 'Auriculares Bluetooth Sony', 'Cancelación de ruido, 30hrs batería', 89990, 25, 1),
(@tenant_megamarket, @cat_electronica, 'Smart TV LG 55" 4K', 'WebOS, HDR, ThinQ AI', 449990, 8, 1);

-- Electrodomésticos
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_electrodomesticos, 'Refrigerador Samsung 290L', 'No Frost, Eficiencia Energética A+', 389990, 6, 1),
(@tenant_megamarket, @cat_electrodomesticos, 'Lavadora Mabe 17kg', 'Carga superior, 12 programas', 329990, 8, 1),
(@tenant_megamarket, @cat_electrodomesticos, 'Microondas LG 28L', '1000W, grill, display digital', 89990, 15, 1),
(@tenant_megamarket, @cat_electrodomesticos, 'Aspiradora Irobot Roomba', 'Robot inteligente, mapeo WiFi', 299990, 12, 1),
(@tenant_megamarket, @cat_electrodomesticos, 'Licuadora Oster 600W', '3 velocidades, vaso vidrio 1.5L', 39990, 20, 1);

-- Ropa y Moda
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_ropa, 'Jeans Levi\'s 501 Original', 'Corte clásico, 100% algodón', 49990, 30, 1),
(@tenant_megamarket, @cat_ropa, 'Polera Nike Dri-FIT', 'Tecnología anti-transpiración', 24990, 40, 1),
(@tenant_megamarket, @cat_ropa, 'Zapatillas Adidas Ultraboost', 'Running, tecnología Boost', 99990, 25, 1),
(@tenant_megamarket, @cat_ropa, 'Chaqueta North Face', 'Impermeable, capucha ajustable', 89990, 18, 1),
(@tenant_megamarket, @cat_ropa, 'Vestido Casual Zara', '100% algodón, manga corta', 34990, 22, 1);

-- Deportes
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_deportes, 'Bicicleta MTB Trek 27.5"', '21 velocidades, frenos disco', 349990, 10, 1),
(@tenant_megamarket, @cat_deportes, 'Pesas Hexagonales Set 20kg', 'Par de mancuernas con recubrimiento', 79990, 15, 1),
(@tenant_megamarket, @cat_deportes, 'Colchoneta Yoga 6mm', 'Material antideslizante, incluye correa', 19990, 30, 1),
(@tenant_megamarket, @cat_deportes, 'Balón Fútbol Nike', 'Tamaño oficial, costura térmica', 24990, 35, 1),
(@tenant_megamarket, @cat_deportes, 'Cinta Correr Eléctrica', '1.5HP, velocidad hasta 12km/h, plegable', 399990, 5, 1);

-- Hogar y Muebles
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_hogar, 'Sofá 3 Cuerpos Moderno', 'Tela antimanchas, estructura madera', 289990, 8, 1),
(@tenant_megamarket, @cat_hogar, 'Cama Queen + Colchón', 'Base madera, colchón resortes', 349990, 6, 1),
(@tenant_megamarket, @cat_hogar, 'Mesa Comedor 6 Personas', 'Madera maciza, acabado natural', 199990, 10, 1),
(@tenant_megamarket, @cat_hogar, 'Juego Sábanas 2 Plazas', '100% algodón, incluye fundas', 34990, 25, 1),
(@tenant_megamarket, @cat_hogar, 'Lámpara de Pie LED', 'Regulable, diseño minimalista', 49990, 18, 1);

-- Alimentos
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_alimentos, 'Arroz Grado 1 5kg', 'Arroz blanco de grano largo', 6990, 50, 1),
(@tenant_megamarket, @cat_alimentos, 'Aceite Vegetal 1L', 'Aceite de maravilla puro', 3490, 60, 1),
(@tenant_megamarket, @cat_alimentos, 'Pasta Spaghetti 500g', 'Pasta italiana de sémola', 2490, 80, 1),
(@tenant_megamarket, @cat_alimentos, 'Atún Lomitos en Agua 3pack', 'Pack de 3 latas 160g c/u', 5990, 70, 1),
(@tenant_megamarket, @cat_alimentos, 'Cereal Corn Flakes 500g', 'Cereal de maíz fortificado', 4490, 45, 1);

-- Bebidas
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_bebidas_m, 'Coca Cola 3L', 'Bebida gaseosa', 2990, 100, 1),
(@tenant_megamarket, @cat_bebidas_m, 'Jugo Watts 1L Naranja', 'Jugo concentrado sabor naranja', 1990, 80, 1),
(@tenant_megamarket, @cat_bebidas_m, 'Agua Mineral Cachantún 2L', 'Agua mineral sin gas', 1490, 120, 1),
(@tenant_megamarket, @cat_bebidas_m, 'Vino Casillero del Diablo 750ml', 'Vino tinto Cabernet Sauvignon', 8990, 40, 1),
(@tenant_megamarket, @cat_bebidas_m, 'Cerveza Heineken 6pack', 'Pack de 6 latas 355ml', 7990, 50, 1);

-- Cuidado Personal
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_cuidado, 'Shampoo Pantene 400ml', 'Fórmula Pro-V reparación', 5990, 40, 1),
(@tenant_megamarket, @cat_cuidado, 'Desodorante Rexona Clinical', 'Protección 48hrs, roll-on', 4990, 50, 1),
(@tenant_megamarket, @cat_cuidado, 'Crema Dental Colgate Total 12', 'Protección completa 150ml', 3490, 60, 1),
(@tenant_megamarket, @cat_cuidado, 'Jabón Dove Barra 3pack', 'Pack de 3 barras 90g c/u', 4990, 55, 1),
(@tenant_megamarket, @cat_cuidado, 'Toallas Higiénicas Always 16un', 'Con alas, protección nocturna', 3990, 45, 1);

-- Juguetes
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_juguetes, 'LEGO Classic 1000 Piezas', 'Set de construcción creativa', 39990, 20, 1),
(@tenant_megamarket, @cat_juguetes, 'Barbie Fashionista', 'Muñeca con accesorios de moda', 19990, 25, 1),
(@tenant_megamarket, @cat_juguetes, 'Hot Wheels Pista Looping', 'Pista con loop + 2 autos', 29990, 18, 1),
(@tenant_megamarket, @cat_juguetes, 'Monopoly Clásico', 'Juego de mesa para toda la familia', 34990, 22, 1),
(@tenant_megamarket, @cat_juguetes, 'Nerf Mega Pistola', 'Lanzador de dardos, alcance 30m', 24990, 15, 1);

-- Automotriz
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_automotriz, 'Aceite Motor Mobil 1 5W-30', 'Sintético, 4 litros', 39990, 30, 1),
(@tenant_megamarket, @cat_automotriz, 'Neumático Michelin 185/65R15', 'Llanta radial para auto', 69990, 20, 1),
(@tenant_megamarket, @cat_automotriz, 'Kit Herramientas Auto 50pzs', 'Maletín con herramientas básicas', 49990, 15, 1),
(@tenant_megamarket, @cat_automotriz, 'Aspiradora Auto 12V', 'Compacta, cable 4m', 19990, 25, 1),
(@tenant_megamarket, @cat_automotriz, 'Alfombras Goma Universales', 'Set 4 alfombras para auto', 14990, 35, 1);

-- Mascotas
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_mascotas, 'Alimento Perro Champion 15kg', 'Sabor carne, adultos', 29990, 25, 1),
(@tenant_megamarket, @cat_mascotas, 'Arena Gatos Unicharm 5kg', 'Aglutinante, control olores', 12990, 30, 1),
(@tenant_megamarket, @cat_mascotas, 'Collar Antipulgas Seresto', 'Protección 8 meses, perros', 24990, 20, 1),
(@tenant_megamarket, @cat_mascotas, 'Cama Mascotas Mediana', 'Colchoneta suave 60x50cm', 19990, 18, 1),
(@tenant_megamarket, @cat_mascotas, 'Juguete Perro Pelota Kong', 'Caucho resistente, dispensa premios', 9990, 40, 1);

-- Librería
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) VALUES
(@tenant_megamarket, @cat_libreria, 'Set Cuadernos Universitarios 5un', 'Cuadernos 100 hojas cuadriculados', 9990, 50, 1),
(@tenant_megamarket, @cat_libreria, 'Lápices Faber Castell 12 colores', 'Lápices de colores escolares', 5990, 45, 1),
(@tenant_megamarket, @cat_libreria, 'Mochila Escolar Samsonite', 'Ergonómica, compartimentos', 39990, 22, 1),
(@tenant_megamarket, @cat_libreria, 'Libro "Cien Años de Soledad"', 'Gabriel García Márquez', 14990, 30, 1),
(@tenant_megamarket, @cat_libreria, 'Calculadora Científica Casio', 'Fx-82MS, 240 funciones', 19990, 28, 1);

-- ========================================
-- RESUMEN DE PRODUCTOS INSERTADOS
-- ========================================

SELECT '✅ PRODUCTOS CREADOS POR TENANT Y CATEGORÍA' as '═══════════════════════════';

SELECT 
    t.nombre_empresa as 'Empresa',
    c.nombre as 'Categoría',
    COUNT(*) as 'Cantidad Productos',
    MIN(p.precio) as 'Precio Mínimo',
    MAX(p.precio) as 'Precio Máximo',
    SUM(p.stock) as 'Stock Total'
FROM productos p
JOIN tenants t ON p.id_tenant = t.id_tenant
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE t.slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
GROUP BY t.id_tenant, t.nombre_empresa, c.nombre
ORDER BY t.nombre_empresa, c.nombre;

SELECT '✅ TOTAL POR TENANT' as '═══════════════════════════';

SELECT 
    t.nombre_empresa as 'Empresa',
    COUNT(DISTINCT c.id_categoria) as 'Categorías',
    COUNT(*) as 'Total Productos',
    SUM(p.stock) as 'Stock Total',
    CONCAT('$', FORMAT(AVG(p.precio), 0)) as 'Precio Promedio'
FROM productos p
JOIN tenants t ON p.id_tenant = t.id_tenant
JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE t.slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
GROUP BY t.id_tenant, t.nombre_empresa
ORDER BY t.nombre_empresa;

SELECT '✅ Productos de prueba multi-tenant insertados correctamente' as 'ESTADO';
