# Scripts de Datos de Prueba Multi-Tenant

Este directorio contiene scripts SQL para poblar la base de datos con datos de prueba para ambos tenants (Pastelería Dulce Sabor y MegaMarket Empresarial).

## 📋 Orden de Ejecución

Ejecuta los scripts en el siguiente orden:

### 1. `seed-multitenant-data.sql`
**Qué hace:**
- ✅ Crea usuarios según el plan de cada tenant
  - **Pastelería** (Plan Básico): 1 admin + 1 empleado + 3 clientes
  - **MegaMarket** (Plan Empresarial): 1 admin + 2 empleados + 4 clientes
- ✅ Limpia categorías genéricas existentes
- ✅ Crea categorías específicas para cada negocio:
  - **Pastelería**: 8 categorías (Tortas, Pasteles, Pan Dulce, etc.)
  - **MegaMarket**: 12 categorías (Electrónica, Ropa, Deportes, etc.)

**Credenciales creadas:**
- Todos los usuarios tienen la misma contraseña: `Admin123!` / `Empleado123!` / `Cliente123!`

### 2. `seed-productos-multitenant.sql`
**Qué hace:**
- ✅ Crea productos de ejemplo para cada categoría
  - **Pastelería**: ~33 productos (tortas, pasteles, panes, galletas, postres, bebidas)
  - **MegaMarket**: ~78 productos (electrónica, electrodomésticos, ropa, deportes, hogar, etc.)
- ✅ Asigna productos a las categorías correctas por tenant
- ✅ Configura precios y stock realistas

## 🚀 Cómo Ejecutar

### Opción 1: phpMyAdmin
1. Abre phpMyAdmin en tu navegador
2. Selecciona la base de datos `smartpyme_db`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido de `seed-multitenant-data.sql`
5. Haz clic en "Continuar" para ejecutar
6. Repite los pasos 3-5 con `seed-productos-multitenant.sql`

### Opción 2: MySQL Workbench
1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. Abre `seed-multitenant-data.sql`
4. Ejecuta el script (⚡ Execute)
5. Abre `seed-productos-multitenant.sql`
6. Ejecuta el script (⚡ Execute)

### Opción 3: Línea de Comandos
```bash
# Navega al directorio database
cd c:\Users\nicos\OneDrive\Documentos\GitHub\SmartPYME\database

# Ejecuta el primer script
mysql -u root -p smartpyme_db < seed-multitenant-data.sql

# Ejecuta el segundo script
mysql -u root -p smartpyme_db < seed-productos-multitenant.sql
```

## 📊 Datos Insertados

### Pastelería Dulce Sabor
- **Usuarios**: 5 (1 admin, 1 empleado, 3 clientes)
- **Categorías**: 8 (Tortas, Pasteles, Pan Dulce, Pan Salado, Galletas, Postres, Bocaditos, Bebidas)
- **Productos**: ~33 productos con precios entre $1,500 y $30,000 CLP

### MegaMarket Empresarial
- **Usuarios**: 7 (1 admin, 2 empleados, 4 clientes)
- **Categorías**: 12 (Electrónica, Electrodomésticos, Ropa y Moda, Deportes, Hogar y Muebles, Alimentos, Bebidas, Cuidado Personal, Juguetes, Automotriz, Mascotas, Librería)
- **Productos**: ~78 productos con precios entre $1,490 y $499,990 CLP

## 🔐 Credenciales de Acceso

### Pastelería Dulce Sabor
```
Administrador:
  Email: admin@pasteleria-dulce-sabor.com
  Password: Admin123!
  URL: http://localhost:5173/pasteleria-dulce-sabor/admin/login

Empleado:
  Email: empleado1@pasteleria-dulce-sabor.com
  Password: Empleado123!

Clientes:
  - cliente1@pasteleria-dulce-sabor.com (Ana López)
  - cliente2@pasteleria-dulce-sabor.com (Pedro Martínez)
  - cliente3@pasteleria-dulce-sabor.com (Laura Silva)
  Password: Cliente123!
```

### MegaMarket Empresarial
```
Administrador:
  Email: admin@megamarket-empresarial.com
  Password: Admin123!
  URL: http://localhost:5173/megamarket-empresarial/admin/login

Empleados:
  - empleado1@megamarket-empresarial.com (Sofía Vargas)
  - empleado2@megamarket-empresarial.com (Diego Morales)
  Password: Empleado123!

Clientes:
  - cliente1@megamarket-empresarial.com (Camila Torres)
  - cliente2@megamarket-empresarial.com (Andrés Rojas)
  - cliente3@megamarket-empresarial.com (Valentina Muñoz)
  - cliente4@megamarket-empresarial.com (Mateo Castro)
  Password: Cliente123!
```

## ✅ Verificación

Después de ejecutar los scripts, verifica que los datos se insertaron correctamente:

```sql
-- Verificar usuarios por tenant
SELECT 
    t.nombre_empresa, 
    r.nombre_rol, 
    COUNT(*) as total
FROM usuarios u
JOIN tenants t ON u.id_tenant = t.id_tenant
JOIN roles r ON u.id_rol = r.id_rol
GROUP BY t.nombre_empresa, r.nombre_rol;

-- Verificar categorías por tenant
SELECT 
    t.nombre_empresa,
    COUNT(*) as total_categorias
FROM categorias c
JOIN tenants t ON c.id_tenant = t.id_tenant
GROUP BY t.nombre_empresa;

-- Verificar productos por tenant
SELECT 
    t.nombre_empresa,
    COUNT(*) as total_productos,
    SUM(stock) as stock_total
FROM productos p
JOIN tenants t ON p.id_tenant = t.id_tenant
GROUP BY t.nombre_empresa;
```

## 🧹 Limpieza (Opcional)

Si necesitas eliminar los datos de prueba y empezar de nuevo:

```sql
-- Eliminar productos
DELETE FROM productos WHERE id_tenant IN (
  SELECT id_tenant FROM tenants 
  WHERE slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
);

-- Eliminar categorías
DELETE FROM categorias WHERE id_tenant IN (
  SELECT id_tenant FROM tenants 
  WHERE slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
);

-- Eliminar usuarios (excepto los originales)
DELETE FROM usuarios WHERE id_tenant IN (
  SELECT id_tenant FROM tenants 
  WHERE slug IN ('pasteleria-dulce-sabor', 'megamarket-empresarial')
) AND email NOT IN ('admin@pasteleria-dulce-sabor.com', 'admin@megamarket-empresarial.com');
```

## 📝 Notas Importantes

1. **Aislamiento Multi-Tenant**: Todos los datos están correctamente aislados por `id_tenant`
2. **Límites de Plan**: El Plan Básico (Pastelería) está al límite con 2 usuarios activos (admin + empleado)
3. **Stock Realista**: Los productos tienen stock variado para simular un inventario real
4. **Precios en CLP**: Todos los precios están en pesos chilenos
5. **Imágenes**: Las imágenes de productos están en NULL, se pueden agregar posteriormente

## 🎯 Casos de Uso

Con estos datos puedes probar:
- ✅ Login multi-tenant con diferentes usuarios
- ✅ Navegación por categorías específicas de cada negocio
- ✅ Búsqueda de productos por nombre, descripción o categoría
- ✅ Gestión de inventario con diferentes niveles de stock
- ✅ Limitaciones de plan (intentar crear un 3er usuario en Pastelería)
- ✅ Aislamiento de datos (verificar que cada tenant solo ve sus productos)
- ✅ Modo oscuro en el panel administrativo
- ✅ Sistema de pedidos con productos reales

## 🐛 Solución de Problemas

**Error: "Unknown column 'id_tenant'"**
- Verifica que ejecutaste primero el `schema.sql` con todas las tablas

**Error: "Duplicate entry"**
- Ejecuta el script de limpieza primero o revisa si ya existen los datos

**No se ven los productos en la tienda**
- Verifica que ejecutaste ambos scripts en orden
- Revisa que el filtro `activo = 1` esté funcionando
- Confirma que el `id_tenant` coincide entre productos y categorías
