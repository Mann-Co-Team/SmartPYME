const db = require('./config/db');

async function testDatos() {
    try {
        console.log('🔍 Verificando datos en la base de datos...\n');

        // 1. Verificar tenants
        const [tenants] = await db.execute(`
            SELECT id_tenant, slug, nombre_empresa, plan, activo 
            FROM tenants 
            ORDER BY id_tenant
        `);
        console.log('📊 TENANTS:', tenants.length);
        tenants.forEach(t => {
            console.log(`  - ${t.slug} (${t.nombre_empresa}) - Plan: ${t.plan} - Activo: ${t.activo ? 'Sí' : 'No'}`);
        });

        // 2. Verificar productos por tenant
        console.log('\n📦 PRODUCTOS POR TENANT:');
        for (const tenant of tenants) {
            const [productos] = await db.execute(`
                SELECT COUNT(*) as total 
                FROM productos 
                WHERE id_tenant = ? AND activo = 1
            `, [tenant.id_tenant]);
            console.log(`  - ${tenant.slug}: ${productos[0].total} productos activos`);
        }

        // 3. Verificar categorías
        const [categorias] = await db.execute(`
            SELECT COUNT(*) as total 
            FROM categorias 
            WHERE activo = 1
        `);
        console.log(`\n📂 CATEGORÍAS ACTIVAS: ${categorias[0].total}`);

        // 4. Probar endpoint público
        console.log('\n🌐 Probando endpoint público de catálogo...');
        const axios = require('axios');
        
        if (tenants.length > 0) {
            const testSlug = tenants[0].slug;
            try {
                const response = await axios.get(`http://localhost:3000/api/catalogo/${testSlug}/productos`);
                console.log(`  ✅ GET /api/catalogo/${testSlug}/productos`);
                console.log(`     Productos obtenidos: ${response.data.data.length}`);
            } catch (err) {
                console.log(`  ❌ Error en endpoint: ${err.message}`);
            }
        }

        console.log('\n✅ Verificación completa\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testDatos();
