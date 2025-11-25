const mysql = require('mysql2/promise');
require('dotenv').config();

async function createNotificationsTable() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db',
            port: process.env.DB_PORT || 3306
        });

        console.log('📦 Creando tabla notificaciones...');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notificaciones (
                id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                titulo VARCHAR(200) NOT NULL,
                mensaje TEXT NOT NULL,
                leida BOOLEAN DEFAULT FALSE,
                id_referencia INT,
                tipo_referencia VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
            )
        `);

        console.log('✅ Tabla notificaciones creada');

        // Crear índices (sin IF NOT EXISTS en MySQL)
        try {
            await connection.execute(`
                CREATE INDEX idx_usuario_leida ON notificaciones(id_usuario, leida)
            `);
            await connection.execute(`
                CREATE INDEX idx_created_at ON notificaciones(created_at DESC)
            `);
            console.log('✅ Índices creados');
        } catch (indexError) {
            if (indexError.code === 'ER_DUP_KEYNAME') {
                console.log('ℹ️ Índices ya existen');
            } else {
                throw indexError;
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

createNotificationsTable();
