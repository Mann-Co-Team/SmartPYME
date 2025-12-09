const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script para crear respaldo de la base de datos antes de migración
 */
async function createBackup() {
    let connection;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(__dirname, '..', 'database', `backup_smartpyme_${timestamp}.sql`);

    try {
        console.log('🔄 Conectando a la base de datos...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conexión establecida');
        console.log('🔄 Creando respaldo de la base de datos...\n');

        let sqlDump = `-- ============================================\n`;
        sqlDump += `-- Respaldo de SmartPYME Database\n`;
        sqlDump += `-- Fecha: ${new Date().toLocaleString('es-CL')}\n`;
        sqlDump += `-- ============================================\n\n`;
        sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

        // Obtener todas las tablas
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log(`📊 Tablas encontradas: ${tableNames.length}`);

        for (const tableName of tableNames) {
            console.log(`  📦 Respaldando tabla: ${tableName}`);

            // Obtener estructura de la tabla
            const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
            sqlDump += `-- Tabla: ${tableName}\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sqlDump += createTable[0]['Create Table'] + ';\n\n';

            // Obtener datos de la tabla
            const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);

            if (rows.length > 0) {
                sqlDump += `-- Datos de ${tableName}\n`;

                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = columns.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (typeof val === 'boolean') return val ? 1 : 0;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        // Escapar comillas simples
                        return `'${String(val).replace(/'/g, "''")}'`;
                    });

                    sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
                }
                sqlDump += '\n';
            }
        }

        sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;

        // Guardar archivo
        fs.writeFileSync(backupFile, sqlDump, 'utf8');

        console.log('\n✅ Respaldo creado exitosamente!');
        console.log(`📁 Archivo: ${backupFile}`);
        console.log(`📊 Tamaño: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);
        console.log(`\n💡 Para restaurar en caso de error:`);
        console.log(`   mysql -u root -p smartpyme_db < "${backupFile}"\n`);

        return backupFile;

    } catch (error) {
        console.error('\n❌ Error creando respaldo:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar respaldo
createBackup()
    .then(() => {
        console.log('🎉 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
