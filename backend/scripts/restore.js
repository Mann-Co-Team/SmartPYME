// Script de Restauración SEGURA de Backups
// Enfoque de 2 pasos: Test DB → Producción
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

/**
 * PASO 1: Restaurar backup a base de datos de prueba
 * Esto permite verificar el backup sin afectar producción
 */
async function restoreToTestDatabase(backupFilePath, tenantId) {
    console.log('🔄 Iniciando restauración a base de datos de prueba...');

    const testDbName = 'smartpyme_db_test';

    try {
        // Verificar que el archivo existe
        if (!fs.existsSync(backupFilePath)) {
            const error = `Archivo de backup no encontrado: ${backupFilePath}`;
            console.error('❌', error);
            throw new Error(error);
        }

        console.log(`📂 Archivo de backup: ${backupFilePath}`);
        console.log(`🗄️ Base de datos de prueba: ${testDbName}`);

        // Crear conexión a MySQL
        let connection;
        try {
            connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'Rocketn3m3s1s.'
            });
            console.log('✅ Conexión a MySQL establecida');
        } catch (connError) {
            console.error('❌ Error conectando a MySQL:', connError.message);
            throw new Error(`Error de conexión a MySQL: ${connError.message}`);
        }

        // Eliminar BD de prueba si existe
        try {
            console.log('🗑️ Eliminando BD de prueba anterior si existe...');
            await connection.query(`DROP DATABASE IF EXISTS ${testDbName}`);
            console.log('✅ BD de prueba anterior eliminada');
        } catch (dropError) {
            console.error('❌ Error eliminando BD de prueba:', dropError.message);
            await connection.end();
            throw new Error(`Error eliminando BD de prueba: ${dropError.message}`);
        }

        // Crear nueva BD de prueba
        try {
            console.log('📦 Creando nueva BD de prueba...');
            await connection.query(`CREATE DATABASE ${testDbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ BD de prueba creada');
        } catch (createError) {
            console.error('❌ Error creando BD de prueba:', createError.message);
            await connection.end();
            throw new Error(`Error creando BD de prueba: ${createError.message}`);
        }

        await connection.end();

        // Restaurar backup en BD de prueba
        console.log('⚡ Restaurando backup en BD de prueba...');
        const restoreCommand = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe" -u root "-pRocketn3m3s1s." "${testDbName}" < "${backupFilePath}"`;

        console.log('📝 Comando:', restoreCommand.replace('Rocketn3m3s1s.', '***'));

        try {
            execSync(restoreCommand, {
                stdio: 'pipe',
                encoding: 'utf-8',
                shell: 'cmd.exe'
            });
            console.log('✅ Comando de restauración ejecutado');
        } catch (execError) {
            console.error('❌ Error ejecutando comando de restauración:', execError.message);
            throw new Error(`Error ejecutando restauración: ${execError.message}`);
        }

        console.log('✅ Backup restaurado exitosamente en BD de prueba');

        // Verificar que la restauración fue exitosa
        let verifyConnection;
        try {
            verifyConnection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'Rocketn3m3s1s.',
                database: testDbName
            });

            const [tables] = await verifyConnection.query('SHOW TABLES');
            console.log(`✅ Verificación: ${tables.length} tablas restauradas`);

            await verifyConnection.end();

            return {
                success: true,
                message: 'Backup restaurado exitosamente en base de datos de prueba',
                testDbName,
                tablesCount: tables.length
            };
        } catch (verifyError) {
            console.error('❌ Error verificando restauración:', verifyError.message);
            if (verifyConnection) await verifyConnection.end();
            throw new Error(`Error verificando restauración: ${verifyError.message}`);
        }

    } catch (error) {
        console.error('❌ Error restaurando a BD de prueba:', error);
        throw error;
    }
}

/**
 * PASO 2: Promover base de datos de prueba a producción
 * Usa dump de la BD de prueba y restaura en producción
 */
async function promoteTestToProduction(tenantId, userId) {
    console.log('⚠️ Iniciando promoción de BD de prueba a producción...');

    const prodDbName = 'smartpyme_db';
    const testDbName = 'smartpyme_db_test';

    // Formato de fecha en español: YYYY-MM-DD_HH-mm-ss
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rocketn3m3s1s.'
        });

        // Verificar que BD de prueba existe
        const [testDbs] = await connection.query(
            `SHOW DATABASES LIKE '${testDbName}'`
        );

        if (testDbs.length === 0) {
            await connection.end();
            throw new Error('Base de datos de prueba no existe. Primero debes restaurar a prueba.');
        }

        console.log('📦 Creando backup de producción actual...');

        // Crear backup de la BD de producción actual con nombre descriptivo
        const backupDir = path.join(__dirname, '../../database/backups');
        const backupFile = path.join(backupDir, `restauracion-backup-seguridad_${timestamp}.sql`);

        // IMPORTANTE: Usar comillas correctas para Windows y --skip-definer para vistas
        const backupCommand = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe" -u root "-pRocketn3m3s1s." --single-transaction --skip-lock-tables --skip-definer "${prodDbName}" > "${backupFile}"`;

        console.log('📝 Ejecutando backup de seguridad...');

        try {
            execSync(backupCommand, {
                stdio: 'pipe',
                encoding: 'utf-8',
                shell: 'cmd.exe'
            });

            // Verificar que el archivo se creó y no está vacío
            if (!fs.existsSync(backupFile)) {
                throw new Error('El archivo de backup no se creó');
            }

            const stats = fs.statSync(backupFile);
            if (stats.size === 0) {
                throw new Error('El archivo de backup está vacío');
            }

            console.log(`✅ Backup de producción creado: ${backupFile} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (backupError) {
            console.error('❌ Error creando backup de producción:', backupError.message);
            await connection.end();
            throw new Error(`Error creando backup de producción: ${backupError.message}`);
        }

        // Crear dump de la BD de prueba
        console.log('📦 Creando dump de BD de prueba...');
        const testDumpFile = path.join(backupDir, `temp_restauracion_${timestamp}.sql`);

        const testDumpCommand = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe" -u root "-pRocketn3m3s1s." --single-transaction --skip-lock-tables --skip-definer "${testDbName}" > "${testDumpFile}"`;

        try {
            execSync(testDumpCommand, {
                stdio: 'pipe',
                encoding: 'utf-8',
                shell: 'cmd.exe'
            });

            // Verificar que el dump se creó correctamente
            if (!fs.existsSync(testDumpFile)) {
                throw new Error('El dump de prueba no se creó');
            }

            const dumpStats = fs.statSync(testDumpFile);
            if (dumpStats.size === 0) {
                throw new Error('El dump de prueba está vacío');
            }

            console.log(`✅ Dump de BD de prueba creado (${(dumpStats.size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (dumpError) {
            console.error('❌ Error creando dump de BD de prueba:', dumpError.message);
            await connection.end();
            throw new Error(`Error creando dump de BD de prueba: ${dumpError.message}`);
        }

        // Eliminar BD de producción
        console.log('🗑️ Eliminando BD de producción actual...');
        try {
            await connection.query(`DROP DATABASE IF EXISTS ${prodDbName}`);
            console.log('✅ BD de producción eliminada');
        } catch (dropError) {
            console.error('❌ Error eliminando BD de producción:', dropError.message);
            await connection.end();
            // Limpiar archivo temporal
            if (fs.existsSync(testDumpFile)) fs.unlinkSync(testDumpFile);
            throw new Error(`Error eliminando BD de producción: ${dropError.message}`);
        }

        // Crear nueva BD de producción
        console.log('📦 Creando nueva BD de producción...');
        try {
            await connection.query(`CREATE DATABASE ${prodDbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ BD de producción creada');
        } catch (createError) {
            console.error('❌ Error creando BD de producción:', createError.message);
            await connection.end();
            // Limpiar archivo temporal
            if (fs.existsSync(testDumpFile)) fs.unlinkSync(testDumpFile);
            throw new Error(`Error creando BD de producción: ${createError.message}`);
        }

        await connection.end();

        // Restaurar dump en producción
        console.log('⚡ Restaurando datos en producción...');
        const restoreCommand = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe" -u root "-pRocketn3m3s1s." "${prodDbName}" < "${testDumpFile}"`;

        try {
            execSync(restoreCommand, {
                stdio: 'pipe',
                encoding: 'utf-8',
                shell: 'cmd.exe'
            });
            console.log('✅ Datos restaurados en producción');
        } catch (restoreError) {
            console.error('❌ Error restaurando en producción:', restoreError.message);
            // Limpiar archivo temporal
            if (fs.existsSync(testDumpFile)) fs.unlinkSync(testDumpFile);
            throw new Error(`Error restaurando en producción: ${restoreError.message}`);
        }

        // Limpiar archivo temporal
        if (fs.existsSync(testDumpFile)) {
            fs.unlinkSync(testDumpFile);
            console.log('🗑️ Archivo temporal eliminado');
        }

        // Eliminar BD de prueba
        const cleanupConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rocketn3m3s1s.'
        });

        try {
            await cleanupConnection.query(`DROP DATABASE IF EXISTS ${testDbName}`);
            console.log('✅ BD de prueba eliminada');
        } catch (cleanupError) {
            console.error('⚠️ Advertencia eliminando BD de prueba:', cleanupError.message);
        }

        await cleanupConnection.end();

        console.log('✅ Base de datos de prueba promovida a producción exitosamente');
        console.log(`📦 Backup de seguridad guardado en: ${backupFile}`);

        return {
            success: true,
            message: 'Base de datos restaurada exitosamente',
            backupFile
        };

    } catch (error) {
        console.error('❌ Error promoviendo a producción:', error);
        throw error;
    }
}

/**
 * Eliminar base de datos de prueba
 */
async function deleteTestDatabase() {
    console.log('🗑️ Eliminando base de datos de prueba...');

    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Rocketn3m3s1s.'
        });

        await connection.query('DROP DATABASE IF EXISTS smartpyme_db_test');
        await connection.end();

        console.log('✅ Base de datos de prueba eliminada');

        return { success: true };

    } catch (error) {
        console.error('❌ Error eliminando BD de prueba:', error);
        throw error;
    }
}

module.exports = {
    restoreToTestDatabase,
    promoteTestToProduction,
    deleteTestDatabase
};
