const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/pedido.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Leer todos los pedidos - roles admin y empleado O mis propios pedidos si soy cliente
router.get('/', authenticateToken, PedidoController.getAll);

// Leer pedido por ID - roles admin, empleado y cliente
router.get('/:id', authenticateToken, requireRole([1, 2, 3]), PedidoController.getById);

// Crear pedido - clientes (rol 3)
router.post('/', authenticateToken, requireRole([3]), PedidoController.create);

// Cancelar pedido - cliente puede cancelar su propio pedido si está pendiente
router.post('/:id/cancelar', authenticateToken, requireRole([3]), PedidoController.cancelarPedido);

// Solicitar cancelación - cliente solicita cancelación (requiere aprobación)
router.post('/:id/solicitar-cancelacion', authenticateToken, requireRole([3]), PedidoController.solicitarCancelacion);

// Aprobar/Rechazar cancelación - admin/empleado
router.post('/:id/aprobar-cancelacion', authenticateToken, requireRole([1, 2]), PedidoController.aprobarCancelacion);

// Actualizar estado pedido - roles admin y empleado
router.patch('/:id', authenticateToken, requireRole([1, 2]), PedidoController.update);

// Eliminar pedido - roles admin
router.delete('/:id', authenticateToken, requireRole([1]), PedidoController.delete);

module.exports = router;
