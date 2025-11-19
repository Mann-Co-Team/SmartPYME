const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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
let productoTestId = null;

// Función auxiliar para logging
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. Login como admin
async function testLogin() {
    log('\n📝 Paso 1: Login como administrador', 'cyan');
    try {
        log(`   Conectando a: ${API_URL}/auth/login`, 'yellow');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'Admin2@smartpyme.com',
            password: 'adm1234'
        }, {
            timeout: 5000
        });

        token = response.data.data.token;
        log('✅ Login exitoso', 'green');
        log(`   Token: ${token.substring(0, 20)}...`, 'yellow');
        return true;
    } catch (error) {
        log(`❌ Error en login: ${error.message}`, 'red');
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'red');
            log(`   Data: ${JSON.stringify(error.response.data)}`, 'red');
        } else if (error.request) {
            log(`   No se recibió respuesta del servidor`, 'red');
        }
        return false;
    }
}

// 2. Crear producto con datos válidos
async function testCrearProducto() {
    log('\n📝 Paso 2: Crear producto con datos válidos', 'cyan');
    try {
        const timestamp = Date.now();
        const response = await axios.post(`${API_URL}/productos`, {
            nombre: `Producto Test RF-5 ${timestamp}`,
            descripcion: 'Producto de prueba para RF-5',
            precio: 99.99,
            stock: 50,
            id_categoria: 1,
            activo: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        productoTestId = response.data.data.id;
        log('✅ Producto creado exitosamente', 'green');
        log(`   ID: ${productoTestId}`, 'yellow');
        return true;
    } catch (error) {
        log(`❌ Error creando producto: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 3. Validar duplicados - intentar crear producto con mismo nombre
async function testValidarDuplicado() {
    log('\n📝 Paso 3: Validar que no se permiten nombres duplicados', 'cyan');
    
    // Primero crear un segundo producto
    const timestamp = Date.now();
    const nombreReferencia = `Producto Test RF-5 Ref ${timestamp}-${Math.random().toString(36).substr(2, 5)}`;
    let productoRefId;
    
    try {
        const response2 = await axios.post(`${API_URL}/productos`, {
            nombre: nombreReferencia,
            descripcion: 'Producto para validar duplicados',
            precio: 50.00,
            stock: 10,
            id_categoria: 1,
            activo: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        productoRefId = response2.data.data.id;
        log(`   Producto de referencia creado: ${productoRefId}`, 'yellow');
    } catch (error) {
        log(`❌ Error creando producto de referencia: ${error.message}`, 'red');
        return false;
    }
    
    // Ahora intentar crear con el mismo nombre
    try {
        await axios.post(`${API_URL}/productos`, {
            nombre: nombreReferencia, // Mismo nombre
            descripcion: 'Intento de duplicado',
            precio: 50.00,
            stock: 10,
            id_categoria: 1,
            activo: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió crear producto duplicado', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.toLowerCase().includes('ya existe')) {
            log('✅ Validación correcta: no se permiten duplicados', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            
            // Limpiar: eliminar producto de referencia
            try {
                await axios.delete(`${API_URL}/productos/${productoRefId}`, {
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
        log(`   Status: ${error.response?.status}`, 'red');
        return false;
    }
}

// 4. Editar producto
async function testEditarProducto() {
    log('\n📝 Paso 4: Editar producto existente', 'cyan');
    try {
        const timestamp = Date.now();
        const response = await axios.put(`${API_URL}/productos/${productoTestId}`, {
            nombre: `Producto Test RF-5 Editado ${timestamp}`,
            descripcion: 'Descripción actualizada',
            precio: 149.99,
            stock: 75,
            id_categoria: 1,
            activo: true
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('✅ Producto editado exitosamente', 'green');
        return true;
    } catch (error) {
        log(`❌ Error editando producto: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 5. Validar campos obligatorios
async function testValidarCamposObligatorios() {
    log('\n📝 Paso 5: Validar campos obligatorios', 'cyan');
    try {
        await axios.post(`${API_URL}/productos`, {
            descripcion: 'Sin nombre ni precio',
            stock: 10,
            id_categoria: 1
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió crear producto sin campos obligatorios', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ Validación correcta: campos obligatorios requeridos', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 6. Intentar eliminar producto sin pedidos (debe funcionar)
async function testEliminarProductoSinPedidos() {
    log('\n📝 Paso 6: Eliminar producto sin pedidos asociados', 'cyan');
    try {
        const response = await axios.delete(`${API_URL}/productos/${productoTestId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('✅ Producto eliminado exitosamente', 'green');
        return true;
    } catch (error) {
        log(`❌ Error eliminando producto: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 7. Intentar eliminar producto con pedidos (debe fallar)
async function testEliminarProductoConPedidos() {
    log('\n📝 Paso 7: Validar que no se puede eliminar producto con pedidos', 'cyan');
    try {
        // Usar un producto que sabemos tiene pedidos (ej: id=1)
        await axios.delete(`${API_URL}/productos/1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        log('❌ ERROR: Se permitió eliminar producto con pedidos', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400 && error.response.data.message.includes('pedidos asociados')) {
            log('✅ Validación correcta: no se puede eliminar producto con pedidos', 'green');
            log(`   Mensaje: ${error.response.data.message}`, 'yellow');
            return true;
        }
        log(`❌ Error inesperado: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// 8. Validar permisos - solo admin puede eliminar
async function testValidarPermisos() {
    log('\n📝 Paso 8: Validar permisos de administrador', 'cyan');
    
    // Crear producto temporal para la prueba
    let tempProductoId;
    try {
        const createResponse = await axios.post(`${API_URL}/productos`, {
            nombre: 'Producto Temp Permisos',
            descripcion: 'Para prueba de permisos',
            precio: 10.00,
            stock: 1,
            id_categoria: 1
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        tempProductoId = createResponse.data.data.id;
    } catch (error) {
        log('❌ No se pudo crear producto temporal', 'red');
        return false;
    }

    // Intentar sin token
    try {
        await axios.delete(`${API_URL}/productos/${tempProductoId}`);
        log('❌ ERROR: Se permitió eliminar sin autenticación', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ Validación correcta: se requiere autenticación', 'green');
            
            // Limpiar: eliminar producto temporal
            try {
                await axios.delete(`${API_URL}/productos/${tempProductoId}`, {
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

// Ejecutar todas las pruebas
async function runTests() {
    log('╔════════════════════════════════════════════════╗', 'cyan');
    log('║   TEST AUTOMATIZADO RF-5: GESTIÓN PRODUCTOS   ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const results = [];

    results.push(await testLogin());
    if (!results[0]) {
        log('\n❌ No se puede continuar sin login', 'red');
        return;
    }

    results.push(await testCrearProducto());
    results.push(await testValidarDuplicado());
    results.push(await testEditarProducto());
    results.push(await testValidarCamposObligatorios());
    results.push(await testEliminarProductoSinPedidos());
    results.push(await testEliminarProductoConPedidos());
    results.push(await testValidarPermisos());

    // Resumen
    log('\n╔════════════════════════════════════════════════╗', 'cyan');
    log('║              RESUMEN DE PRUEBAS                ║', 'cyan');
    log('╚════════════════════════════════════════════════╝', 'cyan');

    const passed = results.filter(r => r).length;
    const total = results.length;

    log(`\n✅ Pruebas exitosas: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        log('\n🎉 ¡TODAS LAS PRUEBAS DE RF-5 PASARON!', 'green');
        log('✅ Crear productos', 'green');
        log('✅ Editar productos', 'green');
        log('✅ Eliminar productos', 'green');
        log('✅ Validación de duplicados', 'green');
        log('✅ Validación de campos obligatorios', 'green');
        log('✅ Validación de pedidos asociados', 'green');
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
