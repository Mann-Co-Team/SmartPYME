-- ============================================
-- RF-14: Configuración General del Sistema
-- ============================================

-- Tabla para almacenar configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id_setting INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE COMMENT 'Si es visible para usuarios no admin',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    UNIQUE KEY unique_tenant_key (id_tenant, setting_key),
    INDEX idx_category (category),
    INDEX idx_tenant (id_tenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuraciones por defecto para cada tenant existente
INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'currency',
    'CLP',
    'string',
    'regional',
    'Moneda del sistema',
    TRUE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'currency'
);

INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'language',
    'es',
    'string',
    'regional',
    'Idioma del sistema',
    TRUE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'language'
);

INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'timezone',
    'America/Santiago',
    'string',
    'regional',
    'Zona horaria',
    TRUE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'timezone'
);

INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'notification_email',
    email_empresa,
    'string',
    'notifications',
    'Email para notificaciones del sistema',
    FALSE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'notification_email'
);

INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'tax_rate',
    '19',
    'number',
    'regional',
    'Tasa de impuesto (IVA %)',
    TRUE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'tax_rate'
);

-- Configuraciones de plantillas
INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'email_template_order',
    '{"subject": "Nuevo Pedido #{{order_id}}", "body": "Estimado {{customer_name}},\\n\\nSu pedido #{{order_id}} ha sido recibido.\\n\\nTotal: {{total}}\\n\\nGracias por su compra."}',
    'json',
    'templates',
    'Plantilla de email para pedidos',
    FALSE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'email_template_order'
);

INSERT INTO system_settings (id_tenant, setting_key, setting_value, setting_type, category, description, is_public)
SELECT 
    id_tenant,
    'pdf_template_invoice',
    '{"header": "{{company_name}}", "footer": "Gracias por su compra", "show_logo": true}',
    'json',
    'templates',
    'Plantilla de PDF para facturas',
    FALSE
FROM tenants
WHERE NOT EXISTS (
    SELECT 1 FROM system_settings 
    WHERE system_settings.id_tenant = tenants.id_tenant 
    AND system_settings.setting_key = 'pdf_template_invoice'
);
