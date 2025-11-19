import React from 'react';
import { 
  ShoppingBagIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const stats = [
    {
      name: 'Total Productos',
      value: '0',
      icon: ShoppingBagIcon,
      change: '+0%',
      changeType: 'increase',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Pedidos',
      value: '0',
      icon: ShoppingCartIcon,
      change: '+0%',
      changeType: 'increase',
      bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      name: 'Ventas Hoy',
      value: '$0',
      icon: CurrencyDollarIcon,
      change: '+0%',
      changeType: 'increase',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      name: 'Clientes',
      value: '0',
      icon: UsersIcon,
      change: '+0%',
      changeType: 'increase',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general del negocio</p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="h-5 w-5 mr-2" />
          Actualizado hace un momento
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {/* Card content */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs ayer</span>
                  </div>
                </div>
                <div className={`${stat.iconBg} p-2 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>

            {/* Decorative gradient bar */}
            <div className={`h-1 ${stat.bgColor}`}></div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pedidos Recientes */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay pedidos recientes</p>
                <p className="text-sm text-gray-400 mt-1">
                  Los pedidos aparecerán aquí cuando se realicen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Productos Destacados</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay productos registrados</p>
                <p className="text-sm text-gray-400 mt-1">
                  Agrega productos para ver estadísticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
        <h3 className="text-lg font-semibold mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 transform hover:scale-105">
            <ShoppingBagIcon className="h-5 w-5 mb-1.5" />
            <p className="font-medium">Agregar Producto</p>
            <p className="text-sm opacity-80 mt-1">Nuevo producto al catálogo</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 text-left transition-all duration-200 transform hover:scale-105">
            <ShoppingCartIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Ver Pedidos</p>
            <p className="text-sm opacity-80 mt-1">Gestionar pedidos activos</p>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-lg p-4 text-left transition-all duration-200 transform hover:scale-105">
            <UsersIcon className="h-6 w-6 mb-2" />
            <p className="font-medium">Ver Clientes</p>
            <p className="text-sm opacity-80 mt-1">Administrar base de clientes</p>
          </button>
        </div>
      </div>
    </div>
  );
}
