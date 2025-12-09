import api from './api';

/**
 * Obtener todas las configuraciones
 */
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

/**
 * Obtener configuraciones por categoría
 */
export const getSettingsByCategory = async (category) => {
  const response = await api.get(`/settings/category/${category}`);
  return response.data;
};

/**
 * Obtener configuración específica
 */
export const getSetting = async (key) => {
  const response = await api.get(`/settings/${key}`);
  return response.data;
};

/**
 * Actualizar configuraciones
 */
export const updateSettings = async (settings) => {
  const response = await api.put('/settings', settings);
  return response.data;
};

export default {
  getSettings,
  getSettingsByCategory,
  getSetting,
  updateSettings
};
