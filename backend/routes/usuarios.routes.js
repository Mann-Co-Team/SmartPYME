const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para administradores
router.get('/', requireRole([1]), UsuarioController.getAll);
router.get('/:id', requireRole([1, 2]), UsuarioController.getById);
router.put('/:id', requireRole([1]), UsuarioController.update);
router.patch('/:id/toggle-active', requireRole([1]), UsuarioController.toggleActive);

module.exports = router;
