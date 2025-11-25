const mysql = require('mysql2/promise');
require('dotenv').config();

async function addNumeroPedidoColumn() {
    let connection;
    
    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a MySQL');

        // Mostrar base de datos actual
        const [dbInfo] = await connection.execute('SELECT DATABASE() as db');
        console.log(`📊 Base de datos: ${dbInfo[0].db}`);

        // Listar tablas disponibles
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`📋 Tablas encontradas: ${tables.length}`);
        if (tables.length > 0) {
            console.log('   -', tables.map(t => Object.values(t)[0]).join(', '));
        }

        // Verificar si la columna ya existe
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'pedidos' 
            AND COLUMN_NAME = 'numero_pedido'
        `);

        if (columns.length > 0) {
            console.log('⚠️  La columna numero_pedido ya existe');
            return;
        }

        console.log('📝 Agregando columna numero_pedido...');
        
        // Agregar columna
        await connection.execute(`
            ALTER TABLE pedidos 
            ADD COLUMN numero_pedido VARCHAR(50) UNIQUE AFTER id_pedido
        `);
        
        console.log('✅ Columna agregada');

        // Generar números para pedidos existentes
        console.log('📝 Generando números para pedidos existentes...');
        
        const [pedidos] = await connection.execute(`
            SELECT id_pedido, fecha_pedido 
            FROM pedidos 
            WHERE numero_pedido IS NULL 
            ORDER BY fecha_pedido ASC
        `);

        let counter = 1;
        for (const pedido of pedidos) {
            const fecha = new Date(pedido.fecha_pedido);
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            const numero = `PED-${year}${month}${day}-${String(counter).padStart(4, '0')}`;
            
            await connection.execute(
                'UPDATE pedidos SET numero_pedido = ? WHERE id_pedido = ?',
                [numero, pedido.id_pedido]
            );
            
            counter++;
        }

        console.log(`✅ ${pedidos.length} pedidos actualizados con número`);

        // Hacer el campo NOT NULL
        console.log('📝 Configurando columna como NOT NULL...');
        
        await connection.execute(`
            ALTER TABLE pedidos 
            MODIFY COLUMN numero_pedido VARCHAR(50) UNIQUE NOT NULL
        `);

        console.log('✅ Script completado exitosamente');
        console.log('');
        console.log('🎉 La tabla pedidos ahora tiene el campo numero_pedido');
        console.log('📊 Todos los pedidos existentes tienen su número asignado');

    } catch (error) {
        console.error('❌ Error ejecutando script:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
addNumeroPedidoColumn()
    .then(() => {
        console.log('✨ Proceso finalizado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
