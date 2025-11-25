const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function resetAllPasswords() {
  try {
    console.log('\n🔐 Reseteando contraseñas de usuarios...\n');

    const usuarios = [
      { email: 'juan.perez@ejemplo.com', password: 'cliente123', role: 'Cliente' },
      { email: 'empleado@smartpyme.com', password: 'empleado123', role: 'Empleado' },
      { email: 'admin@smartpyme.com', password: 'admin123', role: 'Admin' }
    ];

    for (const usuario of usuarios) {
      // Verificar si el usuario existe
      const [users] = await db.execute(
        'SELECT id_usuario, nombre, apellido, email FROM usuarios WHERE email = ?',
        [usuario.email]
      );

      if (users.length === 0) {
        console.log(`❌ No se encontró: ${usuario.email}`);
        continue;
      }

      const user = users[0];

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(usuario.password, 10);

      // Actualizar contraseña
      await db.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, usuario.email]
      );

      console.log(`✅ ${usuario.role}: ${user.nombre} ${user.apellido || ''}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🔑 Contraseña: ${usuario.password}\n`);
    }

    console.log('═'.repeat(60));
    console.log('\n🎉 Todas las contraseñas han sido actualizadas\n');
    console.log('📝 RESUMEN DE CREDENCIALES:\n');
    console.log('👤 CLIENTE (Juan Pérez):');
    console.log('   Email: juan.perez@ejemplo.com');
    console.log('   Contraseña: cliente123');
    console.log('   Login: http://localhost:5173/login\n');
    
    console.log('👔 EMPLEADO (Maria Gonzalez):');
    console.log('   Email: empleado@smartpyme.com');
    console.log('   Contraseña: empleado123');
    console.log('   Login: http://localhost:5173/admin/login\n');
    
    console.log('🔧 ADMIN (Admin Sistema):');
    console.log('   Email: admin@smartpyme.com');
    console.log('   Contraseña: admin123');
    console.log('   Login: http://localhost:5173/admin/login\n');
    
    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllPasswords();
