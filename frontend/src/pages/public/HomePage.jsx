import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategorias } from '../../services/categorias';
import { getProductos } from '../../services/productos';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();
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
    <div>
      {/* Hero Section con imagen de fondo tipo la imagen */}
      <section 
        id="inicio" 
        className="relative bg-cover bg-center min-h-[400px] flex items-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%271200%27 height=%27400%27%3E%3Crect fill=%27%23e5e7eb%27 width=%271200%27 height=%27400%27/%3E%3C/svg%3E')"
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Impulsa tu negocio con SmartPYME
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-3xl mx-auto">
            Sistema de gestión de ventas y pedidos para una productividad óptima
          </p>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/registro')}
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              Registrate Ahora
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/admin/login')}
              className="bg-gray-800 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-900 transition-colors shadow-lg"
            >
              Admin
            </button>
          </div>
        </div>
      </section>

      {/* Sección de Servicios */}
      <section id="servicios" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Nuestros Servicios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Servicio 1 - Carrito */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Gestión de Ventas</h3>
              <p className="text-gray-600 text-sm">
                Optimiza tus procesos de ventas con nuestras herramientas avanzadas.
              </p>
            </div>

            {/* Servicio 2 - Caja */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Gestión de Pedidos</h3>
              <p className="text-gray-600 text-sm">
                Controla y administra tus pedidos de manera eficiente.
              </p>
            </div>

            {/* Servicio 3 - Gráfico */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Análisis de Datos</h3>
              <p className="text-gray-600 text-sm">
                Toma decisiones informadas con nuestros informes detallados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Lo que dicen nuestros clientes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Testimonio 1 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start mb-4">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23cbd5e0'/%3E%3Ctext x='30' y='40' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3EMG%3C/text%3E%3C/svg%3E"
                  alt="María Gómez"
                  className="w-16 h-16 rounded-full"
                />
                <div className="ml-4">
                  <p className="text-gray-800 text-sm leading-relaxed mb-4">
                    "GestiónPYME ha transformado la forma en que manejamos nuestros pedidos. ¡Altamente recomendado!"
                  </p>
                  <p className="text-sm font-semibold text-gray-900">- María Gómez</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-start mb-4">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23cbd5e0'/%3E%3Ctext x='30' y='40' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3EJP%3C/text%3E%3C/svg%3E"
                  alt="Juan Pérez"
                  className="w-16 h-16 rounded-full"
                />
                <div className="ml-4">
                  <p className="text-gray-800 text-sm leading-relaxed mb-4">
                    "La eficiencia y el control que nos ofrece este sistema es incomparable."
                  </p>
                  <p className="text-sm font-semibold text-gray-900">- Juan Pérez</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Productos (opcional - puedes mostrarla u ocultarla) */}
      <section id="productos" className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Productos</h2>

          {/* Filtros por categoría */}
          {categorias.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Todos
                </button>
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id_categoria}
                    onClick={() => setSelectedCategory(categoria.id_categoria)}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      selectedCategory === categoria.id_categoria
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {categoria.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid de productos */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((producto) => (
                <div key={producto.id_producto} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Imagen del producto */}
                  <div className="relative w-full bg-gray-100">
                    <img
                      src={producto.imagen ? `http://localhost:5000${producto.imagen}` : '/placeholder-product.jpg'}
                      alt={producto.nombre}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27%3E%3Crect fill=%27%23e5e7eb%27 width=%27200%27 height=%27200%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23666%27 font-size=%2720%27%3EProducto%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  
                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                      {producto.nombre}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    
                    {/* Precio y botón */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(producto.precio)}
                      </span>
                      <button
                        onClick={() => addItem(producto)}
                        disabled={producto.stock <= 0}
                        className={`p-2 rounded-full transition-colors ${
                          producto.stock > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {producto.stock > 0 && (
                      <p className="text-xs text-gray-500 mt-2">Stock: {producto.stock}</p>
                    )}
                    
                    {producto.stock <= 0 && (
                      <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
