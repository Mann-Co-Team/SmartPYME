const db = require('./config/db');

(async () => {
    const conn = await db.getConnection();
    
    try {
        console.log('📊 ANÁLISIS DE USUARIOS POR TENANT\n');
        
        // Ver usuarios del tenant pasteleria-dulce-sabor
        const [usuarios] = await conn.execute(`
            SELECT 
                u.id_usuario,
                u.nombre,
                u.apellido,
                u.email,
                r.nombre_rol,
                u.id_rol,
                t.nombre_empresa,
                t.plan,
                t.max_usuarios
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            JOIN tenants t ON u.id_tenant = t.id_tenant
            WHERE t.slug = 'pasteleria-dulce-sabor'
            AND u.activo = 1
            ORDER BY u.id_rol, u.id_usuario
        `);
        
        console.log('👥 USUARIOS EN PASTELERÍA DULCE SABOR:\n');
        
        let admins = 0;
        let empleados = 0;
        let clientes = 0;
        
        usuarios.forEach(u => {
            const emoji = u.id_rol === 1 ? '👑' : u.id_rol === 2 ? '👨‍💼' : '👤';
            console.log(`${emoji} ${u.nombre} ${u.apellido}`);
            console.log(`   Email: ${u.email}`);
            console.log(`   Rol: ${u.nombre_rol} (ID: ${u.id_rol})`);
            console.log(`   ID: ${u.id_usuario}\n`);
            
            if (u.id_rol === 1) admins++;
            else if (u.id_rol === 2) empleados++;
            else if (u.id_rol === 3) clientes++;
        });
        
        console.log('📈 RESUMEN:');
        console.log(`   👑 Administradores: ${admins}`);
        console.log(`   👨‍💼 Empleados: ${empleados}`);
        console.log(`   👤 Clientes: ${clientes}`);
        console.log(`   📊 Total: ${usuarios.length}`);
        
        if (usuarios.length > 0) {
            console.log(`\n📋 PLAN: ${usuarios[0].plan}`);
            console.log(`   Límite admins/empleados: ${usuarios[0].max_usuarios}`);
            console.log(`   Admins/empleados actuales: ${admins + empleados}`);
            console.log(`   Estado: ${admins + empleados >= usuarios[0].max_usuarios ? '❌ LÍMITE ALCANZADO' : '✅ Disponibles'}`);
            console.log(`\n💡 NOTA: Los clientes (${clientes}) NO cuentan para el límite`);
        }
        
        // Verificar con checkLimits
        console.log('\n\n🔍 VERIFICACIÓN CON checkLimits():\n');
        const TenantModel = require('./models/tenant.model');
        const [tenant] = await conn.execute('SELECT id_tenant FROM tenants WHERE slug = ?', ['pasteleria-dulce-sabor']);
        
        if (tenant.length > 0) {
            const limits = await TenantModel.checkLimits(tenant[0].id_tenant);
            console.log('Resultado de checkLimits():');
            console.log(JSON.stringify(limits, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.release();
    }
})();
