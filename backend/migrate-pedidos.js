const db = require('./config/db');

async function runMigration() {
    try {
        console.log('Ejecutando migration: add-pedido-fields...');
        
        // Agregar campo numero_pedido
        try {
            await db.execute(`
                ALTER TABLE pedidos 
                ADD COLUMN numero_pedido VARCHAR(50) UNIQUE AFTER id_pedido
            `);
            console.log('✓ Campo numero_pedido agregado');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Campo numero_pedido ya existe');
            } else {
                throw err;
            }
        }
        
        // Agregar campo direccion_entrega
        try {
            await db.execute(`
                ALTER TABLE pedidos 
                ADD COLUMN direccion_entrega TEXT AFTER notas
            `);
            console.log('✓ Campo direccion_entrega agregado');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Campo direccion_entrega ya existe');
            } else {
                throw err;
            }
        }
        
        // Agregar campo metodo_entrega
        try {
            await db.execute(`
                ALTER TABLE pedidos 
                ADD COLUMN metodo_entrega ENUM('delivery', 'pickup') DEFAULT 'pickup' AFTER direccion_entrega
            `);
            console.log('✓ Campo metodo_entrega agregado');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('✓ Campo metodo_entrega ya existe');
            } else {
                throw err;
            }
        }
        
        // Crear índice
        try {
            await db.execute(`CREATE INDEX idx_numero_pedido ON pedidos(numero_pedido)`);
            console.log('✓ Índice idx_numero_pedido creado');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('✓ Índice idx_numero_pedido ya existe');
            } else {
                throw err;
            }
        }
        
        // Actualizar pedidos existentes
        await db.execute(`
            UPDATE pedidos 
            SET numero_pedido = CONCAT('PED-', LPAD(id_pedido, 8, '0'))
            WHERE numero_pedido IS NULL
        `);
        console.log('✓ Pedidos existentes actualizados con número de pedido');
        
        console.log('\n✅ Migration completada exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migration:', error.message);
        process.exit(1);
    }
}

runMigration();
