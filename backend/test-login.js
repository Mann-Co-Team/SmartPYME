const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Probando login con credenciales:\n');
    console.log('   Email: admin@smartpyme.com');
    console.log('   Password: admin123\n');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@smartpyme.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso!\n');
    console.log('Respuesta del servidor:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error en login:\n');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
