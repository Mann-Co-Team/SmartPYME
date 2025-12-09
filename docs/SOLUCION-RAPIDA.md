# 🚀 SOLUCIÓN RÁPIDA - Problemas de Conexión/Sesión

## ✅ Servidores Ya Están Corriendo

- **Backend**: ✅ Puerto 3000 - http://localhost:3000
- **Frontend**: ✅ Vite corriendo

## 🔑 Problema: Sesión Cerrada

Si ves "Error al cargar el detalle del pedido" o no puedes ver tus pedidos, es porque **perdiste la sesión**.

### Solución Rápida:

1. **Ir a la aplicación**: http://localhost:5173 (o el puerto que te muestre Vite)

2. **Hacer LOGIN nuevamente**:
   
   **COMO CLIENTE:**
   - URL: http://localhost:5173/login
   - Usuario: `juan.perez@ejemplo.com` (o el email que usaste)
   - Password: la contraseña que usaste al registrarte

   **COMO ADMIN:**
   - URL: http://localhost:5173/admin/login
   - Email: `admin@smartpyme.com`
   - Password: `admin123`

3. **Después del login**, podrás:
   - ✅ Ver tus pedidos en "Mis Pedidos"
   - ✅ Hacer clic en "Ver Detalle" de cualquier pedido
   - ✅ Ver el timeline con historial de estados
   - ✅ (Admin) Cambiar estados de pedidos

## 🐛 Si Sigues Viendo Errores

### Verificar que los servidores estén corriendo:

```powershell
# Backend debe estar en puerto 3000
curl http://localhost:3000/api/test

# Frontend - abre el navegador en:
http://localhost:5173
```

### Limpiar localStorage (si el login no funciona):

1. Abre DevTools (F12)
2. Pestaña "Application" o "Almacenamiento"
3. Click en "Local Storage" → tu dominio
4. Borrar todo o solo la key "token"
5. Recargar página
6. Hacer login de nuevo

## 📋 Pedidos de Prueba Disponibles

Después de hacer login como cliente, deberías ver:
- Pedido #16: Estado "Pendiente" ⏳
- Pedido #17: Estado "En Proceso" 🔄
- Pedido #18: Estado "Completado" ✅
- Pedido #19: Estado "Cancelado" ❌

## 🔧 Comandos Útiles

### Reiniciar todo desde cero:

```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Ver qué puertos están en uso:

```powershell
Get-NetTCPConnection -LocalPort 3000,5173 | Select-Object LocalPort, State, OwningProcess
```

## 🎯 Resumen

**Tu problema actual**: Sesión expirada/perdida → **Solución**: Volver a hacer LOGIN

Los servidores están funcionando correctamente, solo necesitas autenticarte de nuevo. 🔐
