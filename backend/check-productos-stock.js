require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
    
    const [prods] = await conn.execute(
        'SELECT id_producto, nombre, precio, stock FROM productos WHERE id_tenant = 18 AND activo = 1 ORDER BY stock DESC'
    );
    
    console.log('\n📦 Productos en Pastelería Dulce Sabor:\n');
    prods.forEach(p => {
        console.log(`  ID: ${p.id_producto.toString().padEnd(4)} - ${p.nombre.padEnd(30)} - Stock: ${p.stock.toString().padEnd(3)} - $${p.precio}`);
    });
    
    console.log(`\n✅ Total: ${prods.length} productos`);
    console.log(`📊 Con stock: ${prods.filter(p => p.stock > 0).length} productos\n`);
    
    await conn.end();
})().catch(console.error);
