const mysql = require('mysql2/promise');
require('dotenv').config();

async function actualizarTablaPedidos() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('🔧 ACTUALIZANDO TABLA PEDIDOS\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // Modificar id_cliente para ser nullable
        console.log('📝 Modificando columna id_cliente a NULL...');
        await connection.execute(`
            ALTER TABLE pedidos 
            MODIFY COLUMN id_cliente INT NULL
        `);
        console.log('✅ Columna id_cliente ahora es nullable\n');

        // Verificar estructura
        const [cols] = await connection.execute('DESCRIBE pedidos');
        console.log('📋 ESTRUCTURA ACTUALIZADA:\n');
        cols.forEach(c => {
            if (c.Field === 'id_cliente' || c.Field === 'id_usuario') {
                console.log(`  ✅ ${c.Field.padEnd(20)} ${c.Type.padEnd(20)} ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            }
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('✅ TABLA PEDIDOS ACTUALIZADA\n');
        console.log('💡 AHORA:');
        console.log('   - id_cliente es opcional (NULL)');
        console.log('   - id_usuario es el campo principal para identificar cliente');
        console.log('   - Sistema unificado con tabla usuarios\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

actualizarTablaPedidos();
