// Conversor de monedas con tasas de cambio exactas
const CACHE_KEY = 'exchange_rates';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// Tasas exactas proporcionadas por el usuario
const EXCHANGE_RATES = {
    CLP: 1,
    USD: 0.0011,    // 1 CLP = 0.0011 USD
    EUR: 0.00093,   // 1 CLP = 0.00093 EUR
    ARS: 1.58,      // 1 CLP = 1.58 ARS
    BRL: 0.0058,    // 1 CLP = 0.0058 BRL
    MXN: 0.020      // 1 CLP = 0.020 MXN
};

/**
 * Convertir monto entre monedas
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    // Si la moneda origen es CLP, conversión directa
    if (fromCurrency === 'CLP') {
        return amount * (EXCHANGE_RATES[toCurrency] || 1);
    }

    // Si no, convertir primero a CLP y luego a la moneda destino
    const inCLP = amount / (EXCHANGE_RATES[fromCurrency] || 1);
    return inCLP * (EXCHANGE_RATES[toCurrency] || 1);
}

/**
 * Formatear precio con conversión automática
 */
export function formatPriceWithConversion(amount, targetCurrency = 'CLP') {
    const converted = convertCurrency(amount, 'CLP', targetCurrency);

    const locales = {
        CLP: 'es-CL',
        USD: 'en-US',
        EUR: 'de-DE',
        ARS: 'es-AR',
        BRL: 'pt-BR',
        MXN: 'es-MX'
    };

    const locale = locales[targetCurrency] || 'es-CL';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: targetCurrency,
        minimumFractionDigits: targetCurrency === 'CLP' ? 0 : 2,
        maximumFractionDigits: targetCurrency === 'CLP' ? 0 : 2
    }).format(converted);
}

export default {
    convertCurrency,
    formatPriceWithConversion
};
