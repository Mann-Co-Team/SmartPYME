const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function resetAdminPasswords() {
    try {
        console.log('\n🔐 === RESETEAR CONTRASEÑAS DE ADMIN ===\n');

        // Nueva contraseña
        const newPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Buscar TODOS los usuarios con rol de administrador (id_rol = 1)
        const [admins] = await db.execute(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.email, t.nombre_empresa, t.slug, t.plan
       FROM usuarios u
       JOIN tenants t ON u.id_tenant = t.id_tenant
       WHERE u.id_rol = 1
       ORDER BY t.nombre_empresa`
        );

        if (admins.length === 0) {
            console.log('❌ No se encontraron administradores');
            process.exit(1);
        }

        console.log(`📊 Encontrados ${admins.length} administradores:\n`);

        let updated = 0;

        for (const admin of admins) {
            // Actualizar contraseña
            await db.execute(
                'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
                [hashedPassword, admin.id_usuario]
            );

            console.log(`✅ ${admin.nombre_empresa} (${admin.slug}) - Plan: ${admin.plan}`);
            console.log(`   👤 ${admin.nombre} ${admin.apellido}`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   🔑 Nueva contraseña: ${newPassword}\n`);

            updated++;
        }

        console.log(`\n✨ Proceso completado: ${updated} contraseñas actualizadas`);
        console.log(`🔑 Contraseña para TODOS los admins: ${newPassword}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetAdminPasswords();
