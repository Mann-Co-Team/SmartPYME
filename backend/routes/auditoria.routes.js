const express = require('express');
const router = express.Router();
const AuditoriaController = require('../controllers/auditoria.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validateTenant } = require('../middlewares/tenant');

/**
 * Rutas de Auditoría (RF-12)
 * Solo accesible para Administradores (rol 1)
 */

// Aplicar autenticación y validación de tenant a todas las rutas
router.use(authenticateToken);
router.use(validateTenant);
router.use(requireRole([1])); // Solo Admin

/**
 * @route   GET /api/auditoria
 * @desc    Obtener todos los registros de auditoría con filtros
 * @access  Admin
 * @query   id_usuario, modulo, accion, resultado, fecha_inicio, fecha_fin, search, limit, offset
 */
router.get('/', AuditoriaController.getAll);

/**
 * @route   GET /api/auditoria/estadisticas
 * @desc    Obtener estadísticas de auditoría
 * @access  Admin
 */
router.get('/estadisticas', AuditoriaController.getEstadisticas);

/**
 * @route   GET /api/auditoria/export
 * @desc    Exportar registros a CSV
 * @access  Admin
 * @query   id_usuario, modulo, accion, resultado, fecha_inicio, fecha_fin, search
 */
router.get('/export', AuditoriaController.exportCSV);

/**
 * @route   GET /api/auditoria/usuario/:id
 * @desc    Obtener historial de un usuario específico
 * @access  Admin
 * @param   id - ID del usuario
 */
router.get('/usuario/:id', AuditoriaController.getByUsuario);

/**
 * @route   GET /api/auditoria/modulo/:modulo
 * @desc    Obtener registros por módulo
 * @access  Admin
 * @param   modulo - Nombre del módulo
 */
router.get('/modulo/:modulo', AuditoriaController.getByModulo);

/**
 * @route   DELETE /api/auditoria/cleanup
 * @desc    Limpiar registros antiguos
 * @access  Admin
 * @body    dias - Días de retención (default: 90)
 */
router.delete('/cleanup', AuditoriaController.cleanup);

module.exports = router;
