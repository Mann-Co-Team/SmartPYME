const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testSingleTenant() {
    try {
        // Login Megatienda
        console.log('1. Haciendo login como Megatienda...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        });

        const token = loginResponse.data.data.token;
        const tenant = loginResponse.data.data.tenant;
        
        console.log('   ✅ Login exitoso');
        console.log('   📋 Tenant:', tenant.nombre, '(ID:', tenant.id, ')');

        // Get productos
        console.log('\n2. Obteniendo productos...');
        const productosResponse = await axios.get(`${API_URL}/productos`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const productos = productosResponse.data.data;
        console.log('   📦 Productos obtenidos:', productos.length);
        
        // Mostrar los primeros 5
        console.log('\n3. Primeros 5 productos:');
        productos.slice(0, 5).forEach((p, i) => {
            console.log(`   ${i+1}. [Tenant ${p.id_tenant}] ${p.nombre} - $${p.precio}`);
        });

        // Ver distribución por tenant_id
        const distribution = productos.reduce((acc, p) => {
            acc[p.id_tenant] = (acc[p.id_tenant] || 0) + 1;
            return acc;
        }, {});

        console.log('\n4. Distribución por tenant_id:');
        Object.entries(distribution).forEach(([tenantId, count]) => {
            console.log(`   Tenant ${tenantId}: ${count} productos`);
        });

        console.log('\n🚨 PROBLEMA DETECTADO:');
        console.log('   El usuario del Tenant 4 (Megatienda) está viendo productos de TODOS los tenants!');
        console.log('   El filtrado por tenant_id NO está funcionando.');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testSingleTenant();
