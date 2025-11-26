const PedidoModel = require('../models/pedido.model');
const NotificacionModel = require('../models/notificaciones.model');
const EmailService = require('../services/email.service');

class PedidoController {
    static async getAll(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            // Si es cliente (rol 3), solo mostrar sus propios pedidos
            if (req.user.role === 3) {
                const pedidos = await PedidoModel.getByUserId(req.user.userId, tenantId);
                res.json({ success: true, data: pedidos });
            } else {
                // Admin y empleados ven todos los pedidos
                const pedidos = await PedidoModel.getAll(tenantId);
                res.json({ success: true, data: pedidos });
            }
        } catch (error) {
            console.error('Error obteniendo pedidos:', error);
            res.status(500).json({ success: false, message: 'Error interno al obtener pedidos' });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const pedido = await PedidoModel.getById(id, tenantId);
            if (!pedido) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, data: pedido });
        } catch (error) {
            console.error('Error obteniendo pedido:', error);
            res.status(500).json({ success: false, message: 'Error interno al obtener pedido' });
        }
    }

    static async create(req, res) {
        try {
            console.log('📦 Creando pedido con datos:', JSON.stringify(req.body, null, 2));

            // Si el usuario es un cliente (rol 3), agregar su id_usuario como id_usuario_cliente
            const tenantId = req.tenant?.id || req.user?.tenant_id || 1;

            // VALIDACIÓN MULTI-TENANT: Verificar que el usuario pertenezca al tenant correcto
            if (req.user.role === 3 && req.user.tenant_id !== tenantId) {
                console.error(`❌ Intento de pedido cross-tenant: Usuario tenant=${req.user.tenant_id}, Pedido tenant=${tenantId}`);
                return res.status(403).json({
                    success: false,
                    message: 'No puedes realizar pedidos en esta tienda. Por favor, inicia sesión con una cuenta de esta tienda.'
                });
            }

            const pedidoData = {
                ...req.body,
                id_tenant: tenantId,
                id_usuario_cliente: req.user.role === 3 ? req.user.userId : undefined,
                id_usuario: req.user.userId
            };

            const pedidoCreado = await PedidoModel.create(pedidoData);

            // Enviar email y crear notificación para admins
            try {
                // Obtener información del cliente
                const db = require('../config/db');
                const [clientes] = await db.execute(
                    'SELECT * FROM usuarios WHERE id_usuario = ?',
                    [req.user.userId]
                );
                const cliente = clientes[0] || { nombre: 'Cliente', email: '' };

                // Enviar email a admins
                await EmailService.sendNewOrderEmail(
                    {
                        id_pedido: pedidoCreado.numero_pedido,
                        total: req.body.total,
                        metodo_pago: req.body.metodo_pago || 'No especificado',
                        tipo_entrega: req.body.metodo_entrega,
                        direccion_entrega: req.body.direccion_entrega,
                        fecha_pedido: new Date(),
                        notas: req.body.notas
                    },
                    cliente
                );

                // Crear notificación in-app para admins/empleados
                await NotificacionModel.createForAdminsAndEmployees(
                    'nuevo_pedido',
                    `Nuevo pedido ${pedidoCreado.numero_pedido} (#${pedidoCreado.id})`,
                    `Cliente: ${cliente.nombre} - Total: $${parseFloat(req.body.total).toLocaleString('es-CL')}`,
                    pedidoCreado.id,
                    'pedido',
                    tenantId
                );

                console.log(`✅ Notificaciones enviadas para pedido #${pedidoCreado.numero_pedido}`);

                // Verificar si hay productos agotados (stock = 0)
                if (pedidoCreado.productosAgotados && pedidoCreado.productosAgotados.length > 0) {
                    for (const producto of pedidoCreado.productosAgotados) {
                        // Enviar email de stock agotado
                        await EmailService.sendLowStockEmail(producto, 0);

                        // Crear notificación de stock agotado para admins/empleados
                        await NotificacionModel.createForAdminsAndEmployees(
                            'stock_agotado',
                            `🚫 Stock agotado: ${producto.nombre}`,
                            `El producto se ha quedado sin stock. Reponer urgente.`,
                            producto.id_producto,
                            'producto',
                            tenantId
                        );

                        console.log(`🚫 Alerta de stock agotado enviada para: ${producto.nombre}`);
                    }
                }

                // Verificar si hay productos con stock bajo (1-5 unidades)
                if (pedidoCreado.productosConStockBajo && pedidoCreado.productosConStockBajo.length > 0) {
                    for (const producto of pedidoCreado.productosConStockBajo) {
                        // Enviar email de stock bajo
                        await EmailService.sendLowStockEmail(producto, producto.stock);

                        // Crear notificación para admins/empleados
                        await NotificacionModel.createForAdminsAndEmployees(
                            'stock_critico',
                            `⚠️ Stock bajo: ${producto.nombre}`,
                            `Solo quedan ${producto.stock} unidades`,
                            producto.id_producto,
                            'producto',
                            tenantId
                        );

                        console.log(`⚠️ Alerta de stock bajo enviada para: ${producto.nombre}`);
                    }
                }
            } catch (notifError) {
                console.error('⚠️ Error enviando notificaciones:', notifError.message);
                // No fallar la creación del pedido si las notificaciones fallan
            }

            res.status(201).json({
                success: true,
                message: 'Pedido creado exitosamente',
                data: pedidoCreado
            });
        } catch (error) {
            console.error('Error creando pedido:', error);

            // Manejar error de stock insuficiente
            if (error.code === 'STOCK_INSUFICIENTE') {
                const detalles = error.productos.map(p =>
                    `${p.nombre}: solicitado ${p.solicitado}, disponible ${p.disponible}`
                ).join('; ');

                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente, ajuste su pedido',
                    detalles: error.productos
                });
            }

            // Error genérico con reversión automática
            res.status(500).json({
                success: false,
                message: 'Error de conexión. Intente nuevamente más tarde'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const updated = await PedidoModel.update(id, req.body, tenantId);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, message: 'Estado del pedido actualizado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al actualizar pedido' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const deleted = await PedidoModel.delete(id, tenantId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
            }
            res.json({ success: true, message: 'Pedido eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno al eliminar pedido' });
        }
    }

    // OPCIÓN 1: Cancelación simple (solo si está pendiente)
    static async cancelarPedido(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;

            // Verificar que el pedido pertenece al usuario
            const pedido = await PedidoModel.getByIdAndUserId(id, userId);

            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado o no tienes permisos para cancelarlo'
                });
            }

            // Verificar que el pedido esté en estado pendiente
            const estadoLower = pedido.estado?.toLowerCase();
            if (estadoLower !== 'pendiente') {
                return res.status(400).json({
                    success: false,
                    message: `No puedes cancelar un pedido en estado "${pedido.estado}". Solo se pueden cancelar pedidos pendientes.`
                });
            }

            // Cancelar el pedido (devuelve stock automáticamente)
            await PedidoModel.cancelarPedido(id);

            res.json({
                success: true,
                message: 'Pedido cancelado exitosamente. El stock ha sido devuelto.'
            });

        } catch (error) {
            console.error('Error cancelando pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cancelar el pedido'
            });
        }
    }

    // OPCIÓN 2 y 3: Solicitar cancelación (requiere aprobación)
    static async solicitarCancelacion(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const { motivo } = req.body;

            // Verificar que el pedido pertenece al usuario
            const pedido = await PedidoModel.getByIdAndUserId(id, userId);

            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado o no tienes permisos'
                });
            }

            // Verificar estados válidos para solicitar cancelación
            const estadoLower = pedido.estado?.toLowerCase();
            const estadosValidos = ['pendiente', 'confirmado', 'en proceso'];
            if (!estadosValidos.includes(estadoLower)) {
                return res.status(400).json({
                    success: false,
                    message: `No puedes solicitar cancelación de un pedido en estado "${pedido.estado}"`
                });
            }

            // Ya tiene solicitud pendiente
            if (estadoLower === 'solicitud_cancelacion') {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una solicitud de cancelación pendiente para este pedido'
                });
            }

            // Registrar solicitud
            await PedidoModel.solicitarCancelacion(id, motivo || 'Sin motivo especificado');

            res.json({
                success: true,
                message: 'Solicitud de cancelación enviada. Un administrador la revisará pronto.'
            });

        } catch (error) {
            console.error('Error solicitando cancelación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al solicitar cancelación'
            });
        }
    }

    // OPCIÓN 3: Aprobar o rechazar cancelación (admin/empleado)
    static async aprobarCancelacion(req, res) {
        try {
            const { id } = req.params;
            const { aprobar } = req.body; // true o false

            const pedido = await PedidoModel.getById(id);

            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            if (pedido.estado !== 'solicitud_cancelacion') {
                return res.status(400).json({
                    success: false,
                    message: 'Este pedido no tiene una solicitud de cancelación pendiente'
                });
            }

            if (aprobar) {
                // Aprobar cancelación - cancela el pedido y devuelve stock
                await PedidoModel.cancelarPedido(id);
                res.json({
                    success: true,
                    message: 'Solicitud de cancelación aprobada. El pedido ha sido cancelado y el stock devuelto.'
                });
            } else {
                // Rechazar cancelación - vuelve al estado anterior
                await PedidoModel.rechazarCancelacion(id);
                res.json({
                    success: true,
                    message: 'Solicitud de cancelación rechazada. El pedido continúa en proceso.'
                });
            }

        } catch (error) {
            console.error('Error aprobando/rechazando cancelación:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar la solicitud'
            });
        }
    }

    // ==================== RF-4: SEGUIMIENTO DE ESTADO ====================

    // Obtener detalle completo de un pedido con historial de estados
    static async getDetallePedido(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.role === 3 ? req.user.userId : null;

            console.log(`📋 Obteniendo detalle del pedido #${id} para usuario ${req.user.userId} (rol: ${req.user.role})`);

            const pedido = await PedidoModel.getDetalleConHistorial(id, userId);

            console.log(`📦 Resultado de getDetalleConHistorial:`, pedido ? 'Pedido encontrado' : 'Pedido NO encontrado');

            if (!pedido) {
                console.log(`❌ Pedido #${id} no encontrado o sin permisos para userId: ${userId}`);
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado o no tienes permisos para verlo'
                });
            }

            console.log(`✅ Enviando detalle del pedido #${id}`);
            res.json({ success: true, data: pedido });

        } catch (error) {
            console.error('❌ Error obteniendo detalle del pedido:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener detalle del pedido',
                error: error.message
            });
        }
    }

    // RF-7: Cambiar estado de un pedido (solo admin/empleado)
    static async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { id_estado, notas } = req.body;

            if (!id_estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El id_estado es requerido'
                });
            }

            const result = await PedidoModel.cambiarEstado(
                id,
                id_estado,
                req.user.userId,
                notas
            );

            if (result) {
                // Enviar email y notificación de cambio de estado
                try {
                    const db = require('../config/db');

                    // Obtener info del pedido y cliente
                    const [pedidos] = await db.execute(`
                        SELECT p.*, u.nombre, u.email, ep.nombre_estado
                        FROM pedidos p
                        JOIN usuarios u ON p.id_cliente = u.id_usuario
                        JOIN estados_pedido ep ON p.id_estado = ep.id_estado
                        WHERE p.id_pedido = ?
                    `, [id]);

                    if (pedidos.length > 0) {
                        const pedido = pedidos[0];
                        const cliente = {
                            nombre: pedido.nombre,
                            email: pedido.email
                        };

                        // Enviar email al cliente
                        await EmailService.sendOrderStatusEmail(
                            {
                                id_pedido: id,
                                total: pedido.total,
                                fecha_pedido: pedido.fecha_pedido
                            },
                            cliente,
                            pedido.nombre_estado
                        );

                        // Crear notificación para admins/empleados
                        await NotificacionModel.createForAdminsAndEmployees(
                            'cambio_estado',
                            `Pedido ${pedido.numero_pedido} (#${id}) - ${pedido.nombre_estado}`,
                            `El pedido cambió a estado: ${pedido.nombre_estado}`,
                            id,
                            'pedido'
                        );

                        console.log(`✅ Notificaciones enviadas para cambio de estado del pedido #${id}`);
                    }
                } catch (notifError) {
                    console.error('⚠️ Error enviando notificaciones:', notifError.message);
                }

                res.json({
                    success: true,
                    message: 'Estado del pedido actualizado exitosamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al cambiar el estado'
                });
            }

        } catch (error) {
            console.error('Error cambiando estado:', error);

            // RF-7: Si el error es de validación de transición, retornar 400
            if (error.message.includes('Transición no permitida') ||
                error.message.includes('no permite cambios') ||
                error.message.includes('Pedido no encontrado')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al cambiar el estado del pedido'
            });
        }
    }
}

module.exports = PedidoController;
