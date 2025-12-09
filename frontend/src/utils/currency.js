/**
 * Formatea un número como moneda según el código de moneda especificado
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (CLP, USD, EUR, etc.)
 * @returns {string} - Cantidad formateada con símbolo de moneda
 */
export const formatCurrency = (amount, currency = 'CLP') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '-';
    }

    const currencyConfig = {
        CLP: { symbol: '$', locale: 'es-CL', decimals: 0 },
        USD: { symbol: '$', locale: 'en-US', decimals: 2 },
        EUR: { symbol: '€', locale: 'de-DE', decimals: 2 },
        ARS: { symbol: '$', locale: 'es-AR', decimals: 2 },
        BRL: { symbol: 'R$', locale: 'pt-BR', decimals: 2 },
        MXN: { symbol: '$', locale: 'es-MX', decimals: 2 }
    };

    const config = currencyConfig[currency] || currencyConfig.CLP;

    try {
        const formatted = new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals
        }).format(amount);

        return formatted;
    } catch (error) {
        // Fallback si hay error con Intl
        const decimals = config.decimals;
        const formattedAmount = Number(amount).toFixed(decimals);
        return `${config.symbol}${formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
};

/**
 * Calcula el impuesto (IVA) sobre un monto
 * @param {number} amount - Monto base
 * @param {number} taxRate - Tasa de impuesto (ej: 19 para 19%)
 * @returns {number} - Monto del impuesto
 */
export const calculateTax = (amount, taxRate = 19) => {
    if (!amount || !taxRate) return 0;
    return (amount * taxRate) / 100;
};

/**
 * Calcula el total incluyendo impuestos
 * @param {number} subtotal - Subtotal sin impuestos
 * @param {number} taxRate - Tasa de impuesto (ej: 19 para 19%)
 * @returns {number} - Total con impuestos
 */
export const calculateTotal = (subtotal, taxRate = 19) => {
    if (!subtotal) return 0;
    const tax = calculateTax(subtotal, taxRate);
    return subtotal + tax;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
export const formatNumber = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default {
    formatCurrency,
    calculateTax,
    calculateTotal,
    formatNumber
};
