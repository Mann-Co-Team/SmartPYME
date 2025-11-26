require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpyme',
    port: process.env.DB_PORT || 3306
};

async function checkSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('DESCRIBE notificaciones');
        console.log('Columnas ID en notificaciones:');
        rows.forEach(row => {
            if (row.Field.startsWith('id_')) {
                console.log(`${row.Field} - Null: ${row.Null} - Default: ${row.Default}`);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkSchema();
