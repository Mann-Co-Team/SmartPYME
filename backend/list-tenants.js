const db = require('./config/db');

async function checkTenants() {
    try {
        const [tenants] = await db.execute('SELECT id_tenant, nombre_empresa, slug, plan FROM tenants');
        console.log('\n=== TENANTS EXISTENTES ===\n');
        tenants.forEach(t => {
            console.log(`ID: ${t.id_tenant} | ${t.nombre_empresa} | Slug: ${t.slug} | Plan: ${t.plan}`);
        });
        console.log(`\nTotal: ${tenants.length} tenants\n`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
    }
}

checkTenants();
