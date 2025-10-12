const ProductoModel = require('../models/producto.model');

class ProductoController {
    static async getAll(req, res) {
        try {
            const productos = await ProductoModel.getAll();
            res.json({ success: true, data: productos });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al obtener productos' });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const producto = await ProductoModel.getById(id);
            if (!producto) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            res.json({ success: true, data: producto });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al obtener producto' });
        }
    }

    static async create(req, res) {
        try {
            const newId = await ProductoModel.create(req.body);
            res.status(201).json({ success: true, message: 'Producto creado', data: { id: newId } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al crear producto' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updated = await ProductoModel.update(id, req.body);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            res.json({ success: true, message: 'Producto actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al actualizar producto' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await ProductoModel.delete(id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            }
            res.json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al eliminar producto' });
        }
    }
}

module.exports = ProductoController;
