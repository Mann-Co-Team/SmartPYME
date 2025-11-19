const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function fixAdminPassword() {
  try {
    console.log('🔧 Actualizando contraseña del administrador...\n');
    
    // Generar nuevo hash para "admin123"
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Hash generado para "admin123":');
    console.log(hashedPassword);
    console.log('');

    // Verificar si el usuario existe
    const [users] = await db.execute(
      'SELECT id_usuario, email, nombre FROM usuarios WHERE email = ?',
      ['admin@smartpyme.com']
    );

    if (users.length === 0) {
      console.log('❌ Usuario admin@smartpyme.com no encontrado');
      console.log('Creando usuario admin...\n');
      
      await db.execute(
        'INSERT INTO usuarios (id_rol, nombre, apellido, email, password, activo) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Admin', 'Sistema', 'admin@smartpyme.com', hashedPassword, 1]
      );
      
      console.log('✅ Usuario admin creado exitosamente');
    } else {
      console.log(`✓ Usuario encontrado: ${users[0].nombre} (${users[0].email})`);
      console.log('Actualizando contraseña...\n');
      
      await db.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@smartpyme.com']
      );
      
      console.log('✅ Contraseña actualizada exitosamente');
    }

    console.log('\n📋 Credenciales:');
    console.log('   Email:    admin@smartpyme.com');
    console.log('   Password: admin123');
    console.log('');
    
    // Verificar que la contraseña funciona
    const testMatch = await bcrypt.compare(password, hashedPassword);
    console.log(`🔐 Verificación: ${testMatch ? '✓ Hash válido' : '✗ Hash inválido'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();
