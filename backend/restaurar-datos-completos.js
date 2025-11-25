const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function restaurarDatosCompletos() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // 1. Verificar tenants existentes
        console.log('📋 Verificando tiendas...');
        const [tenants] = await connection.execute('SELECT id_tenant, slug, nombre_empresa, plan FROM tenants ORDER BY slug');
        
        console.log(`✅ ${tenants.length} tiendas encontradas:`);
        tenants.forEach(t => {
            console.log(`   - ${t.slug} (${t.plan}) - ${t.nombre_empresa}`);
        });
        console.log('');

        // 2. Limpiar datos anteriores (excepto admin principal)
        console.log('🧹 Limpiando datos anteriores...');
        await connection.execute('DELETE FROM clientes WHERE id_tenant > 0');
        await connection.execute('DELETE FROM productos WHERE id_tenant > 0');
        await connection.execute('DELETE FROM usuarios WHERE email != "admin@smartpyme.com"');
        console.log('✅ Datos anteriores limpiados\n');

        // 3. Restaurar usuarios por tienda según plan
        console.log('👥 Restaurando usuarios por tienda...\n');

        for (const tenant of tenants) {
            console.log(`📦 Tienda: ${tenant.nombre_empresa} (${tenant.plan})`);
            
            // Hash de contraseñas
            const adminHash = await bcrypt.hash('admin123', 10);
            const empleadoHash = await bcrypt.hash('empleado123', 10);
            const clienteHash = await bcrypt.hash('Cliente123!', 10);

            // Crear admin de la tienda
            await connection.execute(`
                INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, activo)
                VALUES (?, 1, ?, ?, ?, ?, TRUE)
            `, [tenant.id_tenant, 'Admin', tenant.slug, `admin@${tenant.slug}.com`, adminHash]);
            console.log(`   ✅ Admin: admin@${tenant.slug}.com`);

            // Crear empleados según el plan
            let numEmpleados = 0;
            if (tenant.plan === 'basico') numEmpleados = 1;
            else if (tenant.plan === 'profesional') numEmpleados = 3;
            else if (tenant.plan === 'empresarial') numEmpleados = 5;

            for (let i = 1; i <= numEmpleados; i++) {
                await connection.execute(`
                    INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, activo)
                    VALUES (?, 2, ?, ?, ?, ?, TRUE)
                `, [
                    tenant.id_tenant, 
                    `Empleado${i}`,
                    tenant.slug,
                    `empleado${i}@${tenant.slug}.com`,
                    empleadoHash
                ]);
            }
            console.log(`   ✅ ${numEmpleados} empleado(s) creado(s)`);

            // Crear clientes según el plan
            let numClientes = 0;
            if (tenant.plan === 'basico') numClientes = 2;
            else if (tenant.plan === 'profesional') numClientes = 5;
            else if (tenant.plan === 'empresarial') numClientes = 10;

            for (let i = 1; i <= numClientes; i++) {
                // Crear usuario cliente
                await connection.execute(`
                    INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo)
                    VALUES (?, 3, ?, ?, ?, ?, ?, TRUE)
                `, [
                    tenant.id_tenant,
                    `Cliente${i}`,
                    tenant.slug,
                    `cliente${i}@${tenant.slug}.com`,
                    clienteHash,
                    `+58-412-${1000000 + i}`
                ]);

                // Crear registro en tabla clientes (sin id_usuario, con apellido)
                await connection.execute(`
                    INSERT INTO clientes (id_tenant, nombre, apellido, email, telefono, direccion, activo)
                    VALUES (?, ?, ?, ?, ?, ?, TRUE)
                `, [
                    tenant.id_tenant,
                    `Cliente${i}`,
                    tenant.slug,
                    `cliente${i}@${tenant.slug}.com`,
                    `+58-412-${1000000 + i}`,
                    `Dirección ${i}, ${tenant.nombre_empresa}`
                ]);
            }
            console.log(`   ✅ ${numClientes} cliente(s) creado(s)\n`);
        }

        // 4. Restaurar productos por tienda según el plan
        console.log('📦 Restaurando productos por tienda...\n');

        const productosBase = {
            'demo': [
                { nombre: 'Laptop HP 15"', precio: 799.99, stock: 15, descripcion: 'Laptop HP 15 pulgadas, Intel Core i5, 8GB RAM, 256GB SSD' },
                { nombre: 'Mouse Logitech', precio: 29.99, stock: 50, descripcion: 'Mouse inalámbrico Logitech MX Master 3' },
                { nombre: 'Teclado Mecánico', precio: 89.99, stock: 30, descripcion: 'Teclado mecánico RGB con switches Cherry MX' },
                { nombre: 'Monitor 24" Samsung', precio: 249.99, stock: 20, descripcion: 'Monitor Full HD 24 pulgadas Samsung' },
                { nombre: 'Webcam Logitech C920', precio: 79.99, stock: 25, descripcion: 'Webcam Full HD 1080p' }
            ],
            'tienda-abc': [
                { nombre: 'Camisa Polo', precio: 29.99, stock: 40, descripcion: 'Camisa polo de algodón, varios colores' },
                { nombre: 'Pantalón Jeans', precio: 49.99, stock: 35, descripcion: 'Pantalón jeans azul clásico' },
                { nombre: 'Zapatos Deportivos', precio: 79.99, stock: 25, descripcion: 'Zapatos deportivos para running' }
            ],
            'comercial-xyz': [
                { nombre: 'Arroz 1Kg', precio: 2.50, stock: 100, descripcion: 'Arroz blanco grano largo premium' },
                { nombre: 'Aceite Vegetal 1L', precio: 4.99, stock: 80, descripcion: 'Aceite vegetal 100% puro' },
                { nombre: 'Azúcar 1Kg', precio: 1.99, stock: 90, descripcion: 'Azúcar refinada blanca' },
                { nombre: 'Pasta 500g', precio: 1.49, stock: 120, descripcion: 'Pasta italiana tipo spaghetti' },
                { nombre: 'Leche 1L', precio: 3.49, stock: 60, descripcion: 'Leche entera ultra pasteurizada' }
            ],
            'megatienda-2000': [
                { nombre: 'TV Samsung 55"', precio: 599.99, stock: 10, descripcion: 'Smart TV 4K UHD 55 pulgadas' },
                { nombre: 'Refrigerador LG', precio: 899.99, stock: 5, descripcion: 'Refrigerador side by side 25 pies' },
                { nombre: 'Lavadora Samsung', precio: 549.99, stock: 8, descripcion: 'Lavadora automática 18 kg' },
                { nombre: 'Microondas Panasonic', precio: 149.99, stock: 15, descripcion: 'Microondas 1.2 cu ft' },
                { nombre: 'Licuadora Oster', precio: 79.99, stock: 25, descripcion: 'Licuadora de alta potencia' },
                { nombre: 'Plancha Black+Decker', precio: 39.99, stock: 30, descripcion: 'Plancha de vapor automática' },
                { nombre: 'Aspiradora Electrolux', precio: 199.99, stock: 12, descripcion: 'Aspiradora vertical sin bolsa' }
            ],
            'pasteleria-dulce-sabor': [
                { nombre: 'Torta Chocolate', precio: 35.00, stock: 5, descripcion: 'Torta de chocolate 3 pisos' },
                { nombre: 'Cupcakes x6', precio: 12.00, stock: 20, descripcion: 'Set de 6 cupcakes surtidos' },
                { nombre: 'Galletas x12', precio: 8.00, stock: 30, descripcion: 'Docena de galletas artesanales' },
                { nombre: 'Pie de Limón', precio: 18.00, stock: 8, descripcion: 'Pie de limón tradicional' },
                { nombre: 'Brownies x4', precio: 10.00, stock: 15, descripcion: 'Brownies de chocolate con nueces' }
            ],
            'boutique-fashion-elite': [
                { nombre: 'Vestido Formal', precio: 159.99, stock: 15, descripcion: 'Vestido formal elegante' },
                { nombre: 'Blazer Ejecutivo', precio: 189.99, stock: 12, descripcion: 'Blazer de corte italiano' },
                { nombre: 'Blusa Seda', precio: 79.99, stock: 20, descripcion: 'Blusa de seda natural' },
                { nombre: 'Falda Midi', precio: 69.99, stock: 18, descripcion: 'Falda midi plisada' },
                { nombre: 'Pantalón Palazzo', precio: 89.99, stock: 16, descripcion: 'Pantalón palazzo de lino' },
                { nombre: 'Zapatos Tacón', precio: 129.99, stock: 10, descripcion: 'Zapatos de tacón alto elegantes' }
            ],
            'electrotech-premium': [
                { nombre: 'iPhone 15 Pro', precio: 1199.99, stock: 8, descripcion: 'iPhone 15 Pro Max 256GB' },
                { nombre: 'MacBook Pro 14"', precio: 1999.99, stock: 5, descripcion: 'MacBook Pro M3 14 pulgadas' },
                { nombre: 'iPad Air', precio: 599.99, stock: 12, descripcion: 'iPad Air 11 pulgadas 128GB' },
                { nombre: 'AirPods Pro', precio: 249.99, stock: 20, descripcion: 'AirPods Pro 2da generación' },
                { nombre: 'Apple Watch Ultra', precio: 799.99, stock: 6, descripcion: 'Apple Watch Ultra 2' },
                { nombre: 'PS5 Digital', precio: 449.99, stock: 10, descripcion: 'PlayStation 5 Edición Digital' },
                { nombre: 'Xbox Series X', precio: 499.99, stock: 8, descripcion: 'Xbox Series X 1TB' },
                { nombre: 'Nintendo Switch OLED', precio: 349.99, stock: 15, descripcion: 'Nintendo Switch modelo OLED' }
            ]
        };

        for (const tenant of tenants) {
            const productos = productosBase[tenant.slug] || [];
            
            if (productos.length === 0) {
                console.log(`⚠️  ${tenant.slug}: Sin productos definidos\n`);
                continue;
            }

            // Obtener primera categoría de la tienda
            const [categorias] = await connection.execute(
                'SELECT id_categoria FROM categorias WHERE id_tenant = ? LIMIT 1',
                [tenant.id_tenant]
            );

            if (categorias.length === 0) {
                console.log(`⚠️  ${tenant.slug}: Sin categorías\n`);
                continue;
            }

            const idCategoria = categorias[0].id_categoria;

            for (const prod of productos) {
                await connection.execute(`
                    INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo)
                    VALUES (?, ?, ?, ?, ?, ?, TRUE)
                `, [tenant.id_tenant, idCategoria, prod.nombre, prod.descripcion, prod.precio, prod.stock]);
            }

            console.log(`✅ ${tenant.slug}: ${productos.length} productos restaurados`);
        }

        console.log('\n');

        // 5. Resumen final
        console.log('📊 RESUMEN FINAL\n');
        
        const [countUsuarios] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
        const [countClientes] = await connection.execute('SELECT COUNT(*) as count FROM clientes');
        const [countProductos] = await connection.execute('SELECT COUNT(*) as count FROM productos');
        
        console.log(`Usuarios: ${countUsuarios[0].count}`);
        console.log(`Clientes: ${countClientes[0].count}`);
        console.log(`Productos: ${countProductos[0].count}`);
        console.log('');

        // Desglose por tienda
        console.log('📋 DESGLOSE POR TIENDA:\n');
        for (const tenant of tenants) {
            const [usuarios] = await connection.execute(
                'SELECT COUNT(*) as count, id_rol FROM usuarios WHERE id_tenant = ? GROUP BY id_rol',
                [tenant.id_tenant]
            );
            
            const [productos] = await connection.execute(
                'SELECT COUNT(*) as count FROM productos WHERE id_tenant = ?',
                [tenant.id_tenant]
            );

            const [clientes] = await connection.execute(
                'SELECT COUNT(*) as count FROM clientes WHERE id_tenant = ?',
                [tenant.id_tenant]
            );

            console.log(`${tenant.slug} (${tenant.plan}):`);
            usuarios.forEach(u => {
                const rol = u.id_rol === 1 ? 'Admins' : u.id_rol === 2 ? 'Empleados' : 'Usuarios Cliente';
                console.log(`  - ${rol}: ${u.count}`);
            });
            console.log(`  - Clientes en tabla: ${clientes[0].count}`);
            console.log(`  - Productos: ${productos[0].count}`);
            console.log('');
        }

        console.log('✅ RESTAURACIÓN COMPLETA EXITOSA\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

restaurarDatosCompletos();
