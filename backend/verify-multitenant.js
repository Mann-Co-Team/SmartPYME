const db = require('./config/db');

async function verifyMultitenant() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     VERIFICACIÓN SISTEMA MULTITENANT - SmartPYME     ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    try {
        // 1. Tenants
        const [tenants] = await db.execute('SELECT * FROM tenants');
        console.log('📊 TENANTS REGISTRADOS:', tenants.length);
        tenants.forEach(t => {
            console.log(`   • ID: ${t.id_tenant}`);
            console.log(`     Nombre: ${t.nombre_empresa}`);
            console.log(`     Slug: ${t.slug}`);
            console.log(`     Plan: ${t.plan}`);
            console.log(`     Activo: ${t.activo ? 'Sí' : 'No'}`);
            console.log(`     Límites: ${t.max_usuarios} usuarios / ${t.max_productos} productos\n`);
        });

        // 2. Datos por tenant
        console.log('📈 DATOS POR TENANT:\n');
        for (const tenant of tenants) {
            console.log(`   ${tenant.nombre_empresa} (${tenant.slug}):`);
            
            const [usuarios] = await db.execute(
                'SELECT COUNT(*) as count FROM usuarios WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            console.log(`      👥 Usuarios: ${usuarios[0].count}`);
            
            const [productos] = await db.execute(
                'SELECT COUNT(*) as count FROM productos WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            console.log(`      📦 Productos: ${productos[0].count}`);
            
            const [categorias] = await db.execute(
                'SELECT COUNT(*) as count FROM categorias WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            console.log(`      🏷️  Categorías: ${categorias[0].count}`);
            
            const [pedidos] = await db.execute(
                'SELECT COUNT(*) as count FROM pedidos WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            console.log(`      📋 Pedidos: ${pedidos[0].count}`);
            
            const [notificaciones] = await db.execute(
                'SELECT COUNT(*) as count FROM notificaciones WHERE id_tenant = ?',
                [tenant.id_tenant]
            );
            console.log(`      🔔 Notificaciones: ${notificaciones[0].count}\n`);
        }

        // 3. Verificar columnas
        console.log('🔍 VERIFICACIÓN DE ESTRUCTURA:\n');
        const tablas = ['usuarios', 'productos', 'pedidos', 'categorias', 'clientes', 'settings', 'notificaciones'];
        
        for (const tabla of tablas) {
            const [cols] = await db.execute(`SHOW COLUMNS FROM ${tabla} LIKE 'id_tenant'`);
            const tiene = cols.length > 0;
            const nullable = cols[0]?.Null === 'YES';
            console.log(`   ${tiene ? '✅' : '❌'} ${tabla.padEnd(20)} - id_tenant ${tiene ? (nullable ? '(NULL)' : '(NOT NULL)') : 'NO EXISTE'}`);
        }

        // 4. Verificar foreign keys
        console.log('\n🔗 FOREIGN KEYS:\n');
        const [fks] = await db.execute(`
            SELECT TABLE_NAME, CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_NAME = 'tenants' 
            AND TABLE_SCHEMA = 'smartpyme_db'
        `);
        fks.forEach(fk => {
            console.log(`   ✅ ${fk.TABLE_NAME} → ${fk.CONSTRAINT_NAME}`);
        });

        // 5. Verificar índices
        console.log('\n📑 ÍNDICES (id_tenant):\n');
        for (const tabla of tablas) {
            const [indexes] = await db.execute(`
                SHOW INDEX FROM ${tabla} WHERE Column_name = 'id_tenant'
            `);
            if (indexes.length > 0) {
                console.log(`   ✅ ${tabla} - ${indexes.length} índice(s)`);
            } else {
                console.log(`   ⚠️  ${tabla} - sin índices`);
            }
        }

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║                 ✅ SISTEMA MULTITENANT ACTIVO        ║');
        console.log('╚══════════════════════════════════════════════════════╝\n');

        console.log('📝 SIGUIENTE PASO:');
        console.log('   • Actualizar controladores para usar req.tenant.id');
        console.log('   • Aplicar middleware validateTenant a rutas');
        console.log('   • Actualizar frontend para capturar tenant_slug en login\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

verifyMultitenant();
