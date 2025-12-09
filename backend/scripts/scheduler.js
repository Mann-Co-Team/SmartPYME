// Scheduler de Backups Automáticos
const cron = require('node-cron');
const { createBackup } = require('./backup');

console.log('📅 Scheduler de backups iniciado');

// Ejecutar backup automático todos los días a las 2:00 AM
cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Ejecutando backup automático programado...');
    try {
        await createBackup(null, null, true); // isAutomatic = true
        console.log('✅ Backup automático completado');
    } catch (error) {
        console.error('❌ Error en backup automático:', error);

        // Crear notificación de fallo
        try {
            const db = require('../config/db');

            // Obtener todos los admins de todos los tenants
            const [admins] = await db.execute(
                `SELECT id_usuario, id_tenant FROM usuarios WHERE id_rol = 1`
            );

            // Crear notificación para cada admin
            for (const admin of admins) {
                await db.execute(
                    `INSERT INTO notificaciones (id_usuario, id_tenant, tipo, titulo, mensaje, prioridad, leida)
                     VALUES (?, ?, 'error', ?, ?, 'alta', 0)`,
                    [
                        admin.id_usuario,
                        admin.id_tenant,
                        'Fallo en Backup Automático',
                        `El backup automático programado ha fallado. Error: ${error.message}. Por favor, revisa el sistema de backups.`
                    ]
                );
            }

            console.log(`📧 Notificaciones de fallo enviadas a ${admins.length} administradores`);

        } catch (notifError) {
            console.error('❌ Error creando notificaciones:', notifError);
        }
    }
}, {
    scheduled: true,
    timezone: "America/Santiago" // Zona horaria de Chile
});

console.log('⏰ Backup automático programado para las 2:00 AM diariamente');

// Mantener el proceso vivo
process.on('SIGINT', () => {
    console.log('\n👋 Deteniendo scheduler de backups...');
    process.exit(0);
});
