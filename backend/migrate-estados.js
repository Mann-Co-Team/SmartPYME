const mysql = require('mysql2/promise');

(async () => {
    console.log('🔄 Actualizando estados en la base de datos...\n');
    
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Rocketn3m3s1s.',
        database: 'smartpyme_db'
    });
    
    try {
        await conn.beginTransaction();
        
        // Primero, desactivar las foreign keys temporalmente
        await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Insertar estados nuevos (2: Confirmado, 4: Listo, 5: Enviado)
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (2, 'Confirmado', 'Pedido confirmado por el sistema')
            ON DUPLICATE KEY UPDATE nombre_estado = 'Confirmado', descripcion = 'Pedido confirmado por el sistema'
        `);
        console.log('✅ Estado 2: Confirmado agregado\n');
        
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (4, 'Listo', 'Pedido listo para retiro o envío')
            ON DUPLICATE KEY UPDATE nombre_estado = 'Listo', descripcion = 'Pedido listo para retiro o envío'
        `);
        console.log('✅ Estado 4: Listo agregado\n');
        
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (5, 'Enviado', 'Pedido enviado al cliente')
            ON DUPLICATE KEY UPDATE nombre_estado = 'Enviado', descripcion = 'Pedido enviado al cliente'
        `);
        console.log('✅ Estado 5: Enviado agregado\n');
        
        // Actualizar estados existentes
        // id 1: Pendiente (ya existe, no se toca)
        // id 2: En Proceso -> ahora será Confirmado (crear nuevo id 3 para En Proceso)
        // id 3: Completado -> ahora será En Proceso (crear nuevo id 6 para Completado)
        // id 4: Cancelado -> ahora será Listo (crear nuevo id 7 para Cancelado)
        
        // Crear id 3: En Proceso
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (3, 'En Proceso', 'Pedido en preparación')
            ON DUPLICATE KEY UPDATE nombre_estado = 'En Proceso', descripcion = 'Pedido en preparación'
        `);
        console.log('✅ Estado 3: En Proceso actualizado\n');
        
        // Crear id 6: Completado
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (6, 'Completado', 'Pedido completado y entregado')
            ON DUPLICATE KEY UPDATE nombre_estado = 'Completado', descripcion = 'Pedido completado y entregado'
        `);
        console.log('✅ Estado 6: Completado agregado\n');
        
        // Crear id 7: Cancelado
        await conn.execute(`
            INSERT INTO estados_pedido (id_estado, nombre_estado, descripcion) VALUES
            (7, 'Cancelado', 'Pedido cancelado')
            ON DUPLICATE KEY UPDATE nombre_estado = 'Cancelado', descripcion = 'Pedido cancelado'
        `);
        console.log('✅ Estado 7: Cancelado agregado\n');
        
        // Actualizar pedidos: mover de estados viejos a nuevos
        // Pedidos que estaban en id 2 (En Proceso viejo) -> id 3 (En Proceso nuevo)
        await conn.execute('UPDATE pedidos SET id_estado = 3 WHERE id_estado = 2');
        await conn.execute('UPDATE historial_estados_pedido SET id_estado = 3 WHERE id_estado = 2');
        console.log('✅ Pedidos actualizados: viejo id 2 -> nuevo id 3\n');
        
        // Pedidos que estaban en id 3 (Completado viejo) -> id 6 (Completado nuevo)
        await conn.execute('UPDATE pedidos SET id_estado = 6 WHERE id_estado = 3');
        await conn.execute('UPDATE historial_estados_pedido SET id_estado = 6 WHERE id_estado = 3');
        console.log('✅ Pedidos actualizados: viejo id 3 -> nuevo id 6\n');
        
        // Pedidos que estaban en id 4 (Cancelado viejo) -> id 7 (Cancelado nuevo)
        await conn.execute('UPDATE pedidos SET id_estado = 7 WHERE id_estado = 4');
        await conn.execute('UPDATE historial_estados_pedido SET id_estado = 7 WHERE id_estado = 4');
        console.log('✅ Pedidos actualizados: viejo id 4 -> nuevo id 7\n');
        
        // Actualizar el estado 2 para que sea Confirmado
        await conn.execute(`
            UPDATE estados_pedido 
            SET nombre_estado = 'Confirmado', descripcion = 'Pedido confirmado por el sistema'
            WHERE id_estado = 2
        `);
        console.log('✅ Estado 2 actualizado a Confirmado\n');
        
        // Actualizar el estado 4 para que sea Listo
        await conn.execute(`
            UPDATE estados_pedido 
            SET nombre_estado = 'Listo', descripcion = 'Pedido listo para retiro o envío'
            WHERE id_estado = 4
        `);
        console.log('✅ Estado 4 actualizado a Listo\n');
        
        // Reactivar foreign keys
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        await conn.commit();
        
        // Verificar
        const [rows] = await conn.execute('SELECT * FROM estados_pedido ORDER BY id_estado');
        console.log('📋 Estados finales en BD:');
        rows.forEach(r => console.log(`   ${r.id_estado}: ${r.nombre_estado}`));
        
        console.log('\n✅ Migración completada exitosamente');
        
    } catch (error) {
        await conn.rollback();
        console.error('❌ Error en migración:', error.message);
        throw error;
    } finally {
        await conn.end();
    }
})().catch(e => {
    console.error('Error fatal:', e.message);
    process.exit(1);
});
