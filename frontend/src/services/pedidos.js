import api from './api';

export const getPedidos = async () => {
  const res = await api.get('/pedidos');
  return res.data.data;
};

export const crearPedido = async (data) => {
  const res = await api.post('/pedidos', data);
  return res.data.data;
};

export const actualizarPedido = async (id, data) => {
  await api.patch(`/pedidos/${id}`, data);
};

export const eliminarPedido = async (id) => {
  await api.delete(`/pedidos/${id}`);
};
