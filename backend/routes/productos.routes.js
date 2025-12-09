const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant } = require('../middlewares/tenant');
const { auditAction, AUDIT_MODULES, AUDIT_ACTIONS } = require('../middlewares/audit');
const upload = require('../config/multer');
const { createProducto, updateProducto } = require('../validators/producto.validator');

// Obtener todos los productos - Requiere autenticación para panel admin
router.get('/',
    authenticateToken,
    validateTenant,
    ProductoController.getAll
);

// Obtener producto por ID - Requiere autenticación
router.get('/:id',
    authenticateToken,
    validateTenant,
    ProductoController.getById
);

// Crear producto - admin y empleados
router.post('/',
    authenticateToken,
    validateTenant,
    authorize('manage_products'),
    upload.single('imagen'),
    createProducto,
    auditAction(AUDIT_MODULES.PRODUCTOS, AUDIT_ACTIONS.PRODUCTOS.CREAR, (req, data) => {
        const nombre = req.body?.nombre || 'Producto';
        const precio = req.body?.precio ? ` - Precio: $${parseInt(req.body.precio).toLocaleString('es-CL')}` : '';
        return `Producto "${nombre}" creado exitosamente${precio}`;
    }),
    ProductoController.create
);

// Actualizar producto
router.put('/:id',
    authenticateToken,
    validateTenant,
    authorize('manage_products'),
    upload.single('imagen'),
    updateProducto,
    auditAction(AUDIT_MODULES.PRODUCTOS, AUDIT_ACTIONS.PRODUCTOS.EDITAR, (req, data) => {
        const nombre = req.body?.nombre || 'Producto';
        const cambios = [];
        if (req.body?.precio) cambios.push(`Precio: $${parseInt(req.body.precio).toLocaleString('es-CL')}`);
        if (req.body?.stock !== undefined) cambios.push(`Stock: ${req.body.stock}`);
        const detalle = cambios.length > 0 ? ` (${cambios.join(', ')})` : '';
        return `Producto "${nombre}" actualizado (ID: ${req.params.id})${detalle}`;
    }),
    ProductoController.update
);

// Eliminar producto - solo admin
router.delete('/:id',
    authenticateToken,
    validateTenant,
    authorize('delete_products'),
    async (req, res, next) => {
        // Capturar nombre del producto antes de eliminar
        try {
            const ProductoModel = require('../models/producto.model');
            const producto = await ProductoModel.getById(req.params.id, req.user.tenant_id);
            req.productoNombre = producto?.nombre || null;
        } catch (error) {
            console.error('Error capturando nombre de producto:', error);
        }
        next();
    },
    auditAction(AUDIT_MODULES.PRODUCTOS, AUDIT_ACTIONS.PRODUCTOS.ELIMINAR, (req, data) => {
        if (data.success === false) {
            return data.message; // Mostrar mensaje de error si falla
        }
        const nombre = req.productoNombre ? `"${req.productoNombre}"` : `ID ${req.params.id}`;
        return `Producto ${nombre} eliminado exitosamente`;
    }),
    ProductoController.delete
);

// Cambiar estado activo/inactivo
router.patch('/:id/toggle-active',
    authenticateToken,
    validateTenant,
    authorize('manage_products'),
    auditAction(AUDIT_MODULES.PRODUCTOS, AUDIT_ACTIONS.PRODUCTOS.ACTIVAR, (req, data) =>
        `Producto ID ${req.params.id} ${data.data?.activo ? 'activado' : 'desactivado'}`
    ),
    ProductoController.toggleActive
);

module.exports = router;
