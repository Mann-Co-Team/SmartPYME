import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export const getPedidos = async () => {
  const res = await API.get('/pedidos');
  return res.data.data;
};

export const crearPedido = async (data) => {
  const res = await API.post('/pedidos', data);
  return res.data.data;
};

export const actualizarPedido = async (id, data) => {
  await API.patch(`/pedidos/${id}`, data);
};

export const eliminarPedido = async (id) => {
  await API.delete(`/pedidos/${id}`);
};
