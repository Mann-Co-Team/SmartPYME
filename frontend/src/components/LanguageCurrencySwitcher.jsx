import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageCurrencySwitcher = () => {
    const { i18n, t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const [userCurrency, setUserCurrency] = useState(
        localStorage.getItem('userCurrency') || 'CLP'
    );

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
        setShowMenu(false);
    };

    const handleCurrencyChange = (currency) => {
        setUserCurrency(currency);
        localStorage.setItem('userCurrency', currency);
        // Disparar evento para que los componentes se actualicen
        window.dispatchEvent(new Event('currencyChanged'));
        setShowMenu(false);
    };

    const currencies = [
        { code: 'CLP', symbol: '$', name: t('currencies.clp') },
        { code: 'USD', symbol: '$', name: t('currencies.usd') },
        { code: 'EUR', symbol: '€', name: t('currencies.eur') },
        { code: 'ARS', symbol: '$', name: t('currencies.ars') },
        { code: 'BRL', symbol: 'R$', name: t('currencies.brl') },
        { code: 'MXN', symbol: '$', name: t('currencies.mxn') }
    ];

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const currentCurrency = currencies.find(c => c.code === userCurrency) || currencies[0];
    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <GlobeAltIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentLanguage.code.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {currentCurrency.code}
                </span>
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                        <div className="p-2">
                            {/* Idioma */}
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                                {t('common.language')}
                            </div>
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span className="font-medium">{lang.name}</span>
                                    {i18n.language === lang.code && (
                                        <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                                    )}
                                </button>
                            ))}

                            <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                            {/* Moneda */}
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                                {t('common.currency')}
                            </div>
                            {currencies.map(currency => (
                                <button
                                    key={currency.code}
                                    onClick={() => handleCurrencyChange(currency.code)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${userCurrency === currency.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <span className="font-medium">{currency.symbol} {currency.code}</span>
                                    <span className="text-xs">{currency.name}</span>
                                    {userCurrency === currency.code && (
                                        <span className="ml-2 text-blue-600 dark:text-blue-400">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageCurrencySwitcher;
