const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const UsuarioModel = require('../models/usuario.model');
const bcrypt = require('bcryptjs');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener perfil del usuario autenticado
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        // No pasar tenantId para que obtenga el usuario sin filtrar por tenant
        const usuario = await UsuarioModel.getById(userId, null);

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
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Actualizar perfil del usuario autenticado
router.put('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { nombre, apellido, email, telefono } = req.body;

        // Validar que el usuario existe (sin filtrar por tenant)
        const usuarioActual = await UsuarioModel.getById(userId, null);
        if (!usuarioActual) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Si se cambia el email, validar que no exista
        if (email && email !== usuarioActual.email) {
            const existingUser = await UsuarioModel.getByEmail(email);
            if (existingUser && existingUser.id_usuario !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con ese email'
                });
            }
        }

        // Actualizar directamente con query SQL para solo los campos del perfil
        const db = require('../config/db');
        await db.execute(
            `UPDATE usuarios 
             SET nombre = ?, apellido = ?, email = ?, telefono = ?
             WHERE id_usuario = ?`,
            [nombre, apellido, email, telefono, userId]
        );

        // Obtener usuario actualizado
        const usuarioActualizado = await UsuarioModel.getById(userId, null);

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: usuarioActualizado
        });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Cambiar contraseña
router.put('/password', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const db = require('../config/db');

        // Validaciones básicas
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual y la nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Validar que la nueva contraseña no sea igual a la actual
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña no puede ser igual a la contraseña actual'
            });
        }

        // Validar complejidad de la contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Validar que contenga mayúsculas, minúsculas y números
        if (!/[a-z]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe contener al menos una letra minúscula'
            });
        }

        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe contener al menos una letra mayúscula'
            });
        }

        if (!/\d/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe contener al menos un número'
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
        const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
        if (!passwordValida) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Verificar que la nueva contraseña no sea igual a la anterior (doble verificación con hash)
        const isSamePassword = await bcrypt.compare(newPassword, usuario.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña no puede ser igual a tu contraseña actual'
            });
        }

        // Verificar contra historial de contraseñas (últimas 5)
        try {
            const [historial] = await db.execute(
                `SELECT password_hash FROM password_history 
                 WHERE id_usuario = ? 
                 ORDER BY created_at DESC 
                 LIMIT 5`,
                [userId]
            );

            // Verificar si la nueva contraseña coincide con alguna del historial
            for (const entry of historial) {
                const isUsedBefore = await bcrypt.compare(newPassword, entry.password_hash);
                if (isUsedBefore) {
                    return res.status(400).json({
                        success: false,
                        message: 'No puedes usar una contraseña que hayas utilizado recientemente. Por favor elige una contraseña diferente.'
                    });
                }
            }
        } catch (historyError) {
            // Si la tabla no existe aún, continuamos sin validar historial
            console.warn('Tabla password_history no existe, saltando validación de historial');
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Guardar contraseña actual en el historial antes de actualizarla
        try {
            await db.execute(
                `INSERT INTO password_history (id_usuario, password_hash) VALUES (?, ?)`,
                [userId, usuario.password]
            );

            // Mantener solo las últimas 5 contraseñas en el historial
            await db.execute(
                `DELETE FROM password_history 
                 WHERE id_usuario = ? 
                 AND id_history NOT IN (
                     SELECT id_history FROM (
                         SELECT id_history FROM password_history 
                         WHERE id_usuario = ? 
                         ORDER BY created_at DESC 
                         LIMIT 5
                     ) AS subquery
                 )`,
                [userId, userId]
            );
        } catch (historyError) {
            // Si falla guardar en historial, continuamos con el cambio de contraseña
            console.warn('No se pudo guardar en historial:', historyError.message);
        }

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
});

module.exports = router;
