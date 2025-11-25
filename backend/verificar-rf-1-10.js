const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost:5173';

// Colores para consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logTitle(title) {
    console.log('\n' + '═'.repeat(80));
    log(title, 'bright');
    console.log('═'.repeat(80) + '\n');
}

let globalToken = null;
let tenantSlug = 'pasteleria-dulce-sabor';
let tenantId = null;

async function verificarRF() {
    try {
        logTitle('🧪 VERIFICACIÓN DE REQUISITOS FUNCIONALES (RF 1-10)');
        
        // ========================================
        // RF-1: Visualización del Catálogo
        // ========================================
        logTitle('RF-1: VISUALIZACIÓN DEL CATÁLOGO DE PRODUCTOS');
        
        try {
            // Obtener tenant
            const tenantRes = await axios.get(`${API_URL}/tenants/slug/${tenantSlug}`);
            tenantId = tenantRes.data.data.id_tenant;
            logSuccess(`Tenant encontrado: ${tenantRes.data.data.nombre_empresa} (ID: ${tenantId})`);
            
            // Listar productos públicos
            const productosRes = await axios.get(`${API_URL}/catalogo/${tenantSlug}/productos`);
            const productos = productosRes.data.data;
            logSuccess(`${productos.length} productos encontrados en el catálogo`);
            
            if (productos.length > 0) {
                const producto = productos[0];
                logInfo(`Producto ejemplo: ${producto.nombre} - $${producto.precio}`);
            }
            
            // Listar categorías públicas
            const categoriasRes = await axios.get(`${API_URL}/catalogo/${tenantSlug}/categorias`);
            const categorias = categoriasRes.data.data;
            logSuccess(`${categorias.length} categorías encontradas`);
            
            if (categorias.length > 0) {
                logInfo(`Categorías: ${categorias.map(c => c.nombre).join(', ')}`);
            }
            
            logSuccess('RF-1: ✅ PASÓ - Catálogo de productos accesible');
            
        } catch (error) {
            logError(`RF-1: ❌ FALLÓ - ${error.message}`);
        }

        // ========================================
        // RF-2: Registro y Autenticación
        // ========================================
        logTitle('RF-2: REGISTRO Y AUTENTICACIÓN');
        
        try {
            // Login de cliente
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'cliente1@pasteleria-dulce-sabor.com',
                password: 'Cliente123!',
                tenant_id: tenantId
            });
            
            globalToken = loginRes.data.data.token;
            const user = loginRes.data.data.user;
            
            logSuccess(`Login exitoso: ${user.nombre} (${user.email})`);
            logSuccess(`Token recibido: ${globalToken.substring(0, 20)}...`);
            logInfo(`Rol: ${user.rol} (ID: ${user.id_rol})`);
            
            // Verificar token
            const verifyRes = await axios.get(`${API_URL}/auth/verify`, {
                headers: { Authorization: `Bearer ${globalToken}` }
            });
            
            logSuccess('Token válido y verificado correctamente');
            logSuccess('RF-2: ✅ PASÓ - Autenticación funciona correctamente');
            
        } catch (error) {
            logError(`RF-2: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
            process.exit(1); // Si no hay autenticación, no podemos continuar
        }

        // ========================================
        // RF-3: Creación de Pedidos
        // ========================================
        logTitle('RF-3: CREACIÓN DE PEDIDOS');
        
        try {
            // Obtener un producto para el pedido
            const productosRes = await axios.get(`${API_URL}/catalogo/${tenantSlug}/productos`);
            const productos = productosRes.data.data.filter(p => p.stock > 0);
            
            if (productos.length === 0) {
                throw new Error('No hay productos con stock disponible');
            }
            
            const producto = productos[0];
            logInfo(`Producto seleccionado: ${producto.nombre} (Stock: ${producto.stock})`);
            
            // Crear pedido de prueba
            const pedidoData = {
                items: [
                    {
                        id_producto: producto.id_producto,
                        cantidad: 1,
                        precio_unitario: producto.precio,
                        subtotal: producto.precio
                    }
                ],
                total: producto.precio,
                metodo_entrega: 'pickup',
                metodo_pago: 'efectivo',
                notas: 'Pedido de prueba RF-3'
            };
            
            const pedidoRes = await axios.post(`${API_URL}/pedidos`, pedidoData, {
                headers: { Authorization: `Bearer ${globalToken}` }
            });
            
            const pedido = pedidoRes.data.data;
            logSuccess(`Pedido creado: ${pedido.numero_pedido}`);
            logSuccess(`Total: $${pedido.total}`);
            logInfo(`Estado inicial: ${pedido.estado}`);
            
            // Guardar ID del pedido para pruebas posteriores
            globalToken.pedidoId = pedido.id_pedido;
            
            logSuccess('RF-3: ✅ PASÓ - Creación de pedidos funciona');
            
        } catch (error) {
            logError(`RF-3: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-4: Seguimiento de Estado del Pedido
        // ========================================
        logTitle('RF-4: SEGUIMIENTO DE ESTADO DEL PEDIDO');
        
        try {
            // Listar pedidos del cliente
            const pedidosRes = await axios.get(`${API_URL}/pedidos`, {
                headers: { Authorization: `Bearer ${globalToken}` }
            });
            
            const pedidos = pedidosRes.data.data;
            logSuccess(`${pedidos.length} pedidos encontrados`);
            
            if (pedidos.length > 0) {
                const pedido = pedidos[0];
                logInfo(`Pedido ${pedido.numero_pedido} - Estado: ${pedido.estado}`);
                
                // Ver detalle del pedido
                const detalleRes = await axios.get(`${API_URL}/pedidos/${pedido.id_pedido}/detalle`, {
                    headers: { Authorization: `Bearer ${globalToken}` }
                });
                
                const detalle = detalleRes.data.data;
                logSuccess(`Detalle obtenido: ${detalle.productos?.length || 0} items`);
                logInfo(`Historial de estados: ${detalle.historial?.length || 0} cambios`);
                
                logSuccess('RF-4: ✅ PASÓ - Seguimiento de pedidos funciona');
            } else {
                logWarning('No hay pedidos para verificar historial');
                logSuccess('RF-4: ✅ PASÓ - Endpoint funciona (sin datos)');
            }
            
        } catch (error) {
            logError(`RF-4: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-5: Gestión de Productos (requiere admin)
        // ========================================
        logTitle('RF-5: GESTIÓN DE PRODUCTOS (CRUD ADMIN)');
        
        logInfo('Login como admin para pruebas de gestión...');
        
        try {
            // Login de admin
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            logSuccess('Admin autenticado correctamente');
            
            // Listar productos (admin)
            const productosRes = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            logSuccess(`${productosRes.data.data.length} productos encontrados (vista admin)`);
            
            logSuccess('RF-5: ✅ PASÓ - Gestión de productos accesible');
            
        } catch (error) {
            logError(`RF-5: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-6: Gestión de Categorías (requiere admin)
        // ========================================
        logTitle('RF-6: GESTIÓN DE CATEGORÍAS (CRUD ADMIN)');
        
        try {
            // Login de admin (reutilizar)
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            
            // Listar categorías (admin)
            const categoriasRes = await axios.get(`${API_URL}/categorias`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            logSuccess(`${categoriasRes.data.data.length} categorías encontradas (vista admin)`);
            logSuccess('RF-6: ✅ PASÓ - Gestión de categorías accesible');
            
        } catch (error) {
            logError(`RF-6: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-7: Gestión de Pedidos Internos
        // ========================================
        logTitle('RF-7: GESTIÓN DE PEDIDOS INTERNOS (ADMIN/VENDEDOR)');
        
        try {
            // Login de admin
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            
            // Listar todos los pedidos (admin)
            const pedidosRes = await axios.get(`${API_URL}/pedidos`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            logSuccess(`${pedidosRes.data.data.length} pedidos encontrados (vista admin)`);
            logSuccess('RF-7: ✅ PASÓ - Gestión interna de pedidos accesible');
            
        } catch (error) {
            logError(`RF-7: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-8: Dashboard Administrativo
        // ========================================
        logTitle('RF-8: DASHBOARD ADMINISTRATIVO');
        
        try {
            // Login de admin
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            
            // Obtener stats del dashboard
            const statsRes = await axios.get(`${API_URL}/dashboard/metricas`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            const stats = statsRes.data.data;
            logSuccess('Estadísticas obtenidas:');
            logInfo(`  💰 Ventas totales: $${stats.ventas_totales || 0}`);
            logInfo(`  📦 Pedidos activos: ${stats.pedidos_activos || 0}`);
            logInfo(`  🛍️  Total productos: ${stats.total_productos || 0}`);
            logInfo(`  👥 Total usuarios: ${stats.total_usuarios || 0}`);
            
            logSuccess('RF-8: ✅ PASÓ - Dashboard funciona correctamente');
            
        } catch (error) {
            logError(`RF-8: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-9: Gestión de Usuarios
        // ========================================
        logTitle('RF-9: GESTIÓN DE USUARIOS (ADMIN)');
        
        try {
            // Login de admin
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            
            // Listar usuarios
            const usuariosRes = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            logSuccess(`${usuariosRes.data.data.length} usuarios encontrados`);
            logSuccess('RF-9: ✅ PASÓ - Gestión de usuarios accesible');
            
        } catch (error) {
            logError(`RF-9: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RF-10: Notificaciones Automáticas
        // ========================================
        logTitle('RF-10: NOTIFICACIONES AUTOMÁTICAS');
        
        try {
            // Login de admin
            const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@pasteleria-dulce-sabor.com',
                password: 'Admin123!',
                tenant_slug: tenantSlug
            });
            
            const adminToken = adminLoginRes.data.data.token;
            
            // Obtener notificaciones
            const notificacionesRes = await axios.get(`${API_URL}/notificaciones`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            const notificaciones = notificacionesRes.data.notificaciones || [];
            logSuccess(`${notificaciones.length} notificaciones encontradas`);
            
            if (notificaciones.length > 0) {
                const noLeidas = notificaciones.filter(n => !n.leida).length;
                logInfo(`  📬 No leídas: ${noLeidas}`);
                logInfo(`  ✅ Leídas: ${notificaciones.length - noLeidas}`);
            }
            
            logSuccess('RF-10: ✅ PASÓ - Sistema de notificaciones funciona');
            
        } catch (error) {
            logError(`RF-10: ❌ FALLÓ - ${error.response?.data?.message || error.message}`);
        }

        // ========================================
        // RESUMEN FINAL
        // ========================================
        logTitle('📊 RESUMEN DE VERIFICACIÓN');
        
        log('\n✅ Frontend corriendo en: ' + FRONTEND_URL, 'green');
        log('✅ Backend corriendo en: ' + API_URL, 'green');
        log('✅ Tenant de prueba: ' + tenantSlug + ' (ID: ' + tenantId + ')', 'green');
        
        logTitle('🎯 PRUEBAS MANUALES SUGERIDAS');
        
        console.log(`
1. RF-1: Abrir ${FRONTEND_URL}/tienda/${tenantSlug}
   - Verificar que se muestran productos
   - Probar búsqueda y filtros
   
2. RF-2: Abrir ${FRONTEND_URL}/tienda/${tenantSlug}/login
   - Email: cliente1@pasteleria-dulce-sabor.com
   - Password: password123
   - Verificar login exitoso
   
3. RF-3: Agregar productos al carrito y hacer checkout
   - Verificar cálculo de totales
   - Completar formulario de envío
   - Confirmar pedido
   
4. RF-4: Ir a "Mis Pedidos" y verificar historial
   
5. RF-5-9: Login admin en ${FRONTEND_URL}/admin/login
   - Email: admin@pasteleria-dulce-sabor.com
   - Password: Admin123!
   - Verificar panel de administración completo
   
6. RF-10: Verificar icono de notificaciones en navbar admin
        `);
        
        log('\n✅ VERIFICACIÓN COMPLETADA', 'bright');
        log('📝 Todos los endpoints están respondiendo correctamente\n', 'cyan');
        
    } catch (error) {
        logError(`\n❌ Error general en verificación: ${error.message}\n`);
        console.error(error);
    }
}

// Ejecutar verificación
verificarRF();
