const http = require('http');

// Configuración
const API_BASE = 'localhost';
const API_PORT = 5000;
let authToken = null;
let pedidoId = null;

// Helper para hacer peticiones HTTP
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST DE SISTEMA DE CANCELACIÓN DE PEDIDOS');
  console.log('='.repeat(60) + '\n');

  try {
    // TEST 1: Login
    console.log(colors.blue + '📝 TEST 1: Login de usuario cliente' + colors.reset);
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'juan.perez@ejemplo.com',
      password: 'prueba123'
    });

    if (loginRes.data.success && loginRes.data.data.token) {
      authToken = loginRes.data.data.token;
      console.log(colors.green + '✅ Login exitoso - Usuario: ' + loginRes.data.data.user.nombre + colors.reset);
    } else {
      console.log('Respuesta del servidor:', JSON.stringify(loginRes, null, 2));
      throw new Error('Error en login: ' + (loginRes.data.message || 'Sin mensaje'));
    }

    // TEST 2: Crear pedido en estado pendiente
    console.log(colors.blue + '\n📝 TEST 2: Crear pedido de prueba' + colors.reset);
    const crearPedidoRes = await makeRequest('POST', '/pedidos', {
      productos: [
        { id: 1, cantidad: 1 }
      ],
      tipo_entrega: 'retiro',
      notas: 'Pedido de prueba para cancelación'
    }, authToken);

    console.log('Status:', crearPedidoRes.statusCode);
    console.log('Respuesta:', JSON.stringify(crearPedidoRes.data, null, 2));
    
    if (crearPedidoRes.data.success) {
      pedidoId = crearPedidoRes.data.pedidoId;
      console.log(colors.green + `✅ Pedido creado: ID ${pedidoId}` + colors.reset);
    } else {
      throw new Error('Error creando pedido: ' + crearPedidoRes.data.message);
    }

    // TEST 3: Verificar stock antes de cancelar
    console.log(colors.blue + '\n📝 TEST 3: Verificar stock antes de cancelar' + colors.reset);
    const stockAntesRes = await makeRequest('GET', '/productos/1');
    const stockAntes = stockAntesRes.data.stock;
    console.log(colors.yellow + `📦 Stock actual del producto 1: ${stockAntes}` + colors.reset);

    // TEST 4: Cancelar pedido (OPCIÓN 1)
    console.log(colors.blue + '\n📝 TEST 4: Cancelar pedido inmediatamente (estado pendiente)' + colors.reset);
    const cancelarRes = await makeRequest('POST', `/pedidos/${pedidoId}/cancelar`, null, authToken);

    if (cancelarRes.data.success) {
      console.log(colors.green + '✅ Pedido cancelado: ' + cancelarRes.data.message + colors.reset);
    } else {
      throw new Error('Error cancelando: ' + cancelarRes.data.message);
    }

    // TEST 5: Verificar stock después de cancelar
    console.log(colors.blue + '\n📝 TEST 5: Verificar stock después de cancelar' + colors.reset);
    const stockDespuesRes = await makeRequest('GET', '/productos/1');
    const stockDespues = stockDespuesRes.data.stock;
    console.log(colors.yellow + `📦 Stock después de cancelar: ${stockDespues}` + colors.reset);

    if (stockDespues === stockAntes + 1) {
      console.log(colors.green + '✅ Stock devuelto correctamente (+1)' + colors.reset);
    } else {
      throw new Error(`❌ Stock incorrecto. Esperado: ${stockAntes + 1}, Obtenido: ${stockDespues}`);
    }

    // TEST 6: Crear segundo pedido para solicitar cancelación
    console.log(colors.blue + '\n📝 TEST 6: Crear segundo pedido para solicitud de cancelación' + colors.reset);
    const pedido2Res = await makeRequest('POST', '/pedidos', {
      productos: [
        { id: 1, cantidad: 2 }
      ],
      tipo_entrega: 'retiro',
      notas: 'Pedido para probar solicitud de cancelación'
    }, authToken);

    if (pedido2Res.data.success) {
      const pedido2Id = pedido2Res.data.pedidoId;
      console.log(colors.green + `✅ Segundo pedido creado: ID ${pedido2Id}` + colors.reset);

      // Cambiar estado a confirmado (esto normalmente lo haría un admin)
      // Nota: Necesitamos usar directamente la BD o un endpoint admin
      console.log(colors.yellow + '⚠️  Nota: Para probar OPCIÓN 2 (solicitar cancelación), el pedido debe estar en "confirmado" o "en_proceso"' + colors.reset);
      console.log(colors.yellow + '    Esto normalmente lo haría un administrador desde su panel' + colors.reset);
    }

    console.log('\n' + '='.repeat(60));
    console.log(colors.green + '✅ TODOS LOS TESTS COMPLETADOS CON ÉXITO' + colors.reset);
    console.log('='.repeat(60) + '\n');

    console.log('📊 RESUMEN:');
    console.log('  ✅ Login de cliente');
    console.log('  ✅ Creación de pedido');
    console.log('  ✅ Cancelación inmediata (OPCIÓN 1)');
    console.log('  ✅ Devolución automática de stock');
    console.log('  ⚠️  OPCIÓN 2 y 3 requieren acceso admin para cambiar estados\n');

  } catch (error) {
    console.error(colors.red + '\n❌ ERROR: ' + error.message + colors.reset);
    process.exit(1);
  }
}

runTests();
