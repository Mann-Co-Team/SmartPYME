import React, { useState, useEffect } from 'react';
import { 
    getUsuarios, 
    getRoles, 
    createUsuario, 
    updateUsuario, 
    toggleActiveUsuario, 
    deleteUsuario 
} from '../../services/usuarios';
import { verifyPassword } from '../../services/auth';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon,
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    LockClosedIcon
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
    const [tenantInfo, setTenantInfo] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [deletingInProgress, setDeletingInProgress] = useState(false);

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
        loadTenantInfo();
    }, []);

    const loadTenantInfo = () => {
        try {
            const tenant = JSON.parse(localStorage.getItem('tenant'));
            setTenantInfo(tenant);
        } catch (err) {
            console.error('Error cargando info del tenant:', err);
        }
    };

    const getPlanLimits = (plan) => {
        const limits = {
            basico: 5,
            profesional: 20,
            empresarial: null // null = ilimitado
        };
        return limits[plan] || 5;
    };

    const canAddMoreUsers = () => {
        if (!tenantInfo) return false;
        const limit = getPlanLimits(tenantInfo.plan);
        if (limit === null) return true; // Ilimitado
        // Solo contar admin y empleados para el límite (roles 1 y 2)
        const staffCount = usuarios.filter(u => u.id_rol === 1 || u.id_rol === 2).length;
        return staffCount < limit;
    };

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
        setDeletePassword('');
        setError(null);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        if (!deletePassword) {
            setError('Debes ingresar tu contraseña para confirmar');
            return;
        }

        try {
            setError(null);
            setDeletingInProgress(true);

            // Primero verificar la contraseña
            await verifyPassword(deletePassword);

            // Si la contraseña es correcta, eliminar usuario
            await deleteUsuario(deletingUsuario.id_usuario);
            setSuccess('Usuario eliminado exitosamente');
            setShowDeleteConfirm(false);
            setDeletingUsuario(null);
            setDeletePassword('');
            loadData();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            setError(error.response?.data?.message || 'Error eliminando usuario');
        } finally {
            setDeletingInProgress(false);
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
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-gray-600 mt-1">Administra usuarios y asigna roles</p>
                    
                    {/* Indicador de Plan */}
                    {tenantInfo && (
                        <div className="mt-4 inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <span className="text-2xl">
                                {tenantInfo.plan === 'basico' ? '📦' : tenantInfo.plan === 'profesional' ? '⭐' : '👑'}
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    Plan {tenantInfo.plan.charAt(0).toUpperCase() + tenantInfo.plan.slice(1)}
                                </p>
                                <p className="text-sm text-blue-700">
                                    👥 Staff: <span className="font-bold">{usuarios.filter(u => u.id_rol === 1 || u.id_rol === 2).length}</span>
                                    {getPlanLimits(tenantInfo.plan) !== null && (
                                        <> / {getPlanLimits(tenantInfo.plan)}</>
                                    )}
                                    {getPlanLimits(tenantInfo.plan) === null && <> (Ilimitado)</>}
                                </p>
                                <p className="text-xs text-blue-600">
                                    👤 Clientes: <span className="font-bold">{usuarios.filter(u => u.id_rol === 3).length}</span> (ilimitados)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div>
                    {canAddMoreUsers() ? (
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Nuevo Usuario
                        </button>
                    ) : (
                        <div className="text-center">
                            <button
                                disabled
                                className="flex items-center gap-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                                title="Has alcanzado el límite de usuarios de tu plan"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Límite Alcanzado
                            </button>
                            <p className="text-xs text-orange-600 mt-2 font-medium">
                                ⚠️ Mejora tu plan para agregar más usuarios
                            </p>
                        </div>
                    )}
                </div>
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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <LockClosedIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                            ¿Estás seguro de que deseas eliminar al usuario{' '}
                            <span className="font-semibold">
                                {deletingUsuario.nombre} {deletingUsuario.apellido}
                            </span>?
                        </p>
                        <p className="text-sm text-red-600 mb-6">
                            Esta acción no se puede deshacer.
                        </p>

                        <form onSubmit={handleDelete}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ingresa tu contraseña para confirmar *
                                </label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Tu contraseña"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletingUsuario(null);
                                        setDeletePassword('');
                                        setError(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={deletingInProgress}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={deletingInProgress}
                                >
                                    {deletingInProgress ? 'Eliminando...' : 'Eliminar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Usuarios;
