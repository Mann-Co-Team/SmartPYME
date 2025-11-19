const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoria.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const upload = require('../config/multer');
const { createCategoria, updateCategoria } = require('../validators/categoria.validator');

// Obtener todas las categorías - PÚBLICO (sin autenticación)
router.get('/', CategoriaController.getAll);

// Obtener categoría por ID - PÚBLICO
router.get('/:id', CategoriaController.getById);

// Crear categoría - solo admin y empleados
router.post('/', 
    authenticateToken,
    authorize('manage_categories'),
    upload.single('imagen'),
    createCategoria,
    CategoriaController.create
);

// Actualizar categoría
router.put('/:id',
    authenticateToken,
    authorize('manage_categories'),
    upload.single('imagen'),
    updateCategoria,
    CategoriaController.update
);

// Eliminar categoría - solo admin
router.delete('/:id',
    authenticateToken,
    authorize('manage_categories'),
    CategoriaController.delete
);

// Cambiar estado activo/inactivo
router.patch('/:id/toggle-active',
    authenticateToken,
    authorize('manage_categories'),
    CategoriaController.toggleActive
);

module.exports = router;
