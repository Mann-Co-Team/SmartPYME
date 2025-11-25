# Mejoras del Dashboard - Indicadores de Plan

## ✅ Implementado

Se han agregado indicadores visuales del plan en las páginas principales del admin para dar visibilidad a los límites según el plan contratado.

---

## 🎯 Cambios Realizados

### 1. **Dashboard (Página Principal)**

**Ubicación:** `frontend/src/pages/admin/Dashboard.jsx`

#### Widget de Información del Plan
Se agregó un widget destacado en la parte superior que muestra:

- **Icono según el plan:**
  - 📦 Plan Básico (gris)
  - ⭐ Plan Profesional (azul)
  - 👑 Plan Empresarial (dorado/amarillo)

- **Nombre de la empresa y plan actual**

- **3 Métricas con límites:**
  1. **Productos:** X / 50 (Básico) | X / 500 (Profesional) | X / ∞ (Empresarial)
     - Incluye barra de progreso visual para plan Básico
     - Se vuelve roja cuando supera 80% del límite
  
  2. **Usuarios:** X / 1 (Básico) | X / 5 (Profesional) | X / ∞ (Empresarial)
  
  3. **Pedidos/Mes:** X / 100 (Básico) | X / ∞ (Profesional) | X / ∞ (Empresarial)

- **Botones de Upgrade:**
  - Plan Básico: "⬆️ Mejorar Plan" (azul)
  - Plan Profesional: "👑 Upgrade a Empresarial" (dorado)
  - Plan Empresarial: Sin botón (ya es el máximo)

**Colores del widget por plan:**
- Básico: `bg-gray-100 border-gray-300 text-gray-800`
- Profesional: `bg-blue-100 border-blue-300 text-blue-800`
- Empresarial: `bg-gradient-to-r from-yellow-100 to-amber-100 border-amber-300 text-amber-900`

---

### 2. **Página de Usuarios**

**Ubicación:** `frontend/src/pages/admin/Usuarios.jsx`

#### Indicador de Plan y Límites
Se agregó en el header de la página:

- **Badge del plan** con icono y nombre
- **Contador de usuarios:** "Usuarios: X / Y"
  - Muestra ilimitado si corresponde

#### Restricción de Creación
El botón "Nuevo Usuario" se reemplaza cuando se alcanza el límite:

**Estado Normal:**
```
[+ Nuevo Usuario]
```

**Estado Límite Alcanzado:**
```
[Límite Alcanzado] (botón deshabilitado en gris)
⚠️ Mejora tu plan para agregar más usuarios
```

**Lógica implementada:**
```javascript
const canAddMoreUsers = () => {
  const limit = getPlanLimits(tenantInfo.plan);
  if (limit === null) return true; // Ilimitado
  return usuarios.length < limit;
};
```

---

### 3. **Página de Productos**

**Ubicación:** `frontend/src/pages/admin/Productos.jsx`

#### Indicador de Plan y Límites
Se agregó en el header de la página:

- **Badge del plan** con icono y nombre (verde)
- **Contador de productos activos:** "Productos activos: X / Y"
  - Solo cuenta productos con `activo = true`
  - Muestra ilimitado si corresponde

#### Barra de Progreso (Solo Plan Básico)
Cuando el plan es Básico, se muestra una barra de progreso:
- Verde: < 80% del límite
- Roja: ≥ 80% del límite
- Ancho: proporcional a X/50

#### Restricción de Creación
El botón "Agregar Producto" se reemplaza cuando se alcanza el límite:

**Estado Normal:**
```
[Agregar Producto]
```

**Estado Límite Alcanzado:**
```
[Límite Alcanzado] (botón deshabilitado en gris)
⚠️ Mejora tu plan para agregar más productos
```

**Lógica implementada:**
```javascript
const canAddMoreProducts = () => {
  const limit = getPlanLimits(tenantInfo.plan);
  if (limit === null) return true; // Ilimitado
  const activeProducts = productos.filter(p => p.activo).length;
  return activeProducts < limit;
};
```

---

### 4. **Backend - Dashboard Model**

**Ubicación:** `backend/models/dashboard.model.js`

Se agregó contador de usuarios activos a las estadísticas:

**Antes:**
```sql
SELECT 
  (SELECT COUNT(*) FROM pedidos WHERE id_estado NOT IN (6, 7)) as pedidos_activos,
  (SELECT COUNT(*) FROM pedidos WHERE id_estado = 6) as pedidos_completados,
  (SELECT COUNT(*) FROM productos WHERE activo = TRUE) as productos_activos,
  (SELECT COUNT(*) FROM clientes WHERE activo = TRUE) as clientes_activos
```

**Después:**
```sql
SELECT 
  (SELECT COUNT(*) FROM pedidos WHERE id_estado NOT IN (6, 7)) as pedidos_activos,
  (SELECT COUNT(*) FROM pedidos WHERE id_estado = 6) as pedidos_completados,
  (SELECT COUNT(*) FROM productos WHERE activo = TRUE) as productos_activos,
  (SELECT COUNT(*) FROM clientes WHERE activo = TRUE) as clientes_activos,
  (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) as usuarios_activos
```

Ahora el Dashboard muestra correctamente el número de usuarios activos en el widget de plan.

---

## 📊 Límites por Plan

| Característica | Plan Básico | Plan Profesional | Plan Empresarial |
|---------------|-------------|------------------|------------------|
| **Usuarios** | 1 admin | 5 usuarios | Ilimitado |
| **Productos** | 50 productos | 500 productos | Ilimitado |
| **Pedidos/Mes** | 100 pedidos | Ilimitado | Ilimitado |
| **Precio** | Gratis | $29/mes | $79/mes |

---

## 🎨 Estilos Visuales

### Colores por Plan

#### Dashboard Widget:
- **Básico:** Gris (`gray-100/200/300`)
- **Profesional:** Azul (`blue-100/200/300`)
- **Empresarial:** Dorado (`yellow-100/amber-100/300`)

#### Badges en Páginas:
- **Usuarios:** Azul (`blue-50/200/700/900`)
- **Productos:** Verde (`green-50/200/700/900`)

### Iconos por Plan:
- 📦 Básico
- ⭐ Profesional
- 👑 Empresarial

---

## 🔄 Funcionamiento Técnico

### 1. Carga de Información del Tenant
Todas las páginas cargan la info del tenant desde localStorage:

```javascript
const loadTenantInfo = () => {
  try {
    const tenant = JSON.parse(localStorage.getItem('tenant'));
    setTenantInfo(tenant);
  } catch (err) {
    console.error('Error cargando info del tenant:', err);
  }
};
```

### 2. Obtención de Límites por Plan
Función común en todas las páginas:

```javascript
const getPlanLimits = (plan) => {
  const limits = {
    basico: { usuarios: 1, productos: 50, pedidos: 100 },
    profesional: { usuarios: 5, productos: 500, pedidos: null },
    empresarial: { usuarios: null, productos: null, pedidos: null }
  };
  return limits[plan] || limits.basico;
};
```

`null` = Ilimitado

### 3. Validación de Límites
Antes de permitir crear nuevos recursos:

```javascript
// Para usuarios
const canAddMoreUsers = () => {
  if (!tenantInfo) return false;
  const limit = getPlanLimits(tenantInfo.plan).usuarios;
  if (limit === null) return true;
  return usuarios.length < limit;
};

// Para productos
const canAddMoreProducts = () => {
  if (!tenantInfo) return false;
  const limit = getPlanLimits(tenantInfo.plan).productos;
  if (limit === null) return true;
  const activeProducts = productos.filter(p => p.activo).length;
  return activeProducts < limit;
};
```

---

## ✨ Experiencia del Usuario

### Escenario 1: Plan Básico con Límite Cercano
**Productos: 45/50**
- Widget del dashboard muestra barra de progreso al 90% (ROJA)
- Página de productos muestra "45 / 50" con barra roja
- Botón "Agregar Producto" aún habilitado
- Se puede agregar hasta 5 productos más

### Escenario 2: Plan Básico con Límite Alcanzado
**Usuarios: 1/1**
- Widget del dashboard muestra "1 / 1"
- Página de usuarios muestra badge con "1 / 1"
- Botón "Nuevo Usuario" reemplazado por "Límite Alcanzado" (deshabilitado)
- Mensaje: "⚠️ Mejora tu plan para agregar más usuarios"

### Escenario 3: Plan Empresarial
**Productos: 150 (Ilimitado)**
- Widget del dashboard muestra "150 / ∞"
- Página de productos muestra "150 / Ilimitado"
- Sin barra de progreso
- Botón "Agregar Producto" siempre habilitado
- Sin mensajes de límite

---

## 🔮 Mejoras Futuras Sugeridas

### 1. **Notificaciones Preventivas**
- Enviar email cuando se alcance 80% del límite
- Mostrar notificación in-app al acercarse al límite

### 2. **Página de Planes y Upgrade**
- Crear página `/admin/planes` con comparación
- Integrar pasarela de pago (Stripe/PayPal)
- Permitir upgrade automático con pago

### 3. **Downgrade Controlado**
- Bloquear downgrade si excede límites del nuevo plan
- Mostrar advertencia de qué recursos deben eliminarse

### 4. **Histórico de Uso**
- Gráfico mensual de uso de recursos
- Proyección de cuándo se alcanzará el límite
- Recomendación automática de upgrade

### 5. **Soft Limits vs Hard Limits**
- Soft: Permitir exceder temporalmente (con warning)
- Hard: Bloquear completamente al alcanzar límite
- Periodo de gracia de X días antes de bloqueo

### 6. **Dashboard de Administración Global**
- Vista para super-admin que vea todos los tenants
- Estadísticas de uso por plan
- Detección de tenants que necesitan upgrade

---

## 🧪 Testing

### Casos de Prueba

#### Test 1: Verificar Widget de Dashboard
1. Login como admin de cada plan (básico, profesional, empresarial)
2. Verificar que el widget muestra el icono correcto
3. Verificar que los contadores muestran valores correctos
4. Verificar que el botón de upgrade aparece solo en básico/profesional

#### Test 2: Límite de Usuarios
1. Login con plan básico que ya tiene 1 usuario
2. Ir a `/admin/usuarios`
3. Verificar que el botón está deshabilitado
4. Verificar mensaje de advertencia

#### Test 3: Límite de Productos
1. Login con plan básico que tiene 50 productos activos
2. Ir a `/admin/productos`
3. Verificar que el botón está deshabilitado
4. Verificar barra de progreso en rojo

#### Test 4: Plan Empresarial sin Límites
1. Login con plan empresarial
2. Verificar que todos los contadores muestran "Ilimitado"
3. Verificar que todos los botones están habilitados
4. Verificar que no hay advertencias de límite

---

## 📝 Archivos Modificados

```
MODIFICADOS:
✅ frontend/src/pages/admin/Dashboard.jsx
   - Agregado widget de plan con métricas
   - Agregadas funciones getPlanLimits, getPlanColor, getPlanIcon
   - Agregado estado tenantInfo

✅ frontend/src/pages/admin/Usuarios.jsx
   - Agregado indicador de plan en header
   - Agregada validación de límites canAddMoreUsers()
   - Modificado botón "Nuevo Usuario" con estado condicional

✅ frontend/src/pages/admin/Productos.jsx
   - Agregado indicador de plan en header
   - Agregada barra de progreso para plan básico
   - Agregada validación de límites canAddMoreProducts()
   - Modificado botón "Agregar Producto" con estado condicional

✅ backend/models/dashboard.model.js
   - Agregado contador de usuarios_activos en query de estadísticas
```

---

## 🎉 Resultado Final

### Dashboard con Widget de Plan
```
┌────────────────────────────────────────────────────┐
│ 📊 Dashboard                    [🔄 Actualizar]    │
├────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐ │
│ │ 📦  Pastelería Dulce Sabor                     │ │
│ │     Plan Básico                                │ │
│ │                                                │ │
│ │  [🛍️ Productos] [👥 Usuarios] [📦 Pedidos/Mes] │ │
│ │   12 / 50       1 / 1         5 / 100         │ │
│ │   ████░░░░░░                                   │ │
│ │                         [⬆️ Mejorar Plan]      │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ [💰 Ventas Hoy] [📈 Ventas Mes] [🎯 Año] [📦]    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Página de Usuarios con Límite Alcanzado
```
┌────────────────────────────────────────────────────┐
│ Gestión de Usuarios                                │
│ Administra usuarios y asigna roles                 │
│                                                    │
│ ┌──────────────────────────────┐                  │
│ │ ⭐ Plan Profesional          │   [Límite        │
│ │ Usuarios: 5 / 5              │    Alcanzado]    │
│ └──────────────────────────────┘   ⚠️ Mejora tu   │
│                                    plan para...    │
├────────────────────────────────────────────────────┤
│ [Tabla de Usuarios]                                │
└────────────────────────────────────────────────────┘
```

### Página de Productos con Progreso
```
┌────────────────────────────────────────────────────┐
│ Gestión de Productos                               │
│                                                    │
│ ┌──────────────────────────────┐                  │
│ │ 📦 Plan Básico               │   [Agregar       │
│ │ Productos activos: 45 / 50   │    Producto]     │
│ │ ████████████████████░░        │                  │
│ └──────────────────────────────┘                  │
├────────────────────────────────────────────────────┤
│ [🔍 Buscar productos...]                           │
│ Mostrando 45 de 45 productos                       │
│                                                    │
│ [Tabla de Productos]                               │
└────────────────────────────────────────────────────┘
```

---

## ✅ Conclusión

El sistema ahora proporciona **visibilidad completa** de los límites del plan en todas las páginas relevantes del administrador:

✔️ Dashboard muestra resumen general con métricas clave  
✔️ Páginas específicas muestran contadores detallados  
✔️ Restricciones de creación funcionan correctamente  
✔️ Mensajes claros guían al usuario para hacer upgrade  
✔️ Experiencia diferenciada por plan (Básico/Profesional/Empresarial)

Los administradores ahora pueden:
1. Ver claramente cuánto están usando de su plan
2. Saber cuándo están cerca del límite
3. Entender qué necesitan para agregar más recursos
4. Tomar decisiones informadas sobre hacer upgrade

**Sistema listo para producción con indicadores de plan funcionales.** 🚀
