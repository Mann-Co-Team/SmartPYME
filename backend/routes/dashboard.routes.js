const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validateTenant } = require('../middlewares/tenant');

// RF-8: Todas las rutas requieren autenticación y rol admin/empleado
router.use(authenticateToken);
router.use(validateTenant);
router.use(requireRole([1, 2])); // Solo admin y empleados

// RF-8: Obtener métricas del dashboard
router.get('/metricas', DashboardController.getMetricas);

// RF-8: Obtener ventas por mes (gráfico)
router.get('/ventas-por-mes', DashboardController.getVentasPorMes);

module.exports = router;
