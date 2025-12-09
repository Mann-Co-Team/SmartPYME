# 🔐 Gestión de Usuarios Administradores

## Crear Usuario Administrador

### Opción 1: Script Interactivo (RECOMENDADO) ✅

Este es el método más seguro. El script te pedirá toda la información de forma interactiva:

```bash
cd backend
npm run create-admin
```

El script te pedirá:
- Nombre del administrador
- Apellido
- Email
- Contraseña (mínimo 6 caracteres)
- Confirmación de contraseña

**Ventajas:**
- ✅ No dejas contraseñas en el historial de comandos
- ✅ Validación de datos
- ✅ Confirmación de contraseña
- ✅ Actualiza usuario si ya existe

---

## Resetear Contraseña

Si olvidaste tu contraseña o necesitas cambiarla:

```bash
cd backend
npm run reset-password
```

El script te pedirá:
- Email del usuario
- Nueva contraseña
- Confirmación de contraseña

---

## Opción 2: Crear Administrador por SQL (Avanzado)

Si tienes acceso directo a la base de datos:

```sql
-- 1. Genera el hash de tu contraseña usando bcrypt
-- Puedes usar una herramienta online: https://bcrypt-generator.com/
-- O ejecutar en Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('tu_contraseña', 10).then(hash => console.log(hash));

-- 2. Inserta el usuario administrador
INSERT INTO usuarios (id_rol, nombre, apellido, email, password, activo)
VALUES (
  1,                                    -- id_rol: 1 = Administrador
  'Admin',                              -- nombre
  'Principal',                          -- apellido
  'admin@tuempresa.com',               -- email
  '$2a$10$hash_generado_aqui',         -- password (hash de bcrypt)
  1                                     -- activo: 1 = activo
);
```

---

## Roles de Usuario

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1  | Admin  | Acceso total al sistema |
| 2  | Staff  | Personal con permisos limitados |
| 3  | Cliente| Usuarios públicos registrados |

---

## Credenciales por Defecto (CAMBIAR EN PRODUCCIÓN)

Si ejecutaste el script antiguo, estas son las credenciales por defecto:

```
Email: admin@smartpyme.com
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambia estas credenciales inmediatamente en producción usando el script `reset-password`.

---

## Mejores Prácticas de Seguridad

1. **Nunca uses contraseñas débiles** en producción
2. **Cambia las credenciales por defecto** inmediatamente
3. **No compartas las contraseñas** por medios inseguros
4. **Usa contraseñas únicas** para cada administrador
5. **Actualiza las contraseñas periódicamente**
6. **Mantén el archivo `.env` fuera del control de versiones**

---

## Troubleshooting

### Error: "Cannot find module './config/db'"
- Asegúrate de estar en la carpeta `backend`
- Verifica que el archivo `.env` exista y tenga las credenciales correctas

### Error: "Access denied for user"
- Verifica las credenciales de MySQL en el archivo `.env`
- Asegúrate de que MySQL esté corriendo

### El usuario ya existe
- El script `create-admin` actualizará automáticamente el usuario existente
- O usa `reset-password` para cambiar solo la contraseña

---

## Variables de Entorno Necesarias

Archivo: `backend/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=smartpyme_db
DB_PORT=3306

JWT_SECRET=tu_secreto_jwt_largo_y_seguro
```
