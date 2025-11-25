import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from '../../components/DarkModeToggle';
import CartSidebar from '../../components/Cart/CartSidebar';
import { isAuthenticated, getCurrentUser, logout } from '../../services/auth';

const TiendaHomeProfesional = ({ tenant, categorias, productos }) => {
  const navigate = useNavigate();
  const { addItem, toggleCart, getItemCount } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const slides = [
    {
      title: 'Elegancia y Estilo',
      subtitle: 'Descubre nuestra colección exclusiva de moda y accesorios de alta calidad',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
      cta: 'Ver Colección'
    },
    {
      title: 'Nueva Temporada',
      subtitle: 'Las últimas tendencias en moda para lucir sofisticado en cualquier ocasión',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
      cta: 'Explorar'
    }
  ];

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCurrentUser(getCurrentUser());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
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

  // Productos destacados (Promos)
  const promoProducts = productos.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar Premium */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">👗 {tenant?.nombre_empresa || 'Boutique Fashion Elite'}</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-700/90 to-amber-900/90 text-white text-xs font-semibold rounded-full shadow-sm backdrop-blur-sm">
                ⭐ Plan Profesional
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <a href="#inicio" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Inicio</a>
              <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Contacto</a>
              <a href="#ubicacion" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">Ubicación</a>
              
              <div className="flex items-center space-x-4">
                <DarkModeToggle />
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
                {authenticated && currentUser ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 border border-gray-900 dark:border-gray-300 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                    className="border border-gray-900 dark:border-gray-300 text-gray-900 dark:text-gray-300 px-6 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white transition-colors"
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
        </div>
      </nav>

      {/* Hero Section con Imagen de Fondo */}
      <section className="relative h-96 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="h-full bg-gradient-to-r from-gray-900/70 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-xl text-white">
                    <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                    <p className="text-xl mb-8">{slide.subtitle}</p>
                    <button className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors">
                      {slide.cta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navegación del carrusel */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-colors">
          <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-colors">
          <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Banner de características profesionales */}
      <section className="bg-gradient-to-r from-amber-800/95 to-stone-800/95 text-white py-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Reportes Avanzados</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👥</span>
              <span>Hasta 5 Empleados</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💾</span>
              <span>5 GB Almacenamiento</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Soporte Prioritario</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Promos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promoProducts.map((producto, index) => (
            <div key={producto.id_producto} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 h-64 bg-gray-200 flex items-center justify-center">
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-6xl">👗</span>
                  )}
                </div>
                <div className="md:w-1/2 p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">Promo {index + 1}</h3>
                  <p className="text-gray-600 mb-4">
                    Un subtítulo para esta sección, tan largo o tan corto como quieras
                  </p>
                  <button 
                    onClick={() => handleAddToCart(producto)}
                    className="bg-gradient-to-r from-amber-700/90 to-amber-900/90 text-white px-6 py-3 rounded-md hover:from-amber-800 hover:to-amber-950 transition-all w-fit shadow-md backdrop-blur-sm"
                  >
                    🛒 Comprar Ahora
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Encabezado de Categorías */}
      <section className="bg-white dark:bg-gray-800 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Encabezado de categorías</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categorias.slice(0, 3).map((categoria, index) => {
              const categoryImages = [
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
                'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=600',
                'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600'
              ];
              return (
                <div 
                  key={categoria.id_categoria}
                  className="group cursor-pointer"
                >
                  <div className="relative h-72 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={categoryImages[index % categoryImages.length]} 
                      alt={categoria.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-2xl font-bold mb-1">{categoria.nombre}</h3>
                      <p className="text-white/90 text-sm">
                        Explora nuestra colección exclusiva
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nuestros Productos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Hasta 500 productos • Pedidos ilimitados • 5 empleados</p>
          </div>
          <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">✨ Características Profesionales Activas</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.slice(0, 8).map(producto => (
            <div key={producto.id_producto} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
              <div className="h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-5xl">👗</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{producto.nombre}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{producto.descripcion}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(producto.precio)}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(producto)}
                  className="w-full bg-gradient-to-r from-amber-700/90 to-amber-900/90 text-white py-2 rounded-md hover:from-amber-800 hover:to-amber-950 transition-all font-medium shadow-sm backdrop-blur-sm"
                >
                  🛒 Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">© 2024 {tenant?.nombre_empresa}. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default TiendaHomeProfesional;
