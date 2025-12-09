# SmartPYME - Schema Database v2.0

## 📋 Descripción

Schema completo y optimizado para el sistema SmartPYME, una plataforma multi-tenant de gestión para PYMEs que incluye:
- Gestión de productos y categorías
- Sistema de pedidos y ventas
- Multi-tenancy con planes y límites
- Sistema de cupones y descuentos
- Gestión de zonas de entrega
- Auditoría y trazabilidad completa

## 🗄️ Estructura de la Base de Datos

### Tablas Principales (13)

| Tabla | Descripción | Registros Iniciales |
|-------|-------------|---------------------|
| `tenants` | Empresas/clientes del sistema | 1 (demo) |
| `roles` | Roles de usuario | 3 |
| `usuarios` | Usuarios del sistema (admin/empleado/cliente) | 1 (admin demo) |
| `clientes` | Tabla legacy (deprecada) | 0 |
| `categorias` | Categorías de productos | 3 |
| `productos` | Catálogo de productos | 3 |
| `estados_pedido` | Estados del flujo de pedidos | 6 |
| `pedidos` | Órdenes de compra | 0 |
| `detalle_pedidos` | Items de cada pedido | 0 |
| `historial_estados_pedido` | Trazabilidad de cambios | 0 |
| `notificaciones` | Sistema de alertas | 0 |
| `password_recovery_tokens` | Tokens de recuperación | 0 |
| `settings` | Configuraciones por tenant | 10 |

### Tablas Adicionales (6)

| Tabla | Descripción | Uso |
|-------|-------------|-----|
| `cupones` | Descuentos y promociones | Sistema de cupones |
| `metodos_pago` | Medios de pago disponibles | Configuración de pagos |
| `zonas_entrega` | Zonas de delivery | Gestión de envíos |
| `auditoria` | Log de acciones | Trazabilidad y seguridad |
| `sesiones` | Sesiones activas | Gestión de autenticación |
| `favoritos` | Productos favoritos | Wishlist de usuarios |

## 🔧 Componentes Avanzados

### Vistas (2)

- **`vista_pedidos_completos`**: Pedidos con información completa de tenant, usuario y estado
- **`vista_productos_completos`**: Productos con categoría y datos del tenant

### Triggers (2)

- **`after_pedido_insert`**: Crea automáticamente el historial al crear un pedido
- **`after_pedido_update_estado`**: Registra cambios de estado en el historial

### Procedimientos Almacenados (5)

```sql
-- Estadísticas generales de un tenant
CALL sp_estadisticas_tenant(1);

-- Top 10 productos más vendidos
CALL sp_productos_mas_vendidos(1, 10);

-- Ventas del último mes
CALL sp_ventas_por_periodo(1, '2024-01-01', '2024-01-31');

-- Actualizar stock después de un pedido
CALL sp_actualizar_stock_pedido(123);

-- Limpiar sesiones expiradas (mantenimiento)
CALL sp_limpiar_sesiones_expiradas();
```

### Funciones (2)

```sql
-- Calcular descuento de un cupón
SELECT fn_calcular_descuento_cupon('VERANO2024', 1, 5000.00);

-- Verificar disponibilidad de stock
SELECT fn_verificar_stock(1, 5);
```

## 🚀 Instalación

### Opción 1: Desde MySQL Workbench
1. Abrir MySQL Workbench
2. Conectarse a la base de datos
3. Abrir el archivo `schema2.sql`
4. Ejecutar el script completo

### Opción 2: Desde línea de comandos
```bash
mysql -u root -p smartpyme_db < schema2.sql
```

### Opción 3: Desde Node.js
```javascript
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'your_password',
        database: 'smartpyme_db',
        multipleStatements: true
    });
    
    const schema = fs.readFileSync('./schema2.sql', 'utf8');
    await connection.query(schema);
    console.log('✅ Schema creado exitosamente');
    await connection.end();
}

runSchema();
```

## 📊 Características del Multi-Tenancy

Cada tenant tiene:
- **Aislamiento completo** de datos
- **Planes configurables**: básico, profesional, empresarial
- **Límites personalizables**:
  - Usuarios máximos
  - Productos máximos
- **Configuraciones independientes**
- **Datos de ejemplo** para el tenant demo

## 🔐 Seguridad

- ✅ Constraints de Foreign Keys con CASCADE apropiados
- ✅ Campos únicos por tenant para evitar duplicados
- ✅ Sistema de auditoría para acciones críticas
- ✅ Gestión de sesiones con expiración
- ✅ Tokens de recuperación de contraseña
- ✅ Passwords hasheados con bcrypt

## 📈 Optimizaciones

### Índices Implementados

- **Búsquedas frecuentes**: email, slug, nombre
- **Filtros comunes**: activo, tenant_id, fecha
- **Joins optimizados**: FK con índices
- **Ordenamiento**: created_at DESC, orden

### Rendimiento

- Motor InnoDB para transacciones ACID
- Charset UTF8MB4 para soporte completo de Unicode
- Índices compuestos para queries complejas
- Vistas para queries frecuentes

## 🎯 Datos Iniciales

### Roles
- `admin`: Acceso completo al sistema
- `empleado`: Permisos limitados
- `cliente`: Solo visualización y compras

### Estados de Pedido
1. Pendiente (amarillo)
2. En Proceso (cyan)
3. Listo (verde)
4. En Camino (azul)
5. Completado (verde)
6. Cancelado (rojo)

### Tenant Demo
- **Empresa**: Empresa Demo
- **Slug**: demo
- **Plan**: Profesional
- **Límites**: 50 usuarios, 1000 productos
- **Admin**: admin@demo.com / admin123

## 🔄 Migraciones

Si ya tienes el schema v1.0:

```sql
-- Backup de la base actual
mysqldump -u root -p smartpyme_db > backup_v1.sql

-- Crear nueva base para v2.0
CREATE DATABASE smartpyme_db_v2;

-- Ejecutar schema2.sql en la nueva base
mysql -u root -p smartpyme_db_v2 < schema2.sql

-- Migrar datos (si es necesario)
-- Crear scripts de migración personalizados
```

## 📝 Mantenimiento

### Tareas Recomendadas

```sql
-- Limpiar sesiones expiradas (diario)
CALL sp_limpiar_sesiones_expiradas();

-- Optimizar tablas (semanal)
OPTIMIZE TABLE pedidos, detalle_pedidos, productos;

-- Analizar índices (mensual)
ANALYZE TABLE pedidos, productos, usuarios;

-- Backup (diario)
mysqldump -u root -p smartpyme_db > backup_$(date +%Y%m%d).sql
```

## 🐛 Troubleshooting

### Error: Table already exists
```sql
-- Eliminar todas las tablas primero
SET FOREIGN_KEY_CHECKS = 0;
-- Ejecutar DROP TABLE para cada tabla
SET FOREIGN_KEY_CHECKS = 1;
```

### Error: Cannot create trigger
```sql
-- Verificar permisos
GRANT TRIGGER ON smartpyme_db.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: Function already exists
```sql
-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS fn_calcular_descuento_cupon;
DROP FUNCTION IF EXISTS fn_verificar_stock;
```

## 📚 Documentación Adicional

- [Guía de API](../backend/README.md)
- [Modelos de Datos](../backend/models/README.md)
- [Testing](../backend/tests/README.md)

## 🤝 Contribución

Para proponer cambios al schema:
1. Crear un archivo de migración en `database/migrations/`
2. Documentar los cambios en este README
3. Actualizar la versión del schema
4. Probar en ambiente de desarrollo

## 📄 Licencia

Este schema es parte del proyecto SmartPYME.

---

**Versión**: 2.0.0  
**Última actualización**: 2024-11-27  
**Compatibilidad**: MySQL 8.0+
