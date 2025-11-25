const cron = require('node-cron');
const NotificacionModel = require('./models/notificaciones.model');

/**
 * Script de limpieza automática de notificaciones antiguas
 * 
 * Configuración:
 * - Se ejecuta todos los días a las 3:00 AM
 * - Elimina notificaciones con más de 30 días de antigüedad
 * 
 * Para ejecutar manualmente: node cleanup-notificaciones.js
 * Para ejecutar automáticamente: Importar en app.js o usar PM2/cron
 */

// Función de limpieza
async function cleanupNotificaciones() {
    try {
        const daysOld = process.env.NOTIFICATION_RETENTION_DAYS || 30;
        console.log(`🧹 Iniciando limpieza de notificaciones (>${daysOld} días)...`);
        
        const deletedCount = await NotificacionModel.deleteOldNotifications(daysOld);
        
        if (deletedCount > 0) {
            console.log(`✅ Limpieza completada: ${deletedCount} notificaciones eliminadas`);
        } else {
            console.log('✅ No hay notificaciones antiguas para eliminar');
        }
    } catch (error) {
        console.error('❌ Error en limpieza de notificaciones:', error);
    }
}

// Si se ejecuta directamente
if (require.main === module) {
    console.log('📝 Ejecutando limpieza manual de notificaciones...');
    cleanupNotificaciones().then(() => {
        console.log('✅ Proceso completado');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
} else {
    // Si se importa como módulo, configurar cron job
    // Ejecutar todos los días a las 3:00 AM
    cron.schedule('0 3 * * *', async () => {
        console.log('⏰ Ejecutando limpieza automática programada...');
        await cleanupNotificaciones();
    });
    
    console.log('✅ Limpieza automática de notificaciones configurada (3:00 AM diariamente)');
}

module.exports = { cleanupNotificaciones };
