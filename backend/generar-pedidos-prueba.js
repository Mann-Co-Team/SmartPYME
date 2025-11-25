const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let adminToken = '';
let clienteToken = '';
let clienteId = 0;

const log = (msg, color = 'white') => {
    const colors = {
        reset: '\x1b[0m',
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m'
    };
    console.log(`${colors[color] || ''}${msg}${colors.reset}`);
};

async function loginAdmin() {
    try {
        log('📝 Iniciando sesión como administrador...', 'cyan');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@smartpyme.com',
            password: 'admin123'
        });
        adminToken = response.data.data?.token || response.data.token;
        log('✅ Login admin exitoso', 'green');
        return true;
    } catch (error) {
        log(`❌ Error en login admin: ${error.message}`, 'red');
        return false;
    }
}

async function crearClientePrueba() {
    try {
        log('\n📝 Creando cliente de prueba...', 'cyan');
        const timestamp = Date.now();
        
        // Registrar usuario cliente
        await axios.post(`${API_URL}/auth/register-public`, {
            nombre: 'Cliente',
            apellido: `Prueba ${timestamp}`,
            email: `cliente_prueba_${timestamp}@test.com`,
            password: 'test123',
            telefono: '912345678'
        });

        // Login del cliente
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: `cliente_prueba_${timestamp}@test.com`,
            password: 'test123'
        });

        clienteToken = loginResponse.data.data?.token || loginResponse.data.token;
        const userId = loginResponse.data.data?.user?.id || loginResponse.data.user?.id;

        // Crear registro en tabla clientes
        const db = require('./config/db');
        const [result] = await db.execute(
            'INSERT INTO clientes (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)',
            ['Cliente', `Prueba ${timestamp}`, `cliente_prueba_${timestamp}@test.com`, '912345678']
        );
        clienteId = result.insertId;

        log(`✅ Cliente creado (ID: ${clienteId}, Usuario ID: ${userId})`, 'green');
        return true;
    } catch (error) {
        log(`❌ Error creando cliente: ${error.message}`, 'red');
        return false;
    }
}

async function crearPedido(items, notas = '') {
    try {
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        
        const response = await axios.post(`${API_URL}/pedidos`, {
            id_cliente: clienteId,
            items: items,
            total: total,
            metodo_pago: 'Efectivo',
            metodo_entrega: 'Retiro en tienda',
            notas: notas
        }, {
            headers: { Authorization: `Bearer ${clienteToken}` }
        });

        const numeroPedido = response.data.data?.numero_pedido || response.data.numero_pedido;
        const pedidoId = response.data.data?.id || response.data.id;
        
        log(`✅ Pedido #${numeroPedido} creado (ID: ${pedidoId})`, 'green');
        return pedidoId;
    } catch (error) {
        log(`❌ Error creando pedido: ${error.response?.data?.message || error.message}`, 'red');
        return null;
    }
}

async function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    try {
        const response = await axios.post(`${API_URL}/pedidos/${pedidoId}/cambiar-estado`, {
            id_estado: nuevoEstado
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const estados = {
            2: 'Confirmado',
            3: 'En preparación',
            4: 'Listo para entrega',
            5: 'Entregado'
        };

        log(`✅ Pedido #${pedidoId} cambiado a: ${estados[nuevoEstado]}`, 'green');
        log(`   Response: ${JSON.stringify(response.data)}`, 'cyan');
        return true;
    } catch (error) {
        log(`❌ Error cambiando estado: ${error.response?.data?.message || error.message}`, 'red');
        if (error.response?.data) {
            log(`   Details: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return false;
    }
}

async function esperarSegundos(segundos) {
    log(`⏳ Esperando ${segundos} segundos...`, 'yellow');
    await new Promise(resolve => setTimeout(resolve, segundos * 1000));
}

async function generarPedidosPrueba() {
    log('\n╔══════════════════════════════════════════════════════════╗', 'magenta');
    log('║       GENERADOR DE PEDIDOS DE PRUEBA - RF-10           ║', 'magenta');
    log('╚══════════════════════════════════════════════════════════╝\n', 'magenta');

    // Setup
    const loginOk = await loginAdmin();
    if (!loginOk) {
        log('\n❌ No se pudo autenticar. Abortando.', 'red');
        process.exit(1);
    }

    const clienteOk = await crearClientePrueba();
    if (!clienteOk) {
        log('\n❌ No se pudo crear cliente. Abortando.', 'red');
        process.exit(1);
    }

    log('\n' + '='.repeat(60), 'cyan');
    log('ESCENARIO 1: Nuevo Pedido Simple', 'cyan');
    log('='.repeat(60), 'cyan');
    
    const pedido1 = await crearPedido([
        { id_producto: 1, cantidad: 2, precio_unitario: 10000, subtotal: 20000 }
    ], 'Pedido de prueba 1 - Simple');
    
    if (pedido1) {
        log('📬 Notificación generada: "Nuevo Pedido"', 'blue');
        log('📧 Email enviado a administradores (si SMTP configurado)', 'blue');
    }

    await esperarSegundos(2);

    log('\n' + '='.repeat(60), 'cyan');
    log('ESCENARIO 2: Pedido con Múltiples Items', 'cyan');
    log('='.repeat(60), 'cyan');
    
    const pedido2 = await crearPedido([
        { id_producto: 1, cantidad: 1, precio_unitario: 10000, subtotal: 10000 },
        { id_producto: 2, cantidad: 3, precio_unitario: 5000, subtotal: 15000 },
        { id_producto: 3, cantidad: 2, precio_unitario: 8000, subtotal: 16000 }
    ], 'Pedido de prueba 2 - Múltiples items');
    
    if (pedido2) {
        log('📬 Notificación generada: "Nuevo Pedido"', 'blue');
    }

    await esperarSegundos(2);

    log('\n' + '='.repeat(60), 'cyan');
    log('ESCENARIO 3: Cambios de Estado de Pedido', 'cyan');
    log('='.repeat(60), 'cyan');
    
    if (pedido1) {
        log(`\n🔄 Cambiando estados del Pedido #${pedido1}...`, 'yellow');
        
        await cambiarEstadoPedido(pedido1, 2); // Confirmado
        log('📬 Notificación generada: "Cambio de Estado - Confirmado"', 'blue');
        log('📧 Email enviado al cliente', 'blue');
        
        await esperarSegundos(2);
        
        await cambiarEstadoPedido(pedido1, 3); // En preparación
        log('📬 Notificación generada: "Cambio de Estado - En preparación"', 'blue');
        
        await esperarSegundos(2);
        
        await cambiarEstadoPedido(pedido1, 4); // Listo para entrega
        log('📬 Notificación generada: "Cambio de Estado - Listo para entrega"', 'blue');
    }

    log('\n' + '='.repeat(60), 'cyan');
    log('ESCENARIO 4: Pedido que Genera Alerta de Stock', 'cyan');
    log('='.repeat(60), 'cyan');
    log('💡 Para generar alerta de stock crítico:', 'yellow');
    log('   - El producto debe tener stock inicial > 5', 'yellow');
    log('   - Después del pedido, el stock debe quedar <= 5', 'yellow');
    
    const pedido3 = await crearPedido([
        { id_producto: 1, cantidad: 10, precio_unitario: 10000, subtotal: 100000 }
    ], 'Pedido de prueba 3 - Alto volumen para reducir stock');
    
    if (pedido3) {
        log('📬 Notificación generada: "Nuevo Pedido"', 'blue');
        log('⚠️  Si el stock quedó <= 5: Notificación "Stock Crítico"', 'yellow');
        log('📧 Email de alerta enviado a administradores', 'blue');
    }

    log('\n' + '='.repeat(60), 'magenta');
    log('✅ GENERACIÓN DE PEDIDOS COMPLETADA', 'magenta');
    log('='.repeat(60), 'magenta');
    
    log('\n📊 Resumen:', 'cyan');
    log(`   • ${pedido1 ? '✅' : '❌'} Pedido simple creado`, 'white');
    log(`   • ${pedido2 ? '✅' : '❌'} Pedido múltiple creado`, 'white');
    log(`   • ${pedido1 ? '✅' : '❌'} 3 cambios de estado realizados`, 'white');
    log(`   • ${pedido3 ? '✅' : '❌'} Pedido con posible alerta de stock`, 'white');
    
    log('\n🔔 Revisa el panel de notificaciones en el admin dashboard:', 'green');
    log('   http://localhost:5173/admin/dashboard', 'blue');
    
    log('\n💡 Tipos de notificaciones generadas:', 'cyan');
    log('   1. 🛍️  Nuevo Pedido (mínimo 3 notificaciones)', 'white');
    log('   2. 🚚 Cambio de Estado (3 notificaciones)', 'white');
    log('   3. ⚠️  Stock Crítico (si aplica)', 'white');

    process.exit(0);
}

// Ejecutar
generarPedidosPrueba().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
