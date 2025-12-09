# SmartPYME - Guía de Inicio Rápido

## ✅ Base de Datos Configurada

La base de datos `smartpyme_db` ya está creada y lista para usar.

## 🔑 Credenciales de Acceso

Para acceder al panel de administración:

- **URL Admin**: http://localhost:5173/admin/login
- **Email**: `admin@smartpyme.com`
- **Password**: `admin123`

## 🚀 Cómo Iniciar el Proyecto

### 1. Backend (Puerto 5000)

```powershell
cd backend
npm run dev
```

### 2. Frontend (Puerto 5173)

```powershell
cd frontend
npm run dev
```

## 📍 URLs de la Aplicación

- **Frontend (Público)**: http://localhost:5173/
- **Panel Admin**: http://localhost:5173/admin/login
- **API Backend**: http://localhost:5000/api

## 🔧 Configuración Realizada

### Backend (.env)
- Base de datos MySQL conectada
- Puerto: 5000
- JWT configurado

### Frontend (.env)
- API URL: http://localhost:5000/api

## 📦 Base de Datos

La base de datos incluye:
- ✅ Usuario administrador creado
- ✅ Roles del sistema (admin, empleado, cliente)
- ✅ Categorías de ejemplo
- ✅ Estados de pedidos
- ✅ Configuraciones del sistema

## 🛠️ Próximos Pasos

1. Accede al panel admin con las credenciales anteriores
2. Ve a "Configuraciones" para personalizar:
   - Nombre de la empresa
   - Colores del tema
   - Información de contacto
3. Agrega categorías en "Categorías"
4. Agrega productos en "Productos"

## ⚠️ Nota Importante

**Antes de desplegar a producción**, recuerda cambiar:
- `JWT_SECRET` en `backend/.env`
- Contraseña del usuario admin
- Credenciales de la base de datos si corresponde

---

**¿Necesitas reconfigurar la base de datos?**

Ejecuta: `.\setup-database.ps1`
