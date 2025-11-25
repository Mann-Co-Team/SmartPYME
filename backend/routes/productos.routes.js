const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant } = require('../middlewares/tenant');
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
    ProductoController.create
);

// Actualizar producto
router.put('/:id',
    authenticateToken,
    validateTenant,
    authorize('manage_products'),
    upload.single('imagen'),
    updateProducto,
    ProductoController.update
);

// Eliminar producto - solo admin
router.delete('/:id',
    authenticateToken,
    validateTenant,
    authorize('delete_products'),
    ProductoController.delete
);

// Cambiar estado activo/inactivo
router.patch('/:id/toggle-active',
    authenticateToken,
    validateTenant,
    authorize('manage_products'),
    ProductoController.toggleActive
);

module.exports = router;
