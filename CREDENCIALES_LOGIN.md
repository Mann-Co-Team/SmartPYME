# 🔐 Credenciales de Acceso - Tiendas Demo

## Panel de Administración
**URL:** http://localhost:5173/admin/login

---

## 🎂 Pastelería Dulce Sabor (Plan Básico)

### Administrador
- **Email:** admin@dulcesabor.com
- **Password:** admin123
- **Tenant Slug:** pasteleria-dulce-sabor
- **Usuario:** María González

### Limitaciones del Plan
- ✅ **1 usuario administrador** (Límite alcanzado)
- ❌ No permite empleados adicionales
- Requiere upgrade a Plan Profesional para agregar más usuarios

---

## 👗 Boutique Fashion Elite (Plan Profesional)

### Administrador
- **Email:** admin@fashionelite.com
- **Password:** admin123
- **Tenant Slug:** boutique-fashion-elite
- **Usuario:** Isabella Romero

### Empleados
1. **Sofia Torres**
   - Email: sofia@fashionelite.com
   - Password: empleado123

2. **Valentina Castro**
   - Email: valentina@fashionelite.com
   - Password: empleado123

### Limitaciones del Plan
- ✅ **Hasta 5 empleados** (3/5 utilizados)
- ✅ Puede agregar 2 empleados más
- Los empleados tienen permisos limitados según su rol

---

## ⚡ ElectroTech Premium Store (Plan Empresarial)

### Administradores
1. **Alejandro Vega** (Principal)
   - Email: admin@electrotechpremium.com
   - Password: admin123
   - Tenant Slug: electrotech-premium

2. **Ricardo Herrera** (Admin adicional)
   - Email: ricardo@electrotechpremium.com
   - Password: admin123
   - Tenant Slug: electrotech-premium

### Empleados
1. **Daniel Morales**
   - Email: daniel@electrotechpremium.com
   - Password: empleado123

2. **Gabriela Sánchez**
   - Email: gabriela@electrotechpremium.com
   - Password: empleado123

3. **Carolina Mendoza**
   - Email: carolina@electrotechpremium.com
   - Password: empleado123

### Capacidades del Plan
- ✅ **Usuarios ILIMITADOS**
- ✅ Múltiples administradores permitidos
- ✅ Equipo de trabajo sin restricciones

---

## 🔑 Instrucciones de Login

1. **Accede a:** http://localhost:5173/admin/login

2. **Completa el formulario:**
   - **Correo Electrónico:** Elige uno de los emails listados arriba
   - **Identificador de Empresa:** Usa el tenant_slug correspondiente
   - **Contraseña:** admin123 o empleado123 según el rol

3. **Ejemplos de login:**

   ### Para Pastelería:
   ```
   Email: admin@dulcesabor.com
   Tenant Slug: pasteleria-dulce-sabor
   Password: admin123
   ```

   ### Para Boutique:
   ```
   Email: admin@fashionelite.com
   Tenant Slug: boutique-fashion-elite
   Password: admin123
   ```

   ### Para ElectroTech:
   ```
   Email: admin@electrotechpremium.com
   Tenant Slug: electrotech-premium
   Password: admin123
   ```

---

## 🛡️ Seguridad Multi-Tenant

### Aislamiento de Datos
- ✅ Cada usuario solo ve datos de su propia tienda
- ✅ Los productos, categorías y pedidos están filtrados por tenant
- ✅ No es posible acceder a información de otras tiendas

### Sistema de Autenticación
- ✅ JWT con información de tenant incluida
- ✅ Middleware de validación en todas las rutas protegidas
- ✅ Verificación de pertenencia al tenant en cada petición

### Roles y Permisos
- **Admin:** Acceso completo a su tienda
  - Gestión de productos, categorías, pedidos
  - Gestión de usuarios (dentro del límite del plan)
  - Acceso a reportes y configuración
  
- **Empleado:** Acceso limitado
  - Gestión de productos y categorías
  - Gestión de pedidos
  - Sin acceso a configuración ni gestión de usuarios

---

## 📊 Diferencias por Plan

| Característica | Básico | Profesional | Empresarial |
|----------------|--------|-------------|-------------|
| **Usuarios** | 1 admin | Hasta 5 | Ilimitados |
| **Múltiples Admin** | ❌ | ❌ | ✅ |
| **Gestión de Roles** | ❌ | ✅ | ✅ |
| **Dashboard Avanzado** | Básico | ✅ | ✅ |
| **Reportes** | Básicos | Avanzados | Premium + IA |
| **API Access** | ❌ | ❌ | ✅ |

---

## 🧪 Probando el Sistema

### 1. Login Básico (Pastelería)
- Login con admin@dulcesabor.com
- Verifica que solo ves 12 productos de panadería
- Intenta crear un nuevo usuario → Debería mostrar límite alcanzado

### 2. Login Profesional (Boutique)
- Login con admin@fashionelite.com o sofia@fashionelite.com
- Verifica que solo ves 20 productos de moda
- Los empleados tienen permisos limitados

### 3. Login Empresarial (ElectroTech)
- Login con cualquiera de los 2 admins
- Verifica que ves 25 productos de electrónica premium
- Múltiples admins pueden trabajar simultáneamente

### 4. Aislamiento de Datos
- Login en Pastelería → Solo ves pasteles
- Login en Boutique → Solo ves ropa
- Login en ElectroTech → Solo ves electrónica
- Ninguna tienda ve productos de las otras

---

## ⚠️ Notas Importantes

### Passwords de Desarrollo
Todos los usuarios tienen passwords simples para desarrollo:
- **Admins:** admin123
- **Empleados:** empleado123

**IMPORTANTE:** En producción estos passwords deben ser fuertes y únicos.

### Tenant Slug
El tenant_slug es crítico para el multi-tenancy:
- `pasteleria-dulce-sabor` → Pastelería Dulce Sabor
- `boutique-fashion-elite` → Boutique Fashion Elite
- `electrotech-premium` → ElectroTech Premium Store

### Limitaciones por Plan
Las limitaciones se aplican a nivel de aplicación:
- Plan Básico: No puede crear más de 1 usuario
- Plan Profesional: No puede crear más de 5 usuarios
- Plan Empresarial: Sin límites

---

## 🔄 Reseteo de Passwords

Si necesitas resetear un password:

```sql
-- Actualizar password de un usuario (nueva password será "nuevapass123")
UPDATE usuarios 
SET password = '$2a$10$YourHashedPasswordHere'
WHERE email = 'admin@dulcesabor.com';
```

O usa el script `create-admin.js` en la carpeta backend:
```bash
node create-admin.js
```

---

## 📞 Soporte

Para cualquier problema con acceso:
1. Verifica que el backend esté corriendo en puerto 3000
2. Verifica que el frontend esté corriendo en puerto 5173
3. Revisa que el tenant_slug sea correcto (sin espacios, lowercase)
4. Revisa los logs del backend para errores de autenticación
