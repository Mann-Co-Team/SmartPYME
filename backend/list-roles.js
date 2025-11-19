const db = require('./config/db');

async function listRoles() {
  try {
    console.log('\n🎭 === ROLES EN LA BASE DE DATOS ===\n');

    const [roles] = await db.execute(`
      SELECT * FROM roles ORDER BY id_rol ASC
    `);

    if (roles.length === 0) {
      console.log('❌ No hay roles en la base de datos\n');
      process.exit(0);
    }

    console.log('Total de roles:', roles.length);
    console.log('─'.repeat(60));

    roles.forEach(role => {
      console.log(`\nID: ${role.id_rol}`);
      console.log(`Nombre: ${role.nombre_rol}`);
      console.log(`Descripción: ${role.descripcion || 'Sin descripción'}`);
      console.log('─'.repeat(60));
    });

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al listar roles:', error.message);
    process.exit(1);
  }
}

listRoles();
