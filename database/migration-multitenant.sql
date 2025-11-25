-- ========================================
-- MIGRACIÓN MULTITENANT PARA SMARTPYME
-- ========================================
-- Esta migración implementa la arquitectura multitenant
-- permitiendo que múltiples empresas operen de forma aislada
-- en la misma base de datos.

-- ========================================
-- PASO 1: CREAR TABLA DE TENANTS
-- ========================================

CREATE TABLE IF NOT EXISTS tenants (
    id_tenant INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'Identificador único para URLs (ej: empresa-abc)',
    email_empresa VARCHAR(100) NOT NULL,
    telefono_empresa VARCHAR(20),
    direccion_empresa TEXT,
    logo VARCHAR(500) COMMENT 'URL del logo de la empresa',
    plan VARCHAR(50) DEFAULT 'basico' COMMENT 'Plan de suscripción: basico, profesional, empresarial',
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_fin DATE COMMENT 'Fecha de vencimiento del plan (null = sin límite)',
    max_usuarios INT DEFAULT 5 COMMENT 'Límite de usuarios según el plan',
    max_productos INT DEFAULT 100 COMMENT 'Límite de productos según el plan',
    configuracion JSON COMMENT 'Configuraciones personalizadas del tenant',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla principal de tenants (empresas)';

-- ========================================
-- PASO 2: AGREGAR TENANT_ID A TABLAS EXISTENTES
-- ========================================

-- Usuarios
ALTER TABLE usuarios 
ADD COLUMN id_tenant INT AFTER id_usuario,
ADD CONSTRAINT fk_usuarios_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_usuario (id_tenant);

-- Clientes
ALTER TABLE clientes 
ADD COLUMN id_tenant INT AFTER id_cliente,
ADD CONSTRAINT fk_clientes_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_cliente (id_tenant);

-- Categorías
ALTER TABLE categorias 
ADD COLUMN id_tenant INT AFTER id_categoria,
ADD CONSTRAINT fk_categorias_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_categoria (id_tenant);

-- Productos
ALTER TABLE productos 
ADD COLUMN id_tenant INT AFTER id_producto,
ADD CONSTRAINT fk_productos_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_producto (id_tenant);

-- Pedidos
ALTER TABLE pedidos 
ADD COLUMN id_tenant INT AFTER id_pedido,
ADD CONSTRAINT fk_pedidos_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_pedido (id_tenant);

-- Settings (configuraciones)
ALTER TABLE settings 
ADD COLUMN id_tenant INT AFTER id,
ADD CONSTRAINT fk_settings_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_settings (id_tenant);

-- Notificaciones (si existe la tabla)
ALTER TABLE notificaciones 
ADD COLUMN id_tenant INT AFTER id_notificacion,
ADD CONSTRAINT fk_notificaciones_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
ADD INDEX idx_tenant_notificacion (id_tenant);

-- ========================================
-- PASO 3: CREAR TENANT POR DEFECTO (MIGRACIÓN DE DATOS EXISTENTES)
-- ========================================

INSERT INTO tenants (
    nombre_empresa, 
    slug, 
    email_empresa, 
    plan, 
    activo,
    max_usuarios,
    max_productos
) VALUES (
    'Empresa Demo',
    'demo',
    'admin@demo.com',
    'profesional',
    TRUE,
    50,
    1000
);

-- Obtener el ID del tenant por defecto
SET @tenant_id = LAST_INSERT_ID();

-- ========================================
-- PASO 4: ASIGNAR TENANT_ID A DATOS EXISTENTES
-- ========================================

-- Usuarios existentes
UPDATE usuarios SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Clientes existentes
UPDATE clientes SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Categorías existentes
UPDATE categorias SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Productos existentes
UPDATE productos SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Pedidos existentes
UPDATE pedidos SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Settings existentes
UPDATE settings SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- Notificaciones existentes (si existen)
UPDATE notificaciones SET id_tenant = @tenant_id WHERE id_tenant IS NULL;

-- ========================================
-- PASO 5: HACER TENANT_ID OBLIGATORIO (NOT NULL)
-- ========================================

ALTER TABLE usuarios MODIFY id_tenant INT NOT NULL;
ALTER TABLE clientes MODIFY id_tenant INT NOT NULL;
ALTER TABLE categorias MODIFY id_tenant INT NOT NULL;
ALTER TABLE productos MODIFY id_tenant INT NOT NULL;
ALTER TABLE pedidos MODIFY id_tenant INT NOT NULL;
ALTER TABLE settings MODIFY id_tenant INT NOT NULL;
ALTER TABLE notificaciones MODIFY id_tenant INT NOT NULL;

-- ========================================
-- PASO 6: CREAR ÍNDICES COMPUESTOS PARA OPTIMIZACIÓN
-- ========================================

-- Índices compuestos para mejorar performance de queries con tenant_id
ALTER TABLE usuarios ADD INDEX idx_tenant_activo (id_tenant, activo);
ALTER TABLE clientes ADD INDEX idx_tenant_activo (id_tenant, activo);
ALTER TABLE categorias ADD INDEX idx_tenant_activo (id_tenant, activo);
ALTER TABLE productos ADD INDEX idx_tenant_activo (id_tenant, activo);
ALTER TABLE pedidos ADD INDEX idx_tenant_estado (id_tenant, id_estado);
ALTER TABLE pedidos ADD INDEX idx_tenant_fecha (id_tenant, fecha_pedido);

-- ========================================
-- PASO 7: CREAR TABLA DE AUDITORÍA DE TENANTS
-- ========================================

CREATE TABLE IF NOT EXISTS tenant_audit_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    accion VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, LOGIN, etc.',
    tabla_afectada VARCHAR(100),
    id_registro INT,
    id_usuario INT,
    ip_address VARCHAR(45),
    detalles JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_tenant_log (id_tenant, created_at),
    INDEX idx_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de auditoría por tenant';

-- ========================================
-- PASO 8: CREAR VISTA PARA ESTADÍSTICAS DE TENANTS
-- ========================================

CREATE OR REPLACE VIEW v_tenant_stats AS
SELECT 
    t.id_tenant,
    t.nombre_empresa,
    t.slug,
    t.plan,
    t.activo,
    COUNT(DISTINCT u.id_usuario) as total_usuarios,
    COUNT(DISTINCT c.id_cliente) as total_clientes,
    COUNT(DISTINCT pr.id_producto) as total_productos,
    COUNT(DISTINCT p.id_pedido) as total_pedidos,
    COALESCE(SUM(p.total), 0) as ventas_totales,
    t.max_usuarios,
    t.max_productos,
    CASE 
        WHEN COUNT(DISTINCT u.id_usuario) >= t.max_usuarios THEN 'Límite alcanzado'
        WHEN COUNT(DISTINCT u.id_usuario) >= t.max_usuarios * 0.8 THEN 'Cerca del límite'
        ELSE 'Normal'
    END as estado_usuarios,
    CASE 
        WHEN COUNT(DISTINCT pr.id_producto) >= t.max_productos THEN 'Límite alcanzado'
        WHEN COUNT(DISTINCT pr.id_producto) >= t.max_productos * 0.8 THEN 'Cerca del límite'
        ELSE 'Normal'
    END as estado_productos
FROM tenants t
LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant AND u.activo = TRUE
LEFT JOIN clientes c ON t.id_tenant = c.id_tenant AND c.activo = TRUE
LEFT JOIN productos pr ON t.id_tenant = pr.id_tenant AND pr.activo = TRUE
LEFT JOIN pedidos p ON t.id_tenant = p.id_tenant
GROUP BY t.id_tenant;

-- ========================================
-- PASO 9: CREAR PROCEDIMIENTOS ALMACENADOS
-- ========================================

DELIMITER //

-- Procedimiento para crear un nuevo tenant con admin inicial
CREATE PROCEDURE sp_crear_tenant(
    IN p_nombre_empresa VARCHAR(200),
    IN p_slug VARCHAR(100),
    IN p_email_empresa VARCHAR(100),
    IN p_plan VARCHAR(50),
    IN p_admin_nombre VARCHAR(100),
    IN p_admin_apellido VARCHAR(100),
    IN p_admin_email VARCHAR(100),
    IN p_admin_password VARCHAR(255)
)
BEGIN
    DECLARE v_tenant_id INT;
    DECLARE v_max_usuarios INT;
    DECLARE v_max_productos INT;
    
    -- Definir límites según plan
    CASE p_plan
        WHEN 'basico' THEN 
            SET v_max_usuarios = 5;
            SET v_max_productos = 100;
        WHEN 'profesional' THEN 
            SET v_max_usuarios = 20;
            SET v_max_productos = 500;
        WHEN 'empresarial' THEN 
            SET v_max_usuarios = 100;
            SET v_max_productos = 5000;
        ELSE 
            SET v_max_usuarios = 5;
            SET v_max_productos = 100;
    END CASE;
    
    -- Crear tenant
    INSERT INTO tenants (
        nombre_empresa, slug, email_empresa, plan, 
        max_usuarios, max_productos
    ) VALUES (
        p_nombre_empresa, p_slug, p_email_empresa, p_plan,
        v_max_usuarios, v_max_productos
    );
    
    SET v_tenant_id = LAST_INSERT_ID();
    
    -- Crear usuario administrador del tenant
    INSERT INTO usuarios (
        id_tenant, id_rol, nombre, apellido, 
        email, password, activo
    ) VALUES (
        v_tenant_id, 1, p_admin_nombre, p_admin_apellido,
        p_admin_email, p_admin_password, TRUE
    );
    
    -- Crear categoría por defecto
    INSERT INTO categorias (
        id_tenant, nombre, descripcion, activo
    ) VALUES (
        v_tenant_id, 'General', 'Categoría general para productos', TRUE
    );
    
    -- Crear configuraciones por defecto
    INSERT INTO settings (id_tenant, setting_key, setting_value, description) VALUES
    (v_tenant_id, 'company_name', p_nombre_empresa, 'Nombre de la empresa'),
    (v_tenant_id, 'theme_color', '#007bff', 'Color principal del tema'),
    (v_tenant_id, 'company_email', p_email_empresa, 'Email de la empresa');
    
    SELECT v_tenant_id as tenant_id;
END //

-- Procedimiento para verificar límites del tenant
CREATE PROCEDURE sp_verificar_limites_tenant(
    IN p_tenant_id INT
)
BEGIN
    SELECT 
        t.id_tenant,
        t.nombre_empresa,
        t.plan,
        COUNT(DISTINCT u.id_usuario) as usuarios_actuales,
        t.max_usuarios,
        (COUNT(DISTINCT u.id_usuario) >= t.max_usuarios) as limite_usuarios_alcanzado,
        COUNT(DISTINCT p.id_producto) as productos_actuales,
        t.max_productos,
        (COUNT(DISTINCT p.id_producto) >= t.max_productos) as limite_productos_alcanzado
    FROM tenants t
    LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant AND u.activo = TRUE
    LEFT JOIN productos p ON t.id_tenant = p.id_tenant AND p.activo = TRUE
    WHERE t.id_tenant = p_tenant_id
    GROUP BY t.id_tenant;
END //

DELIMITER ;

-- ========================================
-- PASO 10: CREAR TRIGGERS PARA AUDITORÍA
-- ========================================

DELIMITER //

-- Trigger para auditar creación de pedidos
CREATE TRIGGER tr_pedidos_audit_insert
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
    INSERT INTO tenant_audit_log (
        id_tenant, accion, tabla_afectada, id_registro, id_usuario
    ) VALUES (
        NEW.id_tenant, 'CREATE', 'pedidos', NEW.id_pedido, NEW.id_usuario
    );
END //

-- Trigger para auditar cambios de estado en pedidos
CREATE TRIGGER tr_pedidos_audit_update
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.id_estado != NEW.id_estado THEN
        INSERT INTO tenant_audit_log (
            id_tenant, accion, tabla_afectada, id_registro, id_usuario,
            detalles
        ) VALUES (
            NEW.id_tenant, 'UPDATE', 'pedidos', NEW.id_pedido, NEW.id_usuario,
            JSON_OBJECT(
                'campo', 'id_estado',
                'valor_anterior', OLD.id_estado,
                'valor_nuevo', NEW.id_estado
            )
        );
    END IF;
END //

DELIMITER ;

-- ========================================
-- RESUMEN DE MIGRACIÓN
-- ========================================

SELECT 
    '✅ Migración multitenant completada exitosamente' as mensaje,
    COUNT(*) as tenants_creados
FROM tenants;

SELECT 
    'Tenant Demo' as tenant,
    COUNT(DISTINCT u.id_usuario) as usuarios,
    COUNT(DISTINCT c.id_cliente) as clientes,
    COUNT(DISTINCT cat.id_categoria) as categorias,
    COUNT(DISTINCT pr.id_producto) as productos,
    COUNT(DISTINCT p.id_pedido) as pedidos
FROM tenants t
LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant
LEFT JOIN clientes c ON t.id_tenant = c.id_tenant
LEFT JOIN categorias cat ON t.id_tenant = cat.id_tenant
LEFT JOIN productos pr ON t.id_tenant = pr.id_tenant
LEFT JOIN pedidos p ON t.id_tenant = p.id_tenant
WHERE t.slug = 'demo'
GROUP BY t.id_tenant;
