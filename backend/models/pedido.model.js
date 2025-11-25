const db = require('../config/db');

// RF-7: Transiciones válidas de estados
const TRANSICIONES_VALIDAS = {
    1: [2, 4, 7],     // Pendiente -> Confirmado, Listo, Cancelado
    2: [3, 7],        // Confirmado -> En Proceso, Cancelado
    3: [4, 7],        // En Proceso -> Listo, Cancelado
    4: [6],           // Listo -> Completado
    5: [6],           // Enviado -> Completado (no usado en flujo normal)
    6: [],            // Completado -> ninguno (estado final)
    7: []             // Cancelado -> ninguno (estado final)
};

class PedidoModel {
    static async getAll(tenantId = null) {
        if (tenantId) {
            const [rows] = await db.execute(`
                SELECT 
                    p.id_pedido,
                    p.numero_pedido,
                    p.id_estado,
                    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
                    c.email AS email_cliente,
                    CONCAT(u.nombre, ' ', u.apellido) AS empleado,
                    p.fecha_pedido,
                    e.nombre_estado,
                    p.total,
                    p.metodo_pago
                FROM pedidos p
                LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
                LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
                LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
                WHERE p.id_tenant = ?
                ORDER BY p.fecha_pedido DESC
            `, [tenantId]);
            return rows;
        }
        // Legacy mode
        const [rows] = await db.execute(`
            SELECT 
                p.id_pedido,
                p.numero_pedido,
                p.id_estado,
                CONCAT(c.nombre, ' ', c.apellido) AS cliente,
                c.email AS email_cliente,
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

    static async getByUserId(userId, tenantId = null) {
        // Obtener email del usuario y luego buscar el cliente
        const userQuery = tenantId
            ? 'SELECT email FROM usuarios WHERE id_usuario = ? AND id_tenant = ?'
            : 'SELECT email FROM usuarios WHERE id_usuario = ?';
        
        const userParams = tenantId ? [userId, tenantId] : [userId];
        const [usuario] = await db.execute(userQuery, userParams);
        
        if (!usuario.length) {
            return [];
        }
        
        // Buscar cliente por email
        const clienteQuery = tenantId
            ? 'SELECT id_cliente FROM clientes WHERE email = ? AND id_tenant = ?'
            : 'SELECT id_cliente FROM clientes WHERE email = ?';
        
        const clienteParams = tenantId ? [usuario[0].email, tenantId] : [usuario[0].email];
        const [cliente] = await db.execute(clienteQuery, clienteParams);
        
        if (!cliente.length) {
            return [];
        }
        
        const clienteId = cliente[0].id_cliente;
        
        const pedidosQuery = tenantId
            ? `SELECT 
                p.id_pedido,
                p.numero_pedido,
                p.id_estado,
                p.fecha_pedido,
                p.total,
                e.nombre_estado AS estado,
                p.metodo_pago,
                p.notas,
                p.created_at,
                CONCAT(c.nombre, ' ', c.apellido) AS cliente
            FROM pedidos p
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_cliente = ? AND p.id_tenant = ?
            ORDER BY p.fecha_pedido DESC`
            : `SELECT 
                p.id_pedido,
                p.numero_pedido,
                p.id_estado,
                p.fecha_pedido,
                p.total,
                e.nombre_estado,
                p.metodo_pago,
                p.notas,
                p.created_at,
                CONCAT(c.nombre, ' ', c.apellido) AS cliente
            FROM pedidos p
            LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            WHERE p.id_cliente = ?
            ORDER BY p.fecha_pedido DESC`;
        
        const pedidosParams = tenantId ? [clienteId, tenantId] : [clienteId];
        const [rows] = await db.execute(pedidosQuery, pedidosParams);
        
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
            `, [pedido.id_pedido]);
            pedido.productos = detalle;
        }
        
        return rows;
    }

    static async getById(id, tenantId = null) {
        const query = tenantId
            ? `SELECT 
                p.*,
                e.nombre_estado AS estado,
                c.nombre AS cliente_nombre,
                c.apellido AS cliente_apellido,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS empleado
               FROM pedidos p
               LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
               LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
               LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
               WHERE p.id_pedido = ? AND p.id_tenant = ?`
            : `SELECT 
                p.*,
                e.nombre_estado AS estado,
                c.nombre AS cliente_nombre,
                c.apellido AS cliente_apellido,
                c.email AS cliente_email,
                c.telefono AS cliente_telefono,
                u.nombre AS empleado
               FROM pedidos p
               LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
               LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
               LEFT JOIN estados_pedido e ON p.id_estado = e.id_estado
               WHERE p.id_pedido = ?`;
        
        const params = tenantId ? [id, tenantId] : [id];
        const [rows] = await db.execute(query, params);

        if (rows.length === 0) return null;

        // Obtener detalle de productos con imágenes
        const [items] = await db.execute(`
            SELECT 
                dp.id_detalle,
                dp.cantidad,
                dp.precio_unitario,
                dp.subtotal,
                pr.id_producto,
                pr.nombre AS nombre_producto,
                pr.imagen
            FROM detalle_pedidos dp
            LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?
        `, [id]);

        return { ...rows[0], items };
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
            
            // Usar id_usuario_cliente directamente (sistema unificado con tabla usuarios)
            const usuarioClienteId = id_usuario_cliente || id_usuario;
            const tenantId = data.id_tenant || 1;
            
            if (!usuarioClienteId) {
                throw new Error('Se requiere el ID del usuario para crear el pedido');
            }
            
            // Generar número de pedido único
            const numeroPedido = this.generarNumeroPedido();
            
            // Insertar pedido usando id_usuario directamente (sin tabla clientes)
            const [result] = await connection.execute(`
                INSERT INTO pedidos (numero_pedido, id_tenant, id_usuario, total, metodo_pago, notas)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [numeroPedido, tenantId, usuarioClienteId, total, metodo_pago, notas]);

            const pedidoId = result.insertId;

            // Insertar detalle y actualizar stock
            const productosConStockBajo = [];
            const productosAgotados = [];
            
            for (let item of items) {
                await connection.execute(`
                    INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                    VALUES (?, ?, ?, ?, ?)
                `, [pedidoId, item.id_producto, item.cantidad, item.precio_unitario, item.subtotal]);
                
                // Decrementar stock
                await connection.execute(`
                    UPDATE productos SET stock = stock - ? WHERE id_producto = ?
                `, [item.cantidad, item.id_producto]);

                // Verificar stock resultante
                const [productoActual] = await connection.execute(
                    'SELECT id_producto, nombre, stock FROM productos WHERE id_producto = ?',
                    [item.id_producto]
                );

                if (productoActual.length > 0) {
                    const stockActual = productoActual[0].stock;
                    
                    // Stock agotado (0)
                    if (stockActual === 0) {
                        productosAgotados.push({
                            id_producto: productoActual[0].id_producto,
                            nombre: productoActual[0].nombre,
                            stock: stockActual
                        });
                    }
                    // Stock crítico (1-5)
                    else if (stockActual > 0 && stockActual <= 5) {
                        productosConStockBajo.push({
                            id_producto: productoActual[0].id_producto,
                            nombre: productoActual[0].nombre,
                            stock: stockActual
                        });
                    }
                }
            }

            await connection.commit();
            
            // Obtener el número de pedido generado
            const [pedidoInfo] = await connection.execute(
                'SELECT numero_pedido FROM pedidos WHERE id_pedido = ?',
                [pedidoId]
            );
            
            return { 
                id: pedidoId,
                numero_pedido: pedidoInfo[0]?.numero_pedido || pedidoId,
                productosConStockBajo: productosConStockBajo.length > 0 ? productosConStockBajo : null,
                productosAgotados: productosAgotados.length > 0 ? productosAgotados : null
            };
            
        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en PedidoModel.create:', error.message, error.code);
            throw error;
        } finally {
            connection.release();
        }
    }

    static async update(id, data, tenantId = null) {
        const { id_estado } = data;
        const query = tenantId
            ? `UPDATE pedidos SET id_estado = ? WHERE id_pedido = ? AND id_tenant = ?`
            : `UPDATE pedidos SET id_estado = ? WHERE id_pedido = ?`;
        
        const params = tenantId ? [id_estado, id, tenantId] : [id_estado, id];
        const [result] = await db.execute(query, params);
        return result.affectedRows > 0;
    }

    static async delete(id, tenantId = null) {
        const query = tenantId
            ? `DELETE FROM pedidos WHERE id_pedido = ? AND id_tenant = ?`
            : `DELETE FROM pedidos WHERE id_pedido = ?`;
        
        const params = tenantId ? [id, tenantId] : [id];
        const [result] = await db.execute(query, params);
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

    // RF-7: Validar transición de estado
    static validarTransicion(estadoActualId, nuevoEstadoId) {
        // Si no hay transiciones definidas para el estado actual, no se puede cambiar
        if (!TRANSICIONES_VALIDAS[estadoActualId]) {
            return {
                valido: false,
                mensaje: 'El estado actual no permite cambios'
            };
        }

        // Verificar si el nuevo estado está en la lista de transiciones válidas
        if (!TRANSICIONES_VALIDAS[estadoActualId].includes(nuevoEstadoId)) {
            return {
                valido: false,
                mensaje: `No se puede cambiar del estado actual al estado solicitado. Transición no permitida.`
            };
        }

        return { valido: true };
    }

    // Cambiar estado de un pedido (solo admin/empleado)
    static async cambiarEstado(pedidoId, nuevoEstadoId, usuarioId, notas = null) {
        const connection = await db.getConnection();
        
        try {
            // RF-7: Obtener estado actual del pedido
            const [pedidoActual] = await connection.execute(
                'SELECT id_estado FROM pedidos WHERE id_pedido = ?',
                [pedidoId]
            );

            if (pedidoActual.length === 0) {
                throw new Error('Pedido no encontrado');
            }

            const estadoActualId = pedidoActual[0].id_estado;

            // RF-7: Validar transición
            const validacion = this.validarTransicion(estadoActualId, nuevoEstadoId);
            if (!validacion.valido) {
                throw new Error(validacion.mensaje);
            }

            await connection.beginTransaction();

            // Actualizar estado del pedido
            await connection.execute(`
                UPDATE pedidos 
                SET id_estado = ?, id_usuario = ?
                WHERE id_pedido = ?
            `, [nuevoEstadoId, usuarioId, pedidoId]);

            // Insertar registro en historial_estados_pedido
            await connection.execute(`
                INSERT INTO historial_estados_pedido (id_pedido, id_estado, id_usuario, notas)
                VALUES (?, ?, ?, ?)
            `, [pedidoId, nuevoEstadoId, usuarioId, notas || null]);

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
