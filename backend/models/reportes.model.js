const db = require('../config/db');

class ReportesModel {
    /**
     * Obtiene ventas por período con filtros
     * @param {Object} params - { fechaInicio, fechaFin, agruparPor: 'dia'|'semana'|'mes' }
     */
    static async getVentasPorPeriodo(params) {
        const { fechaInicio, fechaFin, agruparPor = 'dia', tenantId } = params;
        
        let formatoFecha;
        let nombrePeriodo;
        
        switch (agruparPor) {
            case 'mes':
                formatoFecha = '%Y-%m';
                nombrePeriodo = 'mes';
                break;
            case 'semana':
                formatoFecha = '%Y-%u'; // Año-Semana
                nombrePeriodo = 'semana';
                break;
            case 'dia':
            default:
                formatoFecha = '%Y-%m-%d';
                nombrePeriodo = 'dia';
                break;
        }

        const query = `
            SELECT 
                DATE_FORMAT(p.fecha_pedido, ?) as periodo,
                COUNT(DISTINCT p.id_pedido) as cantidad_pedidos,
                SUM(p.total) as total_ventas,
                AVG(p.total) as ticket_promedio,
                SUM(dp.cantidad) as productos_vendidos
            FROM pedidos p
            INNER JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE p.fecha_pedido BETWEEN ? AND ?
                AND p.id_estado NOT IN (5, 7)
                ${tenantId ? 'AND p.id_tenant = ?' : ''}
            GROUP BY periodo
            ORDER BY periodo ASC
        `;

        const params_query = tenantId 
            ? [formatoFecha, fechaInicio, fechaFin, tenantId]
            : [formatoFecha, fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params_query);
        
        return {
            periodo: nombrePeriodo,
            datos: rows
        };
    }

    /**
     * Obtiene métricas generales del período
     */
    static async getMetricas(fechaInicio, fechaFin, tenantId = null) {
        const query = `
            SELECT 
                COUNT(DISTINCT p.id_pedido) as total_pedidos,
                SUM(p.total) as total_ventas,
                AVG(p.total) as ticket_promedio,
                SUM(dp.cantidad) as total_productos_vendidos,
                COUNT(DISTINCT p.id_usuario) as clientes_unicos,
                COUNT(DISTINCT dp.id_producto) as productos_distintos_vendidos
            FROM pedidos p
            INNER JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            WHERE p.fecha_pedido BETWEEN ? AND ?
                AND p.id_estado NOT IN (5, 7)
                ${tenantId ? 'AND p.id_tenant = ?' : ''}
        `;

        const params = tenantId 
            ? [fechaInicio, fechaFin, tenantId]
            : [fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params);
        return rows[0] || {};
    }

    /**
     * Obtiene productos más vendidos
     */
    static async getProductosMasVendidos(fechaInicio, fechaFin, limite = 10, tenantId = null) {
        const query = `
            SELECT 
                pr.id_producto,
                pr.nombre,
                pr.precio,
                c.nombre as categoria,
                SUM(dp.cantidad) as cantidad_vendida,
                SUM(dp.subtotal) as ingresos_totales,
                COUNT(DISTINCT dp.id_pedido) as veces_pedido
            FROM detalle_pedidos dp
            INNER JOIN productos pr ON dp.id_producto = pr.id_producto
            INNER JOIN categorias c ON pr.id_categoria = c.id_categoria
            INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE p.fecha_pedido BETWEEN ? AND ?
                AND p.id_estado NOT IN (5, 7)
                ${tenantId ? 'AND p.id_tenant = ?' : ''}
            GROUP BY pr.id_producto, pr.nombre, pr.precio, c.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT ${parseInt(limite)}
        `;

        const params = tenantId 
            ? [fechaInicio, fechaFin, tenantId]
            : [fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params);
        return rows;
    }

    /**
     * Obtiene ventas por categoría
     */
    static async getVentasPorCategoria(fechaInicio, fechaFin, tenantId = null) {
        const tenantFilter = tenantId ? 'AND p2.id_tenant = ?' : '';
        const query = `
            SELECT 
                c.id_categoria,
                c.nombre as categoria,
                COUNT(DISTINCT dp.id_pedido) as pedidos,
                SUM(dp.cantidad) as productos_vendidos,
                SUM(dp.subtotal) as total_ventas,
                ROUND((SUM(dp.subtotal) / (
                    SELECT SUM(p2.total) 
                    FROM pedidos p2 
                    WHERE p2.fecha_pedido BETWEEN ? AND ?
                        AND p2.id_estado NOT IN (5, 7)
                        ${tenantFilter}
                )) * 100, 2) as porcentaje_ventas
            FROM detalle_pedidos dp
            INNER JOIN productos pr ON dp.id_producto = pr.id_producto
            INNER JOIN categorias c ON pr.id_categoria = c.id_categoria
            INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
            WHERE p.fecha_pedido BETWEEN ? AND ?
                AND p.id_estado NOT IN (5, 7)
                ${tenantId ? 'AND p.id_tenant = ?' : ''}
            GROUP BY c.id_categoria, c.nombre
            ORDER BY total_ventas DESC
        `;

        const params = tenantId 
            ? [fechaInicio, fechaFin, tenantId, fechaInicio, fechaFin, tenantId]
            : [fechaInicio, fechaFin, fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params);
        return rows;
    }

    /**
     * Obtiene métodos de pago más usados
     */
    static async getMetodosPago(fechaInicio, fechaFin, tenantId = null) {
        const tenantFilter = tenantId ? 'AND id_tenant = ?' : '';
        const query = `
            SELECT 
                metodo_pago,
                COUNT(*) as cantidad_pedidos,
                SUM(total) as total_ventas,
                ROUND((COUNT(*) / (
                    SELECT COUNT(*) 
                    FROM pedidos 
                    WHERE fecha_pedido BETWEEN ? AND ?
                        AND id_estado NOT IN (5, 7)
                        ${tenantFilter}
                )) * 100, 2) as porcentaje_uso
            FROM pedidos
            WHERE fecha_pedido BETWEEN ? AND ?
                AND id_estado NOT IN (5, 7)
                ${tenantFilter}
            GROUP BY metodo_pago
            ORDER BY cantidad_pedidos DESC
        `;

        const params = tenantId 
            ? [fechaInicio, fechaFin, tenantId, fechaInicio, fechaFin, tenantId]
            : [fechaInicio, fechaFin, fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params);
        return rows;
    }

    /**
     * Obtiene reporte completo para un período
     */
    static async getReporteCompleto(params) {
        const { fechaInicio, fechaFin, agruparPor = 'dia', tenantId } = params;

        const [metricas, ventasPorPeriodo, topProductos, ventasPorCategoria, metodosPago] = await Promise.all([
            this.getMetricas(fechaInicio, fechaFin, tenantId),
            this.getVentasPorPeriodo({ fechaInicio, fechaFin, agruparPor, tenantId }),
            this.getProductosMasVendidos(fechaInicio, fechaFin, 10, tenantId),
            this.getVentasPorCategoria(fechaInicio, fechaFin, tenantId),
            this.getMetodosPago(fechaInicio, fechaFin, tenantId)
        ]);

        return {
            periodo: {
                inicio: fechaInicio,
                fin: fechaFin,
                agrupacion: agruparPor
            },
            metricas,
            ventas_por_periodo: ventasPorPeriodo.datos,
            productos_mas_vendidos: topProductos,
            ventas_por_categoria: ventasPorCategoria,
            metodos_pago: metodosPago
        };
    }

    /**
     * Obtiene datos detallados para exportación
     */
    static async getDatosExportacion(fechaInicio, fechaFin, tenantId = null) {
        const query = `
            SELECT 
                p.id_pedido,
                p.numero_pedido,
                DATE_FORMAT(p.fecha_pedido, '%Y-%m-%d %H:%i:%s') as fecha,
                CONCAT(u.nombre, ' ', u.apellido) as cliente,
                u.email as email_cliente,
                pr.nombre as producto,
                c.nombre as categoria,
                dp.cantidad,
                dp.precio_unitario,
                dp.subtotal,
                p.total as total_pedido,
                p.metodo_pago,
                CASE p.id_estado
                    WHEN 1 THEN 'Pendiente'
                    WHEN 2 THEN 'En Preparación'
                    WHEN 3 THEN 'Listo para Recoger'
                    WHEN 4 THEN 'Entregado'
                    WHEN 5 THEN 'Cancelado'
                    WHEN 6 THEN 'En Camino'
                    WHEN 7 THEN 'Rechazado'
                    ELSE 'Desconocido'
                END as estado
            FROM pedidos p
            INNER JOIN detalle_pedidos dp ON p.id_pedido = dp.id_pedido
            INNER JOIN productos pr ON dp.id_producto = pr.id_producto
            INNER JOIN categorias c ON pr.id_categoria = c.id_categoria
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.fecha_pedido BETWEEN ? AND ?
                AND p.id_estado NOT IN (5, 7)
                ${tenantId ? 'AND p.id_tenant = ?' : ''}
            ORDER BY p.fecha_pedido DESC, p.id_pedido, dp.id_detalle
        `;

        const params = tenantId 
            ? [fechaInicio, fechaFin, tenantId]
            : [fechaInicio, fechaFin];
        const [rows] = await db.execute(query, params);
        return rows;
    }
}

module.exports = ReportesModel;
