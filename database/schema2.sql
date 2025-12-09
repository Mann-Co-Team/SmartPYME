-- ============================================
-- SmartPYME - Schema Completo v2.0
-- Base de datos multitenant para gestión de PYME
-- ============================================

-- Deshabilitar comprobación de FKs durante la creación
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

-- ============================================
-- ELIMINAR TABLAS EXISTENTES
-- ============================================

DROP TABLE IF EXISTS historial_estados_pedido;
DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS password_recovery_tokens;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS estados_pedido;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS cupones;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS zonas_entrega;
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS tenants;

-- ============================================
-- TABLA: tenants (Multi-tenancy)
-- ============================================

CREATE TABLE tenants (
    id_tenant INT AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email_empresa VARCHAR(100) NOT NULL,
    telefono_empresa VARCHAR(20),
    direccion_empresa TEXT,
    descripcion TEXT,
    whatsapp VARCHAR(20),
    instagram VARCHAR(100),
    facebook VARCHAR(100),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: roles
-- ============================================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: usuarios (empleados/admin/clientes)
-- ============================================

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    UNIQUE KEY unique_email_tenant (email, id_tenant),
    INDEX idx_tenant (id_tenant),
    INDEX idx_rol (id_rol),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: clientes (DEPRECADA - usar usuarios con rol cliente)
-- ============================================

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE KEY unique_email_tenant (email, id_tenant),
    INDEX idx_tenant (id_tenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: categorias
-- ============================================

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE KEY unique_nombre_tenant (nombre, id_tenant),
    INDEX idx_tenant (id_tenant),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: productos
-- ============================================

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    id_categoria INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
    INDEX idx_tenant (id_tenant),
    INDEX idx_categoria (id_categoria),
    INDEX idx_activo (activo),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: estados_pedido
-- ============================================

CREATE TABLE estados_pedido (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT '#6c757d',
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: pedidos
-- ============================================

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    numero_pedido VARCHAR(50) NOT NULL,
    id_tenant INT NOT NULL,
    id_cliente INT NULL,
    id_usuario INT,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_estado INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    metodo_entrega VARCHAR(50),
    direccion_entrega TEXT,
    telefono_contacto VARCHAR(20),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado),
    UNIQUE KEY unique_numero_tenant (numero_pedido, id_tenant),
    INDEX idx_tenant (id_tenant),
    INDEX idx_usuario (id_usuario),
    INDEX idx_estado (id_estado),
    INDEX idx_fecha (fecha_pedido DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: detalle_pedidos
-- ============================================

CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    notas TEXT,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    INDEX idx_pedido (id_pedido),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: historial_estados_pedido
-- ============================================

CREATE TABLE historial_estados_pedido (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: notificaciones
-- ============================================

CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    id_referencia INT,
    tipo_referencia VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_usuario_leida (id_usuario, leida),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: password_recovery_tokens
-- ============================================

CREATE TABLE password_recovery_tokens (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expiry DATETIME NOT NULL,
    used TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expiry (expiry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: settings
-- ============================================

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE KEY unique_key_tenant (setting_key, id_tenant),
    INDEX idx_tenant (id_tenant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: cupones (Descuentos y promociones)
-- ============================================

CREATE TABLE cupones (
    id_cupon INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tipo_descuento ENUM('porcentaje', 'monto_fijo') NOT NULL DEFAULT 'porcentaje',
    valor_descuento DECIMAL(10,2) NOT NULL,
    monto_minimo DECIMAL(10,2) DEFAULT 0,
    usos_maximos INT DEFAULT NULL,
    usos_actuales INT DEFAULT 0,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    UNIQUE KEY unique_codigo_tenant (codigo, id_tenant),
    INDEX idx_tenant (id_tenant),
    INDEX idx_activo (activo),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: metodos_pago (Configuración de métodos de pago)
-- ============================================

CREATE TABLE metodos_pago (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('efectivo', 'transferencia', 'tarjeta', 'mercadopago', 'otro') NOT NULL,
    descripcion TEXT,
    instrucciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    orden INT DEFAULT 0,
    configuracion JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    INDEX idx_tenant (id_tenant),
    INDEX idx_activo (activo),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: zonas_entrega (Zonas de delivery)
-- ============================================

CREATE TABLE zonas_entrega (
    id_zona INT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    costo_envio DECIMAL(10,2) NOT NULL DEFAULT 0,
    tiempo_estimado VARCHAR(50),
    codigo_postal_inicio VARCHAR(10),
    codigo_postal_fin VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    INDEX idx_tenant (id_tenant),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: auditoria (RF-12: Sistema de Auditoría)
-- ============================================

CREATE TABLE auditoria (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_tenant INT NOT NULL,
    id_usuario INT,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tabla_afectada VARCHAR(100),
    id_registro INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    resultado ENUM('exito', 'fallo') DEFAULT 'exito',
    mensaje_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_tenant (id_tenant),
    INDEX idx_usuario (id_usuario),
    INDEX idx_accion (accion),
    INDEX idx_modulo (modulo),
    INDEX idx_tabla (tabla_afectada),
    INDEX idx_resultado (resultado),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_tenant_fecha (id_tenant, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: sesiones (Sesiones activas de usuarios)
-- ============================================

CREATE TABLE sesiones (
    id_sesion VARCHAR(255) PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_tenant INT NOT NULL,
    token TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expira_en DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_tenant) REFERENCES tenants(id_tenant) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_tenant (id_tenant),
    INDEX idx_expira (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: favoritos (Productos favoritos de usuarios)
-- ============================================

CREATE TABLE favoritos (
    id_favorito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_producto (id_usuario, id_producto),
    INDEX idx_usuario (id_usuario),
    INDEX idx_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar roles
INSERT INTO roles (nombre_rol, descripcion) VALUES
('admin', 'Administrador del sistema con acceso completo'),
('empleado', 'Empleado de la empresa con permisos limitados'),
('cliente', 'Cliente de la empresa');

-- Insertar estados de pedido
INSERT INTO estados_pedido (nombre_estado, descripcion, color, orden) VALUES
('Pendiente', 'Pedido recibido, pendiente de procesamiento', '#ffc107', 1),
('En Proceso', 'Pedido en preparación', '#17a2b8', 2),
('Listo', 'Pedido listo para entrega/retiro', '#28a745', 3),
('En Camino', 'Pedido en camino al cliente', '#007bff', 4),
('Completado', 'Pedido completado y entregado', '#28a745', 5),
('Cancelado', 'Pedido cancelado', '#dc3545', 6);

-- Insertar tenant demo
INSERT INTO tenants (nombre_empresa, slug, email_empresa, plan, max_usuarios, max_productos, descripcion) VALUES
('Empresa Demo', 'demo', 'admin@demo.com', 'profesional', 50, 1000, 'Tenant de demostración para pruebas');

-- Obtener el ID del tenant demo
SET @demo_tenant_id = LAST_INSERT_ID();

-- Insertar usuario administrador para tenant demo
-- Password: admin123 (hash bcrypt)
INSERT INTO usuarios (id_tenant, id_rol, nombre, apellido, email, password) VALUES
(@demo_tenant_id, 1, 'Admin', 'Demo', 'admin@demo.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y');

-- Insertar categorías de ejemplo para tenant demo
INSERT INTO categorias (id_tenant, nombre, descripcion) VALUES
(@demo_tenant_id, 'Productos Generales', 'Categoría general para productos'),
(@demo_tenant_id, 'Servicios', 'Servicios ofrecidos por la empresa'),
(@demo_tenant_id, 'Promociones', 'Productos en promoción');

-- Insertar productos de ejemplo para tenant demo
INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock) VALUES
(@demo_tenant_id, 1, 'Producto Demo 1', 'Descripción del producto demo 1', 1500.00, 10),
(@demo_tenant_id, 1, 'Producto Demo 2', 'Descripción del producto demo 2', 2500.00, 5),
(@demo_tenant_id, 2, 'Servicio Demo', 'Descripción del servicio demo', 5000.00, 999);

-- Insertar configuraciones globales (sin tenant específico)
INSERT INTO settings (id_tenant, setting_key, setting_value, description) VALUES
(NULL, 'app_name', 'SmartPYME', 'Nombre de la aplicación'),
(NULL, 'app_version', '2.0.0', 'Versión de la aplicación'),
(NULL, 'maintenance_mode', 'false', 'Modo de mantenimiento');

-- Insertar configuraciones para tenant demo
INSERT INTO settings (id_tenant, setting_key, setting_value, description) VALUES
(@demo_tenant_id, 'company_phone', '+54 11 1234-5678', 'Teléfono de la empresa'),
(@demo_tenant_id, 'company_address', 'Av. Ejemplo 123, CABA', 'Dirección de la empresa'),
(@demo_tenant_id, 'delivery_enabled', 'true', 'Habilitar delivery'),
(@demo_tenant_id, 'pickup_enabled', 'true', 'Habilitar retiro en tienda'),
(@demo_tenant_id, 'min_order_amount', '500', 'Monto mínimo de pedido'),
(@demo_tenant_id, 'theme_color', '#007bff', 'Color principal del tema'),
(@demo_tenant_id, 'footer_text', 'Powered by SmartPYME', 'Texto del pie de página');

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de pedidos con información completa
CREATE OR REPLACE VIEW vista_pedidos_completos AS
SELECT 
    p.id_pedido,
    p.numero_pedido,
    t.nombre_empresa,
    t.slug as tenant_slug,
    u.nombre as usuario_nombre,
    u.apellido as usuario_apellido,
    u.email as usuario_email,
    e.nombre_estado,
    e.color as estado_color,
    p.total,
    p.metodo_pago,
    p.metodo_entrega,
    p.fecha_pedido,
    p.created_at,
    (SELECT COUNT(*) FROM detalle_pedidos WHERE id_pedido = p.id_pedido) as cantidad_items
FROM pedidos p
JOIN tenants t ON p.id_tenant = t.id_tenant
LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
JOIN estados_pedido e ON p.id_estado = e.id_estado;

-- Vista de productos con categoría
CREATE OR REPLACE VIEW vista_productos_completos AS
SELECT 
    p.id_producto,
    p.nombre as producto_nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.imagen,
    p.activo,
    c.nombre as categoria_nombre,
    t.nombre_empresa,
    t.slug as tenant_slug,
    p.created_at
FROM productos p
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN tenants t ON p.id_tenant = t.id_tenant;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para crear historial al crear pedido
DELIMITER $$
CREATE TRIGGER after_pedido_insert
AFTER INSERT ON pedidos
FOR EACH ROW
BEGIN
    INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas, fecha_cambio)
    VALUES (NEW.id_pedido, NEW.id_estado, NEW.id_usuario, 'Pedido creado', NEW.fecha_pedido);
END$$

-- Trigger para registrar cambios de estado
DELIMITER $$
CREATE TRIGGER after_pedido_update_estado
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF OLD.id_estado != NEW.id_estado THEN
        INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
        VALUES (NEW.id_pedido, NEW.id_estado, NEW.id_usuario, 'Cambio de estado');
    END IF;
END$$

DELIMITER ;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento para obtener estadísticas de un tenant
DELIMITER $$
CREATE PROCEDURE sp_estadisticas_tenant(IN p_tenant_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE id_tenant = p_tenant_id AND activo = 1) as usuarios_activos,
        (SELECT COUNT(*) FROM productos WHERE id_tenant = p_tenant_id AND activo = 1) as productos_activos,
        (SELECT COUNT(*) FROM categorias WHERE id_tenant = p_tenant_id AND activo = 1) as categorias_activas,
        (SELECT COUNT(*) FROM pedidos WHERE id_tenant = p_tenant_id) as total_pedidos,
        (SELECT SUM(total) FROM pedidos WHERE id_tenant = p_tenant_id AND id_estado = 5) as ventas_completadas,
        (SELECT COUNT(*) FROM pedidos WHERE id_tenant = p_tenant_id AND id_estado = 1) as pedidos_pendientes;
END$$

-- Procedimiento para limpiar sesiones expiradas
DELIMITER $$
CREATE PROCEDURE sp_limpiar_sesiones_expiradas()
BEGIN
    DELETE FROM sesiones WHERE expira_en < NOW();
    SELECT ROW_COUNT() as sesiones_eliminadas;
END$$

-- Procedimiento para obtener productos más vendidos
DELIMITER $$
CREATE PROCEDURE sp_productos_mas_vendidos(
    IN p_tenant_id INT,
    IN p_limite INT
)
BEGIN
    SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        SUM(dp.cantidad) as total_vendido,
        COUNT(DISTINCT dp.id_pedido) as numero_pedidos,
        SUM(dp.subtotal) as ingresos_totales
    FROM productos p
    INNER JOIN detalle_pedidos dp ON p.id_producto = dp.id_producto
    INNER JOIN pedidos ped ON dp.id_pedido = ped.id_pedido
    WHERE p.id_tenant = p_tenant_id
        AND ped.id_estado = 5
    GROUP BY p.id_producto, p.nombre, p.precio
    ORDER BY total_vendido DESC
    LIMIT p_limite;
END$$

-- Procedimiento para obtener ventas por período
DELIMITER $$
CREATE PROCEDURE sp_ventas_por_periodo(
    IN p_tenant_id INT,
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(fecha_pedido) as fecha,
        COUNT(*) as total_pedidos,
        SUM(total) as total_ventas,
        AVG(total) as ticket_promedio,
        SUM(CASE WHEN id_estado = 5 THEN 1 ELSE 0 END) as pedidos_completados,
        SUM(CASE WHEN id_estado = 6 THEN 1 ELSE 0 END) as pedidos_cancelados
    FROM pedidos
    WHERE id_tenant = p_tenant_id
        AND DATE(fecha_pedido) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY DATE(fecha_pedido)
    ORDER BY fecha DESC;
END$$

-- Procedimiento para actualizar stock después de pedido
DELIMITER $$
CREATE PROCEDURE sp_actualizar_stock_pedido(
    IN p_id_pedido INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id_producto INT;
    DECLARE v_cantidad INT;
    DECLARE cur CURSOR FOR 
        SELECT id_producto, cantidad 
        FROM detalle_pedidos 
        WHERE id_pedido = p_id_pedido;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_id_producto, v_cantidad;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE productos 
        SET stock = stock - v_cantidad 
        WHERE id_producto = v_id_producto;
    END LOOP;
    CLOSE cur;
    
    SELECT 'Stock actualizado correctamente' as mensaje;
END$$

-- Función para calcular descuento de cupón
DELIMITER $$
CREATE FUNCTION fn_calcular_descuento_cupon(
    p_codigo_cupon VARCHAR(50),
    p_id_tenant INT,
    p_monto_pedido DECIMAL(10,2)
) RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_descuento DECIMAL(10,2) DEFAULT 0;
    DECLARE v_tipo VARCHAR(20);
    DECLARE v_valor DECIMAL(10,2);
    DECLARE v_monto_minimo DECIMAL(10,2);
    DECLARE v_activo BOOLEAN;
    DECLARE v_fecha_actual DATETIME;
    
    SET v_fecha_actual = NOW();
    
    SELECT tipo_descuento, valor_descuento, monto_minimo, activo
    INTO v_tipo, v_valor, v_monto_minimo, v_activo
    FROM cupones
    WHERE codigo = p_codigo_cupon
        AND id_tenant = p_id_tenant
        AND fecha_inicio <= v_fecha_actual
        AND fecha_fin >= v_fecha_actual
        AND (usos_maximos IS NULL OR usos_actuales < usos_maximos)
    LIMIT 1;
    
    IF v_activo = TRUE AND p_monto_pedido >= v_monto_minimo THEN
        IF v_tipo = 'porcentaje' THEN
            SET v_descuento = (p_monto_pedido * v_valor) / 100;
        ELSE
            SET v_descuento = v_valor;
        END IF;
    END IF;
    
    RETURN v_descuento;
END$$

-- Función para verificar disponibilidad de stock
DELIMITER $$
CREATE FUNCTION fn_verificar_stock(
    p_id_producto INT,
    p_cantidad INT
) RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_stock_actual INT;
    
    SELECT stock INTO v_stock_actual
    FROM productos
    WHERE id_producto = p_id_producto;
    
    RETURN (v_stock_actual >= p_cantidad);
END$$

DELIMITER ;

-- ============================================
-- FINALIZACIÓN
-- ============================================

-- Volver a habilitar comprobación de FKs
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN DEL SCHEMA
-- ============================================

SELECT 'Schema v2.0 creado exitosamente' as mensaje;

SELECT 
    'Tablas creadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Vistas creadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.views 
WHERE table_schema = DATABASE()
UNION ALL
SELECT 
    'Procedimientos almacenados' as tipo,
    COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_schema = DATABASE() AND routine_type = 'PROCEDURE'
UNION ALL
SELECT 
    'Funciones' as tipo,
    COUNT(*) as cantidad
FROM information_schema.routines 
WHERE routine_schema = DATABASE() AND routine_type = 'FUNCTION'
UNION ALL
SELECT 
    'Triggers' as tipo,
    COUNT(*) as cantidad
FROM information_schema.triggers 
WHERE trigger_schema = DATABASE();

-- Mostrar lista de tablas
SELECT 
    table_name as 'Tabla',
    table_rows as 'Filas',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- NOTAS DE IMPLEMENTACIÓN
-- ============================================
/*
CARACTERÍSTICAS DEL SCHEMA V2.0:

✅ TABLAS PRINCIPALES (13):
- tenants: Multi-tenancy con planes y límites
- usuarios: Usuarios unificados (admin/empleado/cliente)
- productos: Catálogo de productos con stock
- categorias: Organización de productos
- pedidos: Gestión de órdenes
- detalle_pedidos: Items de cada pedido
- estados_pedido: Estados del flujo de pedidos
- historial_estados_pedido: Trazabilidad completa

✅ TABLAS ADICIONALES (7):
- cupones: Sistema de descuentos y promociones
- metodos_pago: Configuración de medios de pago
- zonas_entrega: Gestión de delivery por zonas
- notificaciones: Sistema de alertas
- password_recovery_tokens: Recuperación de contraseñas
- sesiones: Gestión de sesiones activas
- favoritos: Productos favoritos por usuario
- auditoria: Log de acciones importantes
- settings: Configuraciones por tenant

✅ VISTAS (2):
- vista_pedidos_completos: Pedidos con toda la información
- vista_productos_completos: Productos con categoría y tenant

✅ TRIGGERS (2):
- after_pedido_insert: Crea historial al crear pedido
- after_pedido_update_estado: Registra cambios de estado

✅ PROCEDIMIENTOS ALMACENADOS (5):
- sp_estadisticas_tenant: Estadísticas generales
- sp_limpiar_sesiones_expiradas: Mantenimiento de sesiones
- sp_productos_mas_vendidos: Top productos
- sp_ventas_por_periodo: Reportes de ventas
- sp_actualizar_stock_pedido: Gestión de inventario

✅ FUNCIONES (2):
- fn_calcular_descuento_cupon: Cálculo de descuentos
- fn_verificar_stock: Verificación de disponibilidad

✅ ÍNDICES OPTIMIZADOS:
- Índices en campos de búsqueda frecuente
- Índices compuestos para queries complejas
- Índices únicos para integridad de datos

✅ CARACTERÍSTICAS DE SEGURIDAD:
- Constraints de FK con CASCADE apropiados
- Campos únicos por tenant
- Auditoría de acciones
- Gestión de sesiones

✅ DATOS INICIALES:
- Roles predefinidos (admin, empleado, cliente)
- Estados de pedido con colores
- Tenant demo con datos de ejemplo
- Configuraciones por defecto

EJEMPLOS DE USO:

-- Obtener estadísticas de un tenant
CALL sp_estadisticas_tenant(1);

-- Productos más vendidos
CALL sp_productos_mas_vendidos(1, 10);

-- Ventas del último mes
CALL sp_ventas_por_periodo(1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE());

-- Calcular descuento
SELECT fn_calcular_descuento_cupon('VERANO2024', 1, 5000.00);

-- Verificar stock
SELECT fn_verificar_stock(1, 5);

-- Limpiar sesiones expiradas
CALL sp_limpiar_sesiones_expiradas();
*/
