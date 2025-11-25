const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function actualizarPasswords() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('🔐 ACTUALIZANDO PASSWORDS DE USUARIOS (ROL CLIENTE)\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Hashear password123
        const hashedPassword = await bcrypt.hash('password123', 10);
        console.log('✅ Password hasheado:', hashedPassword.substring(0, 30) + '...\n');

        // Actualizar todos los clientes (rol=3)
        console.log('📝 Actualizando passwords de clientes...');
        const [result] = await connection.execute(`
            UPDATE usuarios 
            SET password = ?
            WHERE id_rol = 3
        `, [hashedPassword]);

        console.log(`✅ ${result.affectedRows} clientes actualizados\n`);

        // Verificar algunos clientes
        console.log('📋 VERIFICANDO CLIENTES:\n');
        
        const [clientes] = await connection.execute(`
            SELECT u.nombre, u.email, t.nombre_empresa, u.id_tenant
            FROM usuarios u
            INNER JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 3
            LIMIT 10
        `);

        for (const cliente of clientes) {
            console.log(`   👤 ${cliente.nombre} (${cliente.email})`);
            console.log(`      🏪 ${cliente.nombre_empresa} (tenant: ${cliente.id_tenant})`);
        }

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('✅ PASSWORDS ACTUALIZADOS\n');
        console.log('💡 AHORA PUEDES:');
        console.log('   - Iniciar sesión con cualquier cliente');
        console.log('   - Password: password123');
        console.log('   - Ejemplo: cliente1@pasteleria-dulce-sabor.com / password123\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

actualizarPasswords();
