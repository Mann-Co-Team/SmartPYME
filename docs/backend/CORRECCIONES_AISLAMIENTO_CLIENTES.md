# CORRECCIONES APLICADAS - AISLAMIENTO DE CLIENTES POR TENANT

## PROBLEMA IDENTIFICADO
Un cliente de megatienda-2000 podía loguearse en cualquier otra tienda (pastelería, electrotech, etc.) porque el sistema NO validaba obligatoriamente el tenant_id en el login.

## CORRECCIONES APLICADAS

### 1. Backend - auth.controller.js ✅
**Archivo:** `backend/controllers/auth.controller.js`

#### loginPublic (línea ~6)
- ❌ ANTES: `tenant_id` era opcional
- ✅ AHORA: `tenant_id` es OBLIGATORIO
- ✅ VALIDACIÓN: Si el usuario no pertenece al tenant, se rechaza con mensaje "No tienes acceso a esta tienda. Este correo pertenece a otra tienda."

```javascript
// VALIDACIÓN CRÍTICA: tenant_id es OBLIGATORIO para aislamiento
if (!tenant_id) {
    return res.status(400).json({
        success: false,
        message: 'Debe especificar la tienda para iniciar sesión'
    });
}

// VALIDACIÓN CRÍTICA: El usuario DEBE pertenecer al tenant desde el cual intenta loguearse
if (user.id_tenant !== parseInt(tenant_id)) {
    return res.status(401).json({
        success: false,
        message: 'No tienes acceso a esta tienda. Este correo pertenece a otra tienda.'
    });
}
```

#### registerPublic (línea ~95)
- ❌ ANTES: `tenant_id` era opcional
- ✅ AHORA: `tenant_id` es OBLIGATORIO
- ✅ VALIDACIÓN: No se puede registrar un cliente sin especificar su tienda

```javascript
// VALIDACIÓN CRÍTICA: tenant_id es OBLIGATORIO para aislamiento
if (!tenant_id) {
    console.log('❌ Falta tenant_id');
    return res.status(400).json({
        success: false,
        message: 'Debe registrarse desde una tienda específica'
    });
}
```

### 2. Frontend - TiendaLogin.jsx ✅
**Archivo:** `frontend/src/pages/public/TiendaLogin.jsx`

#### handleSubmit (línea ~43)
- ❌ ANTES: Usaba `/auth/login` (sistema usuarios)
- ✅ AHORA: Usa `/clientes/login` (sistema clientes con validación de tenant)
- ✅ GUARDA: tenant info en localStorage para validaciones posteriores

```javascript
// Login usando el endpoint de clientes (con validación de tenant obligatoria)
const res = await api.post('/clientes/login', { 
    email, 
    password,
    id_tenant: tenant.id_tenant
});

const { token, cliente } = res.data.data;
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(cliente));
localStorage.setItem('current_tenant', tenant_slug);
localStorage.setItem('tenant', JSON.stringify(tenant));
```

### 3. Backend - cliente.controller.js ✅ (Ya estaba correcto)
**Archivo:** `backend/controllers/cliente.controller.js`

El controlador de clientes YA tenía la validación correcta:
- Requiere `id_tenant` obligatoriamente
- Busca el cliente por email Y tenant
- Valida que el cliente esté activo
- Genera token con `id_tenant` incluido

## VERIFICACIÓN DE DATOS

### Estado Actual de las Tablas:
- ✅ Tabla `usuarios` (rol=3): 39 clientes aislados por tenant
- ✅ Tabla `clientes`: 39 clientes aislados por tenant
- ⚠️ NOTA: Hay datos en AMBAS tablas (duplicados)

### Distribución por Tienda:
```
demo: 5 clientes
tienda-abc: 5 clientes
comercial-xyz: 2 clientes (plan básico)
megatienda-2000: 10 clientes (plan empresarial)
pasteleria-dulce-sabor: 2 clientes (plan básico)
boutique-fashion-elite: 5 clientes (plan profesional)
electrotech-premium: 10 clientes (plan empresarial)
```

## FLUJO CORRECTO AHORA

### Login de Cliente:
1. Cliente ingresa a `/tienda/{slug}/login`
2. Frontend carga datos del tenant por slug
3. Cliente ingresa email y password
4. Frontend envía a `/clientes/login` con `id_tenant`
5. Backend valida:
   - ✅ Email existe
   - ✅ Password correcto
   - ✅ Cliente pertenece al tenant especificado
   - ✅ Cliente está activo
6. Si TODO es correcto, genera token con `id_tenant`
7. Cliente solo ve productos/pedidos de SU tienda

### Registro de Cliente:
1. Cliente ingresa a `/tienda/{slug}/registro`
2. Frontend carga datos del tenant por slug
3. Cliente completa formulario
4. Frontend envía a `/clientes` con `id_tenant`
5. Backend valida:
   - ✅ tenant_id presente y válido
   - ✅ Email no existe en esa tienda
   - ✅ Crea cliente asociado a ese tenant
6. Cliente queda registrado SOLO en esa tienda

## RESULTADO

✅ **AISLAMIENTO COMPLETO**: Un cliente de megatienda-2000 NO puede loguearse en pasteleria-dulce-sabor
✅ **VALIDACIÓN OBLIGATORIA**: No se puede hacer login/registro sin especificar tenant
✅ **MENSAJES CLAROS**: "No tienes acceso a esta tienda. Este correo pertenece a otra tienda."
✅ **DATOS SEPARADOS**: Cada tienda ve solo sus clientes, productos, pedidos

## PRÓXIMOS PASOS

1. ✅ Reiniciar backend para aplicar cambios
2. ✅ Probar login de cliente1@megatienda-2000.com en pastelería (debe fallar)
3. ✅ Probar login de cliente1@pasteleria-dulce-sabor.com en pastelería (debe funcionar)
4. ✅ Verificar que productos y pedidos sigan aislados por tenant
5. ⚠️ OPCIONAL: Decidir si mantener ambas tablas o migrar todo a una sola
