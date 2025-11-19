const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
    try {
        console.log('🌱 Iniciando inserción de datos de prueba...\n');

        // Categorías
        const categorias = [
            ['Electrónica', 'Productos electrónicos y tecnología'],
            ['Ropa', 'Vestuario y accesorios de moda'],
            ['Hogar', 'Artículos para el hogar y decoración'],
            ['Deportes', 'Equipamiento y ropa deportiva'],
            ['Alimentos', 'Alimentos y bebidas'],
            ['Libros', 'Libros y material educativo'],
            ['Juguetes', 'Juguetes y entretenimiento infantil'],
            ['Belleza', 'Productos de belleza y cuidado personal']
        ];

        console.log('📦 Insertando categorías...');
        for (const [nombre, descripcion] of categorias) {
            await pool.query(
                'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, 1)',
                [nombre, descripcion]
            );
        }
        console.log(`✅ ${categorias.length} categorías insertadas\n`);

        // Productos
        const productos = [
            // Electrónica (id_categoria: 1)
            ['Smartphone Samsung Galaxy A54', 'Teléfono inteligente con pantalla AMOLED de 6.4", 128GB de almacenamiento y cámara de 50MP', 349990, 15, 1],
            ['Laptop HP 15-dy2045', 'Laptop con procesador Intel Core i5, 8GB RAM, 256GB SSD, pantalla 15.6" Full HD', 599990, 8, 1],
            ['Auriculares Sony WH-1000XM5', 'Auriculares inalámbricos con cancelación de ruido, batería de 30 horas', 299990, 20, 1],
            ['Smart TV LG 55" 4K', 'Televisor LED 4K UHD de 55 pulgadas con WebOS y HDR', 549990, 5, 1],
            ['Mouse Logitech MX Master 3', 'Mouse inalámbrico ergonómico con sensor de alta precisión', 89990, 25, 1],
            ['Teclado Mecánico Razer', 'Teclado mecánico RGB para gaming con switches mecánicos', 129990, 12, 1],
            ['Tablet iPad Air 10.9"', 'Tablet Apple con chip M1, 64GB, pantalla Liquid Retina', 649990, 7, 1],
            ['Smartwatch Apple Watch SE', 'Reloj inteligente con GPS, monitor de frecuencia cardíaca y resistente al agua', 279990, 18, 1],
            
            // Ropa (id_categoria: 2)
            ['Polera Básica Algodón', 'Polera de algodón 100%, disponible en varios colores', 12990, 50, 2],
            ['Jeans Levi\'s 501', 'Jeans clásicos de corte recto, denim de alta calidad', 45990, 30, 2],
            ['Zapatillas Nike Air Max', 'Zapatillas deportivas con tecnología Air Max, cómodas y estilosas', 89990, 22, 2],
            ['Chaqueta North Face', 'Chaqueta impermeable para trekking y actividades al aire libre', 129990, 15, 2],
            ['Vestido Casual Verano', 'Vestido ligero de algodón ideal para días calurosos', 29990, 35, 2],
            ['Camisa Formal Blanca', 'Camisa de vestir de manga larga, perfecta para la oficina', 34990, 40, 2],
            
            // Hogar (id_categoria: 3)
            ['Juego de Sábanas King', 'Sábanas de microfibra suave, incluye funda de almohada', 39990, 25, 3],
            ['Lámpara de Mesa LED', 'Lámpara moderna con regulador de intensidad y puerto USB', 24990, 18, 3],
            ['Set de Ollas 5 Piezas', 'Set de ollas antiadherentes con tapas de vidrio', 79990, 12, 3],
            ['Aspiradora Robot Xiaomi', 'Aspiradora inteligente con mapeo láser y control por app', 249990, 8, 3],
            ['Cortinas Blackout', 'Cortinas opacas que bloquean la luz, 2.4m x 2.2m', 34990, 20, 3],
            
            // Deportes (id_categoria: 4)
            ['Balón Fútbol Adidas', 'Balón profesional tamaño 5, certificado FIFA', 29990, 30, 4],
            ['Bicicleta MTB Trek', 'Bicicleta de montaña con suspensión delantera y 21 velocidades', 449990, 6, 4],
            ['Colchoneta Yoga Premium', 'Colchoneta antideslizante de 6mm de grosor, incluye bolso', 19990, 45, 4],
            ['Pesas Ajustables 20kg', 'Set de mancuernas ajustables de 2.5 a 20kg', 89990, 15, 4],
            ['Cuerda de Saltar', 'Cuerda de saltar profesional con contador digital', 9990, 60, 4],
            
            // Alimentos (id_categoria: 5)
            ['Café Grano 1kg Premium', 'Café de grano tostado origen Colombia, intensidad alta', 12990, 40, 5],
            ['Aceite de Oliva Extra Virgen', 'Aceite de oliva 500ml de primera extracción en frío', 8990, 35, 5],
            ['Miel Orgánica 500g', 'Miel pura de abejas, certificación orgánica', 7990, 28, 5],
            ['Frutos Secos Mix 500g', 'Mezcla de nueces, almendras, castañas y pasas', 6990, 50, 5],
            
            // Libros (id_categoria: 6)
            ['Cien Años de Soledad - Gabriel García Márquez', 'Novela clásica de literatura latinoamericana', 16990, 25, 6],
            ['El Principito - Antoine de Saint-Exupéry', 'Cuento filosófico ilustrado para todas las edades', 9990, 40, 6],
            ['Sapiens - Yuval Noah Harari', 'De animales a dioses: breve historia de la humanidad', 19990, 20, 6],
            ['Curso Completo JavaScript', 'Libro técnico para aprender JavaScript desde cero', 29990, 15, 6],
            
            // Juguetes (id_categoria: 7)
            ['LEGO Set Ciudad', 'Set de construcción con 500 piezas, incluye figuras', 39990, 18, 7],
            ['Muñeca Barbie Fashionista', 'Muñeca articulada con 3 cambios de ropa', 24990, 25, 7],
            ['Hot Wheels Pack 5 Autos', 'Colección de 5 autos a escala 1:64', 14990, 35, 7],
            ['Puzzle 1000 Piezas', 'Rompecabezas con imagen de paisaje natural', 12990, 22, 7],
            
            // Belleza (id_categoria: 8)
            ['Set de Brochas Maquillaje', 'Set profesional de 12 brochas con estuche', 29990, 30, 8],
            ['Perfume Channel Inspired', 'Fragancia inspirada en perfumes de lujo, 100ml', 24990, 20, 8],
            ['Crema Facial Anti-Edad', 'Crema hidratante con colágeno y vitamina E', 18990, 25, 8],
            ['Shampoo Keratina 400ml', 'Shampoo reparador con keratina para cabello dañado', 9990, 40, 8],
            
            // Productos agotados
            ['PlayStation 5 Console', 'Consola de videojuegos de última generación (AGOTADO)', 599990, 0, 1],
            ['iPhone 15 Pro Max', 'Smartphone Apple con cámara triple y chip A17 Pro (AGOTADO)', 1299990, 0, 1]
        ];

        console.log('📦 Insertando productos...');
        let count = 0;
        for (const [nombre, descripcion, precio, stock, id_categoria] of productos) {
            await pool.query(
                'INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo) VALUES (?, ?, ?, ?, ?, 1)',
                [nombre, descripcion, precio, stock, id_categoria]
            );
            count++;
            if (count % 10 === 0) {
                console.log(`   ${count} productos insertados...`);
            }
        }
        console.log(`✅ ${productos.length} productos insertados\n`);

        // Mostrar resumen
        const [categoriaCount] = await pool.query('SELECT COUNT(*) as total FROM categorias');
        const [productoCount] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE activo = 1');
        const [stockCount] = await pool.query('SELECT COUNT(*) as total FROM productos WHERE stock > 0 AND activo = 1');

        console.log('📊 Resumen:');
        console.log(`   Categorías: ${categoriaCount[0].total}`);
        console.log(`   Productos activos: ${productoCount[0].total}`);
        console.log(`   Productos con stock: ${stockCount[0].total}`);

        // Mostrar distribución por categoría
        const [distribution] = await pool.query(`
            SELECT 
                c.nombre as categoria,
                COUNT(p.id_producto) as total_productos,
                SUM(p.stock) as stock_total
            FROM categorias c
            LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.activo = 1
            GROUP BY c.id_categoria, c.nombre
            ORDER BY c.nombre
        `);

        console.log('\n📦 Productos por categoría:');
        distribution.forEach(cat => {
            console.log(`   ${cat.categoria}: ${cat.total_productos} productos (Stock: ${cat.stock_total || 0})`);
        });

        console.log('\n✅ ¡Datos de prueba insertados correctamente!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error insertando datos:', error.message);
        process.exit(1);
    }
}

seedDatabase();
