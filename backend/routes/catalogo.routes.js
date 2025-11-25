const express = require('express');
const router = express.Router();
const ProductoModel = require('../models/producto.model');
const CategoriaModel = require('../models/categoria.model');

// Obtener todas las categorías de un tenant específico (público)
router.get('/:tenant_slug/categorias', async (req, res) => {
    try {
        const { tenant_slug } = req.params;
        
        // Obtener tenant por slug
        const TenantModel = require('../models/tenant.model');
        const tenant = await TenantModel.getBySlug(tenant_slug);
        
        if (!tenant || !tenant.activo) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada'
            });
        }

        const categorias = await CategoriaModel.getAll(tenant.id_tenant);
        
        res.json({
            success: true,
            data: categorias.filter(c => c.activo)
        });
    } catch (error) {
        console.error('Error obteniendo categorías públicas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener todos los productos de un tenant específico (público)
router.get('/:tenant_slug/productos', async (req, res) => {
    try {
        const { tenant_slug } = req.params;
        const { categoria } = req.query;
        
        // Obtener tenant por slug
        const TenantModel = require('../models/tenant.model');
        const tenant = await TenantModel.getBySlug(tenant_slug);
        
        if (!tenant || !tenant.activo) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada'
            });
        }

        let productos = await ProductoModel.getAll(tenant.id_tenant);
        
        // Filtrar solo productos activos
        productos = productos.filter(p => p.activo);
        
        // Filtrar por categoría si se especifica
        if (categoria) {
            productos = productos.filter(p => p.id_categoria === parseInt(categoria));
        }
        
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error obteniendo productos públicos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener un producto específico (público)
router.get('/:tenant_slug/productos/:id', async (req, res) => {
    try {
        const { tenant_slug, id } = req.params;
        
        // Obtener tenant por slug
        const TenantModel = require('../models/tenant.model');
        const tenant = await TenantModel.getBySlug(tenant_slug);
        
        if (!tenant || !tenant.activo) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada'
            });
        }

        const producto = await ProductoModel.getById(id, tenant.id_tenant);
        
        if (!producto || !producto.activo) {
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
        console.error('Error obteniendo producto público:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
