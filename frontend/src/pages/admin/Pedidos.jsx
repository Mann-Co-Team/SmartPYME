import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Cargar pedidos
      const resPedidos = await fetch('http://localhost:3000/api/pedidos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!resPedidos.ok) throw new Error('Error al cargar pedidos');
      const dataPedidos = await resPedidos.json();

      // Cargar estados
      const resEstados = await fetch('http://localhost:3000/api/estados', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!resEstados.ok) throw new Error('Error al cargar estados');
      const dataEstados = await resEstados.json();

      setPedidos(dataPedidos);
      setEstados(dataEstados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (idPedido, nuevoEstadoId, notas = '') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/pedidos/${idPedido}/cambiar-estado`, {
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

      // Recargar pedidos
      await cargarDatos();
      alert('Estado actualizado exitosamente');
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

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.id_estado === parseInt(filtroEstado));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filtrar:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input"
          >
            <option value="todos">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado.id_estado} value={estado.id_estado}>
                {estado.nombre_estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">No hay pedidos para mostrar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map(pedido => (
            <div key={pedido.id_pedido} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Información del pedido */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Pedido #{pedido.id_pedido}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cliente:</span> {pedido.nombre_cliente}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {pedido.email_cliente}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {formatDate(pedido.fecha_pedido)}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> <span className="text-lg font-semibold text-gray-900">{formatPrice(pedido.total)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Entrega:</span> {pedido.tipo_entrega === 'delivery' ? '🚚 Delivery' : '🏪 Retiro en local'}
                    </div>
                    {pedido.tipo_entrega === 'delivery' && pedido.direccion_entrega && (
                      <div>
                        <span className="font-medium">Dirección:</span> {pedido.direccion_entrega}
                      </div>
                    )}
                  </div>

                  {pedido.notas && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm">Notas:</span>
                      <p className="text-gray-600 text-sm mt-1">{pedido.notas}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-3 lg:w-64">
                  <button
                    onClick={() => navigate(`/admin/pedidos/${pedido.id_pedido}`)}
                    className="btn-secondary w-full"
                  >
                    📋 Ver Detalle
                  </button>

                  {pedido.estado !== 'Cancelado' && pedido.estado !== 'Completado' && pedido.estado !== 'Entregado' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Cambiar estado:</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && confirm(`¿Cambiar estado a "${estados.find(est => est.id_estado === parseInt(e.target.value))?.nombre_estado}"?`)) {
                            const notas = prompt('Notas del cambio (opcional):');
                            cambiarEstado(pedido.id_pedido, e.target.value, notas);
                          }
                          e.target.value = '';
                        }}
                        className="input w-full"
                        defaultValue=""
                      >
                        <option value="" disabled>Seleccionar nuevo estado...</option>
                        {estados
                          .filter(estado => 
                            estado.id_estado !== pedido.id_estado &&
                            estado.nombre_estado !== 'Cancelado'
                          )
                          .map(estado => (
                            <option key={estado.id_estado} value={estado.id_estado}>
                              {estado.nombre_estado}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
