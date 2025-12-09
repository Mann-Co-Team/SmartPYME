# SmartPYME - Requisitos del Sistema

## 📋 Requisitos Previos

### Software Base Requerido

#### 1. Node.js y npm
- **Versión mínima:** Node.js 18.x o superior
- **Recomendado:** Node.js 20.x LTS
- **Incluye:** npm 9.x o superior
- **Descarga:** https://nodejs.org/

**Verificar instalación:**
```bash
node --version
npm --version
```

#### 2. MySQL
- **Versión:** MySQL 8.0 o superior
- **Recomendado:** MySQL 8.0.x
- **Descarga:** https://dev.mysql.com/downloads/mysql/

**Verificar instalación:**
```bash
mysql --version
```

#### 3. Git
- **Versión:** Git 2.x o superior
- **Descarga:** https://git-scm.com/downloads

**Verificar instalación:**
```bash
git --version
```

---

## 📦 Dependencias del Backend

### Dependencias de Producción

El backend utiliza las siguientes dependencias (instaladas automáticamente con `npm install`):

```json
{
  "axios": "^1.13.2",           // Cliente HTTP para peticiones externas
  "bcrypt": "^6.0.0",           // Encriptación de contraseñas (nativo)
  "bcryptjs": "^2.4.3",         // Encriptación de contraseñas (JavaScript puro)
  "celebrate": "^15.0.3",       // Validación de datos con Joi para Express
  "cors": "^2.8.5",             // Middleware CORS para Express
  "dotenv": "^16.0.0",          // Variables de entorno
  "exceljs": "^4.4.0",          // Generación de archivos Excel
  "express": "^4.18.2",         // Framework web Node.js
  "express-validator": "^7.3.1", // Validación de datos para Express
  "joi": "^18.0.1",             // Validación de esquemas
  "json2csv": "^6.0.0-alpha.2", // Conversión JSON a CSV
  "jsonwebtoken": "^9.0.2",     // Autenticación JWT
  "multer": "^2.0.2",           // Manejo de uploads de archivos
  "mysql2": "^3.3.0",           // Driver MySQL para Node.js
  "nodemailer": "^7.0.10",      // Envío de emails
  "path": "^0.12.7",            // Utilidades de rutas
  "pdfkit": "^0.17.2"           // Generación de archivos PDF
}
```

### Dependencias de Desarrollo

```json
{
  "cross-env": "^10.1.0",       // Variables de entorno cross-platform
  "jest": "^30.2.0",            // Framework de testing
  "nodemon": "^3.1.10",         // Auto-reload del servidor en desarrollo
  "supertest": "^7.1.4"         // Testing de APIs HTTP
}
```

### Instalación Backend

```bash
cd backend
npm install
```

---

## 🎨 Dependencias del Frontend

### Dependencias de Producción

El frontend utiliza las siguientes dependencias:

```json
{
  "@headlessui/react": "^2.2.9",      // Componentes UI accesibles
  "@heroicons/react": "^2.2.0",       // Iconos de Heroicons
  "@paypal/react-paypal-js": "^8.9.2", // Integración PayPal
  "@tailwindcss/forms": "^0.5.10",    // Estilos para formularios
  "axios": "^1.12.2",                 // Cliente HTTP
  "bootstrap": "^5.3.8",              // Framework CSS Bootstrap
  "jwt-decode": "^4.0.0",             // Decodificación de JWT
  "lucide-react": "^0.545.0",         // Iconos de Lucide
  "react": "^19.1.1",                 // Biblioteca React
  "react-bootstrap": "^2.10.10",      // Componentes Bootstrap para React
  "react-dom": "^19.1.1",             // React DOM
  "react-dropzone": "^14.3.8",        // Componente drag-and-drop
  "react-hot-toast": "^2.6.0",        // Notificaciones toast
  "react-router-dom": "^6.30.1"       // Enrutamiento para React
}
```

### Dependencias de Desarrollo

```json
{
  "@eslint/js": "^9.36.0",                    // ESLint core
  "@tailwindcss/postcss": "^4.1.17",          // PostCSS para Tailwind
  "@types/react": "^19.1.16",                 // Tipos TypeScript para React
  "@types/react-dom": "^19.1.9",              // Tipos TypeScript para React DOM
  "@vitejs/plugin-react": "^5.0.4",           // Plugin React para Vite
  "autoprefixer": "^10.4.22",                 // Autoprefixer CSS
  "cypress": "^15.7.0",                       // Testing E2E
  "eslint": "^9.36.0",                        // Linter JavaScript
  "eslint-plugin-react-hooks": "^5.2.0",      // Reglas ESLint para React Hooks
  "eslint-plugin-react-refresh": "^0.4.22",   // Reglas ESLint para React Refresh
  "globals": "^16.4.0",                       // Variables globales para ESLint
  "postcss": "^8.5.6",                        // PostCSS
  "tailwindcss": "^4.1.17",                   // Framework CSS Tailwind
  "vite": "^7.1.7"                            // Build tool y dev server
}
```

### Instalación Frontend

```bash
cd frontend
npm install
```

---

## 🗄️ Configuración de Base de Datos

### Crear Base de Datos

```sql
CREATE DATABASE smartpyme_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Importar Esquema

```bash
# Opción 1: Schema básico
mysql -u root -p smartpyme_db < database/schema.sql

# Opción 2: Schema completo v2 (recomendado)
mysql -u root -p smartpyme_db < database/schema2.sql
```

### Importar Datos de Prueba

```bash
# Datos básicos
mysql -u root -p smartpyme_db < database/seed-data.sql

# Datos multitenant
mysql -u root -p smartpyme_db < database/seed-multitenant-data.sql

# Productos multitenant
mysql -u root -p smartpyme_db < database/seed-productos-multitenant.sql
```

---

## ⚙️ Variables de Entorno

### Backend (.env)

Crear archivo `backend/.env` con:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=smartpyme_db

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_aqui_minimo_32_caracteres

# Email (opcional - para recuperación de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_app_gmail

# PayPal (opcional)
PAYPAL_CLIENT_ID=tu_client_id_paypal
PAYPAL_CLIENT_SECRET=tu_client_secret_paypal
PAYPAL_MODE=sandbox
```

### Frontend (.env)

Crear archivo `frontend/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🚀 Instalación Completa

### Instalación Automática (Recomendado)

#### Windows PowerShell
```powershell
# Ejecutar script de inicio
.\INICIAR-TODO.ps1
```

#### Linux/Mac
```bash
# Instalar backend
cd backend
npm install

# Instalar frontend
cd ../frontend
npm install

# Configurar base de datos
mysql -u root -p smartpyme_db < ../database/schema2.sql
mysql -u root -p smartpyme_db < ../database/seed-multitenant-data.sql

# Crear usuario admin
cd ../backend
node create-admin.js
```

---

## 🧪 Testing

### Backend Tests (Jest)

```bash
cd backend
npm test
```

**Requisitos:**
- Todas las dependencias de backend instaladas
- Base de datos configurada

### Frontend Tests (Cypress E2E)

```bash
cd frontend
npm run cypress:run
```

**Requisitos:**
- Backend corriendo en http://localhost:3000
- Frontend corriendo en http://localhost:5173
- Base de datos con datos de prueba

---

## 📝 Scripts Disponibles

### Backend

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar servidor en desarrollo (con nodemon)
npm test               # Ejecutar tests con Jest
npm run create-admin   # Crear usuario administrador
npm run seed           # Poblar base de datos con datos de prueba
```

### Frontend

```bash
npm run dev            # Iniciar servidor de desarrollo (Vite)
npm run build          # Construir para producción
npm run preview        # Previsualizar build de producción
npm run lint           # Ejecutar linter (ESLint)
npm run cypress:run    # Ejecutar tests E2E (Cypress)
```

---

## 🔧 Herramientas Opcionales Recomendadas

### Desarrollo
- **Visual Studio Code** - Editor de código recomendado
- **Postman** o **Insomnia** - Testing de APIs
- **MySQL Workbench** - Administración de base de datos
- **Git Bash** (Windows) - Terminal Git para Windows

### Extensiones VSCode Recomendadas
- ESLint
- Prettier
- MySQL
- GitLens
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: "Access denied for user"
- Verificar credenciales en `backend/.env`
- Verificar que MySQL esté corriendo
- Verificar permisos del usuario MySQL

---

## 📊 Requisitos de Sistema

### Mínimos
- **RAM:** 4 GB
- **Espacio en disco:** 2 GB libres
- **Procesador:** Dual-core 2.0 GHz

### Recomendados
- **RAM:** 8 GB o más
- **Espacio en disco:** 5 GB libres
- **Procesador:** Quad-core 2.5 GHz o superior

---

## 📞 Soporte

Para más información, consulta:
- [README principal](../README.md)
- [Documentación completa](docs/README.md)
- [Guía de inicio rápido](docs/guias/INICIO-RAPIDO.md)
