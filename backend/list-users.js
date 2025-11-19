const db = require('./config/db');

async function listUsers() {
  try {
    console.log('\n👥 === LISTA DE USUARIOS EN LA BASE DE DATOS ===\n');

    const [users] = await db.execute(`
      SELECT 
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.email,
        r.nombre_rol,
        u.activo,
        u.created_at
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `);

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos\n');
      process.exit(0);
    }

    console.log('Total de usuarios:', users.length);
    console.log('─'.repeat(80));

    users.forEach(user => {
      console.log(`\nID: ${user.id_usuario}`);
      console.log(`Nombre: ${user.nombre} ${user.apellido || ''}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rol: ${user.nombre_rol || 'Sin rol'}`);
      console.log(`Estado: ${user.activo ? '✅ Activo' : '❌ Inactivo'}`);
      console.log(`Creado: ${user.created_at}`);
      console.log('─'.repeat(80));
    });

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error.message);
    process.exit(1);
  }
}

listUsers();
