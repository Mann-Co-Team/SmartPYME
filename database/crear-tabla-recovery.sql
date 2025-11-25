-- Script para crear la tabla password_recovery_tokens
-- Ejecutar en MySQL Workbench o desde la línea de comandos:
-- mysql -u root -p smartpyme_db < crear-tabla-recovery.sql

USE smartpyme_db;

-- Crear tabla de tokens de recuperación de contraseña
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

-- Verificar que la tabla se creó correctamente
DESCRIBE password_recovery_tokens;

SELECT 'Tabla password_recovery_tokens creada correctamente' AS status;
