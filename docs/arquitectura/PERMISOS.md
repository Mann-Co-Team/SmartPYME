# 🔐 Sistema de Permisos por Rol

## Roles Definidos

### 1️⃣ **Administrador** (ID: 1)
- Acceso completo al sistema
- Puede gestionar todo sin restricciones

### 2️⃣ **Empleado** (ID: 2)
- Acceso limitado al panel administrativo
- No puede eliminar recursos
- No puede gestionar usuarios
- No puede cambiar configuraciones del sistema

### 3️⃣ **Cliente** (ID: 3)
- Solo acceso al sitio público
- Puede crear pedidos
- Ver productos públicos

---

## 📋 Matriz de Permisos

| Funcionalidad | Admin | Empleado | Cliente |
|--------------|-------|----------|---------|
| **Dashboard** | ✅ | ✅ | ❌ |
| **Ver Productos** | ✅ | ✅ | ✅ (público) |
| **Crear Productos** | ✅ | ✅ | ❌ |
| **Editar Productos** | ✅ | ✅ | ❌ |
| **Eliminar Productos** | ✅ | ❌ | ❌ |
| **Ver Categorías** | ✅ | ✅ | ✅ (público) |
| **Crear Categorías** | ✅ | ✅ | ❌ |
| **Editar Categorías** | ✅ | ✅ | ❌ |
| **Eliminar Categorías** | ✅ | ❌ | ❌ |
| **Ver Pedidos** | ✅ | ✅ | ✅ (solo propios) |
| **Actualizar Estado Pedidos** | ✅ | ✅ | ❌ |
| **Eliminar Pedidos** | ✅ | ❌ | ❌ |
| **Crear Pedidos** | ✅ | ✅ | ✅ |
| **Gestión de Usuarios** | ✅ | ❌ | ❌ |
| **Ver Configuraciones** | ✅ | ❌ | ❌ |
| **Editar Configuraciones** | ✅ | ❌ | ❌ |

---

## 🎯 Implementación

### Backend (API)

**Archivo:** `backend/middlewares/permissions.js`

```javascript
const rolePermissions = {
    'admin': [
        'manage_users',        // Gestionar usuarios
        'manage_products',     // Gestionar productos
        'manage_orders',       // Gestionar pedidos
        'manage_categories',   // Gestionar categorías
        'view_dashboard',      // Ver dashboard
        'manage_settings',     // Cambiar configuraciones
        'delete_products',     // Eliminar productos
        'delete_orders'        // Eliminar pedidos
    ],
    'empleado': [
        'manage_products',     // Crear/Editar productos
        'manage_orders',       // Ver/Actualizar pedidos
        'manage_categories',   // Crear/Editar categorías
        'view_dashboard'       // Ver dashboard
    ],
    'cliente': [
        'create_order',        // Crear pedidos
        'view_products',       // Ver productos
        'view_profile',        // Ver perfil
        'update_profile'       // Actualizar perfil
    ]
};
```

### Frontend (UI)

**Archivo:** `frontend/src/utils/permissions.js`

Hook personalizado `usePermissions()` que retorna:

```javascript
{
  isAdmin: boolean,
  isEmployee: boolean,
  canManageUsers: boolean,
  canManageSettings: boolean,
  canDeleteProducts: boolean,
  canDeleteCategories: boolean,
  canDeleteOrders: boolean,
  canManageProducts: boolean,
  canManageCategories: boolean,
  canManageOrders: boolean,
  canViewDashboard: boolean,
  userRole: number,
  userName: string,
  userEmail: string
}
```

---

## 🚀 Uso en el Frontend

### Ejemplo 1: Ocultar botón de eliminar para empleados

```jsx
import { usePermissions } from '../../utils/permissions';

function MiComponente() {
  const { canDeleteProducts } = usePermissions();
  
  return (
    <>
      <button>Editar</button>
      {canDeleteProducts && (
        <button>Eliminar</button>
      )}
    </>
  );
}
```

### Ejemplo 2: Usar el componente PermissionGuard

```jsx
import { PermissionGuard } from '../../utils/permissions';

<PermissionGuard permission="canManageSettings">
  <button>Configuración</button>
</PermissionGuard>
```

### Ejemplo 3: Ocultar sección completa

```jsx
const { isAdmin } = usePermissions();

{isAdmin && (
  <div className="admin-only-section">
    <h2>Configuraciones Avanzadas</h2>
    {/* Contenido solo para admin */}
  </div>
)}
```

---

## 🔒 Restricciones Aplicadas

### 1. **Menú de Navegación**
- ✅ Empleados NO ven "Configuración" en el sidebar
- ✅ Se muestra badge de rol (Administrador/Empleado)

### 2. **Productos**
- ✅ Empleados NO pueden eliminar productos
- ✅ Botón "Eliminar" oculto para empleados

### 3. **Categorías**
- ✅ Empleados NO pueden eliminar categorías
- ✅ Solo admin puede borrar

### 4. **Pedidos**
- ✅ Empleados NO pueden eliminar pedidos
- ✅ Pueden ver y cambiar estados

### 5. **Usuarios**
- ✅ Solo admin puede ver/editar usuarios
- ✅ Ruta completamente bloqueada para empleados

### 6. **Configuraciones**
- ✅ Solo admin puede acceder
- ✅ Menú oculto para empleados

---

## 🧪 Pruebas

### Crear usuarios de prueba:

```bash
# Admin
npm run create-admin
# Email: admin@smartpyme.com | Password: admin123

# Empleado
node backend/create-default-employee.js
# Email: empleado@smartpyme.com | Password: emp123
```

### Verificar permisos:

1. **Login como Admin** → Debe ver todo el menú y todos los botones
2. **Login como Empleado** → NO debe ver:
   - Opción "Configuración" en el menú
   - Botones de "Eliminar" en productos/categorías/pedidos
   - Sección de usuarios

---

## 📝 Notas de Seguridad

1. **Backend siempre valida**: Aunque el frontend oculte botones, el backend SIEMPRE verifica permisos
2. **Token JWT incluye rol**: El rol está en el token, no se puede falsificar
3. **Middleware `authorize()`**: Bloquea peticiones no autorizadas con 403
4. **Consistencia**: Frontend y backend usan los mismos permisos

---

## 🔄 Extender Permisos

Para agregar nuevos permisos:

1. **Backend**: Agregar permiso en `rolePermissions` (`backend/middlewares/permissions.js`)
2. **Frontend**: Agregar permiso en `usePermissions()` (`frontend/src/utils/permissions.js`)
3. **Rutas**: Aplicar `authorize('nuevo_permiso')` en las rutas correspondientes
4. **UI**: Usar `canNuevoPermiso` en los componentes

---

## 👤 Credenciales de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|----------|
| Admin | admin@smartpyme.com | admin123 | Todos ✅ |
| Empleado | empleado@smartpyme.com | emp123 | Limitados ⚠️ |
| Cliente | juan.perez@ejemplo.com | prueba123 | Básicos 📦 |
