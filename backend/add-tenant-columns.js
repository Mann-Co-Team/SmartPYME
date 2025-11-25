const db = require('./config/db');

async function addTenantColumns() {
    console.log('\n🔧 Agregando columnas id_tenant a todas las tablas...\n');

    const tablas = [
        { nombre: 'usuarios', afterColumn: 'id_usuario' },
        { nombre: 'clientes', afterColumn: 'id_cliente' },
        { nombre: 'categorias', afterColumn: 'id_categoria' },
        { nombre: 'productos', afterColumn: 'id_producto' },
        { nombre: 'pedidos', afterColumn: 'id_pedido' },
        { nombre: 'settings', afterColumn: 'id' },
        { nombre: 'notificaciones', afterColumn: 'id_notificacion' }
    ];

    for (const tabla of tablas) {
        try {
            // Verificar si ya existe
            const [cols] = await db.execute(`SHOW COLUMNS FROM ${tabla.nombre} LIKE 'id_tenant'`);
            
            if (cols.length > 0) {
                console.log(`⏭️  ${tabla.nombre} - ya tiene id_tenant`);
            } else {
                await db.execute(`
                    ALTER TABLE ${tabla.nombre} 
                    ADD COLUMN id_tenant INT AFTER ${tabla.afterColumn}
                `);
                console.log(`✅ ${tabla.nombre} - id_tenant agregado`);
            }
        } catch (error) {
            console.error(`❌ ${tabla.nombre} - Error:`, error.message);
        }
    }

    console.log('\n✅ Columnas agregadas\n');
    console.log('🔄 Asignando tenant_id = 1 a datos existentes...\n');

    for (const tabla of tablas) {
        try {
            const [result] = await db.execute(`
                UPDATE ${tabla.nombre} SET id_tenant = 1 WHERE id_tenant IS NULL
            `);
            if (result.affectedRows > 0) {
                console.log(`✅ ${tabla.nombre} - ${result.affectedRows} registros actualizados`);
            } else {
                console.log(`⏭️  ${tabla.nombre} - sin registros para actualizar`);
            }
        } catch (error) {
            console.error(`❌ ${tabla.nombre} - Error actualizando:`, error.message);
        }
    }

    console.log('\n🔧 Haciendo id_tenant NOT NULL...\n');

    for (const tabla of tablas) {
        try {
            await db.execute(`
                ALTER TABLE ${tabla.nombre} MODIFY id_tenant INT NOT NULL
            `);
            console.log(`✅ ${tabla.nombre} - id_tenant es NOT NULL`);
        } catch (error) {
            console.error(`❌ ${tabla.nombre} - Error:`, error.message);
        }
    }

    console.log('\n✅ Proceso completado\n');
    process.exit(0);
}

addTenantColumns();
