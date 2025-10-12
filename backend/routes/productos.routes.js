const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/producto.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Leer todos los productos - cualquier usuario autenticado
router.get('/', authenticateToken, ProductoController.getAll);

// Leer producto por ID
router.get('/:id', authenticateToken, ProductoController.getById);

// Crear producto - roles admin (1) y empleado (2)
router.post('/', authenticateToken, requireRole([1, 2]), ProductoController.create);

// Actualizar producto - roles admin y empleado
router.put('/:id', authenticateToken, requireRole([1, 2]), ProductoController.update);

// Eliminar producto - solo admin
router.delete('/:id', authenticateToken, requireRole([1]), ProductoController.delete);

module.exports = router;
