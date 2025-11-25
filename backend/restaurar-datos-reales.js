const mysql = require('mysql2/promise');
require('dotenv').config();

async function restaurarDatosReales() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Obtener todas las tiendas
        const [tenants] = await connection.execute('SELECT id_tenant, slug, nombre_empresa, plan FROM tenants ORDER BY slug');

        // LIMPIAR CATEGORÍAS Y PRODUCTOS ACTUALES
        console.log('🧹 Limpiando categorías y productos...');
        await connection.execute('DELETE FROM productos WHERE id_tenant > 0');
        await connection.execute('DELETE FROM categorias WHERE id_tenant > 0');
        console.log('✅ Limpieza completada\n');

        // CATEGORÍAS Y PRODUCTOS ESPECÍFICOS POR TIENDA
        const tiendasData = {
            'pasteleria-dulce-sabor': {
                categorias: [
                    'Tortas y Pasteles',
                    'Cupcakes y Muffins',
                    'Galletas',
                    'Panes Artesanales',
                    'Postres Fríos',
                    'Repostería sin Gluten',
                    'Bebidas'
                ],
                productos: [
                    { nombre: 'Torta Tres Leches', precio: 25000, stock: 3, imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', descripcion: 'Deliciosa torta tres leches con cobertura de merengue' },
                    { nombre: 'Torta de Chocolate', precio: 22000, stock: 5, imagen: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', descripcion: 'Torta de chocolate con ganache y decoración elegante' },
                    { nombre: 'Cupcakes Variados x6', precio: 8500, stock: 20, imagen: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=500', descripcion: 'Set de 6 cupcakes con diferentes sabores y decoraciones' },
                    { nombre: 'Galletas Decoradas x12', precio: 7500, stock: 30, imagen: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500', descripcion: 'Docena de galletas artesanales decoradas' },
                    { nombre: 'Pie de Limón', precio: 12000, stock: 8, imagen: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=500', descripcion: 'Pie de limón con merengue italiano' },
                    { nombre: 'Brownies x6', precio: 6500, stock: 25, imagen: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=500', descripcion: 'Brownies de chocolate con nueces' },
                    { nombre: 'Cheesecake de Frutos Rojos', precio: 18000, stock: 4, imagen: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500', descripcion: 'Cheesecake cremoso con salsa de frutos rojos' },
                    { nombre: 'Macarons Franceses x12', precio: 15000, stock: 15, imagen: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500', descripcion: 'Set de 12 macarons en sabores variados' }
                ]
            },
            'electrotech-premium': {
                categorias: [
                    'Smartphones',
                    'Laptops y Computadoras',
                    'Tablets',
                    'Audio',
                    'Wearables',
                    'Consolas y Gaming',
                    'Accesorios Premium'
                ],
                productos: [
                    { nombre: 'iPhone 15 Pro Max', precio: 1449990, stock: 8, imagen: 'https://images.unsplash.com/photo-1592286927505-38c7c1d75cbf?w=500', descripcion: 'iPhone 15 Pro Max 256GB Titanio Natural' },
                    { nombre: 'MacBook Pro 14" M3', precio: 2299990, stock: 5, imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', descripcion: 'MacBook Pro 14" con chip M3 Pro, 18GB RAM, 512GB SSD' },
                    { nombre: 'iPad Air M2', precio: 699990, stock: 12, imagen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', descripcion: 'iPad Air 11" con chip M2, 128GB' },
                    { nombre: 'AirPods Pro 2', precio: 279990, stock: 20, imagen: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500', descripcion: 'AirPods Pro 2da generación con USB-C' },
                    { nombre: 'Apple Watch Ultra 2', precio: 899990, stock: 6, imagen: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500', descripcion: 'Apple Watch Ultra 2 con GPS + Cellular' },
                    { nombre: 'PlayStation 5 Slim', precio: 549990, stock: 10, imagen: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500', descripcion: 'PS5 Slim Digital Edition 1TB' },
                    { nombre: 'Xbox Series X', precio: 549990, stock: 8, imagen: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500', descripcion: 'Xbox Series X 1TB' },
                    { nombre: 'Nintendo Switch OLED', precio: 349990, stock: 15, imagen: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500', descripcion: 'Nintendo Switch modelo OLED' },
                    { nombre: 'Samsung Galaxy S24 Ultra', precio: 1299990, stock: 10, imagen: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', descripcion: 'Samsung Galaxy S24 Ultra 256GB' },
                    { nombre: 'Sony WH-1000XM5', precio: 399990, stock: 15, imagen: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500', descripcion: 'Audífonos inalámbricos con cancelación de ruido' }
                ]
            },
            'boutique-fashion-elite': {
                categorias: [
                    'Vestidos',
                    'Blazers y Sacos',
                    'Blusas',
                    'Faldas',
                    'Pantalones',
                    'Calzado',
                    'Accesorios'
                ],
                productos: [
                    { nombre: 'Vestido Cóctel Negro', precio: 89990, stock: 10, imagen: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500', descripcion: 'Vestido negro elegante para ocasiones especiales' },
                    { nombre: 'Blazer Italiano Beige', precio: 129990, stock: 8, imagen: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500', descripcion: 'Blazer de corte italiano en lino beige' },
                    { nombre: 'Blusa Seda Francesa', precio: 59990, stock: 15, imagen: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500', descripcion: 'Blusa de seda 100% natural importada' },
                    { nombre: 'Falda Plisada Midi', precio: 45990, stock: 20, imagen: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500', descripcion: 'Falda midi plisada en colores pastel' },
                    { nombre: 'Pantalón Palazzo Lino', precio: 54990, stock: 12, imagen: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', descripcion: 'Pantalón palazzo en lino natural' },
                    { nombre: 'Stilettos Charol', precio: 69990, stock: 15, imagen: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', descripcion: 'Zapatos de tacón alto en charol' },
                    { nombre: 'Bolso Cuero Italiano', precio: 149990, stock: 8, imagen: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', descripcion: 'Bolso de mano en cuero italiano genuino' }
                ]
            },
            'demo': {
                categorias: [
                    'Laptops',
                    'Periféricos',
                    'Monitores',
                    'Audio y Video',
                    'Almacenamiento'
                ],
                productos: [
                    { nombre: 'Laptop HP Pavilion 15', precio: 649990, stock: 15, imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', descripcion: 'Laptop HP 15.6" Intel Core i5, 8GB RAM, 256GB SSD' },
                    { nombre: 'Mouse Logitech MX Master 3S', precio: 89990, stock: 50, imagen: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', descripcion: 'Mouse ergonómico inalámbrico de alta precisión' },
                    { nombre: 'Teclado Mecánico RGB', precio: 119990, stock: 30, imagen: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', descripcion: 'Teclado mecánico con switches Cherry MX e iluminación RGB' },
                    { nombre: 'Monitor Samsung 27" 4K', precio: 349990, stock: 20, imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', descripcion: 'Monitor 4K UHD 27 pulgadas con HDR' },
                    { nombre: 'Webcam Logitech C920 HD Pro', precio: 79990, stock: 25, imagen: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500', descripcion: 'Webcam Full HD 1080p con micrófono dual' }
                ]
            },
            'tienda-abc': {
                categorias: [
                    'Camisas',
                    'Pantalones',
                    'Calzado Deportivo',
                    'Ropa Casual',
                    'Accesorios'
                ],
                productos: [
                    { nombre: 'Camisa Polo Lacoste', precio: 49990, stock: 30, imagen: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500', descripcion: 'Camisa polo clásica de algodón' },
                    { nombre: 'Jeans Levi\'s 501', precio: 69990, stock: 25, imagen: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', descripcion: 'Pantalón jeans corte clásico' },
                    { nombre: 'Nike Air Max', precio: 119990, stock: 20, imagen: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', descripcion: 'Zapatillas deportivas Air Max' }
                ]
            },
            'comercial-xyz': {
                categorias: [
                    'Granos y Cereales',
                    'Aceites',
                    'Lácteos',
                    'Pastas',
                    'Bebidas'
                ],
                productos: [
                    { nombre: 'Arroz Premium 1kg', precio: 1590, stock: 100, imagen: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', descripcion: 'Arroz grano largo extra premium' },
                    { nombre: 'Aceite de Oliva Extra Virgen', precio: 8990, stock: 50, imagen: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', descripcion: 'Aceite de oliva prensado en frío' },
                    { nombre: 'Pasta Italiana 500g', precio: 2490, stock: 80, imagen: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500', descripcion: 'Pasta spaghetti italiana auténtica' },
                    { nombre: 'Leche Entera 1L', precio: 1290, stock: 60, imagen: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', descripcion: 'Leche entera ultra pasteurizada' },
                    { nombre: 'Harina de Trigo 1kg', precio: 990, stock: 90, imagen: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', descripcion: 'Harina de trigo todo uso' }
                ]
            },
            'megatienda-2000': {
                categorias: [
                    'Televisores',
                    'Refrigeradores',
                    'Lavadoras',
                    'Cocina',
                    'Pequeños Electrodomésticos'
                ],
                productos: [
                    { nombre: 'TV Samsung QLED 55"', precio: 899990, stock: 10, imagen: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', descripcion: 'Smart TV QLED 4K 55 pulgadas' },
                    { nombre: 'Refrigerador LG Side by Side', precio: 1299990, stock: 5, imagen: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500', descripcion: 'Refrigerador 28 pies cúbicos con dispensador' },
                    { nombre: 'Lavadora Samsung 18kg', precio: 599990, stock: 8, imagen: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500', descripcion: 'Lavadora automática carga frontal' },
                    { nombre: 'Microondas Panasonic Inverter', precio: 149990, stock: 15, imagen: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500', descripcion: 'Microondas con tecnología inverter 1.2 cu ft' },
                    { nombre: 'Licuadora Oster Pro 1200', precio: 89990, stock: 20, imagen: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500', descripcion: 'Licuadora profesional 1200W' }
                ]
            }
        };

        // RESTAURAR CATEGORÍAS Y PRODUCTOS POR TIENDA
        for (const tenant of tenants) {
            const data = tiendasData[tenant.slug];
            
            if (!data) {
                console.log(`⚠️  ${tenant.slug}: No hay datos específicos definidos\n`);
                continue;
            }

            console.log(`📦 Restaurando: ${tenant.nombre_empresa} (${tenant.slug})`);

            // Crear categorías específicas
            for (const nombreCat of data.categorias) {
                await connection.execute(`
                    INSERT INTO categorias (id_tenant, nombre, descripcion, activo)
                    VALUES (?, ?, ?, TRUE)
                `, [tenant.id_tenant, nombreCat, `Categoría de ${nombreCat}`]);
            }
            console.log(`   ✅ ${data.categorias.length} categorías creadas`);

            // Obtener primera categoría para asignar productos
            const [cats] = await connection.execute(
                'SELECT id_categoria FROM categorias WHERE id_tenant = ? LIMIT 1',
                [tenant.id_tenant]
            );

            if (cats.length === 0) continue;

            // Crear productos con imágenes
            for (const prod of data.productos) {
                await connection.execute(`
                    INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, imagen, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
                `, [
                    tenant.id_tenant,
                    cats[0].id_categoria,
                    prod.nombre,
                    prod.descripcion,
                    prod.precio,
                    prod.stock,
                    prod.imagen
                ]);
            }
            console.log(`   ✅ ${data.productos.length} productos con imágenes\n`);
        }

        console.log('🎉 RESTAURACIÓN COMPLETA EXITOSA\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

restaurarDatosReales();
