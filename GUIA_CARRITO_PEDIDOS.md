# 🛒 Guía de Uso: Sistema de Carrito y Pedidos - SmartPYME

**Versión**: 3.0  
**Fecha**: 25 de Noviembre, 2025

---

## 📋 Descripción General

El sistema de carrito de SmartPYME está completamente integrado con la base de datos, permitiendo a los clientes agregar productos, gestionar cantidades, y crear pedidos que se registran automáticamente con validación de stock y actualización de inventario.

---

## 🛍️ Flujo Completo del Usuario

### 1. Navegación y Búsqueda de Productos

**Página**: HomePage o TiendaHome  
**URL**: `http://localhost:5173/` o `http://localhost:5173/tienda/:tenant_slug`

#### Acciones Disponibles:
- ✅ Ver catálogo completo de productos
- ✅ Buscar productos por nombre o descripción
- ✅ Filtrar por categoría
- ✅ Ordenar por nombre, precio ascendente o descendente
- ✅ Ver información detallada: nombre, precio, stock, categoría, imagen

#### Vista de Producto:
```
┌─────────────────────────────────────┐
│  [Imagen del Producto]              │
│  Categoría: Electrónica             │
├─────────────────────────────────────┤
│  Nombre del Producto                │
│  Descripción breve...               │
│  $19.990                            │
│  Stock: 15 unidades disponibles     │
│  [Agregar al carrito] ➕            │
└─────────────────────────────────────┘
```

---

### 2. Agregar Productos al Carrito

**Componente**: CartContext + CartSidebar  
**Persistencia**: localStorage

#### Cómo Agregar:
1. Click en botón "Agregar al carrito" en cualquier producto
2. Sistema verifica:
   - ✅ Si el producto ya está en el carrito → incrementa cantidad
   - ✅ Si es nuevo → agrega con cantidad = 1
3. Muestra notificación toast: "Producto agregado al carrito"
4. Actualiza contador del carrito en navbar

#### Código Frontend (ejemplo):
```javascript
// En HomePage.jsx o TiendaHome.jsx
const { addItem } = useCart();

const handleAddToCart = (producto) => {
  addItem(producto, 1); // Agregar 1 unidad
};
```

---

### 3. Gestión del Carrito (Sidebar)

**Componente**: CartSidebar  
**Ubicación**: Desliza desde la derecha al hacer clic en el ícono del carrito

#### Funcionalidades:
- ✅ Ver todos los productos agregados
- ✅ Ver subtotal por producto (cantidad × precio)
- ✅ Incrementar cantidad con botón `+`
- ✅ Decrementar cantidad con botón `-` (si llega a 0, elimina producto)
- ✅ Eliminar producto directamente con ícono de basura 🗑️
- ✅ Ver total general del carrito
- ✅ Botón "Proceder al pago" → navega a `/checkout`

#### Vista del CartSidebar:
```
╔══════════════════════════════════╗
║  Carrito de compras         [X]  ║
╠══════════════════════════════════╣
║  [Img] Producto A                ║
║        $9.990 c/u                ║
║        [-] 2 [+]  [🗑️]           ║
║        $19.980                   ║
║──────────────────────────────────║
║  [Img] Producto B                ║
║        $15.000 c/u               ║
║        [-] 1 [+]  [🗑️]           ║
║        $15.000                   ║
╠══════════════════════════════════╣
║  Total: $34.980                  ║
║  Envío calculado al finalizar    ║
║                                  ║
║  [Proceder al pago] 💳           ║
║                                  ║
║  o Continuar comprando           ║
╚══════════════════════════════════╝
```

---

### 4. Página de Checkout

**Componente**: Checkout.jsx  
**URL**: `http://localhost:5173/checkout`  
**Requiere**: Autenticación (si no está logueado, redirige a `/login`)

#### Secciones del Checkout:

##### A. Método de Entrega
```
○ Retiro en Tienda (Gratis)
● Delivery (Por calcular)
```

##### B. Dirección de Entrega (solo si Delivery)
```
Dirección de Entrega *
┌────────────────────────────────┐
│ Calle, número, comuna, ciudad  │
│                                │
└────────────────────────────────┘
```

##### C. Método de Pago
```
Método de Pago *
┌────────────────────────────────┐
│ ▼ Efectivo                     │
│   Tarjeta de Débito/Crédito    │
│   Transferencia Bancaria        │
└────────────────────────────────┘
```

##### D. Notas Adicionales (Opcional)
```
Notas Adicionales (Opcional)
┌────────────────────────────────┐
│ Instrucciones especiales,      │
│ horario preferido, etc.        │
└────────────────────────────────┘
```

##### E. Resumen del Pedido (Panel Lateral)
```
╔════════════════════════════╗
║  Resumen del Pedido        ║
╠════════════════════════════╣
║  [Img] Producto A          ║
║  2 x $9.990 = $19.980      ║
║                            ║
║  [Img] Producto B          ║
║  1 x $15.000 = $15.000     ║
║────────────────────────────║
║  Subtotal:     $34.980     ║
║  Envío:        Gratis      ║
║────────────────────────────║
║  Total:        $34.980     ║
╠════════════════════════════╣
║  ⚠️ Importante: Se validará║
║  disponibilidad de stock   ║
╚════════════════════════════╝
```

#### Validaciones en Frontend:
- ✅ Usuario autenticado (verifica token en localStorage)
- ✅ Carrito no vacío
- ✅ Dirección obligatoria si método = "delivery"
- ✅ Método de pago seleccionado

---

### 5. Confirmación del Pedido

**Endpoint**: `POST /api/pedidos`  
**Autenticación**: JWT requerido

#### Proceso al hacer clic en "Confirmar Pedido":

##### 1. Frontend envía request:
```javascript
const pedidoData = {
  id_usuario_cliente: user.id,  // ID del usuario autenticado
  items: [
    {
      id_producto: 1,
      cantidad: 2,
      precio_unitario: 9990,
      subtotal: 19980
    },
    {
      id_producto: 2,
      cantidad: 1,
      precio_unitario: 15000,
      subtotal: 15000
    }
  ],
  total: 34980,
  metodo_pago: 'efectivo',
  notas: 'Entregar en la tarde',
  direccion_entrega: 'Calle Falsa 123, Santiago',
  metodo_entrega: 'delivery'
};

const response = await crearPedido(pedidoData);
```

##### 2. Backend valida stock:
```javascript
// En PedidoModel.validarStock()
// Verifica que cada producto tenga stock suficiente
// Si algún producto no tiene stock → lanza error STOCK_INSUFICIENTE
```

##### 3. Backend crea pedido con transacción:
```sql
BEGIN TRANSACTION;

-- 1. Insertar pedido
INSERT INTO pedidos (id_tenant, id_cliente, id_usuario, total, metodo_pago, notas, direccion_entrega, metodo_entrega)
VALUES (1, 10, 5, 34980, 'efectivo', 'Entregar en la tarde', 'Calle Falsa 123', 'delivery');

-- 2. Insertar detalles del pedido
INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (101, 1, 2, 9990, 19980);
INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (101, 2, 1, 15000, 15000);

-- 3. Actualizar stock de productos
UPDATE productos SET stock = stock - 2 WHERE id_producto = 1;
UPDATE productos SET stock = stock - 1 WHERE id_producto = 2;

COMMIT;
```

##### 4. Backend genera número de pedido:
```javascript
// Formato: PED-YYYYMMDD-XXXX
// Ejemplo: PED-20251125-0001
```

##### 5. Backend envía notificaciones:
- ✅ Email simulado al admin (console.log)
- ✅ Notificación in-app para admins/vendedores
- ✅ Si stock bajo/agotado → notificación adicional

##### 6. Frontend recibe respuesta:
```javascript
{
  success: true,
  message: 'Pedido creado exitosamente',
  data: {
    id: 101,
    numero_pedido: 'PED-20251125-0001',
    productosConStockBajo: [...],  // Si aplica
    productosAgotados: [...]       // Si aplica
  }
}
```

##### 7. Frontend muestra éxito:
- ✅ Toast: "¡Pedido creado exitosamente! Número: PED-20251125-0001"
- ✅ Limpia el carrito (localStorage)
- ✅ Redirige a `/pedidos` (lista de pedidos del cliente)

---

## ⚠️ Manejo de Errores

### Error 1: Stock Insuficiente
**HTTP 400**

#### Request:
```javascript
items: [
  { id_producto: 1, cantidad: 10 }  // Pero solo hay 5 en stock
]
```

#### Response:
```javascript
{
  success: false,
  message: 'Stock insuficiente, ajuste su pedido',
  detalles: [
    {
      nombre: 'Producto A',
      solicitado: 10,
      disponible: 5
    }
  ]
}
```

#### Frontend muestra:
```
❌ Stock insuficiente para:
   • Producto A: solicitado 10, disponible 5
```

#### Acción: Usuario ajusta cantidades en el carrito

---

### Error 2: Usuario No Autenticado
**Redirige a /login**

#### Frontend detecta:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
if (!user || !user.id) {
  toast.error('Debe iniciar sesión para realizar un pedido');
  navigate('/login');
  return;
}
```

---

### Error 3: Error de Conexión
**HTTP 500 o ERR_NETWORK**

#### Response:
```javascript
{
  success: false,
  message: 'Error de conexión. Intente nuevamente más tarde'
}
```

#### Frontend muestra:
```
❌ Error de conexión. Intente nuevamente más tarde
```

---

### Error 4: Dirección Faltante (Delivery)
**Validación en Frontend**

```javascript
if (formData.metodo_entrega === 'delivery' && !formData.direccion_entrega.trim()) {
  toast.error('Debe ingresar una dirección de entrega para delivery');
  return;
}
```

---

## 🔒 Validaciones de Seguridad

### 1. Autenticación JWT
```javascript
// Middleware en backend
authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}
```

### 2. Validación de Tenant
```javascript
// Middleware validateTenant
// Verifica que el tenant sea válido y esté activo
```

### 3. Validación de Stock en Tiempo Real
```javascript
// En PedidoModel.validarStock()
// Consulta stock ACTUAL de la base de datos
// No confía en datos del frontend
```

### 4. Transacciones SQL
```javascript
// Garantiza atomicidad
await connection.beginTransaction();
try {
  // ... operaciones
  await connection.commit();
} catch (error) {
  await connection.rollback();  // Deshace TODO si algo falla
  throw error;
}
```

---

## 📊 Flujo de Datos Completo

```
┌──────────────┐
│   CLIENTE    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. Agrega productos al carrito
       │    (localStorage)
       │
       ▼
┌──────────────┐
│   CARRITO    │
│ (localStorage│
│   Context)   │
└──────┬───────┘
       │
       │ 2. Procede a checkout
       │
       ▼
┌──────────────┐
│   CHECKOUT   │
│   (Página)   │
└──────┬───────┘
       │
       │ 3. Completa formulario
       │    y confirma
       │
       ▼
┌──────────────┐
│  API POST    │
│  /pedidos    │
└──────┬───────┘
       │
       │ 4. Valida autenticación (JWT)
       │
       ▼
┌──────────────┐
│   BACKEND    │
│ Controlador  │
└──────┬───────┘
       │
       │ 5. Valida stock
       │
       ▼
┌──────────────┐
│  BASE DATOS  │
│   (MySQL)    │
└──────┬───────┘
       │
       │ 6. BEGIN TRANSACTION
       │
       ├─→ Inserta pedido
       ├─→ Inserta detalle_pedidos
       ├─→ Actualiza stock productos
       │
       │ 7. COMMIT
       │
       ▼
┌──────────────┐
│ NOTIFICACIONES│
└──────┬───────┘
       │
       ├─→ Email admin (simulado)
       ├─→ Notificación in-app admin
       └─→ Alerta stock bajo (si aplica)
       │
       ▼
┌──────────────┐
│  RESPUESTA   │
│   SUCCESS    │
└──────┬───────┘
       │
       │ 8. Frontend recibe respuesta
       │
       ▼
┌──────────────┐
│   CLIENTE    │
│ - Limpia     │
│   carrito    │
│ - Muestra    │
│   toast      │
│ - Redirige   │
│   a /pedidos │
└──────────────┘
```

---

## 🧪 Casos de Prueba

### Caso 1: Pedido Exitoso Básico
```
✅ Dado: Usuario autenticado, 2 productos en carrito con stock
✅ Cuando: Completa checkout y confirma
✅ Entonces: 
   - Pedido creado con número único
   - Stock actualizado correctamente
   - Carrito vaciado
   - Notificaciones enviadas
   - Redirige a /pedidos
```

### Caso 2: Stock Insuficiente
```
✅ Dado: Usuario autenticado, producto con cantidad > stock
✅ Cuando: Intenta confirmar pedido
✅ Entonces: 
   - Error HTTP 400
   - Mensaje detallado de stock insuficiente
   - Pedido NO creado
   - Stock NO modificado
```

### Caso 3: Usuario No Autenticado
```
✅ Dado: Usuario sin login
✅ Cuando: Intenta acceder a /checkout
✅ Entonces: 
   - Detecta falta de token
   - Muestra mensaje de error
   - Redirige a /login
```

### Caso 4: Delivery Sin Dirección
```
✅ Dado: Usuario selecciona Delivery
✅ Cuando: Intenta confirmar sin dirección
✅ Entonces: 
   - Validación en frontend impide envío
   - Muestra toast de error
   - No hace request al backend
```

---

## 🎯 Checklist de Funcionalidades

### Carrito
- [x] Agregar productos
- [x] Remover productos
- [x] Actualizar cantidades
- [x] Persistencia en localStorage
- [x] Contador en navbar
- [x] Sidebar deslizante
- [x] Cálculo de total automático
- [x] Limpieza después de pedido exitoso

### Checkout
- [x] Formulario de método de entrega
- [x] Dirección condicional
- [x] Selector de método de pago
- [x] Campo de notas
- [x] Resumen del pedido
- [x] Validaciones en frontend
- [x] Loading state durante creación
- [x] Manejo de errores con mensajes específicos

### Backend
- [x] Endpoint POST /api/pedidos
- [x] Autenticación JWT requerida
- [x] Validación de stock en tiempo real
- [x] Transacciones SQL
- [x] Rollback automático en error
- [x] Generación de número de pedido
- [x] Actualización de stock
- [x] Notificaciones automáticas
- [x] Manejo de errores específicos

---

## 📚 Archivos Clave

### Frontend
```
frontend/src/
├── context/
│   └── CartContext.jsx          # Gestión de estado del carrito
├── components/
│   └── Cart/
│       └── CartSidebar.jsx      # Sidebar del carrito
├── pages/
│   └── public/
│       ├── Checkout.jsx         # Página de checkout
│       ├── HomePage.jsx         # Catálogo con botón agregar
│       └── TiendaHome.jsx       # Tienda por tenant
└── services/
    ├── pedidos.js               # API calls de pedidos
    └── public.js                # API calls públicos
```

### Backend
```
backend/
├── controllers/
│   └── pedido.controller.js     # Lógica de negocio
├── models/
│   └── pedido.model.js          # Acceso a datos, transacciones
├── routes/
│   └── pedidos.routes.js        # Definición de endpoints
└── middlewares/
    ├── auth.js                  # Validación JWT
    └── tenant.js                # Validación tenant
```

---

## 🚀 Comandos Útiles

### Ver Pedidos en Base de Datos
```sql
-- Ver todos los pedidos
SELECT * FROM pedidos ORDER BY fecha_pedido DESC LIMIT 10;

-- Ver detalle de un pedido específico
SELECT 
  p.numero_pedido,
  p.total,
  p.metodo_pago,
  pr.nombre AS producto,
  dp.cantidad,
  dp.precio_unitario,
  dp.subtotal
FROM pedidos p
JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
JOIN productos pr ON dp.id_producto = pr.id_producto
WHERE p.numero_pedido = 'PED-20251125-0001';
```

### Ver Stock de Productos
```sql
-- Ver productos con stock bajo
SELECT nombre, stock FROM productos WHERE stock <= 5 ORDER BY stock ASC;

-- Ver cambios de stock de un producto específico
SELECT * FROM productos WHERE id_producto = 1;
```

---

## 💡 Tips y Mejores Prácticas

### Para Desarrolladores

1. **Siempre valida stock en backend**: Nunca confíes solo en validaciones de frontend
2. **Usa transacciones SQL**: Para operaciones que modifican múltiples tablas
3. **Logs detallados**: Console.log en puntos críticos ayuda al debugging
4. **Manejo de errores específicos**: Distingue entre stock insuficiente, error de red, etc.
5. **Limpieza de carrito**: Solo después de confirmación exitosa del backend

### Para Usuarios

1. **Verifica stock antes de checkout**: El stock puede cambiar entre agregar y confirmar
2. **Completa todos los campos requeridos**: Evita errores de validación
3. **Guarda tu número de pedido**: Úsalo para hacer seguimiento
4. **Revisa el resumen**: Verifica productos y total antes de confirmar

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si cierro el navegador con productos en el carrito?
El carrito persiste en localStorage, al volver se restauran los productos.

### ¿El stock se reserva al agregar al carrito?
No, el stock solo se valida y actualiza al confirmar el pedido.

### ¿Puedo editar un pedido después de crearlo?
No, una vez creado no se puede editar. Para cambios, cancela y crea uno nuevo (si está Pendiente).

### ¿Qué pasa si dos usuarios compran el último producto al mismo tiempo?
El backend valida stock en el momento exacto de confirmación con transacciones SQL. El primero en confirmar obtiene el producto, el segundo recibe error de stock insuficiente.

### ¿Los emails se envían realmente?
Por ahora son simulados (console.log en servidor). Para producción, integrar SendGrid/AWS SES.

---

**Documento creado por**: Equipo SmartPYME  
**Última actualización**: 25 de Noviembre, 2025  
**Versión**: 3.0
