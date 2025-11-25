const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetearPasswordsAdminEmpleados() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('🔐 RESETEANDO PASSWORDS DE ADMIN Y EMPLEADOS\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Password para admins y empleados
        const adminPassword = await bcrypt.hash('Admin123!', 10);
        console.log('✅ Password Admin123! hasheado\n');

        // Actualizar admins (rol=1)
        const [adminsResult] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 1
        `, [adminPassword]);

        console.log(`✅ ${adminsResult.affectedRows} administradores actualizados`);

        // Actualizar empleados (rol=2)
        const [empleadosResult] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 2
        `, [adminPassword]);

        console.log(`✅ ${empleadosResult.affectedRows} empleados actualizados\n`);

        // Listar admins y empleados
        console.log('📋 USUARIOS ADMINISTRATIVOS:\n');
        
        const [usuarios] = await connection.execute(`
            SELECT 
                u.nombre,
                u.email,
                CASE u.id_rol 
                    WHEN 1 THEN 'Administrador'
                    WHEN 2 THEN 'Empleado'
                END as rol,
                t.nombre_empresa,
                t.slug
            FROM usuarios u
            INNER JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol IN (1, 2)
            ORDER BY t.nombre_empresa, u.id_rol
        `);

        usuarios.forEach(u => {
            console.log(`   👤 ${u.rol}: ${u.nombre} (${u.email})`);
            console.log(`      🏪 ${u.nombre_empresa} (${u.slug})`);
            console.log(`      🔑 Password: Admin123!\n`);
        });

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('✅ PASSWORDS RESETEADOS\n');
        console.log('💡 TODOS LOS ADMIN Y EMPLEADOS:');
        console.log('   Password: Admin123!\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

resetearPasswordsAdminEmpleados();
