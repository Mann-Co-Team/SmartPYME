import { formatCurrency } from './currency';

/**
 * Hook personalizado para formatear precios con la moneda del sistema
 * @param {object} settings - Configuraciones del sistema (debe incluir currency)
 * @returns {function} - Función para formatear precios
 */
export const useFormatPrice = (settings) => {
    return (price) => {
        const currency = settings?.currency || 'CLP';
        return formatCurrency(price, currency);
    };
};

export default useFormatPrice;
