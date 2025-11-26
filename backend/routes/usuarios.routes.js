const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/usuario.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant, checkTenantLimit } = require('../middlewares/tenant');
const {
    createUsuario,
    updateUsuario,
    toggleActive,
    getById,
    deleteUsuario
} = require('../validators/usuario.validator');

// Todas las rutas requieren autenticación y validación de tenant
router.use(authenticateToken);
router.use(validateTenant);

// Ruta para cambiar contraseña (cualquier usuario autenticado)
router.post('/cambiar-password', UsuarioController.cambiarPassword);

// Rutas para administradores solamente
router.get('/stats', authorize('manage_users'), UsuarioController.getStats);
router.get('/', authorize('manage_users'), UsuarioController.getAll);
router.get('/roles', authorize('manage_users'), UsuarioController.getRoles);
router.get('/:id', authorize('manage_users'), getById, UsuarioController.getById);
router.post('/', authorize('manage_users'), checkTenantLimit('usuarios'), createUsuario, UsuarioController.create);
router.put('/:id', authorize('manage_users'), updateUsuario, UsuarioController.update);
router.patch('/:id/toggle-active', authorize('manage_users'), toggleActive, UsuarioController.toggleActive);
router.delete('/:id', authorize('manage_users'), deleteUsuario, UsuarioController.delete);

module.exports = router;
