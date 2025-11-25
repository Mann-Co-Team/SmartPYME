const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function restaurarPasswordsOriginales() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('🔐 RESTAURANDO PASSWORDS ORIGINALES\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Hashear passwords originales
        const clientePassword = await bcrypt.hash('Cliente123!', 10);
        const adminPassword = await bcrypt.hash('Admin123!', 10);
        
        console.log('✅ Passwords hasheados:\n');
        console.log(`   Cliente123! → ${clientePassword.substring(0, 30)}...`);
        console.log(`   Admin123!   → ${adminPassword.substring(0, 30)}...\n`);

        // Actualizar clientes (rol=3)
        const [clientesResult] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 3
        `, [clientePassword]);

        console.log(`✅ ${clientesResult.affectedRows} clientes actualizados a Cliente123!`);

        // Actualizar admins (rol=1)
        const [adminsResult] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 1
        `, [adminPassword]);

        console.log(`✅ ${adminsResult.affectedRows} administradores actualizados a Admin123!`);

        // Actualizar empleados (rol=2)
        const [empleadosResult] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 2
        `, [adminPassword]);

        console.log(`✅ ${empleadosResult.affectedRows} empleados actualizados a Admin123!\n`);

        // Verificar algunos usuarios
        console.log('📋 VERIFICANDO USUARIOS:\n');
        
        const [clientes] = await connection.execute(`
            SELECT u.nombre, u.email, t.nombre_empresa, t.slug
            FROM usuarios u
            INNER JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 3
            LIMIT 5
        `);

        console.log('CLIENTES (Password: Cliente123!):');
        clientes.forEach(c => {
            console.log(`   ✅ ${c.email} (${c.nombre_empresa})`);
        });

        const [admins] = await connection.execute(`
            SELECT u.nombre, u.email, t.nombre_empresa, t.slug
            FROM usuarios u
            INNER JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 1
            LIMIT 5
        `);

        console.log('\nADMINS (Password: Admin123!):');
        admins.forEach(a => {
            console.log(`   ✅ ${a.email} (${a.nombre_empresa})`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('✅ PASSWORDS RESTAURADOS A LOS ORIGINALES\n');
        console.log('📝 CREDENCIALES:');
        console.log('   👥 Clientes: Cliente123!');
        console.log('   👨‍💼 Admin/Empleados: Admin123!\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

restaurarPasswordsOriginales();
