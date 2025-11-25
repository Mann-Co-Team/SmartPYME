import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import DarkModeToggle from '../../components/DarkModeToggle';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShoppingCartIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import CartSidebar from '../../components/Cart/CartSidebar';
import { isAuthenticated, getCurrentUser, logout } from '../../services/auth';

const TiendaHomeBasico = ({ tenant, categorias, productos }) => {
  const navigate = useNavigate();
  const { addItem, toggleCart, getItemCount } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Carrusel automático
  const slides = [
    {
      title: 'Productos Artesanales Frescos',
      subtitle: 'Pan recién horneado, pasteles y dulces hechos con amor cada día',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200'
    },
    {
      title: 'Delicias de Pastelería',
      subtitle: 'Tartas, brownies y postres irresistibles para endulzar tu día',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200'
    },
    {
      title: 'Café y Dulces Especiales',
      subtitle: 'Acompaña tu día con nuestro café premium y deliciosas galletas',
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200'
    }
  ];

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout(tenant.slug);
    setAuthenticated(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    navigate(`/tienda/${tenant.slug}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const handleAddToCart = (producto) => {
    addItem(producto);
  };

  // Filtrar productos
  const filteredProducts = productos.filter(prod => 
    !selectedCategory || prod.id_categoria === selectedCategory
  );

  // Productos destacados para el carrusel de promo
  const promoProducts = productos.slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Navbar Simple */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Nombre del sitio"
                className="text-lg font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none"
                value={tenant?.nombre_empresa || ''}
                readOnly
              />
              <span className="ml-3 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full border border-gray-300 dark:border-gray-600">
                Plan Básico
              </span>
              <button className="ml-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#inicio" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Inicio</a>
              <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contacto</a>
              <a href="#quienes-somos" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Quienes somos</a>
              <button 
                onClick={toggleCart}
                className="relative text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </button>
              <DarkModeToggle />
              {authenticated && currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    <span className="font-medium">{currentUser.nombre}</span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate(`/tienda/${tenant.slug}/perfil`);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        👤 Mi Perfil
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate(`/tienda/${tenant.slug}/pedidos`);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        📦 Mis Pedidos
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => navigate(`/tienda/${tenant.slug}/login`)}
                  className="bg-black dark:bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                >
                  Registro / Iniciar Sesión
                </button>
              )}
              <button
                onClick={() => navigate(`/${tenant.slug}/admin/login`)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm border border-gray-300 dark:border-gray-600 px-3 py-2 rounded"
                title="Acceso para administradores y empleados"
              >
                👔 Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carrusel */}
      <section className="relative h-96 bg-gray-900 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
                <p className="text-lg md:text-xl">{slide.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicadores del carrusel */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Promo del día - Carrusel de productos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promoProducts.map(producto => (
              <div key={producto.id_producto} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-colors">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-6xl">🥖</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">Promo del día</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Subtítulo</p>
                  <p className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">{formatPrice(producto.precio)}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {producto.descripcion || 'Cuerpo del texto para describir qué es este producto y por qué es una compra imprescindible.'}
                  </p>
                  <button 
                    onClick={() => handleAddToCart(producto)}
                    className="w-full bg-black dark:bg-gray-700 text-white py-3 rounded hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    Añadir al carrito
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Cuadro de texto para detalles adicionales o letra pequeña
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Encabezado de categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Encabezado de categorías</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categorias.slice(0, 3).map((categoria, index) => {
            const categoryImages = [
              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
              'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600',
              'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600'
            ];
            return (
            <div 
              key={categoria.id_categoria}
              className="relative h-64 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedCategory(categoria.id_categoria)}
            >
              <img 
                src={categoryImages[index % categoryImages.length]} 
                alt={categoria.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all flex items-end p-6">
                <h3 className="text-white text-2xl font-bold">{categoria.nombre}</h3>
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* Productos Grid */}
      {selectedCategory && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mostrando hasta 50 productos (Límite Plan Básico)</p>
            </div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Ver todos
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 12).map(producto => (
              <div key={producto.id_producto} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-4xl">🍰</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{producto.nombre}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(producto.precio)}</span>
                    <button
                      onClick={() => handleAddToCart(producto)}
                      className="bg-black dark:bg-gray-700 text-white p-2 rounded hover:bg-gray-800 dark:hover:bg-gray-600"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length > 12 && (
            <div className="mt-8 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">Mostrando 12 de {filteredProducts.length} productos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">El plan Básico tiene un límite de visualización. Actualiza a Profesional para ver más productos.</p>
              <button className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                ⬆️ Actualizar Plan
              </button>
            </div>
          )}
        </section>
      )}

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default TiendaHomeBasico;
