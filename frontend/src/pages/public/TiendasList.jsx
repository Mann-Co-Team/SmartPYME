import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const TiendasList = () => {
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
      const response = await api.get('/tenants/public');
      setTiendas(response.data.data);
    } catch (error) {
      console.error('Error cargando tiendas:', error);
      setError('No se pudieron cargar las tiendas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTienda = (slug) => {
    navigate(`/tienda/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <svg className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">SmartPYME</span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Volver al Inicio
            </button>
          </div>
        </div>
      </nav>

      {/* Sección de Selección de Tiendas */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Selecciona dónde deseas comprar
            </h1>
            <p className="text-gray-600 text-xl">
              Explora nuestras {tiendas.length} tienda{tiendas.length !== 1 ? 's' : ''} disponible{tiendas.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <button 
                onClick={loadTiendas}
                className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
              >
                Reintentar
              </button>
            </div>
          ) : tiendas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay tiendas disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tiendas.map((tienda) => (
                <div
                  key={tienda.id_tenant}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 transform hover:scale-105"
                  onClick={() => handleSelectTienda(tienda.slug)}
                >
                  <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    {tienda.logo ? (
                      <img src={tienda.logo} alt={tienda.nombre_empresa} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {tienda.nombre_empresa}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium">{tienda.total_productos || 0} productos disponibles</span>
                      </div>
                      {tienda.email_empresa && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{tienda.email_empresa}</span>
                        </div>
                      )}
                      {tienda.plan && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium capitalize">Plan {tienda.plan}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTienda(tienda.slug);
                      }}
                      className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Ir a la Tienda →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 SmartPYME. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default TiendasList;
