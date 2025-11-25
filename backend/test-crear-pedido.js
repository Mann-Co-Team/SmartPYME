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
        
        // Crear pedido
        console.log('📦 Creando pedido...');
        const pedidoRes = await axios.post('http://localhost:3000/api/pedidos', {
            items: [{
                id_producto: 136,
                cantidad: 1,
                precio_unitario: 25000,
                subtotal: 25000
            }],
            total: 25000,
            metodo_entrega: 'pickup',
            metodo_pago: 'efectivo',
            notas: 'Pedido de prueba RF-3'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Pedido creado exitosamente!');
        console.log(JSON.stringify(pedidoRes.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('\nDetalle:', JSON.stringify(error.response.data, null, 2));
        }
    }
})();
