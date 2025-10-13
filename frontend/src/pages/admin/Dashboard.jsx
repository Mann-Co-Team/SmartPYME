import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900">Productos</h3>
          <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900">Ventas Hoy</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">$0</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900">Clientes</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recientes</h3>
          <p className="text-gray-500">No hay pedidos recientes</p>
        </div>
      </div>
    </div>
  );
}
