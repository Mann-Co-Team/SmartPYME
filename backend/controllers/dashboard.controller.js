const DashboardModel = require('../models/dashboard.model');

class DashboardController {
    // RF-8: Obtener métricas del dashboard
    static async getMetricas(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const metricas = await DashboardModel.getMetricas(tenantId);
            
            // Verificar si hay datos disponibles
            const sinDatos = 
                metricas.ventas.anio === 0 &&
                metricas.pedidosPorEstado.every(p => p.cantidad === 0) &&
                metricas.productosTop.every(p => p.total_vendido === 0);

            if (sinDatos) {
                return res.json({
                    success: true,
                    message: 'Sin información disponible',
                    data: metricas,
                    sinDatos: true
                });
            }

            res.json({
                success: true,
                data: metricas,
                sinDatos: false
            });
        } catch (error) {
            console.error('Error al obtener métricas del dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener métricas del dashboard',
                error: error.message
            });
        }
    }

    // RF-8: Obtener ventas por mes
    static async getVentasPorMes(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const ventas = await DashboardModel.getVentasPorMes(tenantId);
            
            res.json({
                success: true,
                data: ventas
            });
        } catch (error) {
            console.error('Error al obtener ventas por mes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener ventas por mes',
                error: error.message
            });
        }
    }
}

module.exports = DashboardController;
