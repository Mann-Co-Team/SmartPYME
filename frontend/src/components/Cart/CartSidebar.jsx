import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getTotal } = useCart();
  const { settings } = useTheme();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Carrito de compras
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Items del carrito */}
                      <div className="mt-8">
                        {items.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">Tu carrito está vacío</p>
                          </div>
                        ) : (
                          <div className="flow-root">
                            <ul className="-my-6 divide-y divide-gray-200">
                              {items.map((item) => (
                                <li key={item.id_producto} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                      src={item.imagen ? `http://localhost:5000${item.imagen}` : '/placeholder-product.jpg'}
                                      alt={item.nombre}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.nombre}</h3>
                                        <p className="ml-4">{formatPrice(item.precio * item.quantity)}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {formatPrice(item.precio)} c/u
                                      </p>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => updateQuantity(item.id_producto, item.quantity - 1)}
                                          className="p-1 rounded-md hover:bg-gray-100"
                                        >
                                          <MinusIcon className="h-4 w-4" />
                                        </button>
                                        <span className="font-medium">{item.quantity}</span>
                                        <button
                                          onClick={() => updateQuantity(item.id_producto, item.quantity + 1)}
                                          className="p-1 rounded-md hover:bg-gray-100"
                                        >
                                          <PlusIcon className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id_producto)}
                                        className="font-medium text-red-600 hover:text-red-500"
                                      >
                                        <TrashIcon className="h-4 w-4" />
                                      </button>
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
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Total</p>
                          <p>{formatPrice(getTotal())}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Envío calculado al finalizar compra
                        </p>
                        <div className="mt-6">
                          <button className="btn-primary w-full">
                            Proceder al pago
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <p>
                            o{' '}
                            <button
                              type="button"
                              className="font-medium text-primary-600 hover:text-primary-500"
                              onClick={() => setIsOpen(false)}
                            >
                              Continuar comprando
                            </button>
                          </p>
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
