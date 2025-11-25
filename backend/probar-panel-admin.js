const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function probarPanelAdmin() {
    try {
        console.log('🧪 PROBANDO PANEL DE ADMINISTRACIÓN\n');

        // 1. Login como admin
        console.log('1️⃣ Probando login admin...');
        let token = null;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'admin@demo.com',
                password: 'admin123',
                tenant_slug: 'demo'
            });
            token = loginRes.data.token || loginRes.data.data?.token;
            console.log('✅ Login exitoso');
            if (token) {
                console.log(`   Token: ${token.substring(0, 20)}...`);
            }
            console.log(`   Usuario: ${loginRes.data.usuario?.nombre || loginRes.data.data?.nombre} ${loginRes.data.usuario?.apellido || loginRes.data.data?.apellido}`);
            console.log(`   Rol: ${loginRes.data.usuario?.rol || loginRes.data.data?.rol}`);
            console.log(`   Tenant: ${loginRes.data.usuario?.tenant_id || loginRes.data.data?.tenant_id}`);
        } catch (error) {
            console.log('❌ Error en login:', error.response?.data?.message || error.message);
            return;
        }

        console.log('');

        // 2. Obtener productos (con autenticación)
        console.log('2️⃣ Probando /api/productos (admin)...');
        try {
            const prodRes = await axios.get(`${API_URL}/productos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ ${prodRes.data.data.length} productos encontrados para esta tienda`);
            prodRes.data.data.slice(0, 3).forEach(p => {
                console.log(`   - ${p.nombre} ($${p.precio}) Stock: ${p.stock}`);
            });
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 3. Obtener categorías (con autenticación)
        console.log('3️⃣ Probando /api/categorias (admin)...');
        try {
            const catRes = await axios.get(`${API_URL}/categorias`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ ${catRes.data.data.length} categorías encontradas`);
            catRes.data.data.slice(0, 3).forEach(c => {
                console.log(`   - ${c.nombre}`);
            });
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 4. Obtener usuarios (con autenticación)
        console.log('4️⃣ Probando /api/usuarios (admin)...');
        try {
            const usersRes = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ ${usersRes.data.data.length} usuarios encontrados`);
            
            const admins = usersRes.data.data.filter(u => u.nombre_rol === 'Admin');
            const empleados = usersRes.data.data.filter(u => u.nombre_rol === 'Empleado');
            const clientes = usersRes.data.data.filter(u => u.nombre_rol === 'Cliente');
            
            console.log(`   - Admins: ${admins.length}`);
            console.log(`   - Empleados: ${empleados.length}`);
            console.log(`   - Clientes: ${clientes.length}`);
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 5. Obtener dashboard stats
        console.log('5️⃣ Probando /api/dashboard/stats (admin)...');
        try {
            const dashRes = await axios.get(`${API_URL}/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Dashboard stats:');
            console.log(`   - Total Productos: ${dashRes.data.data.totalProductos || 0}`);
            console.log(`   - Total Pedidos: ${dashRes.data.data.totalPedidos || 0}`);
            console.log(`   - Total Clientes: ${dashRes.data.data.totalClientes || 0}`);
            console.log(`   - Total Usuarios: ${dashRes.data.data.totalUsuarios || 0}`);
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 6. Probar login con empleado
        console.log('6️⃣ Probando login empleado...');
        try {
            const empLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
                email: 'empleado1@demo.com',
                password: 'empleado123',
                tenant_slug: 'demo'
            });
            console.log('✅ Login empleado exitoso');
            console.log(`   Usuario: ${empLoginRes.data.usuario.nombre}`);
            console.log(`   Rol: ${empLoginRes.data.usuario.rol}`);
        } catch (error) {
            console.log('❌ Error:', error.response?.data?.message || error.message);
        }

        console.log('');

        // 7. Probar diferentes tiendas
        console.log('7️⃣ Probando login en diferentes tiendas...\n');
        
        const tiendas = [
            { email: 'admin@tienda-abc.com', nombre: 'Tienda ABC', slug: 'tienda-abc' },
            { email: 'admin@pasteleria-dulce-sabor.com', nombre: 'Pastelería', slug: 'pasteleria-dulce-sabor' },
            { email: 'admin@electrotech-premium.com', nombre: 'ElectroTech', slug: 'electrotech-premium' }
        ];

        for (const tienda of tiendas) {
            try {
                const res = await axios.post(`${API_URL}/auth/admin/login`, {
                    email: tienda.email,
                    password: 'admin123',
                    tenant_slug: tienda.slug
                });
                
                // Obtener productos de esa tienda
                const prodRes = await axios.get(`${API_URL}/productos`, {
                    headers: { Authorization: `Bearer ${res.data.token}` }
                });
                
                console.log(`✅ ${tienda.nombre}: ${prodRes.data.data.length} productos`);
            } catch (error) {
                console.log(`❌ ${tienda.nombre}: Error -`, error.response?.data?.message || error.message);
            }
        }

        console.log('\n✅ Pruebas del panel admin completadas');

    } catch (error) {
        console.error('💥 Error general:', error.message);
    }
}

probarPanelAdmin();
