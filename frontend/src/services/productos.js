import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const getProductos = async () => {
  const res = await API.get('/productos');
  return res.data.data;
};

export const crearProducto = async (data) => {
  const res = await API.post('/productos', data);
  return res.data.data;
};

export const actualizarProducto = async (id, data) => {
  await API.put(`/productos/${id}`, data);
};

export const eliminarProducto = async (id) => {
  await API.delete(`/productos/${id}`);
};
