import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token dinámicamente
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
