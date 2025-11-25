const mysql = require('mysql2/promise');
require('dotenv').config();

async function verificarSistemaUnificado() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('✅ VERIFICACIÓN DEL SISTEMA UNIFICADO\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // 1. Verificar estructura de usuarios
        console.log('1️⃣ ESTRUCTURA DE TABLA USUARIOS:');
        const [columns] = await connection.execute(`
            DESCRIBE usuarios
        `);
        
        const hasPhone = columns.some(col => col.Field === 'telefono');
        const hasAddress = columns.some(col => col.Field === 'direccion');
        
        console.log(`   📞 Campo telefono: ${hasPhone ? '✅ Existe' : '❌ No existe'}`);
        console.log(`   🏠 Campo direccion: ${hasAddress ? '✅ Existe' : '❌ No existe'}\n`);

        // 2. Verificar datos de clientes
        console.log('2️⃣ CLIENTES EN TABLA USUARIOS:');
        const [clientStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 ELSE 0 END) as con_telefono,
                SUM(CASE WHEN direccion IS NOT NULL AND direccion != '' THEN 1 ELSE 0 END) as con_direccion,
                COUNT(DISTINCT id_tenant) as tenants_diferentes
            FROM usuarios
            WHERE id_rol = 3
        `);

        const stats = clientStats[0];
        console.log(`   👥 Total clientes: ${stats.total}`);
        console.log(`   📞 Con teléfono: ${stats.con_telefono}/${stats.total}`);
        console.log(`   🏠 Con dirección: ${stats.con_direccion}/${stats.total}`);
        console.log(`   🏪 En diferentes tenants: ${stats.tenants_diferentes}\n`);

        // 3. Verificar distribución por tenant
        console.log('3️⃣ DISTRIBUCIÓN DE CLIENTES POR TENANT:');
        const [tenantDist] = await connection.execute(`
            SELECT 
                t.nombre_empresa,
                t.slug,
                COUNT(u.id_usuario) as num_clientes
            FROM tenants t
            LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant AND u.id_rol = 3
            GROUP BY t.id_tenant
            ORDER BY num_clientes DESC
        `);

        tenantDist.forEach(t => {
            console.log(`   🏪 ${t.nombre_empresa}: ${t.num_clientes} clientes`);
        });
        console.log();

        // 4. Muestra de clientes con datos completos
        console.log('4️⃣ MUESTRA DE CLIENTES (primeros 5):');
        const [sample] = await connection.execute(`
            SELECT 
                u.nombre,
                u.apellido,
                u.email,
                u.telefono,
                u.direccion,
                t.nombre_empresa as tienda
            FROM usuarios u
            INNER JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.id_rol = 3
            LIMIT 5
        `);

        sample.forEach(c => {
            console.log(`   👤 ${c.nombre} ${c.apellido}`);
            console.log(`      📧 ${c.email}`);
            console.log(`      📞 ${c.telefono || 'Sin teléfono'}`);
            console.log(`      🏠 ${c.direccion || 'Sin dirección'}`);
            console.log(`      🏪 ${c.tienda}`);
            console.log();
        });

        // 5. Verificar existencia de tabla clientes
        console.log('5️⃣ ESTADO DE TABLA CLIENTES (antigua):');
        try {
            const [clientesCount] = await connection.execute(`
                SELECT COUNT(*) as total FROM clientes
            `);
            console.log(`   ⚠️  Tabla clientes aún existe con ${clientesCount[0].total} registros`);
            console.log(`   💡 Recomendación: Eliminar después de verificar que todo funciona\n`);
        } catch (error) {
            console.log(`   ✅ Tabla clientes no existe (correcto)\n`);
        }

        // 6. Verificar que NO hay clientes sin tenant
        console.log('6️⃣ VERIFICACIÓN DE AISLAMIENTO:');
        const [orphans] = await connection.execute(`
            SELECT COUNT(*) as total
            FROM usuarios
            WHERE id_rol = 3 AND id_tenant IS NULL
        `);

        if (orphans[0].total === 0) {
            console.log(`   ✅ Todos los clientes tienen tenant asignado`);
        } else {
            console.log(`   ⚠️  ${orphans[0].total} clientes SIN tenant (problema de aislamiento)`);
        }

        // 7. Verificar passwords
        console.log('\n7️⃣ VERIFICACIÓN DE PASSWORDS:');
        const [passwordCheck] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN password IS NOT NULL AND password != '' AND LENGTH(password) > 20 THEN 1 ELSE 0 END) as con_hash
            FROM usuarios
            WHERE id_rol = 3
        `);

        console.log(`   🔐 Clientes con password hasheado: ${passwordCheck[0].con_hash}/${passwordCheck[0].total}`);

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('📊 RESUMEN:\n');
        
        const allGood = 
            hasPhone && 
            hasAddress && 
            stats.con_telefono === stats.total && 
            stats.con_direccion === stats.total && 
            orphans[0].total === 0 &&
            passwordCheck[0].con_hash === passwordCheck[0].total;

        if (allGood) {
            console.log('✅ ¡SISTEMA COMPLETAMENTE UNIFICADO Y FUNCIONAL!\n');
            console.log('💡 PRÓXIMOS PASOS:');
            console.log('   1. Reiniciar backend: npm start');
            console.log('   2. Reiniciar frontend: npm run dev');
            console.log('   3. Probar login en diferentes tiendas');
            console.log('   4. Verificar que el perfil muestre telefono y direccion');
            console.log('   5. Verificar aislamiento (login en tienda A no debe dar acceso a tienda B)');
            console.log('   6. Una vez confirmado, eliminar tabla clientes con: DROP TABLE clientes;\n');
        } else {
            console.log('⚠️  HAY PROBLEMAS QUE RESOLVER:\n');
            if (!hasPhone || !hasAddress) {
                console.log('   ❌ Faltan campos en tabla usuarios');
            }
            if (stats.con_telefono < stats.total || stats.con_direccion < stats.total) {
                console.log('   ❌ Algunos clientes no tienen datos completos');
            }
            if (orphans[0].total > 0) {
                console.log('   ❌ Hay clientes sin tenant (problema de aislamiento)');
            }
            if (passwordCheck[0].con_hash < passwordCheck[0].total) {
                console.log('   ❌ Algunos clientes no tienen password hasheado');
            }
            console.log();
        }

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

verificarSistemaUnificado();
