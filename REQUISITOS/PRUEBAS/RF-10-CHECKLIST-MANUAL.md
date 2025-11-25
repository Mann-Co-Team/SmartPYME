# RF-10: Checklist de Verificación Manual

**Fecha:** 2025-11-20  
**URL Frontend:** http://localhost:5173  
**URL Backend:** http://localhost:3000

---

## ✅ Tests Automatizados

- [x] **12/12 tests pasando (100%)**
- [x] Backend: Rutas de notificaciones cargadas correctamente
- [x] Frontend: Servidor Vite corriendo en puerto 5173

---

## 📋 Verificación Manual Frontend

### 1. Acceso al Sistema

**Pasos:**
1. Abrir http://localhost:5173
2. Ir a `/admin/login`
3. Login con:
   - Email: `admin@smartpyme.com`
   - Password: `admin123`

**Resultado esperado:**
- ✅ Login exitoso
- ✅ Redirección a `/admin/dashboard`

---

### 2. Verificar Bell Icon

**Ubicación:** Navbar superior derecha (antes del badge "En línea")

**Verificar:**
- [ ] Icon de campana (🔔 BellIcon) visible
- [ ] Si hay notificaciones no leídas, badge rojo con número
- [ ] Badge muestra "99+" si contador > 99
- [ ] Icon tiene efecto hover (cambio de color)

**Estilos esperados:**
- Icon: `h-6 w-6` con color del tema
- Badge: `absolute top-0 right-0 bg-red-600 text-white rounded-full text-xs`

---

### 3. Panel de Notificaciones

**Pasos:**
1. Click en bell icon
2. Panel dropdown debe aparecer

**Verificar:**
- [ ] Panel se abre a la derecha del icon
- [ ] Panel tiene sombra y borde redondeado
- [ ] Header dice "Notificaciones"
- [ ] Botón "Marcar todas como leídas" visible en header
- [ ] Lista de notificaciones con scroll (max-h-500px)
- [ ] Si no hay notificaciones: mensaje "No hay notificaciones"

**Estructura visual:**
```
┌─────────────────────────────────────┐
│ Notificaciones  [Marcar todas]     │
├─────────────────────────────────────┤
│ 🔵 [Icon] Título de notificación   │
│    Mensaje breve...                 │
│    hace 5 minutos                   │
├─────────────────────────────────────┤
│ ⚪ [Icon] Notificación leída        │
│    Mensaje...                       │
│    hace 2 horas                     │
└─────────────────────────────────────┘
```

---

### 4. Iconos por Tipo de Notificación

**Verificar iconos:**
- [ ] `nuevo_pedido` → 🛍️ ShoppingBagIcon (azul)
- [ ] `cambio_estado` → 🚚 TruckIcon (verde)
- [ ] `stock_critico` → ⚠️ ExclamationTriangleIcon (rojo)

---

### 5. Notificaciones No Leídas

**Características visuales:**
- [ ] Fondo azul claro (`bg-blue-50`) en light mode
- [ ] Fondo azul oscuro (`bg-blue-900/20`) en dark mode
- [ ] Punto azul (🔵) a la izquierda del icon
- [ ] Borde izquierdo azul (`border-l-4 border-blue-500`)

---

### 6. Marcar Como Leída (Individual)

**Pasos:**
1. Click en cualquier notificación no leída

**Verificar:**
- [ ] Notificación cambia de aspecto (pierde fondo azul)
- [ ] Punto azul desaparece
- [ ] Badge en bell icon decrementa en 1
- [ ] Navegación a página correspondiente:
  - `nuevo_pedido` → `/admin/pedidos`
  - `cambio_estado` → `/admin/pedidos`
  - `stock_critico` → `/admin/productos`

---

### 7. Marcar Todas Como Leídas

**Pasos:**
1. Click en "Marcar todas como leídas" (header del panel)

**Verificar:**
- [ ] Todas las notificaciones pierden fondo azul
- [ ] Todos los puntos azules desaparecen
- [ ] Badge en bell icon desaparece (contador = 0)
- [ ] Panel se actualiza visualmente

---

### 8. Polling Automático

**Pasos:**
1. Dejar panel abierto
2. Esperar 30 segundos

**Verificar:**
- [ ] Contador se actualiza automáticamente cada 30s
- [ ] No se hacen requests innecesarios cuando panel cerrado

**Monitorear en DevTools (Network):**
- Request cada 30s: `GET /api/notificaciones/unread-count`
- Headers: `Authorization: Bearer [token]`

---

### 9. Cerrar Panel

**Métodos:**
- [ ] Click fuera del panel → Panel se cierra
- [ ] Click en bell icon nuevamente → Panel se cierra
- [ ] Click en notificación → Panel se cierra + navegación

---

### 10. Dark Mode

**Pasos:**
1. Alternar dark mode (botón en navbar)

**Verificar:**
- [ ] Panel: fondo oscuro (`dark:bg-gray-800`)
- [ ] Texto: colores claros (`dark:text-gray-100`)
- [ ] Notificaciones no leídas: `dark:bg-blue-900/20`
- [ ] Border y efectos hover adaptados

---

## 🧪 Verificación de Integración

### 11. Crear Pedido → Notificación

**Pasos:**
1. Ir a vista pública: `http://localhost:5173`
2. Agregar producto al carrito
3. Hacer checkout (crear pedido)
4. Volver al admin panel
5. Verificar bell icon

**Resultado esperado:**
- [ ] Badge incrementa en 1
- [ ] Nueva notificación tipo `nuevo_pedido` aparece
- [ ] Título: "Nuevo Pedido #[numero]"
- [ ] Mensaje: "Se ha recibido un nuevo pedido..."
- [ ] Estado: No leída (fondo azul)
- [ ] Time: "Ahora" o "hace Xmin"

---

### 12. Cambiar Estado Pedido → Notificación

**Pasos:**
1. En `/admin/pedidos`
2. Seleccionar un pedido
3. Cambiar estado (ej: Pendiente → Confirmado)

**Resultado esperado:**
- [ ] Badge incrementa
- [ ] Nueva notificación tipo `cambio_estado`
- [ ] Título: "Pedido #[numero] - [nuevo estado]"
- [ ] Mensaje personalizado según estado

---

### 13. Stock Crítico → Notificación

**Pasos:**
1. Crear pedido que reduzca stock a <= 5
2. Verificar notificaciones

**Resultado esperado:**
- [ ] Notificación tipo `stock_critico`
- [ ] Icon: ⚠️ (rojo/amarillo)
- [ ] Título: "Stock Crítico - [nombre producto]"
- [ ] Mensaje: "Stock actual: X unidades"

---

## 🔒 Verificación de Permisos

### 14. Acceso Como Cliente

**Pasos:**
1. Logout del admin
2. Login como cliente (registrar uno nuevo o usar existente)
3. Intentar acceder directamente: `GET /api/notificaciones`

**Resultado esperado:**
- [ ] Frontend: Bell icon NO visible para cliente
- [ ] API: 403 Forbidden si intenta acceder directamente
- [ ] Mensaje: "No tiene permisos para esta acción"

---

### 15. Sin Autenticación

**Pasos:**
1. Logout
2. Abrir DevTools Console
3. Ejecutar:
```javascript
fetch('http://localhost:3000/api/notificaciones', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
```

**Resultado esperado:**
- [ ] 401 Unauthorized
- [ ] Mensaje: "Token no proporcionado" o similar

---

## 📧 Verificación de Emails (Opcional)

### 16. Configurar SMTP

**Archivo:** `backend/.env`

**Agregar:**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_password_mailtrap
EMAIL_FROM=noreply@smartpyme.com
ADMIN_EMAILS=admin@smartpyme.com
```

**Reiniciar backend**

---

### 17. Verificar Email Nuevo Pedido

**Pasos:**
1. Crear un pedido desde frontend público
2. Revisar bandeja de entrada (Mailtrap)

**Verificar:**
- [ ] Email recibido
- [ ] Subject: "Nuevo Pedido - SmartPYME #[numero]"
- [ ] Contenido HTML bien formateado
- [ ] Información del pedido completa
- [ ] Colores y estilos correctos

---

### 18. Verificar Email Cambio Estado

**Pasos:**
1. Cambiar estado de un pedido
2. Revisar email del cliente

**Verificar:**
- [ ] Email recibido por cliente
- [ ] Subject: "Actualización de Pedido #[numero]"
- [ ] Mensaje personalizado según estado
- [ ] Botón/link para ver pedido

---

### 19. Verificar Email Stock Crítico

**Pasos:**
1. Crear pedido que genere alerta de stock
2. Revisar email de administradores

**Verificar:**
- [ ] Email con alerta urgente
- [ ] Subject: "⚠️ Alerta: Stock Crítico"
- [ ] Información del producto
- [ ] Stock actual
- [ ] Colores de alerta (rojo/amarillo)

---

## 🐛 Casos Edge

### 20. Sin Conexión Backend

**Pasos:**
1. Detener servidor backend
2. Interactuar con notificaciones en frontend

**Verificar:**
- [ ] Error manejado gracefully
- [ ] Mensaje de error amigable
- [ ] No crash de aplicación
- [ ] Loading spinner mientras intenta conectar

---

### 21. Múltiples Notificaciones (Scroll)

**Pasos:**
1. Generar > 10 notificaciones
2. Abrir panel

**Verificar:**
- [ ] Scroll vertical funciona
- [ ] Max height respetado (500px)
- [ ] Todas las notificaciones visibles al scrollear
- [ ] Scroll smooth

---

### 22. Notificaciones Muy Antiguas

**Verificar formato de tiempo:**
- [ ] < 1 min: "Ahora"
- [ ] < 60 min: "hace Xmin"
- [ ] < 24h: "hace Xh"
- [ ] >= 24h: "hace Xd"

---

## 📊 Resumen de Verificación

### Backend
- [x] Tests automatizados: 12/12 (100%)
- [ ] Servidor corriendo sin errores
- [ ] Rutas de notificaciones disponibles
- [ ] Emails enviándose (si SMTP configurado)

### Frontend
- [ ] Bell icon visible para admin/empleado
- [ ] Badge muestra contador correcto
- [ ] Panel se abre/cierra correctamente
- [ ] Notificaciones muestran información correcta
- [ ] Marcar como leída funciona
- [ ] Navegación desde notificaciones funciona
- [ ] Polling actualiza contador
- [ ] Dark mode funciona
- [ ] Responsive (mobile/tablet/desktop)

### Integración
- [ ] Nuevo pedido genera notificación
- [ ] Cambio estado genera notificación
- [ ] Stock crítico genera notificación
- [ ] Emails se envían correctamente

### Seguridad
- [ ] Cliente no puede acceder
- [ ] Sin token retorna 401
- [ ] JWT validado correctamente
- [ ] Permisos respetados

---

## ✅ Checklist Final

- [ ] Todos los tests automatizados pasando
- [ ] Verificación manual frontend completa
- [ ] Integración con eventos funcionando
- [ ] Permisos correctamente implementados
- [ ] Emails configurados (opcional) y funcionando
- [ ] Sin errores en consola frontend
- [ ] Sin errores en logs backend
- [ ] Documentación completa
- [ ] README actualizado (si corresponde)

---

## 📝 Notas de Testing

**Navegadores probados:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (si disponible)

**Resoluciones probadas:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Issues encontrados:**

(Documentar aquí cualquier problema encontrado durante la verificación manual)

---

**Verificado por:** ________________  
**Fecha:** ________________  
**Firma:** ________________

---

## 🚀 Siguiente Paso

Una vez completado este checklist:
- [ ] Marcar RF-10 como COMPLETADO
- [ ] Hacer commit de cambios
- [ ] Actualizar backlog
- [ ] Proceder con siguiente RF o tarea
