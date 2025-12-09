# Sistema de Carritos Multi-Tenant

## 📋 Descripción

El sistema de carritos de SmartPYME ahora soporta **aislamiento por tenant**, lo que significa que cada tienda tiene su propio carrito independiente almacenado en el navegador del usuario.

## 🔑 Características Principales

### 1. Aislamiento por Tenant
- Cada tenant (tienda) tiene su propio carrito completamente separado
- El carrito se identifica por el `tenant_slug` en la URL
- Los productos de una tienda NO aparecen en el carrito de otra

### 2. Persistencia en LocalStorage
- Los carritos se guardan con claves únicas: `cart_${tenant_slug}`
- Ejemplo:
  - Carrito de "demo": `cart_demo`
  - Carrito de "electrotech-premium": `cart_electrotech-premium`
  - Carrito de "boutique-fashion-elite": `cart_boutique-fashion-elite`

### 3. Cambio Automático de Contexto
- Al navegar a `/tienda/demo`, se carga automáticamente `cart_demo`
- Al navegar a `/tienda/electrotech-premium`, se carga `cart_electrotech-premium`
- El carrito anterior se guarda automáticamente antes del cambio

## 🛠️ Implementación Técnica

### CartContext.jsx

El contexto detecta automáticamente el tenant desde la URL:

```javascript
// Extraer tenant_slug de la URL
useEffect(() => {
  const pathMatch = location.pathname.match(/\/tienda\/([^/]+)/);
  const tenantSlug = pathMatch ? pathMatch[1] : null;
  
  // Si cambió el tenant, guardar carrito anterior y cargar el nuevo
  if (tenantSlug !== currentTenant) {
    // Guardar carrito del tenant anterior
    if (currentTenant) {
      localStorage.setItem(`cart_${currentTenant}`, JSON.stringify(items));
    }
    
    // Cargar carrito del nuevo tenant
    if (tenantSlug) {
      const savedCart = localStorage.getItem(`cart_${tenantSlug}`);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      } else {
        setItems([]);
      }
    }
    
    setCurrentTenant(tenantSlug);
  }
}, [location.pathname]);
```

## 📦 Estructura de Datos en LocalStorage

Ejemplo de carritos almacenados:

```javascript
// localStorage
{
  "cart_demo": [
    {
      "id_producto": 1,
      "nombre": "Laptop HP",
      "precio": 599990,
      "quantity": 1,
      "imagen": "/uploads/laptop.jpg",
      "id_tenant": 1
    }
  ],
  
  "cart_electrotech-premium": [
    {
      "id_producto": 150,
      "nombre": "PlayStation 5",
      "precio": 599990,
      "quantity": 2,
      "imagen": "/uploads/ps5.jpg",
      "id_tenant": 7
    },
    {
      "id_producto": 151,
      "nombre": "Control DualSense",
      "precio": 69990,
      "quantity": 1,
      "imagen": "/uploads/dualsense.jpg",
      "id_tenant": 7
    }
  ],
  
  "cart_boutique-fashion-elite": [
    {
      "id_producto": 120,
      "nombre": "Vestido Elegante",
      "precio": 89990,
      "quantity": 1,
      "imagen": "/uploads/vestido.jpg",
      "id_tenant": 6
    }
  ]
}
```

## 🔄 Flujo de Usuario

### Escenario: Usuario comprando en múltiples tiendas

1. **Usuario visita ElectroTech Premium** (`/tienda/electrotech-premium`)
   - Añade PlayStation 5 al carrito
   - Carrito muestra: 1 item
   - Se guarda en `cart_electrotech-premium`

2. **Usuario navega a Boutique Fashion Elite** (`/tienda/boutique-fashion-elite`)
   - El carrito se vacía visualmente (contexto cambia)
   - Añade un vestido al carrito
   - Carrito muestra: 1 item (solo el vestido)
   - Se guarda en `cart_boutique-fashion-elite`

3. **Usuario regresa a ElectroTech Premium**
   - El carrito automáticamente vuelve a mostrar la PlayStation 5
   - Los productos están preservados

4. **Usuario hace checkout en ElectroTech Premium**
   - Se crea el pedido solo con productos de ElectroTech
   - Se limpia `cart_electrotech-premium`
   - El carrito de Boutique Fashion Elite permanece intacto

## ✅ Ventajas del Sistema

1. **Separación Total**: Productos de diferentes tiendas nunca se mezclan
2. **UX Coherente**: Cada tienda se siente como un sitio independiente
3. **Persistencia**: Los carritos sobreviven recargas de página
4. **Multi-Tenant Real**: Cada tenant es completamente independiente
5. **Escalabilidad**: Soporta infinitos tenants sin conflictos

## 🧪 Pruebas

### Caso de Prueba 1: Añadir productos en múltiples tiendas

```bash
# Paso 1: Visita tienda demo
http://localhost:5173/tienda/demo
# Añade producto "Laptop HP"
# Carrito: 1 item

# Paso 2: Visita otra tienda
http://localhost:5173/tienda/electrotech-premium
# Carrito: 0 items (diferente contexto)
# Añade producto "PlayStation 5"
# Carrito: 1 item

# Paso 3: Regresa a demo
http://localhost:5173/tienda/demo
# Carrito: 1 item (la laptop sigue ahí)

# Verificar localStorage
console.log(localStorage.getItem('cart_demo'))
// Output: [{"id_producto":1,"nombre":"Laptop HP",...}]

console.log(localStorage.getItem('cart_electrotech-premium'))
// Output: [{"id_producto":150,"nombre":"PlayStation 5",...}]
```

### Caso de Prueba 2: Checkout en un tenant no afecta otros

```bash
# Paso 1: Añade productos en tienda A y B
# Paso 2: Haz checkout en tienda A
# Paso 3: Verifica que carrito de tienda B sigue intacto
```

## 🐛 Solución de Problemas

### Problema: Carrito compartido entre tiendas
**Causa**: Versión antigua del código sin aislamiento
**Solución**: Actualizado `CartContext.jsx` con detección de tenant desde URL

### Problema: Carrito se vacía al cambiar de página
**Causa**: localStorage no sincronizado
**Solución**: Implementado guardado automático con `useEffect`

### Problema: Productos de diferentes tenants mezclados
**Causa**: Misma clave en localStorage
**Solución**: Claves únicas por tenant (`cart_${tenant_slug}`)

## 📝 Notas para Desarrolladores

- El `CartContext` usa `useLocation()` de React Router para detectar cambios de ruta
- El patrón regex `/\/tienda\/([^/]+)/` extrae el `tenant_slug` de URLs como `/tienda/demo`
- Si el usuario NO está en una ruta de tienda, el carrito se vacía (contexto null)
- Al hacer checkout, solo se envían productos del tenant actual
- La limpieza de carrito con `clearCart()` solo afecta el tenant actual

## 🚀 Futuras Mejoras

1. **Visualización Multi-Tenant**: Panel que muestre todos los carritos activos
2. **Límite de Carritos**: Limpiar carritos viejos después de X días
3. **Sincronización Backend**: Guardar carritos en DB para usuarios logueados
4. **Notificación de Stock**: Alertar si productos en carrito se agotan
5. **Carrito Compartido**: Permitir compartir link de carrito con otros usuarios

---

**Última Actualización**: 25 de noviembre de 2025
**Versión**: 1.0
**Estado**: ✅ Implementado y funcionando
