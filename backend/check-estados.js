const mysql = require('mysql2/promise');

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Rocketn3m3s1s.',
        database: 'smartpyme_db'
    });
    
    const [rows] = await conn.execute('SELECT * FROM estados_pedido ORDER BY id_estado');
    console.log('Estados en BD:');
    rows.forEach(r => console.log(`  ${r.id_estado}: ${r.nombre_estado}`));
    
    console.log('\nPedido #16:');
    const [pedido] = await conn.execute('SELECT id_pedido, id_estado FROM pedidos WHERE id_pedido = 16');
    console.log(pedido[0]);
    
    await conn.end();
})().catch(e => console.log('Error:', e.message));
