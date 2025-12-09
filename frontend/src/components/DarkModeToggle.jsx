import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const DarkModeToggle = ({ className = '' }) => {
  const { t } = useTranslation();
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
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${darkMode
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-white shadow-lg'
          : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900 shadow-md'
        } ${className}`}
      title={darkMode ? t('common.switchToLight') : t('common.switchToDark')}
      aria-label={darkMode ? t('common.activateLight') : t('common.activateDark')}
    >
      {darkMode ? (
        <>
          <SunIcon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">{t('common.light')}</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">{t('common.dark')}</span>
        </>
      )}
    </button>
  );
};

export default DarkModeToggle;
