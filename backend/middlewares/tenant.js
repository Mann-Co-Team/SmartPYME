const TenantModel = require('../models/tenant.model');

/**
 * Middleware para validar y cargar el tenant del usuario autenticado
 * Debe usarse DESPUÉS del middleware de autenticación (auth.js)
 * 
 * Este middleware:
 * 1. Extrae el tenant_id del token JWT
 * 2. Verifica que el tenant existe y está activo
 * 3. Inyecta req.tenant con la información del tenant
 * 4. Devuelve 401 si falta tenant_id o tenant inactivo
 */
const validateTenant = async (req, res, next) => {
    try {
        // El tenant_id debe venir del token JWT decodificado por el middleware auth
        const tenantId = req.user?.tenant_id;

        // Si no hay tenant_id en el token, denegar acceso
        if (!tenantId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado: Falta identificador de empresa (tenant)'
            });
        }

        // Verificar que el tenant existe
        const tenant = await TenantModel.getById(tenantId);
        if (!tenant) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado: Empresa no encontrada'
            });
        }

        // Verificar que el tenant está activo
        if (!tenant.activo) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: La empresa está desactivada'
            });
        }

        // Verificar fecha de vencimiento si existe
        if (tenant.fecha_fin) {
            const now = new Date();
            const fechaFin = new Date(tenant.fecha_fin);
            if (now > fechaFin) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado: El plan de la empresa ha expirado'
                });
            }
        }

        // Inyectar información del tenant en la request
        req.tenant = {
            id: tenant.id_tenant,
            nombre: tenant.nombre_empresa,
            slug: tenant.slug,
            plan: tenant.plan,
            email: tenant.email_empresa,
            max_usuarios: tenant.max_usuarios,
            max_productos: tenant.max_productos,
            configuracion: tenant.configuracion ? JSON.parse(tenant.configuracion) : {}
        };

        next();
    } catch (error) {
        console.error('Error en middleware de tenant:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware opcional para rutas públicas que pueden beneficiarse de tenant context
 * No bloquea la request si falta tenant_id, solo lo carga si está presente
 */
const optionalTenant = async (req, res, next) => {
    try {
        const tenantId = req.user?.tenant_id;

        if (tenantId) {
            const tenant = await TenantModel.getById(tenantId);
            if (tenant && tenant.activo) {
                req.tenant = {
                    id: tenant.id_tenant,
                    nombre: tenant.nombre_empresa,
                    slug: tenant.slug,
                    plan: tenant.plan
                };
            }
        }

        next();
    } catch (error) {
        console.error('Error en middleware opcional de tenant:', error);
        next(); // Continuar aunque haya error
    }
};

/**
 * Middleware para verificar límites del tenant antes de crear recursos
 * Uso: checkTenantLimit('usuarios') o checkTenantLimit('productos')
 */
const checkTenantLimit = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.tenant) {
                return res.status(401).json({
                    success: false,
                    message: 'No autorizado: Falta identificador de empresa'
                });
            }

            const limits = await TenantModel.checkLimits(req.tenant.id);
            
            if (!limits) {
                return res.status(500).json({
                    success: false,
                    message: 'Error verificando límites de la empresa'
                });
            }

            // Verificar límite según el tipo de recurso
            if (resourceType === 'usuarios') {
                // Solo validar límite si se está creando admin/empleado (roles 1 o 2)
                // Los clientes (rol 3) no cuentan para el límite
                const id_rol = req.body.id_rol;
                if (id_rol && (id_rol === 1 || id_rol === 2) && limits.limite_usuarios_alcanzado) {
                    return res.status(403).json({
                        success: false,
                        message: `Límite de administradores/empleados alcanzado (${limits.max_usuarios}). Actualice su plan para agregar más usuarios del staff.`,
                        limit_reached: true,
                        current: limits.usuarios_actuales,
                        max: limits.max_usuarios,
                        info: 'Los clientes no cuentan para este límite'
                    });
                }
            }

            if (resourceType === 'productos' && limits.limite_productos_alcanzado) {
                return res.status(403).json({
                    success: false,
                    message: `Límite de productos alcanzado (${limits.max_productos}). Actualice su plan para agregar más productos.`,
                    limit_reached: true,
                    current: limits.productos_actuales,
                    max: limits.max_productos
                });
            }

            // Pasar información de límites a la request
            req.tenantLimits = limits;
            next();
        } catch (error) {
            console.error('Error verificando límites del tenant:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

module.exports = {
    validateTenant,
    optionalTenant,
    checkTenantLimit
};
