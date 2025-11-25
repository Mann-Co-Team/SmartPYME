const bcrypt = require('bcrypt');
const db = require('./config/db');

const NUEVA_PASSWORD = '123456';

(async () => {
    try {
        console.log('\n=== RESETEANDO CONTRASEÑAS DE ADMINISTRADORES ===\n');
        
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(NUEVA_PASSWORD, 10);
        console.log('🔐 Nueva contraseña hasheada:', hashedPassword.substring(0, 40) + '...\n');

        // Obtener todos los usuarios admin (rol 1) y empleados (rol 2)
        const [usuarios] = await db.execute(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.email, r.nombre_rol, t.nombre_empresa, t.slug 
             FROM usuarios u 
             JOIN roles r ON u.id_rol = r.id_rol
             LEFT JOIN tenants t ON u.id_tenant = t.id_tenant
             WHERE u.id_rol IN (1, 2) AND u.activo = TRUE
             ORDER BY t.nombre_empresa, r.nombre_rol`
        );

        console.log(`📋 Se encontraron ${usuarios.length} usuarios admin/empleado:\n`);

        // Actualizar cada usuario
        for (const user of usuarios) {
            await db.execute(
                'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
                [hashedPassword, user.id_usuario]
            );
            
            console.log(`✅ ${user.nombre_rol.toUpperCase()}: ${user.nombre} ${user.apellido}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Empresa: ${user.nombre_empresa || 'N/A'} (${user.slug || 'N/A'})`);
            console.log(`   Password actualizada a: ${NUEVA_PASSWORD}\n`);
        }

        console.log('\n✅ Todas las contraseñas han sido actualizadas exitosamente!');
        console.log(`🔑 Puedes iniciar sesión con cualquier admin/empleado usando: ${NUEVA_PASSWORD}\n`);

        await db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
