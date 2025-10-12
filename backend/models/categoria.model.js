const db = require('../config/db');

class CategoriaModel {
    static async getAll() {
        try {
            const [rows] = await db.execute(`
                SELECT id_categoria, nombre, descripcion, imagen, activo, created_at
                FROM categorias 
                ORDER BY nombre ASC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await db.execute(`
                SELECT id_categoria, nombre, descripcion, imagen, activo, created_at
                FROM categorias 
                WHERE id_categoria = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        try {
            const [result] = await db.execute(`
                INSERT INTO categorias (nombre, descripcion, imagen, activo)
                VALUES (?, ?, ?, ?)
            `, [
                data.nombre,
                data.descripcion || null,
                data.imagen || null,
                data.activo !== undefined ? data.activo : true
            ]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const [result] = await db.execute(`
                UPDATE categorias 
                SET nombre = ?, descripcion = ?, imagen = ?, activo = ?
                WHERE id_categoria = ?
            `, [
                data.nombre,
                data.descripcion,
                data.imagen,
                data.activo,
                id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            // Verificar si hay productos asociados
            const [products] = await db.execute(
                'SELECT COUNT(*) as count FROM productos WHERE id_categoria = ?',
                [id]
            );

            if (products[0].count > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
            }

            const [result] = await db.execute(`
                DELETE FROM categorias WHERE id_categoria = ?
            `, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    static async toggleActive(id) {
        try {
            const [result] = await db.execute(`
                UPDATE categorias 
                SET activo = NOT activo 
                WHERE id_categoria = ?
            `, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CategoriaModel;
