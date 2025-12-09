const express = require('express');
const cors = require('cors');
const path = require('path');
const { errors } = require('celebrate');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://tu-dominio-frontend.com']
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba principal
app.get('/api/test', (req, res) => {
    res.json({
        message: 'SmartPYME API funcionando correctamente!',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// Routes - con manejo de errores
try {
    app.use('/api/auth', require('./routes/auth.routes'));
    console.log('✅ Rutas de autenticación cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de auth:', error.message);
}

try {
    app.use('/api/usuarios', require('./routes/usuarios.routes'));
    console.log('✅ Rutas de usuarios cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de usuarios:', error.message);
}

try {
    app.use('/api/productos', require('./routes/productos.routes'));
    console.log('✅ Rutas de productos cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de productos:', error.message);
}

try {
    app.use('/api/categorias', require('./routes/categorias.routes'));
    console.log('✅ Rutas de categorías cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de categorías:', error.message);
}

try {
    app.use('/api/pedidos', require('./routes/pedidos.routes'));
    console.log('✅ Rutas de pedidos cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de pedidos:', error.message);
}

try {
    const settingsRoutes = require('./routes/settings.routes');
    console.log('🔍 DEBUG - Settings routes loaded:', typeof settingsRoutes);
    app.use('/api/settings', settingsRoutes);
    console.log('✅ Rutas de configuraciones cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de settings:', error.message);
    console.error('❌ Stack:', error.stack);
}

try {
    app.use('/api/tenants', require('./routes/tenants.routes'));
    console.log('✅ Rutas de tenants cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de tenants:', error.message);
}

try {
    app.use('/api/estados', require('./routes/estados.routes'));
    console.log('✅ Rutas de estados cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de estados:', error.message);
}

try {
    app.use('/api/dashboard', require('./routes/dashboard.routes'));
    console.log('✅ Rutas de dashboard cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de dashboard:', error.message);
}

try {
    app.use('/api/password-recovery', require('./routes/passwordRecovery.routes'));
    console.log('✅ Rutas de recuperación de contraseña cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de recuperación:', error.message);
}

try {
    app.use('/api/backup', require('./routes/backup.routes'));
    console.log('✅ Rutas de backups cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de backups:', error.message);
}

try {
    app.use('/api/reportes', require('./routes/reportes.routes'));
    console.log('✅ Rutas de reportes cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de reportes:', error.message);
}

try {
    app.use('/api/notificaciones', require('./routes/notificaciones.routes'));
    console.log('✅ Rutas de notificaciones cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de notificaciones:', error.message);
}

try {
    app.use('/api/clientes', require('./routes/clientes.routes'));
    console.log('✅ Rutas de clientes cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de clientes:', error.message);
}

try {
    app.use('/api/catalogo', require('./routes/catalogo.routes'));
    console.log('✅ Rutas de catálogo público cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de catálogo:', error.message);
}

try {
    app.use('/api/perfil', require('./routes/perfil.routes'));
    console.log('✅ Rutas de perfil cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de perfil:', error.message);
}

// Ruta de prueba para auditoría (sin middleware)
try {
    app.use('/api/auditoria-test', require('./routes/auditoria-test.routes'));
    console.log('✅ Rutas de prueba de auditoría cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de prueba:', error.message);
}

try {
    app.use('/api/auditoria', require('./routes/auditoria.routes'));
    console.log('✅ Rutas de auditoría cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de auditoría:', error.message);
}

// Ruta de estado de la API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'SmartPYME API está funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
    });
});

// Middleware para manejar errores de validación de Celebrate
app.use(errors());

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err.stack);

    // Error de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            message: 'Campo de archivo no esperado.'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!'
    });
});

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

module.exports = app;
