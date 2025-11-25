const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearTablaPedidos() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'smartpyme_db'
        });

        console.log('✅ Conectado a la base de datos');

        // Verificar si la tabla pedidos ya existe
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE 'pedidos'
        `);

        if (tables.length > 0) {
            console.log('⚠️  La tabla pedidos ya existe. Agregando columna numero_pedido...');
            
            // Verificar si la columna ya existe
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'pedidos' 
                AND COLUMN_NAME = 'numero_pedido'
            `);

            if (columns.length > 0) {
                console.log('✅ La columna numero_pedido ya existe');
            } else {
                // Agregar columna
                await connection.execute(`
                    ALTER TABLE pedidos 
                    ADD COLUMN numero_pedido VARCHAR(50) UNIQUE AFTER id_pedido
                `);
                console.log('✅ Columna numero_pedido agregada');

                // Generar números para pedidos existentes
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
                await connection.execute(`
                    ALTER TABLE pedidos 
                    MODIFY COLUMN numero_pedido VARCHAR(50) UNIQUE NOT NULL
                `);
                console.log('✅ Campo numero_pedido configurado como NOT NULL');
            }
        } else {
            console.log('📝 Creando tabla pedidos...');
            
            await connection.execute(`
                CREATE TABLE pedidos (
                    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
                    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
                    id_tenant INT NOT NULL,
                    id_cliente INT NOT NULL,
                    id_usuario INT,
                    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
                    id_estado INT NOT NULL DEFAULT 1,
                    total DECIMAL(10,2) NOT NULL,
                    metodo_pago VARCHAR(50),
                    notas TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant),
                    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
                    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
                    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado)
                )
            `);
            
            console.log('✅ Tabla pedidos creada');

            // Crear tabla detalle_pedidos
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS detalle_pedidos (
                    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
                    id_pedido INT NOT NULL,
                    id_producto INT NOT NULL,
                    cantidad INT NOT NULL,
                    precio_unitario DECIMAL(10,2) NOT NULL,
                    subtotal DECIMAL(10,2) NOT NULL,
                    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
                    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
                )
            `);
            
            console.log('✅ Tabla detalle_pedidos creada');
        }

        console.log('');
        console.log('🎉 ¡Proceso completado exitosamente!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
}

// Ejecutar
crearTablaPedidos()
    .then(() => {
        console.log('✨ Finalizado');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });
