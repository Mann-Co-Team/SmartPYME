const db = require('../config/db');

class DashboardModel {
    // RF-8: Obtener métricas del dashboard
    static async getMetricas() {
        try {
            // 1. Ventas totales (hoy, mes, año)
            const [ventasHoy] = await db.execute(`
                SELECT COALESCE(SUM(total), 0) as total
                FROM pedidos
                WHERE DATE(fecha_pedido) = CURDATE()
                AND id_estado != 7
            `);

            const [ventasMes] = await db.execute(`
                SELECT COALESCE(SUM(total), 0) as total
                FROM pedidos
                WHERE MONTH(fecha_pedido) = MONTH(CURDATE())
                AND YEAR(fecha_pedido) = YEAR(CURDATE())
                AND id_estado != 7
            `);

            const [ventasAnio] = await db.execute(`
                SELECT COALESCE(SUM(total), 0) as total
                FROM pedidos
                WHERE YEAR(fecha_pedido) = YEAR(CURDATE())
                AND id_estado != 7
            `);

            // 2. Pedidos activos por estado (excluyendo completados y cancelados)
            const [pedidosActivos] = await db.execute(`
                SELECT 
                    e.nombre_estado,
                    COUNT(p.id_pedido) as cantidad
                FROM estados_pedido e
                LEFT JOIN pedidos p ON e.id_estado = p.id_estado
                WHERE e.id_estado NOT IN (6, 7)
                GROUP BY e.id_estado, e.nombre_estado
                ORDER BY e.id_estado
            `);

            // 3. Total de pedidos por estado (para gráfico)
            const [pedidosPorEstado] = await db.execute(`
                SELECT 
                    e.nombre_estado,
                    e.id_estado,
                    COUNT(p.id_pedido) as cantidad
                FROM estados_pedido e
                LEFT JOIN pedidos p ON e.id_estado = p.id_estado
                GROUP BY e.id_estado, e.nombre_estado
                ORDER BY e.id_estado
            `);

            // 4. Productos más vendidos (top 5)
            const [productosTop] = await db.execute(`
                SELECT 
                    pr.id_producto,
                    pr.nombre,
                    pr.precio,
                    c.nombre AS nombre_categoria,
                    COALESCE(SUM(dp.cantidad), 0) as total_vendido,
                    COALESCE(SUM(dp.subtotal), 0) as ingresos_totales
                FROM productos pr
                LEFT JOIN detalle_pedidos dp ON pr.id_producto = dp.id_producto
                LEFT JOIN pedidos p ON dp.id_pedido = p.id_pedido
                LEFT JOIN categorias c ON pr.id_categoria = c.id_categoria
                WHERE p.id_estado != 7 OR p.id_estado IS NULL
                GROUP BY pr.id_producto, pr.nombre, pr.precio, c.nombre
                ORDER BY total_vendido DESC
                LIMIT 5
            `);

            // 5. Resumen de categorías
            const [categorias] = await db.execute(`
                SELECT 
                    c.id_categoria,
                    c.nombre AS nombre_categoria,
                    COUNT(DISTINCT pr.id_producto) as total_productos,
                    COALESCE(SUM(dp.cantidad), 0) as unidades_vendidas,
                    COALESCE(SUM(dp.subtotal), 0) as ingresos_totales
                FROM categorias c
                LEFT JOIN productos pr ON c.id_categoria = pr.id_categoria
                LEFT JOIN detalle_pedidos dp ON pr.id_producto = dp.id_producto
                LEFT JOIN pedidos p ON dp.id_pedido = p.id_pedido
                WHERE (p.id_estado != 7 OR p.id_estado IS NULL)
                GROUP BY c.id_categoria, c.nombre
                ORDER BY ingresos_totales DESC
            `);

            // 6. Estadísticas generales
            const [estadisticas] = await db.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM pedidos WHERE id_estado NOT IN (6, 7)) as pedidos_activos,
                    (SELECT COUNT(*) FROM pedidos WHERE id_estado = 6) as pedidos_completados,
                    (SELECT COUNT(*) FROM productos WHERE activo = TRUE) as productos_activos,
                    (SELECT COUNT(*) FROM clientes WHERE activo = TRUE) as clientes_activos
            `);

            return {
                ventas: {
                    hoy: parseFloat(ventasHoy[0].total),
                    mes: parseFloat(ventasMes[0].total),
                    anio: parseFloat(ventasAnio[0].total)
                },
                pedidosActivos,
                pedidosPorEstado,
                productosTop,
                categorias,
                estadisticas: estadisticas[0]
            };
        } catch (error) {
            console.error('Error al obtener métricas del dashboard:', error);
            throw error;
        }
    }

    // RF-8: Obtener gráfico de ventas por mes (últimos 6 meses)
    static async getVentasPorMes() {
        try {
            const [ventas] = await db.execute(`
                SELECT 
                    DATE_FORMAT(fecha_pedido, '%Y-%m') as mes,
                    MONTHNAME(fecha_pedido) as nombre_mes,
                    COUNT(id_pedido) as total_pedidos,
                    SUM(total) as total_ventas
                FROM pedidos
                WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                AND id_estado != 7
                GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m'), MONTHNAME(fecha_pedido)
                ORDER BY mes ASC
            `);

            return ventas;
        } catch (error) {
            console.error('Error al obtener ventas por mes:', error);
            throw error;
        }
    }
}

module.exports = DashboardModel;
