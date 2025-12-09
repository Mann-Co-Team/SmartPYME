const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedido.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validateTenant } = require('../middlewares/tenant');
const { auditAction, AUDIT_MODULES, AUDIT_ACTIONS } = require('../middlewares/audit');

// Leer todos los pedidos - roles admin y empleado O mis propios pedidos si soy cliente
router.get('/', authenticateToken, validateTenant, PedidoController.getAll);

// Leer pedido por ID - roles admin, empleado y cliente
router.get('/:id', authenticateToken, validateTenant, requireRole([1, 2, 3]), PedidoController.getById);

// RF-4: Obtener detalle completo con historial de estados
router.get('/:id/detalle', authenticateToken, validateTenant, requireRole([1, 2, 3]), PedidoController.getDetallePedido);

// Crear pedido - clientes (rol 3), admins (rol 1) y empleados (rol 2)
router.post('/',
    authenticateToken,
    validateTenant,
    requireRole([1, 2, 3]),
    auditAction(AUDIT_MODULES.PEDIDOS, AUDIT_ACTIONS.PEDIDOS.CREAR, (req, data) =>
        `Pedido ${data.data?.numero_pedido || 'N/A'} creado por $${data.data?.total || 0}`
    ),
    PedidoController.create
);

// Cancelar pedido - cliente puede cancelar su propio pedido si está pendiente
router.post('/:id/cancelar',
    authenticateToken,
    validateTenant,
    requireRole([3]),
    auditAction(AUDIT_MODULES.PEDIDOS, AUDIT_ACTIONS.PEDIDOS.CANCELAR, (req, data) =>
        `Pedido ID ${req.params.id} cancelado por cliente`
    ),
    PedidoController.cancelarPedido
);

// Solicitar cancelación - cliente solicita cancelación (requiere aprobación)
router.post('/:id/solicitar-cancelacion', authenticateToken, validateTenant, requireRole([3]), PedidoController.solicitarCancelacion);

// Aprobar/Rechazar cancelación - admin/empleado
router.post('/:id/aprobar-cancelacion', authenticateToken, validateTenant, requireRole([1, 2]), PedidoController.aprobarCancelacion);

// RF-4: Cambiar estado de pedido - admin/empleado
router.post('/:id/cambiar-estado',
    authenticateToken,
    validateTenant,
    requireRole([1, 2]),
    auditAction(AUDIT_MODULES.PEDIDOS, AUDIT_ACTIONS.PEDIDOS.CAMBIAR_ESTADO, (req, data) =>
        `Pedido ID ${req.params.id} cambió a estado ${req.body.id_estado}`
    ),
    PedidoController.cambiarEstado
);

// Actualizar estado pedido - roles admin y empleado
router.patch('/:id', authenticateToken, validateTenant, requireRole([1, 2]), PedidoController.update);

// Eliminar pedido - roles admin
router.delete('/:id', authenticateToken, validateTenant, requireRole([1]), PedidoController.delete);

module.exports = router;
