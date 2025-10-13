import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import CartSidebar from '../Cart/CartSidebar';

const PublicLayout = ({ children }) => {
  const { settings } = useTheme();
  const { getItemCount, toggleCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y nombre */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {settings.company_name}
              </h1>
            </div>

            {/* Carrito */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            {settings.company_phone && (
              <p className="text-gray-600 mb-2">
                Teléfono: {settings.company_phone}
              </p>
            )}
            {settings.company_address && (
              <p className="text-gray-600 mb-4">
                {settings.company_address}
              </p>
            )}
            <p className="text-gray-500 text-sm">
              {settings.footer_text}
            </p>
          </div>
        </div>
      </footer>

      {/* Carrito lateral */}
      <CartSidebar />
    </div>
  );
};

export default PublicLayout;
