const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedTenants() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║         SEED DE TENANTS DE PRUEBA - SmartPYME       ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        // Datos de los 3 tenants de prueba
        const tenants = [
            {
                nombre_empresa: 'Tienda ABC',
                slug: 'tienda-abc',
                email_empresa: 'contacto@tienda-abc.com',
                plan: 'profesional',
                max_usuarios: 50,
                max_productos: 1000,
                admin: {
                    nombre: 'Admin Tienda ABC',
                    email: 'admin@tienda-abc.com',
                    password: 'Admin123!'
                },
                categorias: ['Electrónica', 'Hogar', 'Deportes', 'Moda', 'Juguetes'],
                productos_count: 10
            },
            {
                nombre_empresa: 'Comercial XYZ',
                slug: 'comercial-xyz',
                email_empresa: 'contacto@comercial-xyz.com',
                plan: 'basico',
                max_usuarios: 10,
                max_productos: 100,
                admin: {
                    nombre: 'Admin Comercial XYZ',
                    email: 'admin@comercial-xyz.com',
                    password: 'Admin123!'
                },
                categorias: ['Alimentos', 'Bebidas', 'Limpieza'],
                productos_count: 5
            },
            {
                nombre_empresa: 'Megatienda 2000',
                slug: 'megatienda-2000',
                email_empresa: 'contacto@megatienda.com',
                plan: 'empresarial',
                max_usuarios: 100,
                max_productos: 5000,
                admin: {
                    nombre: 'Admin Megatienda',
                    email: 'admin@megatienda.com',
                    password: 'Admin123!'
                },
                categorias: ['Tecnología', 'Ropa', 'Calzado', 'Accesorios', 'Muebles', 'Decoración', 'Jardín', 'Mascotas'],
                productos_count: 20
            }
        ];

        for (const tenantData of tenants) {
            console.log(`\n🏢 Creando tenant: ${tenantData.nombre_empresa} (${tenantData.slug})`);
            
            // Verificar si ya existe
            const [existing] = await db.execute(
                'SELECT id_tenant FROM tenants WHERE slug = ?',
                [tenantData.slug]
            );

            if (existing.length > 0) {
                console.log(`   ⚠️  Tenant "${tenantData.slug}" ya existe, omitiendo...`);
                continue;
            }

            // 1. Crear tenant
            const [tenantResult] = await db.execute(
                `INSERT INTO tenants (nombre_empresa, slug, email_empresa, plan, max_usuarios, max_productos, activo) 
                 VALUES (?, ?, ?, ?, ?, ?, true)`,
                [tenantData.nombre_empresa, tenantData.slug, tenantData.email_empresa, tenantData.plan, tenantData.max_usuarios, tenantData.max_productos]
            );

            const tenantId = tenantResult.insertId;
            console.log(`   ✅ Tenant creado con ID: ${tenantId}`);

            // 2. Crear usuario administrador
            const hashedPassword = await bcrypt.hash(tenantData.admin.password, 10);
            const [adminResult] = await db.execute(
                `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, id_tenant, activo) 
                 VALUES (?, ?, ?, ?, 1, ?, true)`,
                [tenantData.admin.nombre, 'Admin', tenantData.admin.email, hashedPassword, tenantId]
            );

            console.log(`   ✅ Usuario admin creado: ${tenantData.admin.email}`);

            // 3. Crear categorías
            console.log(`   📁 Creando ${tenantData.categorias.length} categorías...`);
            const categoriaIds = [];
            for (const categoriaNombre of tenantData.categorias) {
                const nombreUnico = `${categoriaNombre} - ${tenantData.slug}`;
                const [catResult] = await db.execute(
                    `INSERT INTO categorias (nombre, descripcion, activo, id_tenant) 
                     VALUES (?, ?, true, ?)`,
                    [nombreUnico, `Categoría de ${categoriaNombre}`, tenantId]
                );
                categoriaIds.push(catResult.insertId);
            }
            console.log(`   ✅ ${categoriaIds.length} categorías creadas`);

            // 4. Crear productos
            console.log(`   📦 Creando ${tenantData.productos_count} productos...`);
            for (let i = 1; i <= tenantData.productos_count; i++) {
                const randomCatId = categoriaIds[Math.floor(Math.random() * categoriaIds.length)];
                const precio = (Math.random() * 1000 + 10).toFixed(2);
                const stock = Math.floor(Math.random() * 100) + 5;

                await db.execute(
                    `INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, activo, id_tenant) 
                     VALUES (?, ?, ?, ?, ?, true, ?)`,
                    [
                        `Producto ${i} - ${tenantData.nombre_empresa}`,
                        `Descripción del producto ${i}`,
                        precio,
                        stock,
                        randomCatId,
                        tenantId
                    ]
                );
            }
            console.log(`   ✅ ${tenantData.productos_count} productos creados`);

            // 5. Crear 2 usuarios adicionales (vendedor y cliente)
            const vendedorPassword = await bcrypt.hash('Vendedor123!', 10);
            await db.execute(
                `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, id_tenant, activo) 
                 VALUES (?, ?, ?, ?, 2, ?, true)`,
                [`Vendedor`, tenantData.nombre_empresa, `vendedor@${tenantData.slug}.com`, vendedorPassword, tenantId]
            );

            const clientePassword = await bcrypt.hash('Cliente123!', 10);
            await db.execute(
                `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, id_tenant, activo) 
                 VALUES (?, ?, ?, ?, 3, ?, true)`,
                [`Cliente`, tenantData.nombre_empresa, `cliente@${tenantData.slug}.com`, clientePassword, tenantId]
            );

            console.log(`   ✅ Usuarios adicionales creados (vendedor y cliente)`);

            console.log(`\n   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`   📊 RESUMEN DE ${tenantData.nombre_empresa.toUpperCase()}`);
            console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`   🏢 Empresa: ${tenantData.nombre_empresa}`);
            console.log(`   🔑 Slug: ${tenantData.slug}`);
            console.log(`   📋 Plan: ${tenantData.plan}`);
            console.log(`   👥 Usuarios creados: 3 (admin, vendedor, cliente)`);
            console.log(`   📁 Categorías: ${categoriaIds.length}`);
            console.log(`   📦 Productos: ${tenantData.productos_count}`);
            console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`   🔐 CREDENCIALES:`);
            console.log(`      Admin: ${tenantData.admin.email} / ${tenantData.admin.password}`);
            console.log(`      Vendedor: vendedor@${tenantData.slug}.com / Vendedor123!`);
            console.log(`      Cliente: cliente@${tenantData.slug}.com / Cliente123!`);
            console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            ✅ SEED COMPLETADO EXITOSAMENTE           ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        console.log('📝 RESUMEN GENERAL:\n');
        const [tenantsCount] = await db.execute('SELECT COUNT(*) as total FROM tenants');
        const [usersCount] = await db.execute('SELECT COUNT(*) as total FROM usuarios');
        const [categoriasCount] = await db.execute('SELECT COUNT(*) as total FROM categorias');
        const [productosCount] = await db.execute('SELECT COUNT(*) as total FROM productos');

        console.log(`   🏢 Total tenants: ${tenantsCount[0].total}`);
        console.log(`   👥 Total usuarios: ${usersCount[0].total}`);
        console.log(`   📁 Total categorías: ${categoriasCount[0].total}`);
        console.log(`   📦 Total productos: ${productosCount[0].total}\n`);

        console.log('🎯 CÓMO PROBAR:\n');
        console.log('   1. Inicia sesión en http://localhost:5173/admin/login');
        console.log('   2. Usa cualquiera de las credenciales mostradas arriba');
        console.log('   3. Ingresa el tenant_slug correspondiente\n');
        console.log('   Ejemplo:');
        console.log('   - Email: admin@tienda-abc.com');
        console.log('   - Password: Admin123!');
        console.log('   - Tenant: tienda-abc\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR EN SEED:', error.message);
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar seed
seedTenants();
