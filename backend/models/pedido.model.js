const db = require('../config/db');

class PedidoModel {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT 
                p.id_pedido, 
                CONCAT(c.nombre, ' ', c.apellido) AS cliente, 
                CONCAT(u.nombre, ' ', u.apellido) AS empleado, 
                p.fecha_pedido, 
                e.nombre_estado, 
                p.total, 
                p.metodo_pago
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            ORDER BY p.fecha_pedido DESC
        `);
        return rows;
    }

    static async getByUserId(userId) {
        // Obtener email del usuario y luego buscar el cliente
        const [usuario] = await db.execute(
            'SELECT email FROM usuarios WHERE id_usuario = ?',
            [userId]
        );
        
        if (!usuario.length) {
            return [];
        }
        
        // Buscar cliente por email
        const [cliente] = await db.execute(
            'SELECT id_cliente FROM clientes WHERE email = ?',
            [usuario[0].email]
        );
        
        if (!cliente.length) {
            return [];
        }
        
        const clienteId = cliente[0].id_cliente;
        
        const [rows] = await db.execute(`
            SELECT 
                p.id_pedido AS id,
                p.fecha_pedido,
                p.total,
                e.nombre_estado AS estado,
                p.metodo_pago,
                p.notas
            FROM pedidos p
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            WHERE p.id_cliente = ?
            ORDER BY p.fecha_pedido DESC
        `, [clienteId]);
        
        // Obtener detalle de productos para cada pedido
        for (let pedido of rows) {
            const [detalle] = await db.execute(`
                SELECT 
                    dp.cantidad,
                    dp.precio_unitario,
                    dp.subtotal,
                    pr.nombre AS producto,
                    pr.imagen
                FROM detalle_pedidos dp
                INNER JOIN productos pr ON dp.id_producto = pr.id_producto
                WHERE dp.id_pedido = ?
            `, [pedido.id]);
            pedido.productos = detalle;
        }
        
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute(`
            SELECT p.*, c.nombre AS cliente, u.nombre AS empleado, e.nombre_estado
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            WHERE p.id_pedido = ?
        `, [id]);

        if (rows.length === 0) return null;

        // Obtener detalle
        const [detalle] = await db.execute(`
            SELECT dp.id_detalle, pr.nombre, dp.cantidad, dp.precio_unitario, dp.subtotal
            FROM detalle_pedidos dp
            LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?
        `, [id]);

        return { ...rows[0], detalle };
    }

    // Validar stock disponible para todos los items del pedido
    static async validarStock(items) {
        const productosInsuficientes = [];
        
        for (let item of items) {
            const [rows] = await db.execute(
                'SELECT nombre, stock FROM productos WHERE id_producto = ?',
                [item.id_producto]
            );
            
            if (rows.length === 0) {
                productosInsuficientes.push({ 
                    nombre: 'Producto desconocido', 
                    solicitado: item.cantidad, 
                    disponible: 0 
                });
            } else if (rows[0].stock < item.cantidad) {
                productosInsuficientes.push({ 
                    nombre: rows[0].nombre, 
                    solicitado: item.cantidad, 
                    disponible: rows[0].stock 
                });
            }
        }
        
        return productosInsuficientes;
    }

    // Generar número de pedido único
    static generarNumeroPedido() {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PED-${year}${month}${day}-${random}`;
    }

    static async create(data) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const { id_cliente, id_usuario_cliente, id_usuario, items, total, metodo_pago, notas } = data;
            
            // Validar stock antes de crear pedido
            const productosInsuficientes = await this.validarStock(items);
            if (productosInsuficientes.length > 0) {
                throw { 
                    code: 'STOCK_INSUFICIENTE', 
                    productos: productosInsuficientes 
                };
            }
            
            // Si no hay id_cliente pero hay id_usuario_cliente (rol cliente), crear cliente
            let clienteId = id_cliente;
            if (!clienteId && id_usuario_cliente) {
                // Buscar si ya existe un cliente para este usuario
                const [clienteExistente] = await connection.execute(
                    'SELECT id_cliente FROM clientes WHERE email = (SELECT email FROM usuarios WHERE id_usuario = ?)',
                    [id_usuario_cliente]
                );
                
                if (clienteExistente.length > 0) {
                    clienteId = clienteExistente[0].id_cliente;
                } else {
                    // Crear cliente desde usuario
                    const [usuario] = await connection.execute(
                        'SELECT nombre, apellido, email, telefono FROM usuarios WHERE id_usuario = ?',
                        [id_usuario_cliente]
                    );
                    
                    if (usuario.length > 0) {
                        const [resultCliente] = await connection.execute(
                            'INSERT INTO clientes (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)',
                            [usuario[0].nombre, usuario[0].apellido || '', usuario[0].email, usuario[0].telefono]
                        );
                        clienteId = resultCliente.insertId;
                    } else {
                        throw new Error('Usuario no encontrado');
                    }
                }
            }
            
            if (!clienteId) {
                throw new Error('No se pudo obtener o crear el registro de cliente');
            }
            
            // Insertar pedido
            const [result] = await connection.execute(`
                INSERT INTO pedidos (id_cliente, id_usuario, total, metodo_pago, notas)
                VALUES (?, ?, ?, ?, ?)
            `, [clienteId, id_usuario || null, total, metodo_pago, notas]);

            const pedidoId = result.insertId;

            // Insertar detalle y actualizar stock
            for (let item of items) {
                await connection.execute(`
                    INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [pedidoId, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]);
                
                // Decrementar stock
                await connection.execute(`
                    UPDATE productos SET stock = stock - ? WHERE id_producto = ?
                `, [item.cantidad, item.id_producto]);
            }
            
            await connection.commit();
            return { id: pedidoId };
            
        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en PedidoModel.create:', error.message, error.code);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, data) {
        const { id_estado } = data;
        const [result] = await db.execute(`
            UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?
        `, [id_estado, id]);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute(`
            DELETE FROM pedidos WHERE id_pedido = ?
        `, [id]);
        return result.affectedRows > 0;
    }

    // Obtener pedido por ID y verificar que pertenece al usuario
    static async getByIdAndUserId(pedidoId, userId) {
        const [rows] = await db.execute(`
            SELECT 
                p.id_pedido AS id,
                p.fecha_pedido,
                p.total,
                e.nombre_estado AS estado,
                p.metodo_pago,
                p.notas
            FROM pedidos p
            INNER JOIN clientes c ON p.id_cliente = c.id_cliente
            INNER JOIN usuarios u ON c.email = u.email
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            WHERE p.id_pedido = ? AND u.id_usuario = ?
        `, [pedidoId, userId]);
        
        return rows.length > 0 ? rows[0] : null;
    }

    // Cancelar pedido y devolver stock
    static async cancelarPedido(pedidoId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Obtener items del pedido
            const [items] = await connection.execute(`
                SELECT id_producto, cantidad
                FROM detalle_pedidos
                WHERE id_pedido = ?
            `, [pedidoId]);

            // Devolver stock de cada producto
            for (let item of items) {
                await connection.execute(`
                    UPDATE productos 
                    SET stock = stock + ? 
                    WHERE id_producto = ?
                `, [item.cantidad, item.id_producto]);
            }

            // Obtener id_estado de 'Cancelado'
            const [estadoCancelado] = await connection.execute(`
                SELECT id_estado FROM estados_pedido WHERE nombre_estado = 'Cancelado'
            `);

            // Actualizar estado del pedido a 'cancelado'
            await connection.execute(`
                UPDATE pedidos 
                SET id_estado = ?
                WHERE id_pedido = ?
            `, [estadoCancelado[0].id_estado, pedidoId]);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            console.error('Error cancelando pedido:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Solicitar cancelación (cambia estado a 'solicitud_cancelacion')
    static async solicitarCancelacion(pedidoId, motivo) {
        // Obtener id_estado de 'Solicitud Cancelación' (o similar)
        const [estadoSolicitud] = await db.execute(`
            SELECT id_estado FROM estados_pedido WHERE nombre_estado LIKE '%Cancelaci%'
        `);
        
        const [result] = await db.execute(`
            UPDATE pedidos 
            SET id_estado = ?,
                notas = CONCAT(COALESCE(notas, ''), '\n[SOLICITUD CANCELACIÓN] ', ?)
            WHERE id_pedido = ?
        `, [estadoSolicitud[0]?.id_estado || 1, motivo, pedidoId]);
        
        return result.affectedRows > 0;
    }

    // Rechazar cancelación (vuelve a estado 'confirmado')
    static async rechazarCancelacion(pedidoId) {
        // Obtener id_estado de 'Confirmado'
        const [estadoConfirmado] = await db.execute(`
            SELECT id_estado FROM estados_pedido WHERE nombre_estado = 'Confirmado'
        `);
        
        const [result] = await db.execute(`
            UPDATE pedidos 
            SET id_estado = ?,
                notas = CONCAT(COALESCE(notas, ''), '\n[CANCELACIÓN RECHAZADA] ', NOW())
            WHERE id_pedido = ?
        `, [estadoConfirmado[0].id_estado, pedidoId]);
        
        return result.affectedRows > 0;
    }

    // ==================== RF-4: SEGUIMIENTO DE ESTADO ====================
    
    // Obtener historial de estados de un pedido
    static async getHistorialEstados(pedidoId) {
        const [rows] = await db.execute(`
            SELECT 
                h.id_historial,
                h.id_pedido,
                e.nombre_estado AS estado,
                h.notas,
                h.fecha_cambio,
                u.nombre AS usuario_nombre,
                u.apellido AS usuario_apellido
            FROM historial_estados_pedido h
            INNER JOIN estados_pedido e ON h.id_estado = e.id_estado
            LEFT JOIN usuarios u ON h.id_usuario = u.id_usuario
            WHERE h.id_pedido = ?
            ORDER BY h.fecha_cambio ASC
        `, [pedidoId]);
        
        return rows;
    }

    // Obtener detalle completo de un pedido con historial
    static async getDetalleConHistorial(pedidoId, userId = null) {
        // Obtener información del pedido
        const [pedido] = await db.execute(`
            SELECT 
                p.id_pedido,
                p.id_cliente,
                p.fecha_pedido,
                p.total,
                p.id_estado,
                e.nombre_estado AS estado,
                p.metodo_pago,
                p.notas,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente,
                c.email AS email_cliente,
                c.telefono AS telefono_cliente
            FROM pedidos p
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_pedido = ?
        `, [pedidoId]);

        if (pedido.length === 0) {
            return null;
        }

        const pedidoData = pedido[0];

        // Si se proporciona userId (cliente), verificar que el pedido pertenece al usuario
        if (userId) {
            const [usuario] = await db.execute(
                'SELECT email FROM usuarios WHERE id_usuario = ?',
                [userId]
            );
            
            if (usuario.length === 0) {
                return null;
            }

            const [cliente] = await db.execute(
                'SELECT id_cliente FROM clientes WHERE email = ?',
                [usuario[0].email]
            );

            if (cliente.length === 0 || cliente[0].id_cliente !== pedidoData.id_cliente) {
                return null;
            }
        }

        // Obtener productos del pedido
        const [productos] = await db.execute(`
            SELECT 
                dp.cantidad,
                dp.precio_unitario,
                dp.subtotal,
                pr.nombre AS nombre_producto,
                pr.imagen AS imagen_url,
                pr.descripcion
            FROM detalle_pedidos dp
            INNER JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?
        `, [pedidoId]);

        // Obtener historial de estados
        const historial = await this.getHistorialEstados(pedidoId);

        return {
            pedido: pedidoData,
            productos,
            historial
        };
    }

    // Cambiar estado de un pedido (solo admin/empleado)
    static async cambiarEstado(pedidoId, nuevoEstadoId, usuarioId, notas = null) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Actualizar estado del pedido
            await connection.execute(`
                UPDATE pedidos 
                SET id_estado = ?, id_usuario = ?
                WHERE id_pedido = ?
            `, [nuevoEstadoId, usuarioId, pedidoId]);

            // El trigger se encargará de insertar en historial_estados_pedido
            // Pero si queremos agregar notas personalizadas, podemos actualizar el último registro
            if (notas) {
                await connection.execute(`
                    UPDATE historial_estados_pedido
                    SET notas = ?
                    WHERE id_pedido = ? AND id_estado = ?
                    ORDER BY fecha_cambio DESC
                    LIMIT 1
                `, [notas, pedidoId, nuevoEstadoId]);
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            console.error('Error cambiando estado:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = PedidoModel;
