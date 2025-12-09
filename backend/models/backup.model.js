// Modelo de Backup
const db = require('../config/db');

class BackupModel {
    /**
     * Crear registro de backup
     */
    static async create(backupData) {
        try {
            const {
                id_tenant,
                filename,
                filepath,
                file_size,
                backup_type,
                status,
                error_message,
                created_by
            } = backupData;

            const [result] = await db.execute(
                `INSERT INTO backup_log 
                (id_tenant, filename, filepath, file_size, backup_type, status, error_message, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_tenant, filename, filepath, file_size, backup_type, status, error_message, created_by]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creando registro de backup:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los backups de un tenant
     */
    static async getAll(tenantId, filters = {}) {
        try {
            let query = `
                SELECT 
                    b.*,
                    u.nombre as usuario_nombre,
                    u.apellido as usuario_apellido
                FROM backup_log b
                LEFT JOIN usuarios u ON b.created_by = u.id_usuario
                WHERE b.id_tenant = ?
            `;
            const params = [tenantId];

            // Filtro por tipo
            if (filters.backup_type) {
                query += ` AND b.backup_type = ?`;
                params.push(filters.backup_type);
            }

            // Filtro por estado
            if (filters.status) {
                query += ` AND b.status = ?`;
                params.push(filters.status);
            }

            query += ` ORDER BY b.created_at DESC`;

            // Paginación
            const limit = parseInt(filters.limit) || 50;
            const offset = parseInt(filters.offset) || 0;
            query += ` LIMIT ${limit} OFFSET ${offset}`;

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error obteniendo backups:', error);
            throw error;
        }
    }

    /**
     * Obtener backup por ID
     */
    static async getById(id, tenantId) {
        try {
            const [rows] = await db.execute(
                `SELECT b.*, u.nombre, u.apellido 
                FROM backup_log b
                LEFT JOIN usuarios u ON b.created_by = u.id_usuario
                WHERE b.id_backup = ? AND b.id_tenant = ?`,
                [id, tenantId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error obteniendo backup:', error);
            throw error;
        }
    }

    /**
     * Actualizar estado de backup
     */
    static async updateStatus(id, status, errorMessage = null, fileSize = null) {
        try {
            let query = `UPDATE backup_log SET status = ?`;
            const params = [status];

            if (errorMessage) {
                query += `, error_message = ?`;
                params.push(errorMessage);
            }

            if (fileSize) {
                query += `, file_size = ?`;
                params.push(fileSize);
            }

            query += ` WHERE id_backup = ?`;
            params.push(id);

            await db.execute(query, params);
        } catch (error) {
            console.error('Error actualizando estado de backup:', error);
            throw error;
        }
    }

    /**
     * Eliminar registro de backup
     */
    static async delete(id, tenantId) {
        try {
            const [result] = await db.execute(
                `DELETE FROM backup_log WHERE id_backup = ? AND id_tenant = ?`,
                [id, tenantId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando backup:', error);
            throw error;
        }
    }

    /**
     * Contar backups
     */
    static async count(tenantId, filters = {}) {
        try {
            let query = `SELECT COUNT(*) as total FROM backup_log WHERE id_tenant = ?`;
            const params = [tenantId];

            if (filters.backup_type) {
                query += ` AND backup_type = ?`;
                params.push(filters.backup_type);
            }

            if (filters.status) {
                query += ` AND status = ?`;
                params.push(filters.status);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].total;
        } catch (error) {
            console.error('Error contando backups:', error);
            throw error;
        }
    }

    /**
     * Obtener último backup exitoso
     */
    static async getLastSuccessful(tenantId) {
        try {
            const [rows] = await db.execute(
                `SELECT * FROM backup_log 
                WHERE id_tenant = ? AND status = 'success' 
                ORDER BY created_at DESC LIMIT 1`,
                [tenantId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error obteniendo último backup:', error);
            throw error;
        }
    }
}

module.exports = BackupModel;
