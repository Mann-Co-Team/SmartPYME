const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createDefaultEmployee() {
  try {
    console.log('\n👤 === CREANDO EMPLEADO DE PRUEBA ===\n');

    const employeeData = {
      nombre: 'Maria',
      apellido: 'Gonzalez',
      email: 'empleado@smartpyme.com',
      password: 'emp123',
      telefono: '3001234567'
    };

    console.log('Creando empleado:');
    console.log(`👤 Nombre: ${employeeData.nombre} ${employeeData.apellido}`);
    console.log(`📧 Email: ${employeeData.email}`);
    console.log(`🔑 Contraseña: ${employeeData.password}`);
    console.log(`📞 Teléfono: ${employeeData.telefono}`);
    console.log('\n⏳ Procesando...\n');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);

    // Verificar si el email ya existe
    const [existing] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [employeeData.email]
    );

    if (existing.length > 0) {
      // Actualizar usuario existente
      await db.execute(
        'UPDATE usuarios SET nombre = ?, apellido = ?, password = ?, telefono = ?, id_rol = 2, activo = 1 WHERE email = ?',
        [employeeData.nombre, employeeData.apellido, hashedPassword, employeeData.telefono, employeeData.email]
      );
      console.log('✅ Usuario empleado actualizado exitosamente');
    } else {
      // Crear nuevo usuario empleado
      const [result] = await db.execute(
        'INSERT INTO usuarios (id_rol, nombre, apellido, email, password, telefono, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [2, employeeData.nombre, employeeData.apellido, employeeData.email, hashedPassword, employeeData.telefono, 1]
      );
      console.log('✅ Usuario empleado creado exitosamente');
      console.log(`🆔 ID: ${result.insertId}`);
    }

    console.log(`\n📋 CREDENCIALES DEL EMPLEADO:`);
    console.log(`Email: ${employeeData.email}`);
    console.log(`Contraseña: ${employeeData.password}`);
    console.log(`\n🔗 Puede iniciar sesión en: http://localhost:5173/admin/login\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDefaultEmployee();
