import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sinDatos, setSinDatos] = useState(false);

  useEffect(() => {
    cargarMetricas();
  }, []);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:3000/api/dashboard/metricas', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Error al cargar métricas');
      }

      const response = await res.json();
      setMetricas(response.data);
      setSinDatos(response.sinDatos || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (sinDatos) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-yellow-800">Sin información disponible</p>
          <p className="text-gray-600 mt-2">No hay datos suficientes para mostrar el dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <button onClick={cargarMetricas} className="btn-secondary">
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatPrice(metricas.ventas.hoy)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {formatPrice(metricas.ventas.mes)}
              </p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Ventas del Año</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {formatPrice(metricas.ventas.anio)}
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pedidos Activos</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">
                {metricas.estadisticas.pedidos_activos}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
      </div>

      {/* Grid con 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Pedidos por Estado</h2>
          <div className="space-y-3">
            {metricas.pedidosPorEstado.map((estado) => (
              <div key={estado.id_estado} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    estado.id_estado === 1 ? 'bg-yellow-400' :
                    estado.id_estado === 2 ? 'bg-blue-400' :
                    estado.id_estado === 3 ? 'bg-purple-400' :
                    estado.id_estado === 4 ? 'bg-green-400' :
                    estado.id_estado === 5 ? 'bg-indigo-400' :
                    estado.id_estado === 6 ? 'bg-green-600' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-gray-700">{estado.nombre_estado}</span>
                </div>
                <span className="font-semibold text-gray-900">{estado.cantidad}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Productos Más Vendidos</h2>
          <div className="space-y-3">
            {metricas.productosTop.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay ventas registradas</p>
            ) : (
              metricas.productosTop.map((producto, index) => (
                <div key={producto.id_producto} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary-500 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.nombre_categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{producto.total_vendido} uds</p>
                    <p className="text-sm text-gray-500">{formatPrice(producto.ingresos_totales)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm text-gray-600">Pedidos Completados</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {metricas.estadisticas.pedidos_completados}
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl mb-2">🛍️</div>
          <p className="text-sm text-gray-600">Productos Activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {metricas.estadisticas.productos_activos}
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-sm text-gray-600">Clientes Activos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {metricas.estadisticas.clientes_activos}
          </p>
        </div>
      </div>

      {/* Categorías */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📂 Resumen por Categorías</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Productos</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unidades Vendidas</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos Totales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metricas.categorias.map((cat) => (
                <tr key={cat.id_categoria} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.nombre_categoria}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{cat.total_productos}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">{cat.unidades_vendidas}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                    {formatPrice(cat.ingresos_totales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
