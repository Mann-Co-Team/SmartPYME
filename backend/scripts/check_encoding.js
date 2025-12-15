require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function checkEncoding() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    console.log('=== TENANTS ===');
    const [tenants] = await connection.execute('SELECT id_tenant, nombre_empresa, slug FROM tenants');
    console.table(tenants);

    console.log('\n=== CHARACTER SET ===');
    const [charset] = await connection.execute("SHOW VARIABLES LIKE 'character_set%'");
    console.table(charset);

    console.log('\n=== TABLE CHARSET ===');
    const [tableCharset] = await connection.execute("SHOW CREATE TABLE tenants");
    console.log(tableCharset[0]['Create Table']);

    await connection.end();
}

checkEncoding().catch(console.error);
