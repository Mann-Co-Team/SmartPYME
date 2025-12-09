import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import { formatPriceWithConversion } from '../../utils/currencyConverter';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import DarkModeToggle from '../../components/DarkModeToggle';
import LanguageCurrencySwitcher from '../../components/LanguageCurrencySwitcher';
import CartSidebar from '../../components/Cart/CartSidebar';
import { isAuthenticated, getCurrentUser, logout } from '../../services/auth';

const TiendaHomeEmpresarial = ({ tenant, categorias, productos }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem, toggleCart, getItemCount } = useCart();
  const { settings } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('destacados');
  const [filteredProductos, setFilteredProductos] = useState(productos);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'compact'
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const slides = [
    {
      title: t('store.enterprise.carousel.slide1Title'),
      subtitle: t('store.enterprise.carousel.slide1Subtitle'),
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200'
    },
    {
      title: t('store.enterprise.carousel.slide2Title'),
      subtitle: t('store.enterprise.carousel.slide2Subtitle'),
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200'
    },
    {
      title: t('store.enterprise.carousel.slide3Title'),
      subtitle: t('store.enterprise.carousel.slide3Subtitle'),
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200'
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
    const userCurrency = localStorage.getItem('userCurrency') || 'CLP';
    return formatPriceWithConversion(price, userCurrency);
  };

  // Escuchar cambios de moneda
  useEffect(() => {
    const handleCurrencyChange = () => {
      // Forzar re-render cuando cambia la moneda
      setViewMode(prev => prev);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  const handleAddToCart = (producto) => {
    addItem(producto);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Sistema de filtrado y búsqueda avanzado (Plan Empresarial)
  useEffect(() => {
    let result = [...productos];

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term) ||
        p.categoria?.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría
    if (selectedCategoria) {
      result = result.filter(p => p.id_categoria === parseInt(selectedCategoria));
    }

    // Filtrar por rango de precio
    if (priceRange.min) {
      result = result.filter(p => p.precio >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter(p => p.precio <= parseFloat(priceRange.max));
    }

    // Ordenar
    switch (sortBy) {
      case 'precio-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        result.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nuevo':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'destacados':
      default:
        // Mantener orden original
        break;
    }

    setFilteredProductos(result);
  }, [searchTerm, selectedCategoria, priceRange, sortBy, productos]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar Premium con Logo Empresa */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{tenant.nombre_empresa}</span>
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 dark:from-amber-500 dark:via-yellow-600 dark:to-amber-600 text-white text-xs font-bold rounded-full shadow-md flex items-center space-x-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Plan Empresarial</span>
              </span>

              {/* Búsqueda Premium en Navbar */}
              <div className="hidden lg:block flex-1 max-w-xl ml-8">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={`🔍 ${t('store.enterprise.filters.search')}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border-2 border-amber-300 dark:border-amber-700 rounded-lg leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <a href="#inicio" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">{t('store.navigation.home')}</a>
              <a href="#contacto" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">{t('store.navigation.contact')}</a>
              <a href="#ubicacion" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">{t('store.navigation.location')}</a>

              <div className="flex items-center space-x-4">
                <LanguageCurrencySwitcher />
                <DarkModeToggle />
                <button
                  onClick={toggleCart}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white relative"
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
                      className="flex items-center space-x-2 border-2 border-gray-900 dark:border-gray-300 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>{currentUser.nombre}</span>
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
                          👤 {t('store.user.myProfile')}
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate(`/tienda/${tenant.slug}/pedidos`);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          📦 {t('store.user.myOrders')}
                        </button>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🚪 {t('store.user.logout')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/tienda/${tenant.slug}/login`)}
                    className="border-2 border-gray-900 dark:border-gray-300 text-gray-900 dark:text-gray-300 px-6 py-2 rounded-md hover:bg-gray-900 dark:hover:bg-gray-700 hover:text-white transition-colors font-medium"
                  >
                    {t('store.user.loginRegister')}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/${tenant.slug}/admin/login`)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm border border-gray-300 dark:border-gray-600 px-3 py-2 rounded"
                  title="Acceso para administradores y empleados"
                >
                  👔 {t('store.user.admin')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carrusel */}
      <section className="relative h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl text-white">
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                  <p className="text-xl mb-8">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navegación del carrusel */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-4 transition-colors shadow-lg"
        >
          <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-4 transition-colors shadow-lg"
        >
          <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </section>

      {/* Layout con Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros Avanzados Premium */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-lg shadow-lg border-2 border-amber-200 p-6 sticky top-20 space-y-6">
              {/* Header Premium */}
              <div className="border-b-2 border-amber-200 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👑</span>
                  <h3 className="font-bold text-lg text-amber-900">{t('store.enterprise.filters.premiumFilters')}</h3>
                </div>
                <p className="text-xs text-amber-700">
                  {t('store.enterprise.filters.advancedSearchSystem')}
                </p>
              </div>

              {/* Búsqueda móvil */}
              <div className="lg:hidden">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔍 {t('store.enterprise.filters.searchLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('store.enterprise.filters.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                />
              </div>

              {/* Filtro por Categorías */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📂 {t('store.enterprise.filters.categories')}
                </label>
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                >
                  <option value="">{t('store.enterprise.filters.allCategories')}</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id_categoria} value={categoria.id_categoria}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Rango de Precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 {t('store.enterprise.filters.priceRange')}
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder={t('store.enterprise.filters.min')}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t('store.enterprise.filters.max')}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Contador de resultados */}
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-900">
                    {t('store.enterprise.filters.results')}
                  </span>
                  <span className="text-lg font-bold text-amber-900">
                    {filteredProductos.length}
                  </span>
                </div>
                <p className="text-xs text-amber-700 mt-1">
                  {t('store.enterprise.filters.of')} {productos.length} {t('store.enterprise.filters.totalProducts')}
                </p>
              </div>

              {/* Botón limpiar filtros */}
              {(searchTerm || selectedCategoria || priceRange.min || priceRange.max) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategoria('');
                    setPriceRange({ min: '', max: '' });
                  }}
                  className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('store.enterprise.filters.clearFilters')}
                </button>
              )}

              {/* Categorías expandibles (visual) */}
              <div className="border-t-2 border-amber-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('store.enterprise.filters.exploreByCategory')}</h4>
                <div className="space-y-1">
                  {categorias.map((categoria) => {
                    const count = productos.filter(p => p.id_categoria === categoria.id_categoria).length;
                    return (
                      <button
                        key={categoria.id_categoria}
                        onClick={() => setSelectedCategoria(categoria.id_categoria.toString())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${selectedCategoria === categoria.id_categoria.toString()
                          ? 'bg-amber-200 text-amber-900 font-semibold'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{categoria.nombre}</span>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="flex-1">
            {/* Banner de Características Empresariales */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-8 mb-12">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="h-12 w-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4 text-amber-900">✨ {t('store.enterprise.features.premiumFeatures')}</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.unlimitedProducts')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.unlimitedOrders')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.unlimitedEmployees')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.prioritySupport')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.storage50GB')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{t('store.enterprise.features.customAPI')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Encabezado de Categorías */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">{t('store.enterprise.sections.categoriesHeader')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categorias.slice(0, 3).map((categoria, index) => {
                  const categoryImages = [
                    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
                    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
                    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600'
                  ];
                  return (
                    <div
                      key={categoria.id_categoria}
                      className="group cursor-pointer"
                    >
                      <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                        <img
                          src={categoryImages[index % categoryImages.length]}
                          alt={categoria.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition-all" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white text-xl font-bold mb-1">{categoria.nombre}</h3>
                          <p className="text-white/90 text-sm">
                            {t('store.enterprise.sections.latestTechnology')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Grid de Productos Premium */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold">
                    {searchTerm || selectedCategoria || priceRange.min || priceRange.max
                      ? t('store.enterprise.sections.searchResults')
                      : t('store.enterprise.sections.completeCatalog')}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      ∞ Productos Ilimitados
                    </span>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                      {filteredProductos.length} productos
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  {/* Selector de Vista */}
                  <div className="flex items-center bg-white border-2 border-amber-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 flex items-center gap-1 transition-colors ${viewMode === 'grid'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 hover:bg-amber-50'
                        }`}
                      title="Vista de cuadrícula"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 flex items-center gap-1 transition-colors ${viewMode === 'list'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 hover:bg-amber-50'
                        }`}
                      title="Vista de lista"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`px-3 py-2 flex items-center gap-1 transition-colors ${viewMode === 'compact'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 hover:bg-amber-50'
                        }`}
                      title="Vista compacta"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 md:flex-none border-2 border-amber-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                  >
                    <option value="destacados">✨ Destacados</option>
                    <option value="precio-asc">💰 Precio: Menor a Mayor</option>
                    <option value="precio-desc">💎 Precio: Mayor a Menor</option>
                    <option value="nombre">🔤 Nombre A-Z</option>
                    <option value="nuevo">🆕 Recién Agregados</option>
                  </select>
                </div>
              </div>

              {/* Mensaje si no hay resultados */}
              {filteredProductos.length === 0 ? (
                <div className="text-center py-16 bg-amber-50 rounded-lg border-2 border-amber-200">
                  <svg className="mx-auto h-16 w-16 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">No se encontraron productos</h3>
                  <p className="mt-2 text-gray-600">Intenta ajustar tus filtros de búsqueda</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategoria('');
                      setPriceRange({ min: '', max: '' });
                    }}
                    className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <>
                  {/* Vista de Cuadrícula */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProductos.map(producto => (
                        <div key={producto.id_producto} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                          <div className="relative h-64 bg-gray-50 overflow-hidden">
                            {producto.imagen ? (
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <span className="text-gray-400 text-5xl">📦</span>
                            )}
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              ⭐ PREMIUM
                            </div>
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                              🚀 Envío Prioritario
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{producto.descripcion}</p>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-2xl font-bold text-gray-900">{formatPrice(producto.precio)}</span>
                              {producto.stock && (
                                <span className="text-sm text-gray-500">Stock: {producto.stock}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddToCart(producto)}
                              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-md hover:from-amber-600 hover:to-yellow-700 transition-all font-bold shadow-lg transform hover:scale-105"
                            >
                              ⭐ Añadir al carrito Premium
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vista de Lista */}
                  {viewMode === 'list' && (
                    <div className="space-y-4">
                      {filteredProductos.map(producto => (
                        <div key={producto.id_producto} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all flex">
                          {/* Imagen */}
                          <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100">
                            {producto.imagen ? (
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-5xl">📦</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                              ⭐ PREMIUM
                            </div>
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{producto.nombre}</h3>
                                  <p className="text-sm text-gray-500 mb-2">{producto.categoria || 'Sin categoría'}</p>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="text-3xl font-bold text-amber-600">{formatPrice(producto.precio)}</p>
                                </div>
                              </div>
                              <p className="text-gray-600 mb-4 line-clamp-2">{producto.descripcion || 'Sin descripción disponible'}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  Stock: {producto.stock}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Disponible
                                </span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() => handleAddToCart(producto)}
                                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-md hover:from-amber-600 hover:to-yellow-700 transition-all font-bold shadow-lg"
                              >
                                ⭐ Añadir al carrito Premium
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vista Compacta */}
                  {viewMode === 'compact' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredProductos.map(producto => (
                        <div key={producto.id_producto} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all flex">
                          {/* Imagen compacta */}
                          <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100">
                            {producto.imagen ? (
                              <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-2xl">📦</span>
                              </div>
                            )}
                          </div>

                          {/* Contenido compacto */}
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{producto.nombre}</h4>
                              <p className="text-xs text-gray-500 mb-1">{producto.categoria}</p>
                              <p className="text-lg font-bold text-amber-600">{formatPrice(producto.precio)}</p>
                            </div>
                            <button
                              onClick={() => handleAddToCart(producto)}
                              className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded text-xs font-bold transition-colors"
                            >
                              + Carrito
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Footer Premium */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Sobre Nosotros</h4>
              <p className="text-gray-400 text-sm">
                {tenant?.nombre_empresa} - Tu tienda de confianza
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Inicio</a></li>
                <li><a href="#" className="hover:text-white">Productos</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contacto</h4>
              <p className="text-gray-400 text-sm">{tenant?.email_empresa}</p>
              <p className="text-gray-400 text-sm">{tenant?.telefono_empresa}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-4">Suscríbete para recibir ofertas</p>
              <input
                type="email"
                placeholder="Tu email"
                className="w-full px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 {tenant?.nombre_empresa}. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default TiendaHomeEmpresarial;
