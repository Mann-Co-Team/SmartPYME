const db = require('../config/db');

class PedidoModel {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT p.id_pedido, c.nombre AS cliente, u.nombre AS empleado, p.fecha_pedido, e.nombre_estado, p.total
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            ORDER BY p.fecha_pedido DESC
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(`
            SELECT p.*, c.nombre AS cliente, u.nombre AS empleado, e.nombre_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            WHERE p.id_pedido = ?
        `, [id]);

        if (rows.length === 0) return null;

        // Obtener detalle
        const [detalle] = await db.execute(`
            SELECT dp.id_detalle, pr.nombre, dp.cantidad, dp.precio_unitario, dp.subtotal
            FROM detalle_pedidos dp
            LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?
        `, [id]);

        return { ...rows[0], detalle };
    }

    static async create(data) {
        const { id_cliente, id_usuario, items, total, metodo_pago, notas } = data;
        const [result] = await db.execute(`
            INSERT INTO pedidos (id_cliente, id_usuario, total, metodo_pago, notas)
            VALUES (?, ?, ?, ?, ?)
        `, [id_cliente, id_usuario, total, metodo_pago, notas]);

        const pedidoId = result.insertId;

        // Insertar detalle
        for (let item of items) {
            await db.execute(`
                INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [pedidoId, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]);
        }

        return pedidoId;
    }

    static async update(id, data) {
        const { id_estado } = data;
        const [result] = await db.execute(`
            UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?
        `, [id_estado, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute(`
            DELETE FROM pedidos WHERE id_pedido = ?
        `, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = PedidoModel;
