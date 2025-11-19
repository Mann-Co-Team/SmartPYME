import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPedidos, cancelarPedido } from '../services/pedidos';
import toast from 'react-hot-toast';

export default function Pedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await getPedidos();
      setPedidos(data);
    } catch (err) {
      console.error('Error al cargar pedidos', err);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (idPedido) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setCancelando(idPedido);
      const response = await cancelarPedido(idPedido);
      
      if (response.success) {
        toast.success(response.message || 'Pedido cancelado exitosamente');
        fetchPedidos(); // Recargar la lista
      } else {
        toast.error(response.message || 'Error al cancelar el pedido');
      }
    } catch (err) {
      console.error('Error al cancelar pedido:', err);
      const mensaje = err.response?.data?.message || 'Error al cancelar el pedido';
      toast.error(mensaje);
    } finally {
      setCancelando(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const getEstadoBadgeClass = (estado) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'pendiente') return 'bg-warning text-dark';
    if (estadoLower === 'confirmado') return 'bg-info text-white';
    if (estadoLower === 'en proceso') return 'bg-primary';
    if (estadoLower === 'listo') return 'bg-success';
    if (estadoLower === 'completado') return 'bg-secondary';
    if (estadoLower === 'cancelado') return 'bg-danger';
    return 'bg-secondary';
  };

  const puedeCancelar = (pedido) => {
    // Solo se puede cancelar si está en estado "Pendiente"
    return pedido.nombre_estado?.toLowerCase() === 'pendiente';
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Mis Pedidos</h1>
      
      {pedidos.length === 0 ? (
        <div className="alert alert-info">
          No tienes pedidos registrados.
        </div>
      ) : (
        <div className="row">
          {pedidos.map((p) => (
            <div key={p.id_pedido} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Pedido #{p.id_pedido}</h5>
                  
                  <div className="mb-2">
                    <span className={`badge ${getEstadoBadgeClass(p.nombre_estado)}`}>
                      {p.nombre_estado}
                    </span>
                  </div>
                  
                  {p.cliente && (
                    <p className="card-text mb-1">
                      <strong>Cliente:</strong> {p.cliente}
                    </p>
                  )}
                  
                  <p className="card-text mb-1">
                    <strong>Total:</strong> {formatPrice(p.total)}
                  </p>
                  
                  {p.created_at && (
                    <p className="card-text text-muted small">
                      Creado: {new Date(p.created_at).toLocaleDateString('es-CL')}
                    </p>
                  )}
                  
                  <div className="mt-3 d-grid gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/pedidos/${p.id_pedido}`)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Ver Detalle
                    </button>
                    
                    {puedeCancelar(p) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelar(p.id_pedido)}
                        disabled={cancelando === p.id_pedido}
                      >
                        {cancelando === p.id_pedido ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-x-circle me-1"></i>
                            Cancelar Pedido
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
