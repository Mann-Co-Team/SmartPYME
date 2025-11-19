import api from './api';

// Obtener todos los usuarios
export const getUsuarios = async () => {
    const response = await api.get('/usuarios');
    return response.data.data;
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data.data;
};

// Obtener roles disponibles
export const getRoles = async () => {
    const response = await api.get('/usuarios/roles');
    return response.data.data;
};

// Crear usuario
export const createUsuario = async (usuarioData) => {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
};

// Actualizar usuario
export const updateUsuario = async (id, usuarioData) => {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
};

// Cambiar estado activo/inactivo
export const toggleActiveUsuario = async (id) => {
    const response = await api.patch(`/usuarios/${id}/toggle-active`);
    return response.data;
};

// Eliminar usuario
export const deleteUsuario = async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
};
