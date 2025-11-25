-- Crear tabla de historial de contraseñas
CREATE TABLE IF NOT EXISTS password_history (
    id_history INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_created (created_at)
);
