const express = require('express');
const router = express.Router();
const TenantController = require('../controllers/tenant.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');

// Rutas públicas
router.get('/public', TenantController.getAllPublic); // Lista tiendas activas (público)
router.get('/slug/:slug', TenantController.getBySlug); // Info de tienda por slug (público)
router.get('/validate/:slug', TenantController.validateSlug); // Validar tenant para login (público)
router.post('/register', TenantController.registerPublic); // Registro público de nueva empresa (público)

// Todas las rutas siguientes requieren autenticación y permisos de super admin
// (por ahora usamos manage_users como proxy para admin)

// Crear nuevo tenant con usuario administrador
router.post('/',
    authenticateToken,
    authorize('manage_users'),
    TenantController.create
);

// Listar todos los tenants (admin)
router.get('/',
    authenticateToken,
    authorize('manage_users'),
    TenantController.getAll
);

// Obtener detalles de un tenant específico
router.get('/:id',
    authenticateToken,
    authorize('manage_users'),
    TenantController.getById
);

// Actualizar información de un tenant
router.put('/:id',
    authenticateToken,
    authorize('manage_users'),
    TenantController.update
);

// Activar/Desactivar tenant
router.patch('/:id/toggle-active',
    authenticateToken,
    authorize('manage_users'),
    TenantController.toggleActive
);

// Obtener estadísticas del tenant
router.get('/:id/stats',
    authenticateToken,
    authorize('manage_users'),
    TenantController.getStats
);

// Eliminar tenant (soft delete)
router.delete('/:id',
    authenticateToken,
    authorize('manage_users'),
    TenantController.delete
);

module.exports = router;
