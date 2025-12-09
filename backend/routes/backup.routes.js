// Rutas de Backup
const express = require('express');
const router = express.Router();
const BackupController = require('../controllers/backup.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');
const { validateTenant } = require('../middlewares/tenant');
const { auditAction, AUDIT_MODULES, AUDIT_ACTIONS } = require('../middlewares/audit');

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(validateTenant);
router.use(authorize('manage_backups')); // Solo admin

// Crear backup manual
router.post('/create',
    auditAction(AUDIT_MODULES.SISTEMA, 'BACKUP_CREAR', (req, data) =>
        `Backup manual creado: ${data.data?.filename || 'N/A'}`
    ),
    BackupController.create
);

// Listar backups
router.get('/list',
    BackupController.getAll
);

// Obtener último backup
router.get('/last',
    BackupController.getLastBackup
);

// Descargar backup
router.get('/download/:id',
    auditAction(AUDIT_MODULES.SISTEMA, 'BACKUP_DESCARGAR', (req, data) =>
        `Backup descargado: ID ${req.params.id}`
    ),
    BackupController.download
);

// Eliminar backup
router.delete('/delete/:id',
    auditAction(AUDIT_MODULES.SISTEMA, 'BACKUP_ELIMINAR', (req, data) =>
        `Backup eliminado: ID ${req.params.id}`
    ),
    BackupController.delete
);

// Restaurar backup a base de datos de prueba (Paso 1)
router.post('/restore-to-test/:id',
    auditAction(AUDIT_MODULES.SISTEMA, 'BACKUP_RESTAURAR_PRUEBA', (req, data) =>
        `Backup restaurado a BD de prueba: ID ${req.params.id}`
    ),
    BackupController.restoreToTest
);

// Promover BD de prueba a producción (Paso 2)
router.post('/promote-to-production',
    auditAction(AUDIT_MODULES.SISTEMA, 'BACKUP_RESTAURAR_PRODUCCION', (req, data) =>
        `BD de prueba promovida a producción`
    ),
    BackupController.promoteToProduction
);

// Eliminar base de datos de prueba
router.delete('/delete-test-db',
    BackupController.deleteTestDb
);

module.exports = router;
