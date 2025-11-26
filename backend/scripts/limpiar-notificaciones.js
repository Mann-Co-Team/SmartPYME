require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpyme',
    port: process.env.DB_PORT || 3306
};

async function limpiarNotificaciones() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Eliminando todas las notificaciones...');
        const [result] = await connection.execute('DELETE FROM notificaciones');

        console.log(`✅ Se eliminaron ${result.affectedRows} notificaciones.`);

    } catch (error) {
        console.error('❌ Error al limpiar notificaciones:', error);
    } finally {
        if (connection) await connection.end();
    }
}

limpiarNotificaciones();
