import React, { useState, useEffect } from 'react';
import { getCategorias } from '../../services/categorias';
import { getProductos } from '../../services/productos';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriasData, productosData] = await Promise.all([
        getCategorias(),
        getProductos()
      ]);
      setCategorias(categoriasData.filter(cat => cat.activo));
      setProductos(productosData.filter(prod => prod.activo));
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? productos.filter(prod => prod.id_categoria === selectedCategory)
    : productos;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a nuestra tienda
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Descubre nuestros productos de calidad y realiza tu pedido de forma fácil y rápida
        </p>
      </div>

      {/* Filtros por categoría */}
      {categorias.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todos
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id_categoria}
                onClick={() => setSelectedCategory(categoria.id_categoria)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === categoria.id_categoria
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((producto) => (
          <div key={producto.id_producto} className="card overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
              <img
                src={producto.imagen ? `http://localhost:5000${producto.imagen}` : '/placeholder-product.jpg'}
                alt={producto.nombre}
                className="h-48 w-full object-cover object-center group-hover:opacity-75"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {producto.nombre}
              </h3>
              {producto.descripcion && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {producto.descripcion}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(producto.precio)}
                </span>
                <button
                  onClick={() => addItem(producto)}
                  disabled={producto.stock <= 0}
                  className={`p-2 rounded-full transition-colors ${
                    producto.stock > 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              {producto.stock <= 0 && (
                <p className="text-sm text-red-600 mt-2">Sin stock</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay productos disponibles en esta categoría
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
