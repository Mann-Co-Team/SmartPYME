const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createTenantClients() {
  try {
    console.log('\n👥 Creando clientes por tenant...\n');

    const clientes = [
      { 
        tenant_id: 1, // Demo
        nombre: 'Juan Pérez',
        email: 'juan.perez@ejemplo.com',
        password: 'cliente123'
      },
      { 
        tenant_id: 3, // Comercial XYZ
        nombre: 'María García',
        email: 'maria@comercial-xyz.com',
        password: 'cliente123'
      },
      { 
        tenant_id: 4, // Megatienda 2000
        nombre: 'Carlos López',
        email: 'carlos@megatienda.com',
        password: 'cliente123'
      }
    ];

    for (const cliente of clientes) {
      // Verificar si el usuario ya existe
      const [existing] = await db.execute(
        'SELECT id_usuario FROM usuarios WHERE email = ?',
        [cliente.email]
      );

      if (existing.length > 0) {
        // Actualizar usuario existente
        const hashedPassword = await bcrypt.hash(cliente.password, 10);
        await db.execute(
          'UPDATE usuarios SET nombre = ?, id_tenant = ?, id_rol = 3, password = ?, activo = TRUE WHERE email = ?',
          [cliente.nombre, cliente.tenant_id, hashedPassword, cliente.email]
        );
        console.log(`✅ Actualizado: ${cliente.nombre} (${cliente.email})`);
      } else {
        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(cliente.password, 10);
        await db.execute(
          'INSERT INTO usuarios (id_tenant, nombre, apellido, email, password, id_rol, activo) VALUES (?, ?, "", ?, ?, 3, TRUE)',
          [cliente.tenant_id, cliente.nombre, cliente.email, hashedPassword]
        );
        console.log(`✅ Creado: ${cliente.nombre} (${cliente.email})`);
      }

      // Obtener nombre del tenant
      const [tenant] = await db.execute(
        'SELECT nombre_empresa, slug FROM tenants WHERE id_tenant = ?',
        [cliente.tenant_id]
      );

      console.log(`   📧 Email: ${cliente.email}`);
      console.log(`   🔑 Contraseña: ${cliente.password}`);
      console.log(`   🏢 Tienda: ${tenant[0].nombre_empresa} (${tenant[0].slug})`);
      console.log(`   🔗 URL: http://localhost:5173/tienda/${tenant[0].slug}/login\n`);
    }

    console.log('═'.repeat(60));
    console.log('\n🎉 Clientes creados exitosamente\n');
    console.log('📝 RESUMEN DE CREDENCIALES POR TIENDA:\n');

    // Demo
    console.log('🏪 TIENDA DEMO:');
    console.log('   URL: http://localhost:5173/tienda/demo');
    console.log('   Cliente: juan.perez@ejemplo.com / cliente123\n');

    // Comercial XYZ
    console.log('🏪 COMERCIAL XYZ:');
    console.log('   URL: http://localhost:5173/tienda/comercial-xyz');
    console.log('   Cliente: maria@comercial-xyz.com / cliente123\n');

    // Megatienda 2000
    console.log('🏪 MEGATIENDA 2000:');
    console.log('   URL: http://localhost:5173/tienda/megatienda-2000');
    console.log('   Cliente: carlos@megatienda.com / cliente123\n');

    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTenantClients();
