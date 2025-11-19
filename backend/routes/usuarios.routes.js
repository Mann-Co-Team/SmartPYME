const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para administradores solamente
router.get('/', authorize('manage_users'), UsuarioController.getAll);
router.get('/:id', authorize('manage_users'), UsuarioController.getById);
router.put('/:id', authorize('manage_users'), UsuarioController.update);
router.patch('/:id/toggle-active', authorize('manage_users'), UsuarioController.toggleActive);

module.exports = router;
