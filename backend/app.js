const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba principal
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'SmartPYME API funcionando correctamente!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
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
    app.use('/api/pedidos', require('./routes/pedidos.routes'));
    console.log('✅ Rutas de pedidos cargadas');
} catch (error) {
    console.error('❌ Error cargando rutas de pedidos:', error.message);
}

// Ruta de estado de la API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'SmartPYME API está funcionando',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err.stack);
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
