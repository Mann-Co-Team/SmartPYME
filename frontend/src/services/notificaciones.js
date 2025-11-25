import api from './api';

// Obtener notificaciones del usuario autenticado
export const getNotificaciones = async (leida = null) => {
  try {
    const params = leida !== null ? { leida } : {};
    const response = await api.get('/notificaciones', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    throw error;
  }
};

// Obtener contador de notificaciones no leídas
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notificaciones/unread-count');
    return response.data.count;
  } catch (error) {
    console.error('Error obteniendo contador:', error);
    throw error;
  }
};

// Marcar notificación como leída
export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notificaciones/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marcando como leída:', error);
    throw error;
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/notificaciones/read-all');
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

export const deleteReadNotifications = async () => {
  try {
    const response = await api.delete('/notificaciones/read');
    return response.data;
  } catch (error) {
    console.error('Error al eliminar notificaciones leídas:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    throw error;
  }
};

export default {
  getNotificaciones,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteReadNotifications,
  deleteNotification
};
