// Script de Backup de Base de Datos - SIN COMPRESIÓN
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

async function createBackup(tenantId = null, userId = null, isAutomatic = false) {
    let backupId;
    let connection;

    try {
        console.log('🔄 Iniciando backup de base de datos...');

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
        let tenantSlug = 'all';
        if (tenantId) {
            const [tenants] = await connection.execute(
                'SELECT slug FROM tenants WHERE id_tenant = ?',
                [tenantId]
            );
            if (tenants.length > 0) {
                tenantSlug = tenants[0].slug;
            }
        }

        // Formato de fecha legible: YYYY-MM-DD_HH-mm-ss
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

        const filename = `backup_${tenantSlug}_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);

        const [result] = await connection.execute(
            `INSERT INTO backup_log (id_tenant, filename, filepath, backup_type, status, created_by) VALUES (?, ?, ?, ?, 'in_progress', ?)`,
            [tenantId || 1, filename, filepath, isAutomatic ? 'automatic' : 'manual', userId]
        );

        backupId = result.insertId;

        // Crear backup SQL
        console.log('📝 Creando backup SQL...');
        const command = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe" -u${DB_USER} "-p${DB_PASSWORD}" ${DB_NAME} --single-transaction --skip-lock-tables --result-file="${filepath}"`;

        try {
            execSync(command, { stdio: 'pipe' });
        } catch (execError) {
            if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
                throw new Error(`mysqldump failed: ${execError.message}`);
            }
        }

        const stats = fs.statSync(filepath);
        const fileSize = stats.size;

        if (fileSize === 0) {
            throw new Error('Backup file is empty');
        }

        console.log(`✅ Backup creado: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

        await connection.execute(
            `UPDATE backup_log SET status = 'success', file_size = ? WHERE id_backup = ?`,
            [fileSize, backupId]
        );

        await connection.end();

        console.log(`✅ Backup creado exitosamente: ${filename}`);
        console.log(`📦 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

        await cleanOldBackups();

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

async function cleanOldBackups() {
    try {
        if (!fs.existsSync(BACKUP_DIR)) {
            return;
        }

        const files = fs.readdirSync(BACKUP_DIR);
        const now = Date.now();
        const maxAge = RETENTION_DAYS * 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        for (const file of files) {
            if (!file.startsWith('backup_') || !file.endsWith('.sql')) continue;

            const filepath = path.join(BACKUP_DIR, file);

            try {
                const stats = fs.statSync(filepath);
                const age = now - stats.mtimeMs;

                if (age > maxAge) {
                    fs.unlinkSync(filepath);
                    deletedCount++;
                    console.log(`🗑️  Backup antiguo eliminado: ${file}`);
                }
            } catch (err) {
                console.error(`Error procesando ${file}:`, err.message);
            }
        }

        if (deletedCount > 0) {
            console.log(`✅ ${deletedCount} backup(s) antiguo(s) eliminado(s)`);
        }

    } catch (error) {
        console.error('Error limpiando backups antiguos:', error);
    }
}

if (require.main === module) {
    createBackup(1, null, false)
        .then(() => {
            console.log('✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

module.exports = { createBackup, cleanOldBackups };
