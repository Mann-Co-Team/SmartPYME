const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarTablas() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar clientes en tabla USUARIOS (rol 3)
        const [clientesUsuarios] = await connection.execute(`
            SELECT 
                u.id_usuario,
                u.id_tenant,
                u.nombre,
                u.email,
                t.nombre_empresa as tienda,
                t.slug
            FROM usuarios u
            LEFT JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 3
            ORDER BY u.id_tenant, u.nombre
        `);

        console.log('📊 CLIENTES EN TABLA "usuarios" (rol = 3):');
        console.log(`Total: ${clientesUsuarios.length}\n`);
        
        const clientesPorTenant = {};
        clientesUsuarios.forEach(c => {
            if (!clientesPorTenant[c.slug]) {
                clientesPorTenant[c.slug] = [];
            }
            clientesPorTenant[c.slug].push(c);
        });

        Object.keys(clientesPorTenant).forEach(slug => {
            console.log(`🏪 ${slug}:`);
            clientesPorTenant[slug].forEach(c => {
                console.log(`   - ${c.nombre} (${c.email})`);
            });
            console.log('');
        });

        // Verificar clientes en tabla CLIENTES
        const [clientesTabla] = await connection.execute(`
            SELECT 
                c.id_cliente,
                c.id_tenant,
                c.nombre,
                c.email,
                t.nombre_empresa as tienda,
                t.slug
            FROM clientes c
            LEFT JOIN tenants t ON c.id_tenant = t.id_tenant
            ORDER BY c.id_tenant, c.nombre
        `);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📊 CLIENTES EN TABLA "clientes":');
        console.log(`Total: ${clientesTabla.length}\n`);
        
        if (clientesTabla.length > 0) {
            const clientesPorTenant2 = {};
            clientesTabla.forEach(c => {
                if (!clientesPorTenant2[c.slug]) {
                    clientesPorTenant2[c.slug] = [];
                }
                clientesPorTenant2[c.slug].push(c);
            });

            Object.keys(clientesPorTenant2).forEach(slug => {
                console.log(`🏪 ${slug}:`);
                clientesPorTenant2[slug].forEach(c => {
                    console.log(`   - ${c.nombre} (${c.email})`);
                });
                console.log('');
            });
        } else {
            console.log('⚠️  No hay datos en la tabla "clientes"\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('📝 RESUMEN:');
        console.log(`   - Clientes en "usuarios": ${clientesUsuarios.length}`);
        console.log(`   - Clientes en "clientes": ${clientesTabla.length}`);
        console.log('\n💡 RECOMENDACIÓN:');
        if (clientesTabla.length === 0 && clientesUsuarios.length > 0) {
            console.log('   ⚠️  Se están usando USUARIOS pero el frontend espera CLIENTES');
            console.log('   ⚠️  Necesitas migrar datos o cambiar el frontend');
        } else if (clientesTabla.length > 0 && clientesUsuarios.length > 0) {
            console.log('   ⚠️  HAY DATOS EN AMBAS TABLAS - ¡Inconsistencia!');
        } else if (clientesTabla.length > 0) {
            console.log('   ✅ Sistema usando tabla "clientes" correctamente');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

verificarTablas();
