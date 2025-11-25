const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function cleanAndReseed() {
    console.log('🧹 LIMPIANDO Y REGENERANDO DATOS...\n');

    try {
        // 1. Limpiar datos existentes (excepto tenant demo)
        console.log('1️⃣ Limpiando productos, categorías y pedidos...');
        
        await db.execute('DELETE FROM detalle_pedidos WHERE id_pedido IN (SELECT id_pedido FROM pedidos WHERE id_tenant != 1)');
        await db.execute('DELETE FROM pedidos WHERE id_tenant != 1');
        await db.execute('DELETE FROM productos WHERE id_tenant != 1');
        await db.execute('DELETE FROM categorias WHERE id_tenant != 1');
        
        console.log('   ✅ Datos antiguos eliminados\n');

        // 2. Obtener tenants activos (excepto demo)
        const [tenants] = await db.execute('SELECT * FROM tenants WHERE id_tenant != 1 ORDER BY id_tenant');
        
        if (tenants.length === 0) {
            console.log('❌ No hay tenants para regenerar datos');
            process.exit(0);
        }

        console.log(`2️⃣ Regenerando datos para ${tenants.length} tenants...\n`);

        // 3. Definir categorías únicas por tenant
        const categoriasPorTenant = {
            'tienda-abc': [
                'Productos de Limpieza ABC',
                'Cuidado Personal ABC',
                'Decoración ABC',
                'Cocina ABC',
                'Baño ABC'
            ],
            'comercial-xyz': [
                'Electrónica XYZ',
                'Hogar XYZ',
                'Deportes XYZ',
                'Oficina XYZ',
                'Accesorios XYZ'
            ],
            'megatienda-2000': [
                'Tecnología M2000',
                'Ropa y Moda M2000',
                'Alimentos M2000',
                'Juguetes M2000',
                'Libros M2000',
                'Ferretería M2000',
                'Jardín M2000',
                'Mascotas M2000'
            ]
        };

        // 4. Generar datos por tenant
        for (const tenant of tenants) {
            console.log(`\n═══════════════════════════════════════════════════`);
            console.log(`🏢 TENANT: ${tenant.nombre_empresa.toUpperCase()}`);
            console.log(`═══════════════════════════════════════════════════`);

            const categorias = categoriasPorTenant[tenant.slug] || ['Productos Generales'];
            const numProductos = tenant.slug === 'megatienda-2000' ? 25 : 
                                tenant.slug === 'comercial-xyz' ? 10 : 8;

            // Insertar categorías
            console.log(`\n   📁 Creando ${categorias.length} categorías...`);
            const categoriaIds = [];
            
            for (const nombreCategoria of categorias) {
                const [result] = await db.execute(
                    'INSERT INTO categorias (id_tenant, nombre, descripcion) VALUES (?, ?, ?)',
                    [tenant.id_tenant, nombreCategoria, `Categoría de ${nombreCategoria.toLowerCase()}`]
                );
                categoriaIds.push(result.insertId);
                console.log(`      ✓ ${nombreCategoria}`);
            }

            // Insertar productos
            console.log(`\n   📦 Creando ${numProductos} productos...`);
            
            for (let i = 1; i <= numProductos; i++) {
                const categoriaId = categoriaIds[Math.floor(Math.random() * categoriaIds.length)];
                const precio = (Math.random() * 900 + 100).toFixed(2);
                const stock = Math.floor(Math.random() * 100) + 10;
                
                await db.execute(
                    `INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo) 
                     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
                    [
                        tenant.id_tenant,
                        categoriaId,
                        `Producto ${i} - ${tenant.nombre_empresa}`,
                        `Descripción del producto ${i} de ${tenant.nombre_empresa}`,
                        precio,
                        stock
                    ]
                );
            }
            console.log(`      ✓ ${numProductos} productos creados`);

            // Resumen
            const [countProds] = await db.execute(
                'SELECT COUNT(*) as total FROM productos WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            const [countCats] = await db.execute(
                'SELECT COUNT(*) as total FROM categorias WHERE id_tenant = ?',
                [tenant.id_tenant]
            );

            console.log(`\n   📊 Resumen:`);
            console.log(`      • Categorías: ${countCats[0].total}`);
            console.log(`      • Productos: ${countProds[0].total}`);
        }

        console.log('\n\n╔══════════════════════════════════════════════════════╗');
        console.log('║          ✅ REGENERACIÓN COMPLETADA                 ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        // Resumen final
        const [summary] = await db.execute(`
            SELECT 
                t.nombre_empresa,
                t.slug,
                COUNT(DISTINCT c.id_categoria) as categorias,
                COUNT(DISTINCT p.id_producto) as productos
            FROM tenants t
            LEFT JOIN categorias c ON t.id_tenant = c.id_tenant
            LEFT JOIN productos p ON t.id_tenant = p.id_tenant
            WHERE t.id_tenant != 1
            GROUP BY t.id_tenant
            ORDER BY t.id_tenant
        `);

        console.log('📋 RESUMEN POR TENANT:\n');
        console.log('┌─────────────────────┬──────────────┬────────────┬───────────┐');
        console.log('│ Empresa             │ Slug         │ Categorías │ Productos │');
        console.log('├─────────────────────┼──────────────┼────────────┼───────────┤');
        
        summary.forEach(row => {
            const empresa = row.nombre_empresa.padEnd(19).substring(0, 19);
            const slug = row.slug.padEnd(12).substring(0, 12);
            const cats = String(row.categorias).padStart(10);
            const prods = String(row.productos).padStart(9);
            console.log(`│ ${empresa} │ ${slug} │${cats}  │${prods}  │`);
        });
        
        console.log('└─────────────────────┴──────────────┴────────────┴───────────┘\n');

        console.log('🎯 CREDENCIALES DE PRUEBA:\n');
        summary.forEach(row => {
            console.log(`   🏢 ${row.nombre_empresa}`);
            console.log(`      Email: admin@${row.slug.replace(/-/g, '')}.com`);
            console.log(`      Password: Admin123!`);
            console.log(`      Tenant: ${row.slug}\n`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanAndReseed();
