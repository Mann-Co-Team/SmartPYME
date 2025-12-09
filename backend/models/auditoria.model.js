const db = require('../config/db');

/**
 * Modelo para gestión de auditoría del sistema (RF-12)
 * Registra todas las acciones importantes de usuarios autenticados
 */
class AuditoriaModel {
    /**
     * Crear un nuevo registro de auditoría
     * @param {Object} auditData - Datos de la auditoría
     * @returns {Promise<Object>} Registro creado
     */
    static async create(auditData) {
        try {
            const {
                id_tenant,
                id_usuario,
                accion,
                modulo,
                descripcion = null,
                tabla_afectada = null,
                id_registro = null,
                datos_anteriores = null,
                datos_nuevos = null,
                ip_address = null,
                user_agent = null,
                resultado = 'exito',
                mensaje_error = null
            } = auditData;

            const [result] = await db.execute(
                `INSERT INTO auditoria (
                    id_tenant, id_usuario, accion, modulo, descripcion,
                    tabla_afectada, id_registro, datos_anteriores, datos_nuevos,
                    ip_address, user_agent, resultado, mensaje_error
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_tenant,
                    id_usuario,
                    accion,
                    modulo,
                    descripcion,
                    tabla_afectada,
                    id_registro,
                    datos_anteriores ? JSON.stringify(datos_anteriores) : null,
                    datos_nuevos ? JSON.stringify(datos_nuevos) : null,
                    ip_address,
                    user_agent,
                    resultado,
                    mensaje_error
                ]
            );

            return {
                id_auditoria: result.insertId,
                ...auditData
            };
        } catch (error) {
            console.error('Error creando registro de auditoría:', error);
            throw error;
        }
    }

    /**
     * Obtener registros de auditoría con filtros
     * @param {Number} tenantId - ID del tenant
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Array>} Lista de registros
     */
    static async getAll(tenantId, filters = {}) {
        try {
            let query = `
                SELECT 
                    a.*,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido,
                    u.email as usuario_email
                FROM auditoria a
                LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
                WHERE a.id_tenant = ?
            `;
            const params = [tenantId];

            // Filtro por usuario
            if (filters.id_usuario) {
                query += ` AND a.id_usuario = ?`;
                params.push(filters.id_usuario);
            }

            // Filtro por módulo
            if (filters.modulo) {
                query += ` AND a.modulo = ?`;
                params.push(filters.modulo);
            }

            // Filtro por acción
            if (filters.accion) {
                query += ` AND a.accion = ?`;
                params.push(filters.accion);
            }

            // Filtro por resultado
            if (filters.resultado) {
                query += ` AND a.resultado = ?`;
                params.push(filters.resultado);
            }

            // Filtro por rango de fechas
            if (filters.fecha_inicio) {
                query += ` AND DATE(a.created_at) >= ?`;
                params.push(filters.fecha_inicio);
            }
            if (filters.fecha_fin) {
                query += ` AND DATE(a.created_at) <= ?`;
                params.push(filters.fecha_fin);
            }

            // Búsqueda global
            if (filters.search) {
                query += ` AND (
                    a.descripcion LIKE ? OR
                    a.accion LIKE ? OR
                    u.nombre LIKE ? OR
                    u.email LIKE ?
                )`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            // Ordenamiento
            query += ` ORDER BY a.created_at DESC`;

            // Paginación - usar valores directos en lugar de parámetros preparados
            // porque MySQL no acepta LIMIT/OFFSET como parámetros en algunas versiones
            if (filters.limit) {
                const limit = parseInt(filters.limit) || 50;
                const offset = parseInt(filters.offset) || 0;
                query += ` LIMIT ${limit} OFFSET ${offset}`;
            }

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error obteniendo registros de auditoría:', error);
            throw error;
        }
    }

    /**
     * Contar registros de auditoría con filtros
     * @param {Number} tenantId - ID del tenant
     * @param {Object} filters - Filtros opcionales
     * @returns {Promise<Number>} Total de registros
     */
    static async count(tenantId, filters = {}) {
        try {
            let query = `
                SELECT COUNT(*) as total
                FROM auditoria a
                LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
                WHERE a.id_tenant = ?
            `;
            const params = [tenantId];

            // Aplicar los mismos filtros que en getAll
            if (filters.id_usuario) {
                query += ` AND a.id_usuario = ?`;
                params.push(filters.id_usuario);
            }
            if (filters.modulo) {
                query += ` AND a.modulo = ?`;
                params.push(filters.modulo);
            }
            if (filters.accion) {
                query += ` AND a.accion = ?`;
                params.push(filters.accion);
            }
            if (filters.resultado) {
                query += ` AND a.resultado = ?`;
                params.push(filters.resultado);
            }
            if (filters.fecha_inicio) {
                query += ` AND DATE(a.created_at) >= ?`;
                params.push(filters.fecha_inicio);
            }
            if (filters.fecha_fin) {
                query += ` AND DATE(a.created_at) <= ?`;
                params.push(filters.fecha_fin);
            }
            if (filters.search) {
                query += ` AND (
                    a.descripcion LIKE ? OR
                    a.accion LIKE ? OR
                    u.nombre LIKE ? OR
                    u.email LIKE ?
                )`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].total;
        } catch (error) {
            console.error('Error contando registros de auditoría:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de un usuario específico
     * @param {Number} tenantId - ID del tenant
     * @param {Number} usuarioId - ID del usuario
     * @param {Number} limit - Límite de registros
     * @returns {Promise<Array>} Historial del usuario
     */
    static async getByUsuario(tenantId, usuarioId, limit = 50) {
        try {
            const [rows] = await db.execute(
                `SELECT 
                    a.*,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido,
                    u.email as usuario_email
                FROM auditoria a
                LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
                WHERE a.id_tenant = ? AND a.id_usuario = ?
                ORDER BY a.created_at DESC
                LIMIT ?`,
                [tenantId, usuarioId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error obteniendo historial de usuario:', error);
            throw error;
        }
    }

    /**
     * Obtener registros por módulo
     * @param {Number} tenantId - ID del tenant
     * @param {String} modulo - Nombre del módulo
     * @param {Number} limit - Límite de registros
     * @returns {Promise<Array>} Registros del módulo
     */
    static async getByModulo(tenantId, modulo, limit = 100) {
        try {
            const [rows] = await db.execute(
                `SELECT 
                    a.*,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido,
                    u.email as usuario_email
                FROM auditoria a
                LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
                WHERE a.id_tenant = ? AND a.modulo = ?
                ORDER BY a.created_at DESC
                LIMIT ?`,
                [tenantId, modulo, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error obteniendo registros por módulo:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de auditoría
     * @param {Number} tenantId - ID del tenant
     * @returns {Promise<Object>} Estadísticas
     */
    static async getEstadisticas(tenantId) {
        try {
            const [stats] = await db.execute(
                `SELECT 
                    COUNT(*) as total_registros,
                    SUM(CASE WHEN resultado = 'exito' THEN 1 ELSE 0 END) as total_exitos,
                    SUM(CASE WHEN resultado = 'fallo' THEN 1 ELSE 0 END) as total_fallos,
                    COUNT(DISTINCT id_usuario) as usuarios_activos,
                    COUNT(DISTINCT modulo) as modulos_utilizados,
                    COUNT(DISTINCT DATE(created_at)) as dias_con_actividad
                FROM auditoria
                WHERE id_tenant = ?`,
                [tenantId]
            );

            const [porModulo] = await db.execute(
                `SELECT 
                    modulo,
                    COUNT(*) as total
                FROM auditoria
                WHERE id_tenant = ?
                GROUP BY modulo
                ORDER BY total DESC`,
                [tenantId]
            );

            const [porAccion] = await db.execute(
                `SELECT 
                    accion,
                    COUNT(*) as total
                FROM auditoria
                WHERE id_tenant = ?
                GROUP BY accion
                ORDER BY total DESC
                LIMIT 10`,
                [tenantId]
            );

            const [usuariosMasActivos] = await db.execute(
                `SELECT 
                    u.nombre,
                    u.apellido,
                    u.email,
                    COUNT(*) as total_acciones
                FROM auditoria a
                JOIN usuarios u ON a.id_usuario = u.id_usuario
                WHERE a.id_tenant = ?
                GROUP BY u.id_usuario, u.nombre, u.apellido, u.email
                ORDER BY total_acciones DESC
                LIMIT 5`,
                [tenantId]
            );

            return {
                resumen: stats[0],
                por_modulo: porModulo,
                por_accion: porAccion,
                usuarios_mas_activos: usuariosMasActivos
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas de auditoría:', error);
            throw error;
        }
    }

    /**
     * Limpiar registros antiguos (opcional)
     * @param {Number} dias - Días de retención
     * @returns {Promise<Number>} Registros eliminados
     */
    static async cleanup(dias = 90) {
        try {
            const [result] = await db.execute(
                `DELETE FROM auditoria 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
                [dias]
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error limpiando registros de auditoría:', error);
            throw error;
        }
    }
}

module.exports = AuditoriaModel;
