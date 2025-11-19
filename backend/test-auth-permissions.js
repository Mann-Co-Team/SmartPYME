const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testAuthAndPermissions() {
    try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧪 TEST DE AUTENTICACIÓN Y PERMISOS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 1. Login
        console.log('1️⃣  Intentando login como admin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'Admin2@smartpyme.com',
            password: 'adm1234'
        });

        if (!loginResponse.data.data || !loginResponse.data.data.token) {
            console.log('❌ Error: No se recibió token');
            console.log('   Respuesta:', JSON.stringify(loginResponse.data, null, 2));
            return;
        }

        const token = loginResponse.data.data.token;
        const userData = loginResponse.data.data.user;
        console.log('✅ Login exitoso');
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   Usuario: ${userData.nombre} - Rol: ${userData.rol}`);

        // 2. Decodificar token (simple, sin verificar)
        const tokenParts = token.split('.');
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('\n📦 Payload del token:');
        console.log(JSON.stringify(payload, null, 2));

        // 3. Intentar crear producto
        console.log('\n2️⃣  Intentando crear producto...');
        const productData = {
            nombre: 'Test Producto Auth',
            id_categoria: 1,
            precio: 1000,
            stock: 1,
            activo: true
        };

        const createResponse = await axios.post(
            `${API_URL}/productos`,
            productData,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('✅ Producto creado exitosamente');
        console.log(`   ID: ${createResponse.data.id}`);

        // 4. Limpiar - eliminar producto de prueba
        console.log('\n3️⃣  Limpiando producto de prueba...');
        await axios.delete(
            `${API_URL}/productos/${createResponse.data.id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        console.log('✅ Producto eliminado');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ TODOS LOS TESTS PASARON');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.log('\n❌ ERROR EN EL TEST:');
        
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
            
            if (error.response.status === 403) {
                console.log('\n🔍 DIAGNÓSTICO:');
                console.log('   El token es válido pero no tiene permisos.');
                console.log('   Verificar:');
                console.log('   • El middleware auth.js asigna correctamente nombre_rol');
                console.log('   • El middleware permissions.js lee correctamente el rol');
                console.log('   • El rolePermissions incluye "manage_products" para el rol');
            }
        } else {
            console.log(`   ${error.message}`);
        }
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

testAuthAndPermissions();
