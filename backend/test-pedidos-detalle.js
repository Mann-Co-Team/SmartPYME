const axios = require('axios');

(async () => {
    try {
        // Login
        console.log('🔐 Haciendo login...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'cliente1@pasteleria-dulce-sabor.com',
            password: 'Cliente123!',
            tenant_id: 18
        });
        
        const token = loginRes.data.data.token;
        console.log('✅ Token obtenido\n');
        
        // Obtener pedidos
        console.log('📦 Obteniendo pedidos...');
        const pedidosRes = await axios.get('http://localhost:3000/api/pedidos', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📝 RESPUESTA COMPLETA:');
        console.log(JSON.stringify(pedidosRes.data, null, 2));
        
        console.log('\n📊 ESTRUCTURA:');
        console.log('- pedidosRes.data:', typeof pedidosRes.data);
        console.log('- pedidosRes.data.data:', typeof pedidosRes.data.data);
        
        if (pedidosRes.data.data && Array.isArray(pedidosRes.data.data)) {
            console.log(`\n✅ pedidosRes.data.data es array con ${pedidosRes.data.data.length} elementos`);
            
            if (pedidosRes.data.data.length > 0) {
                const pedido = pedidosRes.data.data[0];
                console.log('\n📦 Primer pedido:', pedido.numero_pedido);
                
                // Obtener detalle
                console.log('\n📋 Obteniendo detalle...');
                const detalleRes = await axios.get(`http://localhost:3000/api/pedidos/${pedido.id_pedido}/detalle`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log('\n📝 DETALLE COMPLETO:');
                console.log(JSON.stringify(detalleRes.data, null, 2));
            }
        } else {
            console.log('\n⚠️ Estructura inesperada');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('\nDetalle:', JSON.stringify(error.response.data, null, 2));
        }
    }
})();
