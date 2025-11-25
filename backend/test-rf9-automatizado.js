/**
 * TEST AUTOMATIZADO RF-9: REPORTES DE VENTAS
 * 
 * Este script prueba todas las funcionalidades del módulo de Reportes de Ventas:
 * - Generación de reportes con diferentes períodos
 * - Exportación en CSV, Excel y PDF
 * - Validación de métricas y datos
 * - Permisos de acceso
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
    console.log('\n' + '='.repeat(60));
}

// Tokens de autenticación
let adminToken = '';
let clienteToken = '';

// ===========================================
// RF-9.1: OBTENER REPORTE COMPLETO
// ===========================================
async function testRF9_1_ObtenerReporte() {
    separator();
    log('RF-9.1: OBTENER REPORTE COMPLETO', 'bright');
    separator();

    try {
        log('\n📝 Test 9.1.1: Obtener reporte del mes actual', 'cyan');
        
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const response = await axios.get(`${API_URL}/reportes`, {
            params: {
                fechaInicio: primerDia.toISOString().split('T')[0],
                fechaFin: ultimoDia.toISOString().split('T')[0],
                agruparPor: 'dia'
            },
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success && response.data.data) {
            const reporte = response.data.data;
            log('✅ Reporte obtenido exitosamente', 'green');
            
            // Validar estructura del reporte
            if (reporte.metricas && reporte.ventas_por_periodo && 
                reporte.productos_mas_vendidos && reporte.ventas_por_categoria) {
                log('   ✅ Estructura del reporte correcta', 'green');
                log(`   Total ventas: $${reporte.metricas.total_ventas || 0}`, 'yellow');
                log(`   Total pedidos: ${reporte.metricas.total_pedidos || 0}`, 'yellow');
                log(`   Productos vendidos: ${reporte.metricas.total_productos_vendidos || 0}`, 'yellow');
                return true;
            } else {
                log('   ❌ Estructura del reporte incompleta', 'red');
                return false;
            }
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF9_1_ReportePersonalizado() {
    try {
        log('\n📝 Test 9.1.2: Obtener reporte con período personalizado', 'cyan');
        
        const response = await axios.get(`${API_URL}/reportes`, {
            params: {
                fechaInicio: '2025-01-01',
                fechaFin: '2025-12-31',
                agruparPor: 'mes'
            },
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (response.status === 200 && response.data.success) {
            log('✅ Reporte personalizado obtenido exitosamente', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

async function testRF9_1_SinFechas() {
    try {
        log('\n📝 Test 9.1.3: Validar requerimiento de fechas', 'cyan');
        
        await axios.get(`${API_URL}/reportes`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        log('❌ Debería haber rechazado la solicitud sin fechas', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            log('✅ Validación de fechas requeridas funciona correctamente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-9.2: EXPORTACIÓN CSV
// ===========================================
async function testRF9_2_ExportarCSV() {
    separator();
    log('RF-9.2: EXPORTACIÓN CSV', 'bright');
    separator();

    try {
        log('\n📝 Test 9.2.1: Exportar reporte en formato CSV', 'cyan');
        
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const response = await axios.get(`${API_URL}/reportes/exportar/csv`, {
            params: {
                fechaInicio: primerDia.toISOString().split('T')[0],
                fechaFin: ultimoDia.toISOString().split('T')[0]
            },
            headers: { 'Authorization': `Bearer ${adminToken}` },
            responseType: 'blob'
        });

        if (response.status === 200 && response.data) {
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('text/csv')) {
                log('✅ CSV exportado correctamente', 'green');
                log(`   Tamaño del archivo: ${response.data.size || 'N/A'} bytes`, 'yellow');
                return true;
            } else {
                log('❌ Tipo de contenido incorrecto', 'red');
                return false;
            }
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-9.3: EXPORTACIÓN EXCEL
// ===========================================
async function testRF9_3_ExportarExcel() {
    separator();
    log('RF-9.3: EXPORTACIÓN EXCEL', 'bright');
    separator();

    try {
        log('\n📝 Test 9.3.1: Exportar reporte en formato Excel', 'cyan');
        
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const response = await axios.get(`${API_URL}/reportes/exportar/excel`, {
            params: {
                fechaInicio: primerDia.toISOString().split('T')[0],
                fechaFin: ultimoDia.toISOString().split('T')[0]
            },
            headers: { 'Authorization': `Bearer ${adminToken}` },
            responseType: 'blob'
        });

        if (response.status === 200 && response.data) {
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('spreadsheetml')) {
                log('✅ Excel exportado correctamente', 'green');
                log(`   Tamaño del archivo: ${response.data.size || 'N/A'} bytes`, 'yellow');
                return true;
            } else {
                log('❌ Tipo de contenido incorrecto', 'red');
                return false;
            }
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-9.4: EXPORTACIÓN PDF
// ===========================================
async function testRF9_4_ExportarPDF() {
    separator();
    log('RF-9.4: EXPORTACIÓN PDF', 'bright');
    separator();

    try {
        log('\n📝 Test 9.4.1: Exportar reporte en formato PDF', 'cyan');
        
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

        const response = await axios.get(`${API_URL}/reportes/exportar/pdf`, {
            params: {
                fechaInicio: primerDia.toISOString().split('T')[0],
                fechaFin: ultimoDia.toISOString().split('T')[0]
            },
            headers: { 'Authorization': `Bearer ${adminToken}` },
            responseType: 'blob'
        });

        if (response.status === 200 && response.data) {
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/pdf')) {
                log('✅ PDF exportado correctamente', 'green');
                log(`   Tamaño del archivo: ${response.data.size || 'N/A'} bytes`, 'yellow');
                return true;
            } else {
                log('❌ Tipo de contenido incorrecto', 'red');
                return false;
            }
        }
        return false;
    } catch (error) {
        log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
        return false;
    }
}

// ===========================================
// RF-9.5: PERMISOS DE ACCESO
// ===========================================
async function testRF9_5_PermisosAcceso() {
    separator();
    log('RF-9.5: PERMISOS DE ACCESO', 'bright');
    separator();

    try {
        log('\n📝 Test 9.5.1: Validar que cliente no puede acceder a reportes', 'cyan');
        
        const hoy = new Date();
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        await axios.get(`${API_URL}/reportes`, {
            params: {
                fechaInicio: primerDia.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0]
            },
            headers: { 'Authorization': `Bearer ${clienteToken}` }
        });

        log('❌ Cliente no debería poder acceder a reportes', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 403) {
            log('✅ Acceso denegado correctamente para cliente', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

async function testRF9_5_SinAutenticacion() {
    try {
        log('\n📝 Test 9.5.2: Validar que sin autenticación no se puede acceder', 'cyan');
        
        const hoy = new Date();
        await axios.get(`${API_URL}/reportes`, {
            params: {
                fechaInicio: hoy.toISOString().split('T')[0],
                fechaFin: hoy.toISOString().split('T')[0]
            }
        });

        log('❌ No debería permitir acceso sin autenticación', 'red');
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            log('✅ Acceso denegado correctamente sin autenticación', 'green');
            return true;
        }
        log(`❌ Error inesperado: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// AUTENTICACIÓN
// ===========================================
async function loginAdmin() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@smartpyme.com',
            password: 'admin123'
        });

        if (response.data.success && response.data.data.token) {
            adminToken = response.data.data.token;
            log('✅ Login admin exitoso', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error en login admin: ${error.message}`, 'red');
        return false;
    }
}

async function loginCliente() {
    try {
        // Registrar un cliente temporal
        const timestamp = Date.now();
        const email = `test-rf9-${timestamp}@ejemplo.com`;

        await axios.post(`${API_URL}/auth/register-public`, {
            nombre: 'Test',
            apellido: 'RF-9',
            email: email,
            password: 'test123',
            confirmPassword: 'test123',
            telefono: '912345678'
        });

        const response = await axios.post(`${API_URL}/auth/login`, {
            email: email,
            password: 'test123'
        });

        if (response.data.success && response.data.data.token) {
            clienteToken = response.data.data.token;
            log('✅ Login cliente exitoso', 'green');
            return true;
        }
        return false;
    } catch (error) {
        log(`❌ Error en login cliente: ${error.message}`, 'red');
        return false;
    }
}

// ===========================================
// EJECUTAR TODOS LOS TESTS
// ===========================================
async function runAllTests() {
    console.log('\n' + '╔' + '═'.repeat(58) + '╗');
    console.log('║    TEST AUTOMATIZADO RF-9: REPORTES DE VENTAS         ║');
    console.log('╚' + '═'.repeat(58) + '╝\n');

    let totalTests = 0;
    let passedTests = 0;

    // Autenticación
    log('🔐 Iniciando autenticación...', 'cyan');
    const adminAuth = await loginAdmin();
    const clienteAuth = await loginCliente();

    if (!adminAuth) {
        log('❌ No se pudo autenticar admin. Abortando tests.', 'red');
        return;
    }

    // RF-9.1: Obtener Reporte
    totalTests++;
    if (await testRF9_1_ObtenerReporte()) passedTests++;
    
    totalTests++;
    if (await testRF9_1_ReportePersonalizado()) passedTests++;
    
    totalTests++;
    if (await testRF9_1_SinFechas()) passedTests++;

    // RF-9.2: Exportar CSV
    totalTests++;
    if (await testRF9_2_ExportarCSV()) passedTests++;

    // RF-9.3: Exportar Excel
    totalTests++;
    if (await testRF9_3_ExportarExcel()) passedTests++;

    // RF-9.4: Exportar PDF
    totalTests++;
    if (await testRF9_4_ExportarPDF()) passedTests++;

    // RF-9.5: Permisos
    if (clienteAuth) {
        totalTests++;
        if (await testRF9_5_PermisosAcceso()) passedTests++;
    }
    
    totalTests++;
    if (await testRF9_5_SinAutenticacion()) passedTests++;

    // Resumen
    separator();
    console.log('\n' + '╔' + '═'.repeat(58) + '╗');
    console.log('║                    RESUMEN DE PRUEBAS                     ║');
    console.log('╚' + '═'.repeat(58) + '╝\n');

    const porcentaje = ((passedTests / totalTests) * 100).toFixed(1);
    log(`✅ Pruebas exitosas: ${passedTests}/${totalTests} (${porcentaje}%)`, 'green');

    if (passedTests === totalTests) {
        log('\n🎉 ¡TODOS LOS TESTS DEL RF-9 PASARON EXITOSAMENTE!', 'green');
    } else {
        log(`\n⚠️ Hay ${totalTests - passedTests} prueba(s) que fallaron`, 'yellow');
    }

    separator();
}

// Ejecutar
runAllTests().catch(console.error);
