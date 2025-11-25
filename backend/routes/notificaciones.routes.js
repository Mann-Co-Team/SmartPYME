const express = require('express');
const router = express.Router();
const NotificacionesController = require('../controllers/notificaciones.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');

// Todas las rutas requieren autenticación Y rol admin/empleado
router.use(authenticateToken);
router.use(authorize('manage_notifications'));

// GET /api/notificaciones - Listar notificaciones del usuario
router.get('/', NotificacionesController.getNotificaciones);

// GET /api/notificaciones/unread-count - Obtener contador de no leídas
router.get('/unread-count', NotificacionesController.getUnreadCount);

// PATCH /api/notificaciones/:id/read - Marcar notificación como leída
router.patch('/:id/read', NotificacionesController.markAsRead);

// PATCH /api/notificaciones/read-all - Marcar todas como leídas
router.patch('/read-all', NotificacionesController.markAllAsRead);

// DELETE /api/notificaciones/read - Eliminar notificaciones leídas
router.delete('/read', NotificacionesController.deleteRead);

// DELETE /api/notificaciones/:id - Eliminar notificación individual
router.delete('/:id', NotificacionesController.deleteNotification);

module.exports = router;
