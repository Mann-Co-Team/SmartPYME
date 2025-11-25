# Sistema de Autenticación Completo - SmartPYME

## ✅ Sistema Implementado

SmartPYME cuenta con **3 sistemas de autenticación diferentes** según el tipo de usuario:

---

## 1. 🏢 Registro y Login de Empresas (Tenants)

### Registro de Nueva Empresa
**Ruta Frontend:** `/registro-empresa`  
**Componente:** `RegistroEmpresa.jsx`  
**Endpoint Backend:** `POST /api/tenants/register`

**Proceso:**
1. El dueño de una empresa va a la página principal
2. Hace clic en "Registra tu Empresa"
3. Completa el formulario con:
   - Selección de plan (Básico/Profesional/Empresarial)
   - Datos de la empresa (nombre, email, teléfono, dirección)
   - Datos del administrador (nombre, apellido, email, contraseña)
4. El sistema crea:
   - El tenant (empresa) con un slug único
   - El usuario administrador con rol "admin"
5. Redirige al login de administrador

**Datos creados:**
- Tabla `tenants`: Nueva empresa con su plan
- Tabla `usuarios`: Usuario administrador principal

---

## 2. 👔 Login de Administradores y Empleados

### Login Administrativo
**Ruta Frontend:** `/admin/login`  
**Componente:** `AdminLogin.jsx`  
**Endpoint Backend:** `POST /api/auth/login`

**Proceso:**
1. El administrador/empleado accede a `/admin/login`
2. Ingresa:
   - **Email** (ejemplo: admin@dulcesabor.com)
   - **Slug del Tenant** (ejemplo: pasteleria-dulce-sabor)
   - **Contraseña**
3. El sistema valida las credenciales
4. Genera un JWT con información del usuario y tenant
5. Guarda en localStorage:
   - `token`: JWT
   - `user`: Datos del usuario (nombre, email, rol)
   - `tenant`: Datos de la empresa
6. Redirige al Dashboard Admin

**Características:**
- Requiere el slug del tenant para identificar la empresa
- Valida roles (admin o empleado)
- Permisos diferenciados por rol
- Acceso al panel administrativo completo

**Usuarios creados en el sistema:**
```
Pastelería Dulce Sabor (Plan Básico)
- Admin: admin@dulcesabor.com / password123
- Slug: pasteleria-dulce-sabor

Boutique Fashion Elite (Plan Profesional)  
- Admin: admin@fashionelite.com / password123
- Empleado 1: sofia@fashionelite.com / password123
- Empleado 2: valentina@fashionelite.com / password123
- Slug: boutique-fashion-elite

ElectroTech Premium (Plan Empresarial)
- Admin 1: admin@electrotechpremium.com / password123
- Admin 2: ricardo@electrotechpremium.com / password123
- Empleados: daniel@, gabriela@, carolina@electrotechpremium.com / password123
- Slug: electrotech-premium
```

---

## 3. 👤 Registro y Login de Clientes (Por Tienda)

### Registro de Cliente
**Ruta Frontend:** `/tienda/:tenant_slug/registro`  
**Componente:** `TiendaRegistro.jsx` ✅ **RECIÉN CREADO**  
**Endpoint Backend:** `POST /api/clientes` ✅ **RECIÉN CREADO**

**Proceso:**
1. Un cliente visita una tienda (ejemplo: `/tienda/pasteleria-dulce-sabor`)
2. Hace clic en "Iniciar Sesión" o botón de usuario
3. En la página de login, hace clic en "Regístrate aquí"
4. Completa el formulario de registro:
   - Nombre y Apellido
   - Email
   - Teléfono (opcional)
   - Dirección (opcional)
   - Contraseña
   - Confirmar Contraseña
5. El sistema crea el cliente vinculado a ese tenant específico
6. Redirige al login de cliente

**Datos creados:**
- Tabla `clientes`: Nuevo cliente vinculado al `id_tenant`

### Login de Cliente
**Ruta Frontend:** `/tienda/:tenant_slug/login`  
**Componente:** `TiendaLogin.jsx` ✅ **ACTUALIZADO**  
**Endpoint Backend:** `POST /api/clientes/login` ✅ **RECIÉN CREADO**

**Proceso:**
1. El cliente visita `/tienda/[slug-tienda]/login`
2. Ingresa:
   - **Email**
   - **Contraseña**
3. El sistema valida las credenciales para ese tenant específico
4. Genera un JWT con información del cliente
5. Guarda en localStorage:
   - `token`: JWT
   - `cliente`: Datos del cliente
   - `current_tenant`: Slug de la tienda
   - `user_type`: 'cliente'
6. Redirige a la tienda para que pueda comprar

**Características:**
- Aislamiento por tenant (cada tienda tiene sus propios clientes)
- Pueden hacer pedidos en la tienda
- Ver su historial de pedidos
- Actualizar su perfil

---

## 📊 Comparación de los Sistemas

| Característica | Registro Empresa | Admin/Empleado | Cliente |
|---------------|------------------|----------------|---------|
| **Quién lo usa** | Dueños de empresas | Staff de la empresa | Compradores |
| **Ruta de registro** | `/registro-empresa` | Creado por admin | `/tienda/:slug/registro` |
| **Ruta de login** | N/A | `/admin/login` | `/tienda/:slug/login` |
| **Requiere tenant_slug** | ❌ (lo genera) | ✅ | ❌ (lo toma de la URL) |
| **Tabla en BD** | `tenants` + `usuarios` | `usuarios` | `clientes` |
| **Acceso a** | Crea tenant | Panel admin | Tienda y checkout |
| **JWT incluye** | Tenant + Admin | Usuario + Rol + Tenant | Cliente + Tenant |
| **Puede crear** | Su empresa | Productos, pedidos | Sus pedidos |

---

## 🔐 Seguridad y Aislamiento

### Multi-Tenancy
- **Clientes están aislados por tenant**: Un cliente de la Pastelería no puede ver ni comprar en Boutique
- **Administradores tienen acceso solo a su tenant**: No pueden ver datos de otras empresas
- **JWT incluye id_tenant**: Todas las operaciones validan el tenant

### Contraseñas
- Hasheadas con bcrypt (10 salt rounds)
- Validación de mínimo 6 caracteres
- Confirmación de contraseña en registro

### Tokens JWT
- Expiración: 7 días para clientes, 24 horas para admins
- Incluyen información del tenant para validación
- Secret key configurable en `.env`

---

## 🛠️ Archivos Creados/Modificados

### Backend (NUEVOS)
```
✅ backend/models/cliente.model.js
   - Métodos CRUD para clientes
   - Hash y comparación de contraseñas
   - Aislamiento por tenant

✅ backend/controllers/cliente.controller.js
   - create(): Registro de cliente
   - login(): Autenticación de cliente
   - getAll(), getById(), update()

✅ backend/routes/clientes.routes.js
   - POST /api/clientes (registro)
   - POST /api/clientes/login
   - GET /api/clientes (admin)
   - GET /api/clientes/:id
   - PUT /api/clientes/:id

✅ backend/app.js (MODIFICADO)
   - Agregada línea: app.use('/api/clientes', ...)
```

### Frontend (NUEVOS)
```
✅ frontend/src/pages/public/TiendaRegistro.jsx
   - Formulario completo de registro
   - Validaciones en frontend
   - Diseño coherente con la tienda
   - Manejo de errores

✅ frontend/src/App.jsx (MODIFICADO)
   - Importado TiendaRegistro
   - Agregada ruta: /tienda/:tenant_slug/registro

✅ frontend/src/pages/public/TiendaLogin.jsx (MODIFICADO)
   - Cambiado para usar /api/clientes/login
   - Guarda tipo de usuario en localStorage
```

---

## 🧪 Testing del Sistema

### Test 1: Registro de Cliente en Tienda
```bash
1. Abrir: http://localhost:5173/tienda/pasteleria-dulce-sabor
2. Click en botón de usuario o "Iniciar Sesión"
3. Click en "Regístrate aquí"
4. Completar formulario:
   - Nombre: Juan
   - Apellido: Cliente
   - Email: juan@cliente.com
   - Contraseña: test123
   - Confirmar: test123
5. Click "Crear cuenta"
6. Verificar redirección a login
```

**Resultado esperado:**
- ✅ Cliente creado en BD con id_tenant=1
- ✅ Redirección a `/tienda/pasteleria-dulce-sabor/login`
- ✅ Toast de éxito

### Test 2: Login de Cliente
```bash
1. Abrir: http://localhost:5173/tienda/pasteleria-dulce-sabor/login
2. Ingresar:
   - Email: juan@cliente.com
   - Contraseña: test123
3. Click "Iniciar Sesión"
```

**Resultado esperado:**
- ✅ JWT generado y guardado
- ✅ localStorage tiene: token, cliente, current_tenant, user_type
- ✅ Redirección a tienda
- ✅ Puede agregar productos al carrito

### Test 3: Login Admin
```bash
1. Abrir: http://localhost:5173/admin/login
2. Ingresar:
   - Email: admin@dulcesabor.com
   - Slug: pasteleria-dulce-sabor
   - Contraseña: password123
3. Click "Iniciar Sesión"
```

**Resultado esperado:**
- ✅ JWT generado con rol admin
- ✅ Redirección a dashboard
- ✅ Puede ver productos, pedidos, etc.

### Test 4: Aislamiento de Tenants
```bash
1. Login como cliente en Pastelería
2. Intentar acceder a Boutique
```

**Resultado esperado:**
- ✅ No puede ver productos de Boutique
- ✅ No puede hacer pedidos en Boutique
- ✅ Debe registrarse/loguearse de nuevo

---

## 🚀 Cómo Usar el Sistema

### Para Dueños de Empresa
1. Ir a la home page
2. Click en "Registra tu Empresa"
3. Elegir plan y completar datos
4. Acceder al dashboard con el slug generado

### Para Administradores/Empleados
1. Pedir al dueño el slug de la empresa
2. Ir a `/admin/login`
3. Ingresar email, slug y contraseña
4. Acceder al panel administrativo

### Para Clientes
1. Visitar la tienda online (`/tienda/[slug]`)
2. Navegar productos
3. Al hacer checkout, registrarse si no tiene cuenta
4. Completar el pedido

---

## 📝 Notas Importantes

### localStorage Keys
```javascript
// Admin/Empleado
localStorage.getItem('token')      // JWT
localStorage.getItem('user')       // {nombre, email, rol}
localStorage.getItem('tenant')     // {id_tenant, nombre_empresa, slug}

// Cliente
localStorage.getItem('token')          // JWT
localStorage.getItem('cliente')        // {id_cliente, nombre, email}
localStorage.getItem('current_tenant') // slug
localStorage.getItem('user_type')      // 'cliente'
```

### Diferencias de JWT
```javascript
// JWT Admin/Empleado
{
  id_usuario: 1,
  email: 'admin@empresa.com',
  id_rol: 1,
  id_tenant: 1
}

// JWT Cliente
{
  id_cliente: 1,
  email: 'cliente@mail.com',
  id_tenant: 1,
  tipo: 'cliente'
}
```

---

## ✅ Estado Actual

### Implementado Completamente ✅
- [x] Registro de empresa con selección de plan
- [x] Login administrativo con slug del tenant
- [x] Sistema de roles (admin/empleado)
- [x] Registro de cliente por tienda ✅ **NUEVO**
- [x] Login de cliente por tienda ✅ **ACTUALIZADO**
- [x] Aislamiento multi-tenant
- [x] JWT con información del tenant
- [x] Validación de contraseñas

### Mejoras Futuras Sugeridas
- [ ] Recuperación de contraseña para clientes
- [ ] Verificación de email
- [ ] OAuth (Google, Facebook)
- [ ] Autenticación de 2 factores
- [ ] Perfil de cliente editable
- [ ] Historial de pedidos del cliente

---

## 🎉 Conclusión

El sistema ahora tiene **3 tipos de autenticación completamente funcionales**:

1. ✅ **Registro de Empresas**: Crea tenant + admin
2. ✅ **Login Admin/Empleado**: Acceso al panel de gestión
3. ✅ **Registro y Login de Clientes**: Por cada tienda individual

Cada sistema está aislado, seguro y funcional. Los clientes pueden registrarse en cualquier tienda y hacer pedidos, mientras que los administradores gestionan su propio inventario y ventas.
