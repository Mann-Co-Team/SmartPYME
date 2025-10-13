import api from './api';

export const getProductos = async () => {
  const response = await api.get('/productos');
  return response.data.data;
};

export const getProducto = async (id) => {
  const response = await api.get(`/productos/${id}`);
  return response.data.data;
};

export const createProducto = async (formData) => {
  const response = await api.post('/productos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProducto = async (id, formData) => {
  const response = await api.put(`/productos/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

export const toggleProductoActive = async (id) => {
  const response = await api.patch(`/productos/${id}/toggle-active`);
  return response.data;
};
