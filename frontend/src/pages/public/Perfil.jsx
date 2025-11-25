import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        toast.error('No hay sesión activa');
        return;
      }

      setUsuario(user);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar información del perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          No se pudo cargar la información del perfil
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Mi Perfil
              </h4>
            </div>
            <div className="card-body p-4">
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle" 
                     style={{ width: '100px', height: '100px', fontSize: '3rem' }}>
                  <i className="bi bi-person-fill"></i>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Nombre</label>
                  <div className="form-control-plaintext border rounded p-2 bg-light">
                    {usuario.nombre || 'No especificado'}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Apellido</label>
                  <div className="form-control-plaintext border rounded p-2 bg-light">
                    {usuario.apellido || 'No especificado'}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-bold">Email</label>
                  <div className="form-control-plaintext border rounded p-2 bg-light">
                    <i className="bi bi-envelope me-2"></i>
                    {usuario.email}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">Rol</label>
                  <div className="form-control-plaintext border rounded p-2 bg-light">
                    <span className="badge bg-info">
                      {usuario.rol === 1 ? 'Administrador' : usuario.rol === 2 ? 'Empleado' : 'Cliente'}
                    </span>
                  </div>
                </div>

                {usuario.telefono && (
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Teléfono</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      <i className="bi bi-telephone me-2"></i>
                      {usuario.telefono}
                    </div>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="mt-4 pt-3 border-top">
                <h5 className="mb-3">
                  <i className="bi bi-gear me-2"></i>
                  Configuración de Cuenta
                </h5>
                
                <div className="d-grid gap-2">
                  <Link to="/cambiar-password" className="btn btn-outline-primary">
                    <i className="bi bi-key me-2"></i>
                    Cambiar Contraseña
                  </Link>
                  
                  <button className="btn btn-outline-secondary" disabled>
                    <i className="bi bi-pencil me-2"></i>
                    Editar Información (Próximamente)
                  </button>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-4 pt-3 border-top">
                <h5 className="mb-3">
                  <i className="bi bi-info-circle me-2"></i>
                  Acciones Rápidas
                </h5>
                
                <div className="d-grid gap-2">
                  <Link to="/pedidos" className="btn btn-outline-success">
                    <i className="bi bi-box-seam me-2"></i>
                    Ver Mis Pedidos
                  </Link>
                  
                  <Link to="/" className="btn btn-outline-info">
                    <i className="bi bi-shop me-2"></i>
                    Ir a la Tienda
                  </Link>
                </div>
              </div>
            </div>

            <div className="card-footer text-muted text-center">
              <small>
                <i className="bi bi-shield-check me-1"></i>
                Tu información está segura con nosotros
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
