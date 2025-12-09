# Sistema de Recuperación de Contraseña - Guía Completa

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de recuperación de contraseña que incluye:

1. **Página de Perfil del Usuario** (`/perfil`)
2. **Cambio de Contraseña** (implementado previamente, ahora accesible desde perfil)
3. **Recuperación de Contraseña Olvidada** (nuevo sistema completo)

---

## 🗄️ Base de Datos

### Tabla: `password_recovery_tokens`

**IMPORTANTE:** Debes ejecutar el siguiente script SQL antes de probar la funcionalidad:

```bash
# Opción 1: MySQL Workbench
# Abre el archivo: database/crear-tabla-recovery.sql
# Ejecuta el script en la base de datos smartpyme_db

# Opción 2: Línea de comandos (si mysql está en PATH)
mysql -u root -p smartpyme_db < database/crear-tabla-recovery.sql
```

**Estructura de la tabla:**
```sql
CREATE TABLE password_recovery_tokens (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    expiry DATETIME NOT NULL,              -- Expiración: 1 hora después de creación
    used TINYINT(1) DEFAULT 0,             -- 0: no usado, 1: usado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expiry (expiry)
);
```

---

## 🔧 Backend

### Archivos Creados/Modificados

#### 1. **Modelo:** `backend/models/passwordRecovery.model.js`
```javascript
// Métodos principales:
- createRecoveryToken(userId)      // Genera token crypto de 64 caracteres
- verifyToken(token)                // Verifica validez y expiración
- markTokenAsUsed(token)            // Marca token como usado
- cleanExpiredTokens()              // Limpieza de tokens expirados
```

#### 2. **Controlador:** `backend/controllers/passwordRecovery.controller.js`
```javascript
// Endpoints:
- solicitarRecuperacion(req, res)   // POST /api/password-recovery/solicitar
- verificarToken(req, res)          // GET /api/password-recovery/verificar/:token
- resetearPassword(req, res)        // POST /api/password-recovery/resetear
```

**Modo Desarrollo:**
- Los tokens se imprimen en la consola del servidor en un formato visible
- La respuesta incluye `dev_token` para pruebas

**Seguridad:**
- Siempre devuelve éxito al solicitar recuperación (evita enumeración de usuarios)
- Tokens de 64 caracteres (32 bytes hexadecimales)
- Expiración de 1 hora
- Un solo uso por token

#### 3. **Rutas:** `backend/routes/passwordRecovery.routes.js`
```javascript
// Rutas públicas (sin autenticación):
POST   /api/password-recovery/solicitar
GET    /api/password-recovery/verificar/:token
POST   /api/password-recovery/resetear
```

#### 4. **App:** `backend/app.js`
```javascript
// Registro de rutas:
app.use('/api/password-recovery', require('./routes/passwordRecovery.routes'));
```

---

## 💻 Frontend

### Archivos Creados/Modificados

#### 1. **Perfil del Usuario:** `frontend/src/pages/public/Perfil.jsx`
**Ruta:** `/perfil`

**Características:**
- Muestra información del usuario (nombre, apellido, email, rol, teléfono)
- Avatar placeholder con icono
- Sección "Configuración de Cuenta":
  - Link a cambiar contraseña
  - Botón "Editar Información" (deshabilitado, futuro)
- Sección "Acciones Rápidas":
  - Link a mis pedidos
  - Link a la tienda

**Datos mostrados:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
// { nombre, apellido, email, rol, telefono }
```

#### 2. **Solicitar Recuperación:** `frontend/src/pages/OlvidePassword.jsx`
**Ruta:** `/olvide-password`

**Características:**
- Formulario con campo de email
- POST a `/api/password-recovery/solicitar`
- Dos estados UI:
  1. **Formulario:** Input de email
  2. **Confirmación:** Mensaje de éxito + link de desarrollo

**Modo Desarrollo:**
```jsx
// Muestra el token y link directo para pruebas
{data.dev_token && (
  <div className="alert alert-warning">
    <strong>Modo Desarrollo:</strong>
    <a href={`/recuperar-password/${data.dev_token}`}>
      Click aquí para resetear
    </a>
  </div>
)}
```

#### 3. **Resetear Contraseña:** `frontend/src/pages/RecuperarPassword.jsx`
**Ruta:** `/recuperar-password/:token`

**Características:**
- Verifica token al cargar (`useEffect`)
- 3 estados UI:
  1. **Cargando:** Spinner verificando token
  2. **Token Inválido:** Mensaje de error + links
  3. **Token Válido:** Formulario de nueva contraseña

**Formulario:**
```jsx
- Campo: Nueva Contraseña (min 6 caracteres)
- Campo: Confirmar Contraseña
- Validaciones frontend y backend
- POST a /api/password-recovery/resetear
- Redirección a /login tras éxito
```

**Manejo de Errores:**
```jsx
// Token inválido/expirado:
- Ícono de advertencia
- Mensaje explicativo
- Botón "Solicitar Nuevo Link"
- Botón "Volver al Login"
```

#### 4. **Login Mejorado:** `frontend/src/pages/Login.jsx`

**Cambios:**
- Diseño con card y estilos mejorados
- Link "¿Olvidaste tu contraseña?" → `/olvide-password`
- Link "Regístrate aquí" → `/registro`
- Iconos Bootstrap Icons

#### 5. **Navbar:** `frontend/src/components/Navbar.jsx`

**Botones añadidos:**
```jsx
<Link to="/perfil">
  <i className="bi bi-person-circle"></i> Mi Perfil
</Link>
<Link to="/cambiar-password">
  <i className="bi bi-key"></i> Cambiar Contraseña
</Link>
```

#### 6. **Rutas:** `frontend/src/App.jsx`

**Rutas añadidas:**
```javascript
// Públicas (sin layout):
/olvide-password              → OlvidePassword
/recuperar-password/:token    → RecuperarPassword

// Con PublicLayout:
/perfil                       → Perfil
/cambiar-password             → CambiarPassword (ya existía)
```

---

## 🧪 Guía de Pruebas

### Paso 1: Crear la tabla
```bash
# Ejecutar en MySQL Workbench o consola:
mysql -u root -p smartpyme_db < database/crear-tabla-recovery.sql
```

### Paso 2: Iniciar servidores
```bash
# Terminal 1 - Backend:
cd backend
npm run dev
# ✅ Rutas de recuperación de contraseña cargadas

# Terminal 2 - Frontend:
cd frontend
npm run dev
# Local: http://localhost:5173
```

### Paso 3: Probar flujo de recuperación

#### A. Solicitar Recuperación
1. Ir a: http://localhost:5173/login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email: `juan.perez@ejemplo.com`
4. Click "Enviar Instrucciones"
5. **En Modo Desarrollo:** Se muestra link directo con token

#### B. Verificar Token en Consola Backend
```
╔════════════════════════════════════════════════════════════════════╗
║                   🔐 TOKEN DE RECUPERACIÓN                         ║
╠════════════════════════════════════════════════════════════════════╣
║ Usuario: juan.perez@ejemplo.com                                   ║
║ Token: abc123...xyz789                                             ║
║ Expira: 2024-01-15 15:30:00                                       ║
║                                                                    ║
║ Link de recuperación:                                              ║
║ http://localhost:5173/recuperar-password/abc123...xyz789          ║
╚════════════════════════════════════════════════════════════════════╝
```

#### C. Resetear Contraseña
1. Click en el link mostrado (o copiar token)
2. Ingresar nueva contraseña (min 6 caracteres)
3. Confirmar contraseña
4. Click "Resetear Contraseña"
5. ✅ Redirección a login tras 2 segundos

#### D. Probar Nueva Contraseña
1. Login con `juan.perez@ejemplo.com` + nueva contraseña
2. ✅ Acceso exitoso

### Paso 4: Probar casos de error

#### Token Inválido:
```
http://localhost:5173/recuperar-password/tokeninvalido123
❌ Muestra mensaje "Token Inválido o Expirado"
```

#### Token Ya Usado:
```
1. Usar un token para resetear
2. Intentar usar el mismo token de nuevo
❌ "Este link ya fue utilizado"
```

#### Token Expirado:
```
1. Esperar 1 hora después de solicitar recuperación
2. Intentar usar el token
❌ "El link de recuperación expiró"
```

---

## 📊 Flujo de Datos

### Solicitar Recuperación
```
[Cliente] → /olvide-password
    ↓ POST email
[Backend] → Busca usuario por email
    ↓
[Model] → createRecoveryToken(userId)
    ↓ Genera token crypto (32 bytes)
    ↓ Calcula expiry (1 hora)
    ↓ UPSERT en DB
[Controller] → Log token a consola
    ↓ Devuelve success + dev_token
[Cliente] → Muestra confirmación + link dev
```

### Verificar Token
```
[Cliente] → /recuperar-password/:token (mount)
    ↓ GET /verificar/:token
[Backend] → verifyToken(token)
    ↓ SELECT WHERE token AND expiry > NOW() AND used = 0
[Controller] → { success: true/false, message }
[Cliente] → Muestra formulario o error
```

### Resetear Contraseña
```
[Cliente] → Form: nuevaPassword + confirmarPassword
    ↓ POST /resetear
[Backend] → Validar passwords (≥6 chars, match)
    ↓ verifyToken(token)
    ↓ UsuarioModel.updatePassword(hashedPassword)
    ↓ markTokenAsUsed(token)
[Controller] → { success: true, message }
[Cliente] → Toast + redirect /login
```

---

## 🔐 Consideraciones de Seguridad

### Implementadas:
✅ Tokens criptográficamente seguros (crypto.randomBytes)
✅ Expiración de 1 hora
✅ Un solo uso por token
✅ Hash bcrypt para contraseñas (10 salt rounds)
✅ Sin enumeración de usuarios (siempre devuelve success)
✅ Validación de longitud de contraseña (min 6)
✅ Índices en DB para consultas rápidas
✅ CASCADE delete si se borra usuario

### Pendientes (producción):
⚠️ Envío de emails (actualmente solo console.log)
⚠️ Rate limiting para prevenir spam
⚠️ CAPTCHA en formulario de solicitud
⚠️ Logs de auditoría de cambios de contraseña
⚠️ 2FA opcional

---

## 📧 Integración de Email (Próximo Paso)

Para producción, reemplazar el console.log por envío de email real:

### Opción 1: Nodemailer con Gmail
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.sendMail({
  from: 'noreply@smartpyme.com',
  to: email,
  subject: 'Recuperación de Contraseña - SmartPYME',
  html: `
    <h2>Recuperación de Contraseña</h2>
    <p>Has solicitado recuperar tu contraseña.</p>
    <p>Haz click en el siguiente link:</p>
    <a href="http://localhost:5173/recuperar-password/${token}">
      Resetear Contraseña
    </a>
    <p>Este link expira en 1 hora.</p>
  `
});
```

### Opción 2: SendGrid
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@smartpyme.com',
  subject: 'Recuperación de Contraseña',
  html: templateHTML
});
```

---

## 🎯 Resumen de Credenciales de Prueba

```
Cliente:
Email: juan.perez@ejemplo.com
Pass: cliente123

Empleado:
Email: empleado@smartpyme.com
Pass: empleado123

Admin:
Email: admin@smartpyme.com
Pass: admin123
```

---

## ✅ Checklist de Implementación

- [✅] Modelo de recovery tokens
- [✅] Controlador de recovery
- [✅] Rutas de recovery (públicas)
- [✅] Registro de rutas en app.js
- [✅] Script SQL para crear tabla
- [✅] Componente OlvidePassword.jsx
- [✅] Componente RecuperarPassword.jsx
- [✅] Componente Perfil.jsx
- [✅] Rutas en App.jsx
- [✅] Link en Login.jsx
- [✅] Link en Navbar (Mi Perfil)
- [✅] Mejoras UI en Login
- [⏳] Crear tabla en base de datos (manual)
- [⏳] Pruebas de flujo completo

---

## 📝 Notas Adicionales

### Limpieza de Tokens
```javascript
// Ejecutar periódicamente (cron job):
const PasswordRecoveryModel = require('./models/passwordRecovery.model');
await PasswordRecoveryModel.cleanExpiredTokens();
```

### Consultas Útiles
```sql
-- Ver todos los tokens
SELECT * FROM password_recovery_tokens;

-- Ver tokens activos
SELECT * FROM password_recovery_tokens 
WHERE used = 0 AND expiry > NOW();

-- Limpiar tokens expirados
DELETE FROM password_recovery_tokens 
WHERE expiry < NOW() OR used = 1;
```

---

## 🚀 Próximos Pasos

1. **Ejecutar script SQL** para crear tabla
2. **Probar flujo completo** con usuario de prueba
3. **Configurar servicio de email** para producción
4. **Añadir rate limiting** para prevenir abuso
5. **Implementar logs de auditoría**
6. **Considerar 2FA** para mayor seguridad

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que la tabla `password_recovery_tokens` existe
2. Revisa la consola del backend para ver tokens en desarrollo
3. Verifica que las rutas de recovery están cargadas
4. Comprueba que el token no haya expirado (1 hora)
