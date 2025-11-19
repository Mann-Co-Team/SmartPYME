const PedidoModel = require('../models/pedido.model');

class PedidoController {
    static async getAll(req, res) {
        try {
            // Si es cliente (rol 3), solo mostrar sus propios pedidos
            if (req.user.role === 3) {
                const pedidos = await PedidoModel.getByUserId(req.user.userId);
                res.json({ success: true, data: pedidos });
            } else {
                // Admin y empleados ven todos los pedidos
                const pedidos = await PedidoModel.getAll();
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
            const pedido = await PedidoModel.getById(id);
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
            const pedidoData = await PedidoModel.create(req.body);
            
            // Simular envío de correo con número de pedido
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║               📧 NOTIFICACIÓN DE PEDIDO                      ║
╠══════════════════════════════════════════════════════════════╣
║ Número de Pedido: ${pedidoData.numero_pedido}                            ║
║ Cliente ID: ${req.body.id_cliente}                                          ║
║ Total: $${req.body.total.toFixed(2)}                                        ║
║ Método de Entrega: ${req.body.metodo_entrega || 'No especificado'}         ║
║ Dirección: ${req.body.direccion_entrega || 'No especificada'}              ║
╚══════════════════════════════════════════════════════════════╝
            `);
            
            res.status(201).json({ 
                success: true, 
                message: 'Pedido creado exitosamente', 
                data: pedidoData
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
            const updated = await PedidoModel.update(id, req.body);
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
            const deleted = await PedidoModel.delete(id);
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
            if (pedido.estado !== 'pendiente') {
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
            const estadosValidos = ['pendiente', 'confirmado', 'en_proceso'];
            if (!estadosValidos.includes(pedido.estado)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `No puedes solicitar cancelación de un pedido en estado "${pedido.estado}"` 
                });
            }

            // Ya tiene solicitud pendiente
            if (pedido.estado === 'solicitud_cancelacion') {
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
}

module.exports = PedidoController;
