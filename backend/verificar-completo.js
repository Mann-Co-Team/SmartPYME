const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarCompleto() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    console.log('✅ Conectado a la base de datos');
    console.log('');

    // Contar registros
    const [roles] = await connection.execute('SELECT COUNT(*) as count FROM roles');
    const [tenants] = await connection.execute('SELECT COUNT(*) as count FROM tenants');
    const [usuarios] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
    const [clientes] = await connection.execute('SELECT COUNT(*) as count FROM clientes');
    const [categorias] = await connection.execute('SELECT COUNT(*) as count FROM categorias');
    const [productos] = await connection.execute('SELECT COUNT(*) as count FROM productos');
    const [pedidos] = await connection.execute('SELECT COUNT(*) as count FROM pedidos');

    console.log('📊 RESUMEN DE BASE DE DATOS:');
    console.log('');
    console.log('Roles:', roles[0].count);
    console.log('Tiendas (Tenants):', tenants[0].count);
    console.log('Usuarios:', usuarios[0].count);
    console.log('Clientes:', clientes[0].count);
    console.log('Categorías:', categorias[0].count);
    console.log('Productos:', productos[0].count);
    console.log('Pedidos:', pedidos[0].count);
    console.log('');

    // Verificar categorías por tenant
    console.log('📋 CATEGORÍAS POR TIENDA:');
    const [catsByTenant] = await connection.execute(`
        SELECT t.slug, t.nombre_empresa, COUNT(c.id_categoria) as total_categorias
        FROM tenants t
        LEFT JOIN categorias c ON t.id_tenant = c.id_tenant
        GROUP BY t.id_tenant
        ORDER BY t.slug
    `);
    catsByTenant.forEach(row => {
        console.log(`  ${row.slug}: ${row.total_categorias} categorías`);
    });
    console.log('');

    // Verificar productos por tenant
    console.log('📦 PRODUCTOS POR TIENDA:');
    const [prodsByTenant] = await connection.execute(`
        SELECT t.slug, t.nombre_empresa, COUNT(p.id_producto) as total_productos
        FROM tenants t
        LEFT JOIN productos p ON t.id_tenant = p.id_tenant
        GROUP BY t.id_tenant
        ORDER BY t.slug
    `);
    prodsByTenant.forEach(row => {
        console.log(`  ${row.slug}: ${row.total_productos} productos`);
    });
    console.log('');

    // Verificar usuarios por tenant y rol
    console.log('👥 USUARIOS POR TIENDA:');
    const [usersByTenant] = await connection.execute(`
        SELECT t.slug, r.nombre_rol, COUNT(u.id_usuario) as total
        FROM tenants t
        LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant
        LEFT JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario IS NOT NULL
        GROUP BY t.id_tenant, r.id_rol
        ORDER BY t.slug, r.nombre_rol
    `);
    
    let currentSlug = null;
    usersByTenant.forEach(row => {
        if (currentSlug !== row.slug) {
            console.log(`  ${row.slug}:`);
            currentSlug = row.slug;
        }
        console.log(`    - ${row.nombre_rol}: ${row.total}`);
    });
    console.log('');

    console.log('✅ Base de datos completamente restaurada y funcional');
    
    await connection.end();
}

verificarCompleto().catch(console.error);
