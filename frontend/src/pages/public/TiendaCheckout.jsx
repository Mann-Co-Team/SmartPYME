import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { crearPedido } from '../../services/pedidos';
import LoadingSpinner from '../../components/LoadingSpinner';
import DarkModeToggle from '../../components/DarkModeToggle';
import api from '../../services/api';

const TiendaCheckout = () => {
  const navigate = useNavigate();
  const { tenant_slug } = useParams();
  const { items, getTotal, clearCart } = useCart();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTenant, setLoadingTenant] = useState(true);
  const [formData, setFormData] = useState({
    direccion_entrega: '',
    metodo_entrega: 'pickup',
    metodo_pago: 'efectivo',
    notas: ''
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await api.get(`/tenants/slug/${tenant_slug}`);
        setTenant(response.data.data);
      } catch (error) {
        console.error('Error cargando tenant:', error);
        toast.error('Tienda no encontrada');
        navigate('/');
      } finally {
        setLoadingTenant(false);
      }
    };

    fetchTenant();
  }, [tenant_slug, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
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

    // Validar que haya items en el carrito
    if (items.length === 0) {
      toast.error('No hay productos en el carrito');
      return;
    }

    // Validar dirección si es delivery
    if (formData.metodo_entrega === 'delivery' && !formData.direccion_entrega.trim()) {
      toast.error('Debe ingresar una dirección de entrega para delivery');
      return;
    }

    setLoading(true);

    try {
      // Obtener datos del usuario desde localStorage
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user || !user.id) {
        toast.error('Debe iniciar sesión para realizar un pedido');
        navigate(`/tienda/${tenant_slug}/login`);
        return;
      }

      // VALIDACIÓN MULTI-TENANT: Verificar que el usuario pertenezca a esta tienda
      if (tenant && user.id_tenant && user.id_tenant !== tenant.id_tenant) {
        toast.error(
          `Esta cuenta pertenece a otra tienda. Por favor, inicia sesión con una cuenta de ${tenant.nombre_empresa} o crea una nueva cuenta.`,
          { duration: 6000 }
        );
        // Limpiar sesión actual y redirigir al login de esta tienda
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate(`/tienda/${tenant_slug}/login`);
        return;
      }

      // Preparar datos del pedido
      const pedidoData = {
        id_usuario_cliente: user.id,
        items: items.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.quantity,
          precio_unitario: item.precio,
          subtotal: item.precio * item.quantity
        })),
        total: getTotal(),
        metodo_pago: formData.metodo_pago,
        notas: formData.notas,
        direccion_entrega: formData.metodo_entrega === 'delivery' ? formData.direccion_entrega : null,
        metodo_entrega: formData.metodo_entrega
      };

      // Crear pedido
      const response = await crearPedido(pedidoData);

      // Mostrar mensaje de éxito con número de pedido
      toast.success(`¡Pedido creado exitosamente! Número: ${response.numero_pedido}`, {
        duration: 5000
      });

      // Limpiar carrito y redirigir a la página de pedidos del tenant
      clearCart();
      navigate(`/tienda/${tenant_slug}/pedidos`);

    } catch (error) {
      console.error('Error creando pedido:', error);

      if (error.response?.data?.message === 'Stock insuficiente, ajuste su pedido') {
        const detalles = error.response.data.detalles;
        let mensaje = 'Stock insuficiente para:\n';
        detalles.forEach(p => {
          mensaje += `\n• ${p.nombre}: solicitado ${p.solicitado}, disponible ${p.disponible}`;
        });
        toast.error(mensaje, { duration: 6000 });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Error de conexión. Intente nuevamente más tarde');
      } else {
        toast.error('Error al crear el pedido. Intente nuevamente');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingTenant) {
    return <LoadingSpinner />;
  }

  if (!tenant) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(`/tienda/${tenant_slug}`)}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300"
            >
              {tenant.nombre_empresa}
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de checkout */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Finalizar Compra
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Método de entrega */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de entrega
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, metodo_entrega: 'pickup' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${formData.metodo_entrega === 'pickup'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">🏪 Retiro en tienda</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gratis</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, metodo_entrega: 'delivery' }))}
                    className={`p-4 rounded-lg border-2 transition-colors ${formData.metodo_entrega === 'delivery'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                      }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">🚚 Delivery</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">A coordinar</p>
                  </button>
                </div>
              </div>

              {/* Dirección (si es delivery) */}
              {formData.metodo_entrega === 'delivery' && (
                <div>
                  <label htmlFor="direccion_entrega" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección de entrega *
                  </label>
                  <textarea
                    id="direccion_entrega"
                    name="direccion_entrega"
                    value={formData.direccion_entrega}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Calle, número, departamento, comuna"
                    required
                  />
                </div>
              )}

              {/* Método de pago */}
              <div>
                <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de pago
                </label>
                <select
                  id="metodo_pago"
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta de crédito/débito</option>
                  <option value="transferencia">🏦 Transferencia bancaria</option>
                </select>
              </div>

              {/* Notas adicionales */}
              <div>
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Instrucciones especiales, horarios de entrega, etc."
                />
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Resumen del Pedido
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No hay productos en el carrito</p>
                <button
                  onClick={() => navigate(`/tienda/${tenant_slug}`)}
                  className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Volver a la tienda
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id_producto} className="flex items-center space-x-4">
                      <img
                        src={item.imagen ? `http://localhost:3000${item.imagen}` : '/placeholder-product.jpg'}
                        alt={item.nombre}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{item.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatPrice(item.precio)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(item.precio * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envío</span>
                    <span>{formData.metodo_entrega === 'pickup' ? 'Gratis' : 'A coordinar'}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiendaCheckout;
