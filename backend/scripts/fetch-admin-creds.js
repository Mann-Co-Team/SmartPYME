const mysql = require('mysql2/promise');
require('dotenv').config();

async function fetchAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        const [rows] = await connection.execute(
            'SELECT email FROM usuarios WHERE id_tenant = 18 AND id_rol = 1'
        );

        if (rows.length > 0) {
            console.log('Admin Email:', rows[0].email);
        } else {
            console.log('No admin found for tenant 18');
        }
    } catch (error) {
        console.error(error);
    } finally {
        await connection.end();
    }
}

fetchAdmin();
