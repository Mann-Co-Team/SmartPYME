const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { auditAction, AUDIT_MODULES, AUDIT_ACTIONS } = require('../middlewares/audit');

// Rutas públicas
router.post('/login',
    auditAction(AUDIT_MODULES.AUTH, AUDIT_ACTIONS.AUTH.LOGIN, (req, data) =>
        `Login exitoso: ${req.body.email || 'N/A'}`
    ),
    AuthController.loginPublic
); // Login para clientes

router.post('/admin/login',
    auditAction(AUDIT_MODULES.AUTH, AUDIT_ACTIONS.AUTH.LOGIN, (req, data) =>
        `Login admin exitoso: ${req.body.email || 'N/A'}`
    ),
    AuthController.loginAdmin
); // Login para admin/empleados

router.post('/register-public',
    auditAction(AUDIT_MODULES.AUTH, AUDIT_ACTIONS.AUTH.REGISTER, (req, data) =>
        `Registro público: ${req.body.email || 'N/A'}`
    ),
    AuthController.registerPublic
); // Registro público de clientes

// Rutas protegidas
router.post('/register', authenticateToken, requireRole([1]), AuthController.register); // Solo admin
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.post('/verify-password', authenticateToken, AuthController.verifyPassword); // Verificar contraseña del usuario actual

module.exports = router;
