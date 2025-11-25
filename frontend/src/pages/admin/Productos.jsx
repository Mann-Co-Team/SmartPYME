import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../../services/productos';
import { getCategorias } from '../../services/categorias';
import LoadingSpinner from '../../components/LoadingSpinner';
import { usePermissions } from '../../utils/permissions';

export default function AdminProductos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProducto, setDeletingProducto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const highlightRef = useRef(null);
  const { canDeleteProducts } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    id_categoria: '',
    activo: true,
    imagen: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadData();
    loadTenantInfo();
  }, []);

  const loadTenantInfo = () => {
    try {
      const tenant = JSON.parse(localStorage.getItem('tenant'));
      setTenantInfo(tenant);
    } catch (err) {
      console.error('Error cargando info del tenant:', err);
    }
  };

  const getPlanLimits = (plan) => {
    const limits = {
      basico: 50,
      profesional: 500,
      empresarial: null // null = ilimitado
    };
    // Si el plan existe en limits, devolver su valor (incluso si es null)
    // Si no existe, devolver 50 por defecto
    return plan in limits ? limits[plan] : 50;
  };

  const canAddMoreProducts = () => {
    if (!tenantInfo) return false;
    const limit = getPlanLimits(tenantInfo.plan);
    if (limit === null) return true; // Ilimitado
    const activeProducts = productos.filter(p => p.activo).length;
    return activeProducts < limit;
  };

  useEffect(() => {
    // Verificar si hay un producto para resaltar desde las notificaciones
    const highlightId = searchParams.get('highlight');
    if (highlightId && productos.length > 0) {
      setHighlightedProductId(parseInt(highlightId));
      
      // Scroll al producto después de un pequeño delay para asegurar que se renderizó
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Quitar el highlight después de 5 segundos
          setTimeout(() => {
            setHighlightedProductId(null);
            // Limpiar el parámetro de la URL
            searchParams.delete('highlight');
            setSearchParams(searchParams);
          }, 5000);
        }
      }, 100);
    }
  }, [productos, searchParams, setSearchParams]);

  const loadData = async () => {
    try {
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias()
      ]);
      setProductos(productosData);
      setFilteredProductos(productosData);
      setCategorias(categoriasData.filter(c => c.activo));
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar productos (búsqueda avanzada)
  useEffect(() => {
    let result = [...productos];

    // Búsqueda por término
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(producto => 
        producto.nombre.toLowerCase().includes(term) ||
        producto.descripcion?.toLowerCase().includes(term) ||
        producto.categoria?.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría
    if (filterCategoria) {
      result = result.filter(p => p.id_categoria === parseInt(filterCategoria));
    }

    // Filtrar por estado
    if (filterEstado !== '') {
      const isActive = filterEstado === 'activo';
      result = result.filter(p => p.activo === isActive);
    }

    // Filtrar por stock
    if (filterStock) {
      switch (filterStock) {
        case 'sin-stock':
          result = result.filter(p => p.stock === 0);
          break;
        case 'bajo-stock':
          result = result.filter(p => p.stock > 0 && p.stock <= 10);
          break;
        case 'stock-normal':
          result = result.filter(p => p.stock > 10);
          break;
        default:
          break;
      }
    }

    // Ordenar
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'nombre':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'precio':
          comparison = a.precio - b.precio;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'categoria':
          comparison = (a.categoria || '').localeCompare(b.categoria || '');
          break;
        case 'fecha':
          comparison = new Date(a.created_at) - new Date(b.created_at);
          break;
        default:
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProductos(result);
  }, [searchTerm, productos, filterCategoria, filterEstado, filterStock, sortBy, sortOrder]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingProducto(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      id_categoria: '',
      activo: true,
      imagen: null
    });
    setImagePreview(null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const openEditModal = (producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      id_categoria: producto.id_categoria,
      activo: producto.activo,
      imagen: null
    });
    setImagePreview(producto.imagen ? `http://localhost:3000${producto.imagen}` : null);
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('precio', formData.precio);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('id_categoria', formData.id_categoria);
      formDataToSend.append('activo', formData.activo);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      if (editingProducto) {
        await updateProducto(editingProducto.id_producto, formDataToSend);
        setSuccess('Producto actualizado exitosamente');
      } else {
        await createProducto(formDataToSend);
        setSuccess('Producto creado exitosamente');
      }

      await loadData();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Error guardando producto:', error);
      setError(error.response?.data?.message || 'Error al guardar el producto');
    }
  };

  const openDeleteConfirm = (producto) => {
    setDeletingProducto(producto);
    setShowDeleteConfirm(true);
    setError('');
  };

  const handleDelete = async () => {
    try {
      await deleteProducto(deletingProducto.id_producto);
      setSuccess('Producto eliminado exitosamente');
      await loadData();
      setShowDeleteConfirm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error eliminando producto:', error);
      setError(error.response?.data?.message || 'Error al eliminar el producto');
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-8" />;
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Productos</h1>
          
          {/* Indicador de Plan */}
          {tenantInfo && (
            <div className="mt-3 inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <span className="text-2xl">
                {tenantInfo.plan === 'basico' ? '📦' : tenantInfo.plan === 'profesional' ? '⭐' : '👑'}
              </span>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Plan {tenantInfo.plan.charAt(0).toUpperCase() + tenantInfo.plan.slice(1)}
                </p>
                <p className="text-sm text-green-700">
                  Productos activos: <span className="font-bold">{productos.filter(p => p.activo).length}</span>
                  {getPlanLimits(tenantInfo.plan) !== null && (
                    <> / {getPlanLimits(tenantInfo.plan)}</>
                  )}
                  {getPlanLimits(tenantInfo.plan) === null && <> (Ilimitado)</>}
                </p>
                {tenantInfo.plan === 'basico' && productos.filter(p => p.activo).length > 0 && (
                  <div className="mt-1 w-48">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          (productos.filter(p => p.activo).length / 50) > 0.8 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(productos.filter(p => p.activo).length / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div>
          {canAddMoreProducts() ? (
            <button onClick={openCreateModal} className="btn-primary">
              Agregar Producto
            </button>
          ) : (
            <div className="text-center">
              <button
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
                title="Has alcanzado el límite de productos de tu plan"
              >
                Límite Alcanzado
              </button>
              <p className="text-xs text-orange-600 mt-2 font-medium">
                ⚠️ Mejora tu plan para agregar más productos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Barra de Búsqueda y Filtros Avanzados */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda principal */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={tenantInfo?.plan === 'empresarial' 
              ? "🔍 Búsqueda inteligente: nombre, descripción, categoría... (Plan Empresarial)" 
              : "Buscar por nombre, descripción o categoría..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
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

        {/* Filtros avanzados (mejorados para plan empresarial) */}
        <div className={`card p-4 ${tenantInfo?.plan === 'empresarial' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 'bg-gray-50'}`}>
          {tenantInfo?.plan === 'empresarial' && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-amber-200">
              <span className="text-2xl">👑</span>
              <span className="text-sm font-semibold text-amber-900">Filtros Premium - Plan Empresarial</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📂 Categoría
              </label>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                📊 Estado
              </label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="activo">✅ Activos</option>
                <option value="inactivo">❌ Inactivos</option>
              </select>
            </div>

            {/* Filtro por stock (premium) */}
            {tenantInfo?.plan === 'empresarial' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  📦 Nivel de Stock
                </label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="block w-full px-3 py-2 border border-amber-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white"
                >
                  <option value="">Todos los niveles</option>
                  <option value="sin-stock">🔴 Sin stock (0)</option>
                  <option value="bajo-stock">🟡 Bajo stock (1-10)</option>
                  <option value="stock-normal">🟢 Stock normal (&gt;10)</option>
                </select>
              </div>
            )}

            {/* Ordenar por */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                🔢 Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="nombre">Nombre</option>
                <option value="precio">Precio</option>
                <option value="stock">Stock</option>
                <option value="categoria">Categoría</option>
                <option value="fecha">Fecha creación</option>
              </select>
            </div>

            {/* Orden ascendente/descendente */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ↕️ Orden
              </label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-gray-700 flex items-center justify-center gap-2"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Ascendente
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Descendente
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Botón limpiar filtros y selector de vista */}
          {(searchTerm || filterCategoria || filterEstado || filterStock) && (
            <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-bold text-indigo-600">{filteredProductos.length}</span> de {productos.length} productos
              </p>
              <div className="flex items-center gap-3">
                {/* Selector de Vista */}
                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Vista de cuadrícula"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-xs font-medium hidden sm:inline">Cuadrícula</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Vista de lista"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-xs font-medium hidden sm:inline">Lista</span>
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategoria('');
                    setFilterEstado('');
                    setFilterStock('');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {!searchTerm && !filterCategoria && !filterEstado && !filterStock && (
            <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Mostrando todos los productos ({productos.length})
              </p>
              {/* Selector de Vista */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vista de cuadrícula"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-xs font-medium hidden sm:inline">Cuadrícula</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Vista de lista"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-xs font-medium hidden sm:inline">Lista</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductos.map((producto) => (
                <tr 
                  key={producto.id_producto}
                  ref={highlightedProductId === producto.id_producto ? highlightRef : null}
                  className={`transition-colors duration-500 ${
                    highlightedProductId === producto.id_producto 
                      ? 'bg-yellow-100 animate-pulse' 
                      : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={producto.imagen ? `http://localhost:3000${producto.imagen}` : '/placeholder-product.jpg'}
                          alt={producto.nombre}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                          {highlightedProductId === producto.id_producto && (
                            <span className="ml-2 text-xs text-yellow-600 font-semibold">
                              ⚠️ Stock Crítico
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {producto.categoria}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.precio}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={producto.stock <= 5 ? 'text-red-600 font-bold' : ''}>
                      {producto.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      producto.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => openEditModal(producto)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editar
                    </button>
                    {canDeleteProducts && (
                      <button 
                        onClick={() => openDeleteConfirm(producto)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista de Cuadrícula */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProductos.map((producto) => (
            <div 
              key={producto.id_producto}
              ref={highlightedProductId === producto.id_producto ? highlightRef : null}
              className={`card overflow-hidden hover:shadow-xl transition-all group ${
                highlightedProductId === producto.id_producto 
                  ? 'ring-4 ring-yellow-400 animate-pulse' 
                  : ''
              }`}
            >
              {/* Imagen del producto */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={producto.imagen ? `http://localhost:3000${producto.imagen}` : '/placeholder-product.jpg'}
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Badge de estado */}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    producto.activo 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {producto.activo ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                </div>
                {/* Badge de stock crítico */}
                {highlightedProductId === producto.id_producto && (
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500 text-white">
                      ⚠️ Stock Crítico
                    </span>
                  </div>
                )}
                {/* Badge de stock bajo */}
                {producto.stock <= 5 && producto.stock > 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-500 text-white">
                      Stock Bajo: {producto.stock}
                    </span>
                  </div>
                )}
                {producto.stock === 0 && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500 text-white">
                      Sin Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 font-medium">{producto.categoria}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {producto.nombre}
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-indigo-600">
                    ${producto.precio}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className={`text-lg font-bold ${producto.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {producto.stock}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(producto)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
                  >
                    Editar
                  </button>
                  {canDeleteProducts && (
                    <button 
                      onClick={() => openDeleteConfirm(producto)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors font-medium text-sm"
                      title="Eliminar producto"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensajes de estado */}
      {filteredProductos.length === 0 && productos.length > 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg text-gray-500">No se encontraron productos</p>
          <p className="text-sm text-gray-400">Intenta ajustar tus filtros de búsqueda</p>
        </div>
      )}

      {productos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-lg text-gray-500">No hay productos registrados</p>
          <p className="text-sm text-gray-400">Comienza agregando tu primer producto</p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProducto ? 'Editar Producto' : 'Crear Producto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    minLength={2}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={1000}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Producto activo</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Está seguro que desea eliminar el producto "{deletingProducto?.nombre}"?
              Esta acción no se puede deshacer.
            </p>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
