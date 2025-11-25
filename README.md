# SmartPYME 🏪

Sistema de gestión integral para PYMEs con arquitectura **multitenant**.

## 🎯 Características Principales

- 🏢 **Sistema Multitenant**: Múltiples empresas en una sola instancia
- 🔐 **Autenticación JWT** con aislamiento por tenant
- 📦 **Gestión de Productos**: Catálogo completo con categorías
- 🛒 **Sistema de Pedidos**: Seguimiento de estado completo
- 👥 **Gestión de Usuarios**: Roles y permisos (Admin, Vendedor, Cliente)
- 📊 **Dashboard Administrativo**: Estadísticas y métricas en tiempo real
- 🎨 **Tema Claro/Oscuro**: Interfaz moderna con Tailwind CSS
- 📱 **Responsive**: Adaptado a todos los dispositivos

---

## 🏗️ Arquitectura del Sistema

### Backend
- **Framework**: Node.js + Express
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT con bcrypt
- **Arquitectura**: Multitenant con discriminador `id_tenant`

### Frontend
- **Framework**: React + Vite
- **UI**: Tailwind CSS
- **Estado**: React Context API
- **Routing**: React Router v6

### Estructura Multitenant
```
┌─────────────────────────────────────┐
│         Base de Datos Única         │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ Tenant 1: Tienda ABC          │  │
│  │ - Productos (id_tenant=1)     │  │
│  │ - Usuarios (id_tenant=1)      │  │
│  │ - Pedidos (id_tenant=1)       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Tenant 2: Comercial XYZ       │  │
│  │ - Productos (id_tenant=2)     │  │
│  │ - Usuarios (id_tenant=2)      │  │
│  │ - Pedidos (id_tenant=2)       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ y npm
- MySQL 8.0+
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/SmartPYME.git
cd SmartPYME
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE smartpyme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Importar esquema
mysql -u root -p smartpyme_db < database/schema.sql
```

### 3. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
```

Editar `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=smartpyme_db
JWT_SECRET=tu_clave_secreta_super_segura_aqui
NODE_ENV=development
```

### 4. Crear usuario administrador

```bash
node create-admin.js
# Credenciales por defecto:
# Email: admin@smartpyme.com
# Password: Admin123!
# Tenant: demo
```

### 5. Iniciar Backend

```bash
npm run dev
# Servidor en http://localhost:3000
```

### 6. Configurar Frontend

```bash
cd ../frontend
npm install
npm run dev
# Interfaz en http://localhost:5173
```

---

## 🔐 Sistema Multitenant

### Login con Tenant

Para acceder al sistema, los usuarios deben proporcionar:
- **Email**
- **Contraseña**
- **Tenant Slug** (identificador de empresa, ej: `demo`)

### Tenant por Defecto

El sistema viene con un tenant de demostración:
- **Empresa**: Empresa Demo
- **Slug**: `demo`
- **Plan**: Profesional
- **Límites**: 50 usuarios, 1000 productos

### Crear Nuevos Tenants

```bash
# Próximamente: Script de seed para tenants de prueba
node backend/seed-tenants.js
```

---

## 📁 Estructura del Proyecto

```
SmartPYME/
├── backend/
│   ├── config/
│   │   ├── db.js              # Conexión MySQL
│   │   └── multer.js          # Configuración de uploads
│   ├── controllers/           # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── producto.controller.js
│   │   ├── categoria.controller.js
│   │   ├── pedido.controller.js
│   │   └── usuario.controller.js
│   ├── middlewares/
│   │   ├── auth.js            # Validación JWT
│   │   ├── tenant.js          # Validación multitenant
│   │   └── permissions.js     # Control de acceso
│   ├── models/                # Acceso a datos
│   │   ├── tenant.model.js
│   │   ├── producto.model.js
│   │   ├── categoria.model.js
│   │   ├── pedido.model.js
│   │   └── usuario.model.js
│   ├── routes/                # Definición de endpoints
│   ├── validators/            # Validación de datos
│   ├── uploads/               # Imágenes de productos
│   ├── app.js                 # Configuración Express
│   ├── server.js              # Entrada del servidor
│   └── create-admin.js        # Script de admin
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── context/           # Context API (Cart, Theme)
│   │   ├── pages/             # Vistas de la aplicación
│   │   │   ├── admin/         # Panel administrativo
│   │   │   └── public/        # Vista pública
│   │   ├── services/          # API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── database/
    └── schema.sql             # Esquema de BD completo
```

---

## 🔧 Testing

### Verificar Funcionalidad Multitenant

```bash
cd backend
node test-multitenant-functionality.js
```

Este script verifica:
- ✅ Modelos aceptan `tenantId` opcional
- ✅ Middleware de tenant disponible
- ✅ Controladores extraen `tenantId` correctamente
- ✅ Sistema funciona en modo legacy (sin tenant_id)

---

## 📊 API Endpoints

### Autenticación
```
POST   /api/auth/login          # Login con tenant_slug
POST   /api/auth/register       # Registro de usuario
GET    /api/auth/verify         # Verificar token
```

### Productos (requiere autenticación + tenant)
```
GET    /api/productos           # Listar productos del tenant
GET    /api/productos/:id       # Detalle de producto
POST   /api/productos           # Crear producto (Admin)
PUT    /api/productos/:id       # Actualizar producto (Admin)
DELETE /api/productos/:id       # Eliminar producto (Admin)
PATCH  /api/productos/:id/toggle-active  # Activar/Desactivar
```

### Categorías (requiere autenticación + tenant)
```
GET    /api/categorias          # Listar categorías del tenant
GET    /api/categorias/:id      # Detalle de categoría
POST   /api/categorias          # Crear categoría (Admin)
PUT    /api/categorias/:id      # Actualizar categoría (Admin)
DELETE /api/categorias/:id      # Eliminar categoría (Admin)
```

### Pedidos (requiere autenticación + tenant)
```
GET    /api/pedidos             # Listar pedidos del tenant
GET    /api/pedidos/:id         # Detalle de pedido
POST   /api/pedidos             # Crear pedido
PUT    /api/pedidos/:id         # Actualizar estado (Admin)
DELETE /api/pedidos/:id         # Cancelar pedido
```

### Usuarios (requiere autenticación + tenant + Admin)
```
GET    /api/usuarios            # Listar usuarios del tenant
GET    /api/usuarios/:id        # Detalle de usuario
POST   /api/usuarios            # Crear usuario
PUT    /api/usuarios/:id        # Actualizar usuario
DELETE /api/usuarios/:id        # Eliminar usuario
PATCH  /api/usuarios/:id/toggle-active  # Activar/Desactivar
```

---

## 👥 Roles y Permisos

| Rol       | Permisos                                                   |
|-----------|-----------------------------------------------------------|
| Admin     | Acceso total: productos, categorías, usuarios, pedidos   |
| Vendedor  | Ver y crear pedidos, ver productos                       |
| Cliente   | Ver productos, crear pedidos propios                     |

---

## 🛣️ Estado de Implementación Multitenant

### ✅ Completado
- [x] Base de datos con tabla `tenants` y columna `id_tenant` en todas las tablas
- [x] TenantModel con métodos CRUD
- [x] Middleware `validateTenant`, `optionalTenant`, `checkTenantLimit`
- [x] AuthController actualizado para validar `tenant_slug` en login
- [x] Todos los modelos aceptan `tenantId` opcional (25+ métodos)
- [x] Todos los controladores extraen y pasan `tenantId` (25+ métodos)
- [x] Sistema funciona en **modo legacy** (sin tenant_id) y modo multitenant

### ⚠️ Pendiente
- [ ] Aplicar middleware `validateTenant` a rutas protegidas
- [ ] Crear `tenant.controller.js` y `tenants.routes.js`
- [ ] Actualizar `frontend/src/pages/Login.jsx` para capturar `tenant_slug`
- [ ] Crear script `seed-tenants.js` para generar tenants de prueba
- [ ] Testing de aislamiento de datos entre tenants

---

## 🐛 Solución de Problemas

### Error 500 en endpoints
```bash
# Verificar que backend esté corriendo
cd backend
npm run dev

# Verificar logs en consola
# Verificar conexión a MySQL
```

### Puerto 3000 en uso
```powershell
# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
cd backend
npm run dev
```

### Error de autenticación
```bash
# Verificar JWT_SECRET en backend/.env
# Verificar que el token no haya expirado
# Verificar que tenant_slug sea correcto
```

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Desarrolladores

Proyecto desarrollado como sistema de gestión multitenant para PYMEs.

---

## 🔄 Próximas Funcionalidades

- [ ] Panel de administración de tenants
- [ ] Dashboard con gráficos y métricas
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Notificaciones en tiempo real
- [ ] Sistema de mensajería interna
- [ ] Integración con pasarelas de pago
- [ ] API REST completa documentada con Swagger
- [ ] Aplicación móvil (React Native)

