import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const DarkModeToggle = ({ className = '' }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔄 Click en botón modo oscuro');
    console.log('   Estado actual:', darkMode ? 'OSCURO' : 'CLARO');
    console.log('   Cambiando a:', !darkMode ? 'OSCURO' : 'CLARO');
    toggleDarkMode();
  };

  console.log('🎨 DarkModeToggle renderizado - darkMode:', darkMode);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
        darkMode 
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white shadow-lg' 
          : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900 shadow-md'
      } ${className}`}
      title={darkMode ? 'Cambiar a modo claro ☀️' : 'Cambiar a modo oscuro 🌙'}
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {darkMode ? (
        <>
          <SunIcon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Oscuro</span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;
