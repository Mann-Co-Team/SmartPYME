const AuditoriaModel = require('../models/auditoria.model');
const NotificacionModel = require('../models/notificaciones.model');

/**
 * Middleware de auditoría (RF-12)
 * Registra automáticamente las acciones de usuarios autenticados
 * Si falla el registro, notifica al administrador
 */

/**
 * Crear middleware de auditoría para una acción específica
 * @param {String} modulo - Módulo del sistema (productos, pedidos, usuarios, etc.)
 * @param {String} accion - Acción realizada (crear, editar, eliminar, etc.)
 * @param {Function|String} getDescripcion - Función o string para descripción
 * @returns {Function} Middleware de Express
 */
const auditAction = (modulo, accion, getDescripcion) => {
    return async (req, res, next) => {
        // Guardar referencia al método json original
        const originalJson = res.json.bind(res);

        // Sobrescribir res.json para capturar la respuesta
        res.json = function (data) {
            // Registrar auditoría después de enviar la respuesta (no bloqueante)
            setImmediate(async () => {
                try {
                    console.log('🔍 AUDIT DEBUG - req.user:', req.user);
                    console.log('🔍 AUDIT DEBUG - modulo:', modulo, 'accion:', accion);

                    // Solo auditar si hay usuario autenticado
                    if (!req.user || !req.user.tenant_id) {
                        console.log('❌ AUDIT SKIP - No user or tenant_id');
                        return;
                    }

                    // Generar descripción
                    let descripcion = '';
                    if (typeof getDescripcion === 'function') {
                        descripcion = getDescripcion(req, data);
                    } else if (typeof getDescripcion === 'string') {
                        descripcion = getDescripcion;
                    }

                    console.log('🔍 AUDIT DEBUG - descripcion:', descripcion);

                    // Extraer IP address
                    const ip_address = req.ip ||
                        req.headers['x-forwarded-for'] ||
                        req.connection.remoteAddress;

                    // Usar id_usuario o userId dependiendo de lo que esté disponible
                    const userId = req.user.id_usuario || req.user.userId || req.user.id;

                    console.log('🔍 AUDIT DEBUG - Creating audit record with userId:', userId, 'tenant:', req.user.tenant_id);

                    // Crear registro de auditoría
                    await AuditoriaModel.create({
                        id_tenant: req.user.tenant_id,
                        id_usuario: userId,
                        accion,
                        modulo,
                        descripcion,
                        tabla_afectada: req.auditTable || null,
                        id_registro: req.auditRecordId || null,
                        datos_anteriores: req.auditBefore || null,
                        datos_nuevos: data.data || data,
                        ip_address,
                        user_agent: req.get('user-agent'),
                        resultado: data.success !== false ? 'exito' : 'fallo',
                        mensaje_error: data.success === false ? data.message : null
                    });

                    console.log('✅ AUDIT SUCCESS - Record created');

                } catch (error) {
                    // Si falla el registro de auditoría, notificar al administrador
                    console.error('❌ Error en sistema de auditoría:', error);

                    try {
                        // Obtener todos los admins del tenant
                        const db = require('../config/db');
                        const [admins] = await db.execute(
                            `SELECT id_usuario FROM usuarios 
                             WHERE id_tenant = ? AND id_rol = 1 AND activo = 1`,
                            [req.user.tenant_id]
                        );

                        // Crear notificación para cada admin
                        for (const admin of admins) {
                            await NotificacionModel.create({
                                id_usuario: admin.id_usuario,
                                tipo: 'sistema',
                                titulo: '⚠️ Error en Sistema de Auditoría',
                                mensaje: `Falló el registro de auditoría para la acción "${accion}" en módulo "${modulo}". Error: ${error.message}`,
                                id_referencia: null,
                                tipo_referencia: 'auditoria_error'
                            });
                        }
                    } catch (notifError) {
                        console.error('❌ Error notificando fallo de auditoría:', notifError);
                    }
                }
            });

            // Enviar respuesta original
            return originalJson(data);
        };

        next();
    };
};

/**
 * Middleware para capturar datos antes de una modificación
 * Útil para registrar el estado anterior en ediciones/eliminaciones
 */
const captureBeforeData = (getDataFunction) => {
    return async (req, res, next) => {
        try {
            if (typeof getDataFunction === 'function') {
                req.auditBefore = await getDataFunction(req);
            }
        } catch (error) {
            console.error('Error capturando datos anteriores para auditoría:', error);
        }
        next();
    };
};

/**
 * Middleware para establecer tabla afectada y ID de registro
 */
const setAuditMetadata = (tabla, getIdFunction) => {
    return (req, res, next) => {
        req.auditTable = tabla;
        if (typeof getIdFunction === 'function') {
            req.auditRecordId = getIdFunction(req);
        } else if (req.params.id) {
            req.auditRecordId = req.params.id;
        }
        next();
    };
};

/**
 * Acciones predefinidas por módulo para consistencia
 */
const AUDIT_ACTIONS = {
    // Autenticación
    AUTH: {
        LOGIN: 'login',
        LOGIN_FAILED: 'login_failed',
        LOGOUT: 'logout',
        REGISTER: 'register'
    },
    // Productos
    PRODUCTOS: {
        CREAR: 'producto_crear',
        EDITAR: 'producto_editar',
        ELIMINAR: 'producto_eliminar',
        ACTIVAR: 'producto_activar',
        DESACTIVAR: 'producto_desactivar'
    },
    // Categorías
    CATEGORIAS: {
        CREAR: 'categoria_crear',
        EDITAR: 'categoria_editar',
        ELIMINAR: 'categoria_eliminar'
    },
    // Pedidos
    PEDIDOS: {
        CREAR: 'pedido_crear',
        CAMBIAR_ESTADO: 'pedido_cambiar_estado',
        CANCELAR: 'pedido_cancelar'
    },
    // Usuarios
    USUARIOS: {
        CREAR: 'usuario_crear',
        EDITAR: 'usuario_editar',
        ELIMINAR: 'usuario_eliminar',
        ACTIVAR: 'usuario_activar',
        DESACTIVAR: 'usuario_desactivar'
    },
    // Configuración
    SETTINGS: {
        ACTUALIZAR: 'settings_actualizar'
    }
};

/**
 * Módulos del sistema
 */
const AUDIT_MODULES = {
    AUTH: 'autenticacion',
    PRODUCTOS: 'productos',
    CATEGORIAS: 'categorias',
    PEDIDOS: 'pedidos',
    USUARIOS: 'usuarios',
    SETTINGS: 'configuracion',
    SISTEMA: 'sistema'
};

/**
 * Obtener etiqueta legible para una acción
 * Convierte nombres técnicos a español legible
 */
const getActionLabel = (accion) => {
    const labels = {
        // Autenticación
        'login': 'Inicio de sesión',
        'login_failed': 'Intento de inicio de sesión fallido',
        'logout': 'Cierre de sesión',
        'register': 'Registro de usuario',

        // Productos
        'producto_crear': 'Creación de producto',
        'producto_editar': 'Edición de producto',
        'producto_eliminar': 'Eliminación de producto',
        'producto_activar': 'Activación de producto',
        'producto_desactivar': 'Desactivación de producto',

        // Categorías
        'categoria_crear': 'Creación de categoría',
        'categoria_editar': 'Edición de categoría',
        'categoria_eliminar': 'Eliminación de categoría',

        // Pedidos
        'pedido_crear': 'Creación de pedido',
        'pedido_cambiar_estado': 'Cambio de estado de pedido',
        'pedido_cancelar': 'Cancelación de pedido',

        // Usuarios
        'usuario_crear': 'Registro de usuario/admin/empleado',
        'usuario_editar': 'Edición de usuario',
        'usuario_eliminar': 'Eliminación de usuario',
        'usuario_activar': 'Activación de usuario',
        'usuario_desactivar': 'Desactivación de usuario',

        // Configuración
        'settings_actualizar': 'Actualización de configuración'
    };

    return labels[accion] || accion;
};

module.exports = {
    auditAction,
    captureBeforeData,
    setAuditMetadata,
    AUDIT_ACTIONS,
    AUDIT_MODULES,
    getActionLabel
};
