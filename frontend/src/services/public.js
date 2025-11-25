import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cliente axios SIN interceptor de autenticación para rutas públicas
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getPublicProductos = async (tenant_slug, categoriaId = null) => {
  let url = `/catalogo/${tenant_slug}/productos`;
  if (categoriaId) {
    url += `?categoria=${categoriaId}`;
  }
  const response = await publicApi.get(url);
  return response.data.data;
};

export const getPublicProducto = async (tenant_slug, id) => {
  const response = await publicApi.get(`/catalogo/${tenant_slug}/productos/${id}`);
  return response.data.data;
};

export const getPublicCategorias = async (tenant_slug) => {
  const response = await publicApi.get(`/catalogo/${tenant_slug}/categorias`);
  return response.data.data;
};

export default {
  getPublicProductos,
  getPublicProducto,
  getPublicCategorias
};
