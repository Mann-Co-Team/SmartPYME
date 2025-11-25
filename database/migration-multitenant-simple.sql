-- ========================================
-- MIGRACIÓN MULTITENANT PARA SMARTPYME (SIMPLE)
-- ========================================

-- PASO 1: CREAR TABLA DE TENANTS
CREATE TABLE IF NOT EXISTS tenants (
    id_tenant INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'Identificador único para URLs',
    email_empresa VARCHAR(100) NOT NULL,
    telefono_empresa VARCHAR(20),
    direccion_empresa TEXT,
    logo VARCHAR(500),
    plan VARCHAR(50) DEFAULT 'basico',
    activo BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_fin DATE,
    max_usuarios INT DEFAULT 5,
    max_productos INT DEFAULT 100,
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PASO 2: AGREGAR TENANT_ID A TABLAS EXISTENTES
ALTER TABLE usuarios 
ADD COLUMN id_tenant INT AFTER id_usuario;

ALTER TABLE clientes 
ADD COLUMN id_tenant INT AFTER id_cliente;

ALTER TABLE categorias 
ADD COLUMN id_tenant INT AFTER id_categoria;

ALTER TABLE productos 
ADD COLUMN id_tenant INT AFTER id_producto;

ALTER TABLE pedidos 
ADD COLUMN id_tenant INT AFTER id_pedido;

ALTER TABLE settings 
ADD COLUMN id_tenant INT AFTER id;

ALTER TABLE notificaciones 
ADD COLUMN id_tenant INT AFTER id_notificacion;

-- PASO 3: CREAR TENANT POR DEFECTO
INSERT INTO tenants (
    nombre_empresa, slug, email_empresa, plan, activo, max_usuarios, max_productos
) VALUES (
    'Empresa Demo', 'demo', 'admin@demo.com', 'profesional', TRUE, 50, 1000
);

-- PASO 4: ASIGNAR TENANT_ID A DATOS EXISTENTES
UPDATE usuarios SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE clientes SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE categorias SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE productos SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE pedidos SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE settings SET id_tenant = 1 WHERE id_tenant IS NULL;
UPDATE notificaciones SET id_tenant = 1 WHERE id_tenant IS NULL;

-- PASO 5: HACER TENANT_ID OBLIGATORIO
ALTER TABLE usuarios MODIFY id_tenant INT NOT NULL;
ALTER TABLE clientes MODIFY id_tenant INT NOT NULL;
ALTER TABLE categorias MODIFY id_tenant INT NOT NULL;
ALTER TABLE productos MODIFY id_tenant INT NOT NULL;
ALTER TABLE pedidos MODIFY id_tenant INT NOT NULL;
ALTER TABLE settings MODIFY id_tenant INT NOT NULL;
ALTER TABLE notificaciones MODIFY id_tenant INT NOT NULL;

-- PASO 6: AGREGAR FOREIGN KEYS
ALTER TABLE usuarios 
ADD CONSTRAINT fk_usuarios_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE clientes 
ADD CONSTRAINT fk_clientes_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE categorias 
ADD CONSTRAINT fk_categorias_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE productos 
ADD CONSTRAINT fk_productos_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE pedidos 
ADD CONSTRAINT fk_pedidos_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE settings 
ADD CONSTRAINT fk_settings_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

ALTER TABLE notificaciones 
ADD CONSTRAINT fk_notificaciones_tenant 
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE;

-- PASO 7: CREAR ÍNDICES OPTIMIZADOS
ALTER TABLE usuarios ADD INDEX idx_tenant_usuario (id_tenant);
ALTER TABLE usuarios ADD INDEX idx_tenant_activo (id_tenant, activo);

ALTER TABLE clientes ADD INDEX idx_tenant_cliente (id_tenant);
ALTER TABLE clientes ADD INDEX idx_tenant_activo_cli (id_tenant, activo);

ALTER TABLE categorias ADD INDEX idx_tenant_categoria (id_tenant);
ALTER TABLE categorias ADD INDEX idx_tenant_activo_cat (id_tenant, activo);

ALTER TABLE productos ADD INDEX idx_tenant_producto (id_tenant);
ALTER TABLE productos ADD INDEX idx_tenant_activo_prod (id_tenant, activo);

ALTER TABLE pedidos ADD INDEX idx_tenant_pedido (id_tenant);
ALTER TABLE pedidos ADD INDEX idx_tenant_estado (id_tenant, id_estado);
ALTER TABLE pedidos ADD INDEX idx_tenant_fecha (id_tenant, fecha_pedido);

ALTER TABLE settings ADD INDEX idx_tenant_settings (id_tenant);
ALTER TABLE notificaciones ADD INDEX idx_tenant_notificacion (id_tenant);

-- PASO 8: CREAR TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS tenant_audit_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PASO 9: CREAR VISTA DE ESTADÍSTICAS
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
    t.max_productos
FROM tenants t
LEFT JOIN usuarios u ON t.id_tenant = u.id_tenant AND u.activo = TRUE
LEFT JOIN clientes c ON t.id_tenant = c.id_tenant AND c.activo = TRUE
LEFT JOIN productos pr ON t.id_tenant = pr.id_tenant AND pr.activo = TRUE
LEFT JOIN pedidos p ON t.id_tenant = p.id_tenant
GROUP BY t.id_tenant;
