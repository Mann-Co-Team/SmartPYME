const db = require('../config/db');

class ProductoModel {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, p.id_categoria, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, c.id_categoria, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ?
        `, [id]);
        return rows[0];
    }

    static async create(data) {
        const [result] = await db.execute(`
            INSERT INTO productos (id_categoria, nombre, descripcion, precio, stock, imagen)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            data.id_categoria, 
            data.nombre, 
            data.descripcion || null, 
            data.precio, 
            data.stock, 
            data.imagen || null
        ]);
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.execute(`
            UPDATE productos 
            SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, activo = ?
            WHERE id_producto = ?
        `, [
            data.id_categoria, 
            data.nombre, 
            data.descripcion || null, 
            data.precio, 
            data.stock, 
            data.imagen || null, 
            data.activo !== undefined ? data.activo : true, 
            id
        ]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute(`
            DELETE FROM productos WHERE id_producto = ?
        `, [id]);
        return result.affectedRows > 0;
    }

    // Verificar si un producto tiene pedidos asociados
    static async hasPedidos(id) {
        const [rows] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM detalle_pedidos 
            WHERE id_producto = ?
        `, [id]);
        return rows[0].count > 0;
    }

    // Verificar si existe un producto con el mismo nombre (excluyendo el id actual)
    static async existsByNombre(nombre, excludeId = null) {
        let query = `SELECT COUNT(*) as count FROM productos WHERE LOWER(nombre) = LOWER(?)`;
        const params = [nombre];
        
        if (excludeId) {
            query += ` AND id_producto != ?`;
            params.push(excludeId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows[0].count > 0;
    }
}

module.exports = ProductoModel;
