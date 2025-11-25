import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTiendas();
  }, []);

  const loadTiendas = async () => {
    try {
      setError(null);
      // Obtener todas las tiendas activas (endpoint público)
      const response = await api.get('/tenants/public');
      setTiendas(response.data.data);
    } catch (err) {
      console.error('Error cargando tiendas:', err);
      setError('No se pudieron cargar las tiendas disponibles.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTienda = (slug) => {
    navigate(`/tienda/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error de Conexión</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadTiendas}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SmartPYME</h1>
              <p className="text-gray-600 mt-1">Sistema de Gestión Comercial</p>
            </div>
            <button
              onClick={() => navigate('/admin/seleccionar-empresa')}
              className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition-colors"
            >
              Acceso Administrador
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <span className="inline-block p-3 bg-blue-600 text-white rounded-full mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bienvenido a SmartPYME
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Selecciona la tienda donde deseas comprar
          </p>
        </div>
      </section>

      {/* Tiendas Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {tiendas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay tiendas disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tiendas.map((tienda) => (
                <div
                  key={tienda.id_tenant}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                  onClick={() => handleSelectTienda(tienda.slug)}
                >
                  {/* Logo o imagen de la tienda */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    {tienda.logo ? (
                      <img src={tienda.logo} alt={tienda.nombre_empresa} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white text-6xl">
                        <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Información de la tienda */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {tienda.nombre_empresa}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span className="text-sm">
                        {tienda.total_productos || 0} productos disponibles
                      </span>
                    </div>

                    {tienda.email_empresa && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{tienda.email_empresa}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTienda(tienda.slug);
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Visitar Tienda
                    </button>
                  </div>

                  {/* Badge del plan */}
                  <div className="px-6 pb-4">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      tienda.plan === 'empresarial' ? 'bg-purple-100 text-purple-800' :
                      tienda.plan === 'profesional' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Plan {tienda.plan?.charAt(0).toUpperCase() + tienda.plan?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">© 2025 SmartPYME. Sistema de Gestión Comercial</p>
            <p className="text-sm">
              ¿Eres administrador?{' '}
              <button
                onClick={() => navigate('/admin/seleccionar-empresa')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Accede al panel administrativo
              </button>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
