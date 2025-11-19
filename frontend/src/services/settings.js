import api from './api';

export const getSettings = async () => {
  try {
    const response = await api.get('/settings/public/all');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error);
    return {};
  }
};

export const updateSettings = async (settings) => {
  const response = await api.put('/settings', settings);
  return response.data;
};

export const updateSetting = async (key, value) => {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data;
};
