const UsuarioModel = require('../models/usuario.model');

class UsuarioController {
    // Obtener todos los usuarios
    static async getAll(req, res) {
        try {
            const usuarios = await UsuarioModel.getAll();
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

            // Validar que el rol exista
            const roles = await UsuarioModel.getRoles();
            const rolValido = roles.some(r => r.id_rol === userData.id_rol);
            if (!rolValido) {
                return res.status(400).json({
                    success: false,
                    message: 'El rol especificado no existe'
                });
            }

            const userId = await UsuarioModel.create(userData);

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id: userId }
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
            const usuario = await UsuarioModel.getById(id);

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

            // Verificar que el usuario existe
            const usuarioActual = await UsuarioModel.getById(id);
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

            const updated = await UsuarioModel.update(id, userData);

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

            const updated = await UsuarioModel.toggleActive(id);

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

            // No permitir eliminar al propio usuario
            if (parseInt(id) === req.user.userId) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta'
                });
            }

            const usuario = await UsuarioModel.getById(id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const deleted = await UsuarioModel.delete(id);

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
}

module.exports = UsuarioController;
