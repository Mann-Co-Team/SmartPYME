import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { crearPedido } from '../../services/pedidos';
import LoadingSpinner from '../../components/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    direccion_entrega: '',
    metodo_entrega: 'pickup',
    metodo_pago: 'efectivo',
    notas: ''
  });

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
        navigate('/login');
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

      // Limpiar carrito y redirigir
      clearCart();
      navigate('/pedidos');
      
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

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos antes de proceder al checkout
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Ver Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Método de Entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Entrega *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 ${
                  formData.metodo_entrega === 'pickup' 
                    ? 'border-primary-500 ring-2 ring-primary-500' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="metodo_entrega"
                    value="pickup"
                    checked={formData.metodo_entrega === 'pickup'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col w-full">
                    <span className="block text-sm font-medium text-gray-900">
                      Retiro en Tienda
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      Gratis
                    </span>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 ${
                  formData.metodo_entrega === 'delivery' 
                    ? 'border-primary-500 ring-2 ring-primary-500' 
                    : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="metodo_entrega"
                    value="delivery"
                    checked={formData.metodo_entrega === 'delivery'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col w-full">
                    <span className="block text-sm font-medium text-gray-900">
                      Delivery
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      Por calcular
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Dirección de Entrega */}
            {formData.metodo_entrega === 'delivery' && (
              <div>
                <label htmlFor="direccion_entrega" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de Entrega *
                </label>
                <textarea
                  id="direccion_entrega"
                  name="direccion_entrega"
                  rows="3"
                  value={formData.direccion_entrega}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Calle, número, comuna, ciudad"
                  required={formData.metodo_entrega === 'delivery'}
                />
              </div>
            )}

            {/* Método de Pago */}
            <div>
              <label htmlFor="metodo_pago" className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago *
              </label>
              <select
                id="metodo_pago"
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta de Débito/Crédito</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>

            {/* Notas */}
            <div>
              <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notas"
                name="notas"
                rows="3"
                value={formData.notas}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Instrucciones especiales, horario preferido, etc."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Volver
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Confirmar Pedido'}
              </button>
            </div>
          </form>
        </div>

        {/* Resumen del Pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Resumen del Pedido
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id_producto} className="flex gap-3">
                  <img
                    src={item.imagen ? `http://localhost:5000${item.imagen}` : '/placeholder-product.jpg'}
                    alt={item.nombre}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatPrice(item.precio)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.precio * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">
                  {formData.metodo_entrega === 'pickup' ? 'Gratis' : 'Por calcular'}
                </span>
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Se validará la disponibilidad de stock antes de confirmar tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
