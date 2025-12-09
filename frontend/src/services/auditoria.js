import api from './api';

/**
 * Servicio de Auditoría (RF-12)
 * Gestiona las consultas al sistema de auditoría
 */

/**
 * Obtener registros de auditoría con filtros
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise} Registros de auditoría
 */
export const getAuditoria = async (filters = {}) => {
    try {
        const response = await api.get('/auditoria', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo auditoría:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas de auditoría
 * @returns {Promise} Estadísticas
 */
export const getEstadisticas = async () => {
    try {
        const response = await api.get('/auditoria/estadisticas');
        return response.data;
    } catch (error) {
        console.error('Error obteniendo estadísticas de auditoría:', error);
        throw error;
    }
};

/**
 * Obtener historial de un usuario
 * @param {Number} usuarioId - ID del usuario
 * @param {Number} limit - Límite de registros
 * @returns {Promise} Historial del usuario
 */
export const getHistorialUsuario = async (usuarioId, limit = 50) => {
    try {
        const response = await api.get(`/auditoria/usuario/${usuarioId}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo historial de usuario:', error);
        throw error;
    }
};

/**
 * Obtener registros por módulo
 * @param {String} modulo - Nombre del módulo
 * @param {Number} limit - Límite de registros
 * @returns {Promise} Registros del módulo
 */
export const getByModulo = async (modulo, limit = 100) => {
    try {
        const response = await api.get(`/auditoria/modulo/${modulo}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error obteniendo registros por módulo:', error);
        throw error;
    }
};

/**
 * Exportar registros a CSV
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise} Blob del archivo CSV
 */
export const exportCSV = async (filters = {}) => {
    try {
        const response = await api.get('/auditoria/export', {
            params: filters,
            responseType: 'blob'
        });

        // Crear link de descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `auditoria_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    } catch (error) {
        console.error('Error exportando auditoría:', error);
        throw error;
    }
};

/**
 * Limpiar registros antiguos
 * @param {Number} dias - Días de retención
 * @returns {Promise} Resultado de la limpieza
 */
export const cleanup = async (dias = 90) => {
    try {
        const response = await api.delete('/auditoria/cleanup', {
            data: { dias }
        });
        return response.data;
    } catch (error) {
        console.error('Error limpiando registros:', error);
        throw error;
    }
};
