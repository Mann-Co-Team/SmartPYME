const mysql = require('mysql2/promise');
require('dotenv').config();

async function arreglarEstructura() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos');

        // Deshabilitar foreign key checks temporalmente
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Agregar id_tenant a usuarios si no existe
        console.log('📝 Verificando columna id_tenant en usuarios...');
        const [usuariosCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'usuarios' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (usuariosCol.length === 0) {
            console.log('   Agregando id_tenant a usuarios...');
            await connection.execute(`
                ALTER TABLE usuarios 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER id_usuario
            `);
            await connection.execute(`
                ALTER TABLE usuarios 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a usuarios');
        } else {
            console.log('✅ id_tenant ya existe en usuarios');
        }

        // 2. Agregar id_tenant a clientes si no existe
        console.log('📝 Verificando columna id_tenant en clientes...');
        const [clientesCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'clientes' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (clientesCol.length === 0) {
            console.log('   Agregando id_tenant a clientes...');
            await connection.execute(`
                ALTER TABLE clientes 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER id_cliente
            `);
            await connection.execute(`
                ALTER TABLE clientes 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a clientes');
        } else {
            console.log('✅ id_tenant ya existe en clientes');
        }

        // 3. Agregar id_tenant a categorias si no existe
        console.log('📝 Verificando columna id_tenant en categorias...');
        const [categoriasCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'categorias' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (categoriasCol.length === 0) {
            console.log('   Agregando id_tenant a categorias...');
            await connection.execute(`
                ALTER TABLE categorias 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER id_categoria
            `);
            await connection.execute(`
                ALTER TABLE categorias 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a categorias');
        } else {
            console.log('✅ id_tenant ya existe en categorias');
        }

        // 4. Agregar id_tenant a productos si no existe
        console.log('📝 Verificando columna id_tenant en productos...');
        const [productosCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'productos' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (productosCol.length === 0) {
            console.log('   Agregando id_tenant a productos...');
            await connection.execute(`
                ALTER TABLE productos 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER id_producto
            `);
            await connection.execute(`
                ALTER TABLE productos 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a productos');
        } else {
            console.log('✅ id_tenant ya existe en productos');
        }

        // 5. Agregar id_tenant a notificaciones si no existe
        console.log('📝 Verificando columna id_tenant en notificaciones...');
        const [notificacionesCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'notificaciones' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (notificacionesCol.length === 0) {
            console.log('   Agregando id_tenant a notificaciones...');
            await connection.execute(`
                ALTER TABLE notificaciones 
                ADD COLUMN id_tenant INT NULL AFTER id_notificacion
            `);
            await connection.execute(`
                ALTER TABLE notificaciones 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a notificaciones');
        } else {
            console.log('✅ id_tenant ya existe en notificaciones');
        }

        // 6. Agregar id_tenant a settings si no existe
        console.log('📝 Verificando columna id_tenant en settings...');
        const [settingsCol] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'settings' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (settingsCol.length === 0) {
            console.log('   Agregando id_tenant a settings...');
            await connection.execute(`
                ALTER TABLE settings 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER id
            `);
            await connection.execute(`
                ALTER TABLE settings 
                ADD FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('✅ id_tenant agregado a settings');
        } else {
            console.log('✅ id_tenant ya existe en settings');
        }

        // Reactivar foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        console.log('');
        console.log('🎉 Estructura de base de datos corregida');
        console.log('✅ Todas las tablas ahora tienen el campo id_tenant');
        console.log('');
        console.log('📝 Siguiente paso: Ejecutar node restaurar-datos.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
arreglarEstructura()
    .then(() => {
        console.log('✨ Proceso completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
