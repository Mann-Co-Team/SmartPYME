require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkTenants() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        const [tenants] = await connection.execute('SELECT id_tenant, nombre_empresa, slug, activo FROM tenants');

        console.log('📋 Tenants encontrados:');
        console.log(JSON.stringify(tenants, null, 2));

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTenants();
