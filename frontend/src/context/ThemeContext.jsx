import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSettings } from '../services/settings';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    company_name: 'Mi Empresa',
    theme_color: '#3b82f6',
    footer_text: 'Powered by SmartPYME',
    company_phone: '',
    company_email: '',
    company_address: '',
    delivery_enabled: 'true',
    pickup_enabled: 'true',
    min_order_amount: '0'
  });
  
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSettings();
    }
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      // También actualizar CSS variables para colores dinámicos
      if (newSettings.theme_color) {
        document.documentElement.style.setProperty('--color-primary', newSettings.theme_color);
      }
    } catch (error) {
      console.error('Error actualizando configuraciones:', error);
    }
  };

  const value = {
    settings,
    updateSettings,
    loadSettings,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
