const PedidoModel = require('../models/pedido.model');

class PedidoController {
    static async getAll(req, res) {
        try {
            const pedidos = await PedidoModel.getAll();
            res.json({ success: true, data: pedidos });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al obtener pedidos' });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const pedido = await PedidoModel.getById(id);
            if (!pedido) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, data: pedido });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al obtener pedido' });
        }
    }

    static async create(req, res) {
        try {
            const pedidoId = await PedidoModel.create(req.body);
            res.status(201).json({ success: true, message: 'Pedido creado', data: { id: pedidoId } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al crear pedido' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await PedidoModel.update(id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, message: 'Estado del pedido actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al actualizar pedido' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await PedidoModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, message: 'Pedido eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al eliminar pedido' });
        }
    }
}

module.exports = PedidoController;
