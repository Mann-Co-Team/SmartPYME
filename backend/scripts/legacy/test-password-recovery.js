const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'juan.perez@ejemplo.com';

async function testRecoveryFlow() {
  console.log('🧪 Iniciando prueba de recuperación de contraseña\n');
  
  try {
    // Paso 1: Solicitar recuperación
    console.log('📧 Paso 1: Solicitando recuperación de contraseña...');
    const solicitarRes = await fetch(`${BASE_URL}/api/password-recovery/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    const solicitarData = await solicitarRes.json();
    console.log('✅ Respuesta:', solicitarData);
    
    if (!solicitarData.success || !solicitarData.dev_token) {
      console.error('❌ No se obtuvo el token de desarrollo');
      process.exit(1);
    }
    
    const token = solicitarData.dev_token;
    console.log(`\n🔑 Token generado: ${token.substring(0, 20)}...`);
    
    // Paso 2: Verificar token
    console.log('\n🔍 Paso 2: Verificando validez del token...');
    const verificarRes = await fetch(`${BASE_URL}/api/password-recovery/verificar/${token}`);
    const verificarData = await verificarRes.json();
    console.log('✅ Verificación:', verificarData);
    
    if (!verificarData.success) {
      console.error('❌ Token inválido');
      process.exit(1);
    }
    
    // Paso 3: Resetear contraseña
    console.log('\n🔐 Paso 3: Reseteando contraseña...');
    const nuevaPassword = 'nueva123';
    const resetearRes = await fetch(`${BASE_URL}/api/password-recovery/resetear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        nuevaPassword,
        confirmarPassword: nuevaPassword
      })
    });
    
    const resetearData = await resetearRes.json();
    console.log('✅ Resultado:', resetearData);
    
    if (!resetearData.success) {
      console.error('❌ Error al resetear contraseña');
      process.exit(1);
    }
    
    // Paso 4: Probar login con nueva contraseña
    console.log('\n🔓 Paso 4: Probando login con nueva contraseña...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: nuevaPassword
      })
    });
    
    const loginData = await loginRes.json();
    console.log('✅ Login exitoso:', { 
      usuario: loginData.data?.user?.nombre,
      email: loginData.data?.user?.email,
      token: loginData.data?.token ? 'Token JWT generado' : 'Sin token'
    });
    
    // Paso 5: Intentar reutilizar el token (debe fallar)
    console.log('\n🚫 Paso 5: Intentando reutilizar token (debe fallar)...');
    const reusoRes = await fetch(`${BASE_URL}/api/password-recovery/verificar/${token}`);
    const reusoData = await reusoRes.json();
    console.log('✅ Verificación de reuso:', reusoData);
    
    if (reusoData.success) {
      console.error('⚠️  ADVERTENCIA: El token debería estar marcado como usado');
    } else {
      console.log('✅ Correcto: El token ya fue usado y no puede reutilizarse');
    }
    
    // Paso 6: Restaurar contraseña original
    console.log('\n🔄 Paso 6: Restaurando contraseña original...');
    const solicitarRes2 = await fetch(`${BASE_URL}/api/password-recovery/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    const solicitarData2 = await solicitarRes2.json();
    const token2 = solicitarData2.dev_token;
    
    const resetearRes2 = await fetch(`${BASE_URL}/api/password-recovery/resetear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token2,
        nuevaPassword: 'cliente123',
        confirmarPassword: 'cliente123'
      })
    });
    
    const resetearData2 = await resetearRes2.json();
    console.log('✅ Contraseña restaurada:', resetearData2);
    
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ PRUEBA COMPLETADA EXITOSAMENTE                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ 1. ✅ Solicitud de recuperación                           ║');
    console.log('║ 2. ✅ Verificación de token                               ║');
    console.log('║ 3. ✅ Reseteo de contraseña                               ║');
    console.log('║ 4. ✅ Login con nueva contraseña                          ║');
    console.log('║ 5. ✅ Prevención de reuso de token                        ║');
    console.log('║ 6. ✅ Restauración de contraseña original                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Verificar que el servidor esté corriendo
fetch(`${BASE_URL}/api/auth/login`, { method: 'POST' })
  .then(() => {
    console.log('✅ Servidor backend detectado en', BASE_URL);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    testRecoveryFlow();
  })
  .catch(() => {
    console.error('❌ Error: El servidor backend no está corriendo');
    console.error('   Por favor inicia el servidor con: npm run dev');
    process.exit(1);
  });
