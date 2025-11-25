const mysql = require('mysql2/promise');
require('dotenv').config();

async function ver() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    const [cols] = await conn.execute('DESCRIBE clientes');
    console.log('Columnas de clientes:');
    cols.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`);
    });

    await conn.end();
}

ver();
