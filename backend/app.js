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
        : ['http://localhost:5173', 'http://localhost:3000'],
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
    app.use('/api/settings', require('./routes/settings.routes'));
    console.log('✅ Rutas de configuraciones cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de settings:', error.message);
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
