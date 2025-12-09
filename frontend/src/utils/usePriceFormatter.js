import { useState, useEffect } from 'react';
import { formatPriceWithConversion } from './currencyConverter';

/**
 * Hook para formatear precios con conversión automática
 */
export function useFormattedPrice(price) {
    const [formattedPrice, setFormattedPrice] = useState('$0');

    useEffect(() => {
        const userCurrency = localStorage.getItem('userCurrency') || 'CLP';
        const formatted = formatPriceWithConversion(price, userCurrency);
        setFormattedPrice(formatted);

        // Escuchar cambios de moneda
        const handleCurrencyChange = () => {
            const newCurrency = localStorage.getItem('userCurrency') || 'CLP';
            const newFormatted = formatPriceWithConversion(price, newCurrency);
            setFormattedPrice(newFormatted);
        };

        window.addEventListener('currencyChanged', handleCurrencyChange);
        return () => window.removeEventListener('currencyChanged', handleCurrencyChange);
    }, [price]);

    return formattedPrice;
}
