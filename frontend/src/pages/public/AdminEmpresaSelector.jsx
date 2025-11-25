import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { BuildingStorefrontIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AdminEmpresaSelector() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/tenants/public');
      setEmpresas(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmpresa = (slug) => {
    navigate(`/${slug}/admin/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver al inicio
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <BuildingStorefrontIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona tu empresa para acceder
          </p>
        </div>

        {/* Empresas Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : empresas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay empresas registradas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {empresas.map((empresa) => (
              <button
                key={empresa.id_tenant}
                onClick={() => handleSelectEmpresa(empresa.slug)}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-left transform hover:scale-105"
              >
                {/* Logo o ícono */}
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-4">
                  {empresa.logo ? (
                    <img 
                      src={empresa.logo} 
                      alt={empresa.nombre_empresa} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <BuildingStorefrontIcon className="h-8 w-8 text-white" />
                  )}
                </div>

                {/* Información */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {empresa.nombre_empresa}
                </h3>

                {/* Plan badge */}
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    empresa.plan === 'empresarial' 
                      ? 'bg-purple-100 text-purple-800' 
                      : empresa.plan === 'profesional'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    Plan {empresa.plan.charAt(0).toUpperCase() + empresa.plan.slice(1)}
                  </span>
                </div>

                {/* Email */}
                {empresa.email_empresa && (
                  <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {empresa.email_empresa}
                  </p>
                )}

                {/* Botón de acción */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-blue-600">
                    Acceder al panel →
                  </span>
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            ¿No encuentras tu empresa? Contacta al administrador del sistema
          </p>
        </div>
      </div>
    </div>
  );
}
