const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMultiTenantFlow() {
    console.log('🧪 PRUEBA DE SISTEMA MULTI-TENANT\n');
    console.log('='.repeat(60));

    try {
        // 1. Login en electrotech
        console.log('\n📍 PASO 1: Login en electrotech');
        const loginElectrotech = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'cliente@electrotech.com',
            password: 'cliente123',
            tenant_id: 20 // electrotech
        });

        const tokenElectrotech = loginElectrotech.data.data.token;
        const userElectrotech = loginElectrotech.data.data.user;
        console.log(`✅ Login exitoso en electrotech`);
        console.log(`   Usuario: ${userElectrotech.nombre} ${userElectrotech.apellido}`);
        console.log(`   Email: ${userElectrotech.email}`);
        console.log(`   Tenant ID del token: Se espera 20`);

        // 2. Obtener productos de fashion (tenant 21)
        console.log('\n📍 PASO 2: Obtener productos de fashion (tenant diferente)');
        const productosFashion = await axios.get(`${BASE_URL}/productos`, {
            headers: {
                'x-tenant-slug': 'fashion-store',
                'Authorization': `Bearer ${tokenElectrotech}`
            }
        });
        console.log(`✅ Productos de fashion obtenidos: ${productosFashion.data.data.length} productos`);

        if (productosFashion.data.data.length === 0) {
            console.log('⚠️  No hay productos en fashion, saltando prueba de pedido');
            return;
        }

        const producto = productosFashion.data.data[0];
        console.log(`   Producto de prueba: ${producto.nombre} (ID: ${producto.id_producto})`);

        // 3. Intentar crear pedido en fashion con token de electrotech
        console.log('\n📍 PASO 3: Intentar crear pedido en fashion con usuario de electrotech');
        console.log('   ⚠️  ESTO DEBE FALLAR con error 403');

        try {
            const pedido = await axios.post(`${BASE_URL}/pedidos`, {
                items: [{
                    id_producto: producto.id_producto,
                    cantidad: 1,
                    precio_unitario: producto.precio,
                    subtotal: producto.precio
                }],
                total: producto.precio,
                metodo_pago: 'efectivo',
                metodo_entrega: 'pickup',
                notas: 'Prueba multi-tenant'
            }, {
                headers: {
                    'x-tenant-slug': 'fashion-store',
                    'Authorization': `Bearer ${tokenElectrotech}`
                }
            });

            console.log('❌ ERROR: El pedido se creó cuando NO debería');
            console.log('   Pedido creado:', pedido.data);
            console.log('\n🚨 PRUEBA FALLIDA: La validación multi-tenant NO está funcionando');

        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log('✅ CORRECTO: Pedido rechazado con error 403');
                console.log(`   Mensaje: ${error.response.data.message}`);
                console.log('\n🎉 PRUEBA EXITOSA: La validación multi-tenant está funcionando correctamente');
            } else {
                console.log('❌ ERROR INESPERADO:', error.response?.data || error.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Prueba completada\n');

    } catch (error) {
        console.error('\n❌ Error en la prueba:', error.response?.data || error.message);
        console.log('\n🚨 PRUEBA FALLIDA\n');
    }
}

// Ejecutar prueba
testMultiTenantFlow()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error fatal:', err);
        process.exit(1);
    });
