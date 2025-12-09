/**
 * RF-15: Servicio de Productos con Recuperación ante Errores
 * Implementa reintentos automáticos en operaciones críticas
 */
import api from './api';
import { retryOperation, getErrorMessage } from '../utils/retryHandler';

/**
 * Obtiene todos los productos con reintentos automáticos
 */
export const getProductos = async () => {
    return retryOperation(
        async () => {
            const response = await api.get('/productos');
            return response.data.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: 'Obtener Productos',
            onRetry: (attempt, error) => {
                console.log(`Reintentando obtener productos (intento ${attempt})...`);
            }
        }
    );
};

/**
 * Obtiene un producto específico con reintentos
 */
export const getProducto = async (id) => {
    return retryOperation(
        async () => {
            const response = await api.get(`/productos/${id}`);
            return response.data.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: `Obtener Producto ${id}`
        }
    );
};

/**
 * Crea un producto con reintentos
 * Solo reintenta en errores de red, no en errores de validación
 */
export const createProducto = async (formData) => {
    return retryOperation(
        async () => {
            const response = await api.post('/productos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: 'Crear Producto',
            shouldRetry: (error) => {
                // No reintentar en errores de validación (400, 422)
                if (error.response) {
                    const status = error.response.status;
                    return status >= 500 || !status; // Solo errores de servidor o red
                }
                return true; // Reintentar errores de red
            }
        }
    );
};

/**
 * Actualiza un producto con reintentos
 */
export const updateProducto = async (id, formData) => {
    return retryOperation(
        async () => {
            const response = await api.put(`/productos/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: `Actualizar Producto ${id}`,
            shouldRetry: (error) => {
                if (error.response) {
                    const status = error.response.status;
                    return status >= 500 || !status;
                }
                return true;
            }
        }
    );
};

/**
 * Elimina un producto con reintentos
 */
export const deleteProducto = async (id) => {
    return retryOperation(
        async () => {
            const response = await api.delete(`/productos/${id}`);
            return response.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: `Eliminar Producto ${id}`
        }
    );
};

/**
 * Activa/desactiva un producto con reintentos
 */
export const toggleProductoActive = async (id) => {
    return retryOperation(
        async () => {
            const response = await api.patch(`/productos/${id}/toggle-active`);
            return response.data;
        },
        {
            maxRetries: 3,
            delay: 1000,
            operationName: `Toggle Producto ${id}`
        }
    );
};

/**
 * Helper para manejar errores y mostrar mensaje apropiado
 */
export function handleProductoError(error, operation = 'operación') {
    console.error(`Error en ${operation}:`, error);

    // Determinar mensaje basado en el tipo de error
    if (error.response) {
        const status = error.response.status;

        switch (status) {
            case 400:
            case 422:
                return error.response.data.message || 'Datos inválidos';
            case 401:
                return 'No autorizado';
            case 403:
                return 'No tiene permisos para esta acción';
            case 404:
                return 'Producto no encontrado';
            case 500:
            case 502:
            case 503:
                return 'Error temporal, intente nuevamente';
            default:
                return 'Error en la operación';
        }
    }

    // Error de red
    return 'Error temporal, intente nuevamente';
}
