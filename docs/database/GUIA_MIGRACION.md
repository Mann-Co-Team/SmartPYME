# 🔄 Guía de Migración: Schema V1 → V2

## ⚠️ IMPORTANTE: Lee esto primero

**NO ejecutes `schema2.sql` directamente** en tu base de datos actual. Ese archivo está diseñado para crear una base de datos desde cero y **eliminará todos tus datos**.

En su lugar, usa el archivo `migration_v1_to_v2.sql` que preserva todos tus datos.

---

## 📋 Pasos para Migrar (Opción Recomendada)

### 1️⃣ Hacer Backup (OBLIGATORIO)

Antes de cualquier migración, **siempre haz un backup**:

#### Desde MySQL Workbench:
1. Abrir MySQL Workbench
2. Conectarse a tu servidor
3. Ir a **Server** → **Data Export**
4. Seleccionar tu base de datos `smartpyme_db`
5. Seleccionar **Export to Self-Contained File**
6. Elegir ubicación: `C:\backups\smartpyme_backup_YYYYMMDD.sql`
7. Click en **Start Export**

#### Desde línea de comandos:
```bash
# Windows PowerShell
mysqldump -u root -p smartpyme_db > C:\backups\smartpyme_backup_20241127.sql
```

### 2️⃣ Ejecutar el Script de Migración

#### Opción A: Desde MySQL Workbench (Recomendado)
1. Abrir MySQL Workbench
2. Conectarse a tu base de datos
3. Abrir el archivo `migration_v1_to_v2.sql`
4. **Revisar el script** (opcional pero recomendado)
5. Click en el botón ⚡ **Execute** (o presionar Ctrl+Shift+Enter)
6. Esperar a que termine (puede tomar 1-2 minutos)
7. Verificar que aparezca "✅ Migración completada exitosamente"

#### Opción B: Desde línea de comandos
```bash
# Windows PowerShell
mysql -u root -p smartpyme_db < database/migration_v1_to_v2.sql
```

### 3️⃣ Verificar la Migración

El script mostrará automáticamente:
- ✅ Cantidad de tablas, vistas, procedimientos, funciones y triggers
- ✅ Cantidad de registros en cada tabla principal
- ✅ Confirmación de que los datos fueron preservados

También puedes verificar manualmente:

```sql
-- Ver todas las tablas
SHOW TABLES;

-- Verificar que tus datos siguen ahí
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM pedidos;

-- Verificar nuevas tablas
SELECT COUNT(*) FROM cupones;
SELECT COUNT(*) FROM metodos_pago;
SELECT COUNT(*) FROM zonas_entrega;

-- Probar un procedimiento
CALL sp_estadisticas_tenant(1);
```

---

## 🆕 Si Quieres Crear una Base de Datos Nueva (Desde Cero)

Si prefieres crear una base de datos completamente nueva con el schema v2:

### 1️⃣ Crear nueva base de datos

```sql
CREATE DATABASE smartpyme_db_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartpyme_db_v2;
```

### 2️⃣ Ejecutar schema2.sql

```bash
mysql -u root -p smartpyme_db_v2 < database/schema2.sql
```

### 3️⃣ Migrar datos de la base antigua (opcional)

Si quieres copiar datos de tu base antigua a la nueva:

```sql
-- Copiar tenants
INSERT INTO smartpyme_db_v2.tenants 
SELECT * FROM smartpyme_db.tenants;

-- Copiar usuarios
INSERT INTO smartpyme_db_v2.usuarios 
SELECT * FROM smartpyme_db.usuarios;

-- Copiar productos
INSERT INTO smartpyme_db_v2.productos 
SELECT * FROM smartpyme_db.productos;

-- Y así sucesivamente...
```

---

## 🔍 Qué Hace el Script de Migración

### ✅ Cambios que Aplica:

1. **Crea 6 tablas nuevas:**
   - `cupones` - Sistema de descuentos
   - `metodos_pago` - Medios de pago
   - `zonas_entrega` - Zonas de delivery
   - `auditoria` - Log de acciones
   - `sesiones` - Gestión de sesiones
   - `favoritos` - Productos favoritos

2. **Agrega columnas a tablas existentes:**
   - `estados_pedido`: color, orden
   - `pedidos`: metodo_entrega, direccion_entrega, telefono_contacto
   - `tenants`: descripcion, whatsapp, instagram, facebook
   - `detalle_pedidos`: notas

3. **Crea 2 vistas:**
   - `vista_pedidos_completos`
   - `vista_productos_completos`

4. **Crea 2 triggers:**
   - `after_pedido_insert`
   - `after_pedido_update_estado`

5. **Crea 5 procedimientos almacenados:**
   - `sp_estadisticas_tenant`
   - `sp_limpiar_sesiones_expiradas`
   - `sp_productos_mas_vendidos`
   - `sp_ventas_por_periodo`
   - `sp_actualizar_stock_pedido`

6. **Crea 2 funciones:**
   - `fn_calcular_descuento_cupon`
   - `fn_verificar_stock`

### ✅ Datos que Preserva:

- ✅ Todos los tenants
- ✅ Todos los usuarios
- ✅ Todos los productos
- ✅ Todas las categorías
- ✅ Todos los pedidos
- ✅ Todos los detalles de pedidos
- ✅ Todo el historial de estados
- ✅ Todas las notificaciones
- ✅ Todas las configuraciones

---

## 🚨 Solución de Problemas

### Error: "Table already exists"
**Solución:** El script usa `CREATE TABLE IF NOT EXISTS`, así que esto no debería pasar. Si ocurre, verifica que estás ejecutando `migration_v1_to_v2.sql` y no `schema2.sql`.

### Error: "Cannot add foreign key constraint"
**Solución:** 
1. Verifica que la tabla `tenants` exista
2. Ejecuta: `SET FOREIGN_KEY_CHECKS = 0;` antes del script
3. Ejecuta: `SET FOREIGN_KEY_CHECKS = 1;` después del script

### Error: "Function already exists"
**Solución:** El script elimina las funciones antes de crearlas. Si persiste:
```sql
DROP FUNCTION IF EXISTS fn_calcular_descuento_cupon;
DROP FUNCTION IF EXISTS fn_verificar_stock;
```

### Error: "Trigger already exists"
**Solución:** El script elimina los triggers antes de crearlos. Si persiste:
```sql
DROP TRIGGER IF EXISTS after_pedido_insert;
DROP TRIGGER IF EXISTS after_pedido_update_estado;
```

---

## 🔄 Rollback (Restaurar Backup)

Si algo sale mal, puedes restaurar tu backup:

### Desde MySQL Workbench:
1. **Server** → **Data Import**
2. Seleccionar **Import from Self-Contained File**
3. Elegir tu archivo de backup
4. Click en **Start Import**

### Desde línea de comandos:
```bash
# Primero eliminar la base actual
mysql -u root -p -e "DROP DATABASE smartpyme_db; CREATE DATABASE smartpyme_db;"

# Restaurar el backup
mysql -u root -p smartpyme_db < C:\backups\smartpyme_backup_20241127.sql
```

---

## ✅ Checklist de Migración

- [ ] Hacer backup de la base de datos
- [ ] Verificar que el backup se creó correctamente
- [ ] Cerrar la aplicación (backend y frontend)
- [ ] Ejecutar `migration_v1_to_v2.sql`
- [ ] Verificar que aparece "✅ Migración completada"
- [ ] Verificar cantidad de registros en tablas principales
- [ ] Probar un procedimiento almacenado
- [ ] Reiniciar la aplicación
- [ ] Probar funcionalidades principales
- [ ] Guardar el backup en un lugar seguro

---

## 📞 Soporte

Si tienes problemas durante la migración:

1. **NO entres en pánico** - tienes un backup
2. Revisa la sección de "Solución de Problemas"
3. Verifica los logs de MySQL
4. Si es necesario, restaura el backup

---

## 🎯 Resumen

| Acción | Archivo a Usar | ¿Pierde Datos? |
|--------|----------------|----------------|
| **Migrar base existente** | `migration_v1_to_v2.sql` | ❌ NO |
| **Crear base nueva** | `schema2.sql` | ⚠️ N/A (base nueva) |
| **Ejecutar en base con datos** | `schema2.sql` | ⚠️ SÍ (DROP TABLES) |

**Recomendación:** Usa `migration_v1_to_v2.sql` para tu base de datos actual.
