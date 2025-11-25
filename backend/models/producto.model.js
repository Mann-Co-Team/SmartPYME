const db = require('../config/db');

class ProductoModel {
    static async getAll(tenantId = null) {
        if (tenantId) {
            const [rows] = await db.execute(`
                SELECT p.id_producto, p.id_tenant, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, p.id_categoria, c.nombre AS categoria
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_tenant = ?
                ORDER BY p.created_at DESC
            `, [tenantId]);
            return rows;
        }
        // Legacy mode - sin filtro de tenant (devuelve todos con id_tenant para filtrado en frontend)
        const [rows] = await db.execute(`
            SELECT p.id_producto, p.id_tenant, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, p.id_categoria, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            ORDER BY p.created_at DESC
        `);
        return rows;
    }

    static async getById(id, tenantId = null) {
        if (tenantId) {
            const [rows] = await db.execute(`
                SELECT p.id_producto, p.id_tenant, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, c.id_categoria, c.nombre AS categoria
                FROM productos p
                LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_producto = ? AND p.id_tenant = ?
            `, [id, tenantId]);
            return rows[0];
        }
        // Legacy mode
        const [rows] = await db.execute(`
            SELECT p.id_producto, p.id_tenant, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.activo, c.id_categoria, c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ?
        `, [id]);
        return rows[0];
    }

    static async create(data, tenantId = 1) {
        const [result] = await db.execute(`
            INSERT INTO productos (id_tenant, id_categoria, nombre, descripcion, precio, stock, imagen)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            tenantId,
            data.id_categoria, 
            data.nombre, 
            data.descripcion || null, 
            data.precio, 
            data.stock, 
            data.imagen || null
        ]);
        return result.insertId;
    }

    static async update(id, data, tenantId = null) {
        const query = tenantId
            ? `UPDATE productos 
               SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, activo = ?
               WHERE id_producto = ? AND id_tenant = ?`
            : `UPDATE productos 
               SET id_categoria = ?, nombre = ?, descripcion = ?, precio = ?, stock = ?, imagen = ?, activo = ?
               WHERE id_producto = ?`;
        
        const params = tenantId
            ? [
                data.id_categoria, 
                data.nombre, 
                data.descripcion || null, 
                data.precio, 
                data.stock, 
                data.imagen || null, 
                data.activo !== undefined ? data.activo : true, 
                id,
                tenantId
              ]
            : [
                data.id_categoria, 
                data.nombre, 
                data.descripcion || null, 
                data.precio, 
                data.stock, 
                data.imagen || null, 
                data.activo !== undefined ? data.activo : true, 
                id
              ];
        
        const [result] = await db.execute(query, params);
        return result.affectedRows > 0;
    }

    static async delete(id, tenantId = null) {
        const query = tenantId
            ? `DELETE FROM productos WHERE id_producto = ? AND id_tenant = ?`
            : `DELETE FROM productos WHERE id_producto = ?`;
        
        const params = tenantId ? [id, tenantId] : [id];
        const [result] = await db.execute(query, params);
        return result.affectedRows > 0;
    }

    // Verificar si un producto tiene pedidos asociados
    static async hasPedidos(id, tenantId = null) {
        const query = tenantId
            ? `SELECT COUNT(*) as count 
               FROM detalle_pedidos dp
               INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
               WHERE dp.id_producto = ? AND p.id_tenant = ?`
            : `SELECT COUNT(*) as count 
               FROM detalle_pedidos dp
               WHERE dp.id_producto = ?`;
        
        const params = tenantId ? [id, tenantId] : [id];
        const [rows] = await db.execute(query, params);
        return rows[0].count > 0;
    }

    // Verificar si existe un producto con el mismo nombre (excluyendo el id actual)
    static async existsByNombre(nombre, tenantId = null, excludeId = null) {
        let query = tenantId
            ? `SELECT COUNT(*) as count FROM productos WHERE LOWER(nombre) = LOWER(?) AND id_tenant = ?`
            : `SELECT COUNT(*) as count FROM productos WHERE LOWER(nombre) = LOWER(?)`;
        
        const params = tenantId ? [nombre, tenantId] : [nombre];
        
        if (excludeId) {
            query += ` AND id_producto != ?`;
            params.push(excludeId);
        }
        
        const [rows] = await db.execute(query, params);
        return rows[0].count > 0;
    }
}

module.exports = ProductoModel;
