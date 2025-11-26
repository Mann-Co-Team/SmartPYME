import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { login, isAuthenticated } from '../../services/auth';
import toast from 'react-hot-toast';
import { LockClosedIcon, EnvelopeIcon, ArrowLeftIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLogin() {
  const { tenant_slug } = useParams(); // Obtener tenant_slug de la URL
  const { darkMode } = useTheme(); // Obtener estado del modo oscuro
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenant_slug: tenant_slug || ''
  });
  const [loading, setLoading] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [validatingTenant, setValidatingTenant] = useState(true);
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (tenant_slug && isAuthenticated(tenant_slug)) {
      navigate(`/${tenant_slug}/admin/dashboard`);
    }
  }, [tenant_slug, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      const { token, user, tenant } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user_type', 'admin');

      if (tenant) {
        localStorage.setItem('tenant', JSON.stringify(tenant));
        localStorage.setItem('current_tenant', tenant.slug);
      }

      toast.success(`¡Bienvenido de nuevo${tenant ? ' a ' + tenant.nombre_empresa : ''}!`);

      // Redirigir al dashboard del tenant correspondiente usando la URL con tenant_slug
      navigate(`/${tenant_slug}/admin/dashboard`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Credenciales inválidas. Verifica tus datos.';
      toast.error(errorMsg);
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

  // Validar tenant_slug cuando cambia o cuando se carga desde la URL
  useEffect(() => {
    const validateTenant = async () => {
      const slugToValidate = tenant_slug || formData.tenant_slug;

      if (slugToValidate && slugToValidate.length >= 3) {
        setValidatingTenant(true);
        try {
          const response = await api.get(`/tenants/validate/${slugToValidate}`);
          if (response.data.success && response.data.data) {
            setTenantInfo(response.data.data);
            // Si viene de la URL, actualizar formData
            if (tenant_slug) {
              setFormData(prev => ({ ...prev, tenant_slug: tenant_slug }));
            }
          } else {
            setTenantInfo(null);
            // Si el tenant de la URL no es válido, redirigir al home
            if (tenant_slug) {
              toast.error('Empresa no encontrada');
              navigate('/');
            }
          }
        } catch (error) {
          setTenantInfo(null);
          if (tenant_slug) {
            toast.error('Empresa no encontrada');
            navigate('/');
          }
        } finally {
          setValidatingTenant(false);
        }
      } else {
        setTenantInfo(null);
        setValidatingTenant(false);
      }
    };

    const debounce = setTimeout(validateTenant, tenant_slug ? 0 : 500);
    return () => clearTimeout(debounce);
  }, [formData.tenant_slug, tenant_slug, navigate]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}>
      {/* Decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            {tenantInfo ? (
              <BuildingStorefrontIcon className="h-8 w-8 text-white" />
            ) : (
              <LockClosedIcon className="h-8 w-8 text-white" />
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
            {tenantInfo ? tenantInfo.nombre_empresa : 'SmartPYME'}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {tenantInfo ? (
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Panel de Administración • Plan {tenantInfo.plan}
              </span>
            ) : (
              'Ingresa el identificador de tu empresa'
            )}
          </p>
        </div>      {/* Form Card */}
        <div className={`${darkMode ? 'bg-gray-800 bg-opacity-95' : 'bg-white bg-opacity-95'} rounded-xl shadow-xl p-6 space-y-4 backdrop-blur-sm`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant Slug Input - Ahora primero */}
            <div>
              <label htmlFor="tenant_slug" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Identificador de Empresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="tenant_slug"
                  name="tenant_slug"
                  type="text"
                  required
                  disabled={!!tenant_slug}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-400'} ${tenant_slug ? (darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed') : ''
                    } ${tenantInfo
                      ? 'border-green-500 focus:ring-green-500'
                      : formData.tenant_slug.length >= 3
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-600'
                    }`}
                  placeholder="pasteleria-dulce-sabor"
                  value={formData.tenant_slug}
                  onChange={handleChange}
                />
                {validatingTenant && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {!validatingTenant && tenantInfo && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!validatingTenant && !tenantInfo && formData.tenant_slug.length >= 3 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              {tenantInfo ? (
                <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {tenant_slug ? 'Empresa verificada' : `Empresa encontrada: ${tenantInfo.nombre_empresa}`}
                </p>
              ) : formData.tenant_slug.length >= 3 ? (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Empresa no encontrada
                </p>
              ) : !tenant_slug ? (
                <p className="mt-1 text-xs text-gray-500">
                  Ejemplo: pasteleria-dulce-sabor, megamarket-empresarial
                </p>
              ) : null}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Correo Electrónico del Administrador
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
                  className={`block w-full pl-10 pr-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  placeholder={tenantInfo ? `admin@${formData.tenant_slug}.com` : 'admin@tu-empresa.com'}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Contraseña
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
                  className={`block w-full pl-10 pr-3 py-3 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 placeholder-gray-400`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Link de recuperación de contraseña */}
            <div className="text-center">
              <Link
                to="/olvide-password"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 hover:underline transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !tenantInfo}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-medium bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-3`}>
            <div className="flex flex-col space-y-2 text-center text-sm">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ¿Eres usuario? Inicia sesión aquí
              </Link>
              <Link
                to={tenant_slug ? `/tienda/${tenant_slug}` : '/'}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'} font-medium transition-colors inline-flex items-center justify-center`}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ¿Necesitas ayuda? Contacta al administrador del sistema
        </p>
      </div>
    </div>
  );
}
