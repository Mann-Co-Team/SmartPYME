import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/auth';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function TiendaPerfil() {
  const { tenant_slug } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('datos'); // 'datos', 'password'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Formulario de datos personales
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: ''
  });

  // Formulario de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadData();
  }, [tenant_slug]);

  const loadData = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate(`/tienda/${tenant_slug}/login`);
        return;
      }

      // Cargar tenant
      const tenantResponse = await api.get(`/tenants/slug/${tenant_slug}`);
      const tenantData = tenantResponse.data.data;
      setTenant(tenantData);

      // Cargar datos del usuario desde el backend usando el endpoint de perfil
      const userResponse = await api.get('/perfil');
      const userData = userResponse.data.data;

      // VALIDACIÓN MULTI-TENANT: Verificar que el usuario pertenezca a este tenant
      if (userData.id_tenant && tenantData.id_tenant && userData.id_tenant !== tenantData.id_tenant) {
        setMessage({
          type: 'error',
          text: `🚫 Acceso denegado. Este usuario no pertenece a esta tienda.`
        });
        setLoading(false);
        // Redirigir después de 3 segundos
        setTimeout(() => {
          navigate(`/tienda/${tenant_slug}`);
        }, 3000);
        return;
      }

      setUser(userData);
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        telefono: userData.telefono || ''
      });
    } catch (err) {
      console.error('Error cargando datos:', err);
      setMessage({ type: 'error', text: 'Error cargando datos del perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/perfil', formData);

      // Actualizar localStorage
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error actualizando perfil'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Validaciones frontend
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({ type: 'error', text: '❌ La nueva contraseña no puede ser igual a la actual' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Las contraseñas nuevas no coinciden' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '❌ La contraseña debe tener al menos 8 caracteres' });
      setSaving(false);
      return;
    }

    // Validar complejidad
    if (!/[a-z]/.test(passwordData.newPassword)) {
      setMessage({ type: 'error', text: '❌ La contraseña debe contener al menos una letra minúscula' });
      setSaving(false);
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setMessage({ type: 'error', text: '❌ La contraseña debe contener al menos una letra mayúscula' });
      setSaving(false);
      return;
    }

    if (!/\d/.test(passwordData.newPassword)) {
      setMessage({ type: 'error', text: '❌ La contraseña debe contener al menos un número' });
      setSaving(false);
      return;
    }

    try {
      await api.put('/perfil/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setMessage({ type: 'success', text: '✅ Contraseña actualizada correctamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error cambiando contraseña'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout(tenant_slug);
    navigate(`/tienda/${tenant_slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mostrar solo mensaje de acceso denegado sin contenido
  if (message.type === 'error' && message.text.includes('Acceso denegado')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {message.text}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            Redirigiendo en 3 segundos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/tienda/${tenant_slug}`)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Volver a la tienda
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mi Perfil
              </h1>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tenant?.nombre_empresa}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de feedback */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
            }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('datos')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'datos'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                👤 Datos Personales
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                🔒 Cambiar Contraseña
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Datos Personales */}
            {activeTab === 'datos' && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/tienda/${tenant_slug}`)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Cambiar Contraseña */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      La contraseña debe cumplir con:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                      <li className="flex items-center">
                        <span className={passwordData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                          {passwordData.newPassword.length >= 8 ? '✓' : '○'}
                        </span>
                        <span className="ml-2">Mínimo 8 caracteres</span>
                      </li>
                      <li className="flex items-center">
                        <span className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'}
                        </span>
                        <span className="ml-2">Al menos una letra minúscula</span>
                      </li>
                      <li className="flex items-center">
                        <span className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'}
                        </span>
                        <span className="ml-2">Al menos una letra mayúscula</span>
                      </li>
                      <li className="flex items-center">
                        <span className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/\d/.test(passwordData.newPassword) ? '✓' : '○'}
                        </span>
                        <span className="ml-2">Al menos un número</span>
                      </li>
                      <li className="flex items-center">
                        <span className={passwordData.newPassword && passwordData.currentPassword !== passwordData.newPassword ? 'text-green-600' : 'text-gray-400'}>
                          {passwordData.newPassword && passwordData.currentPassword !== passwordData.newPassword ? '✓' : '○'}
                        </span>
                        <span className="ml-2">Diferente a la contraseña actual</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="8"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      ⚠️ Las contraseñas no coinciden
                    </p>
                  )}
                  {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                      ✓ Las contraseñas coinciden
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sección de acciones */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Accesos Rápidos
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(`/tienda/${tenant_slug}/pedidos`)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span>📦</span>
              <span>Ver mis pedidos</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
