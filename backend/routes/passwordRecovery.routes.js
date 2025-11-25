const express = require('express');
const router = express.Router();
const PasswordRecoveryController = require('../controllers/passwordRecovery.controller');

// Solicitar recuperación de contraseña (sin autenticación)
router.post('/solicitar', PasswordRecoveryController.solicitarRecuperacion);

// Verificar token de recuperación
router.get('/verificar/:token', PasswordRecoveryController.verificarToken);

// Resetear contraseña con token
router.post('/resetear', PasswordRecoveryController.resetearPassword);

module.exports = router;
