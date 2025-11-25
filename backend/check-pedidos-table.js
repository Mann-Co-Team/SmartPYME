const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    console.log('\n📋 ESTRUCTURA DE TABLA PEDIDOS:\n');
    const [cols] = await conn.execute('DESCRIBE pedidos');
    cols.forEach(c => {
        console.log(`  ${c.Field.padEnd(20)} ${c.Type.padEnd(20)} ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    await conn.end();
})().catch(console.error);
