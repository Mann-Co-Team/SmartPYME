const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Script para restaurar el backup y luego agregar tabla auditoria
 */
async function restoreAndMigrate() {
    let connection;

    try {
        console.log('🔄 Conectando a la base de datos...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db',
            multipleStatements: true
        });

        console.log('✅ Conexión establecida\n');

        // Buscar el archivo de backup más reciente
        const backupDir = path.join(__dirname, '..', 'database');
        const files = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('backup_smartpyme_') && f.endsWith('.sql'))
            .map(f => ({
                name: f,
                path: path.join(backupDir, f),
                time: fs.statSync(path.join(backupDir, f)).mtime
            }))
            .sort((a, b) => b.time - a.time);

        if (files.length === 0) {
            console.log('⚠️  No se encontró archivo de backup');
            console.log('📝 Ejecutando seed-database en su lugar...\n');

            // Ejecutar seed
            const { execSync } = require('child_process');
            execSync('node seed-database.js', { stdio: 'inherit', cwd: __dirname });

        } else {
            const backupFile = files[0];
            console.log(`📦 Restaurando backup: ${backupFile.name}`);
            console.log(`📅 Fecha: ${backupFile.time.toLocaleString('es-CL')}\n`);

            // Leer y ejecutar el backup
            const backupSQL = fs.readFileSync(backupFile.path, 'utf8');
            await connection.query(backupSQL);

            console.log('✅ Backup restaurado exitosamente!\n');
        }

        // Ahora agregar la tabla auditoria
        console.log('🔄 Agregando tabla auditoria...\n');

        const createAuditoriaSQL = `
            CREATE TABLE IF NOT EXISTS auditoria (
                id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
                id_tenant INT NOT NULL,
                id_usuario INT,
                accion VARCHAR(100) NOT NULL,
                modulo VARCHAR(50) NOT NULL,
                descripcion TEXT,
                tabla_afectada VARCHAR(100),
                id_registro INT,
                datos_anteriores JSON,
                datos_nuevos JSON,
                ip_address VARCHAR(45),
                user_agent TEXT,
                resultado ENUM('exito', 'fallo') DEFAULT 'exito',
                mensaje_error TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
                INDEX idx_tenant (id_tenant),
                INDEX idx_usuario (id_usuario),
                INDEX idx_accion (accion),
                INDEX idx_modulo (modulo),
                INDEX idx_tabla (tabla_afectada),
                INDEX idx_resultado (resultado),
                INDEX idx_created_at (created_at DESC),
                INDEX idx_tenant_fecha (id_tenant, created_at DESC)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(createAuditoriaSQL);
        console.log('✅ Tabla auditoria creada\n');

        // Verificar datos
        const [tenants] = await connection.execute('SELECT COUNT(*) as count FROM tenants');
        const [usuarios] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
        const [productos] = await connection.execute('SELECT COUNT(*) as count FROM productos');

        console.log('📊 Datos restaurados:');
        console.log(`   - Tenants: ${tenants[0].count}`);
        console.log(`   - Usuarios: ${usuarios[0].count}`);
        console.log(`   - Productos: ${productos[0].count}`);

        // Mostrar usuarios admin
        const [admins] = await connection.execute(
            'SELECT nombre, email FROM usuarios WHERE id_rol = 1 LIMIT 3'
        );

        console.log('\n👤 Usuarios Admin disponibles:');
        admins.forEach(admin => {
            console.log(`   - ${admin.nombre} (${admin.email})`);
        });

        console.log('\n✅ Base de datos lista para usar!');
        console.log('🔑 Contraseña por defecto: admin123\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

// Ejecutar
restoreAndMigrate()
    .then(() => {
        console.log('🎉 Proceso completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
