const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

let token = '';
let usuarioTestId = null;

// Función auxiliar para logging
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Login como admin
async function testLogin() {
    log('\n📝 Paso 1: Login como administrador', 'cyan');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'Admin2@smartpyme.com',
            password: 'adm1234'
        });

        token = response.data.data.token;
        log('✅ Login exitoso', 'green');
        log(`   Token: ${token.substring(0, 20)}...`, 'yellow');
        return true;
    } catch (error) {
        log(`❌ Error en login: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 2. Obtener roles disponibles
async function testGetRoles() {
    log('\n📝 Paso 2: Obtener roles disponibles', 'cyan');
    try {
        const response = await axios.get(`${API_URL}/usuarios/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const roles = response.data.data;
        log('✅ Roles obtenidos correctamente', 'green');
        log(`   Cantidad de roles: ${roles.length}`, 'yellow');
        roles.forEach(rol => {
            log(`   - ${rol.nombre_rol} (ID: ${rol.id_rol})`, 'yellow');
        });
        return true;
    } catch (error) {
        log(`❌ Error obteniendo roles: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 3. Crear usuario con datos válidos
async function testCrearUsuario() {
    log('\n📝 Paso 3: Crear usuario con datos válidos', 'cyan');
    try {
        const timestamp = Date.now();
        const response = await axios.post(`${API_URL}/usuarios`, {
            nombre: 'Usuario',
            apellido: `Test RF-6 ${timestamp}`,
            email: `test.rf6.${timestamp}@smartpyme.com`,
            password: 'password123',
            telefono: '+56912345678',
            id_rol: 3 // Cliente
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        usuarioTestId = response.data.data.id;
        log('✅ Usuario creado exitosamente', 'green');
        log(`   ID: ${usuarioTestId}`, 'yellow');
        return true;
    } catch (error) {
        log(`❌ Error creando usuario: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 4. Validar duplicados - intentar crear usuario con mismo email
async function testValidarEmailDuplicado() {
    log('\n📝 Paso 4: Validar que no se permiten emails duplicados', 'cyan');
    
    const timestamp = Date.now();
    const emailReferencia = `test.ref.${timestamp}@smartpyme.com`;
    let usuarioRefId;
    
    // Primero crear un usuario de referencia
    try {
        const response = await axios.post(`${API_URL}/usuarios`, {
            nombre: 'Usuario',
            apellido: 'Referencia',
            email: emailReferencia,
            password: 'password123',
            id_rol: 3
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        usuarioRefId = response.data.data.id;
        log(`   Usuario de referencia creado: ${usuarioRefId}`, 'yellow');
    } catch (error) {
        log(`❌ Error creando usuario de referencia: ${error.message}`, 'red');
        return false;
    }
    
    // Ahora intentar crear con el mismo email
    try {
        await axios.post(`${API_URL}/usuarios`, {
            nombre: 'Usuario',
            apellido: 'Duplicado',
            email: emailReferencia, // Mismo email
            password: 'password123',
            id_rol: 3
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió crear usuario con email duplicado', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('email')) {
            log('✅ Validación correcta: no se permiten emails duplicados', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            
            // Limpiar: eliminar usuario de referencia
            try {
                await axios.delete(`${API_URL}/usuarios/${usuarioRefId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (e) {
                // Ignorar errores de limpieza
            }
            
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 5. Validar rol inexistente
async function testValidarRolInexistente() {
    log('\n📝 Paso 5: Validar que no se permiten roles inexistentes', 'cyan');
    try {
        const timestamp = Date.now();
        await axios.post(`${API_URL}/usuarios`, {
            nombre: 'Usuario',
            apellido: 'Test',
            email: `test.rol.${timestamp}@smartpyme.com`,
            password: 'password123',
            id_rol: 999 // Rol inexistente
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió crear usuario con rol inexistente', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('rol')) {
            log('✅ Validación correcta: no se permiten roles inexistentes', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 6. Editar usuario
async function testEditarUsuario() {
    log('\n📝 Paso 6: Editar usuario existente', 'cyan');
    try {
        const timestamp = Date.now();
        const response = await axios.put(`${API_URL}/usuarios/${usuarioTestId}`, {
            nombre: 'Usuario',
            apellido: `Editado ${timestamp}`,
            email: `editado.${timestamp}@smartpyme.com`,
            telefono: '+56987654321',
            id_rol: 2 // Cambiar a empleado
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('✅ Usuario editado exitosamente', 'green');
        return true;
    } catch (error) {
        log(`❌ Error editando usuario: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 7. Cambiar estado activo/inactivo
async function testToggleActive() {
    log('\n📝 Paso 7: Cambiar estado activo/inactivo', 'cyan');
    try {
        await axios.patch(`${API_URL}/usuarios/${usuarioTestId}/toggle-active`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('✅ Estado cambiado exitosamente', 'green');
        
        // Volver a activar para siguiente test
        await axios.patch(`${API_URL}/usuarios/${usuarioTestId}/toggle-active`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        log('   Estado restaurado', 'yellow');
        
        return true;
    } catch (error) {
        log(`❌ Error cambiando estado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 8. Validar campos obligatorios
async function testValidarCamposObligatorios() {
    log('\n📝 Paso 8: Validar campos obligatorios', 'cyan');
    try {
        await axios.post(`${API_URL}/usuarios`, {
            nombre: 'Usuario',
            // Faltan apellido, email, password, id_rol
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió crear usuario sin campos obligatorios', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ Validación correcta: campos obligatorios requeridos', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 9. Eliminar usuario
async function testEliminarUsuario() {
    log('\n📝 Paso 9: Eliminar usuario', 'cyan');
    try {
        await axios.delete(`${API_URL}/usuarios/${usuarioTestId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('✅ Usuario eliminado exitosamente', 'green');
        return true;
    } catch (error) {
        log(`❌ Error eliminando usuario: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 10. Validar permisos - solo admin
async function testValidarPermisos() {
    log('\n📝 Paso 10: Validar permisos de administrador', 'cyan');
    try {
        const timestamp = Date.now();
        await axios.get(`${API_URL}/usuarios`);

        log('❌ ERROR: Se permitió acceder sin autenticación', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ Validación correcta: se requiere autenticación', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// Ejecutar todas las pruebas
async function runTests() {
    log('╔════════════════════════════════════════════════╗', 'cyan');
    log('║   TEST AUTOMATIZADO RF-6: GESTIÓN USUARIOS    ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const results = [];

    results.push(await testLogin());
    if (!results[0]) {
        log('\n❌ No se puede continuar sin login', 'red');
        return;
    }

    results.push(await testGetRoles());
    results.push(await testCrearUsuario());
    results.push(await testValidarEmailDuplicado());
    results.push(await testValidarRolInexistente());
    results.push(await testEditarUsuario());
    results.push(await testToggleActive());
    results.push(await testValidarCamposObligatorios());
    results.push(await testEliminarUsuario());
    results.push(await testValidarPermisos());

    // Resumen
    log('\n╔════════════════════════════════════════════════╗', 'cyan');
    log('║              RESUMEN DE PRUEBAS                ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const passed = results.filter(r => r).length;
    const total = results.length;

    log(`\n✅ Pruebas exitosas: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        log('\n🎉 ¡TODAS LAS PRUEBAS DE RF-6 PASARON!', 'green');
        log('✅ Obtener roles disponibles', 'green');
        log('✅ Crear usuarios', 'green');
        log('✅ Editar usuarios', 'green');
        log('✅ Cambiar estado activo/inactivo', 'green');
        log('✅ Eliminar usuarios', 'green');
        log('✅ Validación de emails duplicados', 'green');
        log('✅ Validación de roles inexistentes', 'green');
        log('✅ Validación de campos obligatorios', 'green');
        log('✅ Validación de permisos', 'green');
    } else {
        log('\n⚠️  Algunas pruebas fallaron', 'yellow');
    }
}

// Ejecutar
runTests().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
