# 🎯 Guía Rápida de Pruebas - Sistema de Recuperación de Contraseña

## 🚀 Servidores Iniciados

✅ **Backend:** http://localhost:3000  
✅ **Frontend:** http://localhost:5173  

---

## 📝 Prueba 1: Perfil del Usuario

### Pasos:

1. **Ir a:** http://localhost:5173/login

2. **Ingresar credenciales:**
   ```
   Email: juan.perez@ejemplo.com
   Contraseña: cliente123
   ```

3. **Hacer login**

4. **Click en "Mi Perfil"** en la barra de navegación (botón verde)

5. **Verificar que se muestra:**
   - ✅ Nombre: Juan Pérez
   - ✅ Email: juan.perez@ejemplo.com
   - ✅ Rol: cliente (badge azul)
   - ✅ Avatar placeholder
   - ✅ Link a "Cambiar Contraseña"
   - ✅ Links a "Mis Pedidos" y "Tienda"

---

## 🔐 Prueba 2: Cambio de Contraseña (Autenticado)

### Pasos:

1. **Desde el perfil o navbar, click en "Cambiar Contraseña"**

2. **Llenar el formulario:**
   ```
   Contraseña Actual: cliente123
   Nueva Contraseña: nueva123
   Confirmar Contraseña: nueva123
   ```

3. **Click en "Actualizar Contraseña"**

4. **Verificar:**
   - ✅ Toast de éxito
   - ✅ Redirección automática

5. **Cerrar sesión**

6. **Hacer login con nueva contraseña:**
   ```
   Email: juan.perez@ejemplo.com
   Contraseña: nueva123
   ```

7. **Verificar:**
   - ✅ Login exitoso

---

## 🔑 Prueba 3: Recuperación de Contraseña (Olvidé mi contraseña)

### Pasos:

1. **Cerrar sesión** (si estás logueado)

2. **Ir a:** http://localhost:5173/login

3. **Click en "¿Olvidaste tu contraseña?"**

4. **Ingresar email:**
   ```
   Email: juan.perez@ejemplo.com
   ```

5. **Click en "Enviar Instrucciones"**

6. **Verificar pantalla de confirmación:**
   - ✅ Mensaje: "Revisa tu email"
   - ✅ [Modo Dev] Se muestra un link directo

7. **Copiar el token o hacer click en el link mostrado**

8. **Verificar que se abre la página de reseteo:**
   - ✅ Mensaje: "Token verificado"
   - ✅ Formulario con 2 campos

9. **Ingresar nueva contraseña:**
   ```
   Nueva Contraseña: cliente123
   Confirmar Contraseña: cliente123
   ```
   *(Volvemos a la contraseña original para mantener consistencia)*

10. **Click en "Resetear Contraseña"**

11. **Verificar:**
    - ✅ Toast de éxito
    - ✅ Redirección automática a /login

12. **Hacer login:**
    ```
    Email: juan.perez@ejemplo.com
    Contraseña: cliente123
    ```

13. **Verificar:**
    - ✅ Login exitoso

---

## 🚫 Prueba 4: Token Inválido

### Pasos:

1. **Ir manualmente a:**
   ```
   http://localhost:5173/recuperar-password/tokeninvalido123
   ```

2. **Verificar:**
   - ✅ Icono de advertencia
   - ✅ Mensaje: "Token Inválido o Expirado"
   - ✅ Botón "Solicitar Nuevo Link"
   - ✅ Botón "Volver al Login"

---

## 🔒 Prueba 5: Verificación de Seguridad

### Ver Token en Consola del Backend

1. **Ir a la terminal del backend** donde está corriendo `node server.js`

2. **Solicitar recuperación desde el navegador** (Prueba 3, pasos 1-5)

3. **Verificar en la consola del backend:**
   ```
   ╔════════════════════════════════════════════════════════════════════╗
   ║                   🔐 TOKEN DE RECUPERACIÓN                         ║
   ╠════════════════════════════════════════════════════════════════════╣
   ║ Usuario: juan.perez@ejemplo.com                                   ║
   ║ Token: [64 caracteres hex]                                        ║
   ║ Expira: [fecha + 1 hora]                                          ║
   ║                                                                    ║
   ║ Link de recuperación:                                              ║
   ║ http://localhost:5173/recuperar-password/[token]                  ║
   ╚════════════════════════════════════════════════════════════════════╝
   ```

### Verificar Prevención de Reuso

1. **Usar un token para resetear contraseña** (completar Prueba 3)

2. **Intentar usar el mismo token de nuevo:**
   - Copiar el link usado anteriormente
   - Pegarlo en el navegador

3. **Verificar:**
   - ✅ Mensaje: "Token Inválido o Expirado"
   - ✅ El token fue marcado como usado y no se puede reutilizar

---

## 🎨 Elementos UI para Verificar

### Login Page
- ✅ Card centrado con sombra
- ✅ Icono en el header
- ✅ Campos con placeholders
- ✅ Link "¿Olvidaste tu contraseña?" (azul, pequeño)
- ✅ Footer con link a registro

### Navbar (Usuario Logueado)
- ✅ Logo "SmartPYME" (izquierda)
- ✅ Links: Productos, Pedidos
- ✅ Botón "Mi Perfil" (verde, con icono persona)
- ✅ Botón "Cambiar Contraseña" (azul, con icono llave)
- ✅ Botón "Cerrar Sesión" (rojo, con icono salida)

### Página de Perfil
- ✅ Card principal con sombra
- ✅ Header azul: "Mi Perfil"
- ✅ Avatar circular 100px
- ✅ Nombre completo (h4)
- ✅ Email con icono
- ✅ Badge de rol con color
- ✅ Teléfono con icono
- ✅ Sección "Configuración de Cuenta"
- ✅ Sección "Acciones Rápidas"
- ✅ Footer con links

### Olvidé mi Contraseña
- ✅ Card centrado
- ✅ Header azul con icono llave
- ✅ Campo email con validación
- ✅ Botón "Enviar Instrucciones"
- ✅ Link "Volver al Login"
- ✅ Estado de confirmación con mensaje verde

### Recuperar Contraseña
- ✅ Card centrado
- ✅ Header verde: "Crear Nueva Contraseña"
- ✅ Alerta de éxito: "Token verificado"
- ✅ 2 campos de contraseña
- ✅ Botón verde "Resetear Contraseña"
- ✅ Footer con mensaje de seguridad
- ✅ Estado de error (token inválido):
  - Icono de advertencia amarillo
  - Mensaje claro
  - 2 botones de acción

---

## 🐛 Casos de Error a Probar

### 1. Contraseña Muy Corta
```
Nueva Contraseña: 123
Confirmar: 123
```
**Esperado:** ❌ "La contraseña debe tener al menos 6 caracteres"

### 2. Contraseñas No Coinciden
```
Nueva Contraseña: nueva123
Confirmar: nueva456
```
**Esperado:** ❌ "Las contraseñas no coinciden"

### 3. Email No Existe
```
Email: noexiste@ejemplo.com
```
**Esperado:** ✅ "Si el email existe, recibirás instrucciones..."  
*(Por seguridad, siempre devuelve éxito)*

### 4. Contraseña Actual Incorrecta (Cambio desde UI)
```
Contraseña Actual: incorrecta123
Nueva: nueva123
Confirmar: nueva123
```
**Esperado:** ❌ "Contraseña actual incorrecta"

---

## 📊 Base de Datos - Consultas Útiles

### Ver tokens activos:
```sql
SELECT 
    t.token,
    t.expiry,
    t.used,
    u.email,
    u.nombre
FROM password_recovery_tokens t
JOIN usuarios u ON t.id_usuario = u.id_usuario
WHERE t.expiry > NOW()
ORDER BY t.created_at DESC;
```

### Ver tokens usados:
```sql
SELECT 
    t.token,
    t.used,
    u.email,
    t.created_at
FROM password_recovery_tokens t
JOIN usuarios u ON t.id_usuario = u.id_usuario
WHERE t.used = 1
ORDER BY t.created_at DESC
LIMIT 10;
```

### Limpiar tokens expirados:
```sql
DELETE FROM password_recovery_tokens
WHERE expiry < NOW() OR used = 1;
```

---

## 🎯 Checklist de Verificación

Marca cada prueba al completarla:

### Funcionalidad Básica
- [ ] Login exitoso con credenciales correctas
- [ ] Visualización de página de perfil
- [ ] Cambio de contraseña desde UI (autenticado)
- [ ] Logout exitoso

### Recuperación de Contraseña
- [ ] Solicitud de recuperación con email válido
- [ ] Visualización de token en consola backend
- [ ] Verificación exitosa de token válido
- [ ] Reseteo de contraseña exitoso
- [ ] Login con nueva contraseña
- [ ] Prevención de reuso de token

### Casos de Error
- [ ] Token inválido muestra error apropiado
- [ ] Contraseña corta rechazada
- [ ] Contraseñas no coinciden rechazadas
- [ ] Contraseña actual incorrecta rechazada

### UI/UX
- [ ] Todos los botones tienen iconos
- [ ] Cards con sombras y bordes redondeados
- [ ] Colores consistentes (Bootstrap)
- [ ] Toast notifications funcionan
- [ ] Loading spinners visibles
- [ ] Redirecciones automáticas funcionan
- [ ] Links de navegación funcionan

---

## 📞 Información Adicional

### Credenciales de Prueba:
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

### URLs Importantes:
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000

Páginas:
  /login
  /perfil
  /cambiar-password
  /olvide-password
  /recuperar-password/:token
```

### Scripts Útiles:
```bash
# Resetear contraseñas a valores por defecto
node backend/reset-all-users.js

# Crear tabla de tokens (si no existe)
node backend/create-recovery-table.js
```

---

## ✅ Resultado Esperado

Al completar todas las pruebas, deberías haber verificado:

✅ Sistema de perfil funcional  
✅ Cambio de contraseña desde UI  
✅ Recuperación de contraseña completa  
✅ Tokens criptográficos seguros  
✅ Prevención de reuso de tokens  
✅ Expiración automática (1 hora)  
✅ UI/UX profesional y responsiva  
✅ Manejo de errores apropiado  
✅ Redirecciones automáticas  
✅ Toast notifications informativas  

---

**🎉 ¡El sistema está completamente funcional y listo para usar!**

**Nota:** Este es un entorno de desarrollo. En producción, los tokens se enviarían por email en lugar de mostrarse en consola.
