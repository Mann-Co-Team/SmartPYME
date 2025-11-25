const db = require('./config/db');

(async () => {
    try {
        console.log('\n=== VERIFICANDO ELECTROTECH PREMIUM ===\n');
        
        const [tenants] = await db.execute(
            'SELECT id_tenant, nombre_empresa, slug, plan FROM tenants WHERE slug = ?',
            ['electrotech-premium']
        );
        
        if (tenants.length === 0) {
            console.log('❌ Tenant no encontrado');
            process.exit(1);
        }
        
        const tenant = tenants[0];
        console.log('📋 Empresa:', tenant.nombre_empresa);
        console.log('🏷️  Plan:', tenant.plan.toUpperCase());
        console.log('🆔 ID Tenant:', tenant.id_tenant);
        
        const [productos] = await db.execute(
            'SELECT COUNT(*) as total, SUM(activo) as activos FROM productos WHERE id_tenant = ?',
            [tenant.id_tenant]
        );
        
        console.log('\n📦 PRODUCTOS:');
        console.log('   Total:', productos[0].total);
        console.log('   Activos:', productos[0].activos);
        console.log('   Inactivos:', productos[0].total - productos[0].activos);
        
        // Verificar límites según plan
        const limits = {
            basico: 50,
            profesional: 500,
            empresarial: null // ilimitado
        };
        
        const limit = limits[tenant.plan];
        console.log('\n🎯 LÍMITES DEL PLAN:');
        if (limit === null) {
            console.log('   Productos permitidos: ILIMITADOS ♾️');
        } else {
            console.log(`   Productos permitidos: ${limit}`);
            console.log(`   Utilizados: ${productos[0].activos} / ${limit}`);
            console.log(`   Disponibles: ${limit - productos[0].activos}`);
        }
        
        await db.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
