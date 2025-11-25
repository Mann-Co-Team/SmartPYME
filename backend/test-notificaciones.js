const axios = require('axios');

(async () => {
    try {
        // Login como admin
        console.log('🔐 Haciendo login como admin...');
        const loginRes = await axios.post('http://localhost:3000/api/auth/admin/login', {
            email: 'admin@pasteleria-dulce-sabor.com',
            password: 'Admin123!',
            tenant_slug: 'pasteleria-dulce-sabor'
        });
        
        const token = loginRes.data.data.token;
        console.log('✅ Token obtenido\n');
        
        // Obtener notificaciones
        console.log('📬 Obteniendo notificaciones...');
        const notifRes = await axios.get('http://localhost:3000/api/notificaciones', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('\n📝 RESPUESTA COMPLETA:');
        console.log(JSON.stringify(notifRes.data, null, 2));
        
        console.log('\n📊 ESTRUCTURA:');
        console.log('- notifRes.data:', typeof notifRes.data);
        console.log('- notifRes.data.data:', typeof notifRes.data.data);
        
        if (Array.isArray(notifRes.data)) {
            console.log(`\n✅ notifRes.data es array con ${notifRes.data.length} elementos`);
        } else if (notifRes.data.data && Array.isArray(notifRes.data.data)) {
            console.log(`\n✅ notifRes.data.data es array con ${notifRes.data.data.length} elementos`);
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
