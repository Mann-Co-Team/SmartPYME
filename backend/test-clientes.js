const db = require('./config/db');

async function testClientes() {
    console.log('\n📋 VERIFICANDO CLIENTES EN LA BASE DE DATOS\n');

    try {
        // Obtener todos los usuarios con rol de cliente (id_rol = 3)
        const [clientes] = await db.execute(`
            SELECT u.id_usuario, u.nombre, u.email, u.id_tenant, u.id_rol, u.activo,
                   t.nombre_empresa, t.slug
            FROM usuarios u
            LEFT JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 3
            ORDER BY u.id_tenant, u.email
        `);

        console.log(`✅ Total de clientes encontrados: ${clientes.length}\n`);

        if (clientes.length === 0) {
            console.log('⚠️  No se encontraron clientes en la base de datos');
            console.log('   Ejecuta: node seed-tenants.js para crear usuarios de prueba\n');
        } else {
            console.log('📊 LISTA DE CLIENTES:\n');
            console.log('═══════════════════════════════════════════════════════════════════════════════');
            
            let currentTenant = null;
            for (const cliente of clientes) {
                if (currentTenant !== cliente.id_tenant) {
                    currentTenant = cliente.id_tenant;
                    console.log(`\n🏢 TENANT: ${cliente.nombre_empresa || 'SIN ASIGNAR'} (slug: ${cliente.slug || 'N/A'}, ID: ${cliente.id_tenant || 'NULL'})`);
                    console.log('───────────────────────────────────────────────────────────────────────────────');
                }
                
                console.log(`   📧 Email: ${cliente.email}`);
                console.log(`   👤 Nombre: ${cliente.nombre}`);
                console.log(`   🆔 ID Usuario: ${cliente.id_usuario}`);
                console.log(`   ✓ Activo: ${cliente.activo ? '✅ Sí' : '❌ No'}`);
                console.log('');
            }
            
            console.log('═══════════════════════════════════════════════════════════════════════════════\n');
            
            // Mostrar credenciales de prueba
            console.log('🔐 CREDENCIALES DE PRUEBA:\n');
            const tenants = [...new Set(clientes.map(c => c.slug).filter(s => s))];
            
            for (const slug of tenants) {
                console.log(`   Tienda: ${slug}`);
                console.log(`   Email: cliente@${slug}.com`);
                console.log(`   Password: Cliente123!`);
                console.log(`   URL: http://localhost:5173/tienda/${slug}/login\n`);
            }
        }

        // Verificar si hay usuarios sin tenant asignado
        const clientesSinTenant = clientes.filter(c => !c.id_tenant);
        if (clientesSinTenant.length > 0) {
            console.log('⚠️  ADVERTENCIA: Hay clientes sin tenant asignado:');
            clientesSinTenant.forEach(c => {
                console.log(`   - ${c.email} (ID: ${c.id_usuario})`);
            });
            console.log('');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testClientes();
