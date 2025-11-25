import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  UsersIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import NotificationPanel from '../NotificationPanel';
import DarkModeToggle from '../DarkModeToggle';
import { getUnreadCount } from '../../services/notificaciones';

export default function AdminLayout() {
  const { tenant_slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, darkMode } = useTheme();
  
  // Cargar datos directamente del localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tenant = JSON.parse(localStorage.getItem('tenant') || '{}');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Verificar que el tenant de la URL coincida con el logueado
  useEffect(() => {
    const currentTenant = localStorage.getItem('current_tenant');
    if (tenant_slug && currentTenant && currentTenant !== tenant_slug) {
      // Está intentando acceder a otra empresa, redirigir
      navigate(`/${tenant_slug}/admin/login`);
    }
  }, [tenant_slug, navigate]);

  const handleLogout = () => {
    // Limpiar todo el localStorage
    localStorage.clear();
    navigate(`/${tenant_slug}/admin/login`);
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Polling para actualizar contador cada 30 segundos
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar panel al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Definir permisos por rol
  const userRole = user.id_rol;
  const isAdmin = userRole === 1;
  const isEmployee = userRole === 2;

  // Navegación base (disponible para todos)
  const baseNavigation = [
    { name: 'Dashboard', href: `/${tenant_slug}/admin/dashboard`, icon: HomeIcon, roles: [1, 2] },
    { name: 'Productos', href: `/${tenant_slug}/admin/productos`, icon: ShoppingBagIcon, roles: [1, 2] },
    { name: 'Categorías', href: `/${tenant_slug}/admin/categorias`, icon: TagIcon, roles: [1, 2] },
    { name: 'Pedidos', href: `/${tenant_slug}/admin/pedidos`, icon: ShoppingCartIcon, roles: [1, 2] },
  ];

  // Opciones solo para admin
  const adminOnlyNavigation = [
    { name: 'Reportes', href: `/${tenant_slug}/admin/reportes`, icon: ChartBarIcon, roles: [1] },
    { name: 'Usuarios', href: `/${tenant_slug}/admin/usuarios`, icon: UsersIcon, roles: [1] },
    { name: 'Configuración', href: `/${tenant_slug}/admin/settings`, icon: Cog6ToothIcon, roles: [1] },
  ];

  // Filtrar navegación según rol
  const navigation = [...baseNavigation, ...(isAdmin ? adminOnlyNavigation : [])];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col shadow-lg`}>
        {/* Logo/Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{(tenant.nombre_empresa || 'S').charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tenant.nombre_empresa || settings.company_name}</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Panel Admin</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                {user.nombre} {user.apellido}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{user.email}</p>
              {isAdmin && (
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'} rounded`}>
                  Administrador
                </span>
              )}
              {isEmployee && (
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'} rounded`}>
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
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-white' : darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className={`font-medium text-sm ${active ? 'text-white' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
          <Link
            to={`/${tenant_slug}/admin/cambiar-password`}
            className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              darkMode 
                ? 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <svg className={`h-5 w-5 ${darkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
            <span className="font-medium text-sm">Cambiar Contraseña</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              darkMode
                ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400'
                : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <ArrowLeftOnRectangleIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-600'}`} />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>

        {/* Footer - Powered by */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Powered by <span className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>SmartPYME</span>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {navigation.find(item => isActive(item.href))?.name || 'Panel de Administración'}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <DarkModeToggle />
                
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <NotificationPanel
                      onClose={() => setShowNotifications(false)}
                      onUpdateCount={fetchUnreadCount}
                    />
                  )}
                </div>

                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                }`}>
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  En línea
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
