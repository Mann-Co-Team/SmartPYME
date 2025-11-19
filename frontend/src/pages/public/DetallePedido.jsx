import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const DetallePedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetallePedido();
  }, [id]);

  const fetchDetallePedido = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log(`🔍 Intentando cargar pedido #${id}`);
      console.log(`🔑 Token disponible:`, token ? 'SÍ' : 'NO');
      
      const response = await fetch(`http://localhost:3000/api/pedidos/${id}/detalle`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📡 Response status:`, response.status);
      
      const data = await response.json();
      console.log(`📦 Data recibida:`, data);

      if (data.success) {
        console.log(`✅ Pedido cargado exitosamente`);
        setPedido(data.data);
      } else {
        console.log(`❌ Error del servidor:`, data.message);
        toast.error(data.message || 'Error al cargar el pedido');
        navigate('/pedidos');
      }
    } catch (error) {
      console.error('❌ Error en catch:', error);
      toast.error('Error al cargar el detalle del pedido');
      navigate('/pedidos');
    } finally {
      setLoading(false);
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
      'Pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Confirmado': 'bg-blue-100 text-blue-800 border-blue-300',
      'En Proceso': 'bg-purple-100 text-purple-800 border-purple-300',
      'Listo': 'bg-green-100 text-green-800 border-green-300',
      'Enviado': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Entregado': 'bg-green-200 text-green-900 border-green-400',
      'Completado': 'bg-green-200 text-green-900 border-green-400',
      'Cancelado': 'bg-red-100 text-red-800 border-red-300'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      'Pendiente': '⏳',
      'Confirmado': '✅',
      'En Proceso': '🔄',
      'Listo': '📦',
      'Enviado': '🚚',
      'Entregado': '✅',
      'Completado': '✅',
      'Cancelado': '❌'
    };
    return iconos[estado] || '📋';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Pedido no encontrado</h2>
          <button onClick={() => navigate('/pedidos')} className="btn-primary mt-4">
            Volver a Mis Pedidos
          </button>
        </div>
      </div>
    );
  }

  const pedidoInfo = pedido.pedido || pedido;
  const productos = pedido.productos || [];
  const historial = pedido.historial || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/pedidos')}
          className="text-primary-600 hover:text-primary-700 flex items-center gap-2 mb-4"
        >
          ← Volver a Mis Pedidos
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pedido #{pedidoInfo.id_pedido}
            </h1>
            <p className="text-gray-600 mt-1">
              Realizado el {formatDate(pedidoInfo.fecha_pedido)}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex px-4 py-2 rounded-full text-lg font-medium border-2 ${getEstadoColor(pedidoInfo.estado)}`}>
              {getEstadoIcon(pedidoInfo.estado)} {pedidoInfo.estado}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline de Estados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📋 Historial de Estados
            </h2>
            
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {historial && historial.length > 0 ? (
                  historial.map((evento, index) => (
                    <div key={evento.id_historial || index} className="relative flex items-start gap-4">
                      {/* Punto del timeline */}
                      <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                        index === historial.length - 1 
                          ? getEstadoColor(evento.estado) 
                          : 'bg-gray-200'
                      } border-2`}>
                        {getEstadoIcon(evento.estado)}
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {evento.estado}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatDate(evento.fecha_cambio)}
                          </span>
                        </div>
                        
                        {evento.usuario_nombre && (
                          <p className="text-sm text-gray-600 mt-1">
                            Por: {evento.usuario_nombre} {evento.usuario_apellido}
                          </p>
                        )}
                        
                        {evento.notas && (
                          <p className="text-sm text-gray-700 mt-2 italic">
                            "{evento.notas}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay historial disponible
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Productos del Pedido */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🛍️ Productos
            </h2>
            
            <div className="space-y-4">
              {productos && productos.map((producto, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {producto.imagen_url && (
                    <img 
                      src={`http://localhost:3000${producto.imagen_url}`} 
                      alt={producto.nombre_producto}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{producto.nombre_producto}</h3>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Cantidad: {producto.cantidad} x {formatPrice(producto.precio_unitario)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(producto.subtotal)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(pedidoInfo.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Lateral - Información Adicional */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información de Entrega */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              📦 Información de Entrega
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Método de Pago</p>
                <p className="font-medium text-gray-900 capitalize">
                  {pedidoInfo.metodo_pago || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          {pedidoInfo.nombre_cliente && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                👤 Información del Cliente
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">
                    {pedidoInfo.nombre_cliente} {pedidoInfo.apellido_cliente}
                  </p>
                </div>
                
                {pedidoInfo.email_cliente && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{pedidoInfo.email_cliente}</p>
                  </div>
                )}
                
                {pedidoInfo.telefono_cliente && (
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{pedidoInfo.telefono_cliente}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas del Pedido */}
          {pedidoInfo.notas && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                📝 Notas
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{pedidoInfo.notas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;
