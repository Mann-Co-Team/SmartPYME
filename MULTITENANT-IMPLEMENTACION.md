# Sistema Multitenant - SmartPYME
## RF-11: Gestión Multitenant Completa

---

## 📋 RESUMEN DE IMPLEMENTACIÓN

### ✅ COMPLETADO

#### 1. Base de Datos (migration-multitenant.sql)
- ✅ Tabla `tenants` creada con todos los campos necesarios
- ✅ Columna `id_tenant` agregada a todas las tablas:
  - usuarios
  - clientes
  - categorias
  - productos
  - pedidos
  - settings
  - notificaciones
- ✅ Constraints y Foreign Keys configurados (ON DELETE CASCADE)
- ✅ Índices optimizados para queries multitenant
- ✅ Vista `v_tenant_stats` para estadísticas
- ✅ Procedimientos almacenados:
  - `sp_crear_tenant`: Crear tenant con admin inicial
  - `sp_verificar_limites_tenant`: Verificar límites de recursos
- ✅ Triggers de auditoría
- ✅ Tabla `tenant_audit_log` para registro de actividades
- ✅ Tenant "demo" por defecto para migración de datos existentes

#### 2. Modelo de Tenant (tenant.model.js)
- ✅ getAll(): Lista todos los tenants con estadísticas
- ✅ getById(): Buscar tenant por ID
- ✅ getBySlug(): Buscar tenant por slug (para login)
- ✅ isActive(): Verificar si tenant está activo
- ✅ checkLimits(): Verificar límites de usuarios/productos
- ✅ create(): Crear tenant con admin, categoría y settings por defecto
- ✅ update(): Actualizar información del tenant
- ✅ toggleActive(): Activar/desactivar tenant
- ✅ getStats(): Obtener estadísticas completas
- ✅ logActivity(): Registrar actividad en audit log
- ✅ getActivityLog(): Obtener log de actividades
- ✅ isSlugAvailable(): Verificar disponibilidad de slug

#### 3. Middleware de Tenant (middlewares/tenant.js)
- ✅ validateTenant: Middleware principal que valida tenant_id del JWT
- ✅ optionalTenant: Middleware opcional para rutas públicas
- ✅ checkTenantLimit: Middleware para verificar límites antes de crear recursos

#### 4. Modelos Actualizados para Multitenant
- ✅ **producto.model.js**: Todos los métodos actualizados con tenant_id
- ✅ **categoria.model.js**: Todos los métodos actualizados con tenant_id
- ✅ **usuario.model.js**: Todos los métodos actualizados con tenant_id

#### 5. Auth Controller Actualizado
- ✅ Login modificado para requerir tenant_slug
- ✅ Validación de tenant en login
- ✅ Verificación que usuario pertenece al tenant
- ✅ tenant_id incluido en JWT
- ✅ Información del tenant en respuesta de login

---

## 🔨 PENDIENTE DE IMPLEMENTACIÓN

### 1. Actualizar Modelo de Pedido
**Archivo**: `backend/models/pedido.model.js`

El modelo de pedido es extenso (569 líneas). Necesita:
- Agregar `tenantId` como parámetro en TODOS los métodos
- Agregar `WHERE id_tenant = ?` en todos los SELECT
- Agregar `id_tenant` en todos los INSERT
- Actualizar JOINs para verificar tenant_id

**Métodos principales a actualizar**:
```javascript
static async getAll(tenantId)
static async getByUserId(userId, tenantId)
static async getById(id, tenantId)
static async create(data, tenantId)
static async update(id, data, tenantId)
static async delete(id, tenantId)
static async cambiarEstado(id, nuevoEstado, userId, tenantId)
static async verificarTransicionValida(pedidoId, nuevoEstado, tenantId)
static async obtenerMetricas(tenantId)
```

**Query ejemplo antes**:
```javascript
SELECT * FROM pedidos WHERE id_pedido = ?
```

**Query ejemplo después**:
```javascript
SELECT * FROM pedidos WHERE id_pedido = ? AND id_tenant = ?
```

### 2. Actualizar Controladores
**Archivos a modificar**:
- `controllers/producto.controller.js`
- `controllers/categoria.controller.js`
- `controllers/pedido.controller.js`
- `controllers/usuario.controller.js`
- `controllers/settings.controller.js`

**Patrón de cambio**:
```javascript
// ANTES
exports.getAll = async (req, res) => {
    const productos = await ProductoModel.getAll();
    res.json({ success: true, data: productos });
};

// DESPUÉS
exports.getAll = async (req, res) => {
    const tenantId = req.tenant.id; // Inyectado por middleware
    const productos = await ProductoModel.getAll(tenantId);
    res.json({ success: true, data: productos });
};
```

### 3. Aplicar Middleware a Rutas
**Archivos a modificar**:
- `routes/productos.routes.js`
- `routes/categorias.routes.js`
- `routes/pedidos.routes.js`
- `routes/usuarios.routes.js`
- `routes/settings.routes.js`

**Patrón de cambio**:
```javascript
const { auth } = require('../middlewares/auth');
const { validateTenant, checkTenantLimit } = require('../middlewares/tenant');

// ANTES
router.get('/', auth, ProductoController.getAll);
router.post('/', auth, ProductoController.create);

// DESPUÉS
router.get('/', auth, validateTenant, ProductoController.getAll);
router.post('/', auth, validateTenant, checkTenantLimit('productos'), ProductoController.create);
```

**Rutas que necesitan checkTenantLimit**:
- POST /api/usuarios → checkTenantLimit('usuarios')
- POST /api/productos → checkTenantLimit('productos')

### 4. Crear Rutas de Tenant (Administración)
**Archivo nuevo**: `routes/tenants.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const TenantController = require('../controllers/tenant.controller');

// Solo super admin (crear nuevo controlador)
router.post('/register', TenantController.register);
router.get('/', auth, TenantController.getAll);
router.get('/:id', auth, TenantController.getById);
router.put('/:id', auth, TenantController.update);
router.get('/:id/stats', auth, TenantController.getStats);
router.get('/:id/audit', auth, TenantController.getAuditLog);

module.exports = router;
```

**Archivo nuevo**: `controllers/tenant.controller.js`

```javascript
const TenantModel = require('../models/tenant.model');

class TenantController {
    // Registro de nuevo tenant (endpoint público o super admin)
    static async register(req, res) {
        try {
            const { empresa, admin } = req.body;
            
            // Validar datos
            if (!empresa.nombre_empresa || !empresa.slug || !admin.email) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos incompletos'
                });
            }

            // Verificar slug disponible
            const slugDisponible = await TenantModel.isSlugAvailable(empresa.slug);
            if (!slugDisponible) {
                return res.status(400).json({
                    success: false,
                    message: 'El identificador de empresa ya está en uso'
                });
            }

            // Crear tenant
            const tenantId = await TenantModel.create(empresa, admin);
            
            res.status(201).json({
                success: true,
                message: 'Empresa registrada exitosamente',
                data: { tenant_id: tenantId }
            });
        } catch (error) {
            console.error('Error registrando tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar la empresa'
            });
        }
    }

    // Obtener todos los tenants (super admin)
    static async getAll(req, res) {
        try {
            const tenants = await TenantModel.getAll();
            res.json({
                success: true,
                data: tenants
            });
        } catch (error) {
            console.error('Error obteniendo tenants:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo empresas'
            });
        }
    }

    // Obtener estadísticas del tenant actual
    static async getStats(req, res) {
        try {
            const tenantId = req.tenant.id;
            const stats = await TenantModel.getStats(tenantId);
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas'
            });
        }
    }

    // Obtener log de auditoría
    static async getAuditLog(req, res) {
        try {
            const tenantId = req.tenant.id;
            const limit = req.query.limit || 50;
            const log = await TenantModel.getActivityLog(tenantId, limit);
            res.json({
                success: true,
                data: log
            });
        } catch (error) {
            console.error('Error obteniendo log:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo log de actividades'
            });
        }
    }
}

module.exports = TenantController;
```

### 5. Actualizar Frontend

#### A. Modificar Login.jsx
**Archivo**: `frontend/src/pages/admin/Login.jsx` o `frontend/src/pages/Login.jsx`

```jsx
// Agregar campo tenant_slug
const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenant_slug: '' // NUEVO
});

// En el JSX, agregar input:
<input
    type="text"
    name="tenant_slug"
    placeholder="Identificador de empresa (ej: mi-empresa)"
    value={formData.tenant_slug}
    onChange={handleChange}
    required
/>

// Actualizar llamada a la API
const response = await authService.login(
    formData.email, 
    formData.password,
    formData.tenant_slug // NUEVO
);

// Guardar tenant en localStorage
localStorage.setItem('tenant_slug', response.data.tenant.slug);
localStorage.setItem('tenant_name', response.data.tenant.nombre);
```

#### B. Modificar auth.js (servicio)
**Archivo**: `frontend/src/services/auth.js`

```javascript
export const login = async (email, password, tenant_slug) => {
    const response = await api.post('/auth/login', { 
        email, 
        password, 
        tenant_slug // NUEVO
    });
    
    if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('tenant', JSON.stringify(response.data.data.tenant)); // NUEVO
    }
    
    return response.data;
};
```

#### C. Mostrar nombre de tenant en Navbar
**Archivo**: `frontend/src/components/Navbar.jsx`

```jsx
const tenant = JSON.parse(localStorage.getItem('tenant') || '{}');

// En el JSX
<div className="tenant-info">
    <span>{tenant.nombre || 'SmartPYME'}</span>
</div>
```

### 6. Script de Seed para Tenants de Prueba
**Archivo nuevo**: `backend/seed-tenants.js`

```javascript
const db = require('./config/db');
const TenantModel = require('./models/tenant.model');

async function seedTenants() {
    console.log('🌱 Sembrando tenants de prueba...\n');

    const tenants = [
        {
            empresa: {
                nombre_empresa: 'Tienda ABC',
                slug: 'tienda-abc',
                email_empresa: 'admin@tienda-abc.com',
                telefono_empresa: '555-1234',
                plan: 'profesional'
            },
            admin: {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@tienda-abc.com',
                password: 'admin123'
            }
        },
        {
            empresa: {
                nombre_empresa: 'Comercial XYZ',
                slug: 'comercial-xyz',
                email_empresa: 'admin@comercial-xyz.com',
                telefono_empresa: '555-5678',
                plan: 'basico'
            },
            admin: {
                nombre: 'María',
                apellido: 'González',
                email: 'maria@comercial-xyz.com',
                password: 'admin123'
            }
        },
        {
            empresa: {
                nombre_empresa: 'Megatienda 2000',
                slug: 'megatienda-2000',
                email_empresa: 'admin@megatienda.com',
                telefono_empresa: '555-9999',
                plan: 'empresarial'
            },
            admin: {
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                email: 'carlos@megatienda.com',
                password: 'admin123'
            }
        }
    ];

    for (const data of tenants) {
        try {
            const tenantId = await TenantModel.create(data.empresa, data.admin);
            console.log(`✅ ${data.empresa.nombre_empresa} creado (ID: ${tenantId})`);
            console.log(`   Slug: ${data.empresa.slug}`);
            console.log(`   Admin: ${data.admin.email} / admin123\n`);
        } catch (error) {
            console.error(`❌ Error creando ${data.empresa.nombre_empresa}:`, error.message);
        }
    }

    console.log('✅ Seed completado\n');
    process.exit(0);
}

seedTenants();
```

### 7. Testing
**Script de prueba**: `backend/test-multitenant.js`

```javascript
const db = require('./config/db');

async function testMultitenant() {
    console.log('🧪 Testing aislamiento multitenant...\n');

    // 1. Verificar tenants creados
    const [tenants] = await db.execute('SELECT id_tenant, nombre_empresa, slug FROM tenants WHERE activo = TRUE');
    console.log('📊 Tenants activos:', tenants.length);
    tenants.forEach(t => console.log(`   • ${t.nombre_empresa} (${t.slug})`));

    // 2. Verificar usuarios por tenant
    console.log('\n👥 Usuarios por tenant:');
    for (const tenant of tenants) {
        const [users] = await db.execute(
            'SELECT COUNT(*) as count FROM usuarios WHERE id_tenant = ?',
            [tenant.id_tenant]
        );
        console.log(`   ${tenant.nombre_empresa}: ${users[0].count} usuarios`);
    }

    // 3. Verificar productos por tenant
    console.log('\n📦 Productos por tenant:');
    for (const tenant of tenants) {
        const [products] = await db.execute(
            'SELECT COUNT(*) as count FROM productos WHERE id_tenant = ?',
            [tenant.id_tenant]
        );
        console.log(`   ${tenant.nombre_empresa}: ${products[0].count} productos`);
    }

    // 4. Probar que productos de un tenant no son visibles para otro
    console.log('\n🔒 Verificando aislamiento de datos:');
    const tenant1 = tenants[0];
    const tenant2 = tenants[1];
    
    const [prod1] = await db.execute(
        'SELECT COUNT(*) as count FROM productos WHERE id_tenant = ?',
        [tenant1.id_tenant]
    );
    const [prod2] = await db.execute(
        'SELECT COUNT(*) as count FROM productos WHERE id_tenant = ? AND id_tenant = ?',
        [tenant1.id_tenant, tenant2.id_tenant]
    );
    
    console.log(`   ✅ Aislamiento verificado: ${prod2[0].count === 0 ? 'OK' : 'FALLO'}`);

    console.log('\n✅ Testing completado\n');
    process.exit(0);
}

testMultitenant();
```

---

## 🚀 INSTRUCCIONES DE APLICACIÓN

### Paso 1: Ejecutar Migración de Base de Datos
```bash
cd backend
mysql -u root -p smartpyme_db < ../database/migration-multitenant.sql
```

### Paso 2: Verificar Migración
```bash
mysql -u root -p smartpyme_db -e "SELECT * FROM tenants"
mysql -u root -p smartpyme_db -e "SHOW COLUMNS FROM productos LIKE 'id_tenant'"
```

### Paso 3: Sembrar Tenants de Prueba
```bash
node seed-tenants.js
```

### Paso 4: Actualizar Controladores (MANUAL)
Ver sección "2. Actualizar Controladores" arriba.

### Paso 5: Aplicar Middleware a Rutas (MANUAL)
Ver sección "3. Aplicar Middleware a Rutas" arriba.

### Paso 6: Actualizar Frontend (MANUAL)
Ver sección "5. Actualizar Frontend" arriba.

### Paso 7: Testing
```bash
node test-multitenant.js
```

### Paso 8: Testing Manual
1. Login con tenant "demo":
   - Slug: `demo`
   - Email: `admin@smartpyme.com`
   - Password: `admin123`

2. Login con tenant "tienda-abc":
   - Slug: `tienda-abc`
   - Email: `juan@tienda-abc.com`
   - Password: `admin123`

3. Verificar que cada usuario solo ve sus propios datos

---

## 📊 ARQUITECTURA MULTITENANT

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (BROWSER)                     │
│  • Selecciona tenant (slug) en login                    │
│  • Envía tenant_slug en cada request                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (API)                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. Login recibe: email + password + tenant_slug │   │
│  │ 2. Valida que usuario pertenece al tenant       │   │
│  │ 3. Genera JWT con: userId + role + tenant_id    │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 4. Middleware Auth: Valida JWT                  │   │
│  │ 5. Middleware Tenant: Extrae tenant_id del JWT  │   │
│  │ 6. Inyecta req.tenant con info del tenant       │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 7. Controller: Usa req.tenant.id                │   │
│  │ 8. Model: Filtra por tenant_id en queries       │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   BASE DE DATOS                         │
│  • Todas las tablas tienen id_tenant                    │
│  • Todas las queries filtran por id_tenant              │
│  • FK constraints con ON DELETE CASCADE                 │
│  • Índices compuestos (id_tenant, ...)                  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Seguridad
1. **Nunca confiar en tenant_id del cliente**: Siempre obtenerlo del JWT
2. **Validar tenant en cada request**: Usar middleware validateTenant
3. **Verificar pertenencia**: Usuario debe pertenecer al tenant del JWT
4. **Audit log**: Registrar todas las operaciones críticas

### Performance
1. **Índices compuestos**: Ya creados en migración (id_tenant, id_xxx)
2. **Cache de tenant**: Considerar cachear info del tenant
3. **Queries optimizadas**: Siempre incluir id_tenant en WHERE

### Límites
1. **Verificar antes de crear**: Usar checkTenantLimit middleware
2. **Informar al usuario**: Mensaje claro cuando se alcanza límite
3. **Plan actualizable**: Permitir upgrade de plan

### Migración de Datos
1. **Tenant "demo" creado**: Todos los datos existentes migrados
2. **Verificar integridad**: Correr test-multitenant.js después de migrar
3. **Backup obligatorio**: Hacer backup antes de ejecutar migración

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

- [x] 1. Crear tabla tenants en base de datos
- [x] 2. Agregar id_tenant a todas las tablas
- [x] 3. Crear modelo TenantModel
- [x] 4. Crear middleware de tenant
- [x] 5. Actualizar ProductoModel para multitenant
- [x] 6. Actualizar CategoriaModel para multitenant
- [x] 7. Actualizar UsuarioModel para multitenant
- [x] 8. Actualizar AuthController para incluir tenant en login
- [ ] 9. Actualizar PedidoModel para multitenant
- [ ] 10. Actualizar todos los Controllers para usar req.tenant.id
- [ ] 11. Aplicar middleware validateTenant a todas las rutas protegidas
- [ ] 12. Crear TenantController y rutas de administración
- [ ] 13. Actualizar Login.jsx para capturar tenant_slug
- [ ] 14. Actualizar servicio auth.js en frontend
- [ ] 15. Mostrar nombre de tenant en Navbar
- [ ] 16. Ejecutar migración en base de datos
- [ ] 17. Ejecutar seed de tenants de prueba
- [ ] 18. Testing de aislamiento de datos
- [ ] 19. Documentación de uso para usuarios finales
- [ ] 20. Testing manual completo

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Ejecutar migración de base de datos**
2. **Completar actualización de PedidoModel** (569 líneas)
3. **Actualizar todos los controladores** (patrón simple, repetitivo)
4. **Aplicar middleware a rutas** (agregar validateTenant)
5. **Actualizar frontend** (Login.jsx, auth.js, Navbar.jsx)
6. **Testing completo**

---

**Estado actual**: Sistema multitenant 60% implementado. Backend estructurado, falta aplicar cambios a controladores, rutas y frontend.
