# 🧪 Guía de Pruebas Manuales - SmartPYME

**Fecha**: 25 de Noviembre, 2025  
**Versión**: 3.0  
**Estado**: Pruebas requeridas

---

## 🎯 Objetivo

Verificar que todas las funcionalidades del sistema funcionan correctamente tanto para usuarios invitados como para usuarios registrados.

---

## 🚀 Preparación

### 1. Verificar Servidores
```bash
# Backend
cd backend
npm run dev
# Debe estar en: http://localhost:3000

# Frontend
cd frontend
npm run dev
# Debe estar en: http://localhost:5173
```

### 2. Verificar Datos
```bash
cd backend
node test-datos.js
```

**Resultado esperado**:
- ✅ 7 tenants activos
- ✅ Productos en cada tenant
- ✅ Endpoint público funcionando

---

## 🧪 PRUEBAS PARA USUARIO INVITADO (Sin Login)

### Prueba 1: Página de Prueba del Carrito
**URL**: http://localhost:5173/test-carrito

**Pasos**:
1. Abrir la URL
2. Verificar que se cargan 5 productos
3. Hacer clic en "Agregar al Carrito" en varios productos
4. Verificar que el panel derecho muestra los items
5. Verificar que el total se calcula correctamente
6. Hacer clic en "Eliminar" en un producto
7. Hacer clic en "Abrir CartSidebar"

**Resultado Esperado**:
- ✅ Productos se cargan desde la API
- ✅ Al agregar, aparecen en el panel derecho
- ✅ Contador de items se actualiza
- ✅ Total se calcula correctamente
- ✅ Eliminar funciona
- ✅ CartSidebar se abre desde la derecha

---

### Prueba 2: HomePage Principal
**URL**: http://localhost:5173

**Pasos**:
1. Abrir la URL
2. Scroll hasta la sección de productos (si existe)
3. Buscar botón "Agregar al carrito"
4. Hacer clic en el ícono del carrito en la navbar
5. Verificar que el CartSidebar se abre

**Resultado Esperado**:
- ✅ HomePage carga correctamente
- ✅ Modo oscuro funciona (toggle en navbar)
- ✅ Hero section con imagen de fondo visible
- ✅ Footer distinguido en dark mode

**Nota**: HomePage NO tiene catálogo de productos (es landing page)

---

### Prueba 3: Tienda Demo - Plan Profesional
**URL**: http://localhost:5173/tienda/demo

**Pasos**:
1. Abrir la URL
2. Verificar que se cargan productos
3. Hacer clic en "Agregar al carrito" en varios productos
4. Hacer clic en el ícono del carrito (arriba derecha)
5. Verificar CartSidebar
6. Intentar hacer clic en "Proceder al pago"

**Resultado Esperado**:
- ✅ Página carga con estilo profesional
- ✅ Productos se muestran en grid
- ✅ Cada producto tiene botón "Agregar al carrito"
- ✅ Al agregar, muestra toast de confirmación
- ✅ Contador del carrito en navbar se actualiza
- ✅ CartSidebar muestra productos agregados
- ✅ "Proceder al pago" redirige a /checkout
- ❌ **ESPERADO**: Checkout pide login si no estás autenticado

---

### Prueba 4: Tienda - Plan Básico
**URL**: http://localhost:5173/tienda/comercial-xyz

**Pasos**:
1. Abrir la URL
2. Verificar diseño básico
3. Agregar productos al carrito
4. Verificar funcionamiento del carrito

**Resultado Esperado**:
- ✅ Página carga con diseño básico
- ✅ Productos visibles
- ✅ Carrito funciona igual

---

### Prueba 5: Tienda - Plan Empresarial
**URL**: http://localhost:5173/tienda/megatienda-2000

**Pasos**:
1. Abrir la URL
2. Verificar diseño premium
3. Agregar productos al carrito
4. Verificar características avanzadas

**Resultado Esperado**:
- ✅ Página carga con diseño premium
- ✅ Animaciones y efectos visuales
- ✅ Carrito funciona correctamente

---

### Prueba 6: Intentar Hacer Checkout Sin Login
**URL**: http://localhost:5173/checkout

**Pasos**:
1. Agregar productos al carrito (desde cualquier tienda)
2. Ir a /checkout
3. Verificar qué pasa

**Resultado Esperado**:
- ❌ Debe mostrar mensaje "Debe iniciar sesión"
- ❌ Debe redirigir a /login
- ✅ Productos siguen en el carrito (localStorage)

---

## 👤 PRUEBAS PARA USUARIO REGISTRADO (Con Login)

### Setup: Crear Usuario Cliente

**Opción 1: Registrarse desde el frontend**
1. Ir a: http://localhost:5173/registro
2. Completar formulario:
   - Nombre: Test
   - Apellido: Cliente
   - Email: test@cliente.com
   - Password: Test123!
   - Teléfono: 123456789
   - Tenant: demo

**Opción 2: Registrarse desde una tienda**
1. Ir a: http://localhost:5173/tienda/demo
2. Buscar botón "Registrarse" o "Login"
3. Crear cuenta

---

### Prueba 7: Login de Cliente
**URL**: http://localhost:5173/login

**Pasos**:
1. Ingresar credenciales:
   - Email: test@cliente.com
   - Password: Test123!
   - Tenant: demo
2. Hacer clic en "Iniciar Sesión"

**Resultado Esperado**:
- ✅ Login exitoso
- ✅ Token guardado en localStorage
- ✅ Redirige a página principal o perfil
- ✅ Navbar muestra nombre de usuario

---

### Prueba 8: Agregar Productos Autenticado
**URL**: http://localhost:5173/tienda/demo

**Pasos**:
1. Estando logueado, agregar productos al carrito
2. Abrir CartSidebar
3. Hacer clic en "Proceder al pago"

**Resultado Esperado**:
- ✅ Productos se agregan normalmente
- ✅ CartSidebar funciona
- ✅ "Proceder al pago" redirige a /checkout (sin pedir login)

---

### Prueba 9: Checkout Completo (Usuario Autenticado)
**URL**: http://localhost:5173/checkout

**Pasos**:
1. Verificar que hay productos en el carrito
2. Seleccionar "Retiro en Tienda"
3. Seleccionar método de pago "Efectivo"
4. Agregar notas: "Prueba de pedido"
5. Hacer clic en "Confirmar Pedido"
6. Esperar respuesta

**Resultado Esperado**:
- ✅ Formulario se muestra completo
- ✅ Resumen del pedido visible en panel derecho
- ✅ Al confirmar, muestra loading
- ✅ Si hay stock: 
  - Toast verde "¡Pedido creado exitosamente! Número: PED-XXXX"
  - Carrito se vacía
  - Redirige a /pedidos
- ❌ Si no hay stock:
  - Toast rojo con detalle de productos sin stock
  - Carrito NO se vacía
  - Permite ajustar cantidades

---

### Prueba 10: Checkout con Delivery
**URL**: http://localhost:5173/checkout

**Pasos**:
1. Agregar productos al carrito
2. Seleccionar "Delivery"
3. Ingresar dirección: "Calle Falsa 123, Santiago"
4. Seleccionar método de pago "Tarjeta"
5. Confirmar pedido

**Resultado Esperado**:
- ✅ Campo de dirección aparece al seleccionar Delivery
- ✅ Campo de dirección es obligatorio
- ✅ Pedido se crea con dirección

---

### Prueba 11: Ver Mis Pedidos
**URL**: http://localhost:5173/pedidos

**Pasos**:
1. Después de crear un pedido, ir a /pedidos
2. Verificar que aparece el pedido recién creado
3. Hacer clic en "Ver detalle"

**Resultado Esperado**:
- ✅ Lista de pedidos del usuario
- ✅ Muestra número de pedido, fecha, total, estado
- ✅ Detalle muestra productos, cantidades, precios

---

### Prueba 12: Validación de Stock
**URL**: http://localhost:5173/checkout

**Setup**:
1. Desde el admin, reducir stock de un producto a 2 unidades
2. Como cliente, agregar 5 unidades de ese producto al carrito
3. Intentar confirmar pedido

**Resultado Esperado**:
- ❌ Error HTTP 400
- ❌ Toast: "Stock insuficiente para: [Producto]: solicitado 5, disponible 2"
- ✅ Pedido NO se crea
- ✅ Stock NO se modifica
- ✅ Carrito sigue con los productos

---

## 🔧 PRUEBAS TÉCNICAS

### Prueba 13: Persistencia del Carrito
**Pasos**:
1. Agregar productos al carrito
2. Cerrar el navegador completamente
3. Abrir nuevamente http://localhost:5173/tienda/demo
4. Abrir CartSidebar

**Resultado Esperado**:
- ✅ Productos siguen en el carrito (localStorage)

---

### Prueba 14: Transacción de Base de Datos
**Pasos**:
1. Anotar stock inicial de un producto (desde admin o DB)
2. Como cliente, crear pedido con ese producto (cantidad 2)
3. Verificar stock después del pedido

**Resultado Esperado**:
- ✅ Stock nuevo = Stock inicial - 2
- ✅ Pedido creado en tabla `pedidos`
- ✅ Detalle en tabla `detalle_pedidos`

**Verificar en base de datos**:
```sql
-- Ver stock actual
SELECT nombre, stock FROM productos WHERE id_producto = X;

-- Ver pedido creado
SELECT * FROM pedidos ORDER BY fecha_pedido DESC LIMIT 1;

-- Ver detalle del pedido
SELECT * FROM detalle_pedidos WHERE id_pedido = X;
```

---

### Prueba 15: Notificaciones (Backend)
**Pasos**:
1. Como cliente, crear un pedido
2. Revisar consola del backend

**Resultado Esperado (en consola backend)**:
```
📦 Creando pedido con datos: {...}
✅ Notificaciones enviadas para pedido #PED-XXXX
```

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema 1: No se ven productos en TiendaHome
**Síntoma**: Página carga pero no muestra productos

**Verificar**:
1. Consola del navegador (F12) - buscar errores
2. Pestaña Network - verificar request a `/api/catalogo/:slug/productos`
3. Backend - verificar que está corriendo

**Solución**:
```bash
# Reiniciar backend
cd backend
npm run dev
```

---

### Problema 2: CartSidebar no se abre
**Síntoma**: Click en carrito no hace nada

**Verificar**:
1. Consola del navegador - buscar errores
2. Verificar que CartProvider envuelve la app
3. Verificar importación de CartContext

**Solución**: Verificar en `App.jsx`:
```jsx
<CartProvider>
  <BrowserRouter>
    ...
  </BrowserRouter>
</CartProvider>
```

---

### Problema 3: Checkout redirige a login aunque estoy logueado
**Síntoma**: No puede acceder a checkout

**Verificar**:
```javascript
// En consola del navegador
localStorage.getItem('token')
localStorage.getItem('user')
```

**Solución**:
- Si no hay token → hacer login nuevamente
- Si hay token pero falla → verificar expiración JWT

---

### Problema 4: Error 401 al crear pedido
**Síntoma**: "No autorizado" al confirmar pedido

**Causa**: Token JWT no se envía en request

**Verificar**:
1. `frontend/src/services/api.js` tiene interceptor correcto
2. localStorage tiene token válido

---

## 📊 Checklist de Pruebas

### Usuario Invitado
- [ ] Página de prueba del carrito funciona
- [ ] TiendaHome carga productos
- [ ] Agregar al carrito funciona
- [ ] CartSidebar se abre y muestra productos
- [ ] Contador de carrito se actualiza
- [ ] Total se calcula correctamente
- [ ] Checkout pide login

### Usuario Registrado
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Token se guarda en localStorage
- [ ] Agregar al carrito funciona logueado
- [ ] Checkout carga correctamente
- [ ] Pedido con Pickup se crea exitosamente
- [ ] Pedido con Delivery se crea exitosamente
- [ ] Número de pedido se genera correctamente
- [ ] Stock se actualiza en BD
- [ ] Carrito se vacía después de pedido exitoso
- [ ] Redirige a /pedidos
- [ ] Lista de pedidos muestra el nuevo pedido
- [ ] Detalle de pedido muestra información completa

### Validaciones
- [ ] Stock insuficiente muestra error apropiado
- [ ] Dirección obligatoria para Delivery
- [ ] Usuario no autenticado no puede hacer checkout
- [ ] Transacción SQL funciona (todo o nada)

### Persistencia
- [ ] Carrito persiste en localStorage
- [ ] Carrito se restaura al recargar página
- [ ] Carrito se limpia solo después de pedido exitoso

---

## 🎯 URLs de Prueba Rápida

```
# Prueba del carrito
http://localhost:5173/test-carrito

# Tiendas demo
http://localhost:5173/tienda/demo
http://localhost:5173/tienda/comercial-xyz
http://localhost:5173/tienda/megatienda-2000

# Registro y login
http://localhost:5173/registro
http://localhost:5173/login

# Checkout
http://localhost:5173/checkout

# Mis pedidos
http://localhost:5173/pedidos
```

---

## 📞 Contacto para Reporte de Bugs

Si encuentras problemas:
1. Anotar URL donde ocurre
2. Anotar pasos para reproducir
3. Capturar console log (F12)
4. Capturar error del backend (si aplica)

---

**Documento creado para verificación funcional**  
**Última actualización**: 25 de Noviembre, 2025
