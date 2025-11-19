const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const upload = require('../config/multer');
const { createProducto, updateProducto } = require('../validators/producto.validator');

// Obtener todos los productos - PÚBLICO (sin autenticación)
router.get('/', ProductoController.getAll);

// Obtener producto por ID - PÚBLICO
router.get('/:id', ProductoController.getById);

// Crear producto - admin y empleados
router.post('/',
    authenticateToken,
    authorize('manage_products'),
    upload.single('imagen'),
    createProducto,
    ProductoController.create
);

// Actualizar producto
router.put('/:id',
    authenticateToken,
    authorize('manage_products'),
    upload.single('imagen'),
    updateProducto,
    ProductoController.update
);

// Eliminar producto - solo admin
router.delete('/:id',
    authenticateToken,
    authorize('delete_products'),
    ProductoController.delete
);

// Cambiar estado activo/inactivo
router.patch('/:id/toggle-active',
    authenticateToken,
    authorize('manage_products'),
    ProductoController.toggleActive
);

module.exports = router;
