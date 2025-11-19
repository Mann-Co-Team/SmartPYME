import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos } from '../../services/pedidos';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MisPedidos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      toast.error('Debe iniciar sesión para ver sus pedidos');
      navigate('/login');
      return;
    }
    fetchPedidos();
  }, [navigate]);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await getPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarPedido = async (pedidoId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción devolverá el stock automáticamente.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchPedidos(); // Recargar lista
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      toast.error('Error al cancelar el pedido');
    }
  };

  const handleSolicitarCancelacion = async (pedidoId) => {
    const motivo = window.prompt('Por favor, indica el motivo de la cancelación (opcional):');
    
    // Si presiona cancelar, no hacer nada
    if (motivo === null) return;

    try {
      const response = await fetch(`http://localhost:3000/api/pedidos/${pedidoId}/solicitar-cancelacion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo: motivo || 'Sin motivo especificado' })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        fetchPedidos(); // Recargar lista
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error solicitando cancelación:', error);
      toast.error('Error al solicitar cancelación');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmado': 'bg-blue-100 text-blue-800',
      'en_proceso': 'bg-purple-100 text-purple-800',
      'enviado': 'bg-indigo-100 text-indigo-800',
      'entregado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_proceso': 'En Proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="mt-2 text-gray-600">
          Revisa el estado de tus pedidos y su historial
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No tienes pedidos aún
          </h2>
          <p className="text-gray-600 mb-6">
            Cuando realices un pedido, aparecerá aquí
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id_pedido} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header del pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Pedido {pedido.numero_pedido || `#${pedido.id_pedido}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(pedido.fecha_pedido)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(pedido.nombre_estado?.toLowerCase())}`}>
                      {pedido.nombre_estado || 'Desconocido'}
                    </span>
                  </div>
                </div>

                {/* Información del pedido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Método de Entrega</p>
                    <p className="font-medium text-gray-900">
                      {pedido.metodo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en Tienda'}
                    </p>
                  </div>
                  
                  {pedido.direccion_entrega && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Dirección de Entrega</p>
                      <p className="font-medium text-gray-900">{pedido.direccion_entrega}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {pedido.metodo_pago}
                    </p>
                  </div>
                </div>

                {/* Detalle de productos */}
                {pedido.productos && pedido.productos.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                    <div className="space-y-2">
                      {pedido.productos.map((producto, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            {producto.imagen && (
                              <img 
                                src={`http://localhost:3000${producto.imagen}`} 
                                alt={producto.producto}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{producto.producto}</p>
                              <p className="text-sm text-gray-500">Cantidad: {producto.cantidad}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatPrice(producto.subtotal)}</p>
                            <p className="text-xs text-gray-500">{formatPrice(producto.precio_unitario)} c/u</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(pedido.total)}
                  </span>
                </div>

                {/* Notas si existen */}
                {pedido.notas && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Notas:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{pedido.notas}</p>
                  </div>
                )}

                {/* Botones de acción según el estado */}
                <div className="mt-4 flex gap-2">
                  {/* RF-4: Ver detalle del pedido */}
                  <button
                    onClick={() => navigate(`/pedidos/${pedido.id_pedido}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Ver Detalle
                  </button>

                  {/* OPCIÓN 1: Cancelación inmediata si está pendiente */}
                  {pedido.nombre_estado?.toLowerCase() === 'pendiente' && (
                    <button
                      onClick={() => handleCancelarPedido(pedido.id_pedido)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Cancelar Pedido
                    </button>
                  )}

                  {/* OPCIÓN 2: Solicitar cancelación si está confirmado o en proceso */}
                  {['confirmado', 'en proceso'].includes(pedido.nombre_estado?.toLowerCase()) && (
                    <button
                      onClick={() => handleSolicitarCancelacion(pedido.id_pedido)}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Solicitar Cancelación
                    </button>
                  )}

                  {/* Estado: Solicitud pendiente */}
                  {pedido.nombre_estado?.toLowerCase() === 'solicitud_cancelacion' && (
                    <div className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-center font-medium">
                      ⏳ Solicitud de cancelación pendiente
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón para continuar comprando */}
      {pedidos.length > 0 && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Continuar Comprando
          </button>
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
