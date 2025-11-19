const db = require('./config/db');

async function crearPedidosPrueba() {
  try {
    console.log('🔧 Creando pedidos de prueba...\n');

    // Obtener un cliente existente
    const [clientes] = await db.execute(
      'SELECT id_cliente FROM clientes LIMIT 1'
    );

    if (clientes.length === 0) {
      console.log('❌ No hay clientes en la base de datos');
      return;
    }

    const idCliente = clientes[0].id_cliente;
    console.log(`👤 Cliente ID: ${idCliente}`);

    // Obtener algunos productos
    const [productos] = await db.execute(
      'SELECT id_producto, precio FROM productos WHERE activo = TRUE LIMIT 3'
    );

    if (productos.length === 0) {
      console.log('❌ No hay productos en la base de datos');
      return;
    }

    // Crear pedido en estado PENDIENTE
    console.log('\n📦 Creando pedido en estado PENDIENTE...');
    const [resultPendiente] = await db.execute(
      `INSERT INTO pedidos (
        id_cliente, total, metodo_entrega, direccion_entrega, 
        metodo_pago, id_estado, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idCliente,
        productos[0].precio * 2,
        'delivery',
        'Calle Falsa 123, Ciudad',
        'efectivo',
        1, // Pendiente
        'Pedido de prueba en estado PENDIENTE'
      ]
    );
    const idPedidoPendiente = resultPendiente.insertId;

    // Agregar productos al pedido pendiente
    await db.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [idPedidoPendiente, productos[0].id_producto, 2, productos[0].precio, productos[0].precio * 2]
    );

    // Registrar en historial (id_usuario = 1 para admin)
    await db.execute(
      `INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
       VALUES (?, ?, ?, ?)`,
      [idPedidoPendiente, 1, 1, 'Pedido creado']
    );

    console.log(`✅ Pedido #${idPedidoPendiente} creado en estado PENDIENTE`);

    // Crear pedido en estado EN PROCESO
    console.log('\n📦 Creando pedido en estado EN PROCESO...');
    const [resultProceso] = await db.execute(
      `INSERT INTO pedidos (
        id_cliente, total, metodo_entrega, direccion_entrega, 
        metodo_pago, id_estado, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idCliente,
        productos[1].precio * 3,
        'pickup',
        null,
        'tarjeta',
        3, // En Proceso
        'Pedido de prueba en estado EN PROCESO'
      ]
    );
    const idPedidoProceso = resultProceso.insertId;

    // Agregar productos al pedido en proceso
    await db.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [idPedidoProceso, productos[1].id_producto, 3, productos[1].precio, productos[1].precio * 3]
    );

    // Registrar historial completo (Pendiente -> Confirmado -> En Proceso)
    await db.execute(
      `INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
       VALUES 
       (?, 1, 1, 'Pedido creado'),
       (?, 2, 1, 'Pedido confirmado por administrador'),
       (?, 3, 1, 'Pedido en proceso de preparación')`,
      [
        idPedidoProceso,
        idPedidoProceso,
        idPedidoProceso
      ]
    );

    console.log(`✅ Pedido #${idPedidoProceso} creado en estado EN PROCESO`);

    // Crear pedido en estado CONFIRMADO (para poder cancelarlo fácilmente)
    console.log('\n📦 Creando pedido en estado CONFIRMADO (listo para cancelar)...');
    const [resultConfirmado] = await db.execute(
      `INSERT INTO pedidos (
        id_cliente, total, metodo_entrega, direccion_entrega, 
        metodo_pago, id_estado, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idCliente,
        productos[2].precio * 1,
        'delivery',
        'Avenida Siempre Viva 742',
        'transferencia',
        2, // Confirmado
        'Pedido de prueba en estado CONFIRMADO (listo para cancelar)'
      ]
    );
    const idPedidoConfirmado = resultConfirmado.insertId;

    // Agregar productos
    await db.execute(
      `INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [idPedidoConfirmado, productos[2].id_producto, 1, productos[2].precio, productos[2].precio]
    );

    // Registrar historial
    await db.execute(
      `INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
       VALUES 
       (?, 1, 1, 'Pedido creado'),
       (?, 2, 1, 'Pedido confirmado')`,
      [
        idPedidoConfirmado,
        idPedidoConfirmado
      ]
    );

    console.log(`✅ Pedido #${idPedidoConfirmado} creado en estado CONFIRMADO`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ PEDIDOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`
📋 RESUMEN:
   • Pedido #${idPedidoPendiente} - PENDIENTE (puede cambiar a Confirmado o Cancelado)
   • Pedido #${idPedidoProceso} - EN PROCESO (puede cambiar a Listo o Cancelado)
   • Pedido #${idPedidoConfirmado} - CONFIRMADO (puede cambiar a En Proceso o Cancelado)

🎯 PRUEBAS SUGERIDAS:
   1. Ve a http://localhost:5173/admin/pedidos
   2. Deberías ver el botón "Cambiar Estado" en cada pedido
   3. Haz clic en "Ver Detalle" para ver el historial de estados
   4. Prueba cambiar el estado de cada pedido
    `);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

crearPedidosPrueba();
