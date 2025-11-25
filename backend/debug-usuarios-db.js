const db = require('./config/db');

(async () => {
    const conn = await db.getConnection();
    
    try {
        const [usuarios] = await conn.execute(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.id_rol, r.nombre_rol
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_tenant = 18
            ORDER BY u.id_rol, u.id_usuario
        `);
        
        console.log('\n📋 USUARIOS EN BASE DE DATOS:\n');
        usuarios.forEach(u => {
            console.log(`ID: ${u.id_usuario}`);
            console.log(`Nombre: ${u.nombre} ${u.apellido}`);
            console.log(`Email: ${u.email}`);
            console.log(`id_rol: ${u.id_rol}`);
            console.log(`nombre_rol: ${u.nombre_rol}`);
            console.log('---');
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await conn.release();
    }
})();
