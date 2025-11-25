const db = require('./config/db');

async function resetNotificaciones() {
    try {
        console.log('🗑️  Limpiando notificaciones antiguas...');
        
        // Eliminar todas las notificaciones
        await db.execute('DELETE FROM notificaciones');
        
        console.log('✅ Todas las notificaciones han sido eliminadas');
        console.log('📝 Base de datos lista para nuevas notificaciones de prueba');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al limpiar notificaciones:', error);
        process.exit(1);
    }
}

resetNotificaciones();
