# RF-3: Creación de Pedidos

## Información del Requisito

- **Número de Requisito**: RF-3
- **Nombre**: Creación de Pedidos
- **Tipo**: Requisito Funcional
- **Estado**: ✅ Implementado
- **Fecha de Implementación**: 18 de Enero, 2025

## Descripción

El cliente podrá seleccionar productos desde el catálogo, definir cantidades, elegir método de entrega (delivery o pickup), ingresar dirección si corresponde, y confirmar el pedido. El sistema validará disponibilidad de stock, generará un número de pedido único, y notificará al cliente.

## Flujo de Interacción

### Flujo Principal

1. **Usuario**: Accede al catálogo y selecciona productos
   - Navega por la página principal (HomePage)
   - Agrega productos al carrito con botón "Agregar al carrito"
   - Puede ajustar cantidades desde el carrito lateral (CartSidebar)

2. **Sistema**: Valida disponibilidad de stock y muestra resumen del pedido
   - Muestra productos en el carrito con cantidades
   - Calcula total automáticamente
   - Permite navegar a checkout con botón "Proceder al pago"

3. **Usuario**: Ingresa dirección y método de entrega, y confirma pedido
   - Selecciona método de entrega: Pickup (Retiro en Tienda) o Delivery
   - Si elige Delivery, ingresa dirección completa
   - Selecciona método de pago: Efectivo, Tarjeta, o Transferencia
   - Puede agregar notas adicionales
   - Revisa resumen del pedido en panel lateral
   - Confirma con botón "Confirmar Pedido"

4. **Sistema (Correcto)**: Genera número de pedido y notifica por correo
   - Valida stock disponible antes de confirmar
   - Crea registro de pedido en base de datos
   - Actualiza stock de productos (decrementa)
   - Genera número de pedido único (formato: PED-YYYYMMDD-XXXX)
   - Simula envío de email con detalles del pedido
   - Muestra mensaje de éxito con número de pedido
   - Limpia el carrito automáticamente
   - Redirige a página de pedidos del cliente

### Flujos Alternativos

#### Flujo Alternativo 1: Stock Insuficiente

**Sistema**: Si hay stock insuficiente → mensaje "Stock insuficiente, ajuste su pedido"

- Detecta que uno o más productos no tienen stock suficiente
- No crea el pedido en base de datos
- Muestra mensaje detallado con productos afectados
- Indica cantidad solicitada vs cantidad disponible
- Permite al usuario ajustar cantidades en el carrito

#### Flujo Alternativo 2: Fallo en la Transacción

**Sistema**: Si falla la transacción → reversión automática y registro de error

- Si ocurre error durante la creación del pedido
- Sistema ejecuta rollback automático de la transacción
- No se actualiza el stock
- No se crea registro de pedido
- Muestra mensaje: "Error de conexión. Intente nuevamente más tarde"
- Log del error se guarda en consola del servidor

## Casos de Prueba

### Caso de Prueba 1: Pedido Exitoso con Delivery
- **Precondición**: Usuario autenticado, productos con stock disponible
- **Pasos**:
  1. Agregar producto al carrito
  2. Ir a checkout
  3. Seleccionar "Delivery"
  4. Ingresar dirección válida
  5. Seleccionar método de pago
  6. Confirmar pedido
- **Resultado Esperado**: 
  - Pedido creado exitosamente
  - Número de pedido generado (ej: PED-20250118-0001)
  - Stock actualizado
  - Mensaje de éxito mostrado
  - Carrito vaciado

### Caso de Prueba 2: Pedido Exitoso con Pickup
- **Precondición**: Usuario autenticado, productos con stock disponible
- **Pasos**:
  1. Agregar producto al carrito
  2. Ir a checkout
  3. Seleccionar "Retiro en Tienda"
  4. No requiere dirección
  5. Seleccionar método de pago
  6. Confirmar pedido
- **Resultado Esperado**: 
  - Pedido creado exitosamente
  - Número de pedido generado
  - Stock actualizado
  - Mensaje de éxito mostrado

### Caso de Prueba 3: Stock Insuficiente
- **Precondición**: Usuario autenticado, intentar pedir más de lo disponible
- **Pasos**:
  1. Agregar producto al carrito con cantidad > stock disponible
  2. Ir a checkout
  3. Confirmar pedido
- **Resultado Esperado**: 
  - Error HTTP 400
  - Mensaje: "Stock insuficiente, ajuste su pedido"
  - Detalle de productos con stock insuficiente
  - Pedido NO creado
  - Stock NO modificado

### Caso de Prueba 4: Validación de Dirección para Delivery
- **Precondición**: Usuario selecciona Delivery
- **Pasos**:
  1. Agregar producto al carrito
  2. Ir a checkout
  3. Seleccionar "Delivery"
  4. Dejar dirección vacía
  5. Intentar confirmar
- **Resultado Esperado**: 
  - Validación en frontend impide envío
  - Mensaje: "Debe ingresar una dirección de entrega para delivery"
  - Pedido NO enviado al servidor

### Caso de Prueba 5: Pedido con Múltiples Productos
- **Precondición**: Usuario autenticado, varios productos con stock
- **Pasos**:
  1. Agregar múltiples productos al carrito
  2. Ajustar cantidades
  3. Ir a checkout
  4. Completar formulario
  5. Confirmar pedido
- **Resultado Esperado**: 
  - Todos los items incluidos en el pedido
  - Stock actualizado para cada producto
  - Total calculado correctamente
  - Detalle completo en base de datos

### Caso de Prueba 6: Usuario No Autenticado
- **Precondición**: Usuario no ha iniciado sesión
- **Pasos**:
  1. Agregar productos al carrito
  2. Ir a checkout
  3. Intentar confirmar pedido
- **Resultado Esperado**: 
  - Sistema detecta falta de autenticación
  - Mensaje: "Debe iniciar sesión para realizar un pedido"
  - Redirige a página de login

### Caso de Prueba 7: Verificación de Actualización de Stock
- **Precondición**: Conocer stock inicial de un producto
- **Pasos**:
  1. Registrar stock inicial
  2. Crear pedido con ese producto
  3. Verificar stock después del pedido
- **Resultado Esperado**: 
  - Stock nuevo = Stock inicial - Cantidad pedida
  - Cambio reflejado en base de datos
  - Cambio visible en catálogo

## Implementación Técnica

### Backend

#### Modelo: `pedido.model.js`

**Métodos Principales**:

```javascript
// Validar stock disponible para todos los items
static async validarStock(items)
// Retorna array de productos con stock insuficiente

// Generar número de pedido único
static generarNumeroPedido()
// Formato: PED-YYYYMMDD-XXXX

// Crear pedido con transacción
static async create(data)
// Usa transacciones SQL para atomicidad
// Valida stock antes de insertar
// Actualiza stock de productos
// Rollback automático en caso de error
```

**Campos del Pedido**:
- `id_pedido` (INT, PK, AUTO_INCREMENT)
- `numero_pedido` (VARCHAR(50), UNIQUE) - Nuevo en RF-3
- `id_cliente` (INT, FK)
- `id_usuario` (INT, FK, nullable) - Empleado que procesó
- `fecha_pedido` (DATETIME)
- `id_estado` (INT, FK, default: 1 - Pendiente)
- `total` (DECIMAL(10,2))
- `metodo_pago` (VARCHAR(50))
- `notas` (TEXT)
- `direccion_entrega` (TEXT) - Nuevo en RF-3
- `metodo_entrega` (ENUM: 'delivery', 'pickup') - Nuevo en RF-3

#### Controlador: `pedido.controller.js`

**Método `create`**:
```javascript
static async create(req, res)
```

- Valida datos de entrada
- Llama a `PedidoModel.create()` con transacción
- Maneja errores específicos:
  - `STOCK_INSUFICIENTE` → HTTP 400
  - Errores de red/DB → HTTP 500
- Simula envío de email (console.log)
- Retorna número de pedido al cliente

**Mensajes de Error**:
- Stock insuficiente: "Stock insuficiente, ajuste su pedido"
- Error genérico: "Error de conexión. Intente nuevamente más tarde"

#### Migración de Base de Datos

**Archivo**: `migrate-pedidos.js`

Agrega campos necesarios para RF-3:
- `numero_pedido` VARCHAR(50) UNIQUE
- `direccion_entrega` TEXT
- `metodo_entrega` ENUM('delivery', 'pickup')
- Índice: `idx_numero_pedido`

### Frontend

#### Página: `Checkout.jsx`

**Funcionalidades**:
- Formulario de método de entrega (radio buttons)
- Campo de dirección condicional (solo para delivery)
- Selector de método de pago
- Campo de notas opcionales
- Resumen del pedido en panel lateral
- Validación de campos requeridos
- Manejo de errores con mensajes específicos
- Loading state durante creación de pedido

**Estados del Formulario**:
```javascript
{
  direccion_entrega: string,
  metodo_entrega: 'pickup' | 'delivery',
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia',
  notas: string
}
```

#### Componente: `CartSidebar.jsx`

**Actualización**:
- Botón "Proceder al pago" ahora navega a `/checkout`
- Cierra el sidebar al navegar
- Muestra total con formato de moneda chilena (CLP)

#### Contexto: `CartContext.jsx`

**Funciones Relevantes**:
- `getTotal()`: Calcula total del carrito
- `clearCart()`: Limpia carrito después de pedido exitoso
- `items`: Array de productos con cantidades

#### Servicio: `pedidos.js`

```javascript
export const crearPedido = async (data) => {
  const res = await API.post('/pedidos', data);
  return res.data.data;
};
```

Envía pedido al backend con token de autenticación.

### Rutas

**Frontend**:
- `/checkout` - Página de checkout (requiere productos en carrito)

**Backend**:
- `POST /api/pedidos` - Crear nuevo pedido (requiere autenticación)

## Resultados de Pruebas

### Test Automatizado: `test-rf3.ps1`

**Tests Implementados**:
1. ✅ Login de cliente
2. ✅ Obtener productos con stock
3. ✅ Crear pedido con delivery
4. ✅ Crear pedido con pickup
5. ✅ Stock insuficiente (validación de error)
6. ✅ Verificar actualización de stock
7. ✅ Pedido con múltiples productos

**Ejecución**:
```powershell
cd backend
.\test-rf3.ps1
```

**Resultado Esperado**: 7/7 tests pasados (100%)

## Mejoras Futuras

1. **Email Real**: Implementar servicio de envío de email (SendGrid, AWS SES)
2. **Cálculo de Envío**: Integrar API de cálculo de costo de delivery
3. **Notificaciones Push**: Notificar al cliente sobre estado del pedido
4. **Historial de Pedidos**: Página dedicada para ver pedidos del cliente
5. **Tracking**: Sistema de seguimiento de pedidos en tiempo real
6. **Pagos en Línea**: Integrar pasarela de pago (WebPay, MercadoPago)
7. **Validación de Dirección**: API de validación de direcciones (Google Maps)
8. **Stock en Tiempo Real**: WebSocket para actualizar stock en vivo
9. **Reserva de Stock**: Reservar stock mientras usuario está en checkout (timeout 15 min)

## Notas de Implementación

- Las transacciones SQL garantizan atomicidad (todo o nada)
- El rollback automático previene inconsistencias en el stock
- El número de pedido es único y secuencial por día
- La notificación por email es simulada (console.log en servidor)
- El carrito se limpia solo después de pedido exitoso
- La validación de stock ocurre en el momento de confirmación, no al agregar al carrito
- Los pedidos quedan en estado "Pendiente" por defecto
- Solo clientes autenticados pueden crear pedidos

## Referencias

- Requisito Original: RF-3 - Creación de Pedidos
- Archivo de Schema: `database/schema.sql`
- Migración: `database/migrations/add-pedido-fields.sql`
- Tests: `backend/test-rf3.ps1`
