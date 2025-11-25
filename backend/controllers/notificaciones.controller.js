const NotificacionModel = require('../models/notificaciones.model');

const NotificacionesController = {
  // Obtener notificaciones del usuario autenticado
  async getNotificaciones(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const { leida } = req.query;

      // Convertir string a boolean si existe
      const leidaBoolean = leida === 'true' ? true : leida === 'false' ? false : null;

      const notificaciones = await NotificacionModel.getByUser(id_usuario, leidaBoolean);

      res.json({
        success: true,
        notificaciones
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones'
      });
    }
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const count = await NotificacionModel.getUnreadCount(id_usuario);

      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Error al obtener contador:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contador de notificaciones'
      });
    }
  },

  // Marcar notificación como leída
  async markAsRead(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const { id } = req.params;

      const success = await NotificacionModel.markAsRead(id, id_usuario);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar notificación como leída'
      });
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const affectedRows = await NotificacionModel.markAllAsRead(id_usuario);

      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        count: affectedRows
      });
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar notificaciones como leídas'
      });
    }
  },

  // Eliminar notificaciones leídas
  async deleteRead(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const count = await NotificacionModel.deleteReadNotifications(id_usuario);

      res.json({
        success: true,
        message: 'Notificaciones leídas eliminadas',
        count
      });
    } catch (error) {
      console.error('Error eliminando notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar notificaciones'
      });
    }
  },

  // Eliminar notificación individual
  async deleteNotification(req, res) {
    try {
      const id_usuario = req.user.id_usuario;
      const { id } = req.params;

      const success = await NotificacionModel.deleteNotification(id, id_usuario);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Notificación eliminada'
      });
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar notificación'
      });
    }
  }
};

module.exports = NotificacionesController;
