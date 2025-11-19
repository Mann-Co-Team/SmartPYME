# 🧪 Pruebas Manuales - RF-3: Creación de Pedidos

## ✅ Estado del Backend
**Todas las pruebas del backend funcionan correctamente:**
- ✅ Creación de pedido con DELIVERY
- ✅ Creación de pedido con PICKUP
- ✅ Validación de stock insuficiente
- ✅ Generación automática de número de pedido (PED-YYYYMMDD-XXXX)
- ✅ Actualización de stock automática

## 🔧 Preparación

### 1. Verificar Servidores
```powershell
# Backend debe estar corriendo en puerto 5000
Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet
# Debe retornar: True

# Frontend debe estar corriendo en puerto 5173
Test-NetConnection -ComputerName localhost -Port 5173 -InformationLevel Quiet
# Debe retornar: True
```

### 2. Credenciales de Prueba
- **Email:** `juan.perez@ejemplo.com`
- **Password:** `prueba123`
- **Rol:** Cliente (id_usuario: 2)

---

## 📝 Caso de Prueba 1: Pedido con DELIVERY

### Pasos:
1. **Abrir navegador** en `http://localhost:5173`
2. **Iniciar sesión:**
   - Click en "Iniciar Sesión" (navbar superior derecha)
   - Ingresar credenciales del cliente de prueba
   - Click en "Iniciar Sesión"
   - ✓ Debe mostrar "Juan Pérez" en la navbar

3. **Agregar productos al carrito:**
   - Navegar a la sección "Productos" (o ya está en Home)
   - Seleccionar 1-2 productos con stock disponible
   - Click en "Agregar al carrito" para cada producto
   - ✓ El ícono del carrito debe mostrar el número de productos

4. **Ir al Checkout:**
   - Click en el ícono del carrito (esquina superior derecha)
   - Verificar que los productos estén listados correctamente
   - Click en "Proceder al Checkout"

5. **Completar formulario DELIVERY:**
   - **Método de Entrega:** Seleccionar "Delivery"
   - ✓ Debe aparecer el campo "Dirección de Entrega"
   - **Dirección:** Ingresar "Calle Falsa 123, Santiago Centro"
   - **Método de Pago:** Seleccionar "Efectivo"
   - **Notas:** (Opcional) "Entregar después de las 18:00"
   - Verificar el resumen del pedido en el panel derecho
   - Click en "Confirmar Pedido"

6. **Verificar resultado:**
   - ✓ Debe mostrar mensaje: "¡Pedido creado exitosamente! Número: PED-YYYYMMDD-XXXX"
   - ✓ El carrito debe vaciarse automáticamente
   - ✓ Debe redirigir a la página de pedidos

### Resultado Esperado:
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": 11,
    "numero_pedido": "PED-20251119-7474"
  }
}
```

---

## 📝 Caso de Prueba 2: Pedido con PICKUP

### Pasos:
1. **Agregar productos al carrito** (repetir pasos 3 del caso anterior)

2. **Ir al Checkout**

3. **Completar formulario PICKUP:**
   - **Método de Entrega:** Seleccionar "Retiro en Tienda"
   - ✓ El campo "Dirección de Entrega" debe **desaparecer/ocultarse**
   - **Método de Pago:** Seleccionar "Tarjeta de Débito/Crédito"
   - **Notas:** (Opcional) "Recogeré en la tarde"
   - Click en "Confirmar Pedido"

4. **Verificar resultado:**
   - ✓ Debe mostrar mensaje de éxito con número de pedido
   - ✓ El pedido debe crearse sin dirección de entrega
   - ✓ El carrito debe vaciarse

### Resultado Esperado:
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": 12,
    "numero_pedido": "PED-20251119-5776"
  }
}
```

---

## 📝 Caso de Prueba 3: Validación de Stock Insuficiente

### Pasos:
1. **Identificar producto con poco stock:**
   - Buscar un producto con stock bajo (ej: 2-5 unidades)
   - Agregar al carrito

2. **Intentar exceder el stock:**
   - Abrir el carrito (sidebar)
   - Usar los botones "+" para aumentar la cantidad más allá del stock
   - ✓ El sistema NO debe permitir agregar más de lo disponible en el carrito

3. **Prueba alternativa - Modificar stock manualmente:**
   - En la consola del navegador (F12), modificar el localStorage:
   ```javascript
   let cart = JSON.parse(localStorage.getItem('cart'));
   cart[0].quantity = 999; // Cantidad imposible
   localStorage.setItem('cart', JSON.stringify(cart));
   location.reload();
   ```
   - Ir al Checkout e intentar crear el pedido

4. **Verificar resultado:**
   - ✓ Debe mostrar error: "Stock insuficiente, ajuste su pedido"
   - ✓ Debe indicar qué productos no tienen stock suficiente
   - ✓ El pedido NO debe crearse

### Resultado Esperado:
```json
{
  "success": false,
  "message": "Stock insuficiente, ajuste su pedido",
  "detalles": [
    {
      "nombre": "Smartphone Samsung Galaxy A54",
      "solicitado": 999,
      "disponible": 8
    }
  ]
}
```

---

## 🔍 Verificación en Base de Datos

### Ver pedidos creados:
```sql
USE smartpyme_db;

-- Ver últimos pedidos
SELECT 
    id, 
    numero_pedido, 
    total, 
    estado, 
    metodo_entrega, 
    direccion_entrega,
    metodo_pago,
    fecha_pedido 
FROM pedidos 
ORDER BY id DESC 
LIMIT 5;
```

### Ver detalle de un pedido:
```sql
SELECT 
    dp.id_pedido,
    p.numero_pedido,
    pr.nombre AS producto,
    dp.cantidad,
    dp.precio_unitario,
    dp.subtotal
FROM detalle_pedidos dp
JOIN pedidos p ON dp.id_pedido = p.id
JOIN productos pr ON dp.id_producto = pr.id_producto
WHERE p.id = <ID_PEDIDO>;
```

### Verificar actualización de stock:
```sql
SELECT 
    id_producto,
    nombre,
    stock
FROM productos
WHERE id_producto IN (1, 2, 3)
ORDER BY id_producto;
```

---

## ✅ Checklist de Validación

### Funcionalidades Core:
- [ ] Login funciona correctamente
- [ ] Productos se muestran en catálogo
- [ ] Agregar productos al carrito funciona
- [ ] Modificar cantidades en carrito funciona
- [ ] Sidebar del carrito muestra productos correctamente

### Checkout - Delivery:
- [ ] Formulario muestra campo de dirección
- [ ] Campo de dirección es obligatorio
- [ ] Pedido se crea exitosamente
- [ ] Número de pedido se genera correctamente
- [ ] Dirección se guarda en la base de datos

### Checkout - Pickup:
- [ ] Campo de dirección se oculta
- [ ] Pedido se crea exitosamente
- [ ] direccion_entrega es NULL en BD

### Validaciones:
- [ ] Stock insuficiente muestra error
- [ ] No se permite crear pedido con stock insuficiente
- [ ] Stock se actualiza después de crear pedido
- [ ] Carrito se vacía después de crear pedido

### Navegación:
- [ ] Redirige a página de pedidos después de crear pedido
- [ ] Botón "Volver" regresa a productos/home

---

## 🐛 Problemas Conocidos Resueltos

### ✅ Problema: Token no se actualizaba en servicios
**Solución:** Implementado interceptor en `pedidos.js` para obtener token dinámicamente

### ✅ Problema: Error 500 al crear pedido
**Causa:** Faltaba el campo `subtotal` en los items
**Solución:** El frontend ya envía subtotal correctamente

### ✅ Problema: Usuario vs Cliente mismatch
**Solución:** El backend ahora auto-crea cliente desde usuario cuando es necesario

---

## 🎯 Comandos Rápidos de Prueba (PowerShell)

### Prueba completa automatizada:
```powershell
cd C:\Users\nicos\OneDrive\Documentos\GitHub\SmartPYME\backend
.\test-rf3.ps1
```

### Prueba manual individual (Delivery):
```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"juan.perez@ejemplo.com","password":"prueba123"}'
$token = $login.data.token
$userId = $login.data.user.id

# 2. Crear pedido DELIVERY
$pedido = @{
    id_usuario_cliente = $userId
    items = @(@{id_producto=1; cantidad=1; precio_unitario=349990; subtotal=349990})
    total = 349990
    metodo_entrega = "delivery"
    direccion_entrega = "Calle Falsa 123, Santiago"
    metodo_pago = "efectivo"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/pedidos" -Method POST -Headers @{"Authorization"="Bearer $token";"Content-Type"="application/json"} -Body $pedido
```

### Prueba manual individual (Pickup):
```powershell
# Usar el mismo token de arriba
$pedido = @{
    id_usuario_cliente = $userId
    items = @(@{id_producto=3; cantidad=1; precio_unitario=299990; subtotal=299990})
    total = 299990
    metodo_entrega = "pickup"
    metodo_pago = "tarjeta"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/pedidos" -Method POST -Headers @{"Authorization"="Bearer $token";"Content-Type"="application/json"} -Body $pedido
```

---

## 📊 Resultados de Pruebas

| Prueba | Estado | Fecha | Notas |
|--------|--------|-------|-------|
| Login cliente | ✅ PASS | 2025-11-19 | Token generado correctamente |
| Crear pedido DELIVERY | ✅ PASS | 2025-11-19 | PED-20251119-7474 |
| Crear pedido PICKUP | ✅ PASS | 2025-11-19 | PED-20251119-5776 |
| Validar stock insuficiente | ✅ PASS | 2025-11-19 | Error correcto retornado |
| Actualización de stock | ✅ PASS | 2025-11-19 | Stock decrementó correctamente |

---

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que ambos servidores estén corriendo (puertos 5000 y 5173)
2. Revisa la consola del navegador (F12) para errores
3. Verifica logs del servidor backend
4. Confirma que el usuario tenga rol de "cliente" (id_rol = 3)
