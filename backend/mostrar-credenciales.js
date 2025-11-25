const mysql = require('mysql2/promise');
require('dotenv').config();

async function mostrarCredenciales() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');
        console.log('🔑 CREDENCIALES DE ACCESO POR TIENDA\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Obtener todos los tenants
        const [tenants] = await connection.execute(`
            SELECT id_tenant, slug, nombre_empresa, plan 
            FROM tenants 
            WHERE activo = TRUE 
            ORDER BY slug
        `);

        for (const tenant of tenants) {
            console.log(`\n🏪 ${tenant.nombre_empresa.toUpperCase()}`);
            console.log(`📍 URL: /tienda/${tenant.slug}/login`);
            console.log(`📦 Plan: ${tenant.plan}`);
            console.log('─────────────────────────────────────────────────────────────────');

            // Obtener admins
            const [admins] = await connection.execute(`
                SELECT nombre, apellido, email 
                FROM usuarios 
                WHERE id_tenant = ? AND id_rol = 1 AND activo = TRUE
                ORDER BY nombre
            `, [tenant.id_tenant]);

            if (admins.length > 0) {
                console.log('\n👤 ADMINISTRADORES:');
                admins.forEach(admin => {
                    console.log(`   📧 Email: ${admin.email}`);
                    console.log(`   🔒 Password: password123`);
                    console.log('');
                });
            }

            // Obtener empleados
            const [empleados] = await connection.execute(`
                SELECT nombre, apellido, email 
                FROM usuarios 
                WHERE id_tenant = ? AND id_rol = 2 AND activo = TRUE
                ORDER BY nombre
            `, [tenant.id_tenant]);

            if (empleados.length > 0) {
                console.log('👥 EMPLEADOS:');
                empleados.forEach(emp => {
                    console.log(`   📧 Email: ${emp.email}`);
                    console.log(`   🔒 Password: password123`);
                });
                console.log('');
            }

            // Obtener clientes
            const [clientes] = await connection.execute(`
                SELECT nombre, apellido, email 
                FROM clientes 
                WHERE id_tenant = ? AND activo = TRUE
                ORDER BY nombre
                LIMIT 3
            `, [tenant.id_tenant]);

            if (clientes.length > 0) {
                console.log('🛒 CLIENTES (primeros 3):');
                clientes.forEach(cliente => {
                    console.log(`   📧 Email: ${cliente.email}`);
                    console.log(`   🔒 Password: password123`);
                });
                console.log('');
            }

            console.log('═══════════════════════════════════════════════════════════════════');
        }

        console.log('\n\n📝 NOTAS IMPORTANTES:');
        console.log('   • Todos los usuarios tienen la contraseña: password123');
        console.log('   • Los CLIENTES deben usar: /tienda/{slug}/login');
        console.log('   • Los ADMIN/EMPLEADOS deben usar: /admin/login');
        console.log('   • Cada cliente SOLO puede acceder a SU tienda\n');

        console.log('🔐 PRUEBAS DE AISLAMIENTO:');
        console.log('   ✅ Correcto: cliente1@pasteleria-dulce-sabor.com en /tienda/pasteleria-dulce-sabor/login');
        console.log('   ❌ Incorrecto: cliente1@pasteleria-dulce-sabor.com en /tienda/electrotech-premium/login');
        console.log('   ❌ Debe dar error: "No tienes acceso a esta tienda"\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

mostrarCredenciales();
