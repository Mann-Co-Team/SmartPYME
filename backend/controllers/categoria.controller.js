const CategoriaModel = require('../models/categoria.model');
const fs = require('fs');
const path = require('path');

class CategoriaController {
    static async getAll(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const categorias = await CategoriaModel.getAll(tenantId);
            res.json({
                success: true,
                data: categorias
            });
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const categoria = await CategoriaModel.getById(id, tenantId);

            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                data: categoria
            });
        } catch (error) {
            console.error('Error obteniendo categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async create(req, res) {
        try {
            const data = { ...req.body };
            const tenantId = req.tenant?.id || req.user?.tenant_id || 1;

            // Si se subió una imagen
            if (req.file) {
                data.imagen = `/uploads/${req.file.filename}`;
            }

            const categoriaId = await CategoriaModel.create(data, tenantId);

            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: { id: categoriaId }
            });
        } catch (error) {
            // Si hay error y se subió archivo, eliminarlo
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            console.error('Error creando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            console.log('🔍 UPDATE CATEGORIA - Debug:');
            console.log('  ID:', id);
            console.log('  Tenant ID:', tenantId);
            console.log('  Body data:', data);
            console.log('  File:', req.file ? req.file.filename : 'No file uploaded');

            // Obtener datos actuales para manejar imagen
            const categoriaActual = await CategoriaModel.getById(id, tenantId);
            if (!categoriaActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Si se subió nueva imagen
            if (req.file) {
                data.imagen = `/uploads/${req.file.filename}`;
                console.log('  ✅ Nueva imagen:', data.imagen);

                // Eliminar imagen anterior si existe
                if (categoriaActual.imagen) {
                    const oldImagePath = path.join(__dirname, '..', categoriaActual.imagen);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            } else {
                // Mantener imagen actual
                data.imagen = categoriaActual.imagen;
                console.log('  ℹ️ Manteniendo imagen actual:', data.imagen);
            }

            console.log('  📤 Data final a guardar:', data);

            const updated = await CategoriaModel.update(id, data, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            console.log('  ✅ Categoría actualizada exitosamente');

            res.json({
                success: true,
                message: 'Categoría actualizada exitosamente'
            });
        } catch (error) {
            console.error('❌ Error actualizando categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            // Obtener datos para eliminar imagen
            const categoria = await CategoriaModel.getById(id, tenantId);
            if (!categoria) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            const deleted = await CategoriaModel.delete(id, tenantId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            // Eliminar imagen si existe
            if (categoria.imagen) {
                const imagePath = path.join(__dirname, '..', categoria.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    static async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            const updated = await CategoriaModel.toggleActive(id, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Estado de la categoría actualizado'
            });
        } catch (error) {
            console.error('Error cambiando estado de categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = CategoriaController;
