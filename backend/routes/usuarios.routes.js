const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { 
    createUsuario, 
    updateUsuario, 
    toggleActive, 
    getById, 
    deleteUsuario 
} = require('../validators/usuario.validator');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para administradores solamente
router.get('/', authorize('manage_users'), UsuarioController.getAll);
router.get('/roles', authorize('manage_users'), UsuarioController.getRoles);
router.get('/:id', authorize('manage_users'), getById, UsuarioController.getById);
router.post('/', authorize('manage_users'), createUsuario, UsuarioController.create);
router.put('/:id', authorize('manage_users'), updateUsuario, UsuarioController.update);
router.patch('/:id/toggle-active', authorize('manage_users'), toggleActive, UsuarioController.toggleActive);
router.delete('/:id', authorize('manage_users'), deleteUsuario, UsuarioController.delete);

module.exports = router;
