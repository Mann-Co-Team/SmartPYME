// Generar informe de backup
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function generateBackupReport(backupId, tenantId) {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Rocketn3m3s1s.',
        database: 'smartpyme_db'
    });

    try {
        // Obtener info del backup
        const [backups] = await connection.execute(
            'SELECT * FROM backup_log WHERE id_backup = ? AND id_tenant = ?',
            [backupId, tenantId]
        );

        if (backups.length === 0) {
            throw new Error('Backup no encontrado');
        }

        const backup = backups[0];

        // Obtener estadísticas
        const [usuarios] = await connection.execute(
            'SELECT COUNT(*) as total FROM usuarios WHERE id_tenant = ?',
            [tenantId]
        );

        const [productos] = await connection.execute(
            'SELECT COUNT(*) as total FROM productos WHERE id_tenant = ?',
            [tenantId]
        );

        const [pedidos] = await connection.execute(
            'SELECT COUNT(*) as total FROM pedidos WHERE id_tenant = ?',
            [tenantId]
        );

        const [categorias] = await connection.execute(
            'SELECT COUNT(*) as total FROM categorias WHERE id_tenant = ?',
            [tenantId]
        );

        const [tenant] = await connection.execute(
            'SELECT nombre_empresa FROM tenants WHERE id_tenant = ?',
            [tenantId]
        );

        // Generar informe
        const report = `
═══════════════════════════════════════════════════════════════
                    INFORME DE RESPALDO
═══════════════════════════════════════════════════════════════

INFORMACIÓN GENERAL
-------------------------------------------------------------------
Empresa:              ${tenant[0]?.nombre_empresa || 'N/A'}
Fecha de Respaldo:    ${new Date(backup.created_at).toLocaleString('es-CL')}
Tipo de Respaldo:     ${backup.backup_type === 'automatic' ? 'Automático' : 'Manual'}
Estado:               ${backup.status === 'success' ? 'Exitoso' : 'Fallido'}
Archivo:              ${backup.filename}
Tamaño:               ${(backup.file_size / 1024 / 1024).toFixed(2)} MB

CONTENIDO RESPALDADO
-------------------------------------------------------------------
✓ Usuarios:           ${usuarios[0].total} registros
✓ Productos:          ${productos[0].total} registros
✓ Pedidos:            ${pedidos[0].total} registros
✓ Categorías:         ${categorias[0].total} registros

TABLAS INCLUIDAS
-------------------------------------------------------------------
• usuarios            (Datos de usuarios del sistema)
• productos           (Catálogo de productos)
• pedidos             (Historial de pedidos)
• detalle_pedidos     (Detalles de cada pedido)
• categorias          (Categorías de productos)
• auditoria           (Registro de auditoría)
• notificaciones      (Notificaciones del sistema)
• backup_log          (Historial de respaldos)
• tenants             (Información de la empresa)

INSTRUCCIONES DE RESTAURACIÓN
-------------------------------------------------------------------
1. Accede a MySQL Workbench o línea de comandos
2. Ejecuta: mysql -u root -p smartpyme_db < ${backup.filename}
3. Verifica que los datos se hayan restaurado correctamente

NOTAS IMPORTANTES
-------------------------------------------------------------------
• Este respaldo contiene TODOS los datos de tu empresa
• Guarda este archivo en un lugar seguro
• Se recomienda mantener múltiples copias en diferentes ubicaciones
• Los respaldos automáticos se ejecutan diariamente a las 2:00 AM
• Los respaldos antiguos (>30 días) se eliminan automáticamente

═══════════════════════════════════════════════════════════════
                SmartPYME - Sistema de Gestión
                  Generado: ${new Date().toLocaleString('es-CL')}
═══════════════════════════════════════════════════════════════
`;

        await connection.end();
        return report;

    } catch (error) {
        await connection.end();
        throw error;
    }
}

module.exports = { generateBackupReport };
