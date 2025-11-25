/**
 * Script para ejecutar la migración multitenant
 * Lee y ejecuta el archivo migration-multitenant.sql
 */

const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function runMigration() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║       MIGRACIÓN MULTITENANT - SmartPYME              ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        // Leer archivo SQL (versión simple sin procedimientos almacenados)
        const sqlPath = path.join(__dirname, '../database/migration-multitenant-simple.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Archivo SQL cargado:', sqlPath);
        console.log('📏 Tamaño:', Math.round(sql.length / 1024), 'KB\n');

        // Dividir en statements individuales (por punto y coma y salto de línea doble)
        const statements = sql
            .split(/;\s*\n/)
            .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));

        console.log(`🔄 Ejecutando ${statements.length} statements...\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            
            // Ignorar comentarios y líneas vacías
            if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
                continue;
            }

            try {
                // Detectar tipo de statement para logging
                let tipo = 'QUERY';
                if (statement.toUpperCase().includes('CREATE TABLE')) tipo = 'CREATE TABLE';
                else if (statement.toUpperCase().includes('ALTER TABLE')) tipo = 'ALTER TABLE';
                else if (statement.toUpperCase().includes('INSERT INTO')) tipo = 'INSERT';
                else if (statement.toUpperCase().includes('CREATE OR REPLACE VIEW')) tipo = 'CREATE VIEW';
                else if (statement.toUpperCase().includes('CREATE PROCEDURE')) tipo = 'CREATE PROCEDURE';
                else if (statement.toUpperCase().includes('CREATE TRIGGER')) tipo = 'CREATE TRIGGER';

                await db.execute(statement);
                console.log(`✅ [${i + 1}/${statements.length}] ${tipo}`);
                successCount++;
            } catch (error) {
                // Algunos errores son esperados (tabla ya existe, etc)
                if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
                    error.code === 'ER_DUP_FIELDNAME' ||
                    error.message.includes('already exists')) {
                    console.log(`⚠️  [${i + 1}/${statements.length}] Ya existe (omitido)`);
                } else {
                    console.error(`❌ [${i + 1}/${statements.length}] ERROR:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║              MIGRACIÓN COMPLETADA                    ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');
        console.log(`✅ Exitosos: ${successCount}`);
        console.log(`⚠️  Errores: ${errorCount}\n`);

        // Verificar resultado
        console.log('🔍 Verificando estructura...\n');

        const [tenants] = await db.execute('SELECT COUNT(*) as count FROM tenants');
        console.log(`   📊 Tenants creados: ${tenants[0].count}`);

        const [columns] = await db.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE COLUMN_NAME = 'id_tenant' 
            AND TABLE_SCHEMA = 'smartpyme_db'
        `);
        console.log(`   📋 Tablas con id_tenant: ${columns.length}`);

        console.log('\n✅ Verificación completada\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR FATAL:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
