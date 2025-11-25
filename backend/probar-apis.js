const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function probarAPIs() {
    try {
        console.log('🧪 PROBANDO APIs\n');

        // 1. Test API status
        console.log('1️⃣ Probando /api/status...');
        try {
            const statusRes = await axios.get(`${API_URL}/status`);
            console.log('✅ Backend funcionando:', statusRes.data.status);
        } catch (error) {
            console.log('❌ Backend NO está funcionando:', error.message);
            console.log('💡 Inicia el backend con: npm start');
            return;
        }

        console.log('');

        // 2. Test tenants
        console.log('2️⃣ Probando /api/tenants/slug/demo...');
        try {
            const tenantRes = await axios.get(`${API_URL}/tenants/slug/demo`);
            console.log('✅ Tenant encontrado:', tenantRes.data.data.nombre_empresa);
            console.log('   ID:', tenantRes.data.data.id_tenant);
            console.log('   Slug:', tenantRes.data.data.slug);
            console.log('   Plan:', tenantRes.data.data.plan);
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 3. Test categorías públicas
        console.log('3️⃣ Probando /api/catalogo/demo/categorias...');
        try {
            const catRes = await axios.get(`${API_URL}/catalogo/demo/categorias`);
            console.log('✅ Categorías encontradas:', catRes.data.data.length);
            catRes.data.data.slice(0, 3).forEach(cat => {
                console.log(`   - ${cat.nombre} (ID: ${cat.id_categoria})`);
            });
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 4. Test productos públicos
        console.log('4️⃣ Probando /api/catalogo/demo/productos...');
        try {
            const prodRes = await axios.get(`${API_URL}/catalogo/demo/productos`);
            console.log('✅ Productos encontrados:', prodRes.data.data.length);
            prodRes.data.data.forEach(prod => {
                console.log(`   - ${prod.nombre} - $${prod.precio} (Stock: ${prod.stock})`);
            });
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 5. Test otras tiendas
        const tiendas = ['tienda-abc', 'comercial-xyz', 'pasteleria-dulce-sabor'];
        for (const slug of tiendas) {
            console.log(`5️⃣ Probando /api/catalogo/${slug}/productos...`);
            try {
                const res = await axios.get(`${API_URL}/catalogo/${slug}/productos`);
                console.log(`✅ ${slug}: ${res.data.data.length} productos`);
            } catch (error) {
                console.log(`❌ ${slug}: Error -`, error.response?.data?.message || error.message);
            }
        }

        console.log('');
        console.log('✅ Pruebas completadas');

    } catch (error) {
        console.error('💥 Error general:', error.message);
    }
}

probarAPIs();
