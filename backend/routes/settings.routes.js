const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant } = require('../middlewares/tenant');

// Endpoint público para configuraciones básicas (NO requiere autenticación)
router.get('/public',
    SettingsController.getPublic
);

// Obtener todas las configuraciones (admin ve todas, usuarios normales solo públicas)
router.get('/',
    authenticateToken,
    validateTenant,
    SettingsController.getAll
);

// Actualizar múltiples configuraciones (solo admin) - DEBE IR ANTES DE /:key
router.put('/',
    authenticateToken,
    validateTenant,
    // authorize('manage_settings'), // TEMPORALMENTE DESHABILITADO PARA DEBUG
    SettingsController.update
);

// Obtener configuraciones por categoría
router.get('/category/:category',
    authenticateToken,
    validateTenant,
    SettingsController.getByCategory
);

// Obtener configuración específica - DEBE IR AL FINAL
router.get('/:key',
    authenticateToken,
    validateTenant,
    SettingsController.getByKey
);

module.exports = router;
