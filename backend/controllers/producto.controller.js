const ProductoModel = require('../models/producto.model');
const fs = require('fs');
const path = require('path');

class ProductoController {
    static async getAll(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const productos = await ProductoModel.getAll(tenantId);
            res.json({
                success: true,
                data: productos
            });
        } catch (error) {
            console.error('Error obteniendo productos:', error);
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
            const producto = await ProductoModel.getById(id, tenantId);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });
        } catch (error) {
            console.error('Error obteniendo producto:', error);
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
            
            // Validar que no exista producto con el mismo nombre
            const existeNombre = await ProductoModel.existsByNombre(data.nombre, tenantId);
            if (existeNombre) {
                // Si hay error y se subió archivo, eliminarlo
                if (req.file) {
                    const filePath = path.join(__dirname, '../uploads', req.file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con ese nombre'
                });
            }
            
            // Si se subió una imagen
            if (req.file) {
                data.imagen = `/uploads/${req.file.filename}`;
            }

            const productoId = await ProductoModel.create(data, tenantId);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: { id: productoId }
            });
        } catch (error) {
            // Si hay error y se subió archivo, eliminarlo
            if (req.file) {
                const filePath = path.join(__dirname, '../uploads', req.file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            console.error('Error creando producto:', error);
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

            // Obtener datos actuales para manejar imagen
            const productoActual = await ProductoModel.getById(id, tenantId);
            if (!productoActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Validar que no exista otro producto con el mismo nombre
            if (data.nombre && data.nombre !== productoActual.nombre) {
                const existeNombre = await ProductoModel.existsByNombre(data.nombre, tenantId, id);
                if (existeNombre) {
                    // Si hay error y se subió archivo, eliminarlo
                    if (req.file) {
                        const filePath = path.join(__dirname, '../uploads', req.file.filename);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                    
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un producto con ese nombre'
                    });
                }
            }

            // Si se subió nueva imagen
            if (req.file) {
                data.imagen = `/uploads/${req.file.filename}`;
                
                // Eliminar imagen anterior si existe
                if (productoActual.imagen) {
                    const oldImagePath = path.join(__dirname, '..', productoActual.imagen);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            } else {
                // Mantener imagen actual
                data.imagen = productoActual.imagen;
            }

            // Asegurar que todos los campos tengan valores (usar los actuales si no vienen en el body)
            const updateData = {
                id_categoria: data.id_categoria || productoActual.id_categoria,
                nombre: data.nombre || productoActual.nombre,
                descripcion: data.descripcion !== undefined ? data.descripcion : productoActual.descripcion,
                precio: data.precio !== undefined ? data.precio : productoActual.precio,
                stock: data.stock !== undefined ? data.stock : productoActual.stock,
                imagen: data.imagen,
                activo: data.activo !== undefined ? data.activo : productoActual.activo
            };

            const updated = await ProductoModel.update(id, updateData, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando producto:', error);
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
            const producto = await ProductoModel.getById(id, tenantId);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Verificar si tiene pedidos asociados
            const tienePedidos = await ProductoModel.hasPedidos(id, tenantId);
            if (tienePedidos) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el producto porque tiene pedidos asociados. Puede desactivarlo en su lugar.'
                });
            }

            const deleted = await ProductoModel.delete(id, tenantId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Eliminar imagen si existe
            if (producto.imagen) {
                const imagePath = path.join(__dirname, '..', producto.imagen);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    static async toggleActive(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            const updated = await ProductoModel.toggleActive(id, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Estado del producto actualizado'
            });
        } catch (error) {
            console.error('Error cambiando estado del producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = ProductoController;
