const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('\n=== PROBANDO LOGIN DE ELECTROTECH PREMIUM ===\n');
    console.log('Credenciales:');
    console.log('   Email: admin@electrotechpremium.com');
    console.log('   Password: 123456');
    console.log('   Tenant Slug: electrotech-premium\n');
    
    const response = await axios.post('http://localhost:3000/api/auth/admin/login', {
      email: 'admin@electrotechpremium.com',
      password: '123456',
      tenant_slug: 'electrotech-premium'
    });
    
    console.log('✅ LOGIN EXITOSO!\n');
    console.log('Token recibido:', response.data.data.token.substring(0, 50) + '...');
    console.log('\nDatos del usuario:');
    console.log(JSON.stringify(response.data.data.user, null, 2));
    console.log('\n📋 Datos del tenant (VERIFICAR QUE TENGA "plan"):');
    console.log(JSON.stringify(response.data.data.tenant, null, 2));
    
    if (response.data.data.tenant.plan) {
      console.log('\n✅ Campo "plan" presente:', response.data.data.tenant.plan);
    } else {
      console.log('\n❌ Campo "plan" FALTA en la respuesta!');
    }
    
  } catch (error) {
    console.log('❌ ERROR EN LOGIN:\n');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Mensaje:', error.response.data.message);
      console.log('Data completa:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('⚠️  No se pudo conectar al servidor');
      console.log('Asegúrate de que el backend esté corriendo en http://localhost:3000');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAdminLogin();
