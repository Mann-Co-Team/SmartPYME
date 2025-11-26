import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  ShoppingBagIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  getNotificaciones,
  markAsRead,
  markAllAsRead,
  deleteReadNotifications
} from '../services/notificaciones';

const NotificationPanel = ({ onClose, onUpdateCount }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas'); // todas, pedidos, stock
  const [filtroEstado, setFiltroEstado] = useState('todas'); // todas, leidas, no_leidas
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const data = await getNotificaciones();
      setNotificaciones(data.notificaciones || []);
      setError('');
    } catch (err) {
      setError('Error al cargar notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotificaciones(prev =>
        prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
      );
      if (onUpdateCount) {
        onUpdateCount();
      }
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      if (onUpdateCount) {
        onUpdateCount();
      }
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const handleDeleteRead = async () => {
    const readCount = notificaciones.filter(n => n.leida).length;
    if (!window.confirm(`¿Eliminar ${readCount} notificación(es) leída(s)?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteReadNotifications();
      // Actualizar la lista eliminando las notificaciones leídas
      setNotificaciones(prev => prev.filter(n => !n.leida));
      if (onUpdateCount) {
        onUpdateCount();
      }
    } catch (err) {
      console.error('Error al eliminar notificaciones leídas:', err);
      alert('Error al eliminar notificaciones. Intenta de nuevo.');
    }
  };

  // Filtrar notificaciones según los filtros seleccionados
  const notificacionesFiltradas = notificaciones.filter(notif => {
    // Filtro por tipo
    let pasaTipo = true;
    if (filtroTipo === 'pedidos') {
      pasaTipo = notif.tipo === 'nuevo_pedido' || notif.tipo === 'cambio_estado';
    } else if (filtroTipo === 'stock') {
      pasaTipo = notif.tipo === 'stock_critico' || notif.tipo === 'stock_agotado';
    }

    // Filtro por estado
    let pasaEstado = true;
    if (filtroEstado === 'leidas') {
      pasaEstado = notif.leida === true;
    } else if (filtroEstado === 'no_leidas') {
      pasaEstado = notif.leida === false;
    }

    return pasaTipo && pasaEstado;
  });

  const handleNotificationClick = async (notif) => {
    if (!notif.leida) {
      await handleMarkAsRead(notif.id_notificacion);
    }

    // Navegar según el tipo de referencia al detalle específico
    // Obtener tenant_slug de la URL actual o del localStorage
    const pathParts = window.location.pathname.split('/');
    const tenantSlug = pathParts[1]; // Asumiendo estructura /:tenant_slug/admin/...

    if (notif.tipo_referencia === 'pedido' && notif.id_referencia) {
      // Navegar al detalle del pedido específico
      navigate(`/${tenantSlug}/admin/pedidos/${notif.id_referencia}`);
      onClose();
    } else if (notif.tipo_referencia === 'producto' && notif.id_referencia) {
      // Para productos, navegar a la lista con el producto filtrado o seleccionado
      navigate(`/${tenantSlug}/admin/productos?highlight=${notif.id_referencia}`);
      onClose();
    } else {
      // Si no hay referencia, navegar a la sección general
      onClose();
    }
  };

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'nuevo_pedido':
        return <ShoppingBagIcon className="h-5 w-5 text-blue-500" />;
      case 'cambio_estado':
        return <TruckIcon className="h-5 w-5 text-green-500" />;
      case 'stock_critico':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'stock_agotado':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (fecha) => {
    const now = new Date();
    const created = new Date(fecha);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificaciones ({notificaciones.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-3">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="flex-1 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">📋 Todas</option>
            <option value="pedidos">📦 Pedidos</option>
            <option value="stock">⚠️ Inventario</option>
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="flex-1 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todas</option>
            <option value="no_leidas">🔵 No leídas</option>
            <option value="leidas">✅ Leídas</option>
          </select>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {notificaciones.some(n => n.leida) && (
            <button
              onClick={handleDeleteRead}
              className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              title="Eliminar todas las notificaciones leídas"
            >
              Limpiar leídas ({notificaciones.filter(n => n.leida).length})
            </button>
          )}
          {notificaciones.some(n => !n.leida) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Marcar todas leídas
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && notificaciones.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <BellIcon className="h-12 w-12 mb-2 opacity-50" />
            <p>No tienes notificaciones</p>
          </div>
        )}

        {!loading && !error && notificaciones.length > 0 && notificacionesFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <BellIcon className="h-12 w-12 mb-2 opacity-50" />
            <p>No hay notificaciones con estos filtros</p>
          </div>
        )}

        {!loading && !error && notificacionesFiltradas.length > 0 && (
          <div className="divide-y dark:divide-gray-700">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id_notificacion}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 cursor-pointer transition-colors ${notif.leida
                    ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                    : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(notif.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${notif.leida
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-900 dark:text-white font-semibold'
                      }`}>
                      {notif.titulo}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {notif.mensaje}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {getTimeAgo(notif.created_at)}
                    </p>
                  </div>
                  {!notif.leida && (
                    <div className="flex-shrink-0">
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
