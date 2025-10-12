const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Rutas públicas
router.post('/login', AuthController.login);

// Rutas protegidas
router.post('/register', authenticateToken, requireRole([1]), AuthController.register); // Solo admin
router.get('/verify', authenticateToken, AuthController.verifyToken);

module.exports = router;
