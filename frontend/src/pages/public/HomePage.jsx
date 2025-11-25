import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../services/auth';
import DarkModeToggle from '../../components/DarkModeToggle';

const HomePage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCurrentUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-gray-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SmartPYME</span>
            </div>
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <a href="#inicio" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Inicio</a>
              <a href="#servicios" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Servicios</a>
              <a href="#contacto" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section 
        id="inicio" 
        className="relative min-h-[600px] flex items-center bg-cover bg-center"
        style={{
          backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.88)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl bg-white/30 dark:bg-black/40 p-8 rounded-lg backdrop-blur-md transition-colors duration-300 border-2 border-gray-200/50 dark:border-white/50 shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight drop-shadow-lg">
                Impulsa tu negocio con SmartPYME
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-200 mb-10 leading-relaxed drop-shadow-md">
                Sistema de gestión de ventas y pedidos para una productividad óptima.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/registro-empresa')}
                  className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-md font-semibold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg"
                >
                  Regístrate Ahora
                </button>
                <button 
                  onClick={() => navigate('/tiendas')}
                  className="bg-white dark:bg-gray-700 text-black dark:text-white border-2 border-black dark:border-gray-600 px-10 py-4 rounded-md font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-lg"
                >
                  🛍️ Ir de Compras
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros Servicios */}
      <section id="servicios" className="bg-white dark:bg-black py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">Nuestros Servicios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Servicio 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg transition-colors duration-300">
                  <svg className="w-16 h-16 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Gestión de Ventas</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Optimiza tus procesos de ventas con nuestras herramientas avanzadas.
              </p>
            </div>

            {/* Servicio 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg transition-colors duration-300">
                  <svg className="w-16 h-16 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Gestión de Pedidos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Controla y administra tus pedidos de manera eficiente.
              </p>
            </div>

            {/* Servicio 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg transition-colors duration-300">
                  <svg className="w-16 h-16 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Análisis de Datos</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Toma decisiones informadas con nuestros informes detallados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparación de Planes */}
      <section className="py-20 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Elige el Plan Perfecto para tu Negocio</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">Cada plan incluye una página personalizada con características únicas</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan Básico */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-all">
              <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-300 dark:border-gray-600 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Básico</h3>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-full">GRATIS</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">$0<span className="text-lg text-gray-500 dark:text-gray-400">/mes</span></p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🎨 Diseño Simple y Funcional</p>
                  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Carrusel básico de productos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Grid simple 4 columnas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span>Navbar minimalista</span>
                    </li>
                  </ul>
                </div>
                <hr className="my-4 dark:border-gray-600" />
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span className="text-gray-900 dark:text-white">Hasta 50 productos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span className="text-gray-900 dark:text-white">100 pedidos/mes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span className="text-gray-900 dark:text-white">1 empleado admin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span className="text-gray-900 dark:text-white">Clientes ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 dark:text-green-400 mr-2">✓</span>
                    <span className="text-gray-900 dark:text-white">500 MB almacenamiento</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/registro-empresa')}
                  className="w-full mt-6 bg-gray-800 dark:bg-white text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                  Comenzar Gratis
                </button>
              </div>
            </div>

            {/* Plan Profesional */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2 border-gray-900 dark:border-white relative transform scale-105 transition-colors duration-300">
              <div className="absolute top-0 right-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-1 text-xs font-bold">
                MÁS POPULAR
              </div>
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white dark:text-gray-900">Profesional</h3>
                  <span className="px-3 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-xs font-semibold rounded-full">⭐ PRO</span>
                </div>
                <p className="text-3xl font-bold text-white dark:text-gray-900 mt-2">$29<span className="text-lg text-gray-200 dark:text-gray-700">/mes</span></p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🎨 Diseño Profesional Mejorado</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-gray-900 dark:text-white mr-2">✓</span>
                      <span>Hero con imagen de fondo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 dark:text-white mr-2">✓</span>
                      <span>Sección de promos destacadas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 dark:text-white mr-2">✓</span>
                      <span>Navbar premium con cart</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-900 dark:text-white mr-2">✓</span>
                      <span>Botones con iconos 🛒</span>
                    </li>
                  </ul>
                </div>
                <hr className="my-4 dark:border-gray-600" />
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">Hasta 500 productos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">Pedidos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">5 empleados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">5 GB almacenamiento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">📊 Reportes avanzados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-900 dark:text-white mr-2 font-bold">✓</span>
                    <span className="font-medium text-gray-900 dark:text-white">Soporte prioritario</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/registro-empresa')}
                  className="w-full mt-6 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-white text-white dark:text-gray-900 py-3 rounded-lg font-bold hover:from-gray-900 hover:to-black dark:hover:from-white dark:hover:to-gray-100 transition-all shadow-lg"
                >
                  Elegir Profesional
                </button>
              </div>
            </div>

            {/* Plan Empresarial */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-amber-400 dark:border-amber-500 hover:border-amber-500 dark:hover:border-amber-400 transition-all">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Empresarial</h3>
                  <span className="px-3 py-1 bg-white text-amber-600 text-xs font-bold rounded-full flex items-center">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    PREMIUM
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mt-2">$79<span className="text-lg text-yellow-100">/mes</span></p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-amber-700 mb-2">🎨 Diseño Premium Completo</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      <span>Navbar sticky premium</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      <span>Sidebar con filtros avanzados</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      <span>Sección de blog/artículos</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      <span>Footer completo con newsletter</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-600 mr-2">✓</span>
                      <span>Botones dorados premium ⭐</span>
                    </li>
                  </ul>
                </div>
                <hr className="my-4" />
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">∞ Productos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">∞ Pedidos ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">∞ Empleados ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">50 GB almacenamiento</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">🚀 API personalizada</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">Soporte 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-600 dark:text-amber-400 mr-2 font-bold">✓</span>
                    <span className="font-bold text-gray-900 dark:text-white">Capacitación incluida</span>
                  </li>
                </ul>
                <button 
                  onClick={() => navigate('/registro-empresa')}
                  className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-lg font-bold hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg"
                >
                  Elegir Empresarial
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">¿Quieres ver las diferencias en acción? Visita nuestras tiendas de ejemplo:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/tienda/pasteleria-dulce-sabor')}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-300 dark:border-gray-600"
              >
                Ver Demo Básico
              </button>
              <button 
                onClick={() => navigate('/tienda/boutique-fashion-elite')}
                className="px-6 py-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-900 dark:hover:bg-white transition-colors font-medium border border-gray-900 dark:border-gray-200"
              >
                Ver Demo Profesional ⭐
              </button>
              <button 
                onClick={() => navigate('/tienda/electrotech-premium')}
                className="px-6 py-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors font-medium border border-amber-300 dark:border-amber-700"
              >
                Ver Demo Empresarial 👑
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section className="py-20 bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">Lo que dicen nuestros clientes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonio 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                    alt="María Gomes" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">María Gomes</h4>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed">
                "GestiónPYME ha transformado la forma en que manejamos nuestros pedidos. 
                ¡Altamente recomendado!"
              </p>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                    alt="Juan Perez" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Juan Perez</h4>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed">
                "La eficiencia y el control que nos ofrece este sistema es incomparable."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Contacto */}
      <footer id="contacto" className="bg-black dark:bg-gray-900 text-white py-12 transition-colors duration-300 border-t border-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white dark:text-gray-300">Contacta con Nosotros</h3>
              <p className="text-gray-400 dark:text-gray-400 mb-2">Email: contacto@smartpyme.com</p>
              <p className="text-gray-400 dark:text-gray-400">Tel: +58 8 338 045 51</p>
            </div>
            <div className="md:col-span-2 flex justify-end items-center space-x-6">
              <a href="#" className="text-white dark:text-gray-300 hover:text-gray-300 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white dark:text-gray-300 hover:text-gray-300 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-white dark:text-gray-300 hover:text-gray-300 dark:hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
