import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import DarkModeToggleStandalone from '../../components/DarkModeToggleStandalone';

export default function TiendaRegistro() {
  const { t } = useTranslation();
  const { tenant_slug } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: ''
  });

  useEffect(() => {
    loadTenant();
  }, [tenant_slug]);

  const loadTenant = async () => {
    try {
      const response = await api.get(`/tenants/slug/${tenant_slug}`);
      const tenantData = response.data.data;

      if (!tenantData || !tenantData.activo) {
        setError('Esta tienda no está disponible');
        return;
      }

      setTenant(tenantData);
    } catch (err) {
      setError('No se pudo cargar la tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
      toast.error(t('auth.fillAllFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      // Crear cliente usando el endpoint UNIFICADO de auth (tabla usuarios)
      const response = await api.post('/auth/register-public', {
        nombre: `${formData.nombre} ${formData.apellido}`,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        tenant_id: tenant.id_tenant
      });

      toast.success(t('auth.registerSuccess'));

      // Redirigir al login de la tienda
      setTimeout(() => {
        navigate(`/tienda/${tenant_slug}/login`);
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err);
      const errorMessage = err.response?.data?.message || 'Error al registrar usuario';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Switchers */}
        <div className="flex justify-end gap-2 mb-4">
          <LanguageSwitcher />
          <DarkModeToggleStandalone />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {tenant?.nombre_empresa}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan"
                  />
                </div>
              </div>

              {/* Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Calle Principal 123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>

              {/* Confirmar Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              {t('auth.hasAccount')}{' '}
              <Link
                to={`/tienda/${tenant_slug}/login`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('auth.loginHere')}
              </Link>
            </p>
            <Link
              to={`/tienda/${tenant_slug}`}
              className="block text-sm text-gray-600 hover:text-gray-700"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
