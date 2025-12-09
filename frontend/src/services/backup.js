// Servicio API de Backups - COMPLETO CON RESTAURACIÓN
import api from './api';

/**
 * Crear backup manual
 */
export const createBackup = async (tenantOnly = false) => {
    const params = tenantOnly ? '?tenant_only=true' : '';
    const response = await api.post(`/backup/create${params}`);
    return response.data;
};

/**
 * Listar backups
 */
export const getBackups = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.backup_type) params.append('backup_type', filters.backup_type);
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await api.get(`/backup/list?${params.toString()}`);
    return response.data;
};

/**
 * Obtener último backup
 */
export const getLastBackup = async () => {
    const response = await api.get('/backup/last');
    return response.data;
};

/**
 * Descargar backup - ARREGLADO
 */
export const downloadBackup = async (id, filename) => {
    const response = await api.get(`/backup/download/${id}`, {
        responseType: 'blob'
    });

    const downloadFilename = filename || `backup_${id}.sql.gz`;

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
};

/**
 * Eliminar backup
 */
export const deleteBackup = async (id, password) => {
    const response = await api.delete(`/backup/delete/${id}`, {
        data: { password }
    });
    return response.data;
};

/**
 * PASO 1: Restaurar backup a base de datos de prueba
 */
export const restoreToTest = async (id) => {
    const response = await api.post(`/backup/restore-to-test/${id}`);
    return response.data;
};

/**
 * PASO 2: Promover base de datos de prueba a producción
 */
export const promoteToProduction = async (password) => {
    const response = await api.post('/backup/promote-to-production', {
        password
    });
    return response.data;
};

/**
 * Eliminar base de datos de prueba
 */
export const deleteTestDb = async () => {
    const response = await api.delete('/backup/delete-test-db');
    return response.data;
};
