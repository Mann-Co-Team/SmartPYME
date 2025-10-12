import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">SmartPYME</Link>
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
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
