const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    bold: '\x1b[1m'
};

let adminToken = '';
let clienteToken = '';
let testData = {
    productoId: null,
    categoriaId: null,
    pedidoId: null,
    usuarioId: null
};

// Función auxiliar para logging
function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function separator() {
    log('\n' + '='.repeat(60), 'cyan');
}

// ===========================================
// RF-1: VISUALIZACIÓN DEL CATÁLOGO
// ===========================================
async function testRF1_CatalogoPublico() {
    separator();
    log('RF-1: VISUALIZACIÓN DEL CATÁLOGO DE PRODUCTOS', 'bold');
    separator();
    
    try {
        // Test 1: Obtener todos los productos (sin autenticación)
        log('\n📝 Test 1.1: Obtener catálogo público', 'cyan');
        const response = await axios.get(`${API_URL}/productos`);
        
        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Catálogo público accesible', 'green');
            log(`   Productos encontrados: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF1_Categorias() {
    try {
        log('\n📝 Test 1.2: Obtener categorías públicas', 'cyan');
        const response = await axios.get(`${API_URL}/categorias`);
        
        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Categorías públicas accesibles', 'green');
            log(`   Categorías encontradas: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-2: REGISTRO Y AUTENTICACIÓN
// ===========================================
async function testRF2_LoginAdmin() {
    separator();
    log('RF-2: REGISTRO Y AUTENTICACIÓN DE USUARIOS', 'bold');
    separator();
    
    try {
        log('\n📝 Test 2.1: Login admin', 'cyan');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@smartpyme.com',
            password: 'admin123'
        });

        if (response.status === 200 && response.data.success && response.data.data.token) {
            adminToken = response.data.data.token;
            log('✅ Login admin exitoso', 'green');
            log(`   Usuario: ${response.data.data.user.nombre} ${response.data.data.user.apellido}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF2_LoginCliente() {
    try {
        log('\n📝 Test 2.2: Registrar y login cliente', 'cyan');
        
        // Primero registrar un cliente nuevo
        const timestamp = Date.now();
        const clienteEmail = `cliente-test-${timestamp}@ejemplo.com`;
        
        await axios.post(`${API_URL}/auth/register-public`, {
            nombre: 'Cliente',
            apellido: 'Test RF-2',
            email: clienteEmail,
            password: 'test123',
            confirmPassword: 'test123',
            telefono: '912345678'
        });
        
        // Luego hacer login
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: clienteEmail,
            password: 'test123'
        });

        if (response.status === 200 && response.data.success && response.data.data.token) {
            clienteToken = response.data.data.token;
            log('✅ Cliente registrado y login exitoso', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF2_CredencialesInvalidas() {
    try {
        log('\n📝 Test 2.3: Validar credenciales inválidas', 'cyan');
        await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@smartpyme.com',
            password: 'contraseñaincorrecta'
        });
        log('❌ Debería haber rechazado credenciales inválidas', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ Credenciales inválidas rechazadas correctamente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-3: CREACIÓN DE PEDIDOS
// ===========================================
async function testRF3_CrearPedidoPickup() {
    separator();
    log('RF-3: CREACIÓN DE PEDIDOS', 'bold');
    separator();
    
    try {
        log('\n📝 Test 3.1: Crear pedido con pickup', 'cyan');
        
        // Primero obtenemos un producto para el pedido
        const productosResp = await axios.get(`${API_URL}/productos`);
        const producto = productosResp.data.data.find(p => p.stock > 5);
        
        if (!producto) {
            log('⚠️ No hay productos con stock suficiente', 'yellow');
            return false;
        }

        const cantidad = 2;
        const subtotal = producto.precio * cantidad;

        const pedidoData = {
            items: [
                {
                    id_producto: producto.id_producto,
                    cantidad: cantidad,
                    precio_unitario: producto.precio,
                    subtotal: subtotal
                }
            ],
            total: subtotal,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo',
            notas: 'Test RF-3 - Pedido de prueba con pickup'
        };

        console.log('📤 Enviando pedido:', JSON.stringify(pedidoData, null, 2));
        console.log('🔑 Token cliente:', clienteToken ? 'Presente' : 'FALTA');

        const response = await axios.post(`${API_URL}/pedidos`, pedidoData, {
            headers: { 'Authorization': `Bearer ${clienteToken}` }
        });

        console.log('📥 Respuesta recibida:', response.status, response.data);

        if (response.status === 201 && response.data.success && response.data.data.id) {
            testData.pedidoId = response.data.data.id;
            log('✅ Pedido con pickup creado exitosamente', 'green');
            log(`   ID del pedido: ${response.data.data.id}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        console.error('🔥 Error completo:', error);
        console.error('🔥 Error response:', error.response?.data);
        console.error('🔥 Error status:', error.response?.status);
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF3_StockInsuficiente() {
    try {
        log('\n📝 Test 3.2: Validar stock insuficiente', 'cyan');
        
        const productosResp = await axios.get(`${API_URL}/productos`);
        const producto = productosResp.data.data[0];
        const cantidadExcesiva = 999999;
        const subtotal = producto.precio * cantidadExcesiva;

        await axios.post(`${API_URL}/pedidos`, {
            items: [
                {
                    id_producto: producto.id_producto,
                    cantidad: cantidadExcesiva,
                    precio_unitario: producto.precio,
                    subtotal: subtotal
                }
            ],
            total: subtotal,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo'
        }, {
            headers: { 'Authorization': `Bearer ${clienteToken}` }
        });

        log('❌ Debería haber rechazado por stock insuficiente', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('Stock insuficiente')) {
            log('✅ Stock insuficiente validado correctamente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-4: SEGUIMIENTO DEL ESTADO DEL PEDIDO
// ===========================================
async function testRF4_DetallePedido() {
    separator();
    log('RF-4: SEGUIMIENTO DEL ESTADO DEL PEDIDO', 'bold');
    separator();
    
    try {
        log('\n📝 Test 4.1: Obtener detalle de pedido con historial', 'cyan');
        
        if (!testData.pedidoId) {
            log('⚠️ No hay pedido de prueba disponible', 'yellow');
            return false;
        }

        const response = await axios.get(`${API_URL}/pedidos/${testData.pedidoId}/detalle`, {
            headers: { 'Authorization': `Bearer ${clienteToken}` }
        });

        if (response.status === 200 && response.data.success && response.data.data.historial) {
            log('✅ Detalle con historial obtenido correctamente', 'green');
            log(`   Registros en historial: ${response.data.data.historial.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF4_ListarEstados() {
    try {
        log('\n📝 Test 4.2: Obtener lista de estados', 'cyan');
        
        const response = await axios.get(`${API_URL}/estados`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Lista de estados obtenida correctamente', 'green');
            log(`   Total de estados: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-5: GESTIÓN DE PRODUCTOS (ADMIN)
// ===========================================
async function testRF5_CrearProducto() {
    separator();
    log('RF-5: GESTIÓN DE PRODUCTOS', 'bold');
    separator();
    
    try {
        log('\n📝 Test 5.1: Crear producto único', 'cyan');
        
        const timestamp = Date.now();
        const uniqueName = `Test-RF5-${timestamp}`;
        const response = await axios.post(`${API_URL}/productos`, {
            nombre: uniqueName,
            descripcion: 'Producto de prueba para RF-5',
            precio: 99.99,
            stock: 50,
            id_categoria: 1,
            activo: true
        }, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 201 && response.data.success && response.data.data.id) {
            testData.productoId = response.data.data.id;
            log('✅ Producto creado exitosamente', 'green');
            log(`   ID: ${testData.productoId}`, 'yellow');
            log(`   Nombre: ${uniqueName}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF5_EditarProducto() {
    try {
        log('\n📝 Test 5.2: Editar producto', 'cyan');
        
        if (!testData.productoId) {
            log('⚠️ No hay producto de prueba disponible', 'yellow');
            return false;
        }

        const timestamp = Date.now();
        const response = await axios.put(`${API_URL}/productos/${testData.productoId}`, {
            nombre: `Test-RF5-${timestamp}-EDITADO`,
            descripcion: 'Descripción editada para RF-5',
            precio: 149.99,
            stock: 75,
            id_categoria: 1,
            activo: true
        }, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success) {
            log('✅ Producto editado exitosamente', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-6: GESTIÓN DE USUARIOS (ADMIN)
// ===========================================
async function testRF6_CrearUsuario() {
    separator();
    log('RF-6: GESTIÓN DE USUARIOS', 'bold');
    separator();
    
    try {
        log('\n📝 Test 6.1: Listar usuarios existentes', 'cyan');
        
        const response = await axios.get(`${API_URL}/usuarios`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Lista de usuarios obtenida correctamente', 'green');
            log(`   Total de usuarios: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF6_ListarRoles() {
    try {
        log('\n📝 Test 6.2: Obtener lista de roles', 'cyan');
        
        const response = await axios.get(`${API_URL}/usuarios/roles`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Lista de roles obtenida correctamente', 'green');
            log(`   Total de roles: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-7: GESTIÓN DE PEDIDOS INTERNOS
// ===========================================
async function testRF7_CambiarEstadoPedido() {
    separator();
    log('RF-7: GESTIÓN DE PEDIDOS INTERNOS', 'bold');
    separator();
    
    try {
        log('\n📝 Test 7.1: Cambiar estado de pedido', 'cyan');
        
        if (!testData.pedidoId) {
            log('⚠️ No hay pedido de prueba disponible', 'yellow');
            return false;
        }

        const response = await axios.post(
            `${API_URL}/pedidos/${testData.pedidoId}/cambiar-estado`,
            {
                id_estado: 2, // Confirmado
                notas: 'Test RF-7: Pedido confirmado para pruebas'
            },
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );

        if (response.status === 200 && response.data.success) {
            log('✅ Estado de pedido cambiado exitosamente', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF7_TransicionInvalida() {
    try {
        log('\n📝 Test 7.2: Validar transición inválida', 'cyan');
        
        if (!testData.pedidoId) {
            log('⚠️ No hay pedido de prueba disponible', 'yellow');
            return false;
        }

        // Intentar pasar de Confirmado (2) a Pendiente (1) - transición inválida
        await axios.post(
            `${API_URL}/pedidos/${testData.pedidoId}/cambiar-estado`,
            {
                id_estado: 1,
                notas: 'Intento de transición inválida'
            },
            {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            }
        );

        log('❌ Debería haber rechazado la transición inválida', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('Transición no permitida')) {
            log('✅ Transición inválida rechazada correctamente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-8: DASHBOARD ADMINISTRATIVO
// ===========================================
async function testRF8_MetricasDashboard() {
    separator();
    log('RF-8: DASHBOARD ADMINISTRATIVO', 'bold');
    separator();
    
    try {
        log('\n📝 Test 8.1: Obtener métricas del dashboard', 'cyan');
        
        const response = await axios.get(`${API_URL}/dashboard/metricas`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && response.data.data) {
            const metricas = response.data.data;
            log('✅ Métricas del dashboard obtenidas correctamente', 'green');
            log(`   Ventas del año: $${metricas.ventas.anio}`, 'yellow');
            log(`   Pedidos activos: ${metricas.estadisticas.pedidos_activos}`, 'yellow');
            log(`   Productos activos: ${metricas.estadisticas.productos_activos}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF8_VentasPorMes() {
    try {
        log('\n📝 Test 8.2: Obtener ventas por mes', 'cyan');
        
        const response = await axios.get(`${API_URL}/dashboard/ventas-por-mes`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && Array.isArray(response.data.data)) {
            log('✅ Ventas por mes obtenidas correctamente', 'green');
            log(`   Meses con datos: ${response.data.data.length}`, 'yellow');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF8_AccesoDenegadoCliente() {
    try {
        log('\n📝 Test 8.3: Validar acceso denegado para cliente', 'cyan');
        
        await axios.get(`${API_URL}/dashboard/metricas`, {
            headers: { 'Authorization': `Bearer ${clienteToken}` }
        });

        log('❌ Cliente no debería tener acceso al dashboard', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 403) {
            log('✅ Acceso denegado correctamente para cliente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// EJECUCIÓN DE TODOS LOS TESTS
// ===========================================
async function runAllTests() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'bold');
    log('║    TEST AUTOMATIZADO COMPLETO - TODOS LOS RF (1-8)       ║', 'bold');
    log('╚════════════════════════════════════════════════════════════╝', 'bold');
    
    const results = [];

    // RF-1: Catálogo Público
    results.push(await testRF1_CatalogoPublico());
    results.push(await testRF1_Categorias());

    // RF-2: Autenticación
    results.push(await testRF2_LoginAdmin());
    if (!adminToken) {
        log('\n❌ No se puede continuar sin login de admin', 'red');
        return;
    }
    results.push(await testRF2_LoginCliente());
    results.push(await testRF2_CredencialesInvalidas());

    // RF-3: Creación de Pedidos
    results.push(await testRF3_CrearPedidoPickup());
    results.push(await testRF3_StockInsuficiente());

    // RF-4: Seguimiento de Pedidos
    results.push(await testRF4_DetallePedido());
    results.push(await testRF4_ListarEstados());

    // RF-5: Gestión de Productos
    results.push(await testRF5_CrearProducto());
    results.push(await testRF5_EditarProducto());

    // RF-6: Gestión de Usuarios
    results.push(await testRF6_CrearUsuario());
    results.push(await testRF6_ListarRoles());

    // RF-7: Gestión de Pedidos Internos
    results.push(await testRF7_CambiarEstadoPedido());
    results.push(await testRF7_TransicionInvalida());

    // RF-8: Dashboard Administrativo
    results.push(await testRF8_MetricasDashboard());
    results.push(await testRF8_VentasPorMes());
    results.push(await testRF8_AccesoDenegadoCliente());

    // Resumen final
    separator();
    log('\n╔════════════════════════════════════════════════════════════╗', 'bold');
    log('║                    RESUMEN DE PRUEBAS                      ║', 'bold');
    log('╚════════════════════════════════════════════════════════════╝', 'bold');

    const passed = results.filter(r => r).length;
    const total = results.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    log(`\n✅ Pruebas exitosas: ${passed}/${total} (${percentage}%)`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        log('\n🎉 ¡TODOS LOS REQUISITOS FUNCIONALES (RF 1-8) ESTÁN OPERATIVOS!', 'green');
    } else {
        log(`\n⚠️ Hay ${total - passed} pruebas que fallaron`, 'yellow');
    }

    separator();
    log('\n📊 Desglose por Requisito Funcional:\n', 'cyan');
    log('RF-1 (Catálogo Público): ' + (results[0] && results[1] ? '✅' : '❌'), results[0] && results[1] ? 'green' : 'red');
    log('RF-2 (Autenticación): ' + (results[2] && results[3] && results[4] ? '✅' : '❌'), results[2] && results[3] && results[4] ? 'green' : 'red');
    log('RF-3 (Creación Pedidos): ' + (results[5] && results[6] ? '✅' : '❌'), results[5] && results[6] ? 'green' : 'red');
    log('RF-4 (Seguimiento): ' + (results[7] && results[8] ? '✅' : '❌'), results[7] && results[8] ? 'green' : 'red');
    log('RF-5 (Gestión Productos): ' + (results[9] && results[10] ? '✅' : '❌'), results[9] && results[10] ? 'green' : 'red');
    log('RF-6 (Gestión Usuarios): ' + (results[11] && results[12] ? '✅' : '❌'), results[11] && results[12] ? 'green' : 'red');
    log('RF-7 (Gestión Pedidos Internos): ' + (results[13] && results[14] ? '✅' : '❌'), results[13] && results[14] ? 'green' : 'red');
    log('RF-8 (Dashboard): ' + (results[15] && results[16] && results[17] ? '✅' : '❌'), results[15] && results[16] && results[17] ? 'green' : 'red');

    log('\n');
}

// Ejecutar todos los tests
runAllTests().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
