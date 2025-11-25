import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    email_empresa: '',
    telefono: '',
    direccion: '',
    descripcion: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const tenant = JSON.parse(localStorage.getItem('tenant'));
      setTenantInfo(tenant);

      // Obtener datos completos del tenant
      const response = await api.get(`/tenants/${tenant.id}`);
      const tenantData = response.data.data;

      setFormData({
        nombre_empresa: tenantData.nombre_empresa || '',
        email_empresa: tenantData.email_empresa || '',
        telefono: tenantData.telefono || '',
        direccion: tenantData.direccion || '',
        descripcion: tenantData.descripcion || '',
        whatsapp: tenantData.whatsapp || '',
        instagram: tenantData.instagram || '',
        facebook: tenantData.facebook || '',
      });
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/tenants/${tenantInfo.id}`, formData);
      
      // Actualizar localStorage
      const updatedTenant = {
        ...tenantInfo,
        nombre_empresa: formData.nombre_empresa
      };
      localStorage.setItem('tenant', JSON.stringify(updatedTenant));
      setTenantInfo(updatedTenant);

      toast.success('Configuración actualizada exitosamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const getPlanColor = (plan) => {
    const colors = {
      basico: 'bg-blue-50 border-blue-200',
      profesional: 'bg-purple-50 border-purple-200',
      empresarial: 'bg-amber-50 border-amber-200'
    };
    return colors[plan] || 'bg-gray-50 border-gray-200';
  };

  const getPlanLimits = (plan) => {
    const limits = {
      basico: { usuarios: 5, productos: 100, pedidos: 100 },
      profesional: { usuarios: 20, productos: 500, pedidos: 'Ilimitado' },
      empresarial: { usuarios: 'Ilimitado', productos: 'Ilimitado', pedidos: 'Ilimitado' }
    };
    return limits[plan] || limits.basico;
  };

  const getPlanFeatures = (plan) => {
    const features = {
      basico: {
        nombre: 'Básico',
        icon: '📦',
        color: 'blue',
        features: [
          { name: 'Descripción de empresa', available: false, tooltip: 'Disponible en plan Profesional' },
          { name: 'Redes sociales', available: false, tooltip: 'Disponible en plan Profesional' },
          { name: 'Logo personalizado', available: false, tooltip: 'Disponible en plan Empresarial' },
          { name: 'Dominio personalizado', available: false, tooltip: 'Disponible en plan Empresarial' },
          { name: 'Tema personalizado', available: false, tooltip: 'Disponible en plan Empresarial' }
        ]
      },
      profesional: {
        nombre: 'Profesional',
        icon: '⭐',
        color: 'purple',
        features: [
          { name: 'Descripción de empresa', available: true },
          { name: 'Redes sociales', available: true },
          { name: 'Logo personalizado', available: false, tooltip: 'Disponible en plan Empresarial' },
          { name: 'Dominio personalizado', available: false, tooltip: 'Disponible en plan Empresarial' },
          { name: 'Tema personalizado', available: false, tooltip: 'Disponible en plan Empresarial' }
        ]
      },
      empresarial: {
        nombre: 'Empresarial',
        icon: '👑',
        color: 'amber',
        features: [
          { name: 'Descripción de empresa', available: true },
          { name: 'Redes sociales', available: true },
          { name: 'Logo personalizado', available: true },
          { name: 'Dominio personalizado', available: true },
          { name: 'Tema personalizado', available: true }
        ]
      }
    };
    return features[plan] || features.basico;
  };

  const canAccessFeature = (feature) => {
    const planFeatures = getPlanFeatures(tenantInfo?.plan);
    const featureInfo = planFeatures.features.find(f => f.name === feature);
    return featureInfo?.available || false;
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '🏢' },
    { id: 'social', name: 'Redes Sociales', icon: '📱', requiredPlan: 'profesional' },
    { id: 'branding', name: 'Marca', icon: '🎨', requiredPlan: 'empresarial' },
    { id: 'plan', name: 'Mi Plan', icon: '⚡' }
  ];

  const canAccessTab = (tab) => {
    if (!tab.requiredPlan) return true;
    
    const planHierarchy = { basico: 0, profesional: 1, empresarial: 2 };
    const currentPlanLevel = planHierarchy[tenantInfo?.plan] || 0;
    const requiredPlanLevel = planHierarchy[tab.requiredPlan] || 0;
    
    return currentPlanLevel >= requiredPlanLevel;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const planFeatures = getPlanFeatures(tenantInfo?.plan);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Configuración</h1>
        <p className="text-gray-600">Administra la configuración de tu tienda y perfil de empresa</p>
      </div>

      {/* Plan Banner */}
      {tenantInfo && (
        <div className={`relative overflow-hidden rounded-xl p-6 mb-8 border-2 ${
          tenantInfo.plan === 'empresarial' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300' :
          tenantInfo.plan === 'profesional' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300' :
          'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300'
        }`}>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{planFeatures.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Plan {planFeatures.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    🏪 <span className="font-mono font-semibold">{tenantInfo.slug}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1" title="Límite de administradores y empleados (los clientes no cuentan)">👥 Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPlanLimits(tenantInfo.plan).usuarios}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Admin/Empleados</p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">📦 Productos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPlanLimits(tenantInfo.plan).productos}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">📋 Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {getPlanLimits(tenantInfo.plan).pedidos}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`/tienda/${tenantInfo.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm border-2 border-gray-200"
              >
                🏪 Ver mi tienda
              </a>
              {tenantInfo.plan !== 'empresarial' && (
                <button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm">
                  ⬆️ Mejorar Plan
                </button>
              )}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <span className="text-9xl">{planFeatures.icon}</span>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const hasAccess = canAccessTab(tab);
            return (
              <button
                key={tab.id}
                onClick={() => hasAccess && setActiveTab(tab.id)}
                disabled={!hasAccess}
                className={`relative flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : hasAccess
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
                {!hasAccess && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    🔒 Premium
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          
          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">🏢 Información General</h3>
                <p className="text-sm text-gray-600 mb-6">Información básica de tu empresa</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    value={formData.nombre_empresa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ej: Mi Empresa S.A."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    name="email_empresa"
                    value={formData.email_empresa}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="contacto@empresa.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Calle, Ciudad, País"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción de la Empresa
                  {!canAccessFeature('Descripción de empresa') && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      🔒 Disponible en plan Profesional
                    </span>
                  )}
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  disabled={!canAccessFeature('Descripción de empresa')}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    !canAccessFeature('Descripción de empresa') ? 'bg-gray-50 cursor-not-allowed opacity-60' : ''
                  }`}
                  placeholder={canAccessFeature('Descripción de empresa') 
                    ? "Describe tu negocio, productos o servicios..." 
                    : "Mejora a plan Profesional para usar esta función"}
                />
                {!canAccessFeature('Descripción de empresa') && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-5 rounded-lg flex items-center justify-center">
                    <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                      ⬆️ Mejorar a Profesional
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Redes Sociales */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">📱 Redes Sociales</h3>
                <p className="text-sm text-gray-600 mb-6">Conecta tus redes sociales con tu tienda</p>
              </div>

              {!canAccessFeature('Redes sociales') ? (
                <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  <span className="text-6xl mb-4 block">🔒</span>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">Función Premium</h4>
                  <p className="text-gray-600 mb-6">Las redes sociales están disponibles desde el plan Profesional</p>
                  <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                    ⬆️ Mejorar a Profesional
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-xl">📱</span> WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="+1234567890"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formato: +[código país][número sin espacios]
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-xl">📷</span> Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="tuusuario"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Solo el nombre de usuario sin @
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-xl">📘</span> Facebook
                      </label>
                      <input
                        type="text"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="tupagina"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        El nombre de tu página de Facebook
                      </p>
                    </div>
                  </div>

                  {/* Preview */}
                  {(formData.whatsapp || formData.instagram || formData.facebook) && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span>👁️</span> Vista Previa de Enlaces
                      </h4>
                      <div className="space-y-3">
                        {formData.whatsapp && (
                          <a
                            href={`https://wa.me/${formData.whatsapp.replace(/[^0-9+]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                          >
                            <span className="text-2xl">📱</span>
                            <div>
                              <p className="text-sm font-semibold text-green-600 group-hover:text-green-700">WhatsApp</p>
                              <p className="text-xs text-gray-500">{formData.whatsapp}</p>
                            </div>
                          </a>
                        )}
                        {formData.instagram && (
                          <a
                            href={`https://instagram.com/${formData.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                          >
                            <span className="text-2xl">📷</span>
                            <div>
                              <p className="text-sm font-semibold text-purple-600 group-hover:text-purple-700">Instagram</p>
                              <p className="text-xs text-gray-500">@{formData.instagram.replace('@', '')}</p>
                            </div>
                          </a>
                        )}
                        {formData.facebook && (
                          <a
                            href={`https://facebook.com/${formData.facebook}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                          >
                            <span className="text-2xl">📘</span>
                            <div>
                              <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Facebook</p>
                              <p className="text-xs text-gray-500">facebook.com/{formData.facebook}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Branding */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">🎨 Marca e Identidad</h3>
                <p className="text-sm text-gray-600 mb-6">Personaliza la apariencia de tu tienda</p>
              </div>

              <div className="text-center py-16 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
                <span className="text-6xl mb-4 block">👑</span>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Función Empresarial</h4>
                <p className="text-gray-600 mb-2">Personalización avanzada de marca disponible en el plan Empresarial</p>
                <ul className="text-sm text-gray-600 mb-6 inline-block text-left">
                  <li>✨ Logo personalizado</li>
                  <li>🎨 Colores de marca personalizados</li>
                  <li>🌐 Dominio personalizado</li>
                  <li>📱 Favicon personalizado</li>
                </ul>
                <div>
                  <button className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">
                    ⬆️ Mejorar a Empresarial
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Mi Plan */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">⚡ Información del Plan</h3>
                <p className="text-sm text-gray-600 mb-6">Detalles de tu plan actual y características disponibles</p>
              </div>

              <div className={`rounded-xl p-6 border-2 ${
                tenantInfo.plan === 'empresarial' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300' :
                tenantInfo.plan === 'profesional' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300' :
                'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-6xl">{planFeatures.icon}</span>
                  <div>
                    <h4 className="text-3xl font-bold text-gray-900">Plan {planFeatures.nombre}</h4>
                    <p className="text-gray-600">Tu plan actual</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white bg-opacity-60 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1" title="Administradores y empleados (clientes ilimitados)">👥 Staff</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getPlanLimits(tenantInfo.plan).usuarios}
                    </p>
                    <p className="text-xs text-gray-500">Admin/Empleados</p>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">📦 Productos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {getPlanLimits(tenantInfo.plan).productos}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">📋 Pedidos</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {getPlanLimits(tenantInfo.plan).pedidos}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-4">🎯 Características de tu plan</h4>
                <div className="space-y-2">
                  {planFeatures.features.map((feature, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        feature.available
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {feature.available ? '✅' : '🔒'}
                        </span>
                        <span className={`font-semibold ${
                          feature.available ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                      {!feature.available && feature.tooltip && (
                        <span className="text-xs text-gray-500">{feature.tooltip}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {tenantInfo.plan !== 'empresarial' && (
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl p-6">
                  <h4 className="text-2xl font-bold mb-2">🚀 ¿Listo para crecer?</h4>
                  <p className="mb-4">Desbloquea todas las características mejorando tu plan</p>
                  <button className="bg-white text-amber-600 px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all">
                    Ver Planes Disponibles
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          {(activeTab === 'general' || (activeTab === 'social' && canAccessFeature('Redes sociales'))) && (
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={cargarConfiguracion}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                ↺ Restablecer
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Info Footer */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">ℹ️</span> Información Útil
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Los cambios se reflejarán inmediatamente en tu panel y tienda pública</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Tu URL pública: <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded">localhost:5173/tienda/{tenantInfo?.slug}</span></span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Las funciones bloqueadas se desbloquean al mejorar tu plan</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
