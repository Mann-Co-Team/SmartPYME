const axios = require('axios');

(async () => {
    try {
        console.log('Probando endpoint de pedidos...\n');
        
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'Admin2@smartpyme.com',
            password: 'adm1234'
        });
        
        const token = loginRes.data.data.token;
        console.log('✅ Login exitoso\n');
        
        const pedidosRes = await axios.get('http://localhost:3000/api/pedidos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        const pedidos = pedidosRes.data.data || pedidosRes.data;
        
        console.log('Primer pedido:');
        console.log(JSON.stringify(pedidos[0], null, 2));
        console.log('\nCampos importantes:');
        console.log('- id_pedido:', pedidos[0].id_pedido);
        console.log('- id_estado:', pedidos[0].id_estado);
        console.log('- nombre_estado:', pedidos[0].nombre_estado);
        
    } catch (error) {
        console.error('Error completo:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
})();
