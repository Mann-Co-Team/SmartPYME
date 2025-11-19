# ✅ RF-2: Registro y Autenticación de Clientes

## 📋 Estado: IMPLEMENTADO COMPLETAMENTE

---

## 📝 Descripción del Requisito

El sistema permite el registro de nuevos clientes, autenticación y preparación para recuperación de contraseñas mediante correo electrónico, validando la **unicidad del correo** y **seguridad de la contraseña**.

---

## ✅ Funcionalidades Implementadas

### 1. **Registro de Clientes**
- ✅ Formulario de registro con campos:
  - **Nombre completo** (obligatorio)
  - **Email** (obligatorio, único)
  - **Contraseña** (obligatorio, mínimo 6 caracteres)
  - **Confirmar contraseña** (obligatorio, debe coincidir)
  - **Teléfono** (opcional)
- ✅ Validación de campos en frontend
- ✅ Validación de unicidad de email en backend
- ✅ Contraseña hasheada con bcrypt
- ✅ Asignación automática de rol "cliente" (id_rol = 3)
- ✅ Mensajes de error específicos según el requisito

### 2. **Autenticación de Clientes**
- ✅ Formulario de inicio de sesión con:
  - **Email** (obligatorio)
  - **Contraseña** (obligatorio)
- ✅ Validación de credenciales
- ✅ Generación de token JWT (válido 24 horas)
- ✅ Almacenamiento de token y datos del usuario en localStorage
- ✅ Redirección según rol del usuario:
  - Admin/Empleado → Dashboard administrativo
  - Cliente → Página de inicio
- ✅ Verificación de estado activo del usuario
- ✅ Mensajes de error apropiados

### 3. **Validaciones de Seguridad**
- ✅ Email debe ser único en la base de datos
- ✅ Contraseña mínimo 6 caracteres
- ✅ Confirmación de contraseña debe coincidir
- ✅ Validación de formato de email
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Tokens JWT con expiración de 24 horas
- ✅ Verificación de usuario activo

### 4. **Mensajes del Sistema (Según RF-2)**
- ✅ **Registro exitoso**: "¡Registro exitoso! Bienvenido a SmartPYME"
- ✅ **Login exitoso**: "¡Bienvenido!"
- ✅ **Email duplicado**: "El correo ingresado ya está registrado"
- ✅ **Error de conexión**: "Error de conexión. Intente nuevamente más tarde"
- ✅ **Credenciales inválidas**: "Credenciales inválidas"
- ✅ **Campos vacíos**: "Por favor completa todos los campos obligatorios"
- ✅ **Contraseñas no coinciden**: "Las contraseñas no coinciden"
- ✅ **Contraseña corta**: "La contraseña debe tener al menos 6 caracteres"
- ✅ **Usuario desactivado**: "Usuario desactivado"

### 5. **Preparación para Recuperación de Contraseña**
- ✅ Botón "¿Olvidaste tu contraseña?" en login
- ⏳ Funcionalidad de envío de email (pendiente implementación futura)
- 💡 Mensaje informativo: "Funcionalidad de recuperación de contraseña próximamente"

### 6. **Experiencia de Usuario**
- ✅ Diseño moderno y responsive
- ✅ Iconos en campos de formulario
- ✅ Estados de carga (spinners)
- ✅ Validación en tiempo real
- ✅ Toasts para notificaciones
- ✅ Enlaces de navegación entre registro/login
- ✅ Enlace al inicio y a login de administrador
- ✅ Deshabilitación de botones durante carga

---

## 🎯 Flujo de Interacción Implementado

### Caso 1: Registro de Nuevo Cliente
**Usuario:** Ingresa a la plataforma y selecciona "Registrarse"
1. Sistema muestra formulario de registro
2. Usuario completa campos obligatorios (nombre, email, contraseña, confirmar contraseña)
3. Usuario envía información

**Sistema responde:**
- ✅ **Correcto**: Muestra "¡Registro exitoso! Bienvenido a SmartPYME" y redirige al inicio
- ❌ **Email duplicado**: "El correo ingresado ya está registrado"
- ❌ **Error de conexión**: "Error de conexión. Intente nuevamente más tarde"
- ❌ **Validación frontend**: Mensajes específicos por cada campo

### Caso 2: Inicio de Sesión
**Usuario:** Selecciona "Iniciar sesión"
1. Sistema muestra formulario de login
2. Usuario ingresa email y contraseña
3. Usuario envía información

**Sistema responde:**
- ✅ **Correcto**: Muestra "¡Bienvenido!" y redirige según rol
  - Cliente → Página de inicio (/)
  - Admin/Empleado → Dashboard (/admin/dashboard)
- ❌ **Credenciales incorrectas**: "Credenciales inválidas"
- ❌ **Usuario desactivado**: "Usuario desactivado"
- ❌ **Error de conexión**: "Error de conexión. Intente nuevamente más tarde"

### Caso 3: Validación de Email Duplicado
1. Usuario intenta registrarse con email existente
2. Sistema verifica en base de datos
3. Sistema responde: "El correo ingresado ya está registrado"
4. Usuario no es creado, formulario permanece con datos

### Caso 4: Error de Conexión
1. Usuario intenta registrarse o iniciar sesión
2. Backend no responde o hay error de red
3. Sistema detecta error de conexión
4. Sistema muestra: "Error de conexión. Intente nuevamente más tarde"

---

## 🔧 Implementación Técnica

### Backend - Rutas API

**POST /api/auth/register-public**
```javascript
// Registro de clientes públicos
// Valida: nombre, email, password obligatorios
// Verifica: unicidad de email
// Crea: usuario con rol cliente (id_rol = 3)
// Responde: mensaje de éxito o error específico
```

**POST /api/auth/login**
```javascript
// Autenticación de usuarios
// Valida: email y password
// Verifica: existencia, estado activo, contraseña correcta
// Genera: JWT token con expiración 24h
// Responde: token y datos del usuario
```

### Validaciones Backend

```javascript
// Validación de email único
const existingUser = await UsuarioModel.getByEmail(email);
if (existingUser) {
    return res.status(400).json({
        message: 'El correo ingresado ya está registrado'
    });
}

// Validación de contraseña con bcrypt
const isValidPassword = await UsuarioModel.validatePassword(password, user.password);

// Verificación de usuario activo
if (!user.activo) {
    return res.status(401).json({
        message: 'Usuario desactivado'
    });
}
```

### Frontend - Validaciones

**Registro (Register.jsx)**
```javascript
// Validación de campos obligatorios
if (!formData.nombre || !formData.email || !formData.password) {
    toast.error('Por favor completa todos los campos obligatorios');
}

// Validación de coincidencia de contraseñas
if (formData.password !== formData.confirmPassword) {
    toast.error('Las contraseñas no coinciden');
}

// Validación de longitud de contraseña
if (formData.password.length < 6) {
    toast.error('La contraseña debe tener al menos 6 caracteres');
}

// Manejo de errores de conexión
if (error.response?.status === 500 || error.code === 'ERR_NETWORK') {
    toast.error('Error de conexión. Intente nuevamente más tarde');
} else if (error.response?.data?.message) {
    toast.error(error.response.data.message); // Ej: "El correo ingresado ya está registrado"
}
```

**Login (Login.jsx)**
```javascript
// Almacenamiento de sesión
localStorage.setItem('token', response.data.data.token);
localStorage.setItem('user', JSON.stringify(response.data.data.user));

// Redirección según rol
if (response.data.data.user.id_rol === 1 || response.data.data.user.id_rol === 2) {
    navigate('/admin/dashboard'); // Admin o Empleado
} else {
    navigate('/'); // Cliente
}
```

### Seguridad Implementada

**Encriptación de Contraseñas**
```javascript
// En usuario.model.js
const hashedPassword = await bcrypt.hash(password, 10);
```

**Tokens JWT**
```javascript
// Token con información del usuario y expiración
const token = jwt.sign(
    { 
        userId: user.id_usuario,
        email: user.email,
        role: user.id_rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```

**Validación de Email Único**
```javascript
// Antes de crear usuario, verificar existencia
const existingUser = await UsuarioModel.getByEmail(email);
if (existingUser) {
    return error('El correo ingresado ya está registrado');
}
```

---

## 🧪 Casos de Prueba

### ✅ Prueba 1: Registro Exitoso
- **Acción**: Completar formulario con datos válidos y email único
- **Resultado Esperado**: Mensaje "¡Registro exitoso! Bienvenido a SmartPYME", redirección al inicio
- **Estado**: ✅ PASS

### ✅ Prueba 2: Email Duplicado
- **Acción**: Intentar registrarse con email ya existente (ej: admin@smartpyme.com)
- **Resultado Esperado**: Mensaje "El correo ingresado ya está registrado"
- **Estado**: ✅ PASS

### ✅ Prueba 3: Contraseñas No Coinciden
- **Acción**: Ingresar contraseña y confirmación diferentes
- **Resultado Esperado**: Mensaje "Las contraseñas no coinciden"
- **Estado**: ✅ PASS

### ✅ Prueba 4: Contraseña Corta
- **Acción**: Ingresar contraseña de menos de 6 caracteres
- **Resultado Esperado**: Mensaje "La contraseña debe tener al menos 6 caracteres"
- **Estado**: ✅ PASS

### ✅ Prueba 5: Campos Vacíos
- **Acción**: Intentar enviar formulario sin completar campos obligatorios
- **Resultado Esperado**: Mensaje "Por favor completa todos los campos obligatorios"
- **Estado**: ✅ PASS

### ✅ Prueba 6: Login Exitoso Cliente
- **Acción**: Login con usuario cliente válido
- **Resultado Esperado**: Mensaje "¡Bienvenido!", redirección a página de inicio
- **Estado**: ✅ PASS

### ✅ Prueba 7: Login Exitoso Admin
- **Acción**: Login con usuario admin válido
- **Resultado Esperado**: Mensaje "¡Bienvenido!", redirección a dashboard
- **Estado**: ✅ PASS

### ✅ Prueba 8: Credenciales Inválidas
- **Acción**: Login con email o contraseña incorrectos
- **Resultado Esperado**: Mensaje "Credenciales inválidas"
- **Estado**: ✅ PASS

### ✅ Prueba 9: Error de Conexión en Registro
- **Acción**: Intentar registrarse con backend detenido
- **Resultado Esperado**: Mensaje "Error de conexión. Intente nuevamente más tarde"
- **Estado**: ✅ PASS

### ✅ Prueba 10: Error de Conexión en Login
- **Acción**: Intentar iniciar sesión con backend detenido
- **Resultado Esperado**: Mensaje "Error de conexión. Intente nuevamente más tarde"
- **Estado**: ✅ PASS

### ✅ Prueba 11: Usuario Desactivado
- **Acción**: Login con usuario marcado como activo=0
- **Resultado Esperado**: Mensaje "Usuario desactivado"
- **Estado**: ✅ PASS

### ✅ Prueba 12: Botón Recuperar Contraseña
- **Acción**: Click en "¿Olvidaste tu contraseña?"
- **Resultado Esperado**: Mensaje informativo "Funcionalidad de recuperación de contraseña próximamente"
- **Estado**: ✅ PASS (preparado para implementación futura)

---

## 📱 Responsive Design

- ✅ **Mobile**: Formularios adaptables, botones táctiles
- ✅ **Tablet**: Layout optimizado
- ✅ **Desktop**: Máximo ancho 28rem (448px) centrado

---

## 🔄 Navegación Implementada

**Desde Registro:**
- ✅ Link "Ir al inicio" → HomePage (/)

**Desde Login:**
- ✅ Link "Regístrate aquí" → Página de registro (/registro)
- ✅ Link "Volver al inicio" → HomePage (/)
- ✅ Link "¿Eres administrador? Ingresa aquí" → Login Admin (/admin/login)

**Desde HomePage:**
- ✅ Botón "Registrarse" → Página de registro (/registro)
- ✅ Botón "Iniciar Sesión" → Login público (/login)
- ✅ Botón "Administración" → Login admin (/admin/login)

---

## 📊 Información Almacenada en Sesión

```javascript
// localStorage al hacer login exitoso
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 5,
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@ejemplo.com",
        "rol": "Cliente",
        "id_rol": 3
    }
}
```

---

## ⏳ Funcionalidades Futuras

### Recuperación de Contraseña (Pendiente)
- Email con token de recuperación
- Página de reset de contraseña
- Expiración de token de recuperación
- Validación de nueva contraseña

---

## 🎯 Requisito Cumplido

**RF-2: Registro y Autenticación de Clientes** ✅ **COMPLETADO AL 100%**

Todas las funcionalidades solicitadas han sido implementadas:
- ✅ Registro de nuevos clientes con validaciones
- ✅ Autenticación con JWT
- ✅ Validación de unicidad de correo
- ✅ Seguridad de contraseña (mínimo 6 caracteres, hasheada)
- ✅ Mensajes de error específicos según requisito
- ✅ Preparación para recuperación de contraseña
- ✅ Manejo de errores de conexión
- ✅ UX/UI moderna y responsive

---

## 📝 Usuarios de Prueba Disponibles

```
Cliente:
- Email: juan.perez@ejemplo.com
- Password: prueba123

Admin:
- Email: admin@smartpyme.com
- Password: admin123

Empleado:
- Email: empleado@smartpyme.com
- Password: emp123
```
