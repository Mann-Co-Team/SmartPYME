// Script de Backup por Tenant
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

// Configuración desde variables de entorno
const DB_NAME = process.env.DB_NAME || 'smartpyme_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD;
const BACKUP_DIR = path.join(__dirname, '..', '..', 'database', 'backups');
const RETENTION_DAYS = 30;

/**
 * Crear backup filtrado por tenant
 */
async function createTenantBackup(tenantId, userId = null, isAutomatic = false) {
    let backupId;
    let connection;

    try {
        console.log(`🔄 Iniciando backup para tenant ${tenantId}...`);

        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        connection = await mysql.createConnection({
            host: 'localhost',
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });

        // Obtener información del tenant
        const [tenants] = await connection.execute(
            'SELECT nombre_empresa, slug FROM tenants WHERE id_tenant = ?',
            [tenantId]
        );

        if (tenants.length === 0) {
            throw new Error(`Tenant ${tenantId} no encontrado`);
        }

        const tenant = tenants[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `backup_${tenant.slug}_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        // Registrar inicio en BD
        const [result] = await connection.execute(
            `INSERT INTO backup_log (id_tenant, filename, filepath, backup_type, status, created_by) VALUES (?, ?, ?, ?, 'in_progress', ?)`,
            [tenantId, filename, filepath, isAutomatic ? 'automatic' : 'manual', userId]
        );

        backupId = result.insertId;

        // Crear archivo SQL manualmente con datos filtrados por tenant
        let sqlContent = `-- Backup de ${tenant.nombre_empresa} (${tenant.slug})\n`;
        sqlContent += `-- Fecha: ${new Date().toISOString()}\n`;
        sqlContent += `-- Tenant ID: ${tenantId}\n\n`;
        sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;

        // Tablas a respaldar (filtradas por id_tenant)
        const tables = [
            'usuarios',
            'productos',
            'categorias',
            'pedidos',
            'detalle_pedidos',
            'auditoria',
            'notificaciones',
            'backup_log'
        ];

        for (const table of tables) {
            // Obtener estructura de la tabla
            const [createTable] = await connection.execute(`SHOW CREATE TABLE ${table}`);
            sqlContent += `-- Estructura de tabla ${table}\n`;
            sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            sqlContent += createTable[0]['Create Table'] + ';\n\n';

            // Obtener datos filtrados por tenant
            const [rows] = await connection.execute(`SELECT * FROM ${table} WHERE id_tenant = ?`, [tenantId]);

            if (rows.length > 0) {
                sqlContent += `-- Datos de tabla ${table}\n`;
                sqlContent += `LOCK TABLES \`${table}\` WRITE;\n`;

                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        return val;
                    });

                    sqlContent += `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
                }

                sqlContent += `UNLOCK TABLES;\n\n`;
            }
        }

        // Agregar datos del tenant
        const [tenantData] = await connection.execute('SELECT * FROM tenants WHERE id_tenant = ?', [tenantId]);
        if (tenantData.length > 0) {
            sqlContent += `-- Datos del tenant\n`;
            sqlContent += `INSERT INTO tenants VALUES (${Object.values(tenantData[0]).map(v => typeof v === 'string' ? `'${v}'` : v).join(', ')});\n\n`;
        }

        sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;

        // Escribir archivo
        fs.writeFileSync(filepath, sqlContent, 'utf8');

        const stats = fs.statSync(filepath);
        const fileSize = stats.size;

        if (fileSize === 0) {
            throw new Error('Backup file is empty');
        }

        // Actualizar registro como exitoso
        await connection.execute(
            `UPDATE backup_log SET status = 'success', file_size = ? WHERE id_backup = ?`,
            [fileSize, backupId]
        );

        await connection.end();

        console.log(`✅ Backup creado exitosamente: ${filename}`);
        console.log(`📦 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

        return {
            success: true,
            filename,
            filepath,
            size: fileSize
        };

    } catch (error) {
        console.error('❌ Error creando backup:', error);

        if (backupId && connection) {
            try {
                await connection.execute(
                    `UPDATE backup_log SET status = 'failed', error_message = ? WHERE id_backup = ?`,
                    [error.message, backupId]
                );
            } catch (dbError) {
                console.error('Error actualizando estado en BD:', dbError);
            }
        }

        if (connection) {
            try {
                await connection.end();
            } catch (e) {
                // Ignorar
            }
        }

        throw error;
    }
}

if (require.main === module) {
    const tenantId = process.argv[2] || 1;
    createTenantBackup(parseInt(tenantId), null, false)
        .then(() => {
            console.log('✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { createTenantBackup };
