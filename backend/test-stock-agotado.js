/**
 * Script de Prueba - Stock Agotado
 * Simula un pedido que agota el stock de un producto
 */

const db = require('./config/db');
const PedidoModel = require('./models/pedido.model');
const NotificacionModel = require('./models/notificaciones.model');
const EmailService = require('./services/email.service');

async function testStockAgotado() {
    try {
        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║     TEST: NOTIFICACIÓN DE STOCK AGOTADO             ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        // 1. Buscar un producto con poco stock
        const [productos] = await db.execute(`
            SELECT id_producto, nombre, stock, precio 
            FROM productos 
            WHERE activo = TRUE AND stock > 0 AND stock <= 10
            ORDER BY stock ASC
            LIMIT 1
        `);

        if (productos.length === 0) {
            console.log('❌ No hay productos con stock bajo para probar');
            console.log('💡 Actualiza manualmente el stock de un producto a 3 unidades');
            return;
        }

        const producto = productos[0];
        console.log('📦 Producto seleccionado:');
        console.log(`   Nombre: ${producto.nombre}`);
        console.log(`   Stock actual: ${producto.stock}`);
        console.log(`   Precio: $${producto.precio}\n`);

        // 2. Ajustar stock a 3 para la prueba
        console.log('🔧 Ajustando stock a 3 unidades para la prueba...');
        await db.execute(
            'UPDATE productos SET stock = 3 WHERE id_producto = ?',
            [producto.id_producto]
        );
        console.log('✅ Stock ajustado\n');

        // 3. Buscar o crear un cliente de prueba
        const [clientes] = await db.execute(
            "SELECT id_cliente FROM clientes WHERE email LIKE 'test_stock_%' LIMIT 1"
        );

        let clienteId;
        if (clientes.length === 0) {
            console.log('👤 Creando cliente de prueba...');
            const [result] = await db.execute(
                "INSERT INTO clientes (nombre, apellido, email, telefono) VALUES ('Test', 'Stock', ?, '123456789')",
                [`test_stock_${Date.now()}@test.com`]
            );
            clienteId = result.insertId;
        } else {
            clienteId = clientes[0].id_cliente;
        }
        console.log(`✅ Cliente ID: ${clienteId}\n`);

        // 4. Crear pedido que agote el stock
        console.log('🛒 Creando pedido con 3 unidades (agotará el stock)...\n');
        
        const pedidoData = {
            id_cliente: clienteId,
            items: [
                {
                    id_producto: producto.id_producto,
                    cantidad: 3,
                    precio_unitario: producto.precio,
                    subtotal: producto.precio * 3
                }
            ],
            total: producto.precio * 3,
            metodo_pago: 'Efectivo',
            notas: 'Pedido de prueba - Stock agotado'
        };

        const pedidoCreado = await PedidoModel.create(pedidoData);
        console.log(`✅ Pedido #${pedidoCreado.numero_pedido} creado (ID: ${pedidoCreado.id})\n`);

        // 5. Verificar stock resultante
        const [productoActual] = await db.execute(
            'SELECT stock FROM productos WHERE id_producto = ?',
            [producto.id_producto]
        );
        const stockFinal = productoActual[0].stock;
        console.log(`📊 Stock resultante: ${stockFinal} unidades\n`);

        // 6. Verificar notificaciones
        if (pedidoCreado.productosAgotados && pedidoCreado.productosAgotados.length > 0) {
            console.log('🚫 PRODUCTOS AGOTADOS DETECTADOS:');
            pedidoCreado.productosAgotados.forEach(p => {
                console.log(`   • ${p.nombre} - Stock: ${p.stock}`);
            });

            // Crear notificaciones
            console.log('\n📬 Creando notificaciones...');
            for (const prod of pedidoCreado.productosAgotados) {
                await NotificacionModel.createForAdminsAndEmployees(
                    'stock_agotado',
                    `🚫 Stock agotado: ${prod.nombre}`,
                    `El producto se ha quedado sin stock. Reponer urgente.`,
                    prod.id_producto,
                    'producto'
                );
                console.log(`   ✅ Notificación "stock_agotado" creada para: ${prod.nombre}`);
            }
        } else if (pedidoCreado.productosConStockBajo && pedidoCreado.productosConStockBajo.length > 0) {
            console.log('⚠️ PRODUCTOS CON STOCK CRÍTICO DETECTADOS:');
            pedidoCreado.productosConStockBajo.forEach(p => {
                console.log(`   • ${p.nombre} - Stock: ${p.stock}`);
            });

            // Crear notificaciones
            console.log('\n📬 Creando notificaciones...');
            for (const prod of pedidoCreado.productosConStockBajo) {
                await NotificacionModel.createForAdminsAndEmployees(
                    'stock_critico',
                    `⚠️ Stock bajo: ${prod.nombre}`,
                    `Solo quedan ${prod.stock} unidades`,
                    prod.id_producto,
                    'producto'
                );
                console.log(`   ✅ Notificación "stock_critico" creada para: ${prod.nombre}`);
            }
        } else {
            console.log('ℹ️ No se generaron alertas de stock (stock > 5)');
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║                 ✅ TEST COMPLETADO                   ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        console.log('💡 Verifica las notificaciones en:');
        console.log('   http://localhost:5173/admin/dashboard\n');

        console.log('📋 Tipos de notificaciones implementadas:');
        console.log('   1. 🚫 stock_agotado  - Stock = 0 (icono rojo)');
        console.log('   2. ⚠️  stock_critico  - Stock 1-5 (icono amarillo)');
        console.log('   3. 📦 nuevo_pedido   - Nuevo pedido creado');
        console.log('   4. 🔄 cambio_estado  - Cambio de estado de pedido\n');

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        throw error;
    } finally {
        process.exit(0);
    }
}

// Ejecutar test
testStockAgotado().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
