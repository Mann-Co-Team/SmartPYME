// Script para insertar pedidos de prueba en diferentes estados
const db = require('./config/db');

async function seedPedidosEstados() {
  const connection = await db.getConnection();
  
  try {
    console.log('🌱 Insertando pedidos de prueba en diferentes estados...\n');

    // 1. Obtener IDs necesarios
    const [clientes] = await connection.execute('SELECT id_cliente FROM clientes LIMIT 1');
    const [usuarios] = await connection.execute('SELECT id_usuario FROM usuarios WHERE id_rol = 1 LIMIT 1');
    const [productos] = await connection.execute('SELECT id_producto, precio FROM productos LIMIT 3');
    const [estados] = await connection.execute('SELECT id_estado, nombre_estado FROM estados_pedido');

    if (clientes.length === 0 || usuarios.length === 0 || productos.length === 0) {
      console.error('❌ No hay datos suficientes en la base de datos');
      console.log('Asegúrate de tener al menos: 1 cliente, 1 usuario admin, 3 productos');
      return;
    }

    const idCliente = clientes[0].id_cliente;
    const idUsuario = usuarios[0].id_usuario;

    console.log('📋 Estados disponibles:');
    estados.forEach(e => console.log(`   - ${e.id_estado}: ${e.nombre_estado}`));
    console.log('');

    // 2. Crear un pedido por cada estado
    for (const estado of estados) {
      await connection.beginTransaction();

      try {
        // Calcular total
        const total = productos.reduce((sum, p) => sum + parseFloat(p.precio), 0);

        // Insertar pedido
        const [result] = await connection.execute(`
          INSERT INTO pedidos (
            id_cliente, id_estado, id_usuario, total, metodo_pago, notas
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          idCliente,
          estado.id_estado,
          idUsuario,
          total,
          'efectivo',
          `Pedido de prueba en estado: ${estado.nombre_estado}`
        ]);

        const idPedido = result.insertId;

        // Insertar detalle del pedido
        for (const producto of productos) {
          const cantidad = 1;
          const subtotal = cantidad * parseFloat(producto.precio);
          await connection.execute(`
            INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
            VALUES (?, ?, ?, ?, ?)
          `, [idPedido, producto.id_producto, cantidad, producto.precio, subtotal]);
        }

        // Insertar en historial (si la tabla existe)
        try {
          await connection.execute(`
            INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
            VALUES (?, ?, ?, ?)
          `, [idPedido, estado.id_estado, idUsuario, `Pedido de prueba creado en estado ${estado.nombre_estado}`]);
        } catch (histErr) {
          console.log(`   ⚠️  Nota: No se pudo insertar historial (tabla puede no existir): ${histErr.message}`);
        }

        await connection.commit();
        console.log(`✅ Pedido #${idPedido} creado en estado: ${estado.nombre_estado}`);
      } catch (err) {
        await connection.rollback();
        console.error(`❌ Error al crear pedido en estado ${estado.nombre_estado}:`, err.message);
      }
    }

    console.log('\n✅ Pedidos de prueba insertados exitosamente');
    console.log('💡 Ahora puedes probar ver el detalle de cada pedido desde el panel de cliente\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedPedidosEstados();
