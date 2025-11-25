const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function crearClientesFaltantes() {
    console.log('\n🔧 CREANDO CLIENTES FALTANTES\n');

    try {
        // Obtener todos los tenants
        const [tenants] = await db.execute('SELECT id_tenant, nombre_empresa, slug FROM tenants WHERE activo = 1');
        
        console.log(`✅ Total tenants encontrados: ${tenants.length}\n`);

        for (const tenant of tenants) {
            const clienteEmail = `cliente@${tenant.slug}.com`;
            
            // Verificar si ya existe el cliente
            const [existing] = await db.execute(
                'SELECT id_usuario FROM usuarios WHERE email = ? AND id_tenant = ?',
                [clienteEmail, tenant.id_tenant]
            );

            if (existing.length > 0) {
                console.log(`⏭️  Cliente ya existe para ${tenant.nombre_empresa}: ${clienteEmail}`);
            } else {
                // Crear cliente
                const hashedPassword = await bcrypt.hash('Cliente123!', 10);
                
                await db.execute(
                    `INSERT INTO usuarios (nombre, apellido, email, password, id_rol, id_tenant, activo) 
                     VALUES (?, ?, ?, ?, 3, ?, true)`,
                    ['Cliente', tenant.nombre_empresa, clienteEmail, hashedPassword, tenant.id_tenant]
                );
                
                console.log(`✅ Cliente creado para ${tenant.nombre_empresa}:`);
                console.log(`   📧 Email: ${clienteEmail}`);
                console.log(`   🔑 Password: Cliente123!`);
                console.log(`   🏢 Tenant ID: ${tenant.id_tenant}\n`);
            }
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║        ✅ CLIENTES CREADOS EXITOSAMENTE              ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        console.log('🔐 CREDENCIALES COMPLETAS:\n');
        for (const tenant of tenants) {
            console.log(`🏢 ${tenant.nombre_empresa}`);
            console.log(`   Email: cliente@${tenant.slug}.com`);
            console.log(`   Password: Cliente123!`);
            console.log(`   URL: http://localhost:5173/tienda/${tenant.slug}/login\n`);
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

crearClientesFaltantes();
