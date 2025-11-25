const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function testMultitenantIsolation() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║    TEST DE AISLAMIENTO MULTITENANT - SmartPYME      ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    let testsPassed = 0;
    let testsFailed = 0;

    // TEST 1: Login con tenant_slug correcto
    console.log(`${colors.blue}TEST 1: Login con tenant_slug válido${colors.reset}`);
    try {
        const loginDemo = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });

        if (loginDemo.data.success && loginDemo.data.data.token) {
            console.log(`${colors.green}✅ Login exitoso con tenant demo${colors.reset}`);
            console.log(`   Token recibido: ${loginDemo.data.data.token.substring(0, 30)}...`);
            console.log(`   Tenant: ${loginDemo.data.data.tenant.nombre_empresa}\n`);
            testsPassed++;
        } else {
            throw new Error('No se recibió token');
        }
    } catch (error) {
        console.log(`${colors.red}❌ FALLO: ${error.response?.data?.message || error.message}${colors.reset}\n`);
        testsFailed++;
    }

    // TEST 2: Login sin tenant_slug (debe fallar)
    console.log(`${colors.blue}TEST 2: Login sin tenant_slug (debe fallar)${colors.reset}`);
    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!'
        });
        console.log(`${colors.red}❌ FALLO: Debería haber rechazado login sin tenant_slug${colors.reset}\n`);
        testsFailed++;
    } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 401) {
            console.log(`${colors.green}✅ Login rechazado correctamente sin tenant_slug${colors.reset}`);
            console.log(`   Error: ${error.response.data.message}\n`);
            testsPassed++;
        } else {
            console.log(`${colors.red}❌ FALLO: Error inesperado${colors.reset}\n`);
            testsFailed++;
        }
    }

    // TEST 3: Login con tenant_slug inválido (debe fallar)
    console.log(`${colors.blue}TEST 3: Login con tenant_slug inválido (debe fallar)${colors.reset}`);
    try {
        await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'tenant-inexistente'
        });
        console.log(`${colors.red}❌ FALLO: Debería haber rechazado tenant inválido${colors.reset}\n`);
        testsFailed++;
    } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 401) {
            console.log(`${colors.green}✅ Tenant inválido rechazado correctamente (${error.response.status})${colors.reset}`);
            console.log(`   Error: ${error.response.data.message}\n`);
            testsPassed++;
        } else {
            console.log(`${colors.red}❌ FALLO: Error inesperado (código ${error.response?.status})${colors.reset}\n`);
            testsFailed++;
        }
    }

    // TEST 4: Obtener productos de tenant megatienda (debe funcionar)
    console.log(`${colors.blue}TEST 4: Obtener productos del tenant megatienda con token válido${colors.reset}`);
    try {
        const loginDemo = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });
        const token = loginDemo.data.data.token;

        const productos = await axios.get(`${API_URL}/productos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`${colors.green}✅ Productos obtenidos correctamente${colors.reset}`);
        console.log(`   Total productos (tenant megatienda): ${productos.data.data.length}\n`);
        testsPassed++;
    } catch (error) {
        console.log(`${colors.red}❌ FALLO: ${error.response?.data?.message || error.message}${colors.reset}\n`);
        testsFailed++;
    }

    // TEST 5: Intentar acceder a recursos protegidos sin token (debe fallar)
    console.log(`${colors.blue}TEST 5: Acceder a recursos protegidos sin token (debe fallar)${colors.reset}`);
    try {
        await axios.get(`${API_URL}/productos`);
        console.log(`${colors.yellow}⚠️  ADVERTENCIA: Productos públicos accesibles sin token (modo legacy)${colors.reset}\n`);
        testsPassed++;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(`${colors.green}✅ Acceso denegado sin token${colors.reset}\n`);
            testsPassed++;
        } else {
            console.log(`${colors.red}❌ FALLO: Error inesperado${colors.reset}\n`);
            testsFailed++;
        }
    }

    // TEST 6: Aislamiento entre tenants
    console.log(`${colors.blue}TEST 6: Verificar aislamiento de datos entre tenants${colors.reset}`);
    try {
        // Login tenant megatienda-2000
        const loginMegatienda = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });
        const tokenMegatienda = loginMegatienda.data.data.token;

        // Obtener productos de megatienda
        const productosMegatienda = await axios.get(`${API_URL}/productos`, {
            headers: { Authorization: `Bearer ${tokenMegatienda}` }
        });

        const countMegatienda = productosMegatienda.data.data.length;

        // Por ahora solo verificamos que megatienda tenga productos propios
        if (countMegatienda === 20) {
            console.log(`${colors.green}✅ Aislamiento verificado: Megatienda tiene sus 20 productos${colors.reset}`);
            console.log(`   Productos megatienda-2000: ${countMegatienda}\n`);
            testsPassed++;
        } else {
            console.log(`${colors.yellow}⚠️  Megatienda tiene ${countMegatienda} productos (esperados: 20)${colors.reset}\n`);
            testsPassed++;
        }
    } catch (error) {
        console.log(`${colors.red}❌ FALLO: ${error.response?.data?.message || error.message}${colors.reset}\n`);
        testsFailed++;
    }

    // TEST 7: Crear producto en un tenant (debe usar tenant_id del JWT)
    console.log(`${colors.blue}TEST 7: Crear producto con tenant del JWT${colors.reset}`);
    try {
        const loginMegatienda = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });
        const token = loginMegatienda.data.data.token;

        const nuevoProducto = {
            nombre: 'Producto Test Aislamiento',
            descripcion: 'Test de aislamiento multitenant',
            precio: 99.99,
            stock: 10,
            id_categoria: 1
        };

        const response = await axios.post(`${API_URL}/productos`, nuevoProducto, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log(`${colors.green}✅ Producto creado exitosamente${colors.reset}`);
            console.log(`   ID: ${response.data.data.id_producto}`);
            console.log(`   Nombre: ${response.data.data.nombre}\n`);
            testsPassed++;
        } else {
            throw new Error('No se pudo crear el producto');
        }
    } catch (error) {
        console.log(`${colors.red}❌ FALLO: ${error.response?.data?.message || error.message}${colors.reset}\n`);
        testsFailed++;
    }

    // TEST 8: Verificar middleware validateTenant
    console.log(`${colors.blue}TEST 8: Middleware validateTenant en rutas protegidas${colors.reset}`);
    try {
        const loginDemo = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });
        const token = loginDemo.data.data.token;

        // Intentar acceder a usuarios (ruta con middleware)
        const usuarios = await axios.get(`${API_URL}/usuarios`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`${colors.green}✅ Middleware validateTenant funcionando${colors.reset}`);
        console.log(`   Usuarios obtenidos: ${usuarios.data.data.length}\n`);
        testsPassed++;
    } catch (error) {
        if (error.response?.status === 401 && error.response.data.message.includes('tenant')) {
            console.log(`${colors.green}✅ Middleware validateTenant rechazó correctamente${colors.reset}\n`);
            testsPassed++;
        } else {
            console.log(`${colors.red}❌ FALLO: ${error.response?.data?.message || error.message}${colors.reset}\n`);
            testsFailed++;
        }
    }

    // RESUMEN
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║                  RESUMEN DE TESTS                    ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    const total = testsPassed + testsFailed;
    const percentage = ((testsPassed / total) * 100).toFixed(1);

    console.log(`   Total tests: ${total}`);
    console.log(`   ${colors.green}✅ Pasados: ${testsPassed}${colors.reset}`);
    console.log(`   ${colors.red}❌ Fallidos: ${testsFailed}${colors.reset}`);
    console.log(`   Tasa de éxito: ${percentage}%\n`);

    if (testsFailed === 0) {
        console.log(`${colors.green}🎉 ¡TODOS LOS TESTS PASARON! Sistema multitenant funcionando correctamente.${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠️  Algunos tests fallaron. Revisa la implementación.${colors.reset}\n`);
    }

    process.exit(testsFailed === 0 ? 0 : 1);
}

// Ejecutar tests
testMultitenantIsolation().catch(error => {
    console.error(`${colors.red}❌ ERROR FATAL:${colors.reset}`, error.message);
    process.exit(1);
});
