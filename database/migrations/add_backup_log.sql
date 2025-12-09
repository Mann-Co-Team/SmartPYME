-- ============================================
-- RF-13: Sistema de Backups - Tabla de Log
-- ============================================

CREATE TABLE IF NOT EXISTS backup_log (
    id_backup INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size BIGINT,
    backup_type ENUM('manual', 'automatic') DEFAULT 'manual',
    status ENUM('success', 'failed', 'in_progress') DEFAULT 'in_progress',
    error_message TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_tenant (id_tenant),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
