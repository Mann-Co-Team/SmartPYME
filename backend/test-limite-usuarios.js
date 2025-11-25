const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TENANT_SLUG = 'pasteleria-dulce-sabor';

(async () => {
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('🧪 PRUEBA: LÍMITE DE USUARIOS STAFF VS CLIENTES');
    console.log('════════════════════════════════════════════════════════════════\n');

    try {
        // Login como admin
        console.log('🔐 1. Login como administrador...');
        const loginRes = await axios.post(`${API_URL}/auth/admin/login`, {
            email: 'admin@pasteleria-dulce-sabor.com',
            password: 'Admin123!',
            tenant_slug: TENANT_SLUG
        });
        
        const adminToken = loginRes.data.data.token;
        console.log('   ✅ Token obtenido\n');

        // Obtener usuarios actuales
        console.log('📋 2. Obteniendo lista de usuarios...');
        const usuariosRes = await axios.get(`${API_URL}/usuarios`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const usuarios = usuariosRes.data.data;
        
        // Debug: ver un usuario
        if (usuarios.length > 0) {
            console.log('   🔍 Debug - Primer usuario:', {
                nombre: usuarios[0].nombre,
                id_rol: usuarios[0].id_rol,
                nombre_rol: usuarios[0].nombre_rol
            });
        }
        
        const admins = usuarios.filter(u => u.id_rol === 1);
        const empleados = usuarios.filter(u => u.id_rol === 2);
        const clientes = usuarios.filter(u => u.id_rol === 3);
        
        console.log(`   👑 Administradores: ${admins.length}`);
        console.log(`   👨‍💼 Empleados: ${empleados.length}`);
        console.log(`   👤 Clientes: ${clientes.length}`);
        console.log(`   📊 Staff total: ${admins.length + empleados.length}`);
        console.log(`   ✅ Total usuarios: ${usuarios.length}\n`);

        // Intentar crear un cliente (debería funcionar siempre)
        console.log('📝 3. Intentando crear CLIENTE (no debe afectar límite)...');
        try {
            const clienteRes = await axios.post(`${API_URL}/usuarios`, {
                nombre: 'Cliente',
                apellido: 'Prueba',
                email: `cliente-prueba-${Date.now()}@test.com`,
                telefono: '+56912345678',
                password: 'Cliente123!',
                id_rol: 3 // Cliente
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('   ✅ Cliente creado exitosamente');
            console.log('   ✅ Los clientes NO cuentan para el límite\n');
        } catch (error) {
            console.log('   ❌ ERROR inesperado:', error.response?.data?.message);
            console.log('   ⚠️ Los clientes deberían ser ilimitados\n');
        }

        // Intentar crear empleado (depende del límite)
        console.log('📝 4. Intentando crear EMPLEADO (debe validar límite)...');
        try {
            const empleadoRes = await axios.post(`${API_URL}/usuarios`, {
                nombre: 'Empleado',
                apellido: 'Prueba',
                email: `empleado-prueba-${Date.now()}@test.com`,
                telefono: '+56912345679',
                password: 'Admin123!',
                id_rol: 2 // Empleado
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            console.log('   ✅ Empleado creado exitosamente');
            console.log(`   ✅ Staff ahora: ${admins.length + empleados.length + 1} de 5\n`);
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.limit_reached) {
                console.log('   ⚠️ Límite alcanzado (esperado si staff >= 5)');
                console.log(`   📊 ${error.response.data.message}`);
                console.log(`   📈 Actuales: ${error.response.data.current} / ${error.response.data.max}\n`);
            } else {
                console.log('   ❌ ERROR:', error.response?.data?.message || error.message);
            }
        }

        // Ver límites del tenant
        console.log('📊 5. Verificando límites del tenant...');
        const db = require('./config/db');
        const TenantModel = require('./models/tenant.model');
        
        const [tenant] = await db.execute(
            'SELECT id_tenant FROM tenants WHERE slug = ?',
            [TENANT_SLUG]
        );
        
        if (tenant.length > 0) {
            const limits = await TenantModel.checkLimits(tenant[0].id_tenant);
            
            console.log('\n   📋 LÍMITES DEL TENANT:');
            console.log(`   🏢 Empresa: ${limits.nombre_empresa}`);
            console.log(`   📦 Plan: ${limits.plan}`);
            console.log(`   \n   👥 STAFF (Admin/Empleados):`);
            console.log(`      Actuales: ${limits.usuarios_actuales}`);
            console.log(`      Máximo: ${limits.max_usuarios}`);
            console.log(`      Límite alcanzado: ${limits.limite_usuarios_alcanzado ? '❌ SÍ' : '✅ NO'}`);
            console.log(`   \n   👤 CLIENTES:`);
            console.log(`      Actuales: ${limits.clientes_actuales}`);
            console.log(`      Máximo: ∞ (ilimitados)`);
            console.log(`   \n   📦 PRODUCTOS:`);
            console.log(`      Actuales: ${limits.productos_actuales}`);
            console.log(`      Máximo: ${limits.max_productos}`);
            console.log(`      Límite alcanzado: ${limits.limite_productos_alcanzado ? '❌ SÍ' : '✅ NO'}`);
        }

        console.log('\n════════════════════════════════════════════════════════════════');
        console.log('✅ PRUEBA COMPLETADA');
        console.log('════════════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error.message);
        if (error.response?.data) {
            console.error('Detalle:', JSON.stringify(error.response.data, null, 2));
        }
    }
})();
