import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const login = async (data) => {
  return await API.post('/auth/login', data);
};
