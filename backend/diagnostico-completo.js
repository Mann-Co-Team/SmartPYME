const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnosticoCompleto() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('📊 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // 1. VERIFICAR TABLAS
        console.log('1️⃣ ESTRUCTURA DE TABLAS:\n');
        
        const [tablesInfo] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                TABLE_ROWS,
                ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = 'smartpyme_db'
            AND TABLE_NAME IN ('usuarios', 'clientes')
            ORDER BY TABLE_NAME
        `);

        tablesInfo.forEach(t => {
            console.log(`   📋 ${t.TABLE_NAME}: ${t.TABLE_ROWS} registros`);
        });

        // 2. VERIFICAR USUARIOS POR ROL
        console.log('\n2️⃣ USUARIOS POR ROL (tabla usuarios):\n');
        const [usersByRole] = await connection.execute(`
            SELECT 
                r.nombre_rol,
                COUNT(*) as total,
                GROUP_CONCAT(DISTINCT t.slug ORDER BY t.slug) as tenants
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE u.activo = TRUE
            GROUP BY r.nombre_rol
            ORDER BY r.id_rol
        `);

        usersByRole.forEach(r => {
            console.log(`   👤 ${r.nombre_rol}: ${r.total} usuarios`);
        });

        // 3. VERIFICAR CLIENTES EN AMBAS TABLAS
        console.log('\n3️⃣ COMPARACIÓN DE CLIENTES:\n');
        
        const [clientesUsuarios] = await connection.execute(`
            SELECT COUNT(*) as total FROM usuarios WHERE id_rol = 3
        `);
        
        const [clientesTabla] = await connection.execute(`
            SELECT COUNT(*) as total FROM clientes
        `);

        console.log(`   📊 Clientes en tabla "usuarios" (rol=3): ${clientesUsuarios[0].total}`);
        console.log(`   📊 Clientes en tabla "clientes": ${clientesTabla[0].total}`);
        
        if (clientesUsuarios[0].total > 0 && clientesTabla[0].total > 0) {
            console.log('   ⚠️  DUPLICACIÓN: Hay clientes en AMBAS tablas\n');
        }

        // 4. VERIFICAR QUÉ USA EL FRONTEND
        console.log('4️⃣ ANÁLISIS DE USO:\n');
        console.log('   🔍 TiendaLogin.jsx usa: /clientes/login (tabla CLIENTES)');
        console.log('   🔍 Login.jsx usa: /auth/login (tabla USUARIOS)');
        console.log('   🔍 AdminLogin.jsx usa: /auth/admin/login (tabla USUARIOS)\n');

        // 5. VERIFICAR DATOS DE PERFIL EN CLIENTES
        console.log('5️⃣ DATOS DE PERFIL (tabla clientes):\n');
        const [perfilData] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN telefono IS NOT NULL AND telefono != '' THEN 1 ELSE 0 END) as con_telefono,
                SUM(CASE WHEN direccion IS NOT NULL AND direccion != '' THEN 1 ELSE 0 END) as con_direccion
            FROM clientes
        `);

        console.log(`   📞 Clientes con teléfono: ${perfilData[0].con_telefono}/${perfilData[0].total}`);
        console.log(`   🏠 Clientes con dirección: ${perfilData[0].con_direccion}/${perfilData[0].total}\n`);

        // 6. VERIFICAR PRODUCTOS
        console.log('6️⃣ PRODUCTOS:\n');
        const [productos] = await connection.execute(`
            SELECT 
                t.slug,
                COUNT(p.id_producto) as total_productos,
                SUM(CASE WHEN p.imagen IS NOT NULL AND p.imagen != '' THEN 1 ELSE 0 END) as con_imagen
            FROM tenants t
            LEFT JOIN productos p ON t.id_tenant = p.id_tenant
            WHERE t.activo = TRUE
            GROUP BY t.id_tenant, t.slug
            ORDER BY t.slug
        `);

        productos.forEach(p => {
            console.log(`   🏪 ${p.slug}: ${p.total_productos} productos (${p.con_imagen} con imagen)`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('💡 RECOMENDACIONES:\n');
        console.log('1. ❌ ELIMINAR tabla "clientes" - Es redundante');
        console.log('2. ✅ USAR SOLO tabla "usuarios" con campo id_rol (1=Admin, 2=Empleado, 3=Cliente)');
        console.log('3. 🔧 ACTUALIZAR TiendaLogin.jsx para usar /auth/login en lugar de /clientes/login');
        console.log('4. 📝 AGREGAR campos telefono y direccion a tabla usuarios');
        console.log('5. ✅ VERIFICAR que login valide tenant_id correctamente\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (connection) await connection.end();
    }
}

diagnosticoCompleto();
