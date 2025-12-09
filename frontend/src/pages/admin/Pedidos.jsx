import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPriceWithConversion } from '../../utils/currencyConverter';

// RF-7: Transiciones válidas de estados (deben coincidir con el backend)
const TRANSICIONES_VALIDAS = {
  1: [2, 4, 7],     // Pendiente -> Confirmado, Listo, Cancelado
  2: [3, 7],        // Confirmado -> En Proceso, Cancelado
  3: [4, 7],        // En Proceso -> Listo, Cancelado
  4: [6],           // Listo -> Completado
  5: [6],           // Enviado -> Completado (no usado en flujo normal)
  6: [],            // Completado -> ninguno (estado final)
  7: []             // Cancelado -> ninguno (estado final)
};

// Pedidos activos: estados 1-5 (Pendiente, Confirmado, En Proceso, Listo, Enviado)
const ESTADOS_ACTIVOS = [1, 2, 3, 4, 5];

export default function AdminPedidos() {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenant_slug } = useParams();
  const [userCurrency, setUserCurrency] = useState(localStorage.getItem('currency') || 'CLP');

  useEffect(() => {
    cargarDatos();

    // Escuchar cambios de moneda
    const handleCurrencyChange = () => {
      const newCurrency = localStorage.getItem('currency') || 'CLP';
      setUserCurrency(newCurrency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  useEffect(() => {
    // Leer parámetro filter de la URL
    const filterParam = searchParams.get('filter');
    if (filterParam === 'activos') {
      setFiltroEstado('activos');
    } else if (filterParam && !isNaN(filterParam)) {
      setFiltroEstado(filterParam);
    }
  }, [searchParams]);

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

      // Definir estados localmente (deben coincidir con la BD)
      const estadosDefinidos = [
        { id_estado: 1, nombre_estado: 'Pendiente' },
        { id_estado: 2, nombre_estado: 'Confirmado' },
        { id_estado: 3, nombre_estado: 'En Proceso' },
        { id_estado: 4, nombre_estado: 'Listo' },
        { id_estado: 5, nombre_estado: 'Enviado' },
        { id_estado: 6, nombre_estado: 'Completado' },
        { id_estado: 7, nombre_estado: 'Cancelado' }
      ];

      const pedidosData = dataPedidos.data || dataPedidos;

      // Mapear nombre_estado a id_estado si no viene en la respuesta
      const pedidosConId = pedidosData.map(pedido => {
        if (!pedido.id_estado && pedido.nombre_estado) {
          const estado = estadosDefinidos.find(e => e.nombre_estado === pedido.nombre_estado);
          return { ...pedido, id_estado: estado?.id_estado };
        }
        return pedido;
      });

      console.log('Pedidos cargados:', pedidosConId.length);
      console.log('Primer pedido:', pedidosConId[0]);
      console.log('id_estado del primer pedido:', pedidosConId[0]?.id_estado);

      setPedidos(pedidosConId);
      setEstados(estadosDefinidos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // RF-7: Obtener transiciones válidas para un pedido
  const getTransicionesValidas = (estadoActualId) => {
    return TRANSICIONES_VALIDAS[estadoActualId] || [];
  };

  // RF-7: Abrir modal para cambiar estado
  const abrirModalCambioEstado = (pedido) => {
    setPedidoSeleccionado(pedido);
    setNuevoEstado('');
    setObservaciones('');
    setShowModal(true);
  };

  // RF-7: Cambiar estado con validación de transiciones
  const cambiarEstado = async () => {
    if (!nuevoEstado) {
      alert('Debe seleccionar un estado');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/pedidos/${pedidoSeleccionado.id_pedido}/cambiar-estado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_estado: parseInt(nuevoEstado),
          notas: observaciones || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      alert('Estado actualizado exitosamente');
      setShowModal(false);
      await cargarDatos();
    } catch (err) {
      alert('Error: ' + err.message);
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
    : filtroEstado === 'activos'
      ? pedidos.filter(p => ESTADOS_ACTIVOS.includes(p.id_estado))
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.orders.title')}</h1>
          {filtroEstado === 'activos' && (
            <p className="text-sm text-gray-600 mt-1">
              📦 Mostrando solo pedidos activos (Pendiente a Enviado)
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filtrar:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="input"
          >
            <option value="todos">📋 Todos los estados</option>
            <option value="activos">🔄 Pedidos activos (Pendiente-Enviado)</option>
            <optgroup label="Por estado específico:">
              {estados.map(estado => (
                <option key={estado.id_estado} value={estado.id_estado}>
                  {estado.nombre_estado}
                </option>
              ))}
            </optgroup>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoColor(pedido.nombre_estado)}`}>
                      {pedido.nombre_estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cliente:</span> {pedido.cliente}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {pedido.email_cliente || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {formatDate(pedido.fecha_pedido)}
                    </div>
                    <div>
                      <span className="font-medium">{t('admin.orders.total')}:</span> <span className="text-lg font-semibold text-gray-900">{formatPriceWithConversion(pedido.total, userCurrency)}</span>
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
                    onClick={() => navigate(`/${tenant_slug}/admin/pedidos/${pedido.id_pedido}`)}
                    className="btn-secondary w-full"
                  >
                    📋 Ver Detalle
                  </button>

                  {/* RF-7: Botón para cambiar estado (solo si hay transiciones válidas) */}
                  {(() => {
                    const transiciones = getTransicionesValidas(pedido.id_estado);
                    console.log(`Pedido #${pedido.id_pedido}: estado=${pedido.id_estado}, transiciones disponibles:`, transiciones);
                    return transiciones.length > 0 && (
                      <button
                        onClick={() => abrirModalCambioEstado(pedido)}
                        className="btn-primary w-full"
                      >
                        🔄 Cambiar Estado
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RF-7: Modal para cambiar estado con observaciones */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Cambiar Estado - Pedido #{pedidoSeleccionado.id_pedido}
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Estado actual: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedidoSeleccionado.nombre_estado)}`}>
                  {pedidoSeleccionado.nombre_estado}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Estado *
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="input w-full"
                  required
                >
                  <option value="">Seleccionar estado...</option>
                  {estados
                    .filter(estado => getTransicionesValidas(pedidoSeleccionado.id_estado).includes(estado.id_estado))
                    .map(estado => (
                      <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.nombre_estado}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Solo se muestran estados válidos según el flujo de pedidos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="input w-full"
                  rows="3"
                  placeholder="Agregar notas sobre este cambio de estado..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarEstado}
                className="btn-primary flex-1"
                disabled={!nuevoEstado}
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
