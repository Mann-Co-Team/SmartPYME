const mysql = require('mysql2/promise');

// Crear conexión directa con credenciales
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Rocketn3m3s1s.',
  database: 'smartpyme_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function cambiarEstadoPedido() {
  try {
    // Obtener los últimos pedidos del usuario Juan Pérez
    const [pedidos] = await pool.execute(`
      SELECT pedidos.id_pedido as id, pedidos.fecha_pedido as fecha, 
             pedidos.total, estados_pedido.nombre_estado as estado
      FROM pedidos 
      JOIN clientes ON pedidos.id_cliente = clientes.id_cliente 
      JOIN estados_pedido ON pedidos.id_estado = estados_pedido.id_estado
      WHERE clientes.email = ?
      ORDER BY pedidos.id_pedido DESC 
      LIMIT 5
    `, ['juan.perez@ejemplo.com']);

    console.log('\n📋 Pedidos actuales de Juan Pérez:');
    console.table(pedidos);

    if (pedidos.length === 0) {
      console.log('❌ No hay pedidos para modificar');
      process.exit(0);
    }

    // Tomar el primer pedido que no esté pendiente
    const pedidoACambiar = pedidos.find(p => p.estado !== 'Pendiente' && p.estado !== 'Cancelado');
    
    if (!pedidoACambiar) {
      console.log('\n✅ Ya hay un pedido en estado pendiente o todos están cancelados');
      process.exit(0);
    }

    // Obtener el id_estado de "Pendiente"
    const [estadoPendiente] = await pool.execute(
      'SELECT id_estado FROM estados_pedido WHERE nombre_estado = ?',
      ['Pendiente']
    );

    // Cambiar a pendiente
    await pool.execute(
      'UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?',
      [estadoPendiente[0].id_estado, pedidoACambiar.id]
    );

    console.log(`\n✅ Pedido #${pedidoACambiar.id} cambiado de "${pedidoACambiar.estado}" a "pendiente"`);
    console.log('\n🎯 Ahora puedes ir a http://localhost:5173/pedidos y cancelar este pedido');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cambiarEstadoPedido();
