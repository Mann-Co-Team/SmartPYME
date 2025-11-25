import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function TiendaLogin() {
  const { tenant_slug } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Login usando el endpoint UNIFICADO de auth (tabla usuarios con validación de tenant obligatoria)
      const res = await api.post('/auth/login', { 
        email, 
        password,
        tenant_id: tenant.id_tenant
      });
      
      const { token, user } = res.data.data;
      
      // Usar el sistema de autenticación multi-tenant
      const { setTenantAuth } = await import('../../services/auth');
      setTenantAuth(tenant_slug, token, user, tenant);
      
      // Redirigir a la tienda
      navigate(`/tienda/${tenant_slug}`);
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.response?.data?.message || 'Credenciales inválidas. Verifica tu email y contraseña.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {tenant?.nombre_empresa}
          </h2>
          <p className="text-gray-600">Iniciar Sesión como Cliente</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                placeholder="tu@ejemplo.com"
                autoComplete="email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400"
                placeholder="Tu contraseña"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to={`/tienda/${tenant_slug}/registro`} 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Regístrate aquí
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
