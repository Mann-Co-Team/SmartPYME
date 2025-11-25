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
  
  // Estado de modo oscuro - inicia en false (modo claro)
  const [darkMode, setDarkMode] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  // Cargar preferencia guardada al montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        const isDark = JSON.parse(saved);
        setDarkMode(isDark);
        console.log('📥 Preferencia cargada:', isDark ? 'OSCURO' : 'CLARO');
      } else {
        console.log('📥 No hay preferencia guardada, usando MODO CLARO');
      }
    } catch (error) {
      console.error('❌ Error al leer darkMode:', error);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSettings();
    }
  }, []);

  // Aplicar cambios cuando darkMode cambia
  useEffect(() => {
    const root = document.documentElement;
    
    if (darkMode) {
      root.classList.add('dark');
      console.log('🌙 MODO OSCURO APLICADO');
    } else {
      root.classList.remove('dark');
      console.log('☀️ MODO CLARO APLICADO');
    }
    
    // Guardar en localStorage
    try {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      console.log('💾 Preferencia guardada:', darkMode ? 'OSCURO' : 'CLARO');
    } catch (error) {
      console.error('❌ Error al guardar darkMode:', error);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    console.log('🔄 TOGGLE llamado - Estado antes:', darkMode ? 'OSCURO' : 'CLARO');
    setDarkMode(prev => {
      const newValue = !prev;
      console.log('🔄 TOGGLE cambiando a:', newValue ? 'OSCURO' : 'CLARO');
      return newValue;
    });
  };

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
    loading,
    darkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
