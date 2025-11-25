const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testDashboardIsolation() {
    console.log('🧪 PRUEBA DE AISLAMIENTO EN DASHBOARD\n');
    
    const tenants = [
        {
            name: 'Megatienda 2000',
            email: 'admin@megatienda.com',
            password: 'Admin123!',
            tenant_slug: 'megatienda-2000'
        },
        {
            name: 'Comercial XYZ',
            email: 'admin@comercial-xyz.com',
            password: 'Admin123!',
            tenant_slug: 'comercial-xyz'
        }
    ];

    for (const tenant of tenants) {
        try {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🏢 ${tenant.name.toUpperCase()}`);
            console.log('='.repeat(60));

            // Login
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: tenant.email,
                password: tenant.password,
                tenant_slug: tenant.tenant_slug
            });

            const token = loginRes.data.data.token;
            console.log('✅ Login exitoso');

            // Obtener métricas del dashboard
            const metricsRes = await axios.get(`${API_URL}/dashboard/metricas`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const metrics = metricsRes.data.data;
            
            console.log('\n📊 MÉTRICAS DEL DASHBOARD:');
            console.log('   Ventas:');
            console.log(`      • Hoy: $${metrics.ventas.hoy}`);
            console.log(`      • Mes: $${metrics.ventas.mes}`);
            console.log(`      • Año: $${metrics.ventas.anio}`);
            
            console.log('\n   Estadísticas:');
            console.log(`      • Pedidos activos: ${metrics.estadisticas.pedidos_activos}`);
            console.log(`      • Pedidos completados: ${metrics.estadisticas.pedidos_completados}`);
            console.log(`      • Productos activos: ${metrics.estadisticas.productos_activos}`);
            console.log(`      • Clientes activos: ${metrics.estadisticas.clientes_activos}`);

            if (metrics.productosTop && metrics.productosTop.length > 0) {
                console.log('\n   📦 Top 5 Productos:');
                metrics.productosTop.slice(0, 5).forEach((p, i) => {
                    console.log(`      ${i+1}. ${p.nombre} - ${p.total_vendido} vendidos`);
                });
            } else {
                console.log('\n   📦 Top 5 Productos: Sin datos');
            }

            if (metrics.categorias && metrics.categorias.length > 0) {
                console.log('\n   🏷️  Categorías (Top 3):');
                metrics.categorias.slice(0, 3).forEach((c, i) => {
                    console.log(`      ${i+1}. ${c.nombre_categoria} - ${c.total_productos} productos`);
                });
            }

        } catch (error) {
            console.log(`\n❌ Error: ${error.response?.data?.message || error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(60));
    console.log('\n💡 Verifica que cada tenant muestre solo SUS propios datos.');
    console.log('   No debe haber datos compartidos entre tenants.\n');
}

testDashboardIsolation();
