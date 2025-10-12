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

            const updated = await UsuarioModel.update(id, userData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

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
}

module.exports = UsuarioController;
