import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPriceWithConversion } from '../../utils/currencyConverter';

const CartSidebar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal, currentTenant } = useCart();
  const { settings } = useTheme();
  const [, forceUpdate] = useState();

  const formatPrice = (price) => {
    const userCurrency = localStorage.getItem('userCurrency') || 'CLP';
    return formatPriceWithConversion(price, userCurrency);
  };

  // Escuchar cambios de moneda
  useEffect(() => {
    const handleCurrencyChange = () => {
      forceUpdate({});
    };
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
  }, []);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-all" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                          🛒 {t('store.cart.title')}
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Items del carrito */}
                      <div className="mt-6">
                        {items.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('store.cart.empty')}</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('store.cart.emptySubtitle')}</p>
                          </div>
                        ) : (
                          <div className="flow-root">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {items.map((item) => (
                                <li key={item.id_producto} className="flex gap-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded-lg transition-colors">
                                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
                                    <img
                                      src={item.imagen ? `http://localhost:3000${item.imagen}` : '/placeholder-product.jpg'}
                                      alt={item.nombre}
                                      className="h-full w-full object-cover object-center"
                                      onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo img%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>

                                  <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                      <div className="flex justify-between">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                          {item.nombre}
                                        </h3>
                                        <button
                                          type="button"
                                          onClick={() => removeItem(item.id_producto)}
                                          className="ml-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                          title="Eliminar producto"
                                        >
                                          <TrashIcon className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {formatPrice(item.precio)} {t('store.cart.each')}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                        <button
                                          onClick={() => updateQuantity(item.id_producto, item.quantity - 1)}
                                          className="p-1 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                          disabled={item.quantity <= 1}
                                        >
                                          <MinusIcon className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <span className="font-semibold text-sm min-w-[20px] text-center text-gray-900 dark:text-white">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.id_producto, item.quantity + 1)}
                                          className="p-1 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors"
                                        >
                                          <PlusIcon className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                        </button>
                                      </div>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatPrice(item.precio * item.quantity)}
                                      </p>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer con total y botón de pago */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-6 sm:px-6">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{t('store.cart.subtotal')} ({items.reduce((acc, item) => acc + item.quantity, 0)} {items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? t('store.cart.product') : t('store.cart.products')})</span>
                            <span>{formatPrice(getTotal())}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{t('store.cart.shipping')}</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">{t('store.cart.shippingCalculated')}</span>
                          </div>
                        </div>

                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-4">
                          <span>{t('store.cart.total')}</span>
                          <span>{formatPrice(getTotal())}</span>
                        </div>

                        <div className="mt-6">
                          <button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                            onClick={() => {
                              setIsOpen(false);
                              if (currentTenant) {
                                navigate(`/tienda/${currentTenant}/checkout`);
                              } else {
                                navigate('/checkout');
                              }
                            }}
                          >
                            <span>{t('store.cart.checkout')}</span>
                            <span>→</span>
                          </button>
                        </div>
                        <div className="mt-4 flex justify-center text-center text-sm">
                          <button
                            type="button"
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
                            onClick={() => setIsOpen(false)}
                          >
                            ← {t('store.cart.continueShopping')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CartSidebar;
