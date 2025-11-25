const TenantModel = require('../models/tenant.model');
const UsuarioModel = require('../models/usuario.model');
const ProductoModel = require('../models/producto.model');
const CategoriaModel = require('../models/categoria.model');
const PedidoModel = require('../models/pedido.model');
const bcrypt = require('bcryptjs');

class TenantController {
    // Crear nuevo tenant con usuario administrador
    static async create(req, res) {
        try {
            const {
                // Datos del tenant
                nombre_empresa,
                slug,
                plan,
                max_usuarios,
                max_productos,
                // Datos del usuario admin
                admin_nombre,
                admin_email,
                admin_password
            } = req.body;

            // Validar datos requeridos
            if (!nombre_empresa || !slug || !admin_email || !admin_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos: nombre_empresa, slug, admin_email, admin_password'
                });
            }

            // Verificar que el slug no exista
            const existingTenant = await TenantModel.getBySlug(slug);
            if (existingTenant) {
                return res.status(409).json({
                    success: false,
                    message: `Ya existe un tenant con el slug "${slug}"`
                });
            }

            // Crear el tenant
            const tenantData = {
                nombre_empresa,
                slug: slug.toLowerCase().trim(),
                plan: plan || 'basico',
                max_usuarios: max_usuarios || 10,
                max_productos: max_productos || 100,
                activo: true
            };

            const tenantId = await TenantModel.create(tenantData);

            // Hash de la contraseña del admin
            const hashedPassword = await bcrypt.hash(admin_password, 10);

            // Crear usuario administrador para el tenant
            const adminData = {
                nombre: admin_nombre || 'Administrador',
                email: admin_email,
                password: hashedPassword,
                id_rol: 1, // Rol Admin
                id_tenant: tenantId,
                activo: true
            };

            const adminId = await UsuarioModel.create(adminData, tenantId);

            // Obtener el tenant creado con toda la info
            const tenant = await TenantModel.getById(tenantId);

            res.status(201).json({
                success: true,
                message: 'Tenant y usuario administrador creados exitosamente',
                data: {
                    tenant,
                    admin: {
                        id: adminId,
                        nombre: adminData.nombre,
                        email: adminData.email,
                        rol: 'Admin'
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error en TenantController.create:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear tenant',
                error: error.message
            });
        }
    }

    // Listar tiendas activas (ruta pública)
    static async getAllPublic(req, res) {
        try {
            const tenants = await TenantModel.getAll();
            
            // Filtrar solo tenants activos y retornar información pública
            const publicTenants = tenants
                .filter(t => t.activo)
                .map(t => ({
                    id_tenant: t.id_tenant,
                    nombre_empresa: t.nombre_empresa,
                    slug: t.slug,
                    email_empresa: t.email_empresa,
                    plan: t.plan,
                    logo: t.logo,
                    total_productos: t.total_productos || 0
                }));

            res.json({
                success: true,
                data: publicTenants,
                count: publicTenants.length
            });

        } catch (error) {
            console.error('❌ Error en TenantController.getAllPublic:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las tiendas disponibles'
            });
        }
    }

    // Obtener tenant por slug (ruta pública)
    static async getBySlug(req, res) {
        try {
            const { slug } = req.params;
            const tenant = await TenantModel.getBySlug(slug);

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tienda no encontrada'
                });
            }

            // Solo retornar información pública del tenant
            res.json({
                success: true,
                data: {
                    id_tenant: tenant.id_tenant,
                    nombre_empresa: tenant.nombre_empresa,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    activo: tenant.activo,
                    logo: tenant.logo,
                    email_empresa: tenant.email_empresa,
                    telefono_empresa: tenant.telefono_empresa
                }
            });

        } catch (error) {
            console.error('❌ Error en TenantController.getBySlug:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información de la tienda'
            });
        }
    }

    // Validar tenant por slug (para login admin) - ruta pública
    static async validateSlug(req, res) {
        try {
            const { slug } = req.params;
            const tenant = await TenantModel.getBySlug(slug);

            if (!tenant) {
                return res.json({
                    success: false,
                    message: 'Empresa no encontrada',
                    data: null
                });
            }

            if (!tenant.activo) {
                return res.json({
                    success: false,
                    message: 'Empresa desactivada',
                    data: null
                });
            }

            // Retornar datos para mostrar en el login
            res.json({
                success: true,
                data: {
                    id_tenant: tenant.id_tenant,
                    nombre_empresa: tenant.nombre_empresa,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    logo: tenant.logo
                }
            });

        } catch (error) {
            console.error('❌ Error en TenantController.validateSlug:', error);
            res.status(500).json({
                success: false,
                message: 'Error al validar empresa'
            });
        }
    }

    // Registro público de nueva empresa (sin autenticación)
    static async registerPublic(req, res) {
        try {
            const {
                nombre_empresa,
                email_empresa,
                telefono_empresa,
                direccion_empresa,
                plan,
                admin
            } = req.body;

            // Validar datos requeridos
            if (!nombre_empresa || !email_empresa || !admin || !admin.email || !admin.password || !admin.nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos para el registro'
                });
            }

            // Generar slug único a partir del nombre de la empresa
            let baseSlug = nombre_empresa
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
                .replace(/\s+/g, '-') // Reemplazar espacios por guiones
                .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
                .trim();

            // Verificar si el slug ya existe y agregar número si es necesario
            let slug = baseSlug;
            let counter = 1;
            while (await TenantModel.getBySlug(slug)) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            // Verificar que el email del admin no esté en uso
            const existingUser = await UsuarioModel.getByEmail(admin.email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'El email del administrador ya está registrado'
                });
            }

            // Preparar datos del tenant
            const tenantData = {
                nombre_empresa,
                slug,
                email_empresa,
                telefono_empresa: telefono_empresa || null,
                direccion_empresa: direccion_empresa || null,
                plan: plan || 'basico'
            };

            // Preparar datos del administrador
            const adminData = {
                nombre: admin.nombre,
                apellido: admin.apellido || '',
                email: admin.email,
                password: admin.password // El modelo se encarga del hash
            };

            // Crear tenant con administrador (el modelo se encarga de todo)
            const tenantId = await TenantModel.create(tenantData, adminData);

            // Obtener el tenant creado
            const tenant = await TenantModel.getById(tenantId);

            res.status(201).json({
                success: true,
                message: '¡Empresa registrada exitosamente!',
                data: {
                    id_tenant: tenant.id_tenant,
                    nombre_empresa: tenant.nombre_empresa,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    email_empresa: tenant.email_empresa
                }
            });

        } catch (error) {
            console.error('❌ Error en TenantController.registerPublic:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar la empresa',
                error: error.message
            });
        }
    }

    // Listar todos los tenants
    static async getAll(req, res) {
        try {
            const tenants = await TenantModel.getAll();

            res.json({
                success: true,
                data: tenants,
                count: tenants.length
            });

        } catch (error) {
            console.error('❌ Error en TenantController.getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tenants',
                error: error.message
            });
        }
    }

    // Obtener tenant por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tenant = await TenantModel.getById(id);

            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }

            res.json({
                success: true,
                data: tenant
            });

        } catch (error) {
            console.error('❌ Error en TenantController.getById:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tenant',
                error: error.message
            });
        }
    }

    // Actualizar tenant
    static async update(req, res) {
        try {
            const { id } = req.params;
            const {
                nombre_empresa,
                email_empresa,
                telefono,
                direccion,
                descripcion,
                whatsapp,
                instagram,
                facebook,
                plan,
                max_usuarios,
                max_productos,
                logo
            } = req.body;

            // Verificar que el tenant existe
            const tenant = await TenantModel.getById(id);
            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }

            // Actualizar
            const updateData = {
                nombre_empresa: nombre_empresa || tenant.nombre_empresa,
                email_empresa: email_empresa || tenant.email_empresa,
                telefono_empresa: telefono !== undefined ? telefono : tenant.telefono_empresa,
                direccion_empresa: direccion !== undefined ? direccion : tenant.direccion_empresa,
                descripcion: descripcion !== undefined ? descripcion : tenant.descripcion,
                whatsapp: whatsapp !== undefined ? whatsapp : tenant.whatsapp,
                instagram: instagram !== undefined ? instagram : tenant.instagram,
                facebook: facebook !== undefined ? facebook : tenant.facebook,
                plan: plan || tenant.plan,
                max_usuarios: max_usuarios !== undefined ? max_usuarios : tenant.max_usuarios,
                max_productos: max_productos !== undefined ? max_productos : tenant.max_productos,
                logo: logo !== undefined ? logo : tenant.logo
            };

            await TenantModel.update(id, updateData);

            // Obtener datos actualizados
            const updatedTenant = await TenantModel.getById(id);

            res.json({
                success: true,
                message: 'Tenant actualizado exitosamente',
                data: updatedTenant
            });

        } catch (error) {
            console.error('❌ Error en TenantController.update:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar tenant',
                error: error.message
            });
        }
    }

    // Activar/Desactivar tenant
    static async toggleActive(req, res) {
        try {
            const { id } = req.params;

            const tenant = await TenantModel.getById(id);
            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }

            await TenantModel.toggleActive(id);

            const updatedTenant = await TenantModel.getById(id);

            res.json({
                success: true,
                message: `Tenant ${updatedTenant.activo ? 'activado' : 'desactivado'} exitosamente`,
                data: updatedTenant
            });

        } catch (error) {
            console.error('❌ Error en TenantController.toggleActive:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar estado del tenant',
                error: error.message
            });
        }
    }

    // Obtener estadísticas del tenant
    static async getStats(req, res) {
        try {
            const { id } = req.params;

            // Verificar que el tenant existe
            const tenant = await TenantModel.getById(id);
            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }

            // Obtener contadores
            const usuarios = await UsuarioModel.getAll(id);
            const productos = await ProductoModel.getAll(id);
            const categorias = await CategoriaModel.getAll(id);
            const pedidos = await PedidoModel.getAll(id);

            // Calcular uso de límites
            const stats = {
                tenant: {
                    id: tenant.id_tenant,
                    nombre: tenant.nombre_empresa,
                    slug: tenant.slug,
                    plan: tenant.plan,
                    activo: tenant.activo
                },
                usuarios: {
                    total: usuarios.length,
                    limite: tenant.max_usuarios,
                    porcentaje: ((usuarios.length / tenant.max_usuarios) * 100).toFixed(1),
                    disponible: tenant.max_usuarios - usuarios.length
                },
                productos: {
                    total: productos.length,
                    limite: tenant.max_productos,
                    porcentaje: ((productos.length / tenant.max_productos) * 100).toFixed(1),
                    disponible: tenant.max_productos - productos.length,
                    activos: productos.filter(p => p.activo).length
                },
                categorias: {
                    total: categorias.length,
                    activas: categorias.filter(c => c.activo).length
                },
                pedidos: {
                    total: pedidos.length,
                    pendientes: pedidos.filter(p => p.id_estado === 1).length,
                    procesando: pedidos.filter(p => p.id_estado === 2).length,
                    completados: pedidos.filter(p => p.id_estado === 3).length,
                    cancelados: pedidos.filter(p => p.id_estado === 4).length
                }
            };

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('❌ Error en TenantController.getStats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas del tenant',
                error: error.message
            });
        }
    }

    // Eliminar tenant (soft delete)
    static async delete(req, res) {
        try {
            const { id } = req.params;

            const tenant = await TenantModel.getById(id);
            if (!tenant) {
                return res.status(404).json({
                    success: false,
                    message: 'Tenant no encontrado'
                });
            }

            // No permitir eliminar si hay datos relacionados
            const usuarios = await UsuarioModel.getAll(id);
            const productos = await ProductoModel.getAll(id);
            const pedidos = await PedidoModel.getAll(id);

            if (usuarios.length > 0 || productos.length > 0 || pedidos.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el tenant porque tiene datos asociados',
                    data: {
                        usuarios: usuarios.length,
                        productos: productos.length,
                        pedidos: pedidos.length
                    }
                });
            }

            await TenantModel.delete(id);

            res.json({
                success: true,
                message: 'Tenant eliminado exitosamente'
            });

        } catch (error) {
            console.error('❌ Error en TenantController.delete:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar tenant',
                error: error.message
            });
        }
    }
}

module.exports = TenantController;
