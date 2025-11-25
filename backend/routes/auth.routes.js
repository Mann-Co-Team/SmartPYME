const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Rutas públicas
router.post('/login', AuthController.loginPublic); // Login para clientes
router.post('/admin/login', AuthController.loginAdmin); // Login para admin/empleados
router.post('/register-public', AuthController.registerPublic); // Registro público de clientes

// Rutas protegidas
router.post('/register', authenticateToken, requireRole([1]), AuthController.register); // Solo admin
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.post('/verify-password', authenticateToken, AuthController.verifyPassword); // Verificar contraseña del usuario actual

module.exports = router;
