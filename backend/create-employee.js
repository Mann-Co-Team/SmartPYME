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

async function createEmployee() {
  try {
    console.log('\n👤 === CREACIÓN DE USUARIO EMPLEADO ===\n');

    // Solicitar datos
    const nombre = await question('Nombre del empleado: ');
    const apellido = await question('Apellido del empleado: ');
    const email = await question('Email del empleado: ');
    
    // Validar email
    if (!email.includes('@')) {
      console.error('❌ Email inválido');
      rl.close();
      process.exit(1);
    }

    const telefono = await question('Teléfono (opcional): ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');
    
    // Validar contraseña
    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Confirmar contraseña: ');
    
    if (password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Procesando...\n');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el email ya existe
    const [existing] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      // Actualizar usuario existente
      await db.execute(
        'UPDATE usuarios SET nombre = ?, apellido = ?, password = ?, telefono = ?, id_rol = 2, activo = 1 WHERE email = ?',
        [nombre, apellido, hashedPassword, telefono || null, email]
      );
      console.log('✅ Usuario empleado actualizado exitosamente');
      console.log(`📧 Email: ${email}`);
    } else {
      // Crear nuevo usuario empleado
      await db.execute(
        'INSERT INTO usuarios (id_rol, nombre, apellido, email, password, telefono, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [2, nombre, apellido, email, hashedPassword, telefono || null, 1]
      );
      console.log('✅ Usuario empleado creado exitosamente');
      console.log(`📧 Email: ${email}`);
      console.log(`👤 Nombre: ${nombre} ${apellido}`);
      console.log(`📞 Teléfono: ${telefono || 'No especificado'}`);
    }

    console.log('\n🎉 ¡Listo! Ya puede iniciar sesión en /admin/login\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

createEmployee();
