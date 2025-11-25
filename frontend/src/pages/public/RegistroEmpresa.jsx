import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const RegistroEmpresa = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Datos de la empresa
    nombre_empresa: '',
    email_empresa: '',
    telefono_empresa: '',
    direccion_empresa: '',
    plan: 'basico', // Plan por defecto
    // Datos del usuario administrador
    nombre_admin: '',
    apellido_admin: '',
    email_admin: '',
    password: '',
    confirmPassword: '',
    telefono_admin: ''
  });

  const planes = [
    {
      id: 'basico',
      nombre: 'Básico',
      precio: 'Gratis',
      caracteristicas: [
        'Hasta 50 productos',
        'Hasta 100 pedidos/mes',
        '1 empleado administrador',
        'Clientes ilimitados',
        'Soporte por email',
        'Almacenamiento: 500 MB'
      ]
    },
    {
      id: 'profesional',
      nombre: 'Profesional',
      precio: '$29/mes',
      caracteristicas: [
        'Hasta 500 productos',
        'Pedidos ilimitados',
        'Hasta 5 empleados',
        'Clientes ilimitados',
        'Soporte prioritario',
        'Almacenamiento: 5 GB',
        'Reportes avanzados'
      ],
      popular: true
    },
    {
      id: 'empresarial',
      nombre: 'Empresarial',
      precio: '$79/mes',
      caracteristicas: [
        'Productos ilimitados',
        'Pedidos ilimitados',
        'Empleados ilimitados',
        'Clientes ilimitados',
        'Soporte 24/7',
        'Almacenamiento: 50 GB',
        'Reportes avanzados',
        'API personalizada',
        'Capacitación incluida'
      ]
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Crear el tenant (empresa) y el usuario administrador
      const response = await api.post('/tenants/register', {
        // Datos de la empresa
        nombre_empresa: formData.nombre_empresa,
        email_empresa: formData.email_empresa,
        telefono_empresa: formData.telefono_empresa || null,
        direccion_empresa: formData.direccion_empresa || null,
        plan: formData.plan,
        // Datos del administrador
        admin: {
          nombre: formData.nombre_admin,
          apellido: formData.apellido_admin,
          email: formData.email_admin,
          password: formData.password,
          telefono: formData.telefono_admin || null
        }
      });

      if (response.data.success) {
        toast.success('¡Empresa registrada exitosamente! Ahora puedes iniciar sesión.');
        
        // Obtener el slug de la respuesta
        const tenantSlug = response.data.data.slug;
        
        // Redirigir al login de admin con el slug
        setTimeout(() => {
          navigate('/admin/login', { state: { tenant_slug: tenantSlug } });
        }, 2000);
      }
    } catch (error) {
      console.error('Error al registrar empresa:', error);
      const mensaje = error.response?.data?.message || 'Error al registrar la empresa';
      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <svg className="h-8 w-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900">SmartPYME</span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Volver al Inicio
            </button>
          </div>
        </div>
      </nav>

      {/* Formulario de Registro */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Registra tu Empresa
            </h1>
            <p className="text-gray-600 text-lg">
              Completa el formulario para comenzar a usar SmartPYME
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Selección de Plan */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Selecciona tu Plan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {planes.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all ${
                      formData.plan === plan.id
                        ? 'border-black bg-gray-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Más Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.nombre}</h3>
                      <p className="text-3xl font-bold text-gray-900">{plan.precio}</p>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.caracteristicas.map((caracteristica, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{caracteristica}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {formData.plan === plan.id && (
                      <div className="mt-4 text-center">
                        <span className="inline-block bg-black text-white px-4 py-2 rounded-md text-sm font-semibold">
                          ✓ Seleccionado
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Datos de la Empresa */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Información de la Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    value={formData.nombre_empresa}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Mi Empresa S.A."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de la Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email_empresa"
                    value={formData.email_empresa}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de la Empresa
                  </label>
                  <input
                    type="tel"
                    name="telefono_empresa"
                    value={formData.telefono_empresa}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+58 412 1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de la Empresa
                  </label>
                  <input
                    type="text"
                    name="direccion_empresa"
                    value={formData.direccion_empresa}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Calle Principal, Caracas"
                  />
                </div>
              </div>
            </div>

            {/* Datos del Administrador */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Datos del Administrador
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_admin"
                    value={formData.nombre_admin}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido_admin"
                    value={formData.apellido_admin}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Administrador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email_admin"
                    value={formData.email_admin}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="admin@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono del Administrador
                  </label>
                  <input
                    type="tel"
                    name="telefono_admin"
                    value={formData.telefono_admin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+58 424 1234567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Repite tu contraseña"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Empresa'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="flex-1 bg-white text-black border-2 border-black px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-50 transition-all"
              >
                Ya tengo cuenta
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 SmartPYME. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegistroEmpresa;
