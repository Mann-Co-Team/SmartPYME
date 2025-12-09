const AuditoriaModel = require('../models/auditoria.model');
const { getActionLabel } = require('../middlewares/audit');

/**
 * Controlador de Auditoría (RF-12)
 * Gestiona consultas y reportes del sistema de auditoría
 */
class AuditoriaController {
    /**
     * Obtener todos los registros de auditoría con filtros
     * GET /api/auditoria
     */
    static async getAll(req, res) {
        try {
            console.log('🔍 DEBUG - req.user:', req.user);
            const tenantId = req.user.tenant_id;
            console.log('🔍 DEBUG - tenantId:', tenantId);

            const filters = {
                id_usuario: req.query.id_usuario,
                modulo: req.query.modulo,
                accion: req.query.accion,
                resultado: req.query.resultado,
                fecha_inicio: req.query.fecha_inicio,
                fecha_fin: req.query.fecha_fin,
                search: req.query.search,
                limit: req.query.limit || 50,
                offset: req.query.offset || 0
            };

            console.log('🔍 DEBUG - filters:', filters);

            // Obtener registros y total
            const [registros, total] = await Promise.all([
                AuditoriaModel.getAll(tenantId, filters),
                AuditoriaModel.count(tenantId, filters)
            ]);

            console.log('🔍 DEBUG - registros:', registros.length, 'total:', total);

            // Agregar etiqueta legible a cada registro
            const registrosConEtiquetas = registros.map(r => ({
                ...r,
                accion_label: getActionLabel(r.accion)
            }));

            res.json({
                success: true,
                data: registrosConEtiquetas,
                pagination: {
                    total,
                    limit: parseInt(filters.limit),
                    offset: parseInt(filters.offset),
                    pages: Math.ceil(total / filters.limit)
                }
            });
        } catch (error) {
            console.error('Error obteniendo registros de auditoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener registros de auditoría'
            });
        }
    }

    /**
     * Obtener estadísticas de auditoría
     * GET /api/auditoria/estadisticas
     */
    static async getEstadisticas(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const estadisticas = await AuditoriaModel.getEstadisticas(tenantId);

            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas de auditoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de auditoría'
            });
        }
    }

    /**
     * Obtener historial de un usuario específico
     * GET /api/auditoria/usuario/:id
     */
    static async getByUsuario(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const usuarioId = req.params.id;
            const limit = req.query.limit || 50;

            const registros = await AuditoriaModel.getByUsuario(tenantId, usuarioId, limit);

            res.json({
                success: true,
                data: registros
            });
        } catch (error) {
            console.error('Error obteniendo historial de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener historial de usuario'
            });
        }
    }

    /**
     * Obtener registros por módulo
     * GET /api/auditoria/modulo/:modulo
     */
    static async getByModulo(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const modulo = req.params.modulo;
            const limit = req.query.limit || 100;

            const registros = await AuditoriaModel.getByModulo(tenantId, modulo, limit);

            res.json({
                success: true,
                data: registros
            });
        } catch (error) {
            console.error('Error obteniendo registros por módulo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener registros por módulo'
            });
        }
    }

    /**
     * Exportar registros a CSV
     * GET /api/auditoria/export
     */
    static async exportCSV(req, res) {
        try {
            const tenantId = req.user.tenant_id;
            const filters = {
                id_usuario: req.query.id_usuario,
                modulo: req.query.modulo,
                accion: req.query.accion,
                resultado: req.query.resultado,
                fecha_inicio: req.query.fecha_inicio,
                fecha_fin: req.query.fecha_fin,
                search: req.query.search,
                limit: 10000 // Límite máximo para export
            };

            const registros = await AuditoriaModel.getAll(tenantId, filters);

            // Generar CSV
            const headers = [
                'ID',
                'Fecha/Hora',
                'Usuario',
                'Email',
                'Módulo',
                'Acción',
                'Descripción',
                'Resultado',
                'IP Address',
                'Mensaje Error'
            ];

            const rows = registros.map(r => [
                r.id_auditoria,
                new Date(r.created_at).toLocaleString('es-CL'),
                `${r.usuario_nombre || ''} ${r.usuario_apellido || ''}`.trim() || 'N/A',
                r.usuario_email || 'N/A',
                r.modulo,
                r.accion,
                r.descripcion || '',
                r.resultado,
                r.ip_address || '',
                r.mensaje_error || ''
            ]);

            // Construir CSV
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Enviar archivo
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=auditoria_${Date.now()}.csv`);
            res.send('\uFEFF' + csvContent); // BOM para Excel
        } catch (error) {
            console.error('Error exportando auditoría a CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar auditoría'
            });
        }
    }

    /**
     * Limpiar registros antiguos (solo Super Admin)
     * DELETE /api/auditoria/cleanup
     */
    static async cleanup(req, res) {
        try {
            const dias = req.body.dias || 90;

            // Solo permitir a super admins (opcional)
            if (req.user.id_rol !== 1) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción'
                });
            }

            const eliminados = await AuditoriaModel.cleanup(dias);

            res.json({
                success: true,
                message: `Se eliminaron ${eliminados} registros antiguos`,
                data: { eliminados, dias }
            });
        } catch (error) {
            console.error('Error limpiando registros de auditoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al limpiar registros de auditoría'
            });
        }
    }
}

module.exports = AuditoriaController;
