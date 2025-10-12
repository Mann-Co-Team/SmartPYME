const db = require('../config/db');

class ProductoModel {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, c.nombre AS categoria
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
        `, [data.id_categoria, data.nombre, data.descripcion, data.precio, data.stock, data.imagen]);
        return result.insertId;
    }

    static async update(id, data) {
        const [result] = await db.execute(`
            UPDATE productos 
            SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, activo = ?
            WHERE id_producto = ?
        `, [data.id_categoria, data.nombre, data.descripcion, data.precio, data.stock, data.imagen, data.activo, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute(`
            DELETE FROM productos WHERE id_producto = ?
        `, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ProductoModel;
