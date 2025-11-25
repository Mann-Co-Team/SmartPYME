const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant } = require('../middlewares/tenant');

// Obtener configuraciones públicas (sin autenticación)
router.get('/public/all', SettingsController.getAll);

// Obtener todas las configuraciones - admin solamente
router.get('/', 
    authenticateToken,
    validateTenant,
    authorize('manage_settings'),
    SettingsController.getAll
);

// Obtener configuración específica
router.get('/:key',
    authenticateToken,
    validateTenant,
    authorize('manage_settings'),
    SettingsController.getByKey
);

// Actualizar configuración específica
router.put('/:key',
    authenticateToken,
    validateTenant,
    authorize('manage_settings'),
    SettingsController.updateSetting
);

// Actualizar múltiples configuraciones
router.put('/',
    authenticateToken,
    validateTenant,
    authorize('manage_settings'),
    SettingsController.updateMultiple
);

module.exports = router;
