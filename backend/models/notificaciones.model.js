const db = require('../config/db');

const NotificacionModel = {
  // Crear nueva notificación
  async create(id_usuario, tipo, titulo, mensaje, id_referencia = null, tipo_referencia = null, id_tenant = null) {
    try {
      const query = `
        INSERT INTO notificaciones 
        (id_usuario, tipo, titulo, mensaje, id_referencia, tipo_referencia, id_tenant)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(query, [
        id_usuario,
        tipo,
        titulo,
        mensaje,
        id_referencia,
        tipo_referencia,
        id_tenant
      ]);

      return {
        id_notificacion: result.insertId,
        id_usuario,
        tipo,
        titulo,
        mensaje,
        leida: false,
        id_referencia,
        tipo_referencia,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  },

  // Obtener notificaciones por usuario
  async getByUser(id_usuario, leida = null) {
    try {
      let query = `
        SELECT * FROM notificaciones
        WHERE id_usuario = ?
      `;
      const params = [id_usuario];

      if (leida !== null) {
        query += ' AND leida = ?';
        params.push(leida);
      }

      query += ' ORDER BY created_at DESC LIMIT 50';

      const [rows] = await db.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  },

  // Obtener contador de notificaciones no leídas
  async getUnreadCount(id_usuario) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM notificaciones
        WHERE id_usuario = ? AND leida = FALSE
      `;

      const [rows] = await db.execute(query, [id_usuario]);
      return rows[0].count;
    } catch (error) {
      console.error('Error al obtener contador:', error);
      throw error;
    }
  },

  // Marcar notificación como leída
  async markAsRead(id_notificacion, id_usuario) {
    try {
      const query = `
        UPDATE notificaciones
        SET leida = TRUE
        WHERE id_notificacion = ? AND id_usuario = ?
      `;

      const [result] = await db.execute(query, [id_notificacion, id_usuario]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      throw error;
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(id_usuario) {
    try {
      const query = `
        UPDATE notificaciones
        SET leida = TRUE
        WHERE id_usuario = ? AND leida = FALSE
      `;

      const [result] = await db.execute(query, [id_usuario]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      throw error;
    }
  },

  // Crear notificación para todos los admins y empleados
  async createForAdminsAndEmployees(tipo, titulo, mensaje, id_referencia = null, tipo_referencia = null, id_tenant = null) {
    try {
      // Obtener todos los usuarios admin (id_rol = 1) y empleado (id_rol = 2) del mismo tenant
      let query = 'SELECT id_usuario FROM usuarios WHERE id_rol IN (1, 2) AND activo = TRUE';
      const params = [];
      
      if (id_tenant) {
        query += ' AND id_tenant = ?';
        params.push(id_tenant);
      }
      
      const [usuarios] = await db.execute(query, params);

      const promises = usuarios.map(user =>
        this.create(user.id_usuario, tipo, titulo, mensaje, id_referencia, tipo_referencia, id_tenant)
      );

      await Promise.all(promises);
      return usuarios.length;
    } catch (error) {
      console.error('Error al crear notificaciones para admins:', error);
      throw error;
    }
  },

  // Eliminar notificaciones antiguas (opcional, para limpieza)
  async deleteOldNotifications(daysOld = 30) {
    try {
      const query = `
        DELETE FROM notificaciones
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;

      const [result] = await db.execute(query, [daysOld]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al eliminar notificaciones antiguas:', error);
      throw error;
    }
  },

  // Eliminar notificaciones leídas del usuario
  async deleteReadNotifications(id_usuario) {
    try {
      const query = `
        DELETE FROM notificaciones
        WHERE id_usuario = ? AND leida = TRUE
      `;

      const [result] = await db.execute(query, [id_usuario]);
      return result.affectedRows;
    } catch (error) {
      console.error('Error al eliminar notificaciones leídas:', error);
      throw error;
    }
  },

  // Eliminar notificación individual
  async deleteNotification(id_notificacion, id_usuario) {
    try {
      const query = `
        DELETE FROM notificaciones
        WHERE id_notificacion = ? AND id_usuario = ?
      `;

      const [result] = await db.execute(query, [id_notificacion, id_usuario]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  }
};

module.exports = NotificacionModel;
