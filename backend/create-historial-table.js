// Script para crear manualmente la tabla historial_estados_pedido
const db = require('./config/db');

async function createHistorialTable() {
  const connection = await db.getConnection();
  
  try {
    console.log('📋 Creando tabla historial_estados_pedido...\n');

    // Crear tabla
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS historial_estados_pedido (
        id_historial INT AUTO_INCREMENT PRIMARY KEY,
        id_pedido INT NOT NULL,
        id_estado INT NOT NULL,
        id_usuario INT NULL,
        notas TEXT NULL,
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
        FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
        INDEX idx_pedido_fecha (id_pedido, fecha_cambio DESC)
      )
    `);
    
    console.log('✅ Tabla historial_estados_pedido creada\n');

    // Insertar historial para pedidos existentes
    console.log('📝 Insertando historial para pedidos existentes...\n');
    
    await connection.execute(`
      INSERT IGNORE INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas, fecha_cambio)
      SELECT id_pedido, id_estado, id_usuario, 'Estado inicial del pedido', fecha_pedido
      FROM pedidos
    `);

    const [result] = await connection.execute('SELECT COUNT(*) as count FROM historial_estados_pedido');
    console.log(`✅ ${result[0].count} registros de historial insertados\n`);

    console.log('✅ ¡Tabla de historial creada exitosamente!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createHistorialTable();
