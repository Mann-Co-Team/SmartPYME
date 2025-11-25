const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function resetEmpleadoPassword() {
  try {
    console.log('\n🔐 Reseteando contraseña del empleado...\n');

    const email = 'empleado@smartpyme.com';
    const password = 'empleado123';

    // Verificar si el usuario existe
    const [users] = await db.execute(
      'SELECT id_usuario, nombre, apellido, email FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.error('❌ No se encontró el empleado');
      process.exit(1);
    }

    const user = users[0];
    console.log(`👤 Usuario: ${user.nombre} ${user.apellido}`);
    console.log(`📧 Email: ${user.email}`);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    await db.execute(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    console.log('\n✅ Contraseña actualizada exitosamente');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log('\n🎉 Ahora puedes iniciar sesión en /admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetEmpleadoPassword();
