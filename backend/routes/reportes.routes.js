const express = require('express');
const router = express.Router();
const ReportesController = require('../controllers/reportes.controller');
const { authenticateToken } = require('../middlewares/auth');
const { authorize } = require('../middlewares/permissions');

// Todas las rutas requieren autenticación y permisos de reportes
router.use(authenticateToken);
router.use(authorize('view_reports')); // Solo admin y empleados con permiso

/**
 * @route   GET /api/reportes
 * @desc    Obtiene reporte completo con métricas
 * @query   fechaInicio, fechaFin, agruparPor (opcional: dia|semana|mes)
 * @access  Admin, Empleado con permiso
 */
router.get('/', ReportesController.getReporte);

/**
 * @route   GET /api/reportes/exportar/csv
 * @desc    Exporta reporte en formato CSV
 * @query   fechaInicio, fechaFin
 * @access  Admin, Empleado con permiso
 */
router.get('/exportar/csv', ReportesController.exportarCSV);

/**
 * @route   GET /api/reportes/exportar/excel
 * @desc    Exporta reporte en formato Excel
 * @query   fechaInicio, fechaFin
 * @access  Admin, Empleado con permiso
 */
router.get('/exportar/excel', ReportesController.exportarExcel);

/**
 * @route   GET /api/reportes/exportar/pdf
 * @desc    Exporta reporte en formato PDF
 * @query   fechaInicio, fechaFin
 * @access  Admin, Empleado con permiso
 */
router.get('/exportar/pdf', ReportesController.exportarPDF);

module.exports = router;
