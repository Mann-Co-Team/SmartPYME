const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces

console.log('🔧 Intentando iniciar servidor...');
console.log(`📌 Puerto configurado: ${PORT}`);
console.log(`📌 Host configurado: ${HOST}`);

const server = app.listen(PORT, HOST, () => {
    const address = server.address();
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📝 Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`✅ Escuchando en: ${address.address}:${address.port}`);
    console.log(`📍 Family: ${address.family}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
        console.log(`💡 Intenta cerrar otras aplicaciones o usar otro puerto`);
    } else if (error.code === 'EACCES') {
        console.error(`❌ Error: Sin permisos para usar el puerto ${PORT}`);
        console.log(`💡 Intenta usar un puerto diferente (mayor a 1024)`);
    } else {
        console.error('❌ Error del servidor:', error);
    }
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('👋 Cerrando servidor gracefully...');
    server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
    });
});
