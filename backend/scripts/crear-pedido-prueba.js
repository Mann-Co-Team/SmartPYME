require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartpyme',
    port: process.env.DB_PORT || 3306
};

async function crearPedidoPrueba() {
    let connection;
    try {
        console.log('Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);

        // 1. Obtener un tenant válido
        const [tenants] = await connection.execute('SELECT * FROM tenants LIMIT 1');
        if (tenants.length === 0) throw new Error('No hay tenants creados');
        const tenant = tenants[0];
        console.log(`Usando tenant: ${tenant.nombre_empresa} (ID: ${tenant.id_tenant})`);

        // 2. Obtener un usuario admin para el tenant
        const [users] = await connection.execute('SELECT * FROM usuarios WHERE id_tenant = ? AND id_rol = 1 LIMIT 1', [tenant.id_tenant]);
        if (users.length === 0) throw new Error('No hay usuarios admin para este tenant');
        const user = users[0];
        console.log(`Usando usuario: ${user.nombre} (ID: ${user.id_usuario})`);

        // 3. Obtener un producto con stock
        const [productos] = await connection.execute('SELECT * FROM productos WHERE id_tenant = ? AND stock > 0 LIMIT 1', [tenant.id_tenant]);
        if (productos.length === 0) throw new Error('No hay productos con stock para este tenant');
        const producto = productos[0];
        console.log(`Usando producto: ${producto.nombre} (ID: ${producto.id_producto})`);

        // 4. Obtener o crear un cliente para el tenant
        let [clientes] = await connection.execute('SELECT * FROM clientes WHERE id_tenant = ? LIMIT 1', [tenant.id_tenant]);
        let clienteId;

        if (clientes.length === 0) {
            console.log('Creando cliente de prueba...');
            try {
                const [resCliente] = await connection.execute(`
                    INSERT INTO clientes (id_tenant, nombre, apellido, email, telefono, direccion, created_at)
                    VALUES (?, 'Cliente', 'Prueba', 'cliente@prueba.com', '123456789', 'Calle Falsa 123', NOW())
                `, [tenant.id_tenant]);
                clienteId = resCliente.insertId;
            } catch (err) {
                console.error('Error creando cliente:', err.message);
                throw err;
            }
        } else {
            clienteId = clientes[0].id_cliente;
            console.log(`Usando cliente existente: ${clientes[0].nombre} (ID: ${clienteId})`);
        }

        const numeroPedido = `PED-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;

        // 5. Insertar pedido
        console.log('Creando pedido con valores:');
        console.log('numero_pedido:', numeroPedido);
        console.log('id_tenant:', tenant.id_tenant);
        console.log('id_usuario:', user.id_usuario);
        console.log('id_cliente:', clienteId);
        console.log('total:', producto.precio);

        try {
            const [resPedido] = await connection.execute(`
                INSERT INTO pedidos (numero_pedido, id_tenant, id_usuario, id_cliente, total, metodo_pago, notas, fecha_pedido, id_estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1)
            `, [numeroPedido, tenant.id_tenant, user.id_usuario, clienteId, producto.precio, 'efectivo', 'Pedido de prueba generado por script']);

            const pedidoId = resPedido.insertId;
            console.log(`Pedido creado con ID: ${pedidoId} y Número: ${numeroPedido}`);

            // 6. Insertar detalle
            await connection.execute(`
                INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, 1, ?, ?)
            `, [pedidoId, producto.id_producto, producto.precio, producto.precio]);

            // 7. Insertar notificación con el formato NUEVO
            const titulo = `Nuevo pedido ${numeroPedido} (#${pedidoId})`;
            const mensaje = `Cliente: ${user.nombre} - Total: $${producto.precio}`;

            await connection.execute(`
                INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo, id_referencia, tipo_referencia, id_tenant, leida, created_at)
                VALUES (?, ?, ?, 'nuevo_pedido', ?, 'pedido', ?, 0, NOW())
            `, [user.id_usuario, titulo, mensaje, pedidoId, tenant.id_tenant]);

            console.log(`✅ Notificación creada con título: "${titulo}"`);
            console.log('Verifica en el panel de administración si aparece correctamente.');
        } catch (err) {
            console.error('❌ Error insertando pedido:', err.message);
            console.error('Stack:', err.stack);
        }

    } catch (error) {
        console.error('❌ Error general:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

crearPedidoPrueba();
