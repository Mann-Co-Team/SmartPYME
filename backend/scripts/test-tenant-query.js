require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function testQuery() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conexión establecida\n');

        // Probar consulta simple primero
        console.log('📝 Probando consulta simple...');
        const [simple] = await connection.execute('SELECT * FROM tenants');
        console.log(`✅ Consulta simple: ${simple.length} tenants encontrados\n`);

        // Probar consulta con subconsultas (la que falla)
        console.log('📝 Probando consulta con subconsultas...');
        const [complex] = await connection.execute(`
            SELECT 
                t.*,
                (SELECT COUNT(*) FROM usuarios WHERE id_tenant = t.id_tenant AND activo = TRUE) as total_usuarios,
                (SELECT COUNT(*) FROM productos WHERE id_tenant = t.id_tenant AND activo = TRUE) as total_productos
            FROM tenants t
            ORDER BY t.created_at DESC
        `);
        console.log(`✅ Consulta compleja: ${complex.length} tenants con estadísticas`);
        console.log(JSON.stringify(complex, null, 2));

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testQuery();
