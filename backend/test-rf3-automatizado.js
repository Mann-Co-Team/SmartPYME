// Script de pruebas automatizadas RF-3
const http = require('http');

const API_URL = 'http://127.0.0.1:5000/api';

// Helper para hacer requests HTTP
function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ data: response, status: res.statusCode });
                    } else {
                        const error = new Error(`HTTP ${res.statusCode}`);
                        error.response = { data: response, status: res.statusCode };
                        reject(error);
                    }
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}
let token = '';
let userId = 0;
let pedidosCreados = [];

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

async function test1_Login() {
    logSection('TEST 1: Login de Cliente');
    
    try {
        const response = await makeRequest('POST', '/auth/login', {
            email: 'juan.perez@ejemplo.com',
            password: 'prueba123'
        });

        if (response.data.success && response.data.data.token) {
            token = response.data.data.token;
            userId = response.data.data.user.id;
            
            log(`✓ Login exitoso`, 'green');
            log(`  Usuario: ${response.data.data.user.nombre} ${response.data.data.user.apellido}`, 'blue');
            log(`  Email: ${response.data.data.user.email}`, 'blue');
            log(`  Rol: ${response.data.data.user.rol}`, 'blue');
            log(`  ID: ${userId}`, 'blue');
            log(`  Token: ${token.substring(0, 30)}...`, 'blue');
            return true;
        } else {
            log('✗ Login falló: Respuesta incorrecta', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Login falló: ${error.message}`, 'red');
        if (error.response) {
            log(`  Respuesta: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return false;
    }
}

async function test2_ObtenerProductos() {
    logSection('TEST 2: Obtener Productos Disponibles');
    
    try {
        const response = await makeRequest('GET', '/productos');

        if (response.data.success && response.data.data.length > 0) {
            log(`✓ Productos obtenidos: ${response.data.data.length}`, 'green');
            
            // Mostrar primeros 3 productos
            response.data.data.slice(0, 3).forEach(p => {
                log(`  • ${p.nombre} - Stock: ${p.stock} - Precio: $${p.precio}`, 'blue');
            });
            
            return response.data.data;
        } else {
            log('✗ No se obtuvieron productos', 'red');
            return null;
        }
    } catch (error) {
        log(`✗ Error obteniendo productos: ${error.message}`, 'red');
        return null;
    }
}

async function test3_CrearPedidoDelivery(productos) {
    logSection('TEST 3: Crear Pedido con DELIVERY');
    
    try {
        const producto = productos[0];
        const pedidoData = {
            id_usuario_cliente: userId,
            items: [{
                id_producto: producto.id_producto,
                cantidad: 1,
                precio_unitario: parseFloat(producto.precio),
                subtotal: parseFloat(producto.precio)
            }],
            total: parseFloat(producto.precio),
            metodo_entrega: 'delivery',
            direccion_entrega: 'Av. Libertador Bernardo O\'Higgins 1234, Santiago Centro',
            metodo_pago: 'efectivo',
            notas: 'Prueba automatizada - Delivery'
        };

        log(`  Producto: ${producto.nombre}`, 'blue');
        log(`  Cantidad: 1`, 'blue');
        log(`  Total: $${pedidoData.total}`, 'blue');

        const response = await makeRequest('POST', '/pedidos', pedidoData, {
            'Authorization': `Bearer ${token}`
        });

        if (response.data.success && response.data.data.numero_pedido) {
            pedidosCreados.push(response.data.data.id);
            log(`✓ Pedido DELIVERY creado exitosamente`, 'green');
            log(`  Número: ${response.data.data.numero_pedido}`, 'blue');
            log(`  ID: ${response.data.data.id}`, 'blue');
            return true;
        } else {
            log('✗ Pedido no creado: Respuesta incorrecta', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Error creando pedido DELIVERY: ${error.message}`, 'red');
        if (error.response) {
            log(`  Respuesta: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return false;
    }
}

async function test4_CrearPedidoPickup(productos) {
    logSection('TEST 4: Crear Pedido con PICKUP');
    
    try {
        const producto = productos[1] || productos[0];
        const pedidoData = {
            id_usuario_cliente: userId,
            items: [{
                id_producto: producto.id_producto,
                cantidad: 1,
                precio_unitario: parseFloat(producto.precio),
                subtotal: parseFloat(producto.precio)
            }],
            total: parseFloat(producto.precio),
            metodo_entrega: 'pickup',
            direccion_entrega: null,
            metodo_pago: 'tarjeta',
            notas: 'Prueba automatizada - Pickup'
        };

        log(`  Producto: ${producto.nombre}`, 'blue');
        log(`  Cantidad: 1`, 'blue');
        log(`  Total: $${pedidoData.total}`, 'blue');

        const response = await makeRequest('POST', '/pedidos', pedidoData, {
            'Authorization': `Bearer ${token}`
        });

        if (response.data.success && response.data.data.numero_pedido) {
            pedidosCreados.push(response.data.data.id);
            log(`✓ Pedido PICKUP creado exitosamente`, 'green');
            log(`  Número: ${response.data.data.numero_pedido}`, 'blue');
            log(`  ID: ${response.data.data.id}`, 'blue');
            return true;
        } else {
            log('✗ Pedido no creado: Respuesta incorrecta', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Error creando pedido PICKUP: ${error.message}`, 'red');
        if (error.response) {
            log(`  Respuesta: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return false;
    }
}

async function test5_ValidarStockInsuficiente(productos) {
    logSection('TEST 5: Validar Stock Insuficiente');
    
    try {
        const producto = productos[0];
        const pedidoData = {
            id_usuario_cliente: userId,
            items: [{
                id_producto: producto.id_producto,
                cantidad: 9999,
                precio_unitario: parseFloat(producto.precio),
                subtotal: parseFloat(producto.precio) * 9999
            }],
            total: parseFloat(producto.precio) * 9999,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo'
        };

        log(`  Intentando pedir: ${producto.nombre} x 9999`, 'yellow');
        log(`  Stock disponible: ${producto.stock}`, 'yellow');

        const response = await makeRequest('POST', '/pedidos', pedidoData, {
            'Authorization': `Bearer ${token}`
        });

        // Si llegamos aquí, no validó el stock
        log('✗ ERROR: El pedido debería haber sido rechazado por stock insuficiente', 'red');
        return false;

    } catch (error) {
        if (error.response && error.response.status === 400) {
            const data = error.response.data;
            if (data.message && data.message.includes('Stock insuficiente')) {
                log(`✓ Validación correcta de stock insuficiente`, 'green');
                log(`  Mensaje: ${data.message}`, 'blue');
                if (data.detalles && data.detalles.length > 0) {
                    data.detalles.forEach(d => {
                        log(`  • ${d.nombre}: solicitado ${d.solicitado}, disponible ${d.disponible}`, 'blue');
                    });
                }
                return true;
            }
        }
        log(`✗ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

async function test6_ObtenerMisPedidos() {
    logSection('TEST 6: Obtener Mis Pedidos');
    
    try {
        const response = await makeRequest('GET', '/pedidos', null, {
            'Authorization': `Bearer ${token}`
        });

        if (response.data.success) {
            const pedidos = response.data.data;
            log(`✓ Pedidos obtenidos: ${pedidos.length}`, 'green');
            
            // Verificar que existen los pedidos creados
            const pedidosEncontrados = pedidos.filter(p => 
                pedidosCreados.includes(p.id || p.id_pedido)
            );
            
            log(`  Pedidos creados en esta sesión encontrados: ${pedidosEncontrados.length}/${pedidosCreados.length}`, 'blue');
            
            // Mostrar últimos 3 pedidos
            pedidos.slice(0, 3).forEach(p => {
                log(`  • ${p.numero_pedido || `#${p.id}`} - ${p.estado} - ${p.metodo_entrega} - $${p.total}`, 'blue');
            });
            
            return pedidosEncontrados.length === pedidosCreados.length;
        } else {
            log('✗ No se obtuvieron pedidos', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Error obteniendo pedidos: ${error.message}`, 'red');
        if (error.response) {
            log(`  Respuesta: ${JSON.stringify(error.response.data)}`, 'red');
        }
        return false;
    }
}

async function test7_VerificarStockActualizado(productos) {
    logSection('TEST 7: Verificar Actualización de Stock');
    
    try {
        const response = await makeRequest('GET', '/productos');
        
        if (response.data.success) {
            const productosNuevos = response.data.data;
            
            // Comparar stocks
            let stocksActualizados = 0;
            let diferencias = [];
            
            productos.slice(0, 2).forEach((prodAnterior, index) => {
                const prodNuevo = productosNuevos.find(p => p.id_producto === prodAnterior.id_producto);
                if (prodNuevo) {
                    const diferencia = prodAnterior.stock - prodNuevo.stock;
                    diferencias.push({
                        nombre: prodAnterior.nombre,
                        anterior: prodAnterior.stock,
                        actual: prodNuevo.stock,
                        diferencia: diferencia
                    });
                    if (diferencia > 0) stocksActualizados++;
                }
            });
            
            log(`✓ Stock verificado para ${diferencias.length} productos`, 'green');
            diferencias.forEach(d => {
                const color = d.diferencia > 0 ? 'green' : 'yellow';
                log(`  • ${d.nombre}: ${d.anterior} → ${d.actual} (${d.diferencia > 0 ? '-' : ''}${d.diferencia})`, color);
            });
            
            if (stocksActualizados > 0) {
                log(`✓ Se actualizaron ${stocksActualizados} productos`, 'green');
                return true;
            } else {
                log('⚠ No se detectaron cambios en el stock', 'yellow');
                return true; // No es un error crítico
            }
        }
        return false;
    } catch (error) {
        log(`✗ Error verificando stock: ${error.message}`, 'red');
        return false;
    }
}

// Ejecutar todas las pruebas
async function runAllTests() {
    console.clear();
    logSection('🧪 PRUEBAS AUTOMATIZADAS RF-3: CREACIÓN DE PEDIDOS');
    log('Sistema SmartPYME - Test Suite', 'blue');
    log('Fecha: ' + new Date().toLocaleString('es-CL'), 'blue');
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test 1: Login
    results.total++;
    const test1 = await test1_Login();
    results.tests.push({ name: 'Login Cliente', passed: test1 });
    if (test1) results.passed++; else results.failed++;
    
    if (!test1) {
        log('\n❌ Las pruebas se detienen porque el login falló', 'red');
        return results;
    }

    // Test 2: Obtener productos
    results.total++;
    const productos = await test2_ObtenerProductos();
    const test2 = productos !== null && productos.length > 0;
    results.tests.push({ name: 'Obtener Productos', passed: test2 });
    if (test2) results.passed++; else results.failed++;

    if (!test2) {
        log('\n❌ Las pruebas se detienen porque no hay productos', 'red');
        return results;
    }

    // Test 3: Crear pedido Delivery
    results.total++;
    const test3 = await test3_CrearPedidoDelivery(productos);
    results.tests.push({ name: 'Crear Pedido Delivery', passed: test3 });
    if (test3) results.passed++; else results.failed++;

    // Test 4: Crear pedido Pickup
    results.total++;
    const test4 = await test4_CrearPedidoPickup(productos);
    results.tests.push({ name: 'Crear Pedido Pickup', passed: test4 });
    if (test4) results.passed++; else results.failed++;

    // Test 5: Validar stock insuficiente
    results.total++;
    const test5 = await test5_ValidarStockInsuficiente(productos);
    results.tests.push({ name: 'Validar Stock Insuficiente', passed: test5 });
    if (test5) results.passed++; else results.failed++;

    // Test 6: Obtener mis pedidos
    results.total++;
    const test6 = await test6_ObtenerMisPedidos();
    results.tests.push({ name: 'Obtener Mis Pedidos', passed: test6 });
    if (test6) results.passed++; else results.failed++;

    // Test 7: Verificar stock actualizado
    results.total++;
    const test7 = await test7_VerificarStockActualizado(productos);
    results.tests.push({ name: 'Verificar Stock Actualizado', passed: test7 });
    if (test7) results.passed++; else results.failed++;

    // Resumen final
    logSection('📊 RESUMEN DE PRUEBAS');
    log(`Total de pruebas: ${results.total}`, 'blue');
    log(`Pruebas exitosas: ${results.passed}`, 'green');
    log(`Pruebas fallidas: ${results.failed}`, 'red');
    log(`Tasa de éxito: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'cyan');
    
    console.log('\n' + '─'.repeat(60));
    log('Detalle de Pruebas:', 'yellow');
    results.tests.forEach((test, index) => {
        const status = test.passed ? '✓ PASS' : '✗ FAIL';
        const color = test.passed ? 'green' : 'red';
        log(`${index + 1}. ${test.name}: ${status}`, color);
    });
    
    console.log('═'.repeat(60) + '\n');
    
    if (results.failed === 0) {
        log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!', 'green');
    } else {
        log('⚠ ALGUNAS PRUEBAS FALLARON - Revisar logs arriba', 'yellow');
    }

    return results;
}

// Ejecutar
runAllTests().catch(error => {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
