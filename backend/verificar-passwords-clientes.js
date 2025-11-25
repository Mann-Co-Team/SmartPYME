const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarPasswordsClientes() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar passwords en tabla clientes
        const [clientes] = await connection.execute(`
            SELECT 
                id_cliente,
                nombre,
                email,
                password,
                CASE 
                    WHEN password IS NULL THEN '❌ NULL'
                    WHEN password = '' THEN '❌ VACÍO'
                    WHEN LENGTH(password) < 20 THEN '❌ NO HASHEADO'
                    ELSE '✅ OK'
                END as estado_password
            FROM clientes
            LIMIT 10
        `);

        console.log('📊 ESTADO DE PASSWORDS EN TABLA CLIENTES:\n');
        clientes.forEach(c => {
            console.log(`${c.estado_password} ${c.nombre} (${c.email})`);
            if (c.password) {
                console.log(`   Password: ${c.password.substring(0, 30)}...`);
            } else {
                console.log(`   Password: NULL`);
            }
        });

        console.log('\n═══════════════════════════════════════════════════════════════════\n');
        console.log('💡 DIAGNÓSTICO:');
        const sinPassword = clientes.filter(c => !c.password || c.password === '');
        if (sinPassword.length > 0) {
            console.log(`   ❌ ${sinPassword.length} clientes sin password`);
            console.log('   🔧 SOLUCIÓN: Ejecutar script para hashear passwords\n');
        } else {
            console.log('   ✅ Todos los clientes tienen passwords\n');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

verificarPasswordsClientes();
