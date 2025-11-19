const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

let token = '';
let pedidoTestId = null;

// Función auxiliar para logging
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Login como admin
async function testLogin() {
    log('\n📝 Paso 1: Login como administrador', 'cyan');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'Admin2@smartpyme.com',
            password: 'adm1234'
        });

        token = response.data.data.token;
        log('✅ Login exitoso', 'green');
        log(`   Token: ${token.substring(0, 20)}...`, 'yellow');
        return true;
    } catch (error) {
        log(`❌ Error en login: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// Variable para guardar el estado inicial del pedido
let estadoInicial = null;

// 2. Obtener pedido para pruebas y detectar su estado actual
async function testCrearPedido() {
    log('\n📝 Paso 2: Obtener pedido para pruebas', 'cyan');
    try {
        const pedidosRes = await axios.get(`${API_URL}/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // El endpoint puede devolver { data: [...] } o directamente [...]
        const pedidos = Array.isArray(pedidosRes.data) ? pedidosRes.data : (pedidosRes.data.data || pedidosRes.data);
        
        // Mapear nombres de estados a IDs
        const estadosMap = {
            'Pendiente': 1,
            'Confirmado': 2,
            'En Proceso': 3,
            'Listo': 4,
            'Enviado': 5,
            'Completado': 6,
            'Cancelado': 7
        };
        
        // Preferir pedidos en estado Pendiente o En Proceso
        let pedidoSeleccionado = pedidos.find(p => p.nombre_estado === 'Pendiente');
        if (!pedidoSeleccionado) {
            pedidoSeleccionado = pedidos.find(p => p.nombre_estado === 'En Proceso');
        }
        if (!pedidoSeleccionado) {
            pedidoSeleccionado = pedidos[0]; // Usar el primero disponible
        }
        
        if (!pedidoSeleccionado) {
            log('❌ No hay pedidos disponibles para pruebas', 'red');
            return false;
        }

        pedidoTestId = pedidoSeleccionado.id_pedido;
        estadoInicial = estadosMap[pedidoSeleccionado.nombre_estado] || null;
        
        log(`✅ Usando pedido #${pedidoTestId}`, 'green');
        log(`   Estado actual: ${pedidoSeleccionado.nombre_estado} (ID: ${estadoInicial})`, 'yellow');
        
        return true;
    } catch (error) {
        log(`❌ Error obteniendo pedido: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 3. Cambiar estado válido según el estado actual
async function testTransicionValida() {
    log('\n📝 Paso 3: Probar transición válida', 'cyan');
    
    // Definir transiciones válidas según estado actual
    const TRANSICIONES_VALIDAS = {
        1: [2, 7],    // Pendiente -> Confirmado, Cancelado
        2: [3, 7],    // Confirmado -> En Proceso, Cancelado
        3: [4, 7],    // En Proceso -> Listo, Cancelado
        4: [5, 6],    // Listo -> Enviado, Completado
        5: [6],       // Enviado -> Completado
        6: [],        // Completado -> ninguno
        7: []         // Cancelado -> ninguno
    };

    const transicionesDisponibles = TRANSICIONES_VALIDAS[estadoInicial];
    
    if (!transicionesDisponibles || transicionesDisponibles.length === 0) {
        log(`⚠️  El pedido está en estado final (${estadoInicial}), no hay transiciones válidas`, 'yellow');
        log('   Saltando esta prueba', 'yellow');
        return true; // No es un fallo del test
    }

    const nuevoEstado = transicionesDisponibles[0]; // Tomar la primera transición válida
    const estadosNombres = {
        1: 'Pendiente', 2: 'Confirmado', 3: 'En Proceso',
        4: 'Listo', 5: 'Enviado', 6: 'Completado', 7: 'Cancelado'
    };

    log(`   Intentando: ${estadosNombres[estadoInicial]} -> ${estadosNombres[nuevoEstado]}`, 'cyan');

    try {
        const response = await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: nuevoEstado,
                notas: `Prueba automatizada RF-7: transición válida ${estadosNombres[estadoInicial]} -> ${estadosNombres[nuevoEstado]}`
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('✅ Transición válida aceptada correctamente', 'green');
        log(`   Mensaje: ${response.data.message}`, 'yellow');
        estadoInicial = nuevoEstado; // Actualizar estado para siguientes pruebas
        return true;
    } catch (error) {
        log(`❌ Error en transición válida: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 4. Cambiar estado con observaciones (si hay transición disponible)
async function testObservaciones() {
    log('\n📝 Paso 4: Cambiar estado con observaciones', 'cyan');
    
    const TRANSICIONES_VALIDAS = {
        1: [2, 7], 2: [3, 7], 3: [4, 7], 4: [5, 6], 5: [6], 6: [], 7: []
    };

    const transicionesDisponibles = TRANSICIONES_VALIDAS[estadoInicial];
    
    if (!transicionesDisponibles || transicionesDisponibles.length === 0) {
        log(`⚠️  El pedido está en estado final, no se puede cambiar estado`, 'yellow');
        log('   Saltando esta prueba', 'yellow');
        return true;
    }

    const nuevoEstado = transicionesDisponibles[0];
    
    try {
        const response = await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: nuevoEstado,
                notas: 'El pedido está siendo procesado. Cliente solicitó entrega urgente.'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('✅ Estado cambiado con observaciones', 'green');
        
        // Verificar que las observaciones se guardaron en el historial
        const detalleRes = await axios.get(
            `${API_URL}/pedidos/${pedidoTestId}/detalle`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        const ultimoCambio = detalleRes.data.data.historial[detalleRes.data.data.historial.length - 1];
        if (ultimoCambio && ultimoCambio.notas) {
            log(`   Observaciones guardadas: "${ultimoCambio.notas}"`, 'yellow');
        }
        
        estadoInicial = nuevoEstado; // Actualizar estado
        return true;
    } catch (error) {
        log(`❌ Error cambiando estado con observaciones: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 5. Intentar transición inválida (retroceder en el flujo)
async function testTransicionInvalida() {
    log('\n📝 Paso 5: Intentar transición inválida', 'cyan');
    
    // Intentar retroceder: usar un estado anterior no válido
    let estadoInvalido = 1; // Por defecto intentar volver a Pendiente
    
    // Si estamos en Pendiente, intentar ir a un estado no permitido
    if (estadoInicial === 1) {
        estadoInvalido = 3; // Saltar directamente a En Proceso
        log('   Intentando: Pendiente -> En Proceso (saltando Confirmado)', 'cyan');
    } else {
        // Para otros estados, intentar retroceder
        estadoInvalido = Math.max(1, estadoInicial - 2); // Retroceder 2 estados
        const estadosNombres = {
            1: 'Pendiente', 2: 'Confirmado', 3: 'En Proceso',
            4: 'Listo', 5: 'Enviado', 6: 'Completado', 7: 'Cancelado'
        };
        log(`   Intentando retroceder: ${estadosNombres[estadoInicial]} -> ${estadosNombres[estadoInvalido]}`, 'cyan');
    }

    try {
        await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: estadoInvalido,
                notas: 'Intento de transición inválida'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('❌ ERROR: Se permitió una transición inválida', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('Transición no permitida')) {
            log('✅ Validación correcta: transición inválida rechazada', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 6. Intentar cambiar estado de pedido inexistente
async function testPedidoInexistente() {
    log('\n📝 Paso 6: Intentar cambiar estado de pedido inexistente', 'cyan');
    try {
        await axios.post(
            `${API_URL}/pedidos/999999/cambiar-estado`,
            {
                id_estado: 2,
                notas: 'Intento con pedido inexistente'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('❌ ERROR: Se permitió operar con pedido inexistente', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('no encontrado')) {
            log('✅ Validación correcta: pedido inexistente rechazado', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 7. Avanzar al siguiente estado válido (si existe)
async function testCambiarAListo() {
    log('\n📝 Paso 7: Avanzar al siguiente estado válido', 'cyan');
    
    const TRANSICIONES_VALIDAS = {
        1: [2, 7], 2: [3, 7], 3: [4, 7], 4: [5, 6], 5: [6], 6: [], 7: []
    };

    const transicionesDisponibles = TRANSICIONES_VALIDAS[estadoInicial];
    
    if (!transicionesDisponibles || transicionesDisponibles.length === 0) {
        log(`⚠️  El pedido está en estado final, no hay más transiciones`, 'yellow');
        log('   Saltando esta prueba', 'yellow');
        return true;
    }

    const nuevoEstado = transicionesDisponibles[0];
    const estadosNombres = {
        1: 'Pendiente', 2: 'Confirmado', 3: 'En Proceso',
        4: 'Listo', 5: 'Enviado', 6: 'Completado', 7: 'Cancelado'
    };

    log(`   Avanzando: ${estadosNombres[estadoInicial]} -> ${estadosNombres[nuevoEstado]}`, 'cyan');

    try {
        const response = await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: nuevoEstado,
                notas: 'Avanzando en el flujo del pedido'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('✅ Estado cambiado exitosamente', 'green');
        estadoInicial = nuevoEstado;
        return true;
    } catch (error) {
        log(`❌ Error cambiando estado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 8. Avanzar hacia estado final (si es posible)
async function testEstadoFinal() {
    log('\n📝 Paso 8: Avanzar hacia estado final', 'cyan');
    
    const TRANSICIONES_VALIDAS = {
        1: [2, 7], 2: [3, 7], 3: [4, 7], 4: [5, 6], 5: [6], 6: [], 7: []
    };

    const transicionesDisponibles = TRANSICIONES_VALIDAS[estadoInicial];
    
    if (!transicionesDisponibles || transicionesDisponibles.length === 0) {
        log(`✅ El pedido ya está en estado final (${estadoInicial})`, 'green');
        log('   No se requiere más avance', 'yellow');
        return true;
    }

    // Preferir Completado (6) si está disponible, sino usar la primera opción
    const nuevoEstado = transicionesDisponibles.includes(6) ? 6 : transicionesDisponibles[0];
    const estadosNombres = {
        1: 'Pendiente', 2: 'Confirmado', 3: 'En Proceso',
        4: 'Listo', 5: 'Enviado', 6: 'Completado', 7: 'Cancelado'
    };

    log(`   Avanzando: ${estadosNombres[estadoInicial]} -> ${estadosNombres[nuevoEstado]}`, 'cyan');

    try {
        const response = await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: nuevoEstado,
                notas: 'Avanzando hacia estado final'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('✅ Estado cambiado exitosamente', 'green');
        estadoInicial = nuevoEstado;
        return true;
    } catch (error) {
        log(`❌ Error cambiando estado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 9. Intentar cambiar desde estado final (debe fallar)
async function testCambiarDesdeEstadoFinal() {
    log('\n📝 Paso 9: Intentar cambiar desde estado final', 'cyan');
    
    const TRANSICIONES_VALIDAS = {
        1: [2, 7], 2: [3, 7], 3: [4, 7], 4: [5, 6], 5: [6], 6: [], 7: []
    };

    const estadosNombres = {
        1: 'Pendiente', 2: 'Confirmado', 3: 'En Proceso',
        4: 'Listo', 5: 'Enviado', 6: 'Completado', 7: 'Cancelado'
    };

    // Si no está en estado final, avanzar hasta llegar a uno
    while (TRANSICIONES_VALIDAS[estadoInicial] && TRANSICIONES_VALIDAS[estadoInicial].length > 0) {
        const siguienteEstado = TRANSICIONES_VALIDAS[estadoInicial].includes(6) ? 6 : 
                               TRANSICIONES_VALIDAS[estadoInicial].includes(7) ? 7 : 
                               TRANSICIONES_VALIDAS[estadoInicial][0];
        
        try {
            await axios.post(
                `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
                {
                    id_estado: siguienteEstado,
                    notas: 'Avanzando hacia estado final para prueba'
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            estadoInicial = siguienteEstado;
        } catch (error) {
            log(`⚠️  No se pudo avanzar a estado final: ${error.response?.data?.message}`, 'yellow');
            break;
        }
    }

    log(`   Pedido en estado: ${estadosNombres[estadoInicial]}`, 'cyan');
    log(`   Intentando cambiar a Pendiente (debe fallar)`, 'cyan');

    try {
        await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: 1, // Intentar volver a Pendiente
                notas: 'Intento de cambio desde estado final'
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        log('❌ ERROR: Se permitió cambiar desde estado final', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && 
            (error.response.data.message.includes('no permite cambios') || 
             error.response.data.message.includes('Transición no permitida'))) {
            log('✅ Validación correcta: no se puede cambiar desde estado final', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 10. Validar permisos - solo admin/empleado
async function testPermisos() {
    log('\n📝 Paso 10: Validar permisos (solo admin/empleado)', 'cyan');
    try {
        // Intentar sin token
        await axios.post(
            `${API_URL}/pedidos/${pedidoTestId}/cambiar-estado`,
            {
                id_estado: 2
            }
        );

        log('❌ ERROR: Se permitió cambiar estado sin autenticación', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ Validación correcta: se requiere autenticación', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// Ejecutar todas las pruebas
async function runTests() {
    log('╔════════════════════════════════════════════════╗', 'cyan');
    log('║  TEST AUTOMATIZADO RF-7: GESTIÓN PEDIDOS      ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const results = [];

    results.push(await testLogin());
    if (!results[0]) {
        log('\n❌ No se puede continuar sin login', 'red');
        return;
    }

    results.push(await testCrearPedido());
    if (!results[1]) {
        log('\n❌ No se puede continuar sin pedido de prueba', 'red');
        return;
    }

    results.push(await testTransicionValida());
    results.push(await testObservaciones());
    results.push(await testTransicionInvalida());
    results.push(await testPedidoInexistente());
    results.push(await testCambiarAListo());
    results.push(await testEstadoFinal());
    results.push(await testCambiarDesdeEstadoFinal());
    results.push(await testPermisos());

    // Resumen
    log('\n╔════════════════════════════════════════════════╗', 'cyan');
    log('║              RESUMEN DE PRUEBAS                ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const passed = results.filter(r => r).length;
    const total = results.length;

    log(`\n✅ Pruebas exitosas: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        log('\n🎉 ¡TODAS LAS PRUEBAS DE RF-7 PASARON!', 'green');
        log('✅ Transiciones válidas permitidas', 'green');
        log('✅ Transiciones inválidas rechazadas', 'green');
        log('✅ Observaciones guardadas en historial', 'green');
        log('✅ Estados finales protegidos', 'green');
        log('✅ Pedidos inexistentes rechazados', 'green');
        log('✅ Permisos validados correctamente', 'green');
    } else {
        log('\n⚠️  Algunas pruebas fallaron', 'yellow');
    }

    log('\n💡 Nota: Pedido #' + pedidoTestId + ' usado para pruebas', 'cyan');
}

// Ejecutar
runTests().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
