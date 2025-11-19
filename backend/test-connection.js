const axios = require('axios');

async function testConnection() {
  try {
    console.log('🔍 Probando conexión al backend...');
    
    // Test 1: Login
    console.log('\n📝 Test 1: Login');
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'Admin2@smartpyme.com',
      password: 'adm1234'
    });
    
    console.log('✅ Login exitoso');
    const token = loginRes.data.token;
    
    // Test 2: Obtener pedidos
    console.log('\n📝 Test 2: Obtener pedidos');
    const pedidosRes = await axios.get('http://localhost:3000/api/pedidos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Pedidos obtenidos: ${pedidosRes.data.length}`);
    
    if (pedidosRes.data.length > 0) {
      const primerPedido = pedidosRes.data[0];
      console.log('\n📋 Primer pedido:');
      console.log('  - ID:', primerPedido.id_pedido);
      console.log('  - Cliente:', primerPedido.cliente);
      console.log('  - Estado (nombre):', primerPedido.nombre_estado);
      console.log('  - Estado (id):', primerPedido.id_estado);
      console.log('  - Email cliente:', primerPedido.email_cliente);
      
      if (!primerPedido.id_estado) {
        console.log('\n❌ PROBLEMA: id_estado no está presente en la respuesta');
      } else {
        console.log('\n✅ id_estado presente correctamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testConnection();
