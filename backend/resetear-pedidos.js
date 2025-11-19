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

async function resetearPedidos() {
  try {
    console.log('🗑️  Eliminando pedidos existentes...');
    
    // Eliminar detalle de pedidos primero (FK constraint)
    await pool.execute('DELETE FROM detalle_pedidos');
    console.log('✅ Detalle de pedidos eliminado');
    
    // Eliminar pedidos
    await pool.execute('DELETE FROM pedidos');
    console.log('✅ Pedidos eliminados');
    
    // Resetear el auto_increment
    await pool.execute('ALTER TABLE pedidos AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE detalle_pedidos AUTO_INCREMENT = 1');
    console.log('✅ IDs reseteados');
    
    console.log('\n📦 Creando nuevos pedidos de prueba...\n');
    
    // Obtener el cliente Juan Pérez
    const [cliente] = await pool.execute(
      'SELECT id_cliente FROM clientes WHERE email = ?',
      ['juan.perez@ejemplo.com']
    );
    
    if (cliente.length === 0) {
      console.log('❌ Cliente Juan Pérez no encontrado');
      return;
    }
    
    const clienteId = cliente[0].id_cliente;
    
    // Obtener el estado "Pendiente"
    const [estadoPendiente] = await pool.execute(
      'SELECT id_estado FROM estados_pedido WHERE nombre_estado = ?',
      ['Pendiente']
    );
    
    const idEstadoPendiente = estadoPendiente[0].id_estado;
    
    // Obtener algunos productos
    const [productos] = await pool.execute(
      'SELECT id_producto, nombre, precio, stock FROM productos WHERE activo = 1 AND stock > 0 LIMIT 5'
    );
    
    if (productos.length === 0) {
      console.log('❌ No hay productos disponibles');
      return;
    }
    
    // PEDIDO 1: Un producto - PENDIENTE
    console.log('📝 Creando Pedido 1: Un producto (Pendiente)');
    const producto1 = productos[0];
    const cantidad1 = 1;
    const total1 = producto1.precio * cantidad1;
    
    const [pedido1] = await pool.execute(
      `INSERT INTO pedidos (id_cliente, id_estado, numero_pedido, fecha_pedido, total, metodo_pago, metodo_entrega, notas)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [clienteId, idEstadoPendiente, 'PED-20251119-0001', total1, 'efectivo', 'pickup', 'Pedido de prueba 1']
    );
    
    await pool.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [pedido1.insertId, producto1.id_producto, cantidad1, producto1.precio, total1]
    );
    
    console.log(`✅ Pedido #${pedido1.insertId} creado: ${producto1.nombre} x${cantidad1} = $${total1}`);
    
    // PEDIDO 2: Dos productos - PENDIENTE
    console.log('\n📝 Creando Pedido 2: Dos productos (Pendiente)');
    const producto2a = productos[1];
    const producto2b = productos[2];
    const cantidad2a = 2;
    const cantidad2b = 1;
    const total2 = (producto2a.precio * cantidad2a) + (producto2b.precio * cantidad2b);
    
    const [pedido2] = await pool.execute(
      `INSERT INTO pedidos (id_cliente, id_estado, numero_pedido, fecha_pedido, total, metodo_pago, metodo_entrega, direccion_entrega, notas)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [clienteId, idEstadoPendiente, 'PED-20251119-0002', total2, 'transferencia', 'delivery', 'Calle Falsa 123, Santiago', 'Pedido de prueba 2']
    );
    
    await pool.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [pedido2.insertId, producto2a.id_producto, cantidad2a, producto2a.precio, producto2a.precio * cantidad2a]
    );
    
    await pool.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [pedido2.insertId, producto2b.id_producto, cantidad2b, producto2b.precio, producto2b.precio * cantidad2b]
    );
    
    console.log(`✅ Pedido #${pedido2.insertId} creado:`);
    console.log(`   - ${producto2a.nombre} x${cantidad2a} = $${producto2a.precio * cantidad2a}`);
    console.log(`   - ${producto2b.nombre} x${cantidad2b} = $${producto2b.precio * cantidad2b}`);
    console.log(`   Total: $${total2}`);
    
    // PEDIDO 3: Tres productos - PENDIENTE
    console.log('\n📝 Creando Pedido 3: Tres productos (Pendiente)');
    const producto3a = productos[0];
    const producto3b = productos[3];
    const producto3c = productos[4];
    const cantidad3a = 1;
    const cantidad3b = 2;
    const cantidad3c = 1;
    const total3 = (producto3a.precio * cantidad3a) + (producto3b.precio * cantidad3b) + (producto3c.precio * cantidad3c);
    
    const [pedido3] = await pool.execute(
      `INSERT INTO pedidos (id_cliente, id_estado, numero_pedido, fecha_pedido, total, metodo_pago, metodo_entrega, notas)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [clienteId, idEstadoPendiente, 'PED-20251119-0003', total3, 'tarjeta', 'pickup', 'Pedido de prueba 3']
    );
    
    await pool.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
      [
        pedido3.insertId, producto3a.id_producto, cantidad3a, producto3a.precio, producto3a.precio * cantidad3a,
        pedido3.insertId, producto3b.id_producto, cantidad3b, producto3b.precio, producto3b.precio * cantidad3b,
        pedido3.insertId, producto3c.id_producto, cantidad3c, producto3c.precio, producto3c.precio * cantidad3c
      ]
    );
    
    console.log(`✅ Pedido #${pedido3.insertId} creado:`);
    console.log(`   - ${producto3a.nombre} x${cantidad3a}`);
    console.log(`   - ${producto3b.nombre} x${cantidad3b}`);
    console.log(`   - ${producto3c.nombre} x${cantidad3c}`);
    console.log(`   Total: $${total3}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ¡PEDIDOS CREADOS EXITOSAMENTE!');
    console.log('='.repeat(60));
    console.log('\n🎯 Todos los pedidos están en estado PENDIENTE');
    console.log('🔗 Accede a http://localhost:5173/pedidos para verlos');
    console.log('🔴 Deberías ver el botón "Cancelar Pedido" en cada uno\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetearPedidos();
