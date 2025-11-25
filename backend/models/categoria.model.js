const db = require('../config/db');

class CategoriaModel {
    static async getAll(tenantId = null) {
        try {
            if (tenantId) {
                const [rows] = await db.execute(`
                    SELECT id_categoria, id_tenant, nombre, descripcion, activo, created_at
                    FROM categorias 
                    WHERE id_tenant = ?
                    ORDER BY nombre ASC
                `, [tenantId]);
                return rows;
            }
            // Legacy mode - devuelve todos con id_tenant para filtrado en frontend
            const [rows] = await db.execute(`
                SELECT id_categoria, id_tenant, nombre, descripcion, activo, created_at
                FROM categorias 
                ORDER BY nombre ASC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id, tenantId = null) {
        try {
            if (tenantId) {
                const [rows] = await db.execute(`
                    SELECT id_categoria, id_tenant, nombre, descripcion, activo, created_at
                    FROM categorias 
                    WHERE id_categoria = ? AND id_tenant = ?
                `, [id, tenantId]);
                return rows[0];
            }
            // Legacy mode
            const [rows] = await db.execute(`
                SELECT id_categoria, id_tenant, nombre, descripcion, activo, created_at
                FROM categorias 
                WHERE id_categoria = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data, tenantId = 1) {
        try {
            const [result] = await db.execute(`
                INSERT INTO categorias (id_tenant, nombre, descripcion, activo)
                VALUES (?, ?, ?, ?)
            `, [
                tenantId,
                data.nombre,
                data.descripcion || null,
                data.activo !== undefined ? data.activo : true
            ]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data, tenantId = null) {
        try {
            const query = tenantId
                ? `UPDATE categorias 
                   SET nombre = ?, descripcion = ?, activo = ?
                   WHERE id_categoria = ? AND id_tenant = ?`
                : `UPDATE categorias 
                   SET nombre = ?, descripcion = ?, activo = ?
                   WHERE id_categoria = ?`;
            
            const params = tenantId
                ? [data.nombre, data.descripcion, data.activo, id, tenantId]
                : [data.nombre, data.descripcion, data.activo, id];
            
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id, tenantId = null) {
        try {
            // Verificar si hay productos asociados
            const checkQuery = tenantId
                ? 'SELECT COUNT(*) as count FROM productos WHERE id_categoria = ? AND id_tenant = ?'
                : 'SELECT COUNT(*) as count FROM productos WHERE id_categoria = ?';
            
            const checkParams = tenantId ? [id, tenantId] : [id];
            const [products] = await db.execute(checkQuery, checkParams);

            if (products[0].count > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
            }

            const deleteQuery = tenantId
                ? `DELETE FROM categorias WHERE id_categoria = ? AND id_tenant = ?`
                : `DELETE FROM categorias WHERE id_categoria = ?`;
            
            const deleteParams = tenantId ? [id, tenantId] : [id];
            const [result] = await db.execute(deleteQuery, deleteParams);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async toggleActive(id, tenantId = null) {
        try {
            const query = tenantId
                ? `UPDATE categorias 
                   SET activo = NOT activo 
                   WHERE id_categoria = ? AND id_tenant = ?`
                : `UPDATE categorias 
                   SET activo = NOT activo 
                   WHERE id_categoria = ?`;
            
            const params = tenantId ? [id, tenantId] : [id];
            const [result] = await db.execute(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CategoriaModel;
