import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  // Definir permisos por rol
  const userRole = user.id_rol;
  const isAdmin = userRole === 1;
  const isEmployee = userRole === 2;

  // Navegación base (disponible para todos)
  const baseNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, roles: [1, 2] },
    { name: 'Productos', href: '/admin/productos', icon: ShoppingBagIcon, roles: [1, 2] },
    { name: 'Categorías', href: '/admin/categorias', icon: TagIcon, roles: [1, 2] },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCartIcon, roles: [1, 2] },
  ];

  // Opciones solo para admin
  const adminOnlyNavigation = [
    { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon, roles: [1] },
    { name: 'Configuración', href: '/admin/settings', icon: Cog6ToothIcon, roles: [1] },
  ];

  // Filtrar navegación según rol
  const navigation = [...baseNavigation, ...(isAdmin ? adminOnlyNavigation : [])];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">{settings.company_name}</h1>
              <p className="text-xs text-gray-500">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nombre} {user.apellido}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                  Administrador
                </span>
              )}
              {isEmployee && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  Empleado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className={`font-medium text-sm ${active ? 'text-white' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Panel de Administración'}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  En línea
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
