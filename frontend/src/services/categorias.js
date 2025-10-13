import api from './api';

export const getCategorias = async () => {
  const response = await api.get('/categorias');
  return response.data.data;
};

export const getCategoria = async (id) => {
  const response = await api.get(`/categorias/${id}`);
  return response.data.data;
};

export const createCategoria = async (formData) => {
  const response = await api.post('/categorias', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateCategoria = async (id, formData) => {
  const response = await api.put(`/categorias/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
};

export const toggleCategoriaActive = async (id) => {
  const response = await api.patch(`/categorias/${id}/toggle-active`);
  return response.data;
};
