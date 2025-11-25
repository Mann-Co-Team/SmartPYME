import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import DarkModeToggle from '../../components/DarkModeToggle';

const TiendaDetallePedido = () => {
  const navigate = useNavigate();
  const { tenant_slug, id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [cancelando, setCancelando] = useState(false);

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
    const fetchPedido = async () => {
      try {
        const response = await api.get(`/pedidos/${id}`);
        setPedido(response.data.data);
      } catch (error) {
        console.error('Error cargando pedido:', error);
        toast.error('Error al cargar el detalle del pedido');
        navigate(`/tienda/${tenant_slug}/pedidos`);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingTenant && tenant) {
      fetchPedido();
    }
  }, [id, tenant_slug, navigate, loadingTenant, tenant]);

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

  const handleCancelarPedido = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      return;
    }

    setCancelando(true);
    try {
      await api.post(`/pedidos/${id}/cancelar`);
      toast.success('Pedido cancelado exitosamente');
      // Recargar pedido
      const response = await api.get(`/pedidos/${id}`);
      setPedido(response.data.data);
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      toast.error(error.response?.data?.message || 'Error al cancelar el pedido');
    } finally {
      setCancelando(false);
    }
  };

  if (loadingTenant || loading) {
    return <LoadingSpinner />;
  }

  if (!tenant || !pedido) {
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
                onClick={() => navigate(`/tienda/${tenant_slug}/pedidos`)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Volver a mis pedidos
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado del pedido */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Pedido #{pedido.numero_pedido}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Realizado el {formatDate(pedido.fecha_pedido)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              {getEstadoBadge(pedido.estado)}
              {pedido.estado?.toLowerCase() === 'pendiente' && (
                <button
                  onClick={handleCancelarPedido}
                  disabled={cancelando}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {cancelando ? 'Cancelando...' : 'Cancelar Pedido'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Información de Entrega
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pedido.metodo_entrega === 'pickup' ? (
                  <span>🏪 Retiro en tienda</span>
                ) : (
                  <span>🚚 Delivery</span>
                )}
              </p>
              {pedido.direccion_entrega && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {pedido.direccion_entrega}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Método de Pago
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {pedido.metodo_pago}
              </p>
            </div>
          </div>

          {pedido.notas && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notas del pedido
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pedido.notas}
              </p>
            </div>
          )}
        </div>

        {/* Detalle de productos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Productos del Pedido
          </h2>

          <div className="space-y-4">
            {pedido.items && pedido.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {item.imagen && (
                  <img
                    src={item.imagen}
                    alt={item.nombre_producto}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.nombre_producto}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cantidad: {item.cantidad}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Precio unitario: {formatPrice(item.precio_unitario)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(pedido.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {pedido.cliente_nombre && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Información del Cliente
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Nombre:</span> {pedido.cliente_nombre} {pedido.cliente_apellido}
              </p>
              {pedido.cliente_email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Email:</span> {pedido.cliente_email}
                </p>
              )}
              {pedido.cliente_telefono && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Teléfono:</span> {pedido.cliente_telefono}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TiendaDetallePedido;
