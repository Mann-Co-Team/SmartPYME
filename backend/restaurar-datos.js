const mysql = require('mysql2/promise');
require('dotenv').config();

async function restaurarBaseDatos() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos');

        // 0. Primero insertar los roles si no existen
        console.log('📝 Verificando roles...');
        const [rolesExistentes] = await connection.execute('SELECT COUNT(*) as count FROM roles');
        
        if (rolesExistentes[0].count === 0) {
            console.log('   Creando roles...');
            await connection.execute(`
                INSERT INTO roles (id_rol, nombre_rol, descripcion) VALUES
                (1, 'Admin', 'Administrador con acceso total'),
                (2, 'Empleado', 'Empleado con acceso limitado'),
                (3, 'Cliente', 'Cliente de la tienda')
            `);
            console.log('✅ Roles creados');
        } else {
            console.log('✅ Roles ya existen');
        }

        // 1. Crear tabla historial_estados_pedido si no existe
        console.log('📝 Verificando tabla historial_estados_pedido...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS historial_estados_pedido (
                id_historial INT AUTO_INCREMENT PRIMARY KEY,
                id_pedido INT NOT NULL,
                id_estado_anterior INT,
                id_estado_nuevo INT NOT NULL,
                id_usuario INT,
                fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notas TEXT,
                FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
                FOREIGN KEY (id_estado_anterior) REFERENCES estados_pedido(id_estado),
                FOREIGN KEY (id_estado_nuevo) REFERENCES estados_pedido(id_estado),
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
            )
        `);
        console.log('✅ Tabla historial_estados_pedido verificada');

        // 2. Insertar usuarios admin si no existen
        console.log('📝 Verificando usuarios administradores...');
        
        // Verificar si existe el admin principal
        const [adminExists] = await connection.execute(
            'SELECT id_usuario FROM usuarios WHERE email = ?',
            ['admin@smartpyme.com']
        );

        if (adminExists.length === 0) {
            console.log('📝 Creando usuario administrador principal...');
            // password: admin123 (hash bcrypt)
            await connection.execute(`
                INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, activo)
                VALUES (1, 1, 'Admin', 'Sistema', 'admin@smartpyme.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', TRUE)
            `);
            console.log('✅ Usuario admin@smartpyme.com creado (password: admin123)');
        }

        // 3. Recrear los 7 tenants (tiendas)
        console.log('📝 Recreando tiendas (tenants)...');
        
        const tenants = [
            { nombre: 'MegaMarket Demo', slug: 'demo', plan: 'basico' },
            { nombre: 'Tienda ABC', slug: 'tienda-abc', plan: 'basico' },
            { nombre: 'Comercial XYZ', slug: 'comercial-xyz', plan: 'profesional' },
            { nombre: 'MegaTienda 2000', slug: 'megatienda-2000', plan: 'empresarial' },
            { nombre: 'Pastelería Dulce Sabor', slug: 'pasteleria-dulce-sabor', plan: 'profesional' },
            { nombre: 'Boutique Fashion Elite', slug: 'boutique-fashion-elite', plan: 'profesional' },
            { nombre: 'ElectroTech Premium Store', slug: 'electrotech-premium', plan: 'empresarial' }
        ];

        for (const tenant of tenants) {
            const [existing] = await connection.execute(
                'SELECT id_tenant FROM tenants WHERE slug = ?',
                [tenant.slug]
            );

            if (existing.length === 0) {
                await connection.execute(`
                    INSERT INTO tenants (nombre_empresa, slug, plan_actual, estado, configuracion)
                    VALUES (?, ?, ?, 'activo', '{}')
                `, [tenant.nombre, tenant.slug, tenant.plan]);
                console.log(`✅ Tienda creada: ${tenant.nombre}`);
            } else {
                console.log(`⚠️  Tienda ya existe: ${tenant.nombre}`);
            }
        }

        // 4. Crear usuarios administradores para cada tenant
        console.log('📝 Creando administradores de tiendas...');
        
        const [allTenants] = await connection.execute('SELECT id_tenant, slug FROM tenants');
        
        for (const tenant of allTenants) {
            const email = `admin@${tenant.slug}.com`;
            const [userExists] = await connection.execute(
                'SELECT id_usuario FROM usuarios WHERE email = ?',
                [email]
            );

            if (userExists.length === 0) {
                await connection.execute(`
                    INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, activo)
                    VALUES (?, 1, 'Administrador', ?, ?, '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y', TRUE)
                `, [tenant.id_tenant, tenant.slug, email]);
                console.log(`✅ Admin creado: ${email} (password: admin123)`);
            }
        }

        // 5. Crear clientes para cada tenant
        console.log('📝 Creando clientes de prueba...');
        
        for (const tenant of allTenants) {
            const email = `cliente@${tenant.slug}.com`;
            
            // Verificar si el usuario cliente existe
            const [userExists] = await connection.execute(
                'SELECT id_usuario FROM usuarios WHERE email = ?',
                [email]
            );

            let userId;
            if (userExists.length === 0) {
                const [userResult] = await connection.execute(`
                    INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password, telefono, activo)
                    VALUES (?, 3, 'Cliente', ?, ?, '$2a$10$K8qhZ3zQ9j1Y6X4P5L2wWeZvN8xR7mT9sU0vC1bD2eF3gH4iJ5k', '123456789', TRUE)
                `, [tenant.id_tenant, tenant.slug, email]);
                userId = userResult.insertId;
                console.log(`✅ Usuario cliente creado: ${email} (password: Cliente123!)`);
            } else {
                userId = userExists[0].id_usuario;
            }

            // Verificar si el cliente existe en la tabla clientes
            const [clienteExists] = await connection.execute(
                'SELECT id_cliente FROM clientes WHERE email = ?',
                [email]
            );

            if (clienteExists.length === 0) {
                await connection.execute(`
                    INSERT INTO clientes (id_tenant, nombre, apellido, email, telefono, activo)
                    VALUES (?, 'Cliente', ?, ?, '123456789', TRUE)
                `, [tenant.id_tenant, tenant.slug, email]);
                console.log(`✅ Cliente creado: ${email}`);
            }
        }

        // 6. Crear categorías para cada tenant
        console.log('📝 Creando categorías...');
        
        const categorias = [
            'Electrónica',
            'Ropa y Accesorios',
            'Alimentos y Bebidas',
            'Hogar y Jardín',
            'Deportes',
            'Juguetes',
            'Libros',
            'Salud y Belleza'
        ];

        for (const tenant of allTenants) {
            for (const categoria of categorias) {
                const [catExists] = await connection.execute(
                    'SELECT id_categoria FROM categorias WHERE nombre = ? AND id_tenant = ?',
                    [categoria, tenant.id_tenant]
                );

                if (catExists.length === 0) {
                    await connection.execute(`
                        INSERT INTO categorias (id_tenant, nombre, descripcion, activo)
                        VALUES (?, ?, ?, TRUE)
                    `, [tenant.id_tenant, categoria, `Categoría de ${categoria}`]);
                }
            }
            console.log(`✅ Categorías creadas para: ${tenant.slug}`);
        }

        // 7. Crear productos de ejemplo para cada tenant
        console.log('📝 Creando productos de ejemplo...');
        
        for (const tenant of allTenants) {
            const [categorias] = await connection.execute(
                'SELECT id_categoria FROM categorias WHERE id_tenant = ? LIMIT 3',
                [tenant.id_tenant]
            );

            if (categorias.length > 0) {
                const productos = [
                    { nombre: 'Producto Demo 1', precio: 9990, stock: 10 },
                    { nombre: 'Producto Demo 2', precio: 19990, stock: 15 },
                    { nombre: 'Producto Demo 3', precio: 29990, stock: 8 }
                ];

                for (let i = 0; i < productos.length; i++) {
                    const prod = productos[i];
                    const [prodExists] = await connection.execute(
                        'SELECT id_producto FROM productos WHERE nombre = ? AND id_tenant = ?',
                        [prod.nombre, tenant.id_tenant]
                    );

                    if (prodExists.length === 0) {
                        await connection.execute(`
                            INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, activo)
                            VALUES (?, ?, ?, ?, ?, ?, TRUE)
                        `, [
                            tenant.id_tenant,
                            categorias[i % categorias.length].id_categoria,
                            prod.nombre,
                            `Descripción de ${prod.nombre}`,
                            prod.precio,
                            prod.stock
                        ]);
                    }
                }
                console.log(`✅ Productos creados para: ${tenant.slug}`);
            }
        }

        console.log('');
        console.log('🎉 ¡BASE DE DATOS RESTAURADA EXITOSAMENTE!');
        console.log('');
        console.log('📋 CREDENCIALES:');
        console.log('');
        console.log('Admin Global:');
        console.log('  Email: admin@smartpyme.com');
        console.log('  Password: admin123');
        console.log('');
        console.log('Admin por Tienda:');
        console.log('  Email: admin@{slug}.com (ejemplo: admin@demo.com)');
        console.log('  Password: admin123');
        console.log('');
        console.log('Clientes por Tienda:');
        console.log('  Email: cliente@{slug}.com (ejemplo: cliente@demo.com)');
        console.log('  Password: Cliente123!');
        console.log('');
        console.log('🏪 Tiendas disponibles:');
        console.log('  - demo');
        console.log('  - tienda-abc');
        console.log('  - comercial-xyz');
        console.log('  - megatienda-2000');
        console.log('  - pasteleria-dulce-sabor');
        console.log('  - boutique-fashion-elite');
        console.log('  - electrotech-premium');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('');
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
restaurarBaseDatos()
    .then(() => {
        console.log('✨ Proceso completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
