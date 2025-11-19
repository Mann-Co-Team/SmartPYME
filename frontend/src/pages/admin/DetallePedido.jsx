import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminDetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Cargar detalle del pedido
      const resPedido = await fetch(`http://localhost:3000/api/pedidos/${id}/detalle`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resPedido.ok) {
        throw new Error('Error al cargar el pedido');
      }

      const data = await resPedido.json();
      setPedido(data);

      // Cargar estados
      const resEstados = await fetch('http://localhost:3000/api/estados', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (resEstados.ok) {
        const dataEstados = await resEstados.json();
        setEstados(dataEstados);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstadoId) => {
    const estadoNombre = estados.find(e => e.id_estado === parseInt(nuevoEstadoId))?.nombre_estado;
    
    if (!confirm(`¿Cambiar estado del pedido a "${estadoNombre}"?`)) {
      return;
    }

    const notas = prompt('Notas del cambio (opcional):');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}/cambiar-estado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_estado: parseInt(nuevoEstadoId),
          notas: notas || undefined
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cambiar estado');
      }

      alert('Estado actualizado exitosamente');
      await cargarDatos(); // Recargar datos
    } catch (err) {
      alert('Error al cambiar estado: ' + err.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL', {
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
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando detalle del pedido...</div>
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="btn-secondary"
        >
          ← Volver a Pedidos
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error || 'Pedido no encontrado'}</p>
        </div>
      </div>
    );
  }

  const pedidoData = pedido.pedido;
  const productos = pedido.productos || [];
  const historial = pedido.historial || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/pedidos')}
            className="btn-secondary mb-3"
          >
            ← Volver a Pedidos
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{pedidoData.id_pedido}
          </h1>
          <p className="text-gray-600 mt-1">{formatDate(pedidoData.fecha_pedido)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-full text-lg font-medium border ${getEstadoColor(pedidoData.estado)}`}>
            {getEstadoIcon(pedidoData.estado)} {pedidoData.estado}
          </span>
        </div>
      </div>

      {/* Cambiar Estado */}
      {pedidoData.estado !== 'Cancelado' && pedidoData.estado !== 'Completado' && pedidoData.estado !== 'Entregado' && (
        <div className="card p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">⚙️ Cambiar Estado del Pedido</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  cambiarEstado(e.target.value);
                  e.target.value = '';
                }
              }}
              className="input flex-1"
              defaultValue=""
            >
              <option value="" disabled>Seleccionar nuevo estado...</option>
              {estados
                .filter(estado => 
                  estado.id_estado !== pedidoData.id_estado &&
                  estado.nombre_estado !== 'Cancelado'
                )
                .map(estado => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {getEstadoIcon(estado.nombre_estado)} {estado.nombre_estado}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline de Estados */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Historial de Estados</h2>
            <div className="space-y-4">
              {historial.length > 0 ? (
                historial.map((item, index) => {
                  const isEstadoActual = item.estado === pedidoData.estado;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isEstadoActual ? getEstadoColor(item.estado).replace('100', '200') : 'bg-gray-200 text-gray-600'
                        }`}>
                          {getEstadoIcon(item.estado)}
                        </div>
                        {index < historial.length - 1 && (
                          <div className={`w-0.5 h-full min-h-[2rem] ${
                            isEstadoActual ? 'bg-blue-300' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-semibold ${isEstadoActual ? 'text-gray-900' : 'text-gray-600'}`}>
                            {item.estado}
                          </span>
                          {isEstadoActual && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Estado Actual
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(item.fecha_cambio)}</p>
                        {item.usuario && (
                          <p className="text-sm text-gray-500 mt-1">
                            Por: {item.usuario}
                          </p>
                        )}
                        {item.notas && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            {item.notas}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No hay historial disponible</p>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🛒 Productos del Pedido</h2>
            <div className="space-y-4">
              {productos.map((producto, index) => (
                <div key={index} className="flex gap-4 border-b border-gray-200 pb-4 last:border-0">
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
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        Cantidad: <span className="font-medium text-gray-900">{producto.cantidad}</span>
                      </span>
                      <span className="text-gray-600">
                        Precio: <span className="font-medium text-gray-900">{formatPrice(producto.precio_unitario)}</span>
                      </span>
                      <span className="text-gray-900 font-semibold">
                        Subtotal: {formatPrice(producto.cantidad * producto.precio_unitario)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(pedidoData.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Información de Entrega */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚚 Información de Entrega</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Método de Entrega:</span>
                <p className="text-gray-900 mt-1">
                  {pedidoData.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en local'}
                </p>
              </div>
              
              {pedidoData.tipo_entrega === 'delivery' && pedidoData.direccion_entrega && (
                <div>
                  <span className="font-medium text-gray-700">Dirección:</span>
                  <p className="text-gray-900 mt-1">{pedidoData.direccion_entrega}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Método de Pago:</span>
                <p className="text-gray-900 mt-1 capitalize">{pedidoData.metodo_pago}</p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Información del Cliente</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nombre:</span>
                <p className="text-gray-900 mt-1">{pedidoData.nombre_cliente}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900 mt-1">{pedidoData.email_cliente}</p>
              </div>
              {pedidoData.telefono_cliente && (
                <div>
                  <span className="font-medium text-gray-700">Teléfono:</span>
                  <p className="text-gray-900 mt-1">{pedidoData.telefono_cliente}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notas del Pedido */}
          {pedidoData.notas && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Notas del Pedido</h2>
              <p className="text-gray-700 text-sm">{pedidoData.notas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
