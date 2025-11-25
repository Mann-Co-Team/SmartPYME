const db = require('./config/db');

const createTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS password_recovery_tokens (
      id_token INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      token VARCHAR(100) NOT NULL UNIQUE,
      expiry DATETIME NOT NULL,
      used TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      INDEX idx_token (token),
      INDEX idx_expiry (expiry)
    );
  `;

  try {
    console.log('🔧 Creando tabla password_recovery_tokens...');
    await db.query(sql);
    console.log('✅ Tabla password_recovery_tokens creada exitosamente');
    
    // Verificar la tabla
    const [result] = await db.query('DESCRIBE password_recovery_tokens');
    console.log('\n📋 Estructura de la tabla:');
    console.table(result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear la tabla:', error.message);
    process.exit(1);
  }
};

createTable();
