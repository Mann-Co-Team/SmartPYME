const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarTienda(slug) {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'smartpyme_db'
    });

    console.log(`\n🏪 VERIFICANDO TIENDA: ${slug}\n`);

    // Obtener info del tenant
    const [tenant] = await conn.execute('SELECT * FROM tenants WHERE slug = ?', [slug]);
    if (tenant.length === 0) {
        console.log('❌ Tienda no encontrada');
        await conn.end();
        return;
    }

    const tenantId = tenant[0].id_tenant;
    console.log(`ID Tenant: ${tenantId}`);
    console.log(`Nombre: ${tenant[0].nombre_empresa}`);
    console.log(`Plan: ${tenant[0].plan}\n`);

    // Verificar categorías
    const [categorias] = await conn.execute(
        'SELECT id_categoria, nombre, activo FROM categorias WHERE id_tenant = ?',
        [tenantId]
    );
    console.log(`📋 CATEGORÍAS (${categorias.length}):`);
    categorias.forEach(cat => {
        console.log(`  - ${cat.nombre} (ID: ${cat.id_categoria}) ${cat.activo ? '✅' : '❌'}`);
    });

    // Verificar productos
    const [productos] = await conn.execute(
        'SELECT id_producto, nombre, precio, stock, imagen, activo FROM productos WHERE id_tenant = ?',
        [tenantId]
    );
    console.log(`\n📦 PRODUCTOS (${productos.length}):`);
    productos.forEach(prod => {
        const imagen = prod.imagen ? '🖼️' : '❌';
        console.log(`  ${imagen} ${prod.nombre}`);
        console.log(`     Precio: $${prod.precio} | Stock: ${prod.stock} | Activo: ${prod.activo ? '✅' : '❌'}`);
        if (prod.imagen) {
            console.log(`     Imagen: ${prod.imagen}`);
        }
    });

    // Verificar usuarios
    const [usuarios] = await conn.execute(
        'SELECT COUNT(*) as count, id_rol FROM usuarios WHERE id_tenant = ? GROUP BY id_rol',
        [tenantId]
    );
    console.log(`\n👥 USUARIOS:`);
    usuarios.forEach(u => {
        const rol = u.id_rol === 1 ? 'Admin' : u.id_rol === 2 ? 'Empleado' : 'Cliente';
        console.log(`  - ${rol}: ${u.count}`);
    });

    await conn.end();
}

async function verificarTodas() {
    const tiendas = [
        'pasteleria-dulce-sabor',
        'electrotech-premium',
        'boutique-fashion-elite',
        'demo'
    ];

    for (const slug of tiendas) {
        await verificarTienda(slug);
    }
}

verificarTodas();
