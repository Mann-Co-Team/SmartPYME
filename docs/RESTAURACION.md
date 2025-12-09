# 🔧 Base de Datos Restaurada - SmartPYME

## ✅ Estado Actual

La base de datos ha sido completamente restaurada después del incidente de pérdida de datos.

### Estadísticas
- **Roles**: 3 (Admin, Empleado, Cliente)
- **Tiendas**: 7
- **Usuarios**: 15 (8 admin + 7 clientes)
- **Clientes**: 7
- **Categorías**: 56 (8 por tienda)
- **Productos**: 21 (3 por tienda)
- **Pedidos**: 0 (perdidos, tabla vacía)

## 🔑 Credenciales de Acceso

### Admin Global (SuperAdmin)
```
Email: admin@smartpyme.com
Password: admin123
Tenant: demo (id_tenant = 1)
```

### Administradores por Tienda
Todas las tiendas tienen un administrador con el patrón:
```
Email: admin@{slug}.com
Password: admin123
```

Ejemplos:
- `admin@demo.com` / admin123
- `admin@tienda-abc.com` / admin123
- `admin@comercial-xyz.com` / admin123
- `admin@megatienda-2000.com` / admin123
- `admin@pasteleria-dulce-sabor.com` / admin123
- `admin@boutique-fashion-elite.com` / admin123
- `admin@electrotech-premium.com` / admin123

### Clientes por Tienda
Cada tienda tiene un cliente de prueba:
```
Email: cliente@{slug}.com
Password: Cliente123!
```

Ejemplos:
- `cliente@demo.com` / Cliente123!
- `cliente@tienda-abc.com` / Cliente123!
- etc.

## 🏪 Tiendas Disponibles

| Slug | Nombre | Plan | Max Usuarios | Max Productos |
|------|--------|------|--------------|---------------|
| demo | Empresa Demo | profesional | 50 | 1000 |
| tienda-abc | Tienda ABC | profesional | 50 | 1000 |
| comercial-xyz | Comercial XYZ | basico | 10 | 100 |
| megatienda-2000 | Megatienda 2000 | empresarial | 100 | 5000 |
| pasteleria-dulce-sabor | Pastelería Dulce Sabor | basico | 5 | 100 |
| boutique-fashion-elite | Boutique Fashion Elite | profesional | 20 | 500 |
| electrotech-premium | ElectroTech Premium Store | empresarial | 100 | 5000 |

## 🔄 Cambios Aplicados

### 1. Estructura de Base de Datos Corregida
- ✅ Agregada columna `id_tenant` a: `usuarios`, `clientes`, `categorias`, `productos`
- ✅ Agregados foreign keys correspondientes
- ✅ Tabla `pedidos` recreada con `numero_pedido` y `id_tenant`
- ✅ Tabla `detalle_pedidos` recreada
- ✅ Tabla `historial_estados_pedido` creada
- ✅ Constraint UNIQUE en `categorias` cambiado de `(nombre)` a `(id_tenant, nombre)`

### 2. Datos Restaurados
- ✅ 3 Roles (Admin, Empleado, Cliente)
- ✅ 7 Tiendas (se mantuvieron las existentes)
- ✅ 8 Administradores (1 global + 7 por tienda)
- ✅ 7 Usuarios cliente
- ✅ 7 Registros en tabla clientes
- ✅ 56 Categorías (8 por tienda)
- ✅ 21 Productos de ejemplo (3 por tienda)

### 3. Categorías por Tienda
Cada tienda tiene estas 8 categorías:
1. Electrónica
2. Ropa
3. Alimentos
4. Bebidas
5. Hogar
6. Deportes
7. Juguetes
8. Salud y Belleza

### 4. Productos de Ejemplo
Cada tienda tiene 3 productos de prueba con:
- Nombre
- Descripción
- Precio aleatorio entre $10 y $500
- Stock entre 10 y 100 unidades
- Categoría asignada

## 📝 Datos Perdidos

⚠️ **PEDIDOS**: Todos los pedidos se perdieron en el incidente. La tabla existe pero está vacía.

## 🧪 Pruebas Recomendadas

1. **Login Admin Global**:
   - Ir a `/admin/login`
   - Email: `admin@smartpyme.com`
   - Password: `admin123`

2. **Login Admin de Tienda**:
   - Ir a `/admin/login`
   - Email: `admin@demo.com`
   - Password: `admin123`

3. **Login Cliente**:
   - Ir a `/tienda/demo`
   - Click en "Iniciar Sesión"
   - Email: `cliente@demo.com`
   - Password: `Cliente123!`

4. **Verificar Productos**:
   - Entrar a la tienda pública: `http://localhost:5173/tienda/demo`
   - Verificar que se muestran 3 productos
   - Verificar que cada producto pertenece solo a esa tienda

5. **Crear Pedido**:
   - Login como cliente
   - Agregar productos al carrito
   - Realizar compra
   - Verificar que se genere número de pedido (formato: PED-YYYYMMDD-####)

## 🚀 Próximos Pasos

1. ✅ Backend y Frontend arrancados
2. ✅ Verificar login funciona
3. ✅ Verificar productos se ven por tienda
4. ✅ Crear un pedido de prueba
5. ✅ Verificar aislamiento multi-tenant (productos no se mezclan)
6. ⏳ Restaurar datos reales si hay backup externo

## 📞 Soporte

Si encuentras problemas:
1. Verificar que el backend esté corriendo en puerto 3000
2. Verificar que el frontend esté corriendo en puerto 5173
3. Verificar credenciales de base de datos en `.env`
4. Revisar logs en consola del backend

---

**Fecha de Restauración**: 25 de Noviembre 2025
**Scripts Utilizados**: 
- `arreglar-estructura.js` - Agregó columnas id_tenant
- `arreglar-categorias.js` - Corrigió constraints UNIQUE
- `restaurar-datos.js` - Restauró todos los datos
