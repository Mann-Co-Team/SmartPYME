const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificar() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    const [roles] = await connection.execute('SELECT * FROM roles');
    console.log('ROLES:', roles);

    const [tenants] = await connection.execute('SELECT * FROM tenants');
    console.log('TENANTS:', tenants);

    const [usuarios] = await connection.execute('SELECT * FROM usuarios');
    console.log('USUARIOS:', usuarios);

    await connection.end();
}

verificar();
