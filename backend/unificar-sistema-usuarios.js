const mysql = require('mysql2/promise');
require('dotenv').config();

async function unificarSistemaUsuarios() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('═══════════════════════════════════════════════════════════════════');
        console.log('🔧 UNIFICANDO SISTEMA DE USUARIOS\n');
        console.log('═══════════════════════════════════════════════════════════════════\n');

        // PASO 1: Agregar campos telefono y direccion a usuarios si no existen
        console.log('📝 Paso 1: Agregando campos telefono y direccion a tabla usuarios...');
        
        try {
            await connection.execute(`
                ALTER TABLE usuarios 
                ADD COLUMN telefono VARCHAR(20) NULL AFTER email
            `);
            console.log('   ✅ Campo telefono agregado');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('   ⚠️  Campo telefono ya existe');
            } else {
                throw error;
            }
        }

        try {
            await connection.execute(`
                ALTER TABLE usuarios 
                ADD COLUMN direccion TEXT NULL AFTER telefono
            `);
            console.log('   ✅ Campo direccion agregado\n');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('   ⚠️  Campo direccion ya existe\n');
            } else {
                throw error;
            }
        }

        // PASO 2: Copiar datos de clientes a usuarios (para los que coincidan por email y tenant)
        console.log('📝 Paso 2: Sincronizando datos de clientes con usuarios...');
        
        const [updateResult] = await connection.execute(`
            UPDATE usuarios u
            INNER JOIN clientes c ON u.email = c.email AND u.id_tenant = c.id_tenant
            SET 
                u.telefono = c.telefono,
                u.direccion = c.direccion
            WHERE u.id_rol = 3
        `);
        
        console.log(`   ✅ ${updateResult.affectedRows} usuarios actualizados con datos de clientes\n`);

        // PASO 3: Verificar resultados
        console.log('📝 Paso 3: Verificando datos...\n');
        
        const [usuariosConDatos] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN telefono IS NOT NULL THEN 1 ELSE 0 END) as con_telefono,
                SUM(CASE WHEN direccion IS NOT NULL THEN 1 ELSE 0 END) as con_direccion
            FROM usuarios
            WHERE id_rol = 3
        `);

        console.log('📊 CLIENTES EN TABLA USUARIOS:');
        console.log(`   Total: ${usuariosConDatos[0].total}`);
        console.log(`   Con teléfono: ${usuariosConDatos[0].con_telefono}`);
        console.log(`   Con dirección: ${usuariosConDatos[0].con_direccion}\n`);

        // PASO 4: Mostrar muestra
        const [muestra] = await connection.execute(`
            SELECT nombre, apellido, email, telefono, direccion
            FROM usuarios
            WHERE id_rol = 3
            LIMIT 5
        `);

        console.log('📋 MUESTRA DE CLIENTES:');
        muestra.forEach(u => {
            console.log(`   👤 ${u.nombre} ${u.apellido} (${u.email})`);
            console.log(`      📞 ${u.telefono || 'Sin teléfono'}`);
            console.log(`      🏠 ${u.direccion || 'Sin dirección'}`);
        });

        console.log('\n═══════════════════════════════════════════════════════════════════');
        console.log('✅ UNIFICACIÓN COMPLETADA\n');
        console.log('💡 PRÓXIMOS PASOS:');
        console.log('   1. Actualizar TiendaLogin.jsx para usar /auth/login');
        console.log('   2. Verificar que loginPublic valide tenant_id CORRECTAMENTE');
        console.log('   3. Probar login en diferentes tiendas');
        console.log('   4. Una vez verificado, eliminar tabla clientes\n');

        await connection.end();

    } catch (error) {
        console.error('❌ Error:', error);
        if (connection) await connection.end();
        throw error;
    }
}

unificarSistemaUsuarios();
