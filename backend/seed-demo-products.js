const db = require('./config/db');

async function seedDemoProducts() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     SEED DE PRODUCTOS DEMO CON IMÁGENES - SmartPYME ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        // ============================================
        // ELECTROTECH PREMIUM (Plan Empresarial)
        // ============================================
        const [electrotech] = await db.execute(
            'SELECT id_tenant FROM tenants WHERE slug = ?',
            ['electrotech-premium']
        );

        if (electrotech.length > 0) {
            const electrotechId = electrotech[0].id_tenant;
            console.log(`\n⚡ ELECTROTECH PREMIUM (Tenant ID: ${electrotechId})`);

            // Obtener categorías de ElectroTech
            const [electrotechCats] = await db.execute(
                'SELECT id_categoria, nombre FROM categorias WHERE id_tenant = ?',
                [electrotechId]
            );

            const categoriasMap = {};
            electrotechCats.forEach(cat => {
                const nombre = cat.nombre.toLowerCase();
                if (nombre.includes('laptop') || nombre.includes('computador')) categoriasMap.laptops = cat.id_categoria;
                else if (nombre.includes('smartphone') || nombre.includes('celular')) categoriasMap.smartphones = cat.id_categoria;
                else if (nombre.includes('audio') || nombre.includes('auricular')) categoriasMap.audio = cat.id_categoria;
                else if (nombre.includes('gaming') || nombre.includes('juego')) categoriasMap.gaming = cat.id_categoria;
                else if (nombre.includes('accesorios')) categoriasMap.accesorios = cat.id_categoria;
            });

            const electrotechProducts = [
                {
                    nombre: 'MacBook Pro M3 14"',
                    descripcion: 'Laptop profesional con chip M3, 16GB RAM, 512GB SSD, pantalla Retina XDR, ideal para desarrollo y diseño',
                    precio: 2499990,
                    stock: 8,
                    id_categoria: categoriasMap.laptops || electrotechCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
                },
                {
                    nombre: 'Dell XPS 15 4K',
                    descripcion: 'Laptop ultrabook con Intel Core i7 13va Gen, 32GB RAM, 1TB SSD, pantalla táctil 4K OLED',
                    precio: 1899990,
                    stock: 12,
                    id_categoria: categoriasMap.laptops || electrotechCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'
                },
                {
                    nombre: 'iPhone 15 Pro Max',
                    descripcion: 'Smartphone premium con chip A17 Pro, cámara triple 48MP, pantalla OLED 6.7", titanio',
                    precio: 1499990,
                    stock: 15,
                    id_categoria: categoriasMap.smartphones || electrotechCats[1].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1592286927505-2fd7eef1dd83?w=500'
                },
                {
                    nombre: 'Samsung Galaxy S24 Ultra',
                    descripcion: 'Smartphone insignia con S Pen, cámara de 200MP, pantalla AMOLED 6.8", 12GB RAM',
                    precio: 1299990,
                    stock: 20,
                    id_categoria: categoriasMap.smartphones || electrotechCats[1].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'
                },
                {
                    nombre: 'Sony WH-1000XM5',
                    descripcion: 'Auriculares premium con cancelación de ruido líder en la industria, 30h de batería, sonido Hi-Res',
                    precio: 349990,
                    stock: 25,
                    id_categoria: categoriasMap.audio || electrotechCats[2].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=500'
                },
                {
                    nombre: 'AirPods Pro 2da Gen',
                    descripcion: 'Auriculares inalámbricos con cancelación activa de ruido, audio espacial, resistentes al agua',
                    precio: 249990,
                    stock: 30,
                    id_categoria: categoriasMap.audio || electrotechCats[2].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500'
                },
                {
                    nombre: 'PlayStation 5 Digital',
                    descripcion: 'Consola de videojuegos de última generación, SSD ultra rápido, 4K 120fps, raytracing',
                    precio: 549990,
                    stock: 10,
                    id_categoria: categoriasMap.gaming || electrotechCats[3].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'
                },
                {
                    nombre: 'Xbox Series X',
                    descripcion: 'Consola gaming 4K nativa, 12 teraflops, SSD 1TB, retrocompatibilidad con miles de juegos',
                    precio: 599990,
                    stock: 12,
                    id_categoria: categoriasMap.gaming || electrotechCats[3].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500'
                },
                {
                    nombre: 'Logitech MX Master 3S',
                    descripcion: 'Mouse ergonómico premium para productividad, 8K DPI, desplazamiento silencioso, multi-dispositivo',
                    precio: 99990,
                    stock: 40,
                    id_categoria: categoriasMap.accesorios || electrotechCats[4].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
                },
                {
                    nombre: 'Teclado Mecánico Keychron K8',
                    descripcion: 'Teclado mecánico inalámbrico, switches Gateron, RGB, compatible Mac y Windows',
                    precio: 129990,
                    stock: 35,
                    id_categoria: categoriasMap.accesorios || electrotechCats[4].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'
                },
                {
                    nombre: 'iPad Pro 12.9" M2',
                    descripcion: 'Tablet profesional con chip M2, pantalla Liquid Retina XDR, 256GB, compatible con Apple Pencil',
                    precio: 1199990,
                    stock: 8,
                    id_categoria: categoriasMap.laptops || electrotechCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'
                },
                {
                    nombre: 'Apple Watch Ultra 2',
                    descripcion: 'Smartwatch premium para deportes extremos, GPS dual, resistente 100m, pantalla siempre activa',
                    precio: 899990,
                    stock: 15,
                    id_categoria: categoriasMap.accesorios || electrotechCats[4].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
                },
                {
                    nombre: 'Samsung 55" Neo QLED 8K',
                    descripcion: 'Smart TV 8K con tecnología Neo QLED, procesador neural, Dolby Atmos, Gaming Hub',
                    precio: 2299990,
                    stock: 5,
                    id_categoria: categoriasMap.laptops || electrotechCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'
                },
                {
                    nombre: 'DJI Mini 4 Pro Drone',
                    descripcion: 'Drone compacto con cámara 4K HDR, 34 minutos de vuelo, detección omnidireccional de obstáculos',
                    precio: 749990,
                    stock: 7,
                    id_categoria: categoriasMap.accesorios || electrotechCats[4].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500'
                },
                {
                    nombre: 'GoPro Hero 12 Black',
                    descripcion: 'Cámara de acción 5.3K60, HyperSmooth 6.0, resistente al agua 10m, pantallas táctiles duales',
                    precio: 449990,
                    stock: 18,
                    id_categoria: categoriasMap.accesorios || electrotechCats[4].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=500'
                }
            ];

            console.log(`   Insertando ${electrotechProducts.length} productos de electrónica...`);
            for (const producto of electrotechProducts) {
                await db.execute(
                    `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen, id_tenant)
                     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
                    [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.id_categoria, producto.imagen_url, electrotechId]
                );
                console.log(`   ✅ ${producto.nombre}`);
            }
        }

        // ============================================
        // LA BOUTIQUE ELEGANTE (Plan Profesional)
        // ============================================
        const [boutique] = await db.execute(
            'SELECT id_tenant FROM tenants WHERE slug = ?',
            ['boutique-fashion-elite']
        );

        if (boutique.length > 0) {
            const boutiqueId = boutique[0].id_tenant;
            console.log(`\n👗 BOUTIQUE FASHION ELITE (Tenant ID: ${boutiqueId})`);

            const [boutiqueCats] = await db.execute(
                'SELECT id_categoria, nombre FROM categorias WHERE id_tenant = ?',
                [boutiqueId]
            );

            const categoriasMap = {};
            boutiqueCats.forEach(cat => {
                const nombre = cat.nombre.toLowerCase();
                if (nombre.includes('mujer') || nombre.includes('dama')) categoriasMap.mujer = cat.id_categoria;
                else if (nombre.includes('hombre') || nombre.includes('caballero')) categoriasMap.hombre = cat.id_categoria;
                else if (nombre.includes('accesorio')) categoriasMap.accesorios = cat.id_categoria;
                else if (nombre.includes('zapato') || nombre.includes('calzado')) categoriasMap.calzado = cat.id_categoria;
            });

            const boutiqueProducts = [
                {
                    nombre: 'Vestido Midi Floral Primavera',
                    descripcion: 'Vestido elegante de corte midi con estampado floral, manga 3/4, perfecto para ocasiones especiales',
                    precio: 49990,
                    stock: 25,
                    id_categoria: categoriasMap.mujer || boutiqueCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'
                },
                {
                    nombre: 'Blazer Mujer Elegante Negro',
                    descripcion: 'Blazer de corte moderno, tela premium, ideal para oficina o eventos formales',
                    precio: 79990,
                    stock: 18,
                    id_categoria: categoriasMap.mujer || boutiqueCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500'
                },
                {
                    nombre: 'Blusa de Seda Rosa Pálido',
                    descripcion: 'Blusa de seda natural con cuello en V, acabado suave y elegante',
                    precio: 39990,
                    stock: 30,
                    id_categoria: categoriasMap.mujer || boutiqueCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1564257577106-6b516b9b7b44?w=500'
                },
                {
                    nombre: 'Pantalón Palazzo Lino Beige',
                    descripcion: 'Pantalón de lino con corte palazzo, cintura alta, cómodo y versátil',
                    precio: 44990,
                    stock: 22,
                    id_categoria: categoriasMap.mujer || boutiqueCats[0].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=500'
                },
                {
                    nombre: 'Camisa Formal Hombre Blanca',
                    descripcion: 'Camisa de algodón egipcio, corte slim fit, perfecta para traje o uso casual elegante',
                    precio: 34990,
                    stock: 35,
                    id_categoria: categoriasMap.hombre || boutiqueCats[1].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500'
                },
                {
                    nombre: 'Traje Hombre 2 Piezas Azul Marino',
                    descripcion: 'Traje completo chaqueta y pantalón, corte clásico, ideal para bodas y eventos',
                    precio: 199990,
                    stock: 12,
                    id_categoria: categoriasMap.hombre || boutiqueCats[1].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=500'
                },
                {
                    nombre: 'Polo Premium Algodón Pima',
                    descripcion: 'Polo de algodón pima peruano, suave al tacto, disponible en varios colores',
                    precio: 29990,
                    stock: 40,
                    id_categoria: categoriasMap.hombre || boutiqueCats[1].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500'
                },
                {
                    nombre: 'Zapatos Oxford Cuero Negro',
                    descripcion: 'Zapatos formales de cuero genuino, suela de goma, perfectos para traje',
                    precio: 89990,
                    stock: 28,
                    id_categoria: categoriasMap.calzado || boutiqueCats[2].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500'
                },
                {
                    nombre: 'Tacones Stiletto Elegantes',
                    descripcion: 'Tacones altos de 10cm, diseño clásico, cómodos y sofisticados',
                    precio: 69990,
                    stock: 20,
                    id_categoria: categoriasMap.calzado || boutiqueCats[2].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'
                },
                {
                    nombre: 'Bolso de Mano Cuero Premium',
                    descripcion: 'Cartera de cuero italiano, múltiples compartimentos, cierre magnético',
                    precio: 129990,
                    stock: 15,
                    id_categoria: categoriasMap.accesorios || boutiqueCats[3].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500'
                },
                {
                    nombre: 'Bufanda de Seda Estampada',
                    descripcion: 'Bufanda ligera de seda con estampado exclusivo, 180x90cm',
                    precio: 24990,
                    stock: 35,
                    id_categoria: categoriasMap.accesorios || boutiqueCats[3].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500'
                },
                {
                    nombre: 'Cinturón Cuero Italiano',
                    descripcion: 'Cinturón de cuero genuino con hebilla plateada, reversible',
                    precio: 34990,
                    stock: 30,
                    id_categoria: categoriasMap.accesorios || boutiqueCats[3].id_categoria,
                    imagen_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583b2?w=500'
                }
            ];

            console.log(`   Insertando ${boutiqueProducts.length} productos de moda...`);
            for (const producto of boutiqueProducts) {
                await db.execute(
                    `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen, id_tenant)
                     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
                    [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.id_categoria, producto.imagen_url, boutiqueId]
                );
                console.log(`   ✅ ${producto.nombre}`);
            }
        }

        // ============================================
        // EL RINCÓN DEL SABOR (Plan Básico)
        // ============================================
        const [rincon] = await db.execute(
            'SELECT id_tenant FROM tenants WHERE slug = ?',
            ['pasteleria-dulce-sabor']
        );

        if (rincon.length > 0) {
            const rinconId = rincon[0].id_tenant;
            console.log(`\n🍰 PASTELERÍA DULCE SABOR (Tenant ID: ${rinconId})`);

            const [rinconCats] = await db.execute(
                'SELECT id_categoria, nombre FROM categorias WHERE id_tenant = ?',
                [rinconId]
            );

            const categoriasMap = {};
            rinconCats.forEach(cat => {
                const nombre = cat.nombre.toLowerCase();
                if (nombre.includes('panadería') || nombre.includes('pan')) categoriasMap.panaderia = cat.id_categoria;
                else if (nombre.includes('bebida')) categoriasMap.bebidas = cat.id_categoria;
                else if (nombre.includes('dulce') || nombre.includes('postre')) categoriasMap.dulces = cat.id_categoria;
                else if (nombre.includes('gourmet') || nombre.includes('delicatessen')) categoriasMap.gourmet = cat.id_categoria;
            });

            // Usar la primera categoría como fallback para todos
            const defaultCat = rinconCats[0].id_categoria;

            const rinconProducts = [
                {
                    nombre: 'Pan Artesanal Masa Madre',
                    descripcion: 'Pan tradicional hecho con masa madre natural, fermentación de 24 horas, corteza crujiente',
                    precio: 4990,
                    stock: 50,
                    id_categoria: categoriasMap.panaderia || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'
                },
                {
                    nombre: 'Croissants de Mantequilla',
                    descripcion: 'Croissants franceses con capas hojaldradas, mantequilla premium, recién horneados',
                    precio: 2990,
                    stock: 45,
                    id_categoria: categoriasMap.panaderia || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500'
                },
                {
                    nombre: 'Café Grano Premium Orgánico',
                    descripcion: 'Café de grano selecto 100% arábica, origen Colombia, tueste medio, 250g',
                    precio: 8990,
                    stock: 35,
                    id_categoria: categoriasMap.bebidas || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500'
                },
                {
                    nombre: 'Brownie de Chocolate Belga',
                    descripcion: 'Brownie húmedo con chocolate belga 70% cacao, nueces pecanas, porción generosa',
                    precio: 3990,
                    stock: 40,
                    id_categoria: categoriasMap.dulces || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500'
                },
                {
                    nombre: 'Tarta de Frutas del Bosque',
                    descripcion: 'Tarta artesanal con frutos rojos frescos, crema pastelera, masa quebrada',
                    precio: 5990,
                    stock: 25,
                    id_categoria: categoriasMap.dulces || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500'
                },
                {
                    nombre: 'Jugos Naturales 500ml',
                    descripcion: 'Jugos recién exprimidos sin azúcar añadida, variedades: naranja, piña, frutilla',
                    precio: 3490,
                    stock: 60,
                    id_categoria: categoriasMap.bebidas || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500'
                },
                {
                    nombre: 'Empanadas Artesanales',
                    descripcion: 'Empanadas horneadas con rellenos caseros: carne, pollo, queso, humita (pack x4)',
                    precio: 6990,
                    stock: 35,
                    id_categoria: categoriasMap.panaderia || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=500'
                },
                {
                    nombre: 'Miel Orgánica Artesanal 500g',
                    descripcion: 'Miel pura de abejas, sin procesar, origen local, tarro de vidrio',
                    precio: 9990,
                    stock: 30,
                    id_categoria: categoriasMap.gourmet || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784176?w=500'
                },
                {
                    nombre: 'Mermelada Casera Frutilla',
                    descripcion: 'Mermelada artesanal con 70% fruta, sin conservantes, 250g',
                    precio: 4990,
                    stock: 28,
                    id_categoria: categoriasMap.gourmet || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1599490875815-2ca87465e5b2?w=500'
                },
                {
                    nombre: 'Galletas de Avena y Miel',
                    descripcion: 'Galletas caseras con avena integral, miel y chips de chocolate, pack x12',
                    precio: 3990,
                    stock: 50,
                    id_categoria: categoriasMap.dulces || defaultCat,
                    imagen_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500'
                }
            ];

            console.log(`   Insertando ${rinconProducts.length} productos de alimentos...`);
            for (const producto of rinconProducts) {
                await db.execute(
                    `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, imagen, id_tenant)
                     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
                    [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.id_categoria, producto.imagen_url, rinconId]
                );
                console.log(`   ✅ ${producto.nombre}`);
            }
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║         ✅ PRODUCTOS DEMO INSERTADOS EXITOSAMENTE    ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Error al insertar productos demo:', error);
    } finally {
        await db.end();
    }
}

// Ejecutar el seed
seedDemoProducts();
