-- Deshabilitar comprobación de FKs
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

-- Volver a habilitar comprobación de FKs
SET FOREIGN_KEY_CHECKS = 1;

-- Crear tabla de roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios (empleados/admin)
CREATE TABLE usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Crear tabla de clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de categorías
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

-- Crear tabla de estados de pedidos
CREATE TABLE estados_pedido (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_usuario INT, -- Usuario que procesó el pedido
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_estado INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_estado) REFERENCES estados_pedido(id_estado)
);

-- Crear tabla de detalle de pedidos
CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Insertar datos iniciales
INSERT INTO roles (nombre_rol, descripcion) VALUES
('admin', 'Administrador del sistema'),
('empleado', 'Empleado de la empresa'),
('cliente', 'Cliente de la empresa');

INSERT INTO estados_pedido (nombre_estado, descripcion) VALUES
('Pendiente', 'Pedido recibido, pendiente de procesamiento'),
('En Proceso', 'Pedido en preparación'),
('Completado', 'Pedido completado y entregado'),
('Cancelado', 'Pedido cancelado');

-- Insertar usuario administrador por defecto
INSERT INTO usuarios (id_rol, nombre, apellido, email, password) VALUES
(1, 'Admin', 'Sistema', 'admin@smartpyme.com', '$2a$10$Nkl.YfYP3Lol7YfJV.UYiOr4XKKI4DpAFh5.lKBPmJH8QfIQIUE1y'); -- password: admin123

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
('Productos Generales', 'Categoría general para productos'),
('Servicios', 'Servicios ofrecidos por la empresa');

-- Tabla de configuraciones/ajustes
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Añadir campo imagen a categorías (si no existe)
ALTER TABLE categorias ADD COLUMN imagen VARCHAR(500) AFTER descripcion;

-- Insertar configuraciones por defecto
INSERT INTO settings (setting_key, setting_value, description) VALUES
('company_name', 'Mi Empresa', 'Nombre de la empresa'),
('theme_color', '#007bff', 'Color principal del tema'),
('footer_text', 'Powered by SmartPYME', 'Texto del pie de página'),
('company_phone', '', 'Teléfono de la empresa'),
('company_email', '', 'Email de la empresa'),
('company_address', '', 'Dirección de la empresa'),
('delivery_enabled', 'true', 'Habilitar delivery'),
('pickup_enabled', 'true', 'Habilitar retiro en tienda'),
('min_order_amount', '0', 'Monto mínimo de pedido');
