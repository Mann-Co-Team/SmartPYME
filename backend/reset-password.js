const bcrypt = require('bcryptjs');
const readline = require('readline');
const db = require('./config/db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  try {
    console.log('\n🔐 === RESETEAR CONTRASEÑA DE USUARIO ===\n');

    const email = await question('Email del usuario: ');
    
    // Verificar si el usuario existe
    const [users] = await db.execute(
      'SELECT id_usuario, nombre, apellido, email FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.error('❌ No se encontró un usuario con ese email');
      rl.close();
      process.exit(1);
    }

    const user = users[0];
    console.log(`\n👤 Usuario encontrado: ${user.nombre} ${user.apellido}`);
    console.log(`📧 Email: ${user.email}\n`);

    const password = await question('Nueva contraseña (mínimo 6 caracteres): ');
    
    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Confirmar nueva contraseña: ');
    
    if (password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Actualizando contraseña...\n');

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña
    await db.execute(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );

    console.log('✅ Contraseña actualizada exitosamente');
    console.log(`📧 Usuario: ${email}\n`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
