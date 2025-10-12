const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hashedPassword);

    const [existing] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      ['admin@smartpyme.com']
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@smartpyme.com']
      );
      console.log('✅ Contraseña del admin actualizada');
    } else {
      await db.execute(
        'INSERT INTO usuarios (id_rol, nombre, apellido, email, password, activo) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Admin', 'Sistema', 'admin@smartpyme.com', hashedPassword, true]
      );
      console.log('✅ Usuario admin creado');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
