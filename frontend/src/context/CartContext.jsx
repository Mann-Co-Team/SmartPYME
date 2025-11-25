import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTenant, setCurrentTenant] = useState(null);

  // Extraer tenant_slug de la URL
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/tienda\/([^/]+)/);
    const tenantSlug = pathMatch ? pathMatch[1] : null;
    
    // Si cambió el tenant, guardar carrito anterior y cargar el nuevo
    if (tenantSlug !== currentTenant) {
      // Guardar carrito del tenant anterior
      if (currentTenant) {
        localStorage.setItem(`cart_${currentTenant}`, JSON.stringify(items));
      }
      
      // Cargar carrito del nuevo tenant
      if (tenantSlug) {
        const savedCart = localStorage.getItem(`cart_${tenantSlug}`);
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Error cargando carrito:', error);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } else {
        // No estamos en una tienda, vaciar carrito
        setItems([]);
      }
      
      setCurrentTenant(tenantSlug);
    }
  }, [location.pathname]);

  // Guardar carrito en localStorage cuando cambie (solo si hay tenant activo)
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem(`cart_${currentTenant}`, JSON.stringify(items));
    }
  }, [items, currentTenant]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id_producto === product.id_producto);
      
      if (existingItem) {
        toast.success('Cantidad actualizada en el carrito');
        return prev.map(item =>
          item.id_producto === product.id_producto
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success('Producto agregado al carrito');
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(item => item.id_producto !== productId));
    toast.success('Producto eliminado del carrito');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.id_producto === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast.success('Carrito vaciado');
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => setIsOpen(!isOpen);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isOpen,
    toggleCart,
    setIsOpen,
    currentTenant
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
