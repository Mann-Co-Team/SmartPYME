// Script para crear backup de la base de datos
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function createBackup() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'smartpyme'
        });

        console.log('✅ Conexión establecida');
        console.log('📊 Verificando datos actuales...\n');

        // Verificar datos
        const tables = ['usuarios', 'productos', 'pedidos', 'categorias', 'auditoria', 'tenants'];
        for (const table of tables) {
            const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   ${table}: ${rows[0].count} registros`);
        }

        console.log('\n✅ Datos verificados correctamente');
        console.log('\n📝 NOTA: Para crear backup completo, usa MySQL Workbench:');
        console.log('   Server → Data Export → Seleccionar smartpyme → Export to Self-Contained File');
        console.log('   O ejecuta en terminal:');
        console.log('   "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump" -u root -p smartpyme > backup.sql');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createBackup();
