const db = require('./config/db');

(async () => {
    try {
        console.log('\n🔍 Verificando usuarios admin...\n');
        
        const [users] = await db.execute(`
            SELECT u.id_usuario, u.email, u.nombre, u.apellido, r.id_rol, r.nombre_rol, u.activo
            FROM usuarios u 
            JOIN roles r ON u.id_rol = r.id_rol 
            WHERE r.nombre_rol LIKE '%admin%'
        `);
        
        if (users.length === 0) {
            console.log('❌ No se encontraron usuarios admin');
        } else {
            users.forEach(u => {
                console.log(`📧 Email: ${u.email}`);
                console.log(`👤 Nombre: ${u.nombre} ${u.apellido}`);
                console.log(`🔑 Rol: ${u.nombre_rol} (ID: ${u.id_rol})`);
                console.log(`✓ Activo: ${u.activo ? 'Sí' : 'No'}`);
                console.log('---');
            });
        }
        
        console.log('\n🔍 Verificando roles disponibles...\n');
        const [roles] = await db.execute('SELECT * FROM roles');
        roles.forEach(r => {
            console.log(`  ID: ${r.id_rol} - ${r.nombre_rol}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
})();
