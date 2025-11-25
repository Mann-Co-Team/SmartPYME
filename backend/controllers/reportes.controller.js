const ReportesModel = require('../models/reportes.model');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportesController {
    /**
     * Obtiene reporte completo según filtros
     */
    static async getReporte(req, res) {
        try {
            const { fechaInicio, fechaFin, agruparPor = 'dia' } = req.query;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren fechaInicio y fechaFin'
                });
            }

            const reporte = await ReportesModel.getReporteCompleto({
                fechaInicio,
                fechaFin,
                agruparPor,
                tenantId
            });

            res.json({
                success: true,
                data: reporte
            });
        } catch (error) {
            console.error('Error generando reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar el reporte'
            });
        }
    }

    /**
     * Exporta reporte en formato CSV
     */
    static async exportarCSV(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren fechaInicio y fechaFin'
                });
            }

            const datos = await ReportesModel.getDatosExportacion(fechaInicio, fechaFin, tenantId);

            if (datos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay datos para exportar en el período seleccionado'
                });
            }

            const fields = [
                { label: 'ID Pedido', value: 'id_pedido' },
                { label: 'Número Pedido', value: 'numero_pedido' },
                { label: 'Fecha', value: 'fecha' },
                { label: 'Cliente', value: 'cliente' },
                { label: 'Email', value: 'email_cliente' },
                { label: 'Producto', value: 'producto' },
                { label: 'Categoría', value: 'categoria' },
                { label: 'Cantidad', value: 'cantidad' },
                { label: 'Precio Unitario', value: 'precio_unitario' },
                { label: 'Subtotal', value: 'subtotal' },
                { label: 'Total Pedido', value: 'total_pedido' },
                { label: 'Método Pago', value: 'metodo_pago' },
                { label: 'Estado', value: 'estado' }
            ];

            const parser = new Parser({ fields, delimiter: ';' });
            const csv = parser.parse(datos);

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${fechaInicio}_${fechaFin}.csv`);
            res.send('\uFEFF' + csv); // BOM para UTF-8
        } catch (error) {
            console.error('Error exportando CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar CSV'
            });
        }
    }

    /**
     * Exporta reporte en formato Excel
     */
    static async exportarExcel(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren fechaInicio y fechaFin'
                });
            }

            const reporte = await ReportesModel.getReporteCompleto({
                fechaInicio,
                fechaFin,
                agruparPor: 'dia',
                tenantId
            });

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'SmartPYME';
            workbook.created = new Date();

            // Hoja 1: Resumen
            const resumenSheet = workbook.addWorksheet('Resumen');
            resumenSheet.columns = [
                { header: 'Métrica', key: 'metrica', width: 30 },
                { header: 'Valor', key: 'valor', width: 20 }
            ];

            const metricas = reporte.metricas;
            resumenSheet.addRows([
                { metrica: 'Total Pedidos', valor: metricas.total_pedidos || 0 },
                { metrica: 'Total Ventas', valor: `$${parseFloat(metricas.total_ventas || 0).toFixed(2)}` },
                { metrica: 'Ticket Promedio', valor: `$${parseFloat(metricas.ticket_promedio || 0).toFixed(2)}` },
                { metrica: 'Productos Vendidos', valor: metricas.total_productos_vendidos || 0 },
                { metrica: 'Clientes Únicos', valor: metricas.clientes_unicos || 0 },
                { metrica: 'Productos Distintos', valor: metricas.productos_distintos_vendidos || 0 }
            ]);

            // Estilo para encabezados
            resumenSheet.getRow(1).font = { bold: true };
            resumenSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            // Hoja 2: Productos Más Vendidos
            const productosSheet = workbook.addWorksheet('Top Productos');
            productosSheet.columns = [
                { header: 'Producto', key: 'nombre', width: 30 },
                { header: 'Categoría', key: 'categoria', width: 20 },
                { header: 'Cantidad Vendida', key: 'cantidad_vendida', width: 18 },
                { header: 'Ingresos', key: 'ingresos_totales', width: 18 },
                { header: 'Veces Pedido', key: 'veces_pedido', width: 15 }
            ];

            reporte.productos_mas_vendidos.forEach(prod => {
                productosSheet.addRow({
                    nombre: prod.nombre,
                    categoria: prod.categoria,
                    cantidad_vendida: prod.cantidad_vendida,
                    ingresos_totales: parseFloat(prod.ingresos_totales),
                    veces_pedido: prod.veces_pedido
                });
            });

            productosSheet.getRow(1).font = { bold: true };
            productosSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            // Hoja 3: Ventas por Categoría
            const categoriasSheet = workbook.addWorksheet('Ventas por Categoría');
            categoriasSheet.columns = [
                { header: 'Categoría', key: 'categoria', width: 25 },
                { header: 'Pedidos', key: 'pedidos', width: 15 },
                { header: 'Productos Vendidos', key: 'productos_vendidos', width: 20 },
                { header: 'Total Ventas', key: 'total_ventas', width: 18 },
                { header: '% Ventas', key: 'porcentaje_ventas', width: 15 }
            ];

            reporte.ventas_por_categoria.forEach(cat => {
                categoriasSheet.addRow({
                    categoria: cat.categoria,
                    pedidos: cat.pedidos,
                    productos_vendidos: cat.productos_vendidos,
                    total_ventas: parseFloat(cat.total_ventas),
                    porcentaje_ventas: `${cat.porcentaje_ventas}%`
                });
            });

            categoriasSheet.getRow(1).font = { bold: true };
            categoriasSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            // Hoja 4: Detalle de Ventas
            const datos = await ReportesModel.getDatosExportacion(fechaInicio, fechaFin, tenantId);
            const detalleSheet = workbook.addWorksheet('Detalle Ventas');
            detalleSheet.columns = [
                { header: 'Fecha', key: 'fecha', width: 20 },
                { header: 'N° Pedido', key: 'numero_pedido', width: 15 },
                { header: 'Cliente', key: 'cliente', width: 25 },
                { header: 'Producto', key: 'producto', width: 30 },
                { header: 'Cantidad', key: 'cantidad', width: 12 },
                { header: 'Precio', key: 'precio_unitario', width: 15 },
                { header: 'Subtotal', key: 'subtotal', width: 15 },
                { header: 'Método Pago', key: 'metodo_pago', width: 15 },
                { header: 'Estado', key: 'estado', width: 15 }
            ];

            datos.forEach(row => {
                detalleSheet.addRow(row);
            });

            detalleSheet.getRow(1).font = { bold: true };
            detalleSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            // Enviar archivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${fechaInicio}_${fechaFin}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error('Error exportando Excel:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar Excel'
            });
        }
    }

    /**
     * Exporta reporte en formato PDF
     */
    static async exportarPDF(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren fechaInicio y fechaFin'
                });
            }

            const reporte = await ReportesModel.getReporteCompleto({
                fechaInicio,
                fechaFin,
                agruparPor: 'dia',
                tenantId
            });

            const doc = new PDFDocument({ margin: 50 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_ventas_${fechaInicio}_${fechaFin}.pdf`);

            doc.pipe(res);

            // Título
            doc.fontSize(20).font('Helvetica-Bold').text('REPORTE DE VENTAS', { align: 'center' });
            doc.fontSize(12).font('Helvetica').text(`Período: ${fechaInicio} al ${fechaFin}`, { align: 'center' });
            doc.moveDown(2);

            // Métricas Generales
            doc.fontSize(14).font('Helvetica-Bold').text('Resumen General');
            doc.moveDown(0.5);

            const metricas = reporte.metricas;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Total de Pedidos: ${metricas.total_pedidos || 0}`);
            doc.text(`Total de Ventas: $${(metricas.total_ventas || 0).toLocaleString('es-CL', { minimumFractionDigits: 2 })}`);
            doc.text(`Ticket Promedio: $${(metricas.ticket_promedio || 0).toLocaleString('es-CL', { minimumFractionDigits: 2 })}`);
            doc.text(`Productos Vendidos: ${metricas.total_productos_vendidos || 0}`);
            doc.text(`Clientes Únicos: ${metricas.clientes_unicos || 0}`);
            doc.moveDown(2);

            // Productos Más Vendidos
            doc.fontSize(14).font('Helvetica-Bold').text('Top 10 Productos Más Vendidos');
            doc.moveDown(0.5);

            const topProductos = reporte.productos_mas_vendidos.slice(0, 10);
            doc.fontSize(9).font('Helvetica');
            
            topProductos.forEach((prod, index) => {
                doc.text(
                    `${index + 1}. ${prod.nombre} - Vendidos: ${prod.cantidad_vendida} - Ingresos: $${parseFloat(prod.ingresos_totales).toLocaleString('es-CL', { minimumFractionDigits: 2 })}`
                );
            });

            doc.moveDown(2);

            // Ventas por Categoría
            doc.fontSize(14).font('Helvetica-Bold').text('Ventas por Categoría');
            doc.moveDown(0.5);

            doc.fontSize(9).font('Helvetica');
            reporte.ventas_por_categoria.forEach(cat => {
                doc.text(
                    `${cat.categoria}: $${parseFloat(cat.total_ventas).toLocaleString('es-CL', { minimumFractionDigits: 2 })} (${cat.porcentaje_ventas}% del total)`
                );
            });

            doc.moveDown(2);

            // Métodos de Pago
            if (reporte.metodos_pago && reporte.metodos_pago.length > 0) {
                doc.fontSize(14).font('Helvetica-Bold').text('Métodos de Pago');
                doc.moveDown(0.5);

                doc.fontSize(9).font('Helvetica');
                reporte.metodos_pago.forEach(mp => {
                    doc.text(
                        `${mp.metodo_pago}: ${mp.cantidad_pedidos} pedidos ($${parseFloat(mp.total_ventas).toLocaleString('es-CL', { minimumFractionDigits: 2 })}) - ${mp.porcentaje_uso}%`
                    );
                });
            }

            // Footer
            doc.fontSize(8).text(
                `Generado el ${new Date().toLocaleString('es-CL')} por SmartPYME`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );

            doc.end();
        } catch (error) {
            console.error('Error exportando PDF:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar PDF'
            });
        }
    }
}

module.exports = ReportesController;
