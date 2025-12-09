import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const DarkModeToggleStandalone = ({ className = '' }) => {
    const { t } = useTranslation();
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <button
            type="button"
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-lg border-2 transition-all hover:scale-110 active:scale-95 ${darkMode
                ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-yellow-300 shadow-lg'
                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700 shadow-md'
                } ${className}`}
            title={darkMode ? t('common.switchToLight') : t('common.switchToDark')}
            aria-label={darkMode ? t('common.activateLight') : t('common.activateDark')}
        >
            {darkMode ? (
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </button>
    );
};

export default DarkModeToggleStandalone;
