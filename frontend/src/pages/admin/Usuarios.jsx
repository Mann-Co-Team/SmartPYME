import React, { useState, useEffect } from 'react';
import { 
    getUsuarios, 
    getRoles, 
    createUsuario, 
    updateUsuario, 
    toggleActiveUsuario, 
    deleteUsuario 
} from '../../services/usuarios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState(null);
    const [deletingUsuario, setDeletingUsuario] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        id_rol: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setError(null);
            const [usuariosData, rolesData] = await Promise.all([
                getUsuarios(),
                getRoles()
            ]);
            setUsuarios(usuariosData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.response?.data?.message || 'Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (usuario = null) => {
        if (usuario) {
            setEditingUsuario(usuario);
            setFormData({
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                password: '', // No mostramos la contraseña
                telefono: usuario.telefono || '',
                id_rol: usuario.id_rol
            });
        } else {
            setEditingUsuario(null);
            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                telefono: '',
                id_rol: ''
            });
        }
        setShowModal(true);
        setError(null);
        setSuccess(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUsuario(null);
        setFormData({
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            telefono: '',
            id_rol: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            // Preparar datos - no enviar password vacío en edición
            const dataToSend = { ...formData };
            if (editingUsuario && !dataToSend.password) {
                delete dataToSend.password;
            }

            if (editingUsuario) {
                await updateUsuario(editingUsuario.id_usuario, dataToSend);
                setSuccess('Usuario actualizado exitosamente');
            } else {
                await createUsuario(dataToSend);
                setSuccess('Usuario creado exitosamente');
            }

            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Error guardando usuario:', error);
            setError(error.response?.data?.message || 'Error guardando usuario');
        }
    };

    const handleToggleActive = async (usuario) => {
        try {
            setError(null);
            await toggleActiveUsuario(usuario.id_usuario);
            setSuccess(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`);
            loadData();
        } catch (error) {
            console.error('Error cambiando estado:', error);
            setError(error.response?.data?.message || 'Error cambiando estado del usuario');
        }
    };

    const handleOpenDeleteConfirm = (usuario) => {
        setDeletingUsuario(usuario);
        setShowDeleteConfirm(true);
        setError(null);
    };

    const handleDelete = async () => {
        try {
            setError(null);
            await deleteUsuario(deletingUsuario.id_usuario);
            setSuccess('Usuario eliminado exitosamente');
            setShowDeleteConfirm(false);
            setDeletingUsuario(null);
            loadData();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            setError(error.response?.data?.message || 'Error eliminando usuario');
            setShowDeleteConfirm(false);
        }
    };

    const getRolNombre = (idRol) => {
        const rol = roles.find(r => r.id_rol === idRol);
        return rol ? rol.nombre_rol : 'N/A';
    };

    const getRolColor = (nombreRol) => {
        switch(nombreRol.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'empleado':
                return 'bg-blue-100 text-blue-800';
            case 'cliente':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra usuarios y asigna roles</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-green-800">{success}</span>
                </div>
            )}

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teléfono
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            usuarios.map((usuario) => (
                                <tr key={usuario.id_usuario} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {usuario.nombre} {usuario.apellido}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{usuario.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {usuario.telefono || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolColor(usuario.nombre_rol)}`}>
                                            {usuario.nombre_rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleActive(usuario)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                usuario.activo
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {usuario.activo ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(usuario)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteConfirm(usuario)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña {editingUsuario ? '(dejar vacío para no cambiar)' : '*'}
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={!editingUsuario}
                                            minLength="6"
                                        />
                                        {!editingUsuario && (
                                            <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rol *
                                        </label>
                                        <select
                                            value={formData.id_rol}
                                            onChange={(e) => setFormData({...formData, id_rol: parseInt(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar rol</option>
                                            {roles.map(rol => (
                                                <option key={rol.id_rol} value={rol.id_rol}>
                                                    {rol.nombre_rol} {rol.descripcion && `- ${rol.descripcion}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        {editingUsuario ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminación */}
            {showDeleteConfirm && deletingUsuario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h2>
                        <p className="text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar al usuario{' '}
                            <span className="font-semibold">
                                {deletingUsuario.nombre} {deletingUsuario.apellido}
                            </span>?
                        </p>
                        <p className="text-sm text-red-600 mb-6">
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletingUsuario(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
