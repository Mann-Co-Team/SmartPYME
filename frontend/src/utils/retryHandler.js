/**
 * RF-15: Recuperación ante Errores del Sistema
 * Utility para reintentar operaciones fallidas automáticamente
 */

/**
 * Ejecuta una operación con reintentos automáticos
 * @param {Function} operation - Función async a ejecutar
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxRetries - Número máximo de reintentos (default: 3)
 * @param {number} options.delay - Delay entre reintentos en ms (default: 1000)
 * @param {Function} options.onRetry - Callback cuando se reintenta
 * @param {Function} options.shouldRetry - Función para determinar si se debe reintentar
 * @returns {Promise} - Resultado de la operación
 */
export async function retryOperation(operation, options = {}) {
    const {
        maxRetries = 3,
        delay = 1000,
        onRetry = null,
        shouldRetry = () => true,
        operationName = 'Operación'
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Intentar ejecutar la operación
            const result = await operation();

            // Si llegamos aquí, la operación fue exitosa
            if (attempt > 1) {
                console.log(`✅ ${operationName} exitosa después de ${attempt} intentos`);
                logIncident({
                    type: 'RETRY_SUCCESS',
                    operation: operationName,
                    attempts: attempt,
                    timestamp: new Date().toISOString()
                });
            }

            return result;

        } catch (error) {
            lastError = error;

            // Log del intento fallido
            console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló para ${operationName}:`, error.message);

            // Verificar si debemos reintentar
            if (attempt < maxRetries && shouldRetry(error)) {
                // Callback de reintento
                if (onRetry) {
                    onRetry(attempt, error);
                }

                // Log del reintento
                logIncident({
                    type: 'RETRY_ATTEMPT',
                    operation: operationName,
                    attempt,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });

                // Esperar antes del siguiente intento (con backoff exponencial)
                const waitTime = delay * Math.pow(2, attempt - 1);
                await sleep(waitTime);

            } else {
                // No más reintentos o error no recuperable
                break;
            }
        }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    console.error(`❌ ${operationName} falló después de ${maxRetries} intentos`);

    logIncident({
        type: 'RETRY_FAILED',
        operation: operationName,
        attempts: maxRetries,
        error: lastError.message,
        timestamp: new Date().toISOString()
    });

    // Lanzar el último error
    throw lastError;
}

/**
 * Helper para esperar un tiempo determinado
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Registra incidentes en el log del sistema
 */
function logIncident(incident) {
    // Obtener logs existentes
    const logs = getIncidentLogs();

    // Agregar nuevo incidente
    logs.push(incident);

    // Mantener solo los últimos 100 incidentes
    const recentLogs = logs.slice(-100);

    // Guardar en localStorage
    try {
        localStorage.setItem('system_incidents', JSON.stringify(recentLogs));
    } catch (error) {
        console.error('Error guardando log de incidentes:', error);
    }

    // También enviar a consola para debugging
    console.log('📋 Incidente registrado:', incident);
}

/**
 * Obtiene el historial de incidentes
 */
export function getIncidentLogs() {
    try {
        const logs = localStorage.getItem('system_incidents');
        return logs ? JSON.parse(logs) : [];
    } catch (error) {
        console.error('Error leyendo logs de incidentes:', error);
        return [];
    }
}

/**
 * Limpia el historial de incidentes
 */
export function clearIncidentLogs() {
    try {
        localStorage.removeItem('system_incidents');
        console.log('✅ Logs de incidentes limpiados');
    } catch (error) {
        console.error('Error limpiando logs:', error);
    }
}

/**
 * Wrapper para fetch con reintentos automáticos
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
    const operation = async () => {
        const response = await fetch(url, options);

        // Si la respuesta no es OK, lanzar error
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
            error.status = response.status;
            error.response = response;
            throw error;
        }

        return response;
    };

    // Determinar si debemos reintentar basado en el código de estado
    const shouldRetry = (error) => {
        // Reintentar solo en errores de red o errores 5xx del servidor
        if (!error.status) return true; // Error de red
        return error.status >= 500 && error.status < 600; // Error del servidor
    };

    return retryOperation(operation, {
        ...retryOptions,
        shouldRetry,
        operationName: `Fetch ${options.method || 'GET'} ${url}`
    });
}

/**
 * Exportar función de utilidad para mostrar mensaje de error al usuario
 */
export function getErrorMessage(error, attempts) {
    if (attempts >= 3) {
        return 'Error temporal, intente nuevamente';
    }
    return error.message || 'Ha ocurrido un error';
}
