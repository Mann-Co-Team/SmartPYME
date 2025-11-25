const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarEstructuraClientes() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos\n');

        // Verificar estructura de tabla clientes
        const [columns] = await connection.execute(`
            SHOW COLUMNS FROM clientes
        `);

        console.log('📊 ESTRUCTURA DE TABLA "clientes":\n');
        columns.forEach(col => {
            console.log(`   ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ' [' + col.Key + ']' : ''}`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════════\n');
        
        // Verificar si existe columna password
        const hasPassword = columns.some(col => col.Field === 'password');
        
        if (!hasPassword) {
            console.log('❌ PROBLEMA: La tabla "clientes" NO tiene columna "password"');
            console.log('🔧 SOLUCIÓN: Agregar columna password a la tabla clientes\n');
        } else {
            console.log('✅ La tabla clientes tiene columna password\n');
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.end();
        throw error;
    }
}

verificarEstructuraClientes();
