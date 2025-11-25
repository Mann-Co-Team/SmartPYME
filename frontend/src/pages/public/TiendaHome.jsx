import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicCategorias, getPublicProductos } from '../../services/public';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import TiendaHomeBasico from './TiendaHomeBasico';
import TiendaHomeProfesional from './TiendaHomeProfesional';
import TiendaHomeEmpresarial from './TiendaHomeEmpresarial';

const TiendaHome = () => {
  const { tenant_slug } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    loadTenantData();
  }, [tenant_slug]);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener información del tenant
      const tenantResponse = await api.get(`/tenants/slug/${tenant_slug}`);
      const tenantData = tenantResponse.data.data;
      
      if (!tenantData || !tenantData.activo) {
        setError('Esta tienda no está disponible');
        return;
      }

      setTenant(tenantData);

      // Cargar categorías y productos del tenant usando las rutas públicas del catálogo
      const [categoriasData, productosData] = await Promise.all([
        getPublicCategorias(tenant_slug),
        getPublicProductos(tenant_slug)
      ]);

      // Los datos ya vienen filtrados por tenant desde el backend
      setCategorias(categoriasData);
      setProductos(productosData);

    } catch (err) {
      console.error('Error cargando tienda:', err);
      setError('No se pudo cargar la tienda. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Renderizar la página correspondiente según el plan del tenant
  if (tenant) {
    const planLower = tenant.plan?.toLowerCase();
    
    // Debug: ver qué plan se está detectando
    console.log('🏢 Tienda:', tenant.nombre_empresa);
    console.log('📋 Plan detectado:', planLower);
    console.log('📦 Tenant completo:', tenant);
    
    if (planLower === 'basico') {
      return <TiendaHomeBasico tenant={tenant} categorias={categorias} productos={productos} />;
    } else if (planLower === 'profesional') {
      return <TiendaHomeProfesional tenant={tenant} categorias={categorias} productos={productos} />;
    } else if (planLower === 'empresarial') {
      return <TiendaHomeEmpresarial tenant={tenant} categorias={categorias} productos={productos} />;
    }
  }

  // Fallback: si no hay plan específico, mostrar página básica
  return tenant ? (
    <TiendaHomeBasico tenant={tenant} categorias={categorias} productos={productos} />
  ) : null;
};

export default TiendaHome;
