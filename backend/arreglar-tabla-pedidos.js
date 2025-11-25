const db = require('./config/db');

(async () => {
    const conn = await db.getConnection();

    try {
        console.log('🔧 ARREGLANDO TABLA PEDIDOS\n');

        // Ver constraints actuales
        console.log('📋 Constraints actuales:');
        const [constraints] = await conn.execute(`
            SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_NAME = 'pedidos' AND TABLE_SCHEMA = 'smartpyme_db'
        `);
        constraints.forEach(c => console.log(`   - ${c.CONSTRAINT_NAME} (${c.CONSTRAINT_TYPE})`));

        // Eliminar FK de id_cliente
        console.log('\n🗑️ Eliminando FK de id_cliente...');
        try {
            // Buscar el nombre de la FK
            const [fks] = await conn.execute(`
                SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_NAME = 'pedidos' 
                AND COLUMN_NAME = 'id_cliente'
                AND CONSTRAINT_SCHEMA = 'smartpyme_db'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `);
            
            if (fks.length > 0) {
                const fkName = fks[0].CONSTRAINT_NAME;
                console.log(`   FK encontrada: ${fkName}`);
                await conn.execute(`ALTER TABLE pedidos DROP FOREIGN KEY ${fkName}`);
                console.log(`   ✅ FK ${fkName} eliminada`);
            } else {
                console.log('   ℹ️ No se encontró FK para id_cliente');
            }
        } catch (error) {
            console.log(`   ⚠️ Error: ${error.message}`);
        }

        // Agregar id_tenant si no existe
        console.log('\n➕ Verificando columna id_tenant...');
        const [cols] = await conn.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'pedidos' 
            AND TABLE_SCHEMA = 'smartpyme_db' 
            AND COLUMN_NAME = 'id_tenant'
        `);

        if (cols.length === 0) {
            console.log('   Agregando id_tenant...');
            await conn.execute(`
                ALTER TABLE pedidos 
                ADD COLUMN id_tenant INT NOT NULL DEFAULT 1 AFTER numero_pedido
            `);
            console.log('   ✅ id_tenant agregado');

            // Agregar FK a tenants
            console.log('   Agregando FK id_tenant -> tenants...');
            await conn.execute(`
                ALTER TABLE pedidos 
                ADD CONSTRAINT fk_pedido_tenant 
                FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant)
            `);
            console.log('   ✅ FK a tenants agregada');
        } else {
            console.log('   ✅ id_tenant ya existe');
        }

        // Hacer id_cliente NULL si no lo es
        console.log('\n🔄 Verificando que id_cliente sea NULL...');
        const [idClienteCol] = await conn.execute(`
            SELECT IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'pedidos' 
            AND COLUMN_NAME = 'id_cliente' 
            AND TABLE_SCHEMA = 'smartpyme_db'
        `);

        if (idClienteCol[0].IS_NULLABLE === 'NO') {
            console.log('   Haciendo id_cliente nullable...');
            await conn.execute(`ALTER TABLE pedidos MODIFY COLUMN id_cliente INT NULL`);
            console.log('   ✅ id_cliente ahora es nullable');
        } else {
            console.log('   ✅ id_cliente ya es nullable');
        }

        // Verificar estructura final
        console.log('\n📋 ESTRUCTURA FINAL:');
        const [finalCols] = await conn.execute(`
            SHOW COLUMNS FROM pedidos
        `);
        finalCols.forEach(col => {
            console.log(`   ${col.Field.padEnd(20)} ${col.Type.padEnd(15)} ${col.Null.padEnd(5)} ${col.Key}`);
        });

        console.log('\n✅ TABLA PEDIDOS ACTUALIZADA CORRECTAMENTE\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await conn.release();
    }
})();
