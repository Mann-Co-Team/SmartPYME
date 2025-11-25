import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getPublicProductos } from '../services/public';

const TestCarrito = () => {
  const { items, addItem, removeItem, getTotal, getItemCount, toggleCart } = useCart();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await getPublicProductos('demo');
      setProductos(data.slice(0, 5)); // Solo 5 productos para prueba
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🧪 Prueba del Carrito</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel de productos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="space-y-4">
              {productos.map(p => (
                <div key={p.id_producto} className="border rounded p-4">
                  <h3 className="font-medium">{p.nombre}</h3>
                  <p className="text-gray-600">${p.precio}</p>
                  <button
                    onClick={() => addItem(p)}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Agregar al Carrito
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel del carrito */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Carrito ({getItemCount()} items)
          </h2>
          <div className="border rounded p-4">
            {items.length === 0 ? (
              <p className="text-gray-500">Carrito vacío</p>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id_producto} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity} x ${item.precio}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id_producto)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <div className="border-t pt-4 mt-4">
                  <p className="text-xl font-bold">
                    Total: ${getTotal().toLocaleString('es-CL')}
                  </p>
                </div>
                <button
                  onClick={toggleCart}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Abrir CartSidebar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información de depuración */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">🔍 Debug Info</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ items, total: getTotal(), count: getItemCount() }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestCarrito;
