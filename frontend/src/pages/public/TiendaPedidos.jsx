import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPedidos } from '../../services/pedidos';
import LoadingSpinner from '../../components/LoadingSpinner';
import DarkModeToggle from '../../components/DarkModeToggle';
import api from '../../services/api';

const TiendaPedidos = () => {
  const navigate = useNavigate();
  const { tenant_slug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(true);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await api.get(`/tenants/slug/${tenant_slug}`);
        setTenant(response.data.data);
      } catch (error) {
        console.error('Error cargando tenant:', error);
        toast.error('Tienda no encontrada');
        navigate('/');
      } finally {
        setLoadingTenant(false);
      }
    };

    fetchTenant();
  }, [tenant_slug, navigate]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.id) {
          toast.error('Debe iniciar sesión para ver sus pedidos');
          navigate(`/tienda/${tenant_slug}/login`);
          return;
        }

        const data = await getPedidos();
        setPedidos(data);
      } catch (error) {
        console.error('Error cargando pedidos:', error);
        toast.error('Error al cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };

    if (!loadingTenant && tenant) {
      fetchPedidos();
    }
  }, [tenant_slug, navigate, loadingTenant, tenant]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      confirmado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      en_preparacion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      listo: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      entregado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };

    const labels = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      en_preparacion: 'En Preparación',
      listo: 'Listo',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[estado] || badges.pendiente}`}>
        {labels[estado] || estado}
      </span>
    );
  };

  if (loadingTenant || loading) {
    return <LoadingSpinner />;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(`/tienda/${tenant_slug}`)}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              {tenant.nombre_empresa}
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/tienda/${tenant_slug}`)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Volver a la tienda
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Mis Pedidos en {tenant.nombre_empresa}
        </h1>

        {pedidos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No tienes pedidos realizados en esta tienda
            </p>
            <button
              onClick={() => navigate(`/tienda/${tenant_slug}`)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Ir a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id_pedido}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/tienda/${tenant_slug}/pedidos/${pedido.id_pedido}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pedido #{pedido.numero_pedido}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(pedido.fecha_pedido)}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    {getEstadoBadge(pedido.estado)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(pedido.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Método de Pago</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {pedido.metodo_pago}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Productos</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pedido.items ? pedido.items.length : 0} {pedido.items?.length === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tienda/${tenant_slug}/pedidos/${pedido.id_pedido}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-sm"
                  >
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendaPedidos;
