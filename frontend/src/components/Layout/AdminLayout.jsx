import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { settings } = useTheme();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 text-xl font-semibold">
          {settings.company_name}
        </div>
        <nav className="px-4">
          <ul className="space-y-2">
            <li>
              <Link to="/admin/dashboard" className="block px-2 py-1 rounded hover:bg-gray-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/productos" className="block px-2 py-1 rounded hover:bg-gray-200">
                Productos
              </Link>
            </li>
            <li>
              <Link to="/admin/categorias" className="block px-2 py-1 rounded hover:bg-gray-200">
                Categorías
              </Link>
            </li>
            <li>
              <Link to="/admin/pedidos" className="block px-2 py-1 rounded hover:bg-gray-200">
                Pedidos
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="block px-2 py-1 rounded hover:bg-gray-200">
                Ajustes
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-2 py-1 rounded hover:bg-gray-200"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4">
          <h2 className="text-2xl font-semibold">Panel de Administración</h2>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
);
}
