import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentTenant } from '../services/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const tenant = getCurrentTenant();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          SmartPYME
          {tenant && (
            <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>
              🏢 {tenant.nombre_empresa}
            </span>
          )}
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/productos">Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pedidos">Pedidos</Link>
            </li>
          </ul>
          <div className="d-flex gap-2">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-info"
              title="Ver la tienda como cliente"
            >
              <i className="bi bi-shop me-1"></i>
              Ver Tienda
            </a>
            <Link to="/perfil" className="btn btn-outline-success">
              <i className="bi bi-person-circle me-1"></i>
              Mi Perfil
            </Link>
            <Link to="/cambiar-password" className="btn btn-outline-primary">
              <i className="bi bi-key me-1"></i>
              Cambiar Contraseña
            </Link>
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
