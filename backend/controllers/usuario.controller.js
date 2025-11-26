const UsuarioModel = require('../models/usuario.model');
const bcrypt = require('bcryptjs');

class UsuarioController {
    // Obtener todos los usuarios
    static async getAll(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const usuarios = await UsuarioModel.getAll(tenantId);
            res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener roles disponibles
    static async getRoles(req, res) {
        try {
            const roles = await UsuarioModel.getRoles();
            res.json({
                success: true,
                data: roles
            });
        } catch (error) {
            console.error('Error obteniendo roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear usuario
    static async create(req, res) {
        try {
            const userData = req.body;

            // Validar que el email no exista
            const existingUser = await UsuarioModel.getByEmail(userData.email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con ese email'
                });
            }

            // Convertir rol string a id_rol si es necesario
            if (userData.rol && !userData.id_rol) {
                const rolMap = { 'admin': 1, 'empleado': 2, 'cliente': 3 };
                userData.id_rol = rolMap[userData.rol.toLowerCase()] || 3;
            }

            // Validar que el rol exista
            const roles = await UsuarioModel.getRoles();
            const rolValido = roles.some(r => r.id_rol === userData.id_rol);
            if (!rolValido) {
                return res.status(400).json({
                    success: false,
                    message: 'El rol especificado no existe'
                });
            }

            const tenantId = req.tenant?.id || req.user?.tenant_id || 1;

            // Validar límite de usuarios según el plan (solo para admin y empleados)
            if (userData.id_rol === 1 || userData.id_rol === 2) {
                const currentUserCount = await UsuarioModel.countActiveUsersByTenant(tenantId);
                const userLimit = await UsuarioModel.getTenantUserLimit(tenantId);

                // Si hay límite (no es null = ilimitado) y se ha alcanzado
                if (userLimit !== null && currentUserCount >= userLimit) {
                    const planNames = {
                        2: 'Básico (máx. 2 usuarios)',
                        5: 'Profesional (máx. 5 usuarios)'
                    };

                    return res.status(400).json({
                        success: false,
                        message: `Has alcanzado el límite de usuarios para tu plan ${planNames[userLimit] || ''}. Actualiza tu plan para agregar más usuarios.`
                    });
                }
            }

            const userId = await UsuarioModel.create(userData, tenantId);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id_usuario: userId }
            });
        } catch (error) {
            console.error('Error creando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener usuario por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const usuario = await UsuarioModel.getById(id, tenantId);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar usuario
    static async update(req, res) {
        try {
            const { id } = req.params;
            const userData = req.body;

            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            // Verificar que el usuario existe
            const usuarioActual = await UsuarioModel.getById(id, tenantId);
            if (!usuarioActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Si se cambia el email, validar que no exista
            if (userData.email && userData.email !== usuarioActual.email) {
                const existingUser = await UsuarioModel.getByEmail(userData.email);
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un usuario con ese email'
                    });
                }
            }

            // Convertir rol string a id_rol si es necesario
            if (userData.rol && !userData.id_rol) {
                const rolMap = { 'admin': 1, 'empleado': 2, 'cliente': 3 };
                userData.id_rol = rolMap[userData.rol.toLowerCase()] || 3;
            }

            // Si se cambia el rol, validar que exista
            if (userData.id_rol) {
                const roles = await UsuarioModel.getRoles();
                const rolValido = roles.some(r => r.id_rol === userData.id_rol);
                if (!rolValido) {
                    return res.status(400).json({
                        success: false,
                        message: 'El rol especificado no existe'
                    });
                }
            }

            const updated = await UsuarioModel.update(id, userData, tenantId);

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Cambiar estado activo/inactivo
    static async toggleActive(req, res) {
        try {
            const { id } = req.params;

            // No permitir desactivar al propio usuario
            if (parseInt(id) === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes desactivar tu propia cuenta'
                });
            }

            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const updated = await UsuarioModel.toggleActive(id, tenantId);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Estado del usuario actualizado'
            });
        } catch (error) {
            console.error('Error cambiando estado del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar usuario
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;

            // No permitir eliminar al propio usuario
            if (parseInt(id) === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta'
                });
            }

            const usuario = await UsuarioModel.getById(id, tenantId);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const deleted = await UsuarioModel.delete(id, tenantId);

            res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Cambiar contraseña del usuario autenticado
    static async cambiarPassword(req, res) {
        try {
            const userId = req.user.userId;
            const { passwordActual, passwordNueva, confirmarPassword } = req.body;

            // Validaciones
            if (!passwordActual || !passwordNueva || !confirmarPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            if (passwordNueva.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            if (passwordNueva !== confirmarPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Las contraseñas no coinciden'
                });
            }

            // Obtener usuario con contraseña
            const usuario = await UsuarioModel.getByIdWithPassword(userId);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const passwordValida = await bcrypt.compare(passwordActual, usuario.password);
            if (!passwordValida) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es incorrecta'
                });
            }

            // Hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(passwordNueva, 10);

            // Actualizar contraseña
            await UsuarioModel.updatePassword(userId, hashedPassword);

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas de usuarios
    static async getStats(req, res) {
        try {
            const tenantId = req.tenant?.id || req.user?.tenant_id || null;
            const usuarios = await UsuarioModel.getAll(tenantId);

            // Contar por rol
            const porRol = usuarios.reduce((acc, user) => {
                const rol = user.rol || 'Sin rol';
                acc[rol] = (acc[rol] || 0) + 1;
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    total: usuarios.length,
                    porRol,
                    activos: usuarios.filter(u => u.activo).length,
                    inactivos: usuarios.filter(u => !u.activo).length
                }
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = UsuarioController;
