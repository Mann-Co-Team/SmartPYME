const mysql = require('mysql2/promise');
require('dotenv').config();

async function ver() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    const [cols] = await conn.execute('DESCRIBE productos');
    console.log('Columnas de productos:');
    console.log(cols);

    await conn.end();
}

ver();
